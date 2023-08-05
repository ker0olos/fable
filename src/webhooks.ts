import { gql, request } from './graphql.ts';

import config, { faunaUrl } from './config.ts';

import i18n from './i18n.ts';
import utils from './utils.ts';

import user from './user.ts';

import * as discord from './discord.ts';

import { Schema } from './types.ts';

async function topgg(r: Request): Promise<Response> {
  const { error } = await utils.validateRequest(r, {
    POST: {
      headers: ['Authorization'],
    },
  });

  if (error) {
    return utils.json(
      { error: error.message },
      { status: error.status },
    );
  }

  const authorization = r.headers.get('Authorization');

  if (
    typeof config.topggSecret !== 'string' ||
    config.topggSecret.length < 32 ||
    authorization !== config.topggSecret
  ) {
    return utils.json(
      { error: 'Forbidden' },
      { status: 403 },
    );
  }

  const data: {
    user: string;
    type: 'upvote' | 'test';
    isWeekend: boolean;
    query: string;
  } = await r.json();

  const amount = data.isWeekend ? 2 : 1;

  const query = gql`
    mutation ($userId: String!, $amount: Int!) {
      addTokensToUser(userId: $userId, amount: $amount) {
        ok
      }
    }
  `;

  const response = (await request<{
    addTokensToUser: Schema.Mutation;
  }>({
    query,
    url: faunaUrl,
    headers: {
      'authorization': `Bearer ${config.faunaSecret}`,
    },
    variables: {
      userId: data.user,
      amount,
    },
  })).addTokensToUser;

  if (!response.ok) {
    const err = new Error('failed to reward user');

    if (!config.sentry) {
      throw err;
    }

    utils.captureException(err, {
      extra: { ...data },
    });

    return utils.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }

  const searchParams = new URLSearchParams(data.query);

  // patch /now to confirm vote
  if (searchParams.has('ref') && searchParams.has('gid')) {
    (async () => {
      // deno-lint-ignore no-non-null-assertion
      const guildId = searchParams.get('gid')!;

      // decipher the interaction token
      const token = utils.decipher(
        // deno-lint-ignore no-non-null-assertion
        searchParams.get('ref')!,
        // deno-lint-ignore no-non-null-assertion
        config.topggCipher!,
      );

      const locale = user.cachedUsers[data.user]?.locale ??
        user.cachedGuilds[guildId]?.locale;

      // update the /now used to vote
      const message = (await user.now({
        guildId,
        userId: data.user,
        token,
      })).setContent(`<@${data.user}>`);

      new discord.Message()
        .setContent(
          i18n.get(
            'thanks-for-voting',
            locale,
            `<@${data.user}>`,
            amount,
            amount === 1
              ? i18n.get('token', locale)
              : i18n.get('tokens', locale),
          ),
        )
        .addComponents([
          new discord.Component()
            .setId('help', '', '4')
            .setLabel('/help shop'),
        ])
        .followup(token);

      await message.patch(token);
    })()
      .catch(console.error);
  }

  return utils.json({
    message: 'OK',
  });
}

const webhooks = {
  topgg,
};

export default webhooks;
