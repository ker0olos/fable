/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, vi, afterEach } from 'vitest';

import utils from '~/src/utils.ts';
import * as communityAPI from '~/src/communityAPI.ts';
import db from '~/db/index.ts';
import config from '~/src/config.ts';

describe('/user', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('normal', async () => {
    vi.spyOn(utils, 'fetchWithRetry').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'user_id' }),
    } as any);

    vi.spyOn(db, 'getPacksByMaintainerId').mockReturnValue([
      { manifest: { id: 'pack-1' } },
      { manifest: { id: 'pack-2' } },
      { manifest: { id: 'pack-3' } },
    ] as any);

    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
        headers: { authorization: 'Bearer token' },
      });

      const response = await communityAPI.user(request);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('OK');

      const data: any = await response.json();

      expect(data.packs.length).toBe(3);
      expect(data.packs[0].manifest.id).toBe('pack-1');
      expect(data.packs[1].manifest.id).toBe('pack-2');
      expect(data.packs[2].manifest.id).toBe('pack-3');
    } finally {
      delete config.communityPacksMaintainerAPI;
    }
  });

  test('invalid access token', async () => {
    const fetchStub = vi.spyOn(utils, 'fetchWithRetry').mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Unauthorized',
      json: () =>
        Promise.resolve({
          error: 'invalid access token',
        }),
    } as any);

    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
        headers: { authorization: 'Bearer token' },
      });

      const response = await communityAPI.user(request);

      expect(fetchStub).toHaveBeenCalledTimes(1);
      expect(fetchStub).toHaveBeenCalledWith(
        'https://discord.com/api/users/@me',
        {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer token`,
          },
        }
      );

      expect(response.ok).toBe(false);
      expect(response.status).toBe(403);
      expect(response.statusText).toBe('Unauthorized');

      expect(await response.json()).toEqual({
        error: 'invalid access token',
      });
    } finally {
      delete config.communityPacksMaintainerAPI;
    }
  });

  test('under maintenance', async () => {
    const request = new Request('http://localhost:8000', {
      method: 'GET',
      headers: { authorization: 'Bearer token' },
    });

    const response = await communityAPI.user(request);

    expect(response.ok).toBe(false);
    expect(response.status).toBe(503);
    expect(response.statusText).toBe('Under Maintenance');
  });
});

describe('/popular', () => {
  test('normal', async () => {
    vi.spyOn(db, 'getPopularPacks').mockReturnValue([
      { pack: { manifest: { id: 'pack-1' } } },
      { pack: { manifest: { id: 'pack-2' } } },
      { pack: { manifest: { id: 'pack-3' } } },
    ] as any);

    config.communityPacksBrowseAPI = true;

    try {
      const request = new Request('http://localhost:8000', { method: 'GET' });

      const response = await communityAPI.popular(request);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('OK');

      const data: any = await response.json();

      expect(data.limit).toBe(20);
      expect(data.offset).toBe(0);

      expect(data.packs[0].manifest.id).toBe('pack-1');
      expect(data.packs[1].manifest.id).toBe('pack-2');
      expect(data.packs[2].manifest.id).toBe('pack-3');
    } finally {
      delete config.communityPacksBrowseAPI;
    }
  });

  test('under maintenance', async () => {
    const request = new Request('http://localhost:8000', { method: 'GET' });

    const response = await communityAPI.popular(request);

    expect(response.ok).toBe(false);
    expect(response.status).toBe(503);
    expect(response.statusText).toBe('Under Maintenance');
  });
});

describe('/updated', () => {
  test('normal', async () => {
    vi.spyOn(db, 'getLastUpdatedPacks').mockReturnValue([
      { manifest: { id: 'pack-1' } },
      { manifest: { id: 'pack-2' } },
      { manifest: { id: 'pack-3' } },
    ] as any);

    config.communityPacksBrowseAPI = true;

    try {
      const request = new Request('http://localhost:8000', { method: 'GET' });

      const response = await communityAPI.lastUpdated(request);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('OK');

      const data: any = await response.json();

      expect(data.limit).toBe(20);
      expect(data.offset).toBe(0);

      expect(data.packs[0].manifest.id).toBe('pack-1');
      expect(data.packs[1].manifest.id).toBe('pack-2');
      expect(data.packs[2].manifest.id).toBe('pack-3');
    } finally {
      delete config.communityPacksBrowseAPI;
    }
  });

  test('under maintenance', async () => {
    const request = new Request('http://localhost:8000', { method: 'GET' });

    const response = await communityAPI.lastUpdated(request);

    expect(response.ok).toBe(false);
    expect(response.status).toBe(503);
    expect(response.statusText).toBe('Under Maintenance');
  });
});

describe('/publish', () => {
  test('normal', async () => {
    const fetchStub = vi.spyOn(utils, 'fetchWithRetry').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'user_id' }),
    } as any);

    const publishPackStub = vi
      .spyOn(db, 'publishPack')
      .mockReturnValue([] as any);

    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        headers: { authorization: 'Bearer token' },
        body: JSON.stringify({ manifest: { id: 'pack_id' } }),
      });

      const response = await communityAPI.publish(request);

      expect(fetchStub).toHaveBeenCalledWith(
        'https://discord.com/api/users/@me',
        {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer token`,
          },
        }
      );

      expect(publishPackStub).toHaveBeenCalledWith('user_id', {
        id: 'pack_id',
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
      expect(response.statusText).toBe('Created');
    } finally {
      delete config.communityPacksMaintainerAPI;
    }
  });

  test('invalid access token', async () => {
    const fetchStub = vi.spyOn(utils, 'fetchWithRetry').mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Unauthorized',
      json: () =>
        Promise.resolve({
          error: 'invalid access token',
        }),
    } as any);

    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        headers: { authorization: 'Bearer token' },
        body: JSON.stringify({
          manifest: {
            id: 'pack_id',
          },
        }),
      });

      const response = await communityAPI.publish(request);

      expect(fetchStub).toHaveBeenCalledTimes(1);
      expect(fetchStub).toHaveBeenCalledWith(
        'https://discord.com/api/users/@me',
        {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer token`,
          },
        }
      );

      expect(response.ok).toBe(false);
      expect(response.status).toBe(403);
      expect(response.statusText).toBe('Unauthorized');

      expect(await response.json()).toEqual({
        error: 'invalid access token',
      });
    } finally {
      delete config.communityPacksMaintainerAPI;
    }
  });

  test('invalid manifest', async () => {
    vi.spyOn(utils, 'fetchWithRetry').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'user_id' }),
    } as any);

    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        headers: { authorization: 'Bearer token' },
        body: JSON.stringify({
          manifest: {},
        }),
      });

      const response = await communityAPI.publish(request);

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      expect(response.statusText).toBe('Bad Request');

      expect(await response.json()).toEqual({
        errors: [
          {
            dataPath: '',
            keyword: 'required',
            message: "should have required property 'id'",
            params: {
              missingProperty: 'id',
            },
            schemaPath: '#/required',
          },
        ],
      });
    } finally {
      delete config.communityPacksMaintainerAPI;
    }
  });

  test('permission denied', async () => {
    const fetchStub = vi.spyOn(utils, 'fetchWithRetry').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'user_id' }),
    } as any);

    const publishPackStub = vi
      .spyOn(db, 'publishPack')
      .mockImplementation(() => {
        throw new Error('PERMISSION_DENIED');
      });

    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        headers: { authorization: 'Bearer token' },
        body: JSON.stringify({
          manifest: {
            id: 'pack_id',
          },
        }),
      });

      const response = await communityAPI.publish(request);

      expect(fetchStub).toHaveBeenCalledWith(
        'https://discord.com/api/users/@me',
        {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer token`,
          },
        }
      );

      expect(publishPackStub).toHaveBeenCalledWith('user_id', {
        id: 'pack_id',
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(403);
      expect(response.statusText).toBe('Forbidden');

      expect(await response.json()).toEqual({
        error: 'PERMISSION_DENIED',
      });
    } finally {
      delete config.communityPacksMaintainerAPI;
    }
  });

  test('unknown server error', async () => {
    const fetchStub = vi.spyOn(utils, 'fetchWithRetry').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'user_id' }),
    } as any);

    const publishPackStub = vi
      .spyOn(db, 'publishPack')
      .mockImplementation(() => {
        throw new Error();
      });

    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        headers: { authorization: 'Bearer token' },
        body: JSON.stringify({ manifest: { id: 'pack_id' } }),
      });

      const response = await communityAPI.publish(request);

      expect(fetchStub).toHaveBeenCalledWith(
        'https://discord.com/api/users/@me',
        {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer token`,
          },
        }
      );

      expect(publishPackStub).toHaveBeenCalledWith('user_id', {
        id: 'pack_id',
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(501);
      expect(response.statusText).toBe('Internal Server Error');

      expect(await response.json()).toEqual({
        error: 'INTERNAL_SERVER_ERROR',
      });
    } finally {
      delete config.communityPacksMaintainerAPI;
    }
  });

  test('under maintenance', async () => {
    const request = new Request('http://localhost:8000', {
      method: 'POST',
      headers: { authorization: 'Bearer token' },
      body: JSON.stringify({ manifest: { id: 'pack_id' } }),
    });

    const response = await communityAPI.publish(request);

    expect(response.ok).toBe(false);
    expect(response.status).toBe(503);
    expect(response.statusText).toBe('Under Maintenance');
  });
});

describe('/pack', () => {
  test('normal', async () => {
    vi.spyOn(db, 'getPack').mockReturnValue({
      owner: 'user_id',
      manifest: {
        id: 'pack-id',
        private: false,
      },
    } as any);

    config.communityPacksBrowseAPI = true;
    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
      });

      const response = await communityAPI.pack(request, 'pack-id');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('OK');
    } finally {
      delete config.communityPacksBrowseAPI;
      delete config.communityPacksMaintainerAPI;
    }
  });

  test('not found', async () => {
    vi.spyOn(db, 'getPack').mockReturnValue(undefined as any);

    config.communityPacksBrowseAPI = true;
    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
      });

      const response = await communityAPI.pack(request, 'pack-id');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(response.statusText).toBe('Not Found');
    } finally {
      delete config.communityPacksBrowseAPI;
      delete config.communityPacksMaintainerAPI;
    }
  });

  test('invalid access token (public)', async () => {
    vi.spyOn(db, 'getPack').mockReturnValue({
      owner: 'user_id',
      manifest: {
        id: 'pack-id',
      },
    } as any);

    const fetchStub = vi.spyOn(utils, 'fetchWithRetry').mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Unauthorized',
      json: () =>
        Promise.resolve({
          error: 'invalid access token',
        }),
    } as any);

    config.communityPacksBrowseAPI = true;
    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
        headers: { authorization: 'Bearer token' },
      });

      const response = await communityAPI.pack(request, 'pack-id');

      expect(fetchStub).toHaveBeenCalledTimes(1);
      expect(fetchStub).toHaveBeenCalledWith(
        'https://discord.com/api/users/@me',
        {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer token`,
          },
        }
      );

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('OK');
    } finally {
      delete config.communityPacksBrowseAPI;
      delete config.communityPacksMaintainerAPI;
    }
  });

  test('missing pack id', async () => {
    config.communityPacksBrowseAPI = true;
    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
      });

      const response = await communityAPI.pack(request, '');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      expect(response.statusText).toBe('Bad Request');
    } finally {
      delete config.communityPacksBrowseAPI;
      delete config.communityPacksMaintainerAPI;
    }
  });

  test('under maintenance', async () => {
    config.communityPacksBrowseAPI = false;
    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
      });

      const response = await communityAPI.pack(request, '');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(503);
      expect(response.statusText).toBe('Under Maintenance');
    } finally {
      delete config.communityPacksBrowseAPI;
      delete config.communityPacksMaintainerAPI;
    }
  });

  test('under maintenance 2', async () => {
    config.communityPacksBrowseAPI = true;
    config.communityPacksMaintainerAPI = false;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
        headers: { authorization: 'Bearer token' },
      });

      const response = await communityAPI.pack(request, '');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(503);
      expect(response.statusText).toBe('Under Maintenance');
    } finally {
      delete config.communityPacksBrowseAPI;
      delete config.communityPacksMaintainerAPI;
    }
  });
});

describe('/search', () => {
  test('normal', async () => {
    vi.spyOn(db, 'searchPacks').mockReturnValue([
      { manifest: { id: 'pack-1' } },
      { manifest: { id: 'pack-2' } },
      { manifest: { id: 'pack-3' } },
    ] as any);

    config.communityPacksBrowseAPI = true;

    try {
      const request = new Request('http://localhost:8000?q=test', {
        method: 'GET',
      });

      const response = await communityAPI.search(request);

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('OK');

      const data: any = await response.json();

      expect(data.limit).toBe(20);
      expect(data.offset).toBe(0);

      expect(data.packs[0].manifest.id).toBe('pack-1');
      expect(data.packs[1].manifest.id).toBe('pack-2');
      expect(data.packs[2].manifest.id).toBe('pack-3');
    } finally {
      delete config.communityPacksBrowseAPI;
    }
  });

  test('missing query', async () => {
    config.communityPacksBrowseAPI = true;

    try {
      const request = new Request('http://localhost:8000', { method: 'GET' });

      const response = await communityAPI.search(request);

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      expect(response.statusText).toBe('Bad Request');

      const data: any = await response.json();

      expect(data.error).toBe('MISSING_QUERY');
    } finally {
      delete config.communityPacksBrowseAPI;
    }
  });

  test('under maintenance', async () => {
    const request = new Request('http://localhost:8000?q=test', {
      method: 'GET',
    });

    const response = await communityAPI.search(request);

    expect(response.ok).toBe(false);
    expect(response.status).toBe(503);
    expect(response.statusText).toBe('Under Maintenance');
  });
});
