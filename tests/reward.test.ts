// deno-lint-ignore-file no-explicit-any

import { assertEquals } from '$std/assert/mod.ts';

import { assertSpyCallArgs, stub } from '$std/testing/mock.ts';

import reward from '~/src/reward.ts';

import config from '~/src/config.ts';

import db from '~/db/mod.ts';
import { FakeTime } from '$std/testing/time.ts';
import utils from '~/src/utils.ts';

Deno.test('/reward pulls', async (test) => {
  await test.step('normal dialog', () => {
    const message = reward.pulls({
      targetId: 'another_user_id',
      userId: 'user_id',
      amount: 1,
    });

    assertEquals(message.json(), {
      type: 4,
      data: {
        attachments: [],
        components: [{
          type: 1,
          components: [
            {
              custom_id: 'reward=pulls=user_id=another_user_id=1',
              label: 'Confirm',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'cancel=user_id',
              label: 'Cancel',
              style: 4,
              type: 2,
            },
          ],
        }],
        embeds: [{
          type: 'rich',
          description:
            'You want to reward <@another_user_id> **1** pull <:add:1099004747123523644>?',
        }],
      },
    });
  });

  await test.step('normal dialog (plural)', () => {
    config.shop = true;

    const message = reward.pulls({
      targetId: 'another_user_id',
      userId: 'user_id',
      amount: 4,
    });

    assertEquals(message.json(), {
      type: 4,
      data: {
        attachments: [],
        components: [{
          type: 1,
          components: [
            {
              custom_id: 'reward=pulls=user_id=another_user_id=4',
              label: 'Confirm',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'cancel=user_id',
              label: 'Cancel',
              style: 4,
              type: 2,
            },
          ],
        }],
        embeds: [{
          type: 'rich',
          description:
            'You want to reward <@another_user_id> **4** pulls <:add:1099004747123523644>?',
        }],
      },
    });
  });

  await test.step('normal confirmed', async () => {
    const timeStub = new FakeTime();

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const addPullsStub = stub(
      db,
      'addPulls',
      () => '_' as any,
    );

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await reward.confirmPulls({
        userId: 'user_id',
        targetId: 'another_user_id',
        token: 'test_token',
        guildId: 'guild_id',
        amount: 1,
      });

      assertSpyCallArgs(addPullsStub, 0, [
        'another_user_id',
        'guild_id',
        1,
        true,
      ]);

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description:
                'You rewarded <@another_user_id> **1** pull <:add:1099004747123523644>',
            },
          ],
        },
      );

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'POST');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [],
          content: '<@another_user_id>',
          embeds: [
            {
              type: 'rich',
              description:
                '<@user_id> rewarded you **1** pull <:add:1099004747123523644>',
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      getUserStub.restore();
      getGuildStub.restore();
      addPullsStub.restore();
    }
  });

  await test.step('normal confirmed (plural)', async () => {
    const timeStub = new FakeTime();

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const addPullsStub = stub(
      db,
      'addPulls',
      () => '_' as any,
    );

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await reward.confirmPulls({
        userId: 'user_id',
        targetId: 'another_user_id',
        token: 'test_token',
        guildId: 'guild_id',
        amount: 4,
      });

      assertSpyCallArgs(addPullsStub, 0, [
        'another_user_id',
        'guild_id',
        4,
        true,
      ]);

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description:
                'You rewarded <@another_user_id> **4** pulls <:add:1099004747123523644>',
            },
          ],
        },
      );

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'POST');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [],
          content: '<@another_user_id>',
          embeds: [
            {
              type: 'rich',
              description:
                '<@user_id> rewarded you **4** pulls <:add:1099004747123523644>',
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      getUserStub.restore();
      getGuildStub.restore();
      addPullsStub.restore();
    }
  });
});
