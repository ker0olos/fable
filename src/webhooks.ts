import utils from './utils.ts';

import config from './config.ts';

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

  const _data: {
    user: string;
    type: 'upvote' | 'test';
    isWeekend: boolean;
    query: string;
  } = await r.json();

  // TODO

  return new Response();
}

const webhooks = {
  topgg,
};

export default webhooks;
