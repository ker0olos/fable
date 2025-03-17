import config from '~/src/config.ts';

import i18n from '~/src/i18n.ts';
import utils from '~/src/utils.ts';

import user from '~/src/user.ts';
import packs from '~/src/packs.ts';

import Rating from '~/src/rating.ts';

import db from '~/db/index.ts';

import { default as srch } from '~/src/search.ts';

import * as discord from '~/src/discord.ts';

import type { Prisma } from '@prisma/client';

type Character = Prisma.CharacterGetPayload<{
  include: {
    character: true;
    media: true;
  };
}>;

async function embed({
  guildId,
  party,
  locale,
}: {
  guildId: string;
  party: (Character | null)[];
  locale: discord.AvailableLocales;
}): Promise<discord.Message> {
  const message = new discord.Message();

  const embeds = await Promise.all(
    party.map(async (member, i) => {
      const { character, media } = member ?? {};

      if (!character) {
        return new discord.Embed().setDescription(
          i18n.get('unassigned', locale)
        );
      }

      if (!media || packs.isDisabled(media.id, guildId)) {
        return new discord.Embed().setDescription(
          i18n.get('character-disabled', locale)
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const embed = await srch.characterEmbed(message, character as any, {
        mode: 'thumbnail',
        media: { title: media.title },
        rating: new Rating({ stars: party[i]?.rating }),
        description: false,
        footer: false,
        overwrite: {
          image: party[i]?.image,
          nickname: party[i]?.nickname,
        },
      });

      return embed;
    })
  );

  embeds.forEach((embed) => message.addEmbed(embed));

  return message;
}

function view({
  token,
  userId,
  guildId,
}: {
  token: string;
  userId: string;
  guildId: string;
}): discord.Message {
  const locale =
    user.cachedUsers[userId]?.locale ?? user.cachedGuilds[guildId]?.locale;

  Promise.resolve()
    .then(async () => {
      const {
        partyMember1,
        partyMember2,
        partyMember3,
        partyMember4,
        partyMember5,
      } = await db.getInventory(guildId, userId);

      const message = await embed({
        guildId,
        party: [
          partyMember1,
          partyMember2,
          partyMember3,
          partyMember4,
          partyMember5,
        ],
        locale,
      });

      return message.patch(token);
    })
    .catch(async (err) => {
      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  return discord.Message.spinner(true);
}

function assign({
  token,
  spot,
  userId,
  guildId,
  search,
  id,
}: {
  token: string;
  userId: string;
  guildId: string;
  spot?: 1 | 2 | 3 | 4 | 5;
  search?: string;
  id?: string;
}): discord.Message {
  const locale =
    user.cachedUsers[userId]?.locale ?? user.cachedGuilds[guildId]?.locale;

  packs
    .characters(id ? { ids: [id], guildId } : { search, guildId })
    .then(async (results) => {
      const character = results[0];

      const media = character.media?.[0]?.media;

      if (
        !results.length ||
        (media && packs.isDisabled(`${media.packId}:${media.id}`, guildId))
      ) {
        throw new Error('404');
      }

      const message = new discord.Message();

      const characterId = character.id;

      try {
        const response = await db.assignCharacter(
          userId,
          guildId,
          characterId,
          spot
        );

        const embed = await srch.characterEmbed(message, results[0], {
          mode: 'thumbnail',
          rating: new Rating({ stars: response.rating }),
          description: true,
          footer: false,
          overwrite: {
            image: response.image,
            nickname: response.nickname,
          },
        });

        return message
          .addEmbed(
            new discord.Embed().setDescription(i18n.get('assigned', locale))
          )
          .addEmbed(embed)
          .addComponents([
            new discord.Component()
              .setLabel('/character')
              .setId(`character`, characterId),
            new discord.Component()
              .setLabel('/stats')
              .setId(`stats`, characterId),
          ])
          .patch(token);
      } catch {
        return message
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('character-hasnt-been-found', locale, results[0].name)
            )
          )
          .addComponents([
            new discord.Component()
              .setLabel('/character')
              .setId(`character`, characterId),
          ])
          .patch(token);
      }
    })
    .catch(async (err) => {
      if (err.message === '404') {
        await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('found-nothing', locale)
            )
          )
          .patch(token);
      }

      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  return discord.Message.spinner(true);
}

function swap({
  token,
  a,
  b,
  userId,
  guildId,
}: {
  token: string;
  a: 1 | 2 | 3 | 4 | 5;
  b: 1 | 2 | 3 | 4 | 5;
  userId: string;
  guildId: string;
}): discord.Message {
  const locale =
    user.cachedUsers[userId]?.locale ?? user.cachedGuilds[guildId]?.locale;

  Promise.resolve()
    .then(async () => {
      const inventory = await db.getInventory(guildId, userId);

      await db.swapSpots(inventory, a, b);

      const t = inventory[`partyMember${a}`];

      inventory[`partyMember${a}`] = inventory[`partyMember${b}`];
      inventory[`partyMember${b}`] = t;

      return (
        await embed({
          guildId,
          party: [
            inventory.partyMember1,
            inventory.partyMember2,
            inventory.partyMember3,
            inventory.partyMember4,
            inventory.partyMember5,
          ],
          locale,
        })
      ).patch(token);
    })
    .catch(async (err) => {
      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  return discord.Message.spinner(true);
}

function remove({
  token,
  spot,
  userId,
  guildId,
}: {
  token: string;
  spot: 1 | 2 | 3 | 4 | 5;
  userId: string;
  guildId: string;
}): discord.Message {
  const locale =
    user.cachedUsers[userId]?.locale ?? user.cachedGuilds[guildId]?.locale;

  Promise.resolve()
    .then(async () => {
      const inventory = await db.getInventory(guildId, userId);

      const message = new discord.Message();

      const character = inventory[`partyMember${spot}`];

      if (!character) {
        return message
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('no-assigned-in-spot', locale)
            )
          )
          .patch(token);
      }

      await db.unassignCharacter(userId, guildId, spot);

      const characters = await packs.characters({
        ids: [character.characterId],
        guildId,
      });

      if (!characters.length || packs.isDisabled(character.mediaId, guildId)) {
        return message
          .addEmbed(new discord.Embed().setDescription(`Removed #${spot}`))
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('character-disabled', locale)
            )
          )
          .patch(token);
      }

      const embed = await srch.characterEmbed(message, characters[0], {
        mode: 'thumbnail',
        rating: new Rating({ stars: character.rating }),
        description: true,
        footer: false,
        overwrite: {
          image: character.image,
          nickname: character.nickname,
        },
      });

      return message
        .addEmbed(new discord.Embed().setDescription('Removed'))
        .addEmbed(embed)
        .addComponents([
          new discord.Component()
            .setLabel('/character')
            .setId(`character`, character.characterId),
        ])
        .patch(token);
    })
    .catch(async (err) => {
      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  return discord.Message.spinner(true);
}

function clear({
  token,
  userId,
  guildId,
}: {
  token: string;
  userId: string;
  guildId: string;
}): discord.Message {
  const locale =
    user.cachedUsers[userId]?.locale ?? user.cachedGuilds[guildId]?.locale;

  Promise.resolve()
    .then(async () => {
      await db.clearParty(userId, guildId);

      return (
        await embed({
          guildId,
          party: [null, null, null, null, null],
          locale,
        })
      ).patch(token);
    })
    .catch(async (err) => {
      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  return discord.Message.spinner(true);
}

const party = {
  view,
  assign,
  swap,
  remove,
  clear,
};

export default party;
