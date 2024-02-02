import db from '../db/mod.ts';

import utils from './utils.ts';

import validate, { purgeReservedProps } from './validate.ts';

import config from './config.ts';

import type { Manifest } from './types.ts';

export async function user(req: Request): Promise<Response> {
  const url = new URL(req.url);

  const { error } = await utils.validateRequest(req, {
    GET: { headers: ['authorization'] },
  });

  if (error) {
    return utils.json({ error: error.message }, { status: error.status });
  }

  if (!config.communityPacksMaintainerAPI) {
    return utils.json(
      { error: 'Server is possibly under maintenance' },
      { status: 503, statusText: 'Under Maintenance' },
    );
  }

  const auth = await utils.fetchWithRetry('https://discord.com/api/users/@me', {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'authorization': req.headers.get('authorization') ?? '',
    },
  });

  if (!auth.ok) {
    return auth;
  }

  const { id: userId } = await auth.json();

  const packs = await db.getPacksByMaintainerId(userId);

  // sort by recently updated
  packs.sort((a, b) =>
    new Date(b.updated).getTime() - new Date(a.updated).getTime()
  );

  const paginationResult = utils.pagination(packs, url);

  return utils.json(paginationResult);
}

export async function publish(req: Request): Promise<Response> {
  const { error, body } = await utils.validateRequest(req, {
    POST: { body: ['manifest'], headers: ['authorization'] },
  });

  if (error) {
    return utils.json({ error: error.message }, { status: error.status });
  }

  if (!config.communityPacksMaintainerAPI) {
    return utils.json(
      { error: 'Server is possibly under maintenance' },
      { status: 503, statusText: 'Under Maintenance' },
    );
  }

  const auth = await utils.fetchWithRetry('https://discord.com/api/users/@me', {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'authorization': req.headers.get('authorization') ?? '',
    },
  });

  if (!auth.ok) {
    return auth;
  }

  const { id: userId } = await auth.json();

  const { manifest } = body as { manifest: Manifest };

  const valid = validate(manifest);

  if (valid.errors?.length) {
    return utils.json({ errors: valid.errors }, {
      status: 400,
      statusText: 'Bad Request',
    });
  }

  try {
    const _ = await db.publishPack(userId, purgeReservedProps(manifest));

    return new Response(undefined, {
      status: 201,
      statusText: 'Created',
    });
  } catch (err) {
    switch (err.message) {
      case 'PERMISSION_DENIED':
        return utils.json({ error: 'No permission to edit this pack' }, {
          status: 403,
          statusText: 'Forbidden',
        });
      default:
        return utils.json({ error: 'Internal Server Error' }, {
          status: 501,
          statusText: 'Internal Server Error',
        });
    }
  }
}

export async function popular(req: Request): Promise<Response> {
  const url = new URL(req.url);

  const { error } = await utils.validateRequest(req, {
    GET: {},
  });

  if (error) {
    return utils.json({ error: error.message }, { status: error.status });
  }

  if (!config.communityPacksBrowseAPI) {
    return utils.json(
      { error: 'Server is possibly under maintenance' },
      { status: 503, statusText: 'Under Maintenance' },
    );
  }

  const packs = await db.getAllPublicPacks();

  // sort by most used
  packs.sort((a, b) => (b.servers ?? 0) - (a.servers ?? 0));

  const paginationResult = utils.pagination(packs, url, 20);

  return utils.json(paginationResult);
}
