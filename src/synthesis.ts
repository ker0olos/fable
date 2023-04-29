import { gql } from './graphql.ts';

import config from './config.ts';

import * as discord from './discord.ts';

import packs from './packs.ts';

import user from './user.ts';

import gacha from './gacha.ts';

import utils from './utils.ts';

import { Schema } from './types.ts';

import { NonFetalError, NoPullsError, PoolError } from './errors.ts';

const synthesis = {
  getFilteredCharacters,
  getSacrifices,
  synthesize,
  confirmed,
};

async function getFilteredCharacters(
  { userId, guildId }: { userId: string; guildId: string },
): Promise<Schema.Character[]> {
  let { likes, party, characters } = await user.getUserCharacters({
    userId,
    guildId,
  });

  characters = characters
    .filter(({ id }) =>
      // filter liked characters
      !likes?.includes(id) &&
      // filter party members
      ![
        party?.member1?.id,
        party?.member2?.id,
        party?.member3?.id,
        party?.member4?.id,
        party?.member5?.id,
      ].includes(id)
    );

  return characters;
}

function getSacrifices(
  characters: Schema.Character[],
  target: number,
): Schema.Character[] {
  // I'm sure there is a faster way to do this with just math
  // but i am not smart enough to figure it out
  // the important thing is that all the tests pass

  const split: Record<number, Schema.Character[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  };

  // separate each rating into its own array
  characters.forEach((char) => {
    if (char.rating < target) {
      split[char.rating].push(char);
    }
  });

  const possibilities: Record<number, Schema.Character[][]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  };

  for (let i = 1; i <= target; i++) {
    // break if target is possible
    if (possibilities[target].length) {
      break;
    }

    if (i > 1) {
      // since we need 5 characters from the previous rating
      // to make a new rating
      // divide the length of characters by 5 then floor it
      // to get how many new characters are possible to make
      const length = Math.floor(possibilities[i - 1].length / 5);

      possibilities[i].push(
        // split the previous possibilities into arrays of 5
        ...utils.chunks(possibilities[i - 1], 5)
          // only use the required amount of chunks
          .slice(0, length)
          // flatten them so all of them are Character[] instead of Character[][]
          .map((t) => t.flat()),
      );
    }

    // add the current ratings to the possibilities list
    possibilities[i].push(...split[i].map((c) => [c]));
  }

  if (!possibilities[target].length) {
    throw new NonFetalError(
      `You don't have enough sacrifices for ${target}${discord.emotes.smolStar}`,
    );
  }

  return possibilities[target][0];
}

function synthesize({
  token,
  userId,
  guildId,
  target,
}: {
  token: string;
  userId: string;
  guildId: string;
  target: number;
}): discord.Message {
  if (!config.synthesis) {
    throw new NonFetalError(
      'Synthesis is under maintenance, try again later!',
    );
  }

  synthesis.getFilteredCharacters({ userId, guildId })
    .then(async (characters) => {
      const message = new discord.Message();

      const sacrifices: Schema.Character[] = getSacrifices(characters, target)
        .sort((a, b) => b.rating - a.rating);

      // highlight the first 5 characters
      const highlights = sacrifices.slice(0, 5);

      const highlightedCharacters = await packs.characters({
        ids: highlights.map(({ id }) => id),
        guildId,
      });

      const highlighted = highlights.map(({ rating, nickname, id }) => {
        const match = highlightedCharacters
          .find((char) => id === `${char.packId}:${char.id}`);

        if (match) {
          return `${rating}${discord.emotes.smolStar} ${
            nickname ?? utils.wrap(packs.aliasToArray(match.name)[0])
          } ${discord.emotes.remove}`;
        }
      }).filter(Boolean);

      if (sacrifices.length - highlighted.length) {
        highlighted.push(
          `+${
            sacrifices.length - highlighted.length
          } Others ${discord.emotes.remove}`,
        );
      }

      message.addEmbed(
        new discord.Embed().setDescription(
          `Sacrifice **${sacrifices.length}** characters`,
        ),
      );

      await discord.Message.dialog({
        userId,
        message,
        description: `${highlighted.join('\n')}`,
        confirm: ['synthesis', userId, `${target}`],
      })
        .patch(token);
    })
    .catch(async (err) => {
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

function confirmed({
  token,
  userId,
  guildId,
  target,
  channelId,
}: {
  token: string;
  userId: string;
  guildId: string;
  target: number;
  channelId: string;
}): discord.Message {
  const mutation = gql`
    mutation (
      $userId: String!
      $guildId: String!
      $characterId: String!
      $mediaId: String!
      $rating: Int!
      $pool: Int!
      $sacrifices: [String!]!
    ) {
      replaceCharacters(
        userId: $userId
        guildId: $guildId
        characterId: $characterId
        sacrifices: $sacrifices
        mediaId: $mediaId
        rating: $rating
        pool: $pool
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

  synthesis.getFilteredCharacters({ userId, guildId })
    .then(async (characters) => {
      const sacrifices = getSacrifices(characters, target)
        .map(({ id }) => id);

      const pull = await gacha.rngPull({
        userId,
        guildId,
        guarantee: target,
        mutation: {
          query: mutation,
          name: 'replaceCharacters',
        },
        extra: {
          sacrifices,
        },
      });

      return gacha.pullAnimation({ token, pull, channelId });
    })
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

      if (err instanceof PoolError) {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              `There are no more ${`${target}${discord.emotes.smolStar}`}characters left`,
            ),
          ).patch(token);
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

  const spinner = new discord.Message()
    .addEmbed(
      new discord.Embed().setImage(
        { url: `${config.origin}/assets/spinner.gif` },
      ),
    );

  return spinner;
}

export default synthesis;
