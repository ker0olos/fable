import { gql, request } from './graphql.ts';

import * as discord from './discord.ts';

import config, { faunaUrl } from './config.ts';

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
    getUserInventory: { availablePulls: number; lastPull?: string };
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
    ]);
  } else {
    // deno-lint-ignore no-non-null-assertion
    const refill = new Date(lastPull!);

    refill.setMinutes(refill.getMinutes() + 60);

    const refillTimestamp = refill.getTime().toString();

    message.addEmbed(
      new discord.Embed()
        .setDescription(
          // discord apparently uses black magic and requires us to cut 3 digits
          // or go 30,000 years into the future
          `Refill <t:${
            refillTimestamp.substring(0, refillTimestamp.length - 3)
          }:R>`,
        ),
    );
  }

  return message;
}
