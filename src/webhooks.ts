import { gql, request } from './graphql.ts';

import config, { faunaUrl } from './config.ts';

import utils from './utils.ts';

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

  if (authorization !== config.topggSecret) {
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

  const query = gql`
    mutation ($userId: String!, $weekend: Boolean!) {
      addVoteToUser(userId: $userId, weekend: $weekend) {
        ok
      }
    }
  `;

  const response = (await request<{
    addVoteToUser: Schema.Mutation;
  }>({
    query,
    url: faunaUrl,
    headers: {
      'authorization': `Bearer ${config.faunaSecret}`,
    },
    variables: {
      userId: data.user,
      weekend: data.isWeekend || false,
    },
  })).addVoteToUser;

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

  return utils.json(
    { message: 'OK' },
  );
}

const webhooks = {
  topgg,
};

export default webhooks;
