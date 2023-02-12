import { gql, request } from './graphql.ts';

import config, { faunaUrl } from './config.ts';

import { characterMessage } from './search.ts';

import utils from './utils.ts';

import packs from './packs.ts';

import * as discord from './discord.ts';

import { Character, DisaggregatedCharacter, Inventory } from './types.ts';

import Rating from './rating.ts';

export async function now({
  userId,
  guildId,
}: {
  userId: string;
  guildId: string;
  channelId: string;
}): Promise<discord.Message> {
  const query = gql`
    query ($userId: String!, $guildId: String!) {
      getUserInventory(userId: $userId, guildId: $guildId) {
        lastPull
        availablePulls
      }
    }
  `;

  const message = new discord.Message();

  const { availablePulls, lastPull } = (await request<{
    getUserInventory: Inventory;
  }>({
    url: faunaUrl,
    query,
    headers: {
      'authorization': `Bearer ${config.faunaSecret}`,
    },
    variables: {
      userId,
      guildId,
    },
  })).getUserInventory;

  message.addAttachment({
    arrayBuffer: await utils.text(availablePulls),
    filename: 'pulls.png',
    type: 'image/png',
  });

  message.addEmbed(
    new discord.Embed()
      .setImage({ url: `attachment://pulls.png` })
      .setFooter({ text: 'Available Pulls' }),
  );

  if (availablePulls > 0) {
    message.addComponents([
      // `/gacha` shortcut
      new discord.Component()
        .setId('gacha', userId)
        .setLabel('/gacha'),
      // `/collections` shortcut
      new discord.Component()
        .setId('collection', userId, '0')
        .setLabel('/collection'),
    ]);
  } else {
    // if user has no pulls
    // inform display the refill timestamp in the same message

    message.addEmbed(
      new discord.Embed()
        .setDescription(
          // deno-lint-ignore no-non-null-assertion
          `Refill <t:${utils.lastPullToRefillTimestamp(lastPull!)}:R>`,
        ),
    );
  }

  return message;
}

export async function collection({
  userId,
  guildId,
  page,
}: {
  userId: string;
  guildId: string;
  channelId: string;
  page?: number;
}): Promise<discord.Message> {
  page = page ?? 0;

  const query = gql`
    query ($userId: String!, $guildId: String!) {
      getUserInventory(userId: $userId, guildId: $guildId) {
        characters {
          id
        }
      }
    }
  `;

  const { characters } = (await request<{
    getUserInventory: Inventory;
  }>({
    url: faunaUrl,
    query,
    headers: {
      'authorization': `Bearer ${config.faunaSecret}`,
    },
    variables: {
      userId,
      guildId,
    },
  })).getUserInventory;

  if (!characters?.length) {
    return new discord.Message()
      .addEmbed(
        new discord.Embed()
          .setDescription('You don\'t have any characters'),
      )
      .addComponents([
        // `/gacha` shortcut
        new discord.Component()
          .setId('gacha', userId)
          .setLabel('/gacha'),
      ]);
  }

  const results: (Character | DisaggregatedCharacter)[] = await packs
    .characters({ ids: characters.slice(page).map((c) => c.id) });

  let message: discord.Message;

  if (!results.length) {
    message = new discord.Message()
      .addEmbed(
        new discord.Embed()
          .setDescription('This character was removed or disabled')
          .setImage({ default: true }),
      );
  } else {
    const character = await packs.aggregate<Character>({
      character: results[0],
    });

    message = characterMessage(
      character,
      {
        relations: 1,
        rating: Rating.fromCharacter(character),
        media: {
          title: true,
        },
      },
    );
  }

  return discord.Message.page({
    page,
    total: characters.length,
    id: discord.join('collection', userId),
    message,
  });
}
