// deno-lint-ignore-file no-explicit-any

import {
  assertEquals,
  assertRejects,
} from 'https://deno.land/std@0.186.0/testing/asserts.ts';

import {
  assertSpyCall,
  assertSpyCalls,
  spy,
  stub,
} from 'https://deno.land/std@0.186.0/testing/mock.ts';

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
      } as any),
    );

    const patchStub = spy(() => true);

    const setContentStub = spy(() => ({
      patch: patchStub,
    }));

    const userStub = stub(
      user,
      'now',
      () =>
        Promise.resolve({
          setContent: setContentStub,
        } as any),
    );

    config.appId = 'app_id';
    config.topggCipher = 12;
    config.topggSecret = 'x'.repeat(32);

    try {
      const token = 'bj7!Qrw@BXL9QCQtt!4h2PZNvnke5ZPe';

      const cipher = utils.cipher(token, config.topggCipher);

      const request = new Request('http://localhost:8000', {
        method: 'POST',
        body: JSON.stringify({
          query: `?ref=${cipher}&gid=query_guild_id`,
          isWeekend: false,
          user: 'user_id',
          type: 'upvote',
        }),
        headers: {
          'Authorization': config.topggSecret,
        },
      });

      await webhooks.topgg(request);

      assertSpyCalls(fetchStub, 2);

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://graphql.us.fauna.com/graphql',
      );

      assertSpyCall(userStub, 0, {
        args: [{
          token,
          guildId: 'query_guild_id',
          userId: 'user_id',
        }],
      });

      assertSpyCall(setContentStub, 0, {
        args: ['<@user_id>'],
      });

      assertSpyCall(patchStub, 0, {
        args: [token],
      });

      assertEquals(
        fetchStub.calls[1].args[0],
        `https://discord.com/api/v10/webhooks/app_id/${token}`,
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'POST');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          content: 'Thanks for voting, <@user_id>.',
          components: [{
            type: 1,
            components: [{
              custom_id: 'help==3',
              label: '/help voting',
              style: 2,
              type: 2,
            }],
          }],
          embeds: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
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
