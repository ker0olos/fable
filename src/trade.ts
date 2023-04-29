import 'https://esm.sh/@total-typescript/ts-reset@0.4.2/filter-boolean';

import { gql, request } from './graphql.ts';

import search, { idPrefix } from './search.ts';

import packs from './packs.ts';

import config, { faunaUrl } from './config.ts';

import user from './user.ts';
import utils from './utils.ts';

import * as discord from './discord.ts';

import { Character, Schema } from './types.ts';

import { NonFetalCancelableError, NonFetalError } from './errors.ts';

function pre({
  token,
  userId,
  guildId,
  channelId,
  targetId,
  give,
  take,
}: {
  token: string;
  userId: string;
  guildId: string;
  channelId: string;
  targetId: string;
  give: string[];
  take: string[];
}): discord.Message {
  // trading with yourself
  if (userId === targetId) {
    return new discord.Message()
      .setFlags(discord.MessageFlags.Ephemeral)
      .addEmbed(
        new discord.Embed().setDescription(
          `You can\'t ${take.length ? 'trade with' : 'gift'} yourself.`,
        ),
      );
  }

  if (!config.trading) {
    throw new NonFetalError(
      'Trading is under maintenance, try again later!',
    );
  }

  Promise.all([
    ...give.map((char) =>
      packs.characters(
        char.startsWith(idPrefix)
          ? { ids: [char.substring(idPrefix.length)], guildId }
          : { search: char, guildId },
      ).then((results) => results[0])
    ),
    ...take.map((char) =>
      packs.characters(
        char.startsWith(idPrefix)
          ? { ids: [char.substring(idPrefix.length)], guildId }
          : { search: char, guildId },
      ).then((results) => results[0])
    ),
  ])
    // filter undefined results
    .then((results) => results.filter(Boolean))
    .then(async (results) => {
      const message = new discord.Message();

      if (results.length !== (give.length + take.length)) {
        throw new Error('404');
      }

      results = await Promise.all(
        results.map((character) =>
          packs.aggregate<Character>({
            guildId,
            character,
            end: 1,
          })
        ),
      );

      let giveCharacters = results.slice(0, give.length);
      let takeCharacters = results.slice(give.length);

      let t: Record<string, (typeof giveCharacters[0])> = {};

      // filter repeated characters
      giveCharacters = (
        giveCharacters.forEach((char) => {
          t[`${char.packId}:${char.id}`] = char;
        }), Object.values(t)
      );

      t = {};

      // filter repeated character
      takeCharacters = (
        takeCharacters.forEach((char) => {
          t[`${char.packId}:${char.id}`] = char;
        }), Object.values(t)
      );

      const giveNames = giveCharacters.map((char) =>
        packs.aliasToArray(char.name)[0]
      ).join(', ');

      const takeNames = takeCharacters.map((char) =>
        packs.aliasToArray(char.name)[0]
      ).join(', ');

      const giveIds = giveCharacters.map((char) => `${char.packId}:${char.id}`);
      const takeIds = takeCharacters.map((char) => `${char.packId}:${char.id}`);

      const [giveCollection, takeCollection] = await Promise.all([
        user.getUserCharacters({
          userId,
          guildId,
        }),
        take.length
          ? user.getUserCharacters({
            guildId,
            userId: targetId,
          })
          : undefined,
      ]);

      const giveLabels = giveCharacters.map((character) => {
        return packs.aliasToArray(character.name)[0];
      });

      const takeLabels = takeCharacters.map((character) => {
        return packs.aliasToArray(character.name)[0];
      });

      const giveEmbeds = giveCharacters.map((character) => {
        return search.characterEmbed(character, channelId, {
          footer: false,
          description: false,
          media: { title: true },
          mode: 'thumbnail',
        });
      });

      const takeEmbeds = takeCharacters.map((character) => {
        return search.characterEmbed(character, channelId, {
          footer: false,
          description: false,
          media: { title: true },
          mode: 'thumbnail',
        });
      });

      const giveParty: string[] = [
        giveCollection.party?.member1?.id,
        giveCollection.party?.member2?.id,
        giveCollection.party?.member3?.id,
        giveCollection.party?.member4?.id,
        giveCollection.party?.member5?.id,
      ]
        .filter(Boolean)
        .filter((id) => giveIds.includes(id));

      const giveFilter = giveParty.length
        ? giveParty
        : giveIds.filter((id) =>
          !giveCollection.characters.some((char) => char.id === id)
        );

      // const giveLiked = giveIds.filter((id) =>
      //   giveCollection.likes?.includes(id)
      // );

      const takeLiked = takeCollection
        ? takeIds.filter((id) => takeCollection.likes?.includes(id))
        : undefined;

      // not owned
      if (giveFilter.length) {
        giveFilter.forEach((characterId) => {
          const i = giveCharacters.findIndex(({ packId, id }) =>
            `${packId}:${id}` === characterId
          );

          message.addEmbed(
            new discord.Embed()
              .setDescription(
                giveParty.length
                  ? `${giveLabels[i]} is in your party and can\'t be traded`
                  : `You don't have ${giveLabels[i]}`,
              ),
          ).addEmbed(giveEmbeds[i]);
        });

        return await message.patch(token);
      }

      if (takeCollection) {
        const takeParty: string[] = [
          takeCollection.party?.member1?.id,
          takeCollection.party?.member2?.id,
          takeCollection.party?.member3?.id,
          takeCollection.party?.member4?.id,
          takeCollection.party?.member5?.id,
        ]
          .filter(Boolean)
          .filter((id) => takeIds.includes(id));

        const takeFilter = takeParty.length
          ? takeParty
          : takeIds.filter((id) => {
            return !takeCollection.characters.some((char) => char.id === id);
          });

        // not owned
        if (takeFilter.length) {
          takeFilter.forEach((characterId) => {
            const i = takeCharacters.findIndex(({ packId, id }) =>
              `${packId}:${id}` === characterId
            );

            message.addEmbed(
              new discord.Embed()
                .setDescription(
                  takeParty.length
                    ? `${
                      takeLabels[i]
                    } is in <@${targetId}>'s party and can't be traded`
                    : `<@${targetId}> doesn't have ${takeLabels[i]}`,
                ),
            ).addEmbed(takeEmbeds[i]);
          });

          return await message.patch(token);
        }

        takeEmbeds.forEach((embed) => {
          message.addEmbed(
            embed.addField({ value: `${discord.emotes.remove}` }),
          );
        });
      }

      giveEmbeds.forEach((embed) => {
        message.addEmbed(embed.addField({
          value: `${take.length ? discord.emotes.add : discord.emotes.remove}`,
        }));
      });

      if (takeCollection) {
        await discord.Message.dialog({
          userId,
          targetId,
          message: message.setContent(`<@${targetId}>`),
          description:
            `<@${userId}> is offering that you lose **${takeNames}** ${discord.emotes.remove} and get **${giveNames}** ${discord.emotes.add}`,
          confirm: [
            'trade',
            userId,
            targetId,
            giveIds.join('&'),
            takeIds.join('&'),
          ],
          confirmText: 'Accept',
          cancelText: 'Decline',
        }).patch(token);

        const followup = new discord.Message();

        // deno-lint-ignore no-non-null-assertion
        if (takeLiked!.length) {
          followup.addEmbed(new discord.Embed().setDescription(
            'You like some of those characters',
          ));
        }

        await followup
          .setContent(`<@${targetId}> you received an offer!`)
          .followup(token);
      } else {
        await discord.Message.dialog({
          userId,
          message,
          description:
            `Are you sure you want to give **${giveNames}** ${discord.emotes.remove} to <@${targetId}> for free?`,
          confirm: ['give', userId, targetId, giveIds.join('&')],
        }).patch(token);
      }
    })
    .catch(async (err) => {
      if (err.message === '404') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              'Some of those character do not exist or are disabled',
            ),
          ).patch(token);
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

async function give({
  userId,
  targetId,
  giveCharactersIds,
  guildId,
  channelId,
}: {
  userId: string;
  targetId: string;
  giveCharactersIds: string[];
  guildId: string;
  channelId: string;
}): Promise<[discord.Message, discord.Message]> {
  const mutation = gql`
    mutation (
      $userId: String!
      $targetId: String!
      $giveCharactersIds:[ String!]!
      $guildId: String!
    ) {
      giveCharacters(
        userId: $userId
        targetId: $targetId
        charactersIds: $giveCharactersIds
        guildId: $guildId
      ) {
        ok
        error
      }
    }
  `;

  const [results, response] = await Promise.all([
    packs.characters({ ids: giveCharactersIds, guildId }),
    request<{
      giveCharacters: Schema.Mutation;
    }>({
      url: faunaUrl,
      query: mutation,
      headers: {
        'authorization': `Bearer ${config.faunaSecret}`,
      },
      variables: {
        userId,
        targetId,
        giveCharactersIds,
        guildId,
      },
    }),
  ]);

  if (!response.giveCharacters.ok) {
    switch (response.giveCharacters.error) {
      case 'CHARACTER_IN_PARTY':
        throw new NonFetalCancelableError(
          'Some of those characters are currently in your party',
        );
      case 'CHARACTER_NOT_OWNED':
        throw new NonFetalCancelableError(
          'Some of those characters changed hands',
        );
      case 'CHARACTER_NOT_FOUND':
        throw new NonFetalCancelableError(
          'Some of those characters were disabled or removed',
        );
      default:
        throw new Error(response.giveCharacters.error);
    }
  }

  const updateMessage = new discord.Message();

  const newMessage = new discord.Message().setContent(`<@${targetId}>`);

  updateMessage.addEmbed(
    new discord.Embed().setDescription(`Gift sent to <@${targetId}>!`),
  );

  newMessage.addEmbed(
    new discord.Embed().setDescription(`<@${userId}> sent you a gift`),
  );

  const giveCharacters = await Promise.all(
    giveCharactersIds.map((characterId) =>
      packs.aggregate<Character>({
        guildId,
        character: results.find(({ packId, id }) =>
          `${packId}:${id}` === characterId
        ),
        end: 1,
      })
    ),
  );

  giveCharacters.forEach((character) => {
    const embed = search.characterEmbed(character, channelId, {
      rating: true,
      mode: 'thumbnail',
      footer: false,
      description: false,
      media: { title: true },
    }).addField({ value: `${discord.emotes.add}` });

    newMessage.addEmbed(embed);
  });

  return [updateMessage, newMessage];
}

async function accepted({
  userId,
  targetId,
  giveCharactersIds,
  takeCharactersIds,
  guildId,
  channelId,
}: {
  userId: string;
  targetId: string;
  giveCharactersIds: string[];
  takeCharactersIds: string[];
  guildId: string;
  channelId: string;
}): Promise<[discord.Message, discord.Message]> {
  const mutation = gql`
    mutation (
      $userId: String!
      $targetId: String!
      $giveCharactersIds: [String!]!
      $takeCharactersIds: [String!]!
      $guildId: String!
    ) {
      tradeCharacters(
        userId: $userId
        targetId: $targetId
        giveCharactersIds: $giveCharactersIds
        takeCharactersIds: $takeCharactersIds
        guildId: $guildId
      ) {
        ok
        error
      }
    }
  `;

  const [results, response] = await Promise.all([
    packs.characters({
      ids: [...giveCharactersIds, ...takeCharactersIds],
      guildId,
    }),
    request<{
      tradeCharacters: Schema.Mutation;
    }>({
      url: faunaUrl,
      query: mutation,
      headers: {
        'authorization': `Bearer ${config.faunaSecret}`,
      },
      variables: {
        userId,
        targetId,
        giveCharactersIds,
        takeCharactersIds,
        guildId,
      },
    }),
  ]);

  if (!response.tradeCharacters.ok) {
    switch (response.tradeCharacters.error) {
      case 'CHARACTER_IN_PARTY':
        throw new NonFetalCancelableError(
          'Some of those characters are currently in parties',
        );
      case 'CHARACTER_NOT_OWNED':
        throw new NonFetalCancelableError(
          'Some of those characters changed hands',
        );
      case 'CHARACTER_NOT_FOUND':
        throw new NonFetalCancelableError(
          'Some of those characters were disabled or removed',
        );
      default:
        throw new Error(response.tradeCharacters.error);
    }
  }

  const updateMessage = new discord.Message();

  const newMessage = new discord.Message().setContent(
    `<@${userId}> your offer was accepted!`,
  );

  updateMessage.setContent(`<@${userId}>`);

  updateMessage.addEmbed(
    new discord.Embed().setDescription(`<@${targetId}> accepted your offer`),
  );

  const giveCharacters = await Promise.all(
    giveCharactersIds.map((characterId) =>
      packs.aggregate<Character>({
        guildId,
        character: results.find(({ packId, id }) =>
          `${packId}:${id}` === characterId
        ),
        end: 1,
      })
    ),
  );

  const takeCharacters = await Promise.all(
    takeCharactersIds.map((characterId) =>
      packs.aggregate<Character>({
        guildId,
        character: results.find(({ packId, id }) =>
          `${packId}:${id}` === characterId
        ),
        end: 1,
      })
    ),
  );

  takeCharacters.forEach((character) => {
    const embed = search.characterEmbed(
      character,
      channelId,
      {
        rating: true,
        mode: 'thumbnail',
        footer: false,
        description: false,
        media: { title: true },
      },
    ).addField({ value: `${discord.emotes.add}` });

    updateMessage.addEmbed(embed);
  });

  giveCharacters.forEach((character) => {
    const embed = search.characterEmbed(
      character,
      channelId,
      {
        rating: true,
        mode: 'thumbnail',
        footer: false,
        description: false,
        media: { title: true },
      },
    ).addField({ value: `${discord.emotes.remove}` });

    updateMessage.addEmbed(embed);
  });

  return [updateMessage, newMessage];
}

const trade = {
  pre,
  give,
  accepted,
};

export default trade;
