import config from './config.ts';

import i18n from './i18n.ts';
import utils from './utils.ts';

import user from './user.ts';
import packs from './packs.ts';

import Rating from './rating.ts';

import db from '../db/mod.ts';

import { default as srch } from './search.ts';

import * as discord from './discord.ts';

import * as Schema from '../db/schema.ts';

import type { Character } from './types.ts';

async function embed({ guildId, party, locale }: {
  guildId: string;
  party: Schema.Party;
  locale: discord.AvailableLocales;
}): Promise<discord.Message> {
  const message = new discord.Message();

  const ids = [
    party?.member1?.id,
    party?.member2?.id,
    party?.member3?.id,
    party?.member4?.id,
    party?.member5?.id,
  ];

  const mediaIds = [
    party?.member1?.mediaId,
    party?.member2?.mediaId,
    party?.member3?.mediaId,
    party?.member4?.mediaId,
    party?.member5?.mediaId,
  ];

  const members = [
    party?.member1,
    party?.member2,
    party?.member3,
    party?.member4,
    party?.member5,
  ];

  const [media, characters] = await Promise.all([
    packs.media({ ids: mediaIds.filter(Boolean) as string[], guildId }),
    packs.characters({ ids: ids.filter(Boolean) as string[], guildId }),
  ]);

  ids.forEach((characterId, i) => {
    if (!characterId) {
      message.addEmbed(new discord.Embed()
        .setDescription(i18n.get('unassigned', locale)));

      return;
    }

    const character = characters.find(({ packId, id }) =>
      characterId === `${packId}:${id}`
    );

    const mediaIndex = media.findIndex(({ packId, id }) =>
      // deno-lint-ignore no-non-null-assertion
      mediaIds[i]! === `${packId}:${id}`
    );

    if (
      !character ||
      mediaIndex === -1 ||
      packs.isDisabled(characterId, guildId) ||
      // deno-lint-ignore no-non-null-assertion
      packs.isDisabled(mediaIds[i]!, guildId)
    ) {
      return message.addEmbed(
        new discord.Embed().setDescription(
          i18n.get('character-disabled', locale),
        ),
      );
    }

    const embed = srch.characterEmbed(character, {
      mode: 'thumbnail',
      media: { title: packs.aliasToArray(media[mediaIndex].title)[0] },
      rating: new Rating({ stars: members[i]?.rating }),
      description: false,
      footer: false,
      existing: {
        image: members[i]?.image,
        nickname: members[i]?.nickname,
      },
    });

    if (i === 0) {
      embed.setColor('#D1B72C').setFooter({
        text: `${members[i]?.combat?.stats?.strength ?? 0}-${
          members[i]?.combat?.stats?.stamina ?? 0
        }-${members[i]?.combat?.stats?.agility ?? 0}`,
      });
    }

    message.addEmbed(embed);
  });

  return message;
}

function view({ token, userId, guildId }: {
  token: string;
  userId: string;
  guildId: string;
}): discord.Message {
  const locale = user.cachedUsers[userId]?.locale ??
    user.cachedGuilds[guildId]?.locale;

  Promise.resolve()
    .then(async () => {
      const user = await db.getUser(userId);
      const guild = await db.getGuild(guildId);
      const instance = await db.getInstance(guild);

      const { inventory } = await db.getInventory(instance, user);

      const party = await db.getUserParty(inventory);

      const message = await embed({ guildId, party, locale });

      return message.patch(token);
    })
    .catch(async (err) => {
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
  spot?: number;
  search?: string;
  id?: string;
}): discord.Message {
  const locale = user.cachedUsers[userId]?.locale ??
    user.cachedGuilds[guildId]?.locale;

  packs
    .characters(id ? { ids: [id], guildId } : { search, guildId })
    .then(async (results) => {
      const character = await packs.aggregate<Character>({
        character: results[0],
        guildId,
        end: 1,
      });

      const media = character.media?.edges?.[0]?.node;

      if (
        !results.length ||
        packs.isDisabled(`${character.packId}:${character.id}`, guildId) ||
        (media && packs.isDisabled(`${media.packId}:${media.id}`, guildId))
      ) {
        throw new Error('404');
      }

      const message = new discord.Message();

      const characterId = `${character.packId}:${character.id}`;

      const user = await db.getUser(userId);
      const guild = await db.getGuild(guildId);
      const instance = await db.getInstance(guild);

      try {
        const response = await db.assignCharacter(
          user,
          instance,
          characterId,
          spot,
        );

        return message
          .addEmbed(new discord.Embed()
            .setDescription(i18n.get('assigned', locale)))
          .addEmbed(srch.characterEmbed(results[0], {
            mode: 'thumbnail',
            rating: new Rating({ stars: response.rating }),
            description: true,
            footer: false,
            existing: {
              image: response.image,
              nickname: response.nickname,
            },
          }))
          .addComponents([
            new discord.Component()
              .setLabel('/character')
              .setId(`character`, characterId),
          ]).patch(token);
      } catch (err) {
        const names = packs.aliasToArray(results[0].name);

        switch (err.message) {
          case 'CHARACTER_NOT_FOUND': {
            return message.addEmbed(
              new discord.Embed().setDescription(
                i18n.get('character-hasnt-been-found', locale, names[0]),
              ),
            ).addComponents([
              new discord.Component()
                .setLabel('/character')
                .setId(`character`, characterId),
            ]).patch(token);
          }
          case 'CHARACTER_NOT_OWNED':
            return message.addEmbed(
              new discord.Embed().setDescription(
                i18n.get(
                  'character-not-owned-by-you',
                  locale,
                  names[0],
                ),
              ),
            ).addComponents([
              new discord.Component()
                .setLabel('/character')
                .setId(`character`, characterId),
            ]).patch(token);
          default:
            throw err;
        }
      }
    })
    .catch(async (err) => {
      if (err.message === '404') {
        await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('found-nothing', locale),
            ),
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

function swap({ token, a, b, userId, guildId }: {
  token: string;
  a: number;
  b: number;
  userId: string;
  guildId: string;
}): discord.Message {
  const locale = user.cachedUsers[userId]?.locale ??
    user.cachedGuilds[guildId]?.locale;

  Promise.resolve()
    .then(async () => {
      const user = await db.getUser(userId);
      const guild = await db.getGuild(guildId);
      const instance = await db.getInstance(guild);

      const party = await db.swapSpots(user, instance, a, b);

      return (await embed({ guildId, party, locale }))
        .patch(token);
    })
    .catch(async (err) => {
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

function remove({ token, spot, userId, guildId }: {
  token: string;
  spot: number;
  userId: string;
  guildId: string;
}): discord.Message {
  const locale = user.cachedUsers[userId]?.locale ??
    user.cachedGuilds[guildId]?.locale;

  Promise.resolve()
    .then(async () => {
      const user = await db.getUser(userId);
      const guild = await db.getGuild(guildId);
      const instance = await db.getInstance(guild);

      const character = await db.unassignCharacter(
        user,
        instance,
        spot,
      );

      const message = new discord.Message();

      if (!character) {
        return message.addEmbed(
          new discord.Embed().setDescription(
            i18n.get('no-assigned-in-spot', locale),
          ),
        ).patch(token);
      }

      const characters = await packs.characters({
        ids: [character.id],
        guildId,
      });

      if (
        !characters.length ||
        packs.isDisabled(character.id, guildId) ||
        packs.isDisabled(character.mediaId, guildId)
      ) {
        return message
          .addEmbed(new discord.Embed().setDescription(`Removed #${spot}`))
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('character-disabled', locale),
            ),
          ).patch(token);
      }

      return message
        .addEmbed(new discord.Embed().setDescription('Removed'))
        .addEmbed(srch.characterEmbed(characters[0], {
          mode: 'thumbnail',
          rating: new Rating({ stars: character.rating }),
          description: true,
          footer: false,
          existing: {
            image: character.image,
            nickname: character.nickname,
          },
        }))
        .addComponents([
          new discord.Component()
            .setLabel('/character')
            .setId(`character`, character.id),
        ]).patch(token);
    })
    .catch(async (err) => {
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

const party = {
  view,
  assign,
  swap,
  remove,
};

export default party;
