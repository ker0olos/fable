// deno-lint-ignore-file no-explicit-any

import { assertEquals } from '$std/assert/mod.ts';

import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from '$std/testing/mock.ts';

import utils from '../src/utils.ts';
import community from '../src/community.ts';

import db from '../db/mod.ts';

Deno.test('/', async (test) => {
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

    const getPacksByUserIdStub = stub(
      db,
      'getPacksByUserId',
      () => [] as any,
    );

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
        headers: { 'authorization': 'Bearer token' },
      });

      const response = await community.query(request);

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
        getPacksByUserIdStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(response.ok, true);
      assertEquals(response.status, 200);
      assertEquals(response.statusText, 'OK');
    } finally {
      fetchStub.restore();
      getPacksByUserIdStub.restore();
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

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
        headers: { 'authorization': 'Bearer token' },
      });

      const response = await community.query(request);

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
      fetchStub.restore();
    }
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
      assertEquals(response.status, 200);
      assertEquals(response.statusText, 'OK');
    } finally {
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
      fetchStub.restore();
      publishPackStub.restore();
    }
  });
});
