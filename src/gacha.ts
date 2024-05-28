import utils, { ImageSize } from '~/src/utils.ts';

import Rating from '~/src/rating.ts';

import config from '~/src/config.ts';

import i18n from '~/src/i18n.ts';

import user from '~/src/user.ts';
import search from '~/src/search.ts';

import db, { ObjectId } from '~/db/mod.ts';

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
  roles: { [chance: number]: CharacterRole };
  liked: { [chance: number]: boolean };
  ranges: { [chance: number]: [number, number] };
};

export type Pull = {
  index?: number;
  character: Character;
  media: Media;
  rating: Rating;
};

const lowest = 1000;

const variables: Variables = {
  roles: {
    20: CharacterRole.Main, // 20% for Main
    55: CharacterRole.Supporting, // 55% for Supporting
    25: CharacterRole.Background, // 25% for Background
  },
  liked: { 5: true, 95: false },
  ranges: {
    // whether you get from the far end or the near end
    // of those ranges is random
    40: [lowest, 50_000], // 40% for 1K -> 50K
    25: [50_000, 100_000], // 25% for 50K -> 100K
    20: [100_000, 200_000], // 20% for 100K -> 200K
    10: [200_000, 400_000], // 10% for 200K -> 400K
    5: [400_000, Infinity], // 5% for 400K -> inf
  },
};

async function likedPool(
  { userId, guildId }: { userId: string; guildId: string },
): Promise<{
  pool: Map<string, import('search-index').Character[]>;
  validate: (character: Character) => boolean;
}> {
  // TODO include liked all media characters

  const pool: Awaited<ReturnType<typeof searchIndex.pool>> = new Map();

  const user = await db.getUser(userId);

  let likes = user.likes ?? [];

  const results = await db.findCharacters(
    guildId,
    likes.map(({ characterId }) => characterId)
      .filter(utils.nonNullable),
  );

  likes = likes.filter((like, i) => {
    return like.characterId && results[i] === undefined;
  });

  // fallback to normal pool
  if (!likes.length) {
    return gacha.rangePool({ guildId });
  }

  let length = 0;

  const _pool = await searchIndex.charIdPool(guildId);

  likes.forEach(({ characterId }) => {
    // deno-lint-ignore no-non-null-assertion
    const char = _pool.get(characterId!);

    if (char) {
      pool.set(char.id, [char]);
      length += 1;
    }
  });

  const validate = (
    character: Character | DisaggregatedCharacter,
  ): boolean => {
    // deno-lint-ignore no-non-null-assertion
    const edge = character.media && 'edges' in character.media! &&
      character.media.edges[0];

    if (edge) {
      return true;
    }

    return false;
  };

  // fallback to normal pool
  if (!length) {
    return gacha.rangePool({ guildId });
  }

  return { pool, validate };
}

async function rangePool(
  { guildId }: { guildId: string },
): Promise<{
  pool: Map<string, import('search-index').Character[]>;
  validate: (character: Character) => boolean;
}> {
  const variables: Variables = gacha.variables;

  const { value: range } = utils.rng(variables.ranges);

  const { value: role } = range[0] <= lowest
    // include all roles in the pool
    ? { value: undefined }
    // one specific role for the whole pool
    : utils.rng(variables.roles);

  const pool = await searchIndex.pool(
    { role, popularity: { between: range } },
    guildId,
  );

  const validate = (character: Character | DisaggregatedCharacter): boolean => {
    if (
      typeof character.popularity === 'number' &&
      !(character.popularity >= range[0] && character.popularity <= range[1])
    ) {
      return false;
    }

    if (
      role &&
      Array.isArray(character.media) &&
      (character.media.length <= 0 || character.media[0].role !== role)
    ) {
      return false;
    }

    // deno-lint-ignore no-non-null-assertion
    const edge = character.media && 'edges' in character.media! &&
      character.media.edges[0];

    if (edge) {
      const popularity = character.popularity || edge.node.popularity || lowest;

      if (
        !(popularity >= range[0] && popularity <= range[1])
      ) {
        return false;
      }

      if (role && edge.role !== role) {
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
    : await gacha.rangePool({ guildId });

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
          });
        } catch (err) {
          // E11000 duplicate key error collection
          // character already exists in guild
          if (err.code === 11000) {
            continue;
          }

          if (err.message.includes('Write conflict during plan execution')) {
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
  rangePool,
  start,
};

export default gacha;
