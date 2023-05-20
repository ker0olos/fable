import { gql, request } from './graphql.ts';

import config, { faunaUrl } from './config.ts';

import packs from './packs.ts';

import { default as srch } from './search.ts';

import user from './user.ts';

import utils from './utils.ts';

import * as discord from './discord.ts';

import { Character, DisaggregatedCharacter, Schema } from './types.ts';

import { NonFetalError } from './errors.ts';

function getChances(character: Schema.Character): number {
  let chance = 0;

  switch (character.rating) {
    case 5:
      chance = 1;
      break;
    case 4:
      chance = 4;
      break;
    case 3:
      chance = 14;
      break;
    case 2:
      chance = 24;
      break;
    case 1:
      chance = 49;
      break;
    default:
      break;
  }

  const lastPull = character.inventory?.lastPull
    ? new Date(character.inventory.lastPull)
    : new Date();

  const inactiveDays = utils.diffInDays(new Date(), lastPull);

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

async function pre({
  token,
  userId,
  guildId,
  channelId,
  search,
  id,
}: {
  token: string;
  userId: string;
  guildId: string;
  channelId: string;
  search?: string;
  id?: string;
}): Promise<discord.Message> {
  if (!config.stealing) {
    throw new NonFetalError('Stealing is under maintenance, try again later!');
  }

  const cooldown = await getCooldown({
    userId,
    guildId,
  });

  if (cooldown > Date.now()) {
    throw new NonFetalError(
      `Steal is on cooldown, try again <t:${
        Math.floor(cooldown / 1000).toString()
      }:R>`,
    );
  }

  packs
    .characters(id ? { ids: [id], guildId } : { search, guildId })
    .then((results: (Character | DisaggregatedCharacter)[]) => {
      if (!results.length) {
        throw new Error('404');
      }

      return Promise.all([
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
    .then(([character, existing]) => {
      const message = new discord.Message();

      const characterId = `${character.packId}:${character.id}`;

      const characterName = packs.aliasToArray(character.name)[0];

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

      const chance = getChances(existing);

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
        message.addEmbed(
          new discord.Embed().setDescription(
            `As part of <@${existing?.user.id}>'s party, **${characterName}** cannot be stolen`,
          ),
        );

        message.addEmbed(srch.characterEmbed(character, channelId, {
          footer: true,
          mode: 'thumbnail',
          description: false,
          media: { title: true },
          existing: { rating: existing?.rating },
        }));

        return message.setPing().patch(token);
      }

      message.addEmbed(srch.characterEmbed(character, channelId, {
        footer: true,
        mode: 'thumbnail',
        description: true,
        media: { title: true },
        existing,
      }));

      message.addEmbed(
        new discord.Embed().setDescription(
          `Your chance to succeed is: **${chance}%**`,
        ),
      );

      return discord.Message.dialog({
        userId,
        message,
        confirmText: 'Attempt',
        confirm: ['steal', userId, characterId, `${chance}`],
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

function attempt({
  token,
  userId,
  guildId,
  characterId,
  channelId,
  pre,
}: {
  token: string;
  userId: string;
  guildId: string;
  characterId: string;
  channelId: string;
  pre: number;
}): discord.Message {
  const mutation = gql`
    mutation ($userId: String!, $guildId: String!, $characterId: String!) {
      stealCharacter(userId: $userId, guildId: $guildId, characterId: $characterId) {
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
  ])
    .then(async ([results, existing]) => {
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

      // make sure that the chance the user confirmed to attempt
      // was not altered since the initial steal dialog
      if (pre > chance) {
        throw new NonFetalError(
          `Something happened and affected your chances of stealing **${characterName}**, try again to get up-to-date data!`,
        );
      }

      const { value } = utils.rng(
        { [100 - chance]: false, [chance]: true },
      );

      // delay to build up anticipation
      await utils.sleep(8);

      // failed
      if (!value) {
        const mutation = gql`
          mutation ($userId: String!, $guildId: String!) {
            failSteal(userId: $userId, guildId: $guildId) {
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
          case 'CHARACTER_IN_PARTY':
            throw new NonFetalError(
              'Character is currently in a party',
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

      message.addEmbed(srch.characterEmbed(character, channelId, {
        footer: true,
        mode: 'thumbnail',
        description: true,
        media: { title: true },
        existing: {
          rating: existing?.rating,
          mediaId: existing?.mediaId,
        },
      }));

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
  getChances,
};

export default steal;
