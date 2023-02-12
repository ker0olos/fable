import {
  captureException,
} from 'https://raw.githubusercontent.com/timfish/sentry-deno/fb3c482d4e7ad6c4cf4e7ec657be28768f0e729f/src/mod.ts';

import { gql, request } from './graphql.ts';

import utils, { ImageSize } from './utils.ts';

import Rating from './rating.ts';

import config, { faunaUrl } from './config.ts';

import { characterMessage } from './search.ts';

import packs from './packs.ts';

import * as discord from './discord.ts';

import {
  Character,
  CharacterRole,
  Media,
  Mutation,
  PoolInfo,
} from './types.ts';

import { NoPullsError, PoolError } from './errors.ts';

export type Pull = {
  role?: CharacterRole;
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

async function forcePull(characterId: string): Promise<Pull> {
  const results = await packs.characters({ ids: [characterId] });

  if (!results.length) {
    throw new Error('404');
  }

  // aggregate the media by populating any references to other media/character objects
  const character = await packs.aggregate<Character>({ character: results[0] });

  const edge = character.media?.edges?.[0];

  if (!edge) {
    throw new Error('404');
  }

  const popularity = character.popularity || edge.node.popularity || lowest;

  return {
    pool: 1,
    character,
    media: edge.node,
    role: edge.role,
    popularityGreater: -1,
    popularityLesser: -1,
    popularityChance: -1,
    rating: new Rating({
      popularity,
      role: character.popularity ? undefined : edge.role,
    }),
  };
}

async function rngPull(userId?: string, guildId?: string): Promise<Pull> {
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

  const pool = await packs.pool({ range, role });

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

    const results = await packs.characters({
      ids: [characterId],
    });

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
      character: results[0],
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
    if (userId && guildId) {
      const mutation = gql`
        mutation (
          $userId: String!
          $guildId: String!
          $characterId: String!
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
              lastPull
            }
          }
        }
      `;

      const response = (await request<{
        addCharacterToInventory: Mutation;
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
          ...poolInfo,
        },
      })).addCharacterToInventory;

      if (!response.ok) {
        switch (response.error) {
          case 'CHARACTER_EXISTS':
            continue;
          case 'NO_PULLS_AVAILABLE':
            // deno-lint-ignore no-non-null-assertion
            throw new NoPullsError(response.inventory.lastPull!);
          default:
            throw new Error(response);
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
    ...poolInfo,
  };
}

/**
 * start the pull's animation
 */
function start(
  { token, userId, guildId, characterId, messageType }: {
    token: string;
    userId?: string;
    guildId?: string;
    channelId?: string;
    characterId?: string;
    messageType?: discord.MessageType;
  },
): discord.Message {
  const _ =
    (characterId
      ? gacha.forcePull(characterId)
      : gacha.rngPull(userId, guildId))
      .then(async (pull) => {
        const media = pull.media;

        const mediaTitles = packs.aliasToArray(media.title);

        let message = new discord.Message()
          .addEmbed(
            new discord.Embed()
              .setTitle(utils.wrap(mediaTitles[0]))
              .setImage({
                size: ImageSize.Medium,
                url: media.images?.[0].url,
              }),
          );

        await message.patch(token);

        await utils.sleep(4);

        message = new discord.Message()
          .addEmbed(
            new discord.Embed()
              .setImage({
                url: `${config.origin}/assets/stars/${pull.rating.stars}.gif`,
              }),
          );

        await message.patch(token);

        await utils.sleep(6);

        message = characterMessage(pull.character, {
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
              .setId('gacha', userId)
              .setLabel('/gacha'),
          ]);
        }

        message.addComponents([
          new discord.Component()
            // deno-lint-ignore no-non-null-assertion
            .setId(`collection`, userId!, '-1')
            .setLabel('/collection'),
        ]);

        await message.patch(token);
      })
      .catch(async (err) => {
        if (err instanceof NoPullsError) {
          return await new discord.Message()
            .addEmbed(
              new discord.Embed().setDescription(
                '**You don\'t have any pulls available!**',
              ),
            )
            .addEmbed(
              new discord.Embed()
                .setDescription(`Refill <t:${err.refillTimestamp}:R>`),
            )
            .patch(token);
        }

        if (!config.sentry) {
          throw err;
        }

        const refId = captureException(err);

        await discord.Message.internal(refId).patch(token);
      });

  const spinner = new discord.Message(messageType)
    .addEmbed(
      new discord.Embed().setImage(
        { url: `${config.origin}/assets/spinner.gif` },
      ),
    );

  return spinner;
}

const gacha = {
  lowest,
  variables,
  forcePull,
  rngPull,
  start,
};

export default gacha;
