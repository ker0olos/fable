import utils, { ImageSize } from '~/src/utils.ts';

import Rating from '~/src/rating.ts';

import config from '~/src/config.ts';

import i18n from '~/src/i18n.ts';

import user from '~/src/user.ts';
import search from '~/src/search.ts';

import db, { ObjectId } from '~/db/mod.ts';

import { DupeError } from '~/src/errors.ts';

import searchIndex from '~/search-index/mod.ts';

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

async function likedPool(
  { userId, guildId }: { userId: string; guildId: string },
): Promise<{
  pool: Map<string, import('search-index').Character[]>;
  validate: (character: Character) => boolean;
}> {
  const user = await db.getUser(userId);

  let likes = user.likes ?? [];

  const results = await db.findCharacters(
    guildId,
    likes.map(({ characterId }) => characterId)
      .filter(utils.nonNullable),
  );

  likes = likes.filter((like, i) => {
    return like.mediaId || (like.characterId && results[i] === undefined);
  });

  // fallback to normal pool
  if (!likes.length) {
    return gacha.rngPool({ guildId });
  }

  const [mediaPool, charPool] = await Promise.all([
    searchIndex.pool({}, guildId),
    searchIndex.charIdPool(guildId),
  ]);

  const finalPool: Awaited<ReturnType<typeof searchIndex.pool>> = new Map();

  likes.forEach(({ characterId, mediaId }) => {
    if (typeof characterId === 'string') {
      const char = charPool.get(characterId);

      if (!char || !char.mediaId) return;

      if (!finalPool.has(char.mediaId)) {
        finalPool.set(char.mediaId, []);
      }

      // deno-lint-ignore no-non-null-assertion
      finalPool.get(char.mediaId)!.push(char);
    } else if (typeof mediaId === 'string') {
      const characters = mediaPool.get(mediaId);

      if (!characters?.length) return;

      if (!finalPool.has(mediaId)) {
        finalPool.set(mediaId, []);
      }

      // deno-lint-ignore no-non-null-assertion
      finalPool.get(mediaId)!.push(...characters);
    }
  });

  const validate = (): boolean => {
    return true;
  };

  // fallback to normal pool
  if (!finalPool.size) {
    return gacha.rngPool({ guildId });
  }

  return { pool: finalPool, validate };
}

async function rngPool(
  { guildId }: { guildId: string },
): Promise<{
  pool: Map<string, import('search-index').Character[]>;
  validate: (character: Character) => boolean;
}> {
  const variables: Variables = gacha.variables;

  const { value: rating } = utils.rng(variables.rating);

  const pool = await searchIndex.pool({ rating }, guildId);

  const validate = (character: Character | DisaggregatedCharacter): boolean => {
    if (
      typeof character.popularity === 'number' &&
      new Rating({ popularity: character.popularity }).stars !== rating
    ) {
      return false;
    }

    // deno-lint-ignore no-non-null-assertion
    const edge = character.media && 'edges' in character.media! &&
      character.media.edges[0];

    if (edge) {
      const popularity = character.popularity || edge.node.popularity || lowest;

      if (new Rating({ popularity, role: edge.role }).stars !== rating) {
        return false;
      }
    }

    return true;
  };

  return { pool, validate };
}

async function rangeFallbackPool(
  { guildId }: { guildId: string },
): Promise<Map<string, import('search-index').Character[]>> {
  return await searchIndex.pool({}, guildId);
}

export async function guaranteedPool(
  { guildId, guarantee }: {
    guildId: string;
    guarantee: number;
  },
): Promise<{
  pool: Map<string, import('search-index').Character[]>;
  validate: (character: Character) => boolean;
  role?: CharacterRole;
  range?: [number, number];
}> {
  const pool = await searchIndex.pool(
    { rating: guarantee },
    guildId,
  );

  const validate = (character: Character | DisaggregatedCharacter): boolean => {
    if (
      typeof character.popularity === 'number' &&
      new Rating({ popularity: character.popularity }).stars !== guarantee
    ) {
      return false;
    }

    // deno-lint-ignore no-non-null-assertion
    const edge = character.media && 'edges' in character.media! &&
      character.media.edges[0];

    if (edge) {
      const popularity = character.popularity || edge.node.popularity || lowest;

      if (new Rating({ popularity, role: edge.role }).stars !== guarantee) {
        return false;
      }
    }

    return true;
  };

  return {
    pool,
    validate,
  };
}

async function rngPull(
  {
    guildId,
    userId,
    guarantee,
    sacrifices,
  }: {
    guildId: string;
    userId?: string;
    guarantee?: number;
    sacrifices?: ObjectId[];
  },
): Promise<Pull> {
  let { pool, validate } = typeof guarantee === 'number'
    ? await gacha.guaranteedPool({ guildId, guarantee })
    : utils.rng(variables.liked).value && userId
    ? await gacha.likedPool({ guildId, userId })
    : await gacha.rngPool({ guildId });

  let poolKeys = Array.from(pool.keys());

  let rating: Rating | undefined = undefined;
  let character: Character | undefined = undefined;
  let media: Media | undefined = undefined;

  const controller = new AbortController();

  const { signal } = controller;

  const timeoutId = setTimeout(() => controller.abort(), 1 * 60 * 1000);

  if (!poolKeys.length && !guarantee) {
    pool = await gacha.rangeFallbackPool({ guildId });
    poolKeys = Array.from(pool.keys());
    validate = () => true;
  }

  if (!poolKeys.length) {
    throw new PoolError();
  }

  const mongo = await db.newMongo().connect();

  try {
    while (!signal.aborted) {
      const mediaIndex = Math.floor(Math.random() * poolKeys.length);

      const mediaCharacters = pool.get(poolKeys[mediaIndex]);

      if (!mediaCharacters) {
        continue;
      }

      const i = Math.floor(Math.random() * mediaCharacters.length);

      const characterId = mediaCharacters[i].id;

      const results = await packs.characters({ guildId, ids: [characterId] });

      // aggregate will filter out any disabled media
      const candidate = await packs.aggregate<Character>({
        guildId,
        character: results[0],
        end: 1,
      });

      const edge = candidate.media?.edges?.[0];

      if (!edge || !validate(candidate)) {
        continue;
      }

      if (packs.isDisabled(`${edge.node.packId}:${edge.node.id}`, guildId)) {
        continue;
      }

      rating = Rating.fromCharacter(candidate);

      if (!rating.stars) {
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
            rating: rating.stars,
            sacrifices,
            mongo,
          });
        } catch (err) {
          if (err instanceof DupeError) {
            continue;
          }

          throw err;
        }
      }

      media = edge.node;
      character = candidate;

      break;
    }
  } finally {
    clearTimeout(timeoutId);
    await mongo.close();
  }

  if (!character || !media || !rating?.stars) {
    throw new PoolError();
  }

  media = await packs.aggregate<Media>({ media, guildId });

  return { rating, character, media };
}

async function pullAnimation(
  { token, userId, guildId, quiet, mention, components, pull }: {
    token: string;
    pull: Pull;
    userId?: string;
    guildId?: string;
    quiet?: boolean;
    mention?: boolean;
    components?: boolean;
  },
): Promise<void> {
  components ??= true;

  const characterId = `${pull.character.packId}:${pull.character.id}`;

  const mediaIds = [
    pull.media,
    ...pull.media.relations?.edges?.map(({ node }) => node) ?? [],
  ].map(({ packId, id }) => `${packId}:${id}`);

  const mediaTitles = packs.aliasToArray(pull.media.title);

  const mediaImage = pull.media.images?.[0];

  const embed = new discord.Embed()
    .setTitle(utils.wrap(mediaTitles[0]));

  const mediaImageAttachment = await embed.setImageWithProxy({
    size: ImageSize.Medium,
    url: mediaImage?.url,
  });

  let message = new discord.Message()
    .addEmbed(embed)
    .addAttachment(mediaImageAttachment);

  if (mention && userId) {
    message
      .setContent(`<@${userId}>`)
      .setPing();
  }

  // animate pull by shown media
  // then showing the star rating
  if (!quiet) {
    await message.patch(token);

    await utils.sleep(4);

    const embed = new discord.Embed();

    const image = embed.setImageFile(
      `assets/public/stars/${pull.rating.stars}.gif`,
    );

    message = new discord.Message()
      .addEmbed(embed)
      .addAttachment(image);

    if (mention && userId) {
      message
        .setContent(`<@${userId}>`)
        .setPing();
    }

    await message.patch(token);

    await utils.sleep(pull.rating.stars + 3);
  }
  //

  message = await search.characterMessage(pull.character, {
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

    message.addComponents([
      component,
    ]);
  }

  message.addComponents([
    new discord.Component()
      .setLabel('/character')
      .setId(`character`, characterId, '1'),
    config.combat
      ? new discord.Component()
        .setLabel('/stats')
        .setId(`stats`, characterId)
      : undefined,
    new discord.Component()
      .setLabel('/like')
      .setId(`like`, characterId),
  ].filter(utils.nonNullable));

  if (mention && userId) {
    message
      .setContent(`<@${userId}>`)
      .setPing();
  }

  await message.patch(token);

  const background =
    pull.character.media?.edges?.[0].role === CharacterRole.Background;

  if (guildId && userId && !background) {
    const pings = new Set<string>();

    const users = await db.getActiveUsersIfLiked(
      guildId,
      characterId,
      mediaIds,
    );

    users.forEach((userId) => {
      pings.add(`<@${userId}>`);
    });

    if (pings.size > 0) {
      const message = new discord.Message();

      const embed = await search.characterEmbed(message, pull.character, {
        userId,
        mode: 'thumbnail',
        rating: true,
        description: false,
        footer: true,
        media: { title: true },
        existing: {
          rating: pull.rating.stars,
        },
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
function start(
  { token, guildId, userId, guarantee, mention, quiet }: {
    token: string;
    guildId: string;
    userId?: string;
    guarantee?: number;
    mention?: boolean;
    quiet?: boolean;
  },
): discord.Message {
  const locale = userId
    ? (user.cachedUsers[userId]?.locale ??
      user.cachedGuilds[guildId]?.locale)
    : user.cachedGuilds[guildId]?.locale;

  if (!config.gacha) {
    throw new NonFetalError(
      i18n.get('maintenance-gacha', locale),
    );
  }

  gacha.rngPull({ userId, guildId, guarantee })
    .then((pull) => {
      return pullAnimation({ token, userId, guildId, mention, quiet, pull });
    })
    .catch(async (err) => {
      if (err instanceof NoPullsError) {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed()
              .setDescription(i18n.get('gacha-no-more-pulls', locale)),
          )
          .addEmbed(
            new discord.Embed()
              .setDescription(
                i18n.get('+1-pull', locale, `<t:${err.rechargeTimestamp}:R>`),
              ),
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
                `${guarantee}${discord.emotes.smolStar}`,
              ),
            ),
          )
          .addComponents([
            new discord.Component()
              // deno-lint-ignore no-non-null-assertion
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
                  `${guarantee}${discord.emotes.smolStar}`,
                )
                : i18n.get('gacha-no-more-in-range', locale),
            ),
          ).patch(token);
      }

      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  const loading = discord.Message.spinner();

  if (mention) {
    loading
      .setContent(`<@${userId}>`)
      .setPing();
  }

  return loading;
}

const gacha = {
  lowest,
  variables,
  rngPull,
  pullAnimation,
  guaranteedPool,
  rangeFallbackPool,
  likedPool,
  rngPool,
  start,
};

export default gacha;
