import search, { idPrefix } from './search.ts';

import _user from './user.ts';
import packs from './packs.ts';
import utils from './utils.ts';
import i18n from './i18n.ts';

import * as discord from './discord.ts';

import config from './config.ts';

import db from '../db/mod.ts';

import { experienceToNextLevel } from '../db/gainExp.ts';

import type { Character } from './types.ts';

import { NonFetalError } from './errors.ts';

export const newUnclaimed = (rating: number): number => {
  return 3 * rating;
};

async function update(
  { token, type, distribution, characterId, userId, guildId }: {
    token: string;
    type: 'str' | 'sta' | 'agi' | 'reset';
    distribution?: string;
    characterId: string;
    guildId: string;
    userId: string;
  },
): Promise<discord.Message> {
  const locale = _user.cachedUsers[userId]?.locale;

  const guild = await db.getGuild(guildId);
  const instance = await db.getInstance(guild);

  const user = await db.getUser(userId);

  const { inventory } = await db.getInventory(instance, user);

  const [[existing]] = await db.findCharacters(instance, [characterId]);

  if (!existing) {
    throw new Error('404');
  }

  let unclaimed = existing.combat?.stats?.unclaimed ??
    newUnclaimed(existing.rating);

  let strength = existing.combat?.stats?.strength ?? 0;
  let stamina = existing.combat?.stats?.stamina ?? 0;
  let agility = existing.combat?.stats?.agility ?? 0;

  if (type !== 'reset' && unclaimed <= 0) {
    throw new NonFetalError(i18n.get('not-enough-unclaimed', locale));
  }

  switch (type) {
    case 'reset':
      unclaimed = strength + stamina + agility + unclaimed;
      strength = stamina = agility = 0;
      break;
    case 'str':
      unclaimed = unclaimed - 1;
      strength = strength + 1;
      break;
    case 'sta':
      unclaimed = unclaimed - 1;
      stamina = stamina + 1;
      break;
    case 'agi':
      unclaimed = unclaimed - 1;
      agility = agility + 1;
      break;
    default:
      break;
  }

  if (distribution && /\d+-\d+-\d+/.test(distribution)) {
    const [str, sta, agi] = distribution.split('-')
      .map((n) => parseInt(n));

    unclaimed = unclaimed - (str + sta + agi);

    strength = str;
    stamina = sta;
    agility = agi;

    if (unclaimed < 0) {
      throw new NonFetalError(i18n.get('not-enough-unclaimed', locale));
    }
  } else if (distribution) {
    throw new NonFetalError(
      i18n.get('incorrect-distribution', locale),
    );
  }

  try {
    const _ = await db.assignStats(
      inventory,
      characterId,
      unclaimed,
      strength,
      stamina,
      agility,
    );

    return stats.view({
      token,
      character: `id=${characterId}`,
      userId,
      guildId,
    });
  } catch (err) {
    switch (err.message) {
      case 'CHARACTER_NOT_FOUND':
        throw new NonFetalError(
          i18n.get('character-hasnt-been-found', locale),
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

function view({ token, character, userId, guildId, distribution }: {
  token: string;
  character: string;
  guildId: string;
  userId: string;
  distribution?: string;
}): discord.Message {
  const locale = _user.cachedUsers[userId]?.locale;

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
        packs.aggregate<Character>({
          guildId,
          character: results[0],
          end: 1,
        }),
        db.findCharacters(instance, [`${results[0].packId}:${results[0].id}`]),
      ]);
    })
    .then(async ([character, existing]) => {
      const charId = `${character.packId}:${character.id}`;

      if (!existing[0] || !existing[0][0] || !existing[0][1]) {
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

      if (distribution) {
        return await update({
          token,
          type: 'reset',
          guildId,
          characterId: charId,
          distribution,
          userId,
        });
      }

      const message = new discord.Message();

      const skillPoints = existing[0][0].combat?.skillPoints ??
        0;

      const unclaimed = existing[0][0].combat?.stats?.unclaimed ??
        newUnclaimed(existing[0][0].rating);

      const strength = existing[0][0].combat?.stats?.strength ?? 0;
      const stamina = existing[0][0].combat?.stats?.stamina ?? 0;
      const agility = existing[0][0].combat?.stats?.agility ?? 0;

      const exp = existing[0][0].combat?.exp ?? 0;
      const level = existing[0][0].combat?.level ?? 1;
      const expToLevel = experienceToNextLevel(level);

      const embed = search.characterEmbed(character, {
        footer: false,
        existing: {
          image: existing[0][0].image,
          nickname: existing[0][0].nickname,
          rating: existing[0][0].rating,
        },
        suffix: `${i18n.get('level', locale)} ${level}\n${exp}/${expToLevel}`,
        media: { title: false },
        description: false,
        mode: 'thumbnail',
      });

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
            `${i18n.get('stat-points', locale)}: ${unclaimed}`,
            `${i18n.get('strength', locale)}: ${strength}`,
            `${i18n.get('stamina', locale)}: ${stamina}`,
            `${i18n.get('agility', locale)}: ${agility}`,
          ].join('\n'),
        });

      if (existing[0]?.[1]?.id === userId) {
        message.addComponents([
          new discord.Component()
            .setLabel(`+1 ${i18n.get('str', locale)}`)
            .setDisabled(unclaimed <= 0)
            .setId('stats', 'str', userId, charId),

          new discord.Component()
            .setLabel(`+1 ${i18n.get('sta', locale)}`)
            .setDisabled(unclaimed <= 0)
            .setId('stats', 'sta', userId, charId),

          new discord.Component()
            .setLabel(`+1 ${i18n.get('agi', locale)}`)
            .setDisabled(unclaimed <= 0)
            .setId('stats', 'agi', userId, charId),

          new discord.Component()
            .setLabel(i18n.get('reset', locale))
            .setId('stats', 'reset', userId, charId),
        ]);
      }

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

const stats = {
  view,
  update,
};

export default stats;
