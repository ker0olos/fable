import { gql, request } from './graphql.ts';

import utils, { ImageSize } from './utils.ts';

import Rating from './rating.ts';

import config, { faunaUrl } from './config.ts';

import search from './search.ts';

import packs from './packs.ts';

import * as discord from './discord.ts';

import { Character, CharacterRole, Media, PoolInfo, Schema } from './types.ts';

import { NonFetalError, NoPullsError, PoolError } from './errors.ts';

export type Pull = {
  index?: number;
  role?: CharacterRole;
  remaining?: number;
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

async function rngPull(
  { userId, guildId }: { userId?: string; guildId: string },
): Promise<Pull> {
  // rng for popularity range
  const { value: range, chance: rangeChance } = utils.rng(
    gacha.variables.ranges,
  );

  // rng for character roll in media[0]
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

  let inventory: Schema.Inventory | undefined = undefined;

  let rating: Rating | undefined = undefined;
  let character: Character | undefined = undefined;
  let media: Media | undefined = undefined;

  const inRange = (popularity: number): boolean =>
    popularity >= range[0] && (isNaN(range[1]) || popularity <= range[1]);

  const poolInfo: PoolInfo = {
    pool: pool.length,
    popularityChance: rangeChance,
    popularityGreater: range[0],
    popularityLesser: range[1],
    roleChance,
    role,
  };

  while (pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length);

    const characterId = pool.splice(i, 1)[0].id;

    const results = await packs.characters({ guildId, ids: [characterId] });

    // search will return empty if the character is disabled
    if (!results.length) {
      continue;
    }

    if (
      // if the character has specified popularity
      // and that specified popularity is not in range of
      // the pool parameters
      (
        typeof results[0].popularity === 'number' &&
        !inRange(results[0].popularity)
      ) ||
      (
        Array.isArray(results[0].media) &&
        // no media or
        // or role is not equal to the pool parameter
        (!results[0].media[0] || results[0].media[0].role !== role)
      )
    ) {
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

    const popularity = candidate.popularity || edge.node.popularity || lowest;

    if (!inRange(popularity) || (role && edge?.role !== role)) {
      continue;
    }

    // const popularity = candidate.popularity || edge.node.popularity || lowest;
    rating = Rating.fromCharacter(candidate);

    if (rating.stars < 1) {
      continue;
    }

    // add character to user's inventory
    if (userId) {
      const mutation = gql`
        mutation (
          $userId: String!
          $guildId: String!
          $characterId: String!
          $mediaId: String!
          $rating: Int!
          $pool: Int!
          $popularityChance: Int!
          $popularityGreater: Int!
          $popularityLesser: Int
          $roleChance: Int
          $role: String
        ) {
          addCharacterToInventory(
            userId: $userId
            guildId: $guildId
            characterId: $characterId
            mediaId: $mediaId
            rating: $rating
            pool: $pool
            popularityChance: $popularityChance
            popularityGreater: $popularityGreater
            popularityLesser: $popularityLesser
            roleChance: $roleChance
            role: $role
          ) {
            ok
            error
            inventory {
              availablePulls
              rechargeTimestamp
            }
          }
        }
      `;

      const response = (await request<{
        addCharacterToInventory: Schema.Mutation;
      }>({
        url: faunaUrl,
        query: mutation,
        headers: {
          'authorization': `Bearer ${config.faunaSecret}`,
        },
        variables: {
          userId,
          guildId,
          characterId,
          mediaId: `${edge.node.packId}:${edge.node.id}`,
          rating: rating.stars,
          ...poolInfo,
        },
      })).addCharacterToInventory;

      if (response.ok) {
        inventory = response.inventory;
      } else {
        switch (response.error) {
          case 'CHARACTER_EXISTS':
            continue;
          case 'NO_PULLS_AVAILABLE':
            throw new NoPullsError(response.inventory.rechargeTimestamp);
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
    role: role,
    media: media,
    rating: rating,
    character: character,
    remaining: inventory?.availablePulls,
    ...poolInfo,
  };
}

/**
 * start the pull's animation
 */
function start(
  { token, userId, guildId, mention, quiet }: {
    token: string;
    guildId: string;
    userId?: string;
    mention?: boolean;
    quiet?: boolean;
  },
): discord.Message {
  if (!config.gacha) {
    throw new NonFetalError(
      'Gacha is under maintenance, try again later!',
    );
  }

  gacha.rngPull({ userId, guildId })
    .then(async (pull) => {
      const media = pull.media;

      const mediaTitles = packs.aliasToArray(media.title);

      let message = new discord.Message()
        .addEmbed(
          new discord.Embed()
            .setTitle(utils.wrap(mediaTitles[0]))
            .setImage({
              size: ImageSize.Medium,
              url: media.images?.[0]?.url,
            }),
        );

      if (mention) {
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

        if (mention) {
          message
            .setContent(`<@${userId}>`)
            .setPing();
        }

        await message.patch(token);

        await utils.sleep(pull.rating.stars + 2);
      }

      message = search.characterMessage(pull.character, {
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
        message.addComponents([
          new discord.Component()
            .setId(quiet ? 'pull' : 'gacha', userId)
            .setLabel(`/${quiet ? 'pull' : 'gacha'}`),
        ]);
      }

      message.addComponents([
        new discord.Component()
          .setLabel('/character')
          .setId(
            `character`,
            `${pull.character.packId}:${pull.character.id}`,
            '1',
          ),
      ]);

      if (mention) {
        message
          .setContent(`<@${userId}>`)
          .setPing();
      }

      await message.patch(token);
    })
    .catch(async (err) => {
      if (err instanceof NoPullsError) {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              'You don\'t have any more pulls!',
            ),
          )
          .addEmbed(
            new discord.Embed()
              .setDescription(`_+1 pull <t:${err.rechargeTimestamp}:R>_`),
          )
          .patch(token);
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
  start,
};

export default gacha;
