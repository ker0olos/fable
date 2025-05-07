import utils, { ImageSize } from '~/src/utils.ts';

import Rating from '~/src/rating.ts';

import config from '~/src/config.ts';

import i18n from '~/src/i18n.ts';

import user from '~/src/user.ts';
import search from '~/src/search.ts';

import db, { ObjectId } from '~/db/index.ts';

import packs from '~/src/packs.ts';

import * as discord from '~/src/discord.ts';

import {
  Character,
  CharacterRole,
  DisaggregatedCharacter,
  Media,
} from '~/src/types.ts';

import { NonFetalError, NoPullsError, PoolError } from '~/src/errors.ts';

type Variables = {
  liked: { [chance: number]: boolean };
  rating: { [chance: number]: number };
};

export type Pull = {
  index?: number;
  character: Character;
  media: Media;
  rating: Rating;
  dupe: boolean;
};

const lowest = 1000;

const variables: Variables = {
  liked: { 5: true, 95: false },
  rating: {
    50: 1,
    30: 2,
    15: 3,
    4: 4,
    1: 5,
  },
};

async function likedPool({
  userId,
  guildId,
}: {
  userId: string;
  guildId: string;
}): Promise<DisaggregatedCharacter[]> {
  const user = await db.getUser(userId);

  const likes = user.likes ?? [];

  if (!likes.length) {
    return gacha.rngPool({ guildId });
  }

  const charLikes = likes
    .map((like) => like.characterId)
    .filter(utils.nonNullable);

  const mediaLikes = likes
    .map((like) => like.mediaId)
    .filter(utils.nonNullable);

  const pool = await db.likesPool({
    guildId,
    characterIds: charLikes,
    mediaIds: mediaLikes,
  });

  console.log('initial likes pool length', pool.length);

  if (!pool.length) {
    return gacha.rngPool({ guildId });
  }

  return pool;
}

async function rngPool({
  guildId,
}: {
  guildId: string;
}): Promise<DisaggregatedCharacter[]> {
  const variables: Variables = gacha.variables;

  const { value: rating } = utils.rng(variables.rating);

  const pool = await db.ratingPool({ guildId, rating });

  console.log('initial pool length', pool.length, 'rating', rating);

  return pool;
}

export async function guaranteedPool({
  guildId,
  guarantee,
}: {
  guildId: string;
  guarantee: number;
}): Promise<DisaggregatedCharacter[]> {
  const pool = await db.ratingPool({ guildId, rating: guarantee });

  return pool;
}

async function rngPull({
  guildId,
  userId,
  guarantee,
  sacrifices,
  quiet,
}: {
  guildId: string;
  userId?: string;
  guarantee?: number;
  sacrifices?: ObjectId[];
  quiet?: boolean;
}): Promise<Pull> {
  const mongo = await db.newMongo().connect();

  // const pool =
  //   typeof guarantee === 'number'
  //     ? await gacha.guaranteedPool({ guildId, guarantee })
  //     : utils.rng(variables.liked).value && userId
  //       ? await gacha.likedPool({ guildId, userId })
  //       : await gacha.rngPool({ guildId });

  let pool =
    typeof guarantee === 'number'
      ? await gacha.guaranteedPool({ guildId, guarantee })
      : await gacha.rngPool({ guildId });

  const [guild, existing] = await Promise.all([
    db.getGuild(guildId, mongo, true),
    db.findGuildCharacters(guildId, mongo, true),
  ]);

  const exists: Record<string, string[]> = {};

  existing.forEach(({ characterId, userId }) => {
    if (!Array.isArray(exists[characterId])) {
      exists[characterId] = [];
    }
    exists[characterId].push(userId);
  });

  let dupe = false;
  let character: Character | undefined = undefined;
  let media: Media | undefined = undefined;

  if (!pool.length && !guarantee) {
    pool = await db.fallbackPool({ guildId });
  }

  if (!pool.length) {
    throw new PoolError();
  }

  try {
    while (true) {
      // pool is empty
      if (!pool.length) {
        break;
      }

      const index = Math.floor(Math.random() * pool.length);

      const rating = pool[index].rating;
      const characterId = `${pool[index].packId}:${pool[index].id}`;

      if (!guild.options?.dupes && Array.isArray(exists[characterId])) {
        pool.splice(index, 1);
        continue;
      }

      if (!rating) {
        pool.splice(index, 1);
        continue;
      }

      const result = pool[index];

      if (!result.media?.[0]?.mediaId) {
        pool.splice(index, 1);
        continue;
      }

      const mediaId = packs.parseId(result.media[0].mediaId, result.packId);

      if (
        !mediaId ||
        packs.isDisabled(`${mediaId[0]}:${mediaId[1]}`, guildId)
      ) {
        pool.splice(index, 1);
        continue;
      }

      // aggregate will filter out any disabled media
      const candidate = await packs.aggregate<Character>({
        guildId,
        character: pool[index],
        end: 1,
      });

      const edge = candidate.media?.edges?.[0];

      if (!edge) {
        pool.splice(index, 1);
        continue;
      }

      // add character to user's inventory
      if (userId) {
        try {
          await db.addCharacter({
            characterId,
            guildId,
            userId,
            mediaId: `${edge.node.packId}:${edge.node.id}`,
            guaranteed: typeof guarantee === 'number',
            sacrifices,
            rating,
            quiet,
            mongo,
          });
        } catch (err) {
          if (
            // same user dupe (skip)
            err.message?.includes('userId_1_characterId_1_guildId_1 dup key')
          ) {
            dupe = true;
            console.log('same user dupe');
            await db.losePull({ userId, guildId, quiet, mongo });
          } else {
            throw err;
          }
        }
      }

      media = edge.node;
      character = candidate;

      break;
    }
  } finally {
    await mongo.close();
  }

  if (!character || !media) {
    throw new PoolError();
  }

  media = await packs.aggregate<Media>({ media, guildId });

  return {
    rating: new Rating({ stars: character.rating }),
    character,
    media,
    dupe,
  };
}

async function pullAnimation({
  pull,
  token,
  userId,
  guildId,
  quiet,
  mention,
  components,
}: {
  pull: Pull;
  token: string;
  userId?: string;
  guildId?: string;
  quiet?: boolean;
  mention?: boolean;
  components?: boolean;
}): Promise<void> {
  components ??= true;

  const locale = userId
    ? user.cachedUsers[userId]?.locale
    : guildId
      ? user.cachedGuilds[guildId]?.locale
      : 'en-US';

  const characterId = `${pull.character.packId}:${pull.character.id}`;

  const mediaIds = [
    pull.media,
    ...(pull.media.relations?.edges?.map(({ node }) => node) ?? []),
  ].map(({ packId, id }) => `${packId}:${id}`);

  // animate pull by shown media
  // then showing the star rating
  if (!quiet) {
    const mediaTitles = packs.aliasToArray(pull.media.title);

    const mediaImage = pull.media.images?.[0];

    let embed = new discord.Embed().setTitle(utils.wrap(mediaTitles[0]));

    const mediaImageAttachment = await embed.setImageWithProxy({
      size: ImageSize.Medium,
      url: mediaImage?.url,
    });

    let message = new discord.Message()
      .addEmbed(embed)
      .addAttachment(mediaImageAttachment);

    if (mention && userId) {
      message.setContent(`<@${userId}>`).setPing();
    }

    await message.patch(token);

    await utils.sleep(4);

    embed = new discord.Embed();

    embed.setImageUrl(`${config.origin}/stars/${pull.rating.stars}.gif`);

    message = new discord.Message().addEmbed(embed);

    if (mention && userId) {
      message.setContent(`<@${userId}>`).setPing();
    }

    await message.patch(token);

    await utils.sleep(pull.rating.stars + 3);
  }
  //

  const message = await search.characterMessage(pull.character, {
    relations: false,
    rating: pull.rating,
    description: false,
    externalLinks: false,
    footer: false,
    media: {
      title: true,
    },
  });

  if (components && userId) {
    const component = new discord.Component()
      .setId(quiet ? 'q' : 'gacha', userId)
      .setLabel(`/${quiet ? 'q' : 'gacha'}`);

    message.addComponents([component]);
  }

  message.addComponents(
    [
      new discord.Component()
        .setLabel('/character')
        .setId(`character`, characterId, '1'),
      pull.dupe
        ? new discord.Component()
            .setLabel(i18n.get('already-owned', locale))
            .setId('dupe', characterId)
            .setDisabled(true)
        : null,
      new discord.Component().setLabel('/like').setId(`like`, characterId),
    ].filter(utils.nonNullable)
  );

  if (mention && userId) {
    message.setContent(`<@${userId}>`).setPing();
  }

  await message.patch(token);

  const background =
    pull.character.media?.edges?.[0].role === CharacterRole.Background;

  if (guildId && userId && !background) {
    const pings = new Set<string>();

    const users = await db.getActiveUsersIfLiked(
      guildId,
      characterId,
      mediaIds
    );

    const existing = await db.findCharacter(guildId, characterId);
    const exists = existing.map((char) => char.userId);

    users.forEach((userId) => {
      if (!exists.includes(userId)) pings.add(`<@${userId}>`);
    });

    if (pings.size > 0) {
      const message = new discord.Message();

      const embed = await search.characterEmbed(message, pull.character, {
        userId,
        mode: 'thumbnail',
        description: false,
        footer: true,
        media: { title: true },
        overwrite: { userId, rating: pull.rating.stars },
      });

      await message
        .addEmbed(embed)
        .setContent(Array.from(pings).join(' '))
        .followup(token);
    }
  }
}

/**
 * start the pull's animation
 */
function start({
  token,
  guildId,
  userId,
  guarantee,
  mention,
  quiet,
}: {
  token: string;
  guildId: string;
  userId?: string;
  guarantee?: number;
  mention?: boolean;
  quiet?: boolean;
}) {
  const locale = userId
    ? (user.cachedUsers[userId]?.locale ?? user.cachedGuilds[guildId]?.locale)
    : user.cachedGuilds[guildId]?.locale;

  if (!config.gacha) {
    throw new NonFetalError(i18n.get('maintenance-gacha', locale));
  }

  return gacha
    .rngPull({ userId, guildId, guarantee, quiet })
    .then((pull) => {
      return pullAnimation({ token, userId, guildId, mention, quiet, pull });
    })
    .catch(async (err) => {
      if (err instanceof NoPullsError) {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('gacha-no-more-pulls', locale)
            )
          )
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('+1-pull', locale, `<t:${err.rechargeTimestamp}:R>`)
            )
          )
          .patch(token);
      }

      if (err?.message === '403') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get(
                'gacha-no-guarantees',
                locale,
                `${guarantee}${discord.emotes.smolStar}`
              )
            )
          )
          .addComponents([
            new discord.Component()

              .setId('buy', 'bguaranteed', userId!, `${guarantee}`)
              .setLabel(`/buy guaranteed ${guarantee}`),
          ])
          .patch(token);
      }

      if (err instanceof PoolError) {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              typeof guarantee === 'number'
                ? i18n.get(
                    'gacha-no-more-characters-left',
                    locale,
                    `${guarantee}${discord.emotes.smolStar}`
                  )
                : i18n.get('gacha-no-more-in-range', locale)
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
}

const gacha = {
  lowest,
  variables,
  rngPull,
  pullAnimation,
  guaranteedPool,
  likedPool,
  rngPool,
  start,
};

export default gacha;
