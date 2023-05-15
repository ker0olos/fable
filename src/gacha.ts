import { gql, request } from './graphql.ts';

import utils, { ImageSize } from './utils.ts';

import Rating from './rating.ts';

import config, { faunaUrl } from './config.ts';

import search from './search.ts';

import packs from './packs.ts';

import * as discord from './discord.ts';

import {
  Character,
  CharacterRole,
  DisaggregatedCharacter,
  Media,
  PoolInfo,
  Schema,
} from './types.ts';

import { NonFetalError, NoPullsError, PoolError } from './errors.ts';

export type Pull = {
  index?: number;
  remaining?: number;
  guarantees?: number[];
  character: Character;
  media: Media;
  rating: Rating;
} & PoolInfo;

const lowest = 1000;

const variables = {
  roles: {
    10: CharacterRole.Main, // 10% for Main
    70: CharacterRole.Supporting, // 70% for Supporting
    20: CharacterRole.Background, // 20% for Background
  },
  ranges: {
    // whether you get from the far end or the near end
    // of those ranges is up to total RNG
    65: [lowest, 50_000], // 65% for 1K -> 50K
    22: [50_000, 100_000], // 22% for 50K -> 100K
    9: [100_000, 200_000], // 9% for 100K -> 200K
    3: [200_000, 400_000], // 3% for 200K -> 400K
    1: [400_000, NaN], // 1% for 400K -> inf
  },
};

async function rangePool({ guildId }: { guildId: string }): Promise<{
  pool: { id: string }[];
  poolInfo: PoolInfo;
  validate: (character: Character | DisaggregatedCharacter) => boolean;
}> {
  const { value: range, chance: rangeChance } = utils.rng(
    gacha.variables.ranges,
  );

  const { value: role, chance: roleChance } = range[0] <= lowest
    // include all roles in the pool
    ? { value: undefined, chance: undefined }
    // one specific role for the whole pool
    : utils.rng(gacha.variables.roles);

  const pool = await packs.pool({
    role,
    range,
    guildId,
  });

  const validate = (character: Character | DisaggregatedCharacter): boolean => {
    if (
      typeof character.popularity === 'number' &&
      !(character.popularity >= range[0] &&
        (isNaN(range[1]) || character.popularity <= range[1]))
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
        !(popularity >= range[0] && (isNaN(range[1]) || popularity <= range[1]))
      ) {
        return false;
      }

      if (role && edge.role !== role) {
        return false;
      }
    }

    return true;
  };

  const poolInfo: PoolInfo = {
    pool: pool.length,
    popularityChance: rangeChance,
    popularityGreater: range[0],
    popularityLesser: range[1],
    roleChance,
    role,
  };

  return {
    pool,
    poolInfo,
    validate,
  };
}

async function guaranteedPool(
  { guildId, guarantee }: { guildId: string; guarantee: number },
): Promise<{
  pool: { id: string }[];
  poolInfo: PoolInfo;
  validate: (character: Character | DisaggregatedCharacter) => boolean;
}> {
  const pool = (await packs.pool({
    stars: guarantee,
    guildId,
  }))
    .filter(({ rating }) => rating === guarantee);

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

  const poolInfo: PoolInfo = {
    pool: pool.length,
  };

  return {
    pool,
    poolInfo,
    validate,
  };
}

async function rngPull(
  { guildId, userId, guarantee, mutation, extra }: {
    guildId: string;
    userId?: string;
    guarantee?: number;
    mutation?: {
      name: string;
      query: string;
    };
    extra?: {
      // deno-lint-ignore no-explicit-any
      [key: string]: any;
    };
  },
): Promise<Pull> {
  const { pool, poolInfo, validate } = typeof guarantee === 'number'
    ? await gacha.guaranteedPool({
      guildId,
      guarantee,
    })
    : await gacha.rangePool({
      guildId,
    });

  let inventory: Schema.Inventory | undefined = undefined;

  let rating: Rating | undefined = undefined;
  let character: Character | undefined = undefined;
  let media: Media | undefined = undefined;

  while (pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length);

    const characterId = pool.splice(i, 1)[0].id;

    const results = await packs.characters({ guildId, ids: [characterId] });

    // search will return empty if the character is disabled
    if (!results.length) {
      continue;
    }

    if (!validate(results[0])) {
      continue;
    }

    // aggregate will filter out any disabled media
    const candidate = await packs.aggregate<Character>({
      guildId,
      character: results[0],
      end: 1,
    });

    const edge = candidate.media?.edges?.[0];

    // if no media
    if (!edge) {
      continue;
    }

    if (!validate(candidate)) {
      continue;
    }

    rating = Rating.fromCharacter(candidate);

    if (rating.stars < 1) {
      continue;
    }

    // add character to user's inventory
    if (userId) {
      const _mutation = mutation?.query ?? gql`
        mutation (
          $userId: String!
          $guildId: String!
          $characterId: String!
          $mediaId: String!
          $guaranteed: Boolean!
          $rating: Int!
        ) {
          addCharacterToInventory(
            userId: $userId
            guildId: $guildId
            characterId: $characterId
            mediaId: $mediaId
            guaranteed: $guaranteed,
            rating: $rating
          ) {
            ok
            error
            likes
            inventory {
              availablePulls
              rechargeTimestamp
              user {
                guarantees
              }
            }
          }
        }
      `;

      const response = (await request<{
        [key: string]: Schema.Mutation;
      }>({
        url: faunaUrl,
        query: _mutation,
        headers: {
          'authorization': `Bearer ${config.faunaSecret}`,
        },
        variables: {
          userId,
          guildId,
          characterId,
          mediaId: `${edge.node.packId}:${edge.node.id}`,
          guaranteed: typeof guarantee === 'number',
          rating: rating.stars,
          ...extra,
        },
      }))[mutation?.name ?? 'addCharacterToInventory'];

      if (response.ok) {
        inventory = response.inventory;
      } else {
        switch (response.error) {
          case 'NO_GUARANTEES':
            throw new Error('403');
          case 'NO_PULLS_AVAILABLE':
            throw new NoPullsError(response.inventory.rechargeTimestamp);
          case 'CHARACTER_NOT_OWNED':
            throw new NonFetalError('Some of those characters changed hands');
          // duplicate character
          case 'CHARACTER_EXISTS':
            continue;
          default:
            throw new Error(response.error);
        }
      }
    }

    media = edge.node;
    character = candidate;

    break;
  }

  if (!character || !media || !rating) {
    throw new PoolError(poolInfo);
  }

  return {
    media,
    rating,
    character,
    remaining: inventory?.availablePulls,
    guarantees: inventory?.user?.guarantees,
    ...poolInfo,
  };
}

async function pullAnimation(
  { token, pull, userId, channelId, quiet, mention, guarantee }: {
    token: string;
    pull: Pull;
    channelId: string;
    userId?: string;
    quiet?: boolean;
    mention?: boolean;
    guarantee?: number;
  },
): Promise<void> {
  const media = pull.media;

  const mediaTitles = packs.aliasToArray(media.title);

  const mediaImage = media.images?.[0];

  let message = new discord.Message()
    .addEmbed(
      new discord.Embed()
        .setTitle(utils.wrap(mediaTitles[0]))
        .setImage({
          size: ImageSize.Medium,
          url: mediaImage?.url,
          blur: mediaImage?.nsfw &&
            !packs.cachedChannels[channelId]?.nsfw,
        }),
    );

  if (mention && userId) {
    message
      .setContent(`<@${userId}>`)
      .setPing();
  }

  if (!quiet) {
    await message.patch(token);

    await utils.sleep(4);

    message = new discord.Message()
      .addEmbed(
        new discord.Embed()
          .setImage({
            url: `${config.origin}/assets/stars/${pull.rating.stars}.gif`,
          }),
      );

    if (mention && userId) {
      message
        .setContent(`<@${userId}>`)
        .setPing();
    }

    await message.patch(token);

    await utils.sleep(pull.rating.stars + 3);
  }

  message = search.characterMessage(pull.character, channelId, {
    relations: false,
    rating: pull.rating,
    description: false,
    externalLinks: false,
    footer: false,
    media: {
      title: true,
    },
  });

  if (userId) {
    if (
      typeof guarantee === 'number' &&
      pull.guarantees?.length &&
      pull.remaining
    ) {
      const next = pull.guarantees?.sort((a, b) => b - a)[0];

      message.addComponents([
        new discord.Component()
          .setId('pull', userId, `${next}`)
          .setLabel(`/pull ${next}`),
      ]);
    } else {
      const component = new discord.Component()
        .setId(quiet ? 'q' : 'gacha', userId)
        .setLabel(`/${quiet ? 'q' : 'gacha'}`);

      if (!pull.remaining) {
        component.toggle();
      }

      message.addComponents([
        component,
      ]);
    }
  }

  message.addComponents([
    new discord.Component()
      .setLabel('/character')
      .setId(`character`, `${pull.character.packId}:${pull.character.id}`, '1'),
    new discord.Component()
      .setLabel('/like')
      .setId(`like`, `${pull.character.packId}:${pull.character.id}`),
  ]);

  if (mention && userId) {
    message
      .setContent(`<@${userId}>`)
      .setPing();
  }

  await message.patch(token);

  // TODO
  // if (pull.likes?.length && userId) {
  //   await new discord.Message()
  //     .setContent(pull.likes.map((id) => `<@${id}>`).join(''))
  //     .followup(token);
  // }
}

/**
 * start the pull's animation
 */
function start(
  { token, guildId, channelId, userId, guarantee, mention, quiet }: {
    token: string;
    guildId: string;
    channelId: string;
    userId?: string;
    guarantee?: number;
    mention?: boolean;
    quiet?: boolean;
  },
): discord.Message {
  if (!config.gacha) {
    throw new NonFetalError(
      'Gacha is under maintenance, try again later!',
    );
  }

  gacha.rngPull({ userId, guildId, guarantee })
    .then((pull) =>
      pullAnimation({
        pull,
        token,
        channelId,
        userId,
        guarantee,
        mention,
        quiet,
      })
    )
    .catch(async (err) => {
      if (err instanceof NoPullsError) {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed()
              .setDescription('You don\'t have any more pulls!'),
          )
          .addEmbed(
            new discord.Embed()
              .setDescription(`_+1 pull <t:${err.rechargeTimestamp}:R>_`),
          )
          .patch(token);
      }

      if (err?.message === '403') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              `You don\`t have any ${guarantee}${discord.emotes.smolStar}pulls`,
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
              `There are no more ${
                typeof guarantee === 'number'
                  ? `${guarantee}${discord.emotes.smolStar}`
                  : ''
              }characters left`,
            ),
          ).patch(token);
      }

      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  const spinner = new discord.Message()
    .addEmbed(
      new discord.Embed().setImage(
        { url: `${config.origin}/assets/spinner.gif` },
      ),
    );

  if (mention) {
    spinner
      .setContent(`<@${userId}>`)
      .setPing();
  }

  return spinner;
}

const gacha = {
  lowest,
  variables,
  rngPull,
  pullAnimation,
  guaranteedPool,
  rangePool,
  start,
};

export default gacha;
