import { gql, request } from './graphql.ts';

import search, { idPrefix } from './search.ts';

import packs from './packs.ts';

import user from './user.ts';

import config, { faunaUrl } from './config.ts';

import utils from './utils.ts';

import * as discord from './discord.ts';

import { Character, Schema } from './types.ts';

import { NonFetalCancelableError } from './errors.ts';

function pre({
  token,
  userId,
  guildId,
  targetId,
  give,
  take,
}: {
  token: string;
  userId: string;
  guildId: string;
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
          'You can\'t trade with yourself.',
        ),
      );
  }

  Promise.all([
    // TODO optimize this to lower the number of external requests
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

      results = await Promise.all(
        results.map((character) =>
          packs.aggregate<Character>({
            guildId,
            character,
            end: 1,
          })
        ),
      );

      const [giveOwnership, takeOwnership] = await Promise.all([
        user.verifyCharacters({
          charactersIds: giveIds,
          guildId,
          userId,
        }),
        take.length
          ? user.verifyCharacters({
            guildId,
            userId: targetId,
            charactersIds: takeIds,
          })
          : undefined,
      ]);

      const giveEmbeds = giveCharacters.map((character) => {
        return search.characterEmbed(character, {
          footer: false,
          description: false,
          media: { title: true },
          mode: 'thumbnail',
        });
      });

      const takeEmbeds = takeCharacters.map((character) => {
        return search.characterEmbed(character, {
          footer: false,
          description: false,
          media: { title: true },
          mode: 'thumbnail',
        });
      });

      switch (giveOwnership) {
        case 'NOT_OWNED': {
          const message = new discord.Message().addEmbed(
            new discord.Embed().setDescription(
              `You don't have **${giveNames}**`,
            ),
          );

          giveEmbeds.forEach((embed) => message.addEmbed(embed));

          return await message.patch(token);
        }
        case 'NOT_FOUND': {
          message.addEmbed(
            new discord.Embed().setDescription(
              `_${giveNames} hasn't been found by anyone yet_`,
            ),
          );

          giveEmbeds.forEach((embed) => message.addEmbed(embed));

          return await message.patch(token);
        }
        default:
          break;
      }

      if (take.length) {
        // deno-lint-ignore no-non-null-assertion
        switch (takeOwnership!) {
          case 'NOT_OWNED': {
            const message = new discord.Message().addEmbed(
              new discord.Embed().setDescription(
                `<@${targetId}> doesn't have **${takeNames}**`,
              ),
            );

            takeEmbeds.forEach((embed) => message.addEmbed(embed));

            return await message.patch(token);
          }
          case 'NOT_FOUND': {
            message.addEmbed(
              new discord.Embed().setDescription(
                `_${takeNames} hasn't been found by anyone yet_`,
              ),
            );

            takeEmbeds.forEach((embed) => message.addEmbed(embed));

            return await message.patch(token);
          }
          default:
            break;
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

      if (take.length) {
        message.addEmbed(
          new discord.Embed().setDescription(
            `<@${userId}> is offering that you lose **${takeNames}** ${discord.emotes.remove} and get **${giveNames}** ${discord.emotes.add}`,
          ),
        );

        message.addComponents([
          new discord.Component().setId(
            'trade',
            userId,
            targetId,
            giveIds.join('&'),
            takeIds.join('&'),
          )
            .setLabel('Accept'),
          new discord.Component().setId('cancel', userId, targetId)
            .setStyle(discord.ButtonStyle.Red)
            .setLabel('Decline'),
        ]);

        await message
          .setContent(`<@${targetId}>`)
          .patch(token);

        await new discord.Message()
          .setContent(`<@${targetId}> you received an offer!`)
          .followup(token);
      } else {
        message.addEmbed(
          new discord.Embed().setDescription(
            `Are you sure you want to give **${giveNames}** ${discord.emotes.remove} to <@${targetId}> for free?`,
          ),
        );

        message.addComponents([
          new discord.Component().setId(
            'give',
            userId,
            targetId,
            giveIds.join('&'),
          )
            .setLabel('Confirm'),
          new discord.Component().setId('cancel', userId)
            .setStyle(discord.ButtonStyle.Red)
            .setLabel('Cancel'),
        ]);

        await message.patch(token);
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
}: {
  userId: string;
  targetId: string;
  giveCharactersIds: string[];
  guildId: string;
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
    const embed = search.characterEmbed(character, {
      rating: true,
      mode: 'thumbnail',
      footer: false,
      description: false,
      media: { title: true },
    }).addField({ value: `${discord.emotes.add}` });

    updateMessage.addEmbed(embed);
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
}: {
  userId: string;
  targetId: string;
  giveCharactersIds: string[];
  takeCharactersIds: string[];
  guildId: string;
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
      case 'CHARACTER_NOT_FOUND':
      case 'CHARACTER_NOT_OWNED':
        throw new NonFetalCancelableError(
          'You don\'t have one of those characters!',
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
