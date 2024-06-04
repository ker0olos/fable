// deno-lint-ignore-file no-explicit-any

import { assertEquals } from '$std/assert/mod.ts';

import { assertSpyCallArgs, stub } from '$std/testing/mock.ts';

import { FakeTime } from '$std/testing/time.ts';

import serverOptions from '~/src/serverOptions.ts';

import utils from '~/src/utils.ts';

import db from '~/db/mod.ts';

Deno.test('/server options', async (test) => {
  await test.step('dupes allowed', async () => {
    const getGuildStub = stub(
      db,
      'getGuild',
      () => Promise.resolve({ options: { dupes: true } }) as any,
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    try {
      const message = serverOptions.view({
        token: 'test_token',
        guildId: 'guild_id',
        userId: 'user_id',
      });

      assertSpyCallArgs(getGuildStub, 0, [
        'guild_id',
      ]);

      assertEquals(message.json(), {
        type: 4,
        data: {
          flags: 64,
          attachments: [{ filename: 'spinner3.gif', id: '0' }],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'attachment://spinner3.gif',
            },
          }],
        },
      });

      await timeStub.nextAsync();

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [{
            type: 1,
            components: [{
              custom_id: 'options=dupes',
              label: 'Disallow Dupes',
              style: 2,
              type: 2,
            }],
          }],
          embeds: [{
            type: 'rich',
            fields: [{
              name: 'Dupes is allowed',
              value: 'Multiple users can own the same character.',
            }],
          }],
        },
      );
    } finally {
      getGuildStub.restore();
      timeStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('dupes disallowed', async () => {
    const getGuildStub = stub(
      db,
      'getGuild',
      () => Promise.resolve({ options: { dupes: false } }) as any,
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    try {
      const message = serverOptions.view({
        token: 'test_token',
        guildId: 'guild_id',
        userId: 'user_id',
      });

      assertSpyCallArgs(getGuildStub, 0, [
        'guild_id',
      ]);

      assertEquals(message.json(), {
        type: 4,
        data: {
          flags: 64,
          attachments: [{ filename: 'spinner3.gif', id: '0' }],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'attachment://spinner3.gif',
            },
          }],
        },
      });

      await timeStub.nextAsync();

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [{
            type: 1,
            components: [{
              custom_id: 'options=dupes',
              label: 'Allow Dupes',
              style: 2,
              type: 2,
            }],
          }],
          embeds: [{
            type: 'rich',
            fields: [{
              name: 'Dupes is disallowed',
              value: 'Only one user can own a character.',
            }],
          }],
        },
      );
    } finally {
      getGuildStub.restore();
      timeStub.restore();
      fetchStub.restore();
    }
  });
});

Deno.test('invert dupes', async (test) => {
  await test.step('normal', async () => {
    const getGuildStub = stub(
      db,
      'invertDupes',
      () => Promise.resolve({ options: { dupes: true } }) as any,
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    try {
      const message = serverOptions.invertDupes({
        token: 'test_token',
        guildId: 'guild_id',
        userId: 'user_id',
      });

      assertSpyCallArgs(getGuildStub, 0, [
        'guild_id',
      ]);

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [{ filename: 'spinner3.gif', id: '0' }],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'attachment://spinner3.gif',
            },
          }],
        },
      });

      await timeStub.nextAsync();

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [{
            type: 1,
            components: [{
              custom_id: 'options=dupes',
              label: 'Disallow Dupes',
              style: 2,
              type: 2,
            }],
          }],
          embeds: [{
            type: 'rich',
            fields: [{
              name: 'Dupes is allowed',
              value: 'Multiple users can own the same character.',
            }],
          }],
        },
      );
    } finally {
      getGuildStub.restore();
      timeStub.restore();
      fetchStub.restore();
    }
  });
});
