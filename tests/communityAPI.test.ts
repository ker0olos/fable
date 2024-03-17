// deno-lint-ignore-file no-explicit-any

import { assertEquals } from '$std/assert/mod.ts';

import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from '$std/testing/mock.ts';

import utils from '~/src/utils.ts';

import * as communityAPI from '~/src/communityAPI.ts';

import db from '~/db/mod.ts';

import config from '~/src/config.ts';

Deno.test('/user', async (test) => {
  await test.step('normal', async () => {
    const fetchStub = stub(utils, 'fetchWithRetry', () =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'user_id' }),
      } as any));

    const getPacksByMaintainerIdStub = stub(
      db,
      'getPacksByMaintainerId',
      () =>
        [
          { manifest: { id: 'pack-1' } },
          { manifest: { id: 'pack-2' } },
          { manifest: { id: 'pack-3' } },
        ] as any,
    );

    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
        headers: { 'authorization': 'Bearer token' },
      });

      const response = await communityAPI.user(request);

      assertEquals(response.ok, true);
      assertEquals(response.status, 200);
      assertEquals(response.statusText, 'OK');

      const data = await response.json();

      assertEquals(data.packs.length, 3);

      assertEquals(data.packs[0].manifest.id, 'pack-1');
      assertEquals(data.packs[1].manifest.id, 'pack-2');
      assertEquals(data.packs[2].manifest.id, 'pack-3');
    } finally {
      delete config.communityPacksMaintainerAPI;

      fetchStub.restore();
      getPacksByMaintainerIdStub.restore();
    }
  });

  await test.step('invalid access token', async () => {
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: false,
          status: 403,
          statusText: 'Unauthorized',
          json: (() =>
            Promise.resolve({
              error: 'invalid access token',
            })),
        } as any,
      ]),
    );

    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
        headers: { 'authorization': 'Bearer token' },
      });

      const response = await communityAPI.user(request);

      assertSpyCalls(fetchStub, 1);

      assertSpyCall(fetchStub, 0, {
        args: ['https://discord.com/api/users/@me', {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            'authorization': `Bearer token`,
          },
        }],
      });

      assertEquals(response.ok, false);
      assertEquals(response.status, 403);
      assertEquals(response.statusText, 'Unauthorized');

      assertEquals(await response.json(), {
        error: 'invalid access token',
      });
    } finally {
      delete config.communityPacksMaintainerAPI;

      fetchStub.restore();
    }
  });

  await test.step('under maintenance', async () => {
    const request = new Request('http://localhost:8000', {
      method: 'GET',
      headers: { 'authorization': 'Bearer token' },
    });

    const response = await communityAPI.user(request);

    assertEquals(response.ok, false);
    assertEquals(response.status, 503);
    assertEquals(response.statusText, 'Under Maintenance');
  });
});

Deno.test('/popular', async (test) => {
  await test.step('normal', async () => {
    const getAllPublicPacksStub = stub(
      db,
      'getPopularPacks',
      () =>
        [
          { pack: { manifest: { id: 'pack-1' } } },
          { pack: { manifest: { id: 'pack-2' } } },
          { pack: { manifest: { id: 'pack-3' } } },
        ] as any,
    );

    config.communityPacksBrowseAPI = true;

    try {
      const request = new Request('http://localhost:8000', { method: 'GET' });

      const response = await communityAPI.popular(request);

      assertEquals(response.ok, true);
      assertEquals(response.status, 200);
      assertEquals(response.statusText, 'OK');

      const data = await response.json();

      assertEquals(data.limit, 20);
      assertEquals(data.offset, 0);

      assertEquals(data.packs[0].manifest.id, 'pack-1');
      assertEquals(data.packs[1].manifest.id, 'pack-2');
      assertEquals(data.packs[2].manifest.id, 'pack-3');
    } finally {
      delete config.communityPacksBrowseAPI;

      getAllPublicPacksStub.restore();
    }
  });

  await test.step('under maintenance', async () => {
    const request = new Request('http://localhost:8000', { method: 'GET' });

    const response = await communityAPI.popular(request);

    assertEquals(response.ok, false);
    assertEquals(response.status, 503);
    assertEquals(response.statusText, 'Under Maintenance');
  });
});

Deno.test('/publish', async (test) => {
  await test.step('normal', async () => {
    const fetchStub = stub(utils, 'fetchWithRetry', () =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'user_id' }),
      } as any));

    const publishPackStub = stub(
      db,
      'publishPack',
      () => [] as any,
    );

    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        headers: { 'authorization': 'Bearer token' },
        body: JSON.stringify({ manifest: { id: 'pack_id' } }),
      });

      const response = await communityAPI.publish(request);

      assertSpyCall(fetchStub, 0, {
        args: ['https://discord.com/api/users/@me', {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            'authorization': `Bearer token`,
          },
        }],
      });

      assertEquals(
        publishPackStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(publishPackStub.calls[0].args[1], { id: 'pack_id' });

      assertEquals(response.ok, true);
      assertEquals(response.status, 201);
      assertEquals(response.statusText, 'Created');
    } finally {
      delete config.communityPacksMaintainerAPI;

      fetchStub.restore();
      publishPackStub.restore();
    }
  });

  await test.step('invalid access token', async () => {
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: false,
          status: 403,
          statusText: 'Unauthorized',
          json: (() =>
            Promise.resolve({
              error: 'invalid access token',
            })),
        } as any,
      ]),
    );

    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        headers: { 'authorization': 'Bearer token' },
        body: JSON.stringify({
          manifest: {
            id: 'pack_id',
          },
        }),
      });

      const response = await communityAPI.publish(request);

      assertSpyCalls(fetchStub, 1);

      assertSpyCall(fetchStub, 0, {
        args: ['https://discord.com/api/users/@me', {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            'authorization': `Bearer token`,
          },
        }],
      });

      assertEquals(response.ok, false);
      assertEquals(response.status, 403);
      assertEquals(response.statusText, 'Unauthorized');

      assertEquals(await response.json(), {
        error: 'invalid access token',
      });
    } finally {
      delete config.communityPacksMaintainerAPI;

      fetchStub.restore();
    }
  });

  await test.step('invalid manifest', async () => {
    const fetchStub = stub(utils, 'fetchWithRetry', () =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'user_id' }),
      } as any));

    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        headers: { 'authorization': 'Bearer token' },
        body: JSON.stringify({
          manifest: {},
        }),
      });

      const response = await communityAPI.publish(request);

      assertEquals(response.ok, false);
      assertEquals(response.status, 400);
      assertEquals(response.statusText, 'Bad Request');

      assertEquals(await response.json(), {
        errors: [
          {
            instancePath: '',
            keyword: 'required',
            message: "must have required property 'id'",
            params: {
              missingProperty: 'id',
            },
            schemaPath: '#/required',
          },
        ],
      });
    } finally {
      delete config.communityPacksMaintainerAPI;

      fetchStub.restore();
    }
  });

  await test.step('permission denied', async () => {
    const fetchStub = stub(utils, 'fetchWithRetry', () =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'user_id' }),
      } as any));

    const publishPackStub = stub(
      db,
      'publishPack',
      () => {
        throw new Error('PERMISSION_DENIED');
      },
    );

    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        headers: { 'authorization': 'Bearer token' },
        body: JSON.stringify({
          manifest: {
            id: 'pack_id',
          },
        }),
      });

      const response = await communityAPI.publish(request);

      assertSpyCall(fetchStub, 0, {
        args: ['https://discord.com/api/users/@me', {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            'authorization': `Bearer token`,
          },
        }],
      });

      assertEquals(
        publishPackStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(publishPackStub.calls[0].args[1], { id: 'pack_id' });

      assertEquals(response.ok, false);
      assertEquals(response.status, 403);
      assertEquals(response.statusText, 'Forbidden');

      assertEquals(await response.json(), {
        error: 'No permission to edit this pack',
      });
    } finally {
      delete config.communityPacksMaintainerAPI;

      fetchStub.restore();
      publishPackStub.restore();
    }
  });

  await test.step('unknown server error', async () => {
    const fetchStub = stub(utils, 'fetchWithRetry', () =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'user_id' }),
      } as any));

    const publishPackStub = stub(
      db,
      'publishPack',
      () => {
        throw new Error();
      },
    );

    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        headers: { 'authorization': 'Bearer token' },
        body: JSON.stringify({ manifest: { id: 'pack_id' } }),
      });

      const response = await communityAPI.publish(request);

      assertSpyCall(fetchStub, 0, {
        args: ['https://discord.com/api/users/@me', {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            'authorization': `Bearer token`,
          },
        }],
      });

      assertEquals(
        publishPackStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(publishPackStub.calls[0].args[1], { id: 'pack_id' });

      assertEquals(response.ok, false);
      assertEquals(response.status, 501);
      assertEquals(response.statusText, 'Internal Server Error');

      assertEquals(await response.json(), {
        error: 'Internal Server Error',
      });
    } finally {
      delete config.communityPacksMaintainerAPI;

      fetchStub.restore();
      publishPackStub.restore();
    }
  });

  await test.step('under maintenance', async () => {
    const request = new Request('http://localhost:8000', {
      method: 'POST',
      headers: { 'authorization': 'Bearer token' },
      body: JSON.stringify({ manifest: { id: 'pack_id' } }),
    });

    const response = await communityAPI.publish(request);

    assertEquals(response.ok, false);
    assertEquals(response.status, 503);
    assertEquals(response.statusText, 'Under Maintenance');
  });
});

Deno.test('/pack', async (test) => {
  await test.step('normal', async () => {
    const getPack = stub(
      db,
      'getPack',
      () =>
        ({
          owner: 'user_id',
          manifest: {
            id: 'pack-id',
            private: false,
          },
        }) as any,
    );

    config.communityPacksBrowseAPI = true;
    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
      });

      const response = await communityAPI.pack(request, {
        packId: 'pack-id',
      });

      assertEquals(response.ok, true);
      assertEquals(response.status, 200);
      assertEquals(response.statusText, 'OK');
    } finally {
      delete config.communityPacksBrowseAPI;
      delete config.communityPacksMaintainerAPI;

      getPack.restore();
    }
  });

  await test.step('not found', async () => {
    const getPack = stub(
      db,
      'getPack',
      () => undefined as any,
    );

    config.communityPacksBrowseAPI = true;
    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
      });

      const response = await communityAPI.pack(request, {
        packId: 'pack-id',
      });

      assertEquals(response.ok, false);
      assertEquals(response.status, 404);
      assertEquals(response.statusText, 'Not Found');
    } finally {
      delete config.communityPacksBrowseAPI;
      delete config.communityPacksMaintainerAPI;

      getPack.restore();
    }
  });

  await test.step('invalid access token (public)', async () => {
    const getPack = stub(
      db,
      'getPack',
      () =>
        ({
          owner: 'user_id',
          manifest: {
            id: 'pack-id',
          },
        }) as any,
    );

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: false,
          status: 403,
          statusText: 'Unauthorized',
          json: (() =>
            Promise.resolve({
              error: 'invalid access token',
            })),
        } as any,
      ]),
    );

    config.communityPacksBrowseAPI = true;
    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
        headers: { 'authorization': 'Bearer token' },
      });

      const response = await communityAPI.pack(request, {
        packId: 'pack-id',
      });

      assertSpyCalls(fetchStub, 1);

      assertSpyCall(fetchStub, 0, {
        args: ['https://discord.com/api/users/@me', {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            'authorization': `Bearer token`,
          },
        }],
      });

      assertEquals(response.ok, true);
      assertEquals(response.status, 200);
      assertEquals(response.statusText, 'OK');
    } finally {
      delete config.communityPacksBrowseAPI;
      delete config.communityPacksMaintainerAPI;

      getPack.restore();
      fetchStub.restore();
    }
  });

  await test.step('missing pack id parameter', async () => {
    config.communityPacksBrowseAPI = true;
    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
      });

      const response = await communityAPI.pack(request, {});

      assertEquals(response.ok, false);
      assertEquals(response.status, 400);
      assertEquals(response.statusText, 'Bad Request');
    } finally {
      delete config.communityPacksBrowseAPI;
      delete config.communityPacksMaintainerAPI;
    }
  });

  await test.step('under maintenance', async () => {
    config.communityPacksBrowseAPI = false;
    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
      });

      const response = await communityAPI.pack(request, {});

      assertEquals(response.ok, false);
      assertEquals(response.status, 503);
      assertEquals(response.statusText, 'Under Maintenance');
    } finally {
      delete config.communityPacksBrowseAPI;
      delete config.communityPacksMaintainerAPI;
    }
  });

  await test.step('under maintenance 2', async () => {
    config.communityPacksBrowseAPI = true;
    config.communityPacksMaintainerAPI = false;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
        headers: { 'authorization': 'Bearer token' },
      });

      const response = await communityAPI.pack(request, {});

      assertEquals(response.ok, false);
      assertEquals(response.status, 503);
      assertEquals(response.statusText, 'Under Maintenance');
    } finally {
      delete config.communityPacksBrowseAPI;
      delete config.communityPacksMaintainerAPI;
    }
  });
});
