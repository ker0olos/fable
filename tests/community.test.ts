// deno-lint-ignore-file no-explicit-any

import { assertEquals } from '$std/assert/mod.ts';

import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from '$std/testing/mock.ts';

import utils from '../src/utils.ts';

import * as community from '../src/community.ts';

import db from '../db/mod.ts';

import config from '../src/config.ts';

Deno.test('/user', async (test) => {
  await test.step('normal', async () => {
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              id: 'user_id',
            })),
        } as any,
      ]),
    );

    const getPacksByMaintainerIdStub = stub(
      db,
      'getPacksByMaintainerId',
      () => [] as any,
    );

    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
        headers: { 'authorization': 'Bearer token' },
      });

      const response = await community.user(request);

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
        getPacksByMaintainerIdStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(response.ok, true);
      assertEquals(response.status, 200);
      assertEquals(response.statusText, 'OK');
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

      const response = await community.user(request);

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

    const response = await community.user(request);

    assertEquals(response.ok, false);
    assertEquals(response.status, 503);
    assertEquals(response.statusText, 'Under Maintenance');
  });
});

Deno.test('/publish', async (test) => {
  await test.step('normal', async () => {
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              id: 'user_id',
            })),
        } as any,
      ]),
    );

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

      const response = await community.publish(request);

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

      const response = await community.publish(request);

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
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              id: 'user_id',
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
          manifest: {},
        }),
      });

      const response = await community.publish(request);

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
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              id: 'user_id',
            })),
        } as any,
      ]),
    );

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

      const response = await community.publish(request);

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
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              id: 'user_id',
            })),
        } as any,
      ]),
    );

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

      const response = await community.publish(request);

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

    const response = await community.publish(request);

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

      const response = await community.pack(request, {
        packId: 'pack-id',
      });

      assertEquals(getPack.calls[0].args[0], 'pack-id');

      assertEquals(response.ok, true);
      assertEquals(response.status, 200);
      assertEquals(response.statusText, 'OK');
    } finally {
      delete config.communityPacksBrowseAPI;
      delete config.communityPacksMaintainerAPI;

      getPack.restore();
    }
  });

  await test.step('private pack with authorization as owner', async () => {
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        { ok: true, json: (() => Promise.resolve({ id: 'user_id' })) } as any,
      ]),
    );

    const getPack = stub(
      db,
      'getPack',
      () =>
        ({
          owner: 'user_id',
          manifest: {
            private: true,
          },
        }) as any,
    );

    config.communityPacksBrowseAPI = true;
    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
        headers: { 'authorization': 'Bearer token' },
      });

      const response = await community.pack(request, {
        packId: 'pack-id',
      });

      assertSpyCall(fetchStub, 0, {
        args: ['https://discord.com/api/users/@me', {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            'authorization': `Bearer token`,
          },
        }],
      });

      assertEquals(getPack.calls[0].args[0], 'pack-id');

      assertEquals(response.ok, true);
      assertEquals(response.status, 200);
      assertEquals(response.statusText, 'OK');
    } finally {
      delete config.communityPacksBrowseAPI;
      delete config.communityPacksMaintainerAPI;

      fetchStub.restore();
      getPack.restore();
    }
  });

  await test.step('private pack with authorization as maintainer', async () => {
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        { ok: true, json: (() => Promise.resolve({ id: 'user_id' })) } as any,
      ]),
    );

    const getPack = stub(
      db,
      'getPack',
      () =>
        ({
          owner: 'another_user_id',
          manifest: {
            private: true,
            maintainers: ['user_id'],
          },
        }) as any,
    );

    config.communityPacksBrowseAPI = true;
    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
        headers: { 'authorization': 'Bearer token' },
      });

      const response = await community.pack(request, {
        packId: 'pack-id',
      });

      assertSpyCall(fetchStub, 0, {
        args: ['https://discord.com/api/users/@me', {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            'authorization': `Bearer token`,
          },
        }],
      });

      assertEquals(getPack.calls[0].args[0], 'pack-id');

      assertEquals(response.ok, true);
      assertEquals(response.status, 200);
      assertEquals(response.statusText, 'OK');
    } finally {
      delete config.communityPacksBrowseAPI;
      delete config.communityPacksMaintainerAPI;

      fetchStub.restore();
      getPack.restore();
    }
  });

  await test.step('private pack with wrong authorization', async () => {
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        { ok: true, json: (() => Promise.resolve({ id: 'user_id' })) } as any,
      ]),
    );

    const getPack = stub(
      db,
      'getPack',
      () =>
        ({
          owner: 'another_user_id',
          manifest: {
            private: true,
            maintainers: ['another_user_id_2'],
          },
        }) as any,
    );

    config.communityPacksBrowseAPI = true;
    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
        headers: { 'authorization': 'Bearer token' },
      });

      const response = await community.pack(request, {
        packId: 'pack-id',
      });

      assertSpyCall(fetchStub, 0, {
        args: ['https://discord.com/api/users/@me', {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            'authorization': `Bearer token`,
          },
        }],
      });

      assertEquals(getPack.calls[0].args[0], 'pack-id');

      assertEquals(response.ok, false);
      assertEquals(response.status, 403);
      assertEquals(response.statusText, 'Forbidden');
    } finally {
      delete config.communityPacksBrowseAPI;
      delete config.communityPacksMaintainerAPI;

      fetchStub.restore();
      getPack.restore();
    }
  });

  await test.step('private pack without authorization', async () => {
    const getPack = stub(
      db,
      'getPack',
      () =>
        ({
          owner: 'user_id',
          manifest: {
            private: true,
          },
        }) as any,
    );

    config.communityPacksBrowseAPI = true;
    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
      });

      const response = await community.pack(request, {
        packId: 'pack-id',
      });

      assertEquals(getPack.calls[0].args[0], 'pack-id');

      assertEquals(response.ok, false);
      assertEquals(response.status, 403);
      assertEquals(response.statusText, 'Forbidden');
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

      const response = await community.pack(request, {
        packId: 'pack-id',
      });

      assertEquals(getPack.calls[0].args[0], 'pack-id');

      assertEquals(response.ok, false);
      assertEquals(response.status, 404);
      assertEquals(response.statusText, 'Not Found');
    } finally {
      delete config.communityPacksBrowseAPI;
      delete config.communityPacksMaintainerAPI;

      getPack.restore();
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

    config.communityPacksBrowseAPI = true;
    config.communityPacksMaintainerAPI = true;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
        headers: { 'authorization': 'Bearer token' },
      });

      const response = await community.pack(request, {
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

      assertEquals(response.ok, false);
      assertEquals(response.status, 403);
      assertEquals(response.statusText, 'Unauthorized');

      assertEquals(await response.json(), {
        error: 'invalid access token',
      });
    } finally {
      delete config.communityPacksBrowseAPI;
      delete config.communityPacksMaintainerAPI;

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

      const response = await community.pack(request, {});

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

      const response = await community.pack(request, {});

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

      const response = await community.pack(request, {});

      assertEquals(response.ok, false);
      assertEquals(response.status, 503);
      assertEquals(response.statusText, 'Under Maintenance');
    } finally {
      delete config.communityPacksBrowseAPI;
      delete config.communityPacksMaintainerAPI;
    }
  });
});
