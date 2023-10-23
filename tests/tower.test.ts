// deno-lint-ignore-file no-explicit-any

import { assertEquals } from '$std/assert/mod.ts';

import { FakeTime } from '$std/testing/time.ts';

import { assertSpyCalls, stub } from '$std/testing/mock.ts';

import tower, { MAX_FLOORS } from '../src/tower.ts';

import config from '../src/config.ts';

import db from '../db/mod.ts';
import utils from '../src/utils.ts';

Deno.test('/tower view', async (test) => {
  await test.step('no floor cleared', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

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

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () =>
        ({
          inventory: {
            floorsCleared: undefined,
          },
        }) as any,
    );

    config.combat = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await tower.view({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner3.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 1);

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
          embeds: [
            {
              type: 'rich',
              description: [
                '<:undiscoveredfloor:1128724910609551481> Floor 5 - Undiscovered',
                '<:undiscoveredfloor:1128724910609551481> Floor 4 - Undiscovered',
                '<:undiscoveredfloor:1128724910609551481> Floor 3 - Undiscovered',
                '<:undiscoveredfloor:1128724910609551481> Floor 2 - Undiscovered',
                '<:currentfloor:1128724907245711452> Floor 1 - Current',
              ].join('\n'),
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'tsweep=user_id',
                  disabled: true,
                  label: 'Sweep',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'tchallenge=user_id',
                  disabled: false,
                  label: 'Challenge',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.combat;

      timeStub.restore();
      fetchStub.restore();

      getGuildStub.restore();
      getInstanceStub.restore();
      getUserStub.restore();
      getInventoryStub.restore();
    }
  });

  await test.step('1 floor cleared', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

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

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () =>
        ({
          inventory: {
            floorsCleared: 1,
          },
        }) as any,
    );

    config.combat = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await tower.view({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner3.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 1);

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
          embeds: [
            {
              type: 'rich',
              description: [
                '<:undiscoveredfloor:1128724910609551481> Floor 5 - Undiscovered',
                '<:undiscoveredfloor:1128724910609551481> Floor 4 - Undiscovered',
                '<:undiscoveredfloor:1128724910609551481> Floor 3 - Undiscovered',
                '<:currentfloor:1128724907245711452> Floor 2 - Current',
                '<:clearedfloor:1131872032456446053> Floor 1 - Cleared',
              ].join('\n'),
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'tsweep=user_id',
                  disabled: false,
                  label: 'Sweep',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'tchallenge=user_id',
                  disabled: false,
                  label: 'Challenge',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.combat;

      timeStub.restore();
      fetchStub.restore();

      getGuildStub.restore();
      getInstanceStub.restore();
      getUserStub.restore();
      getInventoryStub.restore();
    }
  });

  await test.step('2 floors cleared', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

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

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () =>
        ({
          inventory: {
            floorsCleared: 2,
          },
        }) as any,
    );

    config.combat = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await tower.view({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner3.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 1);

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
          embeds: [
            {
              type: 'rich',
              description: [
                '<:undiscoveredfloor:1128724910609551481> Floor 5 - Undiscovered',
                '<:undiscoveredfloor:1128724910609551481> Floor 4 - Undiscovered',
                '<:currentfloor:1128724907245711452> Floor 3 - Current',
                '<:clearedfloor:1131872032456446053> Floor 2 - Cleared',
                '<:clearedfloor:1131872032456446053> Floor 1 - Cleared',
              ].join('\n'),
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'tsweep=user_id',
                  disabled: false,
                  label: 'Sweep',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'tchallenge=user_id',
                  disabled: false,
                  label: 'Challenge',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.combat;

      timeStub.restore();
      fetchStub.restore();

      getGuildStub.restore();
      getInstanceStub.restore();
      getUserStub.restore();
      getInventoryStub.restore();
    }
  });

  await test.step('5 floors cleared', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

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

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () =>
        ({
          inventory: {
            floorsCleared: 5,
          },
        }) as any,
    );

    config.combat = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await tower.view({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner3.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 1);

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
          embeds: [
            {
              type: 'rich',
              description: [
                '<:undiscoveredfloor:1128724910609551481> Floor 8 - Undiscovered',
                '<:undiscoveredfloor:1128724910609551481> Floor 7 - Undiscovered',
                '<:currentfloor:1128724907245711452> Floor 6 - Current',
                '<:clearedfloor:1131872032456446053> Floor 5 - Cleared',
                '<:clearedfloor:1131872032456446053> Floor 4 - Cleared',
              ].join('\n'),
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'tsweep=user_id',
                  disabled: false,
                  label: 'Sweep',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'tchallenge=user_id',
                  disabled: false,
                  label: 'Challenge',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.combat;

      timeStub.restore();
      fetchStub.restore();

      getGuildStub.restore();
      getInstanceStub.restore();
      getUserStub.restore();
      getInventoryStub.restore();
    }
  });

  await test.step('max-2 floors cleared', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

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

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () =>
        ({
          inventory: {
            floorsCleared: MAX_FLOORS - 2,
          },
        }) as any,
    );

    config.combat = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await tower.view({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner3.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 1);

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
          embeds: [
            {
              type: 'rich',
              description: [
                '<:undiscoveredfloor:1128724910609551481> Floor 10 - Undiscovered',
                '<:currentfloor:1128724907245711452> Floor 9 - Current',
                '<:clearedfloor:1131872032456446053> Floor 8 - Cleared',
                '<:clearedfloor:1131872032456446053> Floor 7 - Cleared',
                '<:clearedfloor:1131872032456446053> Floor 6 - Cleared',
              ].join('\n'),
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'tsweep=user_id',
                  disabled: false,
                  label: 'Sweep',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'tchallenge=user_id',
                  disabled: false,
                  label: 'Challenge',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.combat;

      timeStub.restore();
      fetchStub.restore();

      getGuildStub.restore();
      getInstanceStub.restore();
      getUserStub.restore();
      getInventoryStub.restore();
    }
  });

  await test.step('max-1 floors cleared', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

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

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () =>
        ({
          inventory: {
            floorsCleared: MAX_FLOORS - 1,
          },
        }) as any,
    );

    config.combat = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await tower.view({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner3.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 1);

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
          embeds: [
            {
              type: 'rich',
              description: [
                '<:currentfloor:1128724907245711452> Floor 10 - Current',
                '<:clearedfloor:1131872032456446053> Floor 9 - Cleared',
                '<:clearedfloor:1131872032456446053> Floor 8 - Cleared',
                '<:clearedfloor:1131872032456446053> Floor 7 - Cleared',
                '<:clearedfloor:1131872032456446053> Floor 6 - Cleared',
              ].join('\n'),
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'tsweep=user_id',
                  disabled: false,
                  label: 'Sweep',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'tchallenge=user_id',
                  disabled: false,
                  label: 'Challenge',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.combat;

      timeStub.restore();
      fetchStub.restore();

      getGuildStub.restore();
      getInstanceStub.restore();
      getUserStub.restore();
      getInventoryStub.restore();
    }
  });

  await test.step('max floors cleared', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

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

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () =>
        ({
          inventory: {
            floorsCleared: MAX_FLOORS,
          },
        }) as any,
    );

    config.combat = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await tower.view({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner3.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 1);

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
          embeds: [
            {
              type: 'rich',
              description: [
                '<:clearedfloor:1131872032456446053> Floor 10 - Cleared',
                '<:clearedfloor:1131872032456446053> Floor 9 - Cleared',
                '<:clearedfloor:1131872032456446053> Floor 8 - Cleared',
                '<:clearedfloor:1131872032456446053> Floor 7 - Cleared',
                '<:clearedfloor:1131872032456446053> Floor 6 - Cleared',
              ].join('\n'),
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'tsweep=user_id',
                  disabled: false,
                  label: 'Sweep',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'tchallenge=user_id',
                  disabled: true,
                  label: 'Challenge',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.combat;

      timeStub.restore();
      fetchStub.restore();

      getGuildStub.restore();
      getInstanceStub.restore();
      getUserStub.restore();
      getInventoryStub.restore();
    }
  });
});
