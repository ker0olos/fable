import {
  assertEquals,
  assertRejects,
} from 'https://deno.land/std@0.179.0/testing/asserts.ts';

import {
  assertSpyCalls,
  stub,
} from 'https://deno.land/std@0.179.0/testing/mock.ts';
import config from '../src/config.ts';

import webhooks from '../src/webhooks.ts';

Deno.test('topgg', async (test) => {
  await test.step('normal', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              addVoteToUser: {
                ok: true,
              },
            },
          }))),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    config.topggSecret = 'token';

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        body: JSON.stringify({
          isWeekend: false,
          user: 'user_id',
          type: 'upvote',
        }),
        headers: {
          'Authorization': 'token',
        },
      });

      const response = await webhooks.topgg(request);

      assertSpyCalls(fetchStub, 1);

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://graphql.us.fauna.com/graphql',
      );

      assertEquals(response.status, 200);
      assertEquals(response.statusText, 'OK');
    } finally {
      delete config.topggSecret;

      fetchStub.restore();
    }
  });

  await test.step('bad request', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              addVoteToUser: {
                ok: true,
              },
            },
          }))),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    config.topggSecret = 'token';

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        body: JSON.stringify({
          isWeekend: false,
          user: 'user_id',
          type: 'upvote',
        }),
      });

      const response = await webhooks.topgg(request);

      assertSpyCalls(fetchStub, 0);

      assertEquals(response.status, 400);
      assertEquals(response.statusText, 'Bad Request');
    } finally {
      delete config.topggSecret;

      fetchStub.restore();
    }
  });

  await test.step('forbidden', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              addVoteToUser: {
                ok: true,
              },
            },
          }))),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    config.topggSecret = 'token';

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        body: JSON.stringify({
          isWeekend: false,
          user: 'user_id',
          type: 'upvote',
        }),
        headers: {
          'Authorization': 'not_real_token',
        },
      });

      const response = await webhooks.topgg(request);

      assertSpyCalls(fetchStub, 0);

      assertEquals(response.status, 403);
      assertEquals(response.statusText, 'Forbidden');
    } finally {
      delete config.topggSecret;

      fetchStub.restore();
    }
  });

  await test.step('internal', async () => {
    const body = JSON.stringify({
      isWeekend: false,
      user: 'user_id',
      type: 'upvote',
    });

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              addVoteToUser: {
                ok: false,
              },
            },
          }))),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    config.topggSecret = 'token';

    try {
      const request = new Request('http://localhost:8000', {
        body,
        method: 'POST',
        headers: {
          'Authorization': 'token',
        },
      });

      await assertRejects(
        async () => await webhooks.topgg(request),
        Error,
        `failed to reward user with ${body}`,
      );

      assertSpyCalls(fetchStub, 1);

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://graphql.us.fauna.com/graphql',
      );
    } finally {
      delete config.topggSecret;

      fetchStub.restore();
    }
  });
});
