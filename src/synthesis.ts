import { gql } from './graphql.ts';

import config from './config.ts';

import * as discord from './discord.ts';

import packs from './packs.ts';
import user from './user.ts';
import gacha from './gacha.ts';

import i18n from './i18n.ts';
import utils from './utils.ts';

import { Character, Schema } from './types.ts';

import { NonFetalError, PoolError } from './errors.ts';

async function getFilteredCharacters(
  { userId, guildId }: { userId: string; guildId: string },
): Promise<Schema.Character[]> {
  let { likes, party, characters } = await user.getUserCharacters({
    userId,
    guildId,
  });

  const partyIds = [
    party?.member1?.id,
    party?.member2?.id,
    party?.member3?.id,
    party?.member4?.id,
    party?.member5?.id,
  ];

  const likesIds = likes
    ?.map(({ characterId, mediaId }) => characterId ?? mediaId);

  characters = characters
    .filter(({ id, mediaId: _ }) =>
      // filter party members
      !partyIds.includes(id) &&
      // filter liked characters
      !likesIds?.some((likeId) => likeId === id)
      // !likesIds?.some((likeId) => likeId === id || likeId === mediaId)
    );

  return characters;
}

function getSacrifices(
  characters: Schema.Character[],
  target: number,
  locale?: discord.AvailableLocales,
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
  characters
    .toSorted((a, b) => a.rating - b.rating)
    .forEach((char) => {
      if (char.rating < target || target === 5) {
        split[char.rating === 5 ? 4 : char.rating].push(char);
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
      i18n.get(
        'merge-insufficient',
        locale,
        possibilities[target - 1].length,
        `${target}${discord.emotes.smolStar}`,
      ),
    );
  }

  return possibilities[target][0];
}

function characterPreview(
  character: Character,
  existing: Partial<Schema.Character>,
): discord.Embed {
  const image = existing?.image
    ? { url: existing?.image }
    : character.images?.[0];

  const media = character.media?.edges?.[0]?.node;

  const name = `${existing.rating}${discord.emotes.smolStar}${
    utils.wrap(existing?.nickname ?? packs.aliasToArray(character.name)[0])
  }`;

  const embed = new discord.Embed()
    .setThumbnail({
      preview: true,
      url: image?.url,
    });

  if (media) {
    embed.addField({
      name: utils.wrap(packs.aliasToArray(media.title)[0]),
      value: name,
    });
  } else {
    embed.setDescription(name);
  }

  return embed;
}

async function synthesize({ token, userId, guildId, target }: {
  token: string;
  userId: string;
  guildId: string;
  target: number;
}): Promise<discord.Message> {
  const locale = user.cachedUsers[userId]?.locale;

  if (!config.synthesis) {
    throw new NonFetalError(i18n.get('maintenance-merge', locale));
  }

  const message = new discord.Message();

  const characters = await synthesis.getFilteredCharacters({ userId, guildId });

  const sacrifices: Schema.Character[] = getSacrifices(
    characters,
    target,
    locale,
  ).sort((a, b) => b.rating - a.rating);

  // highlight the top characters
  const highlights = sacrifices
    .slice(0, 5);

  packs.characters({
    ids: highlights.map(({ id }) => id),
    guildId,
  })
    .then(async (highlightedCharacters) => {
      message.addEmbed(
        new discord.Embed().setDescription(
          i18n.get('merge-sacrifice', locale, sacrifices.length),
        ),
      );

      for (const existing of highlights) {
        const index = highlightedCharacters
          .findIndex((char) => existing.id === `${char.packId}:${char.id}`);

        if (index > -1) {
          const character = await packs.aggregate<Character>({
            character: highlightedCharacters[index],
            guildId,
          });

          const media = character?.media?.edges?.[0]?.node;

          if (
            packs.isDisabled(`${character.packId}:${character.id}`, guildId) ||
            (packs.isDisabled(existing.mediaId, guildId)) ||
            (media && packs.isDisabled(`${media.packId}:${media.id}`, guildId))
          ) {
            highlightedCharacters.splice(index, 1);
            continue;
          }

          message.addEmbed(
            synthesis.characterPreview(character, existing),
          );
        }
      }

      if (sacrifices.length - highlightedCharacters.length) {
        message.addEmbed(
          new discord.Embed().setDescription(
            `_+${sacrifices.length - highlightedCharacters.length} others..._`,
          ),
        );
      }

      await discord.Message.dialog({
        userId,
        message,
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
}: {
  token: string;
  userId: string;
  guildId: string;
  target: number;
}): discord.Message {
  const mutation = gql`
    mutation (
      $userId: String!
      $guildId: String!
      $characterId: String!
      $mediaId: String!
      $rating: Int!
      $sacrifices: [String!]!
    ) {
      replaceCharacters(
        userId: $userId
        guildId: $guildId
        characterId: $characterId
        sacrifices: $sacrifices
        mediaId: $mediaId
        rating: $rating
      ) {
        ok
        error
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

  const locale = user.cachedUsers[userId]?.locale;

  synthesis.getFilteredCharacters({ userId, guildId })
    .then(async (characters) => {
      const sacrifices = getSacrifices(characters, target, locale)
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

      return gacha.pullAnimation({
        token,
        guildId,
        userId,
        pull,
        components: false,
      });
    })
    .catch(async (err) => {
      if (err instanceof PoolError) {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get(
                'gacha-no-more-characters-left',
                locale,
                `${target}${discord.emotes.smolStar}`,
              ),
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

const synthesis = {
  getFilteredCharacters,
  getSacrifices,
  characterPreview,
  synthesize,
  confirmed,
};

export default synthesis;
