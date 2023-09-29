// deno-lint-ignore-file no-explicit-any

import { assertEquals } from '$std/assert/mod.ts';

import { FakeTime } from '$std/testing/time.ts';

import { assertSpyCall, assertSpyCalls, spy, stub } from '$std/testing/mock.ts';

import utils from '../src/utils.ts';

import user from '../src/user.ts';

import config from '../src/config.ts';

import webhooks from '../src/webhooks.ts';

import db from '../db/mod.ts';

Deno.test('topgg', async (test) => {
  await test.step('normal', async () => {
    const addTokensStub = stub(
      db,
      'addTokens',
      () => undefined as any,
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => undefined as any,
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
        headers: { 'Authorization': config.topggSecret },
      });

      const response = await webhooks.topgg(request);

      assertEquals(
        getUserStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(
        addTokensStub.calls[0].args[1],
        1,
      );

      assertEquals(response.status, 200);
      assertEquals(response.statusText, 'OK');
    } finally {
      delete config.topggSecret;

      addTokensStub.restore();
      getUserStub.restore();
    }
  });

  await test.step('weekend', async () => {
    const addTokensStub = stub(
      db,
      'addTokens',
      () => undefined as any,
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => undefined as any,
    );

    config.topggSecret = 'x'.repeat(32);

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        body: JSON.stringify({
          isWeekend: true,
          user: 'user_id',
          type: 'upvote',
        }),
        headers: { 'Authorization': config.topggSecret },
      });

      const response = await webhooks.topgg(request);

      assertEquals(
        getUserStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(
        addTokensStub.calls[0].args[1],
        2,
      );

      assertEquals(response.status, 200);
      assertEquals(response.statusText, 'OK');
    } finally {
      delete config.topggSecret;

      addTokensStub.restore();
      getUserStub.restore();
    }
  });

  await test.step('patch /now', async () => {
    const timeStub = new FakeTime();

    const resolveVoteRef = stub(
      db,
      'resolveVoteRef',
      () => ({ guildId: 'guild_id', token: 'token' }) as any,
    );

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => (undefined as any),
    );

    const addTokensStub = stub(
      db,
      'addTokens',
      () => undefined as any,
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => undefined as any,
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
    config.topggSecret = 'x'.repeat(32);

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        body: JSON.stringify({
          query: `?ref=fake_ref`,
          isWeekend: false,
          user: 'user_id',
          type: 'upvote',
        }),
        headers: { 'Authorization': config.topggSecret },
      });

      await webhooks.topgg(request);

      assertEquals(
        getUserStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(
        addTokensStub.calls[0].args[1],
        1,
      );

      await timeStub.runMicrotasks();

      assertSpyCall(userStub, 0, {
        args: [{
          token: 'token',
          guildId: 'guild_id',
          userId: 'user_id',
        }],
      });

      assertSpyCall(setContentStub, 0, {
        args: ['<@user_id>'],
      });

      assertSpyCall(patchStub, 0, {
        args: ['token'],
      });

      assertEquals(
        fetchStub.calls[0].args[0],
        `https://discord.com/api/v10/webhooks/app_id/token`,
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'POST');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          content: 'Thanks for voting, <@user_id>, you gained 1 token.',
          components: [{
            type: 1,
            components: [{
              custom_id: 'help==4',
              label: '/help shop',
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
      delete config.topggSecret;

      timeStub.restore();
      resolveVoteRef.restore();
      fetchStub.restore();
      addTokensStub.restore();
      getUserStub.restore();
      userStub.restore();
    }
  });

  await test.step('bad request', async () => {
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
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
      utils,
      'fetchWithRetry',
      () => undefined as any,
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
      utils,
      'fetchWithRetry',
      () => undefined as any,
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
      utils,
      'fetchWithRetry',
      () => undefined as any,
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
});
