// deno-lint-ignore-file no-non-null-assertion

import search, { idPrefix } from '~/src/search.ts';

import _user from '~/src/user.ts';
import packs from '~/src/packs.ts';
import utils from '~/src/utils.ts';
import config from '~/src/config.ts';
import i18n from '~/src/i18n.ts';

import { skills } from '~/src/skills.ts';

import * as discord from '~/src/discord.ts';

import db from '~/db/mod.ts';

import { experienceToNextLevel } from '~/db/gainExp.ts';

import { NonFetalError } from '~/src/errors.ts';

import type * as Schema from '~/db/schema.ts';

import type { SkillKey } from '~/src/types.ts';

function view({ token, character, characterSchema, userId, guildId }: {
  token: string;
  character: string;
  characterSchema?: Schema.Character;
  guildId: string;
  userId: string;
}): discord.Message {
  const locale = _user.cachedUsers[userId]?.locale ??
    _user.cachedGuilds[guildId]?.locale;

  if (!config.combat) {
    throw new NonFetalError(
      i18n.get('maintenance-combat', locale),
    );
  }

  packs.characters(
    character.startsWith(idPrefix)
      ? { ids: [character.substring(idPrefix.length)], guildId }
      : { search: character, guildId },
  )
    .then(async (results) => {
      if (!results.length) {
        throw new Error('404');
      }

      if (packs.isDisabled(`${results[0].packId}:${results[0].id}`, guildId)) {
        throw new Error('404');
      }

      const guild = await db.getGuild(guildId);
      const instance = await db.getInstance(guild);

      return Promise.all([
        results[0],
        characterSchema
          ? { character: characterSchema, user: undefined }
          : db.initStats(instance, `${results[0].packId}:${results[0].id}`),
      ]);
    })
    .then(async ([character, existing]) => {
      if (!existing?.character) {
        const message = new discord.Message();

        const embed = search.characterEmbed(character, {
          mode: 'thumbnail',
          media: { title: false },
          description: false,
          footer: false,
        });

        embed.setFooter({
          text: i18n.get('not-fit-for-combat', locale),
        });

        message.addEmbed(embed);

        return await message.patch(token);
      }

      const message = new discord.Message();

      const skillPoints = existing.character.combat!.skillPoints ?? 0;

      // const unclaimed = existing.character.combat!.unclaimedStatsPoints!;

      const stats = existing.character.combat!.curStats!;

      const exp = existing.character.combat!.exp ?? 0;
      const level = existing.character.combat!.level ?? 1;
      const expToLevel = experienceToNextLevel(level);

      const _skills = Object.entries(existing.character.combat?.skills ?? {});

      const embed = search.characterEmbed(character, {
        footer: false,
        existing: {
          image: existing.character.image,
          nickname: existing.character.nickname,
          rating: existing.character.rating,
        },
        userId: existing.user?.id,
        suffix: `${i18n.get('level', locale)} ${level}\n${exp}/${expToLevel}`,
        media: { title: false },
        description: false,
        mode: 'thumbnail',
      });

      if (_skills.length) {
        embed
          .addField({
            name: i18n.get('skills', locale),
            value: _skills.map(([key, s]) => {
              const skill = skills[key as SkillKey];

              const maxed = skill.max <= s.level;

              return `${i18n.get(skill.key, locale)} (${
                i18n.get('lvl', locale)
              } ${maxed ? i18n.get('max', locale) : s.level})`;
            }).join('\n'),
          });
      }

      embed
        .addField({
          name: i18n.get('stats', locale),
          value: [
            `${
              i18n.get(
                skillPoints === 1 ? 'skill-point' : 'skill-points',
                locale,
              )
            }: ${skillPoints}`,
            // `${i18n.get('stat-points', locale)}: ${unclaimed}`,
            `${i18n.get('attack', locale)}: ${stats.attack}`,
            `${i18n.get('defense', locale)}: ${stats.defense}`,
            `${i18n.get('speed', locale)}: ${stats.speed}`,
            `${i18n.get('hp', locale)}: ${stats.hp}`,
          ].join('\n'),
        });

      message.addComponents([
        new discord.Component()
          .setLabel('/character')
          .setId(`character`, existing.character.id),
        new discord.Component()
          .setLabel('/like')
          .setId(`like`, existing.character.id),
        existing.user?.id === userId
          ? new discord.Component()
            .setLabel('/p assign')
            .setId(`passign`, userId, existing.character.id)
          : undefined,
      ].filter(utils.nonNullable));

      message.addEmbed(embed);

      await message.patch(token);
    })
    .catch(async (err) => {
      if (err.message === '404') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('some-characters-disabled', locale),
            ),
          ).patch(token);
      }

      if (err instanceof NonFetalError) {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(err.message),
          ).patch(token);
      }

      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  const loading = new discord.Message()
    .addEmbed(
      new discord.Embed().setImage(
        { url: `${config.origin}/assets/spinner3.gif` },
      ),
    );

  return loading;
}

const stats = { view };

export default stats;
