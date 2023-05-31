// deno-lint-ignore-file no-explicit-any

import { assertEquals } from '$std/testing/asserts.ts';

import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from '$std/testing/mock.ts';

import config from '../src/config.ts';

import marketplace from '../src/marketplace.ts';

Deno.test('/publish', async (test) => {
  await test.step('normal', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              id: 'user_id',
            })),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                publishPack: {
                  ok: true,
                },
              },
            }))),
        } as any,
      ]),
    );

    config.faunaSecret = 'fauna_secret';

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        body: JSON.stringify({
          accessToken: 'token',
          manifest: {
            id: 'pack_id',
          },
        }),
      });

      const response = await marketplace.publish(request);

      assertSpyCalls(fetchStub, 2);

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
        fetchStub.calls[1].args[0],
        'https://graphql.us.fauna.com/graphql',
      );

      assertEquals(
        fetchStub.calls[1].args[1]?.headers?.entries,
        new Headers({
          accept: 'application/json',
          authorization: 'Bearer fauna_secret',
          'content-type': 'application/json',
        }).entries,
      );

      assertEquals(
        JSON.parse(fetchStub.calls[1].args[1]?.body as string).variables,
        {
          manifest: {
            id: 'pack_id',
          },
          userId: 'user_id',
        },
      );

      assertEquals(response.ok, true);
      assertEquals(response.status, 200);
      assertEquals(response.statusText, 'OK');
    } finally {
      delete config.faunaSecret;

      fetchStub.restore();
    }
  });

  await test.step('get method', async () => {
    const request = new Request('http://localhost:8000', {
      method: 'GET',
    });

    const response = await marketplace.publish(request);

    assertEquals(response.ok, false);
    assertEquals(response.status, 405);
    assertEquals(response.statusText, 'Method Not Allowed');
  });

  await test.step('missing access token', async () => {
    const request = new Request('http://localhost:8000', {
      method: 'POST',
      body: JSON.stringify({
        manifest: {
          id: 'pack_id',
        },
      }),
    });

    const response = await marketplace.publish(request);

    assertEquals(response.ok, false);
    assertEquals(response.status, 400);
    assertEquals(response.statusText, 'Bad Request');

    assertEquals(await response.json(), {
      error: 'field \'accessToken\' is not available in the body',
    });
  });

  await test.step('missing manifest', async () => {
    const request = new Request('http://localhost:8000', {
      method: 'POST',
      body: JSON.stringify({
        accessToken: 'token',
      }),
    });

    const response = await marketplace.publish(request);

    assertEquals(response.ok, false);
    assertEquals(response.status, 400);
    assertEquals(response.statusText, 'Bad Request');

    assertEquals(await response.json(), {
      error: 'field \'manifest\' is not available in the body',
    });
  });

  await test.step('invalid access token', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
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
        body: JSON.stringify({
          accessToken: 'token',
          manifest: {
            id: 'pack_id',
          },
        }),
      });

      const response = await marketplace.publish(request);

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

  await test.step('permission denied', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              id: 'user_id',
            })),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                publishPack: {
                  ok: false,
                  error: 'PERMISSION_DENIED',
                },
              },
            }))),
        } as any,
      ]),
    );

    config.faunaSecret = 'fauna_secret';

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        body: JSON.stringify({
          accessToken: 'token',
          manifest: {
            id: 'pack_id',
          },
        }),
      });

      const response = await marketplace.publish(request);

      assertSpyCalls(fetchStub, 2);

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
        fetchStub.calls[1].args[0],
        'https://graphql.us.fauna.com/graphql',
      );

      assertEquals(
        fetchStub.calls[1].args[1]?.headers?.entries,
        new Headers({
          accept: 'application/json',
          authorization: 'Bearer fauna_secret',
          'content-type': 'application/json',
        }).entries,
      );

      assertEquals(
        JSON.parse(fetchStub.calls[1].args[1]?.body as string).variables,
        {
          manifest: {
            id: 'pack_id',
          },
          userId: 'user_id',
        },
      );

      assertEquals(response.ok, false);
      assertEquals(response.status, 403);
      assertEquals(response.statusText, 'Forbidden');

      assertEquals(await response.json(), {
        error: 'No permission to edit this pack',
      });
    } finally {
      delete config.faunaSecret;

      fetchStub.restore();
    }
  });

  await test.step('unknown server error', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              id: 'user_id',
            })),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                publishPack: {
                  ok: false,
                },
              },
            }))),
        } as any,
      ]),
    );

    config.faunaSecret = 'fauna_secret';

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        body: JSON.stringify({
          accessToken: 'token',
          manifest: {
            id: 'pack_id',
          },
        }),
      });

      const response = await marketplace.publish(request);

      assertSpyCalls(fetchStub, 2);

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
        fetchStub.calls[1].args[0],
        'https://graphql.us.fauna.com/graphql',
      );

      assertEquals(
        fetchStub.calls[1].args[1]?.headers?.entries,
        new Headers({
          accept: 'application/json',
          authorization: 'Bearer fauna_secret',
          'content-type': 'application/json',
        }).entries,
      );

      assertEquals(
        JSON.parse(fetchStub.calls[1].args[1]?.body as string).variables,
        {
          manifest: {
            id: 'pack_id',
          },
          userId: 'user_id',
        },
      );

      assertEquals(response.ok, false);
      assertEquals(response.status, 501);
      assertEquals(response.statusText, 'Internal Server Error');

      assertEquals(await response.json(), {
        error: 'Internal Server Error',
      });
    } finally {
      delete config.faunaSecret;

      fetchStub.restore();
    }
  });
});
