import config from '~/src/config.ts';

import utils from '~/src/utils.ts';

import validate, { purgeReservedProps } from '~/src/validate.ts';

import db from '~/db/index.ts';

import type { MergedManifest } from '~/src/types.ts';

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
      { error: 'UNDER_MAINTENANCE' },
      { status: 503, statusText: 'Under Maintenance' }
    );
  }

  const auth = await utils.fetchWithRetry('https://discord.com/api/users/@me', {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      authorization: req.headers.get('authorization') ?? '',
    },
  });

  if (!auth.ok) {
    return auth;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { id: userId }: any = await auth.json();

  const limit = +(url.searchParams.get('limit') ?? 20);
  const offset = +(url.searchParams.get('offset') ?? 0);

  const packs = await db.getPacksByMaintainerId(userId, offset, limit);

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
    limit: Math.min(limit, 20),
    offset,
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
      { error: 'UNDER_MAINTENANCE' },
      { status: 503, statusText: 'Under Maintenance' }
    );
  }

  const auth = await utils.fetchWithRetry('https://discord.com/api/users/@me', {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      authorization: req.headers.get('authorization') ?? '',
    },
  });

  if (!auth.ok) {
    return auth;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { id: userId }: any = await auth.json();

  let {
    // eslint-disable-next-line prefer-const
    manifest: { characters, media, ...manifest },
  } = body as {
    manifest: MergedManifest;
  };

  characters = characters?.map((character) => ({
    ...character,
    packId: manifest.id,
  }));

  media = media?.map((mediaItem) => ({
    ...mediaItem,
    packId: manifest.id,
  }));

  const valid = validate({ characters, media, ...manifest });

  if (!valid.ok) {
    if (Array.isArray(valid.errors)) {
      return utils.json(
        { errors: valid.errors },
        { status: 400, statusText: 'Bad Request' }
      );
    } else {
      return new Response(valid.errors as string, {
        status: 400,
        statusText: 'Bad Request',
      });
    }
  }

  try {
    await db.publishPack(
      userId,
      purgeReservedProps(manifest),
      characters,
      media
    );

    return utils.json({ ok: true }, { status: 201, statusText: 'Created' });
  } catch (err) {
    switch ((err as Error).message) {
      case 'PERMISSION_DENIED':
        return utils.json(
          { error: 'PERMISSION_DENIED' },
          {
            status: 403,
            statusText: 'Forbidden',
          }
        );
      default:
        console.error(err);
        utils.captureException(err);
        return utils.json(
          { error: 'INTERNAL_SERVER_ERROR' },
          {
            status: 501,
            statusText: 'Internal Server Error',
          }
        );
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
      { error: 'UNDER_MAINTENANCE' },
      { status: 503, statusText: 'Under Maintenance' }
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
        createdAt: pack.createdAt,
        updatedAt: pack.updatedAt,
        approved: pack.approved,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      { error: 'UNDER_MAINTENANCE' },
      { status: 503, statusText: 'Under Maintenance' }
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
        createdAt: pack.createdAt,
        updatedAt: pack.updatedAt,
        approved: pack.approved,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    })),
    limit: Math.min(limit, 20),
    offset,
  };

  return utils.json(data);
}

export async function pack(
  req: Request,
  packId: string | undefined
): Promise<Response> {
  const { error } = await utils.validateRequest(req, { GET: {} });

  if (error) {
    return utils.json({ error: error.message }, { status: error.status });
  }

  let userId: string | undefined;

  const authKey = req.headers.get('authorization');

  if (
    (authKey && !config.communityPacksMaintainerAPI) ||
    (!authKey && !config.communityPacksBrowseAPI)
  ) {
    return utils.json(
      { error: 'UNDER_MAINTENANCE' },
      { status: 503, statusText: 'Under Maintenance' }
    );
  }

  if (!packId) {
    return utils.json(
      { error: 'INVALID_PACK_ID' },
      { status: 400, statusText: 'Bad Request' }
    );
  }

  if (authKey) {
    const auth = await utils.fetchWithRetry(
      'https://discord.com/api/users/@me',
      {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          authorization: req.headers.get('authorization') ?? '',
        },
      }
    );

    if (auth.ok) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { id }: any = await auth.json();

      userId = id;
    }
  }

  const pack = await db.getPack(packId, userId);

  if (!pack) {
    return utils.json(
      { error: 'NOT_FOUND' },
      {
        status: 404,
        statusText: 'Not Found',
      }
    );
  }

  return utils.json(pack);
}

export async function search(req: Request): Promise<Response> {
  const url = new URL(req.url);

  const { error } = await utils.validateRequest(req, {
    GET: {},
  });

  if (error) {
    return utils.json({ error: error.message }, { status: error.status });
  }

  if (!config.communityPacksBrowseAPI) {
    return utils.json(
      { error: 'UNDER_MAINTENANCE' },
      { status: 503, statusText: 'Under Maintenance' }
    );
  }

  const query = url.searchParams.get('q');
  const limit = +(url.searchParams.get('limit') ?? 20);
  const offset = +(url.searchParams.get('offset') ?? 0);

  if (!query) {
    return utils.json(
      { error: 'MISSING_QUERY' },
      { status: 400, statusText: 'Bad Request' }
    );
  }

  const packs = await db.searchPacks(query, offset, limit);

  const data = {
    packs: packs.map((pack) => ({
      manifest: {
        id: pack.manifest.id,
        title: pack.manifest.title,
        description: pack.manifest.description,
        image: pack.manifest.image,
        createdAt: pack.createdAt,
        updatedAt: pack.updatedAt,
        approved: pack.approved,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    })),
    limit: Math.min(limit, 20),
    offset,
  };

  return utils.json(data);
}
