import { gql, request } from './graphql.ts';

import config, { faunaUrl } from './config.ts';

import packs from './packs.ts';

import { default as srch } from './search.ts';

import user from './user.ts';
import synthesis from './synthesis.ts';

import utils from './utils.ts';

import * as discord from './discord.ts';

import { Character, DisaggregatedCharacter, Schema } from './types.ts';

import { NonFetalError } from './errors.ts';

const BOOST_FACTOR = 0.02;

function getInactiveDays(inventory?: Partial<Schema.Inventory>): number {
  const lastPull = inventory?.lastPull
    ? new Date(inventory.lastPull)
    : undefined;

  return !lastPull
    ? Number.MAX_SAFE_INTEGER
    : utils.diffInDays(new Date(), lastPull);
}

function getChances(character: Schema.Character): number {
  let chance = 0;

  switch (character.rating) {
    case 5:
      chance = 1;
      break;
    case 4:
      chance = 5;
      break;
    case 3:
      chance = 15;
      break;
    case 2:
      chance = 25;
      break;
    case 1:
      chance = 50;
      break;
    default:
      break;
  }

  const inactiveDays = getInactiveDays(character.inventory);

  if (inactiveDays >= 14) {
    chance += 50;
  } else if (inactiveDays >= 7) {
    chance += 25;
  } else if (inactiveDays >= 1) {
    chance += 5;
  }

  return chance;
}

async function getCooldown({ userId, guildId }: {
  userId: string;
  guildId: string;
}): Promise<number> {
  const query = gql`
    query ($userId: String!, $guildId: String!) {
      getUserInventory(userId: $userId, guildId: $guildId) {
        stealTimestamp
      }
    }
  `;

  const { getUserInventory: { stealTimestamp } } = await request<{
    getUserInventory: Schema.Inventory;
  }>({
    query,
    url: faunaUrl,
    headers: {
      'authorization': `Bearer ${config.faunaSecret}`,
    },
    variables: {
      userId,
      guildId,
    },
  });

  const parsed = new Date(stealTimestamp ?? new Date());

  return parsed.getTime();
}

function getSacrifices(characters: Schema.Character[], target: number): {
  sum: number;
  sacrifices: Schema.Character[];
} {
  if (characters.length === 0) {
    return {
      sum: 0,
      sacrifices: [],
    };
  }

  // create all possible ways to reach the exact target

  const hashMap: Record<number, Schema.Character> = {};

  const results = [];

  for (let i = 0; i < characters.length; i++) {
    const { rating } = characters[i];

    if (hashMap[rating]) {
      results.push([hashMap[rating], characters[i]]);
    } else {
      hashMap[target - rating] = characters[i];
    }
  }

  // if there are possibilities
  if (results.length > 0) {
    return {
      sum: target,
      // pick the largest possibility
      sacrifices: results.reduce((prev, next) =>
        prev.length > next.length ? prev : next
      ).sort((a, b) => b.rating - a.rating),
    };
  }

  // fallback return the a mix of character from lowest to highest
  // until you reach the closest you can to target

  let curr = 0;

  const sacrifices: Schema.Character[] = [];

  for (
    // 1 -> 5
    const char of characters
      .toSorted((a, b) => a.rating - b.rating)
  ) {
    if (curr + char.rating > target) {
      break;
    }

    curr += char.rating;

    sacrifices.push(char);
  }

  return {
    sum: curr,
    sacrifices: sacrifices
      .sort((a, b) => b.rating - a.rating),
  };
}

function pre({
  token,
  userId,
  guildId,
  channelId,
  stars,
  search,
  id,
}: {
  token: string;
  userId: string;
  guildId: string;
  channelId: string;
  stars: number;
  search?: string;
  id?: string;
}): discord.Message {
  if (!config.stealing) {
    throw new NonFetalError('Stealing is under maintenance, try again later!');
  }

  packs
    .characters(id ? { ids: [id], guildId } : { search, guildId })
    .then((results: (Character | DisaggregatedCharacter)[]) => {
      if (!results.length) {
        throw new Error('404');
      }

      return Promise.all([
        getCooldown({
          userId,
          guildId,
        }),
        packs.aggregate<Character>({
          guildId,
          character: results[0],
          end: 1,
        }),
        user.findCharacter({
          guildId,
          characterId: `${results[0].packId}:${results[0].id}`,
        }),
      ]);
    })
    .then(([cooldown, character, existing]) => {
      const message = new discord.Message();

      const characterId = `${character.packId}:${character.id}`;

      const characterName = packs.aliasToArray(character.name)[0];

      if (cooldown > Date.now()) {
        throw new NonFetalError(
          `Steal is on cooldown, try again <t:${
            Math.floor(cooldown / 1000).toString()
          }:R>`,
        );
      }

      if (!existing) {
        message.addEmbed(
          new discord.Embed().setDescription(
            `**${characterName}** has not been found by anyone`,
          ),
        );

        message.addEmbed(srch.characterEmbed(character, channelId, {
          footer: false,
          mode: 'thumbnail',
          description: false,
          media: { title: true },
        }));

        return message.patch(token);
      }

      const party = [
        existing.inventory?.party?.member1?.id,
        existing.inventory?.party?.member2?.id,
        existing.inventory?.party?.member3?.id,
        existing.inventory?.party?.member4?.id,
        existing.inventory?.party?.member5?.id,
      ];

      if (existing.user.id === userId) {
        throw new NonFetalError('You can\'t steal from yourself!');
      }

      if (party.includes(characterId)) {
        const inactiveDays = getInactiveDays(existing.inventory);

        if (inactiveDays <= 4) {
          message.addEmbed(
            new discord.Embed().setDescription(
              `As part of <@${existing?.user.id}>'s party, **${characterName}** cannot be stolen while <@${existing?.user.id}> is still active`,
            ),
          );

          message.addEmbed(srch.characterEmbed(character, channelId, {
            footer: true,
            mode: 'thumbnail',
            description: false,
            media: { title: true },
            existing: { rating: existing?.rating },
          }));

          return message.patch(token);
        }
      }

      message.addEmbed(
        srch.characterEmbed(character, channelId, {
          footer: true,
          rating: false,
          mode: 'thumbnail',
          description: false,
          media: { title: true },
          existing: {
            mediaId: existing?.mediaId,
          },
        })
          .setDescription(`<@${existing?.user.id}>`),
      );

      const chance = getChances(existing);

      message.addEmbed(
        new discord.Embed().setDescription(
          stars > 0
            ? '_Continue to see your chance of success_'
            : `Your chance of success is **${chance.toFixed(2)}%**`,
        ),
      );

      return discord.Message.dialog({
        userId,
        message,
        confirmText: stars > 0 ? 'Continue' : 'Attempt',
        confirm: [
          stars > 0 ? 'bsteal' : 'steal',
          userId,
          characterId,
          `${chance}`,
          `${stars}`,
        ],
      }).patch(token);
    })
    .catch(async (err) => {
      if (err.message === '404') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              'Found _nothing_ matching that query!',
            ),
          ).patch(token);
      }

      if (err instanceof NonFetalError) {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed()
              .setDescription(err.message),
          )
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

function sacrifices({
  token,
  userId,
  guildId,
  characterId,
  channelId,
  stars,
  pre,
}: {
  token: string;
  userId: string;
  guildId: string;
  channelId: string;
  stars: number;
  characterId: string;
  pre: number;
}): discord.Message {
  synthesis.getFilteredCharacters({ userId, guildId })
    .then(async (characters) => {
      const missing = 100 - pre;

      const message = new discord.Message();

      // makes sure that we don't sacrifice more characters than needed to get a 100% chance
      stars = Math.min(Math.round(missing / BOOST_FACTOR), stars);

      const { sacrifices, sum } = getSacrifices(characters, stars);

      const boost = sum * BOOST_FACTOR;

      // highlight the top characters
      const highlights = sacrifices.slice(0, 5);

      const highlightedCharacters = await packs.characters({
        ids: highlights.map(({ id }) => id),
        guildId,
      });

      if (!sacrifices.length) {
        message.addEmbed(
          new discord.Embed().setDescription(
            '**You don\'t have any characters to sacrifice**',
          ),
        );
      } else {
        message.addEmbed(
          new discord.Embed().setDescription(
            `Sacrifice **${sacrifices.length}** characters?`,
          ),
        );

        await Promise.all(highlights.map(async (existing) => {
          const match = highlightedCharacters
            .find((char) => existing.id === `${char.packId}:${char.id}`);

          if (match) {
            const character = await packs.aggregate<Character>({
              character: match,
              guildId,
            });

            message.addEmbed(
              synthesis.characterPreview(character, existing, channelId),
            );
          }
        }));

        if (sacrifices.length - highlightedCharacters.length) {
          message.addEmbed(
            new discord.Embed().setDescription(
              `_+${
                sacrifices.length - highlightedCharacters.length
              } others..._`,
            ),
          );
        }
      }

      message.addEmbed(
        new discord.Embed().setDescription(
          `Your chance of success is **${(pre + boost).toFixed(2)}%**`,
        ),
      );

      await discord.Message.dialog({
        userId,
        message,
        confirmText: 'Attempt',
        confirm: [
          'steal',
          userId,
          characterId,
          `${pre}`,
          `${sum}`,
        ],
      })
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

function attempt({
  token,
  userId,
  guildId,
  characterId,
  channelId,
  stars,
  pre,
}: {
  token: string;
  userId: string;
  guildId: string;
  characterId: string;
  channelId: string;
  stars: number;
  pre: number;
}): discord.Message {
  const mutation = gql`
    mutation ($userId: String!, $guildId: String!, $characterId: String!, $sacrifices: [String!]!) {
      stealCharacter(
        userId: $userId
        guildId: $guildId
        characterId: $characterId
        sacrifices: $sacrifices
      ) {
        ok
        error
        inventory {
          stealTimestamp
        }
        character {
          id
          image
          nickname
          mediaId
          rating
          user {
            id
          }
        }
      }
    }
  `;

  Promise.all([
    packs.characters({ ids: [characterId], guildId }),
    user.findCharacter({
      guildId,
      characterId,
    }),
    stars > 0
      ? synthesis.getFilteredCharacters({ userId, guildId })
      : Promise.resolve([]),
  ])
    .then(async ([results, existing, characters]) => {
      const message = new discord.Message();

      const character = await packs.aggregate<Character>({
        guildId,
        character: results[0],
        end: 1,
      });

      const characterName = packs.aliasToArray(character.name)[0];

      if (!existing) {
        message.addEmbed(
          new discord.Embed().setDescription(
            `**${characterName}** has not been found by anyone`,
          ),
        );

        return message.patch(token);
      }

      const chance = getChances(existing);

      const { sacrifices, sum } = getSacrifices(characters, stars);

      const boost = sum * BOOST_FACTOR;

      const final = chance + boost;

      // make sure that the chance the user confirmed to attempt
      // was not altered since the initial steal dialog
      if (pre > final) {
        throw new NonFetalError(
          `Something happened and affected your chances of stealing **${characterName}**, try again to get up-to-date data!`,
        );
      }

      const success = utils.getRandomFloat() <= (final / 100);

      // delay to build up anticipation
      await utils.sleep(8);

      // failed
      if (!success) {
        const mutation = gql`
          mutation ($userId: String!, $guildId: String!, $sacrifices: [String!]!) {
            failSteal(userId: $userId, guildId: $guildId, sacrifices: $sacrifices) {
              ok
              inventory {
                stealTimestamp
              }
            }
          }
        `;

        const response = await request<{
          failSteal: Schema.Mutation;
        }>({
          url: faunaUrl,
          query: mutation,
          headers: {
            'authorization': `Bearer ${config.faunaSecret}`,
          },
          variables: {
            userId,
            guildId,
            sacrifices: sacrifices.map(({ id }) => id),
          },
        });

        if (!response.failSteal.ok) {
          throw new Error('failSteal() failed');
        }

        message.addEmbed(
          new discord.Embed().setDescription(
            '**You Failed!**',
          ),
        );

        message.addEmbed(
          new discord.Embed().setDescription(
            `You can try again <t:${
              utils.stealTimestamp(response.failSteal.inventory.stealTimestamp)
            }:R>`,
          ),
        );

        return message.patch(token);
      }

      const response = await request<{
        stealCharacter: Schema.Mutation;
      }>({
        url: faunaUrl,
        query: mutation,
        headers: {
          'authorization': `Bearer ${config.faunaSecret}`,
        },
        variables: {
          userId,
          characterId,
          guildId,
          sacrifices: sacrifices.map(({ id }) => id),
        },
      });

      if (!response.stealCharacter.ok) {
        switch (response.stealCharacter.error) {
          case 'ON_COOLDOWN':
            throw new NonFetalError(
              `Steal is on cooldown, try again <t:${
                utils.stealTimestamp(
                  response.stealCharacter.inventory.stealTimestamp,
                )
              }:R>`,
            );
          case 'CHARACTER_NOT_FOUND':
            throw new NonFetalError(
              'Some of those characters were disabled or removed',
            );
          default:
            throw new Error(response.stealCharacter.error);
        }
      }

      message.addEmbed(new discord.Embed().setDescription('**You Succeed!**'));

      message.addEmbed(
        srch.characterEmbed(character, channelId, {
          footer: false,
          mode: 'thumbnail',
          description: false,
          media: { title: true },
          existing: {
            rating: existing?.rating,
            mediaId: existing?.mediaId,
          },
        }).addField({
          value: `${discord.emotes.add}`,
        }),
      );

      message.patch(token);

      return new discord.Message()
        .setContent(`<@${existing?.user.id}>`)
        .addEmbed(
          new discord.Embed().setDescription(
            `**${characterName}** was stolen from you!`,
          ),
        )
        .addEmbed(
          srch.characterEmbed(character, channelId, {
            footer: false,
            mode: 'thumbnail',
            description: false,
            media: { title: true },
            existing: {
              rating: existing?.rating,
              mediaId: existing?.mediaId,
            },
          }).addField({
            value: `${discord.emotes.remove}`,
          }),
        )
        .followup(token);
    })
    .catch(async (err) => {
      if (err instanceof NonFetalError) {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed()
              .setDescription(err.message),
          )
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
        { url: `${config.origin}/assets/steal.gif` },
      ),
    );

  return loading;
}

const steal = {
  pre,
  attempt,
  sacrifices,
  getChances,
};

export default steal;
