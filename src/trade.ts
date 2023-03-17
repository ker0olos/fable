import { gql, request } from './graphql.ts';

import search, { idPrefix } from './search.ts';

import packs from './packs.ts';

import user from './user.ts';

import config, { faunaUrl } from './config.ts';

import utils from './utils.ts';

import * as discord from './discord.ts';

import { Character, Schema } from './types.ts';

import { NonFetalError } from './errors.ts';

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

      // TODO support trading more than 1-for-1

      const [
        giveCharacter,
        giveExisting,
        takeCharacter,
        takeExisting,
        // aggregate and find owner
      ] = await Promise.all([
        packs.aggregate<Character>({
          guildId,
          character: results[0],
          end: 1,
        }),
        user.findCharacter({
          guildId,
          characterId: `${results[0].packId}:${results[0].id}`,
        }),
        results[1]
          ? packs.aggregate<Character>({
            guildId,
            character: results[1],
            end: 1,
          })
          : Promise.resolve(undefined),
        results[1]
          ? user.findCharacter({
            guildId,
            characterId: `${results[1].packId}:${results[1].id}`,
          })
          : Promise.resolve(undefined),
      ]);

      const giveName = packs.aliasToArray(giveCharacter.name)[0];

      const takeName = takeCharacter
        ? packs.aliasToArray(takeCharacter.name)[0]
        : undefined;

      message.setContent(`<@${takeCharacter ? targetId : userId}>`);

      if (!giveExisting || giveExisting.userId !== userId) {
        const message = new discord.Message().addEmbed(
          new discord.Embed().setDescription(`You don't have **${giveName}**`),
        );

        message.addEmbed(search.characterEmbed(giveCharacter, {
          footer: false,
          description: false,
          media: { title: true },
          existing: giveExisting,
          mode: 'thumbnail',
        }));

        if (!giveExisting) {
          message.addEmbed(
            new discord.Embed().setDescription(
              `> _${giveName} hasn't been found by anyone yet_`,
            ),
          );
        }

        return await message.patch(token);
      }

      if (takeCharacter) {
        if (!takeExisting || takeExisting.userId !== targetId) {
          const message = new discord.Message().addEmbed(
            new discord.Embed().setDescription(
              `<@${targetId}> doesn't have **${takeName}**`,
            ),
          );

          message.addEmbed(search.characterEmbed(takeCharacter, {
            footer: false,
            description: false,
            media: { title: true },
            existing: takeExisting,
            mode: 'thumbnail',
          }));

          if (!takeExisting) {
            message.addEmbed(
              new discord.Embed().setDescription(
                `> _${takeName} hasn't been found by anyone yet_`,
              ),
            );
          }

          return await message.patch(token);
        }

        message.addEmbed(
          search.characterEmbed(takeCharacter, {
            footer: false,
            description: false,
            media: { title: true },
            mode: 'thumbnail',
          }).addField({ value: `${discord.emotes.remove}` }),
        );
      }

      message.addEmbed(
        search.characterEmbed(giveCharacter, {
          footer: false,
          description: false,
          media: { title: true },
          mode: 'thumbnail',
        }).addField({
          value: `${
            takeCharacter ? discord.emotes.add : discord.emotes.remove
          }`,
        }),
      );

      if (takeCharacter) {
        message.addEmbed(
          new discord.Embed().setDescription(
            `<@${userId}> is offering that you lose **${takeName}** ${discord.emotes.remove} and get **${giveName}** ${discord.emotes.add}`,
          ),
        );

        message.addComponents([
          new discord.Component().setId(
            'trade',
            userId,
            targetId,
            `${giveCharacter.packId}:${giveCharacter.id}`,
            `${takeCharacter.packId}:${takeCharacter.id}`,
          )
            .setLabel('Accept'),
          new discord.Component().setId('cancel', userId, targetId)
            .setStyle(discord.ButtonStyle.Red)
            .setLabel('Decline'),
        ]);
      } else {
        message.addEmbed(
          new discord.Embed().setDescription(
            `Are you sure you want to give **${giveName}** ${discord.emotes.remove} to <@${targetId}> for free?`,
          ),
        );

        message.addComponents([
          new discord.Component().setId(
            'gift',
            userId,
            targetId,
            `${giveCharacter.packId}:${giveCharacter.id}`,
          )
            .setLabel('Confirm'),
          new discord.Component().setId('cancel', userId)
            .setStyle(discord.ButtonStyle.Red)
            .setLabel('Cancel'),
        ]);
      }

      await message.patch(token);
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

async function gift({
  userId,
  targetId,
  giveCharacterId,
  guildId,
}: {
  userId: string;
  targetId: string;
  giveCharacterId: string;
  guildId: string;
}): Promise<discord.Message> {
  const mutation = gql`
    mutation (
      $userId: String!
      $targetId: String!
      $giveCharacterId: String!
      $guildId: String!
    ) {
      giveCharacters(
        userId: $userId
        targetId: $targetId
        giveCharacterId: $giveCharacterId
        guildId: $guildId
      ) {
        ok
        error
      }
    }
  `;

  const [results, response] = await Promise.all([
    packs.characters({ ids: [giveCharacterId], guildId }),
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
        giveCharacterId,
        guildId,
      },
    }),
  ]);

  if (!response.giveCharacters.ok) {
    switch (response.giveCharacters.error) {
      case 'CHARACTER_NOT_FOUND':
        throw new NonFetalError('This character was deleted!');
      case 'CHARACTER_NOT_OWNED':
        throw new NonFetalError('This character already changed hands!');
      default:
        throw new Error(response.giveCharacters.error);
    }
  }

  const message = new discord.Message();

  message.setContent(`<@${targetId}>`);

  message.addEmbed(
    new discord.Embed().setDescription(`<@${userId}> sent you a gift`),
  );

  const embed = search.characterEmbed(results[0], {
    rating: true,
    mode: 'thumbnail',
    footer: false,
    description: false,
    media: {
      title: false,
    },
  }).addField({ value: `${discord.emotes.add}` });

  return message.addEmbed(embed);
}

async function accepted({
  userId,
  targetId,
  giveCharacterId,
  takeCharacterId,
  guildId,
}: {
  userId: string;
  targetId: string;
  giveCharacterId: string;
  takeCharacterId: string;
  guildId: string;
}): Promise<discord.Message> {
  const mutation = gql`
    mutation (
      $userId: String!
      $targetId: String!
      $giveCharacterId: String!
      $takeCharacterId: String!
      $guildId: String!
    ) {
      tradeCharacters(
        userId: $userId
        targetId: $targetId
        giveCharacterId: $giveCharacterId
        takeCharacterId: $takeCharacterId
        guildId: $guildId
      ) {
        ok
        error
      }
    }
  `;

  const [results, response] = await Promise.all([
    packs.characters({ ids: [giveCharacterId, takeCharacterId], guildId }),
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
        giveCharacterId,
        takeCharacterId,
        guildId,
      },
    }),
  ]);

  if (!response.tradeCharacters.ok) {
    switch (response.tradeCharacters.error) {
      case 'CHARACTER_NOT_FOUND':
        throw new NonFetalError('This character was deleted!');
      case 'CHARACTER_NOT_OWNED':
        throw new NonFetalError('This character already changed hands!');
      default:
        throw new Error(response.tradeCharacters.error);
    }
  }

  const message = new discord.Message();

  message.setContent(`<@${userId}>`);

  message.addEmbed(
    new discord.Embed().setDescription(`<@${targetId}> accepted your offer`),
  );

  const take = search.characterEmbed(
    // deno-lint-ignore no-non-null-assertion
    results.find(({ packId, id }) => `${packId}:${id}` === takeCharacterId)!,
    {
      rating: true,
      mode: 'thumbnail',
      footer: false,
      description: false,
      media: {
        title: false,
      },
    },
  ).addField({ value: `${discord.emotes.add}` });

  const give = search.characterEmbed(
    // deno-lint-ignore no-non-null-assertion
    results.find(({ packId, id }) => `${packId}:${id}` === giveCharacterId)!,
    {
      rating: true,
      mode: 'thumbnail',
      footer: false,
      description: false,
      media: {
        title: false,
      },
    },
  ).addField({ value: `${discord.emotes.remove}` });

  return message.addEmbed(take).addEmbed(give);
}

const trade = {
  pre,
  gift,
  accepted,
};

export default trade;
