import config from '~/src/config.ts';

import utils from '~/src/utils.ts';

import validate, { purgeReservedProps } from '~/src/validate.ts';

import db from '~/db/mod.ts';

import type { Manifest } from '~/src/types.ts';

export async function user(req: Request): Promise<Response> {
  // const url = new URL(req.url);

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

  // const limit = +(url.searchParams.get('limit') ?? 20);
  // const offset = +(url.searchParams.get('offset') ?? 0);

  const packs = await db.getPacksByMaintainerId(userId);
  // const packs = await db.getPacksByMaintainerId(userId, offset, limit);

  const data = {
    packs: packs.map((pack) => ({
      ...pack,
      manifest: {
        id: pack.manifest.id,
        title: pack.manifest.title,
        description: pack.manifest.description,
        image: pack.manifest.image,
      },
    })),
    // limit,
    // offset,
  };

  return utils.json(data);
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

  const limit = +(url.searchParams.get('limit') ?? 20);
  const offset = +(url.searchParams.get('offset') ?? 0);

  const packs = await db.getPopularPacks(offset, limit);

  const data = {
    packs: packs.map(({ servers, pack }) => ({
      servers,
      manifest: {
        id: pack.manifest.id,
        title: pack.manifest.title,
        description: pack.manifest.description,
        image: pack.manifest.image,
        media: pack.manifest.media?.new?.length ?? 0,
        characters: pack.manifest.characters?.new?.length ?? 0,
        createdAt: pack.createdAt,
        updatedAt: pack.updatedAt,
        // deno-lint-ignore no-explicit-any
      } as any,
    })),
    limit: Math.min(limit, 20),
    offset,
  };

  return utils.json(data);
}

export async function lastUpdated(req: Request): Promise<Response> {
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

  const limit = +(url.searchParams.get('limit') ?? 20);
  const offset = +(url.searchParams.get('offset') ?? 0);

  const packs = await db.getLastUpdatedPacks(offset, limit);

  const data = {
    packs: packs.map((pack) => ({
      manifest: {
        id: pack.manifest.id,
        title: pack.manifest.title,
        description: pack.manifest.description,
        image: pack.manifest.image,
        media: pack.manifest.media?.new?.length ?? 0,
        characters: pack.manifest.characters?.new?.length ?? 0,
        createdAt: pack.createdAt,
        updatedAt: pack.updatedAt,
        // deno-lint-ignore no-explicit-any
      } as any,
    })),
    limit: Math.min(limit, 20),
    offset,
  };

  return utils.json(data);
}

export async function pack(
  req: Request,
  params: import('sift').PathParams,
): Promise<Response> {
  const { error } = await utils.validateRequest(req, { GET: {} });

  if (error) {
    return utils.json({ error: error.message }, { status: error.status });
  }

  let userId: string | undefined;

  const packId = params?.packId;

  const authKey = req.headers.get('authorization');

  if (
    (authKey && !config.communityPacksMaintainerAPI) ||
    (!authKey && !config.communityPacksBrowseAPI)
  ) {
    return utils.json(
      { error: 'Server is possibly under maintenance' },
      { status: 503, statusText: 'Under Maintenance' },
    );
  }

  if (!packId) {
    return utils.json(
      { error: 'Invalid Pack Id' },
      { status: 400, statusText: 'Bad Request' },
    );
  }

  if (authKey) {
    const auth = await utils.fetchWithRetry(
      'https://discord.com/api/users/@me',
      {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          'authorization': req.headers.get('authorization') ?? '',
        },
      },
    );

    if (auth.ok) {
      const { id } = await auth.json();

      userId = id;
    }
  }

  const pack = await db.getPack(packId, userId);

  if (!pack) {
    return utils.json(
      { error: 'Not Found' },
      { status: 404, statusText: 'Not Found' },
    );
  }

  return utils.json(pack);
}
