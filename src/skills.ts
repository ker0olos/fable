import _user from '~/src/user.ts';

import i18n from '~/src/i18n.ts';
import config from '~/src/config.ts';
import utils from '~/src/utils.ts';

import packs from '~/src/packs.ts';

import search, { idPrefix } from '~/src/search.ts';

import db from '~/db/mod.ts';

import * as discord from '~/src/discord.ts';

import { NonFetalError } from '~/src/errors.ts';

import type { CharacterSkill, SkillOutput } from '~/src/types.ts';

type SkillKey = keyof typeof skills;

const skills = {
  crit: {
    cost: 2,
    key: 'crit',
    descKey: 'crit-desc',
    activation: function (char, _target, lvl): SkillOutput {
      const [critChance, critDamageMultiplier] = this.stats;

      const isCrit = Math.random() * 100 <= critChance.scale[lvl - 1];

      return {
        damage: isCrit
          ? char.attack * (critDamageMultiplier.scale[lvl - 1] / 100)
          : undefined,
      };
    },
    stats: [{
      key: 'crit-chance',
      scale: [0.5, 5, 15],
      suffix: '%',
    }, {
      key: 'crit-damage',
      scale: [30, 45, 60],
      suffix: '%',
    }],
  },
} satisfies Record<string, CharacterSkill>;

const format = (
  skill: CharacterSkill,
  locale?: discord.AvailableLocales,
  options?: {
    maxed?: boolean;
    lvl?: number;
  },
): string => {
  const stats = skill.stats.map((s, index) =>
    `${index + 1}. _${i18n.get(s.key, locale)} (${
      s.scale
        .slice(
          Math.max(options?.lvl ? options?.lvl - 2 : 0, 0),
          options?.lvl ? options?.lvl : undefined,
        )
        .map((t) => `${s.prefix ?? ''}${t}${s.suffix ?? ''}`)
        .join(options?.lvl ? ` ${discord.emotes.rightArrow} ` : ', ')
    })_`
  );

  const cost = options?.maxed
    ? ` **(${i18n.get('lvl', locale)} ${i18n.get('max', locale)})**`
    : typeof options?.lvl === 'number'
    ? options?.lvl > 1
      ? ` **(${i18n.get('lvl', locale)} ${
        options.lvl - 1
      } ${discord.emotes.rightArrow} ${
        i18n.get('lvl', locale)
      } ${options.lvl})**`
      : ` **(${i18n.get('lvl', locale)} ${options.lvl})**`
    : ` (${skill.cost} ${
      i18n.get(
        skill.cost === 1 ? 'skill-point' : 'skill-points',
        locale,
      )
    })`;

  return [
    `**${i18n.get(skill.key, locale)}**${cost}`,
    `${i18n.get(skill.descKey, locale)}`,
    `${stats.join('\n')}`,
  ].join('\n');
};

function preAcquire(
  { token, skillKey, guildId, character, userId }: {
    token: string;
    skillKey: SkillKey;
    guildId: string;
    character: string;
    userId: string;
  },
): discord.Message {
  if (!skills[skillKey]) {
    throw new Error('404');
  }

  packs.characters(
    character.startsWith(idPrefix)
      ? { ids: [character.substring(idPrefix.length)], guildId }
      : { search: character, guildId },
  )
    .then(async (results) => {
      if (
        !results.length ||
        packs.isDisabled(`${results[0].packId}:${results[0].id}`, guildId)
      ) {
        throw new Error('404');
      }

      const guild = await db.getGuild(guildId);
      const instance = await db.getInstance(guild);

      return Promise.all([
        results[0],
        db.findCharacters(instance, [`${results[0].packId}:${results[0].id}`]),
      ]);
    })
    .then(async ([character, [existing]]) => {
      const locale = _user.cachedUsers[userId]?.locale ??
        _user.cachedGuilds[guildId]?.locale;

      if (!existing?.[0]) {
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

      if (existing[1]?.id !== userId) {
        const message = new discord.Message();

        const embed = search.characterEmbed(character, {
          mode: 'thumbnail',
          media: { title: false },
          description: false,
          footer: false,
          userId: existing[1]?.id,
          existing: { rating: existing[0].rating },
        });

        message.addEmbed(
          new discord.Embed()
            .setDescription(i18n.get(
              'character-not-owned-by-you',
              locale,
              packs.aliasToArray(character.name)[0],
            )),
        );

        message.addEmbed(embed);

        return await message.patch(token);
      }

      const message = new discord.Message();

      const charId = `${character.packId}:${character.id}`;

      const embed = search.characterEmbed(character, {
        mode: 'thumbnail',
        media: { title: false },
        description: false,
        userId: undefined,
        footer: false,
        existing: existing[0],
      });

      message.addEmbed(embed);

      const skill = skills[skillKey];

      const existingSkill = existing[0].combat?.skills?.[skill.key];

      const maxed = skill.stats[0].scale.length <= (existingSkill?.level ?? 1);

      const formatted = format(skill, locale, {
        maxed,
        lvl: existingSkill?.level ? existingSkill.level + 1 : 1,
      });

      message.addEmbed(
        new discord.Embed()
          .setDescription(formatted),
      );

      if (maxed) {
        message.addEmbed(
          new discord.Embed()
            .setTitle(i18n.get('skill-is-maxed', locale)),
        );

        return await message.patch(token);
      }

      message.addEmbed(
        new discord.Embed()
          .setTitle(
            i18n.get(
              existingSkill?.level ? 'upgrade-skill' : 'acquire-skill',
              locale,
            ),
          )
          .setDescription(i18n.get(
            'costs-n-points',
            locale,
            skill.cost,
            i18n.get(
              skill.cost === 1 ? 'skill-point' : 'skill-points',
              locale,
            ),
          )),
      );

      discord.Message.dialog({
        message,
        confirm: ['cacquire', userId, charId, skillKey],
        userId,
      });

      return await message.patch(token);
    })
    .catch(async (err) => {
      const locale = _user.cachedUsers[userId]?.locale ??
        _user.cachedGuilds[guildId]?.locale;

      if (
        err.response?.status === 404 || err?.message === '404' ||
        err.message?.toLowerCase?.() === 'not found'
      ) {
        return await new discord.Message()
          .addEmbed(new discord.Embed().setDescription(
            i18n.get('found-nothing', locale),
          )).patch(token);
      }

      if (err instanceof NonFetalError) {
        return await new discord.Message()
          .addEmbed(new discord.Embed().setDescription(err.message))
          .patch(token);
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

async function acquire(
  { skillKey, guildId, characterId, userId }: {
    skillKey: SkillKey;
    guildId: string;
    characterId: string;
    userId: string;
  },
): Promise<discord.Message> {
  const locale = _user.cachedUsers[userId]?.locale ??
    _user.cachedGuilds[guildId]?.locale;

  if (!skills[skillKey]) {
    throw new Error('404');
  }

  try {
    const guild = await db.getGuild(guildId);
    const instance = await db.getInstance(guild);

    const __user = await db.getUser(userId);

    const { inventory } = await db.getInventory(instance, __user);

    const skill = skills[skillKey];

    const existingSkill = await db.acquireSkill(
      inventory,
      characterId,
      skill,
    );

    const formatted = format(skill, locale, {
      lvl: existingSkill.level,
    });

    return new discord.Message()
      .addEmbed(
        new discord.Embed()
          .setTitle(
            i18n.get(
              existingSkill.level > 1 ? 'skill-upgraded' : 'skill-acquired',
              locale,
            ),
          ),
      )
      .addEmbed(
        new discord.Embed()
          .setDescription(formatted),
      );
  } catch (err) {
    switch (err.message) {
      case 'SKILL_MAXED':
        throw new NonFetalError(
          i18n.get('skill-is-maxed', locale),
        );
      case 'NOT_ENOUGH_SKILL_POINTS':
        throw new NonFetalError(
          i18n.get('character-not-enough-skill-points', locale),
        );
      case 'CHARACTER_NOT_FOUND':
        throw new NonFetalError(
          i18n.get('character-hasnt-been-found', locale, 'Character'),
        );
      case 'CHARACTER_NOT_OWNED':
        throw new NonFetalError(
          i18n.get('invalid-permission', locale),
        );
      default:
        throw err;
    }
  }
}

function all(
  index: number,
  locale?: discord.AvailableLocales,
): discord.Message {
  const message = new discord.Message();

  const pages = utils.chunks(Object.values(skills), 3);

  const page = pages[index];

  const content = page
    .map((skill) => format(skill, locale))
    .join('\n\n');

  message.addEmbed(new discord.Embed().setDescription(content));

  return discord.Message.page({
    index,
    message,
    total: pages.length,
    type: 'skills',
    locale,
  });
}

export { skills };

export default {
  preAcquire,
  acquire,
  all,
};
