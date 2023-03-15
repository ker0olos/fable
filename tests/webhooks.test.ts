import {
  assertEquals,
  assertRejects,
} from 'https://deno.land/std@0.179.0/testing/asserts.ts';

import {
  assertSpyCall,
  assertSpyCalls,
  spy,
  stub,
} from 'https://deno.land/std@0.179.0/testing/mock.ts';

import utils from '../src/utils.ts';
import config from '../src/config.ts';
import user from '../src/user.ts';

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

    config.topggSecret = 'x'.repeat(32);

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        body: JSON.stringify({
          isWeekend: false,
          user: 'user_id',
          type: 'upvote',
        }),
        headers: {
          'Authorization': config.topggSecret,
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

  await test.step('patch /now', async () => {
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

    const contentStub = spy(() => true);
    const patchStub = spy(() => true);

    const userStub = stub(
      user,
      'now',
      () =>
        Promise.resolve({
          setContent: contentStub,
          patch: patchStub,
          // deno-lint-ignore no-explicit-any
        } as any),
    );

    config.topggCipher = 12;
    config.topggSecret = 'x'.repeat(32);

    try {
      const token = utils.cipher('query_ref', config.topggCipher);

      const request = new Request('http://localhost:8000', {
        method: 'POST',
        body: JSON.stringify({
          query: `?ref=${token}&gid=query_guild_id`,
          isWeekend: false,
          user: 'user_id',
          type: 'upvote',
        }),
        headers: {
          'Authorization': config.topggSecret,
        },
      });

      const response = await webhooks.topgg(request);

      assertSpyCalls(fetchStub, 1);

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://graphql.us.fauna.com/graphql',
      );

      assertSpyCall(userStub, 0, {
        args: [{
          token: 'query_ref',
          guildId: 'query_guild_id',
          userId: 'user_id',
        }],
      });

      assertSpyCall(contentStub, 0, {
        args: ['<@user_id>'],
      });

      assertSpyCall(patchStub, 0, {
        args: ['query_ref'],
      });

      assertEquals(response.status, 200);
      assertEquals(response.statusText, 'OK');
    } finally {
      delete config.topggCipher;
      delete config.topggSecret;

      fetchStub.restore();
      userStub.restore();
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

    config.topggSecret = 'x'.repeat(32);

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

  await test.step('non-string topgg secret', async () => {
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

    config.topggSecret = 1234 as unknown as string;

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        body: JSON.stringify({
          isWeekend: false,
          user: 'user_id',
          type: 'upvote',
        }),
        headers: {
          'Authorization': config.topggSecret,
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

  await test.step('short topgg secret', async () => {
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

    config.topggSecret = 'x'.repeat(28);

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        body: JSON.stringify({
          isWeekend: false,
          user: 'user_id',
          type: 'upvote',
        }),
        headers: {
          'Authorization': config.topggSecret,
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

  await test.step('fake auth token', async () => {
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

    config.topggSecret = 'x'.repeat(32);

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

    config.topggSecret = 'x'.repeat(32);

    try {
      const request = new Request('http://localhost:8000', {
        body,
        method: 'POST',
        headers: {
          'Authorization': config.topggSecret,
        },
      });

      await assertRejects(
        async () => await webhooks.topgg(request),
        Error,
        `failed to reward user`,
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
