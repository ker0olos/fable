import { gql, request } from './graphql.ts';

import config, { faunaUrl } from './config.ts';

import { characterMessage } from './search.ts';

import utils from './utils.ts';

import packs from './packs.ts';

import * as discord from './discord.ts';

import { Character, DisaggregatedCharacter, Inventory } from './types.ts';

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
        availablePulls
        lastPull
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

  message.addEmbed(
    new discord.Embed()
      .setImage({ url: `${config.origin}/i/${availablePulls}` })
      .setFooter({ text: 'Available Pulls' }),
  );

  if (availablePulls > 0) {
    message.addComponents([
      // `/gacha` shortcut
      new discord.Component()
        .setId(discord.join('gacha', userId))
        .setLabel('/gacha'),
      new discord.Component()
        .setId(discord.join('collection', userId, '0'))
        .setLabel('/collection'),
    ]);
  } else {
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
    getUserInventory: { characters: { id: string }[] };
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
          .setId(discord.join('gacha', userId))
          .setLabel('/gacha'),
      ]);
  }

  const results: (Character | DisaggregatedCharacter)[] = await packs
    .characters({ ids: [characters[page].id] });

  let message: discord.Message;

  if (!results.length) {
    message = new discord.Message()
      .addEmbed(
        new discord.Embed()
          .setDescription('This character was removed or disabled')
          .setImage({ default: true }),
      );
  } else {
    message = characterMessage(
      await packs.aggregate<Character>({ character: results[0] }),
    );
  }

  return discord.Message.page({
    page,
    total: characters.length,
    id: discord.join('collection', userId),
    message,
  });
}
