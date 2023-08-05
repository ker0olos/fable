import { gql, request } from './graphql.ts';

import user from './user.ts';

import i18n from './i18n.ts';
import utils from './utils.ts';

import config, { faunaUrl } from './config.ts';

import * as discord from './discord.ts';

import { Schema } from './types.ts';

import { COSTS } from '../models/add_tokens_to_user.ts';

export const voteComponent = (
  { token, guildId, label }: { token: string; guildId: string; label?: string },
) =>
  new discord.Component()
    .setLabel(label ?? 'Vote')
    .setUrl(
      `https://top.gg/bot/${config.appId}/vote?ref=${
        // deno-lint-ignore no-non-null-assertion
        utils.cipher(token, config.topggCipher!)}&gid=${guildId}`,
    );

function normal(
  { userId, amount }: { userId: string; amount: number },
): discord.Message {
  const locale = user.cachedUsers[userId]?.locale;

  const message = new discord.Message();

  message.addEmbed(
    new discord.Embed()
      .setDescription(
        i18n.get(
          'spent-tokens-normal',
          locale,
          amount,
          amount > 1 ? i18n.get('tokens', locale) : i18n.get('token', locale),
          discord.emotes.remove,
        ),
      ),
  );

  message.addComponents([
    new discord.Component().setId('buy', 'normal', userId, `${amount}`)
      .setLabel(i18n.get('confirm', locale)),
    new discord.Component().setId('cancel', userId)
      .setStyle(discord.ButtonStyle.Red)
      .setLabel(i18n.get('cancel', locale)),
  ]);

  return message;
}

async function confirmNormal({ token, userId, guildId, amount }: {
  token: string;
  userId: string;
  guildId: string;
  amount: number;
}): Promise<discord.Message> {
  const mutation = gql`
    mutation ($userId: String!, $guildId: String!, $amount: Int!) {
      exchangeTokensForPulls(
        userId: $userId
        guildId: $guildId
        amount: $amount
      ) {
        ok
        error
        user {
          availableVotes
        }
      }
    }
  `;

  const locale = user.cachedUsers[userId]?.locale;

  const { exchangeTokensForPulls } = await request<{
    exchangeTokensForPulls: Schema.Mutation;
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

  if (!exchangeTokensForPulls.ok) {
    switch (exchangeTokensForPulls.error) {
      case 'INSUFFICIENT_TOKENS': {
        const tokens = exchangeTokensForPulls.user.availableVotes || 0;

        const diff = amount - tokens;

        return new discord.Message()
          .addEmbed(new discord.Embed()
            .setDescription(
              i18n.get(
                'you-need-more-tokens',
                locale,
                diff,
                diff > 1
                  ? i18n.get('tokens', locale)
                  : i18n.get('token', locale),
              ),
            ))
          .addComponents([
            voteComponent({
              token,
              guildId,
            }),
          ]);
      }
      default:
        throw new Error(exchangeTokensForPulls.error);
    }
  }

  const message = new discord.Message();

  message
    .addEmbed(new discord.Embed().setDescription(
      i18n.get(
        'you-bought-pulls',
        locale,
        amount,
        amount > 1 ? i18n.get('pulls', locale) : i18n.get('pull', locale),
        discord.emotes.add,
      ),
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
  const locale = user.cachedUsers[userId]?.locale;

  const message = new discord.Message();

  const cost = stars === 5
    ? COSTS.FIVE
    : stars === 4
    ? COSTS.FOUR
    : COSTS.THREE;

  message.addEmbed(
    new discord.Embed()
      .setDescription(
        i18n.get(
          'spent-tokens-guaranteed',
          locale,
          cost,
          discord.emotes.remove,
          `${stars}${discord.emotes.smolStar}`,
          discord.emotes.add,
        ),
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
  token,
  userId,
  guildId,
  stars,
}: {
  token: string;
  userId: string;
  guildId: string;
  stars: number;
}): Promise<discord.Message> {
  const mutation = gql`
    mutation ($userId: String!, $stars: Int!) {
      exchangeTokensForGuarantees(userId: $userId, guarantee: $stars) {
        ok
        error
        user {
          availableVotes
        }
      }
    }
  `;

  const locale = user.cachedUsers[userId]?.locale;

  const { exchangeTokensForGuarantees } = await request<{
    exchangeTokensForGuarantees: Schema.Mutation;
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

  if (!exchangeTokensForGuarantees.ok) {
    switch (exchangeTokensForGuarantees.error) {
      case 'INSUFFICIENT_TOKENS': {
        const cost = stars === 5
          ? COSTS.FIVE
          : stars === 4
          ? COSTS.FOUR
          : COSTS.THREE;

        const tokens = exchangeTokensForGuarantees.user.availableVotes || 0;

        const diff = cost - tokens;

        return new discord.Message()
          .addEmbed(new discord.Embed()
            .setDescription(
              i18n.get(
                'you-need-more-tokens',
                locale,
                diff,
                diff > 1
                  ? i18n.get('tokens', locale)
                  : i18n.get('token', locale),
              ),
            ))
          .addComponents([
            voteComponent({
              token,
              guildId,
            }),
          ]);
      }
      default:
        throw new Error(exchangeTokensForGuarantees.error);
    }
  }

  const message = new discord.Message();

  message
    .addEmbed(new discord.Embed().setDescription(
      i18n.get(
        'you-bought-guarantee',
        locale,
        stars,
        discord.emotes.smolStar,
        discord.emotes.add,
      ),
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
