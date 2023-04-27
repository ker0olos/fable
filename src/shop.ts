import { gql, request } from './graphql.ts';

import config, { faunaUrl } from './config.ts';

import * as discord from './discord.ts';

import { Schema } from './types.ts';

function normal({
  userId,
  amount,
}: {
  userId: string;
  amount: number;
}): discord.Message {
  const message = new discord.Message();

  message.addEmbed(
    new discord.Embed()
      .setDescription(
        `Are you sure you want to spent **${amount}** ${
          amount > 1 ? 'votes' : 'vote'
        } ${discord.emotes.remove}`,
      ),
  );

  message.addComponents([
    new discord.Component().setId('buy', 'normal', userId, `${amount}`)
      .setLabel('Confirm'),
    new discord.Component().setId('cancel', userId)
      .setStyle(discord.ButtonStyle.Red)
      .setLabel('Cancel'),
  ]);

  return message;
}

async function confirmNormal({
  userId,
  guildId,
  amount,
}: {
  userId: string;
  guildId: string;
  amount: number;
}): Promise<discord.Message> {
  const mutation = gql`
    mutation (
      $userId: String!
      $guildId: String!
      $amount: Int!
    ) {
      exchangeVotesForPulls(
        userId: $userId
        guildId: $guildId
        votes: $amount
      ) {
        ok
        error
        user {
          availableVotes
        }
      }
    }
  `;

  const { exchangeVotesForPulls } = await request<{
    exchangeVotesForPulls: Schema.Mutation;
  }>({
    url: faunaUrl,
    query: mutation,
    headers: {
      'authorization': `Bearer ${config.faunaSecret}`,
    },
    variables: {
      userId,
      guildId,
      amount,
    },
  });

  if (!exchangeVotesForPulls.ok) {
    switch (exchangeVotesForPulls.error) {
      case 'INSUFFICIENT_VOTES': {
        const votes = exchangeVotesForPulls.user.availableVotes ?? 0;

        return new discord.Message()
          .addEmbed(new discord.Embed()
            .setDescription(
              votes > 0
                ? `You only have **${votes}** ${votes > 1 ? 'votes' : 'vote'}`
                : `You don't have any votes`,
            ))
          .addComponents([
            new discord.Component()
              .setId('now', userId)
              .setLabel('/vote'),
          ]);
      }
      default:
        throw new Error(exchangeVotesForPulls.error);
    }
  }

  const message = new discord.Message();

  message
    .addEmbed(new discord.Embed().setDescription(
      `You bought **${amount}** ${
        amount > 1 ? 'pulls' : 'pull'
      } ${discord.emotes.add}`,
    ));

  message.addComponents([
    new discord.Component()
      .setId('gacha', userId)
      .setLabel('/gacha'),
    new discord.Component()
      .setId('q', userId)
      .setLabel('/q'),
  ]);

  return message;
}

function guaranteed({
  userId,
  stars,
}: {
  userId: string;
  stars: number;
}): discord.Message {
  const message = new discord.Message();

  const cost = stars === 5 ? 36 : stars === 4 ? 12 : 4;

  message.addEmbed(
    new discord.Embed()
      .setDescription(
        `Are you sure you want to spent **${cost}** votes ${discord.emotes.remove}`,
      ),
  );

  message.addComponents([
    new discord.Component().setId('buy', 'guaranteed', userId, `${stars}`)
      .setLabel('Confirm'),
    new discord.Component().setId('cancel', userId)
      .setStyle(discord.ButtonStyle.Red)
      .setLabel('Cancel'),
  ]);

  return message;
}

async function confirmGuaranteed({
  userId,
  stars,
}: {
  userId: string;
  stars: number;
}): Promise<discord.Message> {
  const mutation = gql`
    mutation ($userId: String!, $stars: Int!) {
      exchangeVotesForGuarantees(userId: $userId, guarantee: $stars) {
        ok
        error
        user {
          availableVotes
        }
      }
    }
  `;

  const { exchangeVotesForGuarantees } = await request<{
    exchangeVotesForGuarantees: Schema.Mutation;
  }>({
    url: faunaUrl,
    query: mutation,
    headers: {
      'authorization': `Bearer ${config.faunaSecret}`,
    },
    variables: {
      userId,
      stars,
    },
  });

  if (!exchangeVotesForGuarantees.ok) {
    switch (exchangeVotesForGuarantees.error) {
      case 'INSUFFICIENT_VOTES': {
        const votes = exchangeVotesForGuarantees.user.availableVotes ?? 0;

        return new discord.Message()
          .addEmbed(new discord.Embed()
            .setDescription(
              votes > 0
                ? `You only have **${votes}** ${votes > 1 ? 'votes' : 'vote'}`
                : `You don't have any votes`,
            ))
          .addComponents([
            new discord.Component()
              .setId('now', userId)
              .setLabel('/vote'),
          ]);
      }
      default:
        throw new Error(exchangeVotesForGuarantees.error);
    }
  }

  const message = new discord.Message();

  message
    .addEmbed(new discord.Embed().setDescription(
      `You bought a **${stars}**${discord.emotes.smolStar}pull ${discord.emotes.add}`,
    ));

  message.addComponents([
    new discord.Component()
      .setId('pull', userId, `${stars}`)
      .setLabel(`/pull ${stars}`),
  ]);

  return message;
}

const shop = {
  normal,
  guaranteed,
  confirmNormal,
  confirmGuaranteed,
};

export default shop;
