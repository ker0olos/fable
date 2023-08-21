// deno-lint-ignore-file no-explicit-any

/// <reference lib="deno.unstable" />

import { assertSpyCall, spy, stub } from '$std/testing/mock.ts';

import { assertEquals } from '$std/testing/asserts.ts';

import db from './mod.ts';

Deno.test('get user', async (test) => {
  await test.step('get', async () => {
    const kv = {
      get: spy(() => ({
        value: {
          _id: 'uuid',
          id: 'user_id',
          inventories: [],
        },
      })),
    } as unknown as Deno.Kv;

    const user = await db.getUser(kv, 'user_id');

    assertSpyCall(kv.get as any, 0, {
      args: [
        ['users_by_discord_id', 'user_id'],
      ],
    });

    assertEquals(user, {
      _id: 'uuid',
      id: 'user_id',
      inventories: [],
    });
  });

  await test.step('insert new', async () => {
    const cryptoStub = stub(crypto, 'randomUUID', () => 'uuid' as any);

    const checkSpy = spy(() => atomic);

    const setSpy = spy(() => atomic);

    const atomic: any = {
      commit: spy(() => ({ ok: true })),
      check: checkSpy,
      set: setSpy,
    };

    const kv = {
      get: spy(() => ({})),
      atomic: spy(() => atomic),
    } as unknown as Deno.Kv;

    try {
      const user = await db.getUser(kv, 'user_id');

      assertSpyCall(kv.get as any, 0, {
        args: [
          ['users_by_discord_id', 'user_id'],
        ],
      });

      assertSpyCall(checkSpy, 0, {
        args: [
          {
            key: [
              'users_by_discord_id',
              'user_id',
            ],
            versionstamp: null,
          },
        ],
      });

      assertSpyCall(setSpy, 0, {
        args: [
          [
            'users',
            'uuid',
          ],
          {
            _id: 'uuid',
            id: 'user_id',
            inventories: [],
          },
        ],
      });

      assertSpyCall(setSpy, 1, {
        args: [
          [
            'users_by_discord_id',
            'user_id',
          ],
          {
            _id: 'uuid',
            id: 'user_id',
            inventories: [],
          },
        ],
      });

      assertEquals(user, {
        _id: 'uuid',
        id: 'user_id',
        inventories: [],
      });
    } finally {
      cryptoStub.restore();
    }
  });
});

Deno.test('get guild', async (test) => {
  await test.step('get', async () => {
    const kv = {
      get: spy(() => ({
        value: {
          _id: 'uuid',
          id: 'guild_id',
          instances: [],
        },
      })),
    } as unknown as Deno.Kv;

    const guild = await db.getGuild(kv, 'guild_id');

    assertSpyCall(kv.get as any, 0, {
      args: [
        ['guilds_by_discord_id', 'guild_id'],
      ],
    });

    assertEquals(guild, {
      _id: 'uuid',
      id: 'guild_id',
      instances: [],
    });
  });

  await test.step('insert new', async () => {
    const cryptoStub = stub(crypto, 'randomUUID', () => 'uuid' as any);

    const checkSpy = spy(() => atomic);

    const setSpy = spy(() => atomic);

    const atomic: any = {
      commit: spy(() => ({ ok: true })),
      check: checkSpy,
      set: setSpy,
    };

    const kv = {
      get: spy(() => ({})),
      atomic: spy(() => atomic),
    } as unknown as Deno.Kv;

    try {
      const guild = await db.getGuild(kv, 'guild_id');

      assertSpyCall(kv.get as any, 0, {
        args: [
          ['guilds_by_discord_id', 'guild_id'],
        ],
      });

      assertSpyCall(checkSpy, 0, {
        args: [
          {
            key: [
              'guilds_by_discord_id',
              'guild_id',
            ],
            versionstamp: null,
          },
        ],
      });

      assertSpyCall(setSpy, 0, {
        args: [
          [
            'guilds',
            'uuid',
          ],
          {
            _id: 'uuid',
            id: 'guild_id',
            instances: [],
          },
        ],
      });

      assertSpyCall(setSpy, 1, {
        args: [
          [
            'guilds_by_discord_id',
            'guild_id',
          ],
          {
            _id: 'uuid',
            id: 'guild_id',
            instances: [],
          },
        ],
      });

      assertEquals(guild, {
        _id: 'uuid',
        id: 'guild_id',
        instances: [],
      });
    } finally {
      cryptoStub.restore();
    }
  });
});

Deno.test('get instances', async (test) => {
  await test.step('get', async () => {
    const kv = {
      get: spy(() => ({
        value: {
          _id: 'uuid',
          main: true,
          guild: 'guild_id',
          inventories: [],
          packs: [],
        },
      })),
    } as unknown as Deno.Kv;

    const instance = await db.getInstance(kv, {
      _id: 'uuid',
      id: 'guild_id',
      instances: ['instance_id'],
    });

    assertSpyCall(kv.get as any, 0, {
      args: [
        ['instances', 'instance_id'],
      ],
    });

    assertEquals(instance, {
      _id: 'uuid',
      main: true,
      guild: 'guild_id',
      inventories: [],
      packs: [],
    });
  });

  await test.step('insert new', async () => {
    const cryptoStub = stub(crypto, 'randomUUID', () => 'uuid' as any);

    const checkSpy = spy(() => atomic);

    const setSpy = spy(() => atomic);

    const atomic: any = {
      commit: spy(() => ({ ok: true })),
      check: checkSpy,
      set: setSpy,
    };

    const kv = {
      get: spy(() => ({})),
      atomic: spy(() => atomic),
    } as unknown as Deno.Kv;

    try {
      const instance = await db.getInstance(kv, {
        _id: 'guild_uuid',
        id: 'guild_id',
        instances: ['instance_id'],
      });

      assertSpyCall(kv.get as any, 0, {
        args: [
          ['instances', 'instance_id'],
        ],
      });

      assertSpyCall(setSpy, 0, {
        args: [
          [
            'instances',
            'uuid',
          ],
          {
            _id: 'uuid',
            main: true,
            guild: 'guild_uuid',
            inventories: [],
            packs: [],
          },
        ],
      });

      assertSpyCall(setSpy, 1, {
        args: [
          [
            'guilds',
            'guild_uuid',
          ],
          {
            _id: 'guild_uuid',
            id: 'guild_id',
            instances: ['uuid'],
          },
        ],
      });

      assertSpyCall(setSpy, 2, {
        args: [
          [
            'guilds_by_discord_id',
            'guild_id',
          ],
          {
            _id: 'guild_uuid',
            id: 'guild_id',
            instances: ['uuid'],
          },
        ],
      });

      assertEquals(instance, {
        _id: 'uuid',
        main: true,
        guild: 'guild_uuid',
        inventories: [],
        packs: [],
      });
    } finally {
      cryptoStub.restore();
    }
  });
});

Deno.test('get inventory', async (test) => {
  await test.step('get', async () => {
    const kv = {
      get: spy(() => ({
        value: {
          _id: 'uuid',
          availablePulls: 5,
          instance: 'guild_uuid',
          user: 'user_uuid',
        },
      })),
    } as unknown as Deno.Kv;

    const inventory = await db.getInventory(kv, {
      _id: 'instance_uuid',
      guild: '',
      inventories: [],
      main: true,
      packs: [],
    }, {
      _id: 'user_uuid',
      id: 'user_id',
      inventories: [],
    });

    assertSpyCall(kv.get as any, 0, {
      args: [
        [
          'inventories_by_instance_user',
          'instance_uuid',
          'user_uuid',
        ],
      ],
    });

    assertEquals(inventory, {
      _id: 'uuid',
      availablePulls: 5,
      instance: 'guild_uuid',
      user: 'user_uuid',
    });
  });

  await test.step('insert new', async () => {
    const cryptoStub = stub(crypto, 'randomUUID', () => 'uuid' as any);

    const checkSpy = spy(() => atomic);

    const setSpy = spy(() => atomic);

    const atomic: any = {
      commit: spy(() => ({ ok: true })),
      check: checkSpy,
      set: setSpy,
    };

    const kv = {
      get: spy(() => ({})),
      atomic: spy(() => atomic),
    } as unknown as Deno.Kv;

    try {
      const inventory = await db.getInventory(kv, {
        _id: 'instance_uuid',
        guild: '',
        inventories: [],
        main: true,
        packs: [],
      }, {
        _id: 'user_uuid',
        id: 'user_id',
        inventories: [],
      });

      assertSpyCall(kv.get as any, 0, {
        args: [
          [
            'inventories_by_instance_user',
            'instance_uuid',
            'user_uuid',
          ],
        ],
      });

      assertSpyCall(checkSpy, 0, {
        args: [
          {
            key: [
              'inventories_by_instance_user',
              'instance_uuid',
              'user_uuid',
            ],
            versionstamp: null,
          },
        ],
      });

      assertSpyCall(setSpy, 0, {
        args: [
          [
            'inventories',
            'uuid',
          ],
          {
            _id: 'uuid',
            availablePulls: 10,
            instance: 'instance_uuid',
            user: 'user_uuid',
          },
        ],
      });

      assertSpyCall(setSpy, 1, {
        args: [
          [
            'inventories_by_instance_user',
            'instance_uuid',
            'user_uuid',
          ],
          {
            _id: 'uuid',
            availablePulls: 10,
            instance: 'instance_uuid',
            user: 'user_uuid',
          },
        ],
      });

      assertSpyCall(setSpy, 2, {
        args: [
          [
            'instances',
            'instance_uuid',
          ],
          {
            _id: 'instance_uuid',
            guild: '',
            main: true,
            packs: [],
            inventories: ['uuid'],
          },
        ],
      });

      assertSpyCall(setSpy, 3, {
        args: [
          [
            'users',
            'user_uuid',
          ],
          {
            _id: 'user_uuid',
            id: 'user_id',
            inventories: ['uuid'],
          },
        ],
      });

      assertSpyCall(setSpy, 4, {
        args: [
          [
            'users_by_discord_id',
            'user_id',
          ],
          {
            _id: 'user_uuid',
            id: 'user_id',
            inventories: ['uuid'],
          },
        ],
      });

      assertEquals(inventory, {
        _id: 'uuid',
        availablePulls: 10,
        instance: 'instance_uuid',
        user: 'user_uuid',
      });
    } finally {
      cryptoStub.restore();
    }
  });
});
