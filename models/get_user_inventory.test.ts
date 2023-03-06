// deno-lint-ignore-file no-explicit-any

import { assertEquals } from 'https://deno.land/std@0.178.0/testing/asserts.ts';

import {
  assertSpyCall,
  assertSpyCallArg,
  assertSpyCalls,
  returnsNext,
  stub,
} from 'https://deno.land/std@0.178.0/testing/mock.ts';

import { assertSnapshot } from 'https://deno.land/std@0.178.0/testing/snapshot.ts';

import {
  FakeAdd,
  FakeAppend,
  FakeClient,
  FakeCreate,
  FakeDivide,
  FakeGet,
  FakeGTE,
  FakeId,
  FakeIf,
  FakeIndex,
  FakeIsNonEmpty,
  FakeLet,
  FakeLTE,
  FakeMatch,
  FakeMin,
  FakeMultiply,
  FakeNow,
  FakeRef,
  FakeSelect,
  FakeSubtract,
  FakeTimeAdd,
  FakeTimeDiff,
  FakeUpdate,
  FakeVar,
} from './fql.mock.ts';

import { fql } from './fql.ts';

import {
  default as Model,
  // getCharacterNode,
  getGuild,
  getInstance,
  getInventory,
  getUser,
  MAX_PULLS,
  RECHARGE_MINS,
  rechargePulls,
} from './get_user_inventory.ts';

Deno.test('get or create user', async (test) => {
  await test.step('get', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const getStub = FakeGet();
    const indexStub = FakeIndex();
    const isNonEmptyStub = FakeIsNonEmpty();

    const matchStub = FakeMatch({
      match: true,
    });

    try {
      const match = getUser('user_id') as any;

      assertSpyCall(indexStub, 0, {
        args: ['users_discord_id'],
      });

      assertSpyCall(matchStub, 0, {
        args: ['users_discord_id' as any, 'user_id'],
      });

      assertSpyCallArg(ifStub, 0, 0, true);

      assertEquals(match, {
        '0': 'user_id',
        match: true,
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      getStub.restore();
      indexStub.restore();
      isNonEmptyStub.restore();
      matchStub.restore();
    }
  });

  await test.step('create', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const indexStub = FakeIndex();
    const idStub = FakeId();
    const isNonEmptyStub = FakeIsNonEmpty();
    const createStub = FakeCreate();

    const matchStub = FakeMatch();

    try {
      getUser('user_id') as any;

      assertSpyCall(indexStub, 0, {
        args: ['users_discord_id'],
      });

      assertSpyCall(matchStub, 0, {
        args: ['users_discord_id' as any, 'user_id'],
      });

      assertSpyCallArg(ifStub, 0, 0, false);

      assertSpyCall(createStub, 0, {
        args: [
          'user' as any,
          {
            badges: [
              '357600097731608662',
            ],
            inventories: [],
            id: 'user_id',
          },
        ],
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      indexStub.restore();
      idStub.restore();
      isNonEmptyStub.restore();
      createStub.restore();
      matchStub.restore();
    }
  });
});

Deno.test('get or create guild', async (test) => {
  await test.step('get', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const getStub = FakeGet();
    const indexStub = FakeIndex();
    const isNonEmptyStub = FakeIsNonEmpty();

    const matchStub = FakeMatch({
      match: true,
    });

    try {
      const match = getGuild('guild_id') as any;

      assertSpyCall(indexStub, 0, {
        args: ['guilds_discord_id'],
      });

      assertSpyCall(matchStub, 0, {
        args: ['guilds_discord_id' as any, 'guild_id'],
      });

      assertSpyCallArg(ifStub, 0, 0, true);

      assertEquals(match, {
        '0': 'guild_id',
        match: true,
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      getStub.restore();
      indexStub.restore();
      isNonEmptyStub.restore();
      matchStub.restore();
    }
  });

  await test.step('create', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const indexStub = FakeIndex();
    const isNonEmptyStub = FakeIsNonEmpty();
    const createStub = FakeCreate();

    const matchStub = FakeMatch();

    try {
      getGuild('guild_id') as any;

      assertSpyCall(indexStub, 0, {
        args: ['guilds_discord_id'],
      });

      assertSpyCall(matchStub, 0, {
        args: ['guilds_discord_id' as any, 'guild_id'],
      });

      assertSpyCallArg(ifStub, 0, 0, false);

      assertSpyCall(createStub, 0, {
        args: [
          'guild' as any,
          {
            id: 'guild_id',
            instances: [],
          },
        ],
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      indexStub.restore();
      isNonEmptyStub.restore();
      createStub.restore();
      matchStub.restore();
    }
  });
});

Deno.test('get or create instance', async (test) => {
  await test.step('get', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const getStub = FakeGet();
    const isNonEmptyStub = FakeIsNonEmpty();

    const selectStub = FakeSelect({ select: true });

    try {
      const match = getInstance('guild' as any) as any;

      assertSpyCall(selectStub, 0, {
        args: [['data', 'instances'], 'guild' as any],
      });

      assertSpyCallArg(ifStub, 0, 0, true);

      assertEquals(match, {
        select: true,
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      getStub.restore();
      isNonEmptyStub.restore();
      selectStub.restore();
    }
  });

  await test.step('create', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const isNonEmptyStub = FakeIsNonEmpty();

    const varStub = FakeVar();
    const refStub = FakeRef();

    const selectStub = FakeSelect();

    const createStub = FakeCreate();
    const updateStub = FakeUpdate();

    try {
      getInstance('guild' as any) as any;

      assertSpyCall(selectStub, 0, {
        args: [['data', 'instances'], 'guild' as any],
      });

      assertSpyCallArg(ifStub, 0, 0, false);

      assertSpyCall(createStub, 0, {
        args: [
          'instance' as any,
          {
            main: true,
            guild: {
              ref: 'guild',
            },
            inventories: [],
            packs: [],
          },
        ],
      });

      assertSpyCall(updateStub, 0, {
        args: [
          { ref: 'guild' } as any,
          {
            instances: [{ ref: 'createdInstance' }],
          },
        ],
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      isNonEmptyStub.restore();
      varStub.restore();
      refStub.restore();
      createStub.restore();
      updateStub.restore();
      selectStub.restore();
    }
  });
});

Deno.test('get or create inventory', async (test) => {
  await test.step('get', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const getStub = FakeGet();
    const refStub = FakeRef();
    const indexStub = FakeIndex();
    const isNonEmptyStub = FakeIsNonEmpty();

    const matchStub = FakeMatch({
      match: true,
    });

    try {
      const match = getInventory({
        instance: 'instance' as any,
        user: 'user' as any,
      }) as any;

      assertSpyCall(refStub, 0, {
        args: ['instance' as any],
      });

      assertSpyCall(refStub, 1, {
        args: ['user' as any],
      });

      assertSpyCall(matchStub, 0, {
        args: [
          'inventories_instance_user' as any,
          {
            ref: 'instance',
          },
          {
            ref: 'user',
          },
        ],
      });

      assertSpyCallArg(ifStub, 0, 0, true);

      assertEquals(match, {
        '0': {
          ref: 'instance',
        },
        '1': {
          ref: 'user',
        },
        match: true,
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      getStub.restore();
      refStub.restore();
      indexStub.restore();
      isNonEmptyStub.restore();
      matchStub.restore();
    }
  });

  await test.step('create', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const refStub = FakeRef();
    const indexStub = FakeIndex();
    const isNonEmptyStub = FakeIsNonEmpty();
    const matchStub = FakeMatch();

    const varStub = FakeVar();
    const appendStub = FakeAppend();
    const selectStub = FakeSelect({ select: true });

    const createStub = FakeCreate();
    const updateStub = FakeUpdate();

    try {
      getInventory({
        instance: 'instance' as any,
        user: 'user' as any,
      }) as any;

      assertSpyCall(refStub, 0, {
        args: ['instance' as any],
      });

      assertSpyCall(refStub, 1, {
        args: ['user' as any],
      });

      assertSpyCall(matchStub, 0, {
        args: [
          'inventories_instance_user' as any,
          {
            ref: 'instance',
          },
          {
            ref: 'user',
          },
        ],
      });

      assertSpyCallArg(ifStub, 0, 0, false);

      assertSpyCall(createStub, 0, {
        args: [
          'inventory' as any,
          {
            availablePulls: 5,
            characters: [],
            user: {
              ref: 'user',
            },
            instance: {
              ref: 'instance',
            },
          },
        ],
      });

      assertSpyCall(updateStub, 0, {
        args: [
          { ref: 'instance' } as any,
          {
            inventories: [{ ref: 'createdInventory' }, { select: true }],
          },
        ],
      });

      assertSpyCall(updateStub, 1, {
        args: [
          { ref: 'user' } as any,
          {
            inventories: [{ ref: 'createdInventory' }, { select: true }],
          },
        ],
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      refStub.restore();
      indexStub.restore();
      isNonEmptyStub.restore();
      matchStub.restore();
      varStub.restore();
      appendStub.restore();
      selectStub.restore();
      createStub.restore();
      updateStub.restore();
    }
  });
});

Deno.test('recharge pulls', async (test) => {
  await test.step('available pulls is 5', () => {
    const letStub = FakeLet();
    const refStub = FakeRef();
    const ifStub = FakeIf();

    const minStub = FakeMin();
    const lteStub = FakeLTE();
    const gteStub = FakeGTE();

    const divideStub = FakeDivide();
    const multiplyStub = FakeMultiply();
    const addStub = FakeAdd();
    const subtractStub = FakeSubtract();

    const now = new Date();

    const nowStub = FakeNow(now);

    const timeDiffStub = FakeTimeDiff();
    const timeAddStub = FakeTimeAdd();

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        now,
        5,
      ]) as any,
    );

    const varStub = FakeVar({
      'rechargeTimestamp': now,
      'newPulls': 0,
      'currentPulls': 5,
      'rechargedPulls': 5,
      'diffPulls': 0,
    });

    const updateStub = FakeUpdate();

    try {
      const result = rechargePulls({ inventory: 'inventory' as any }) as any;

      assertSpyCall(selectStub, 0, {
        args: [
          [
            'data',
            'rechargeTimestamp',
          ],
          'inventory' as any,
          now as any,
        ],
      });

      assertSpyCall(selectStub, 1, {
        args: [
          [
            'data',
            'availablePulls',
          ],
          'inventory' as any,
        ],
      });

      assertSpyCall(divideStub, 0, {
        args: [0, 15],
      });

      assertSpyCall(minStub, 0, {
        args: [5, 5],
      });

      assertSpyCall(subtractStub, 0, {
        args: [5, 5],
      });

      assertSpyCall(timeAddStub, 0, {
        args: [now as any, 0],
      });

      assertSpyCall(updateStub, 0, {
        args: [{ ref: 'inventory' } as any, {
          availablePulls: 5,
          rechargeTimestamp: null,
        }],
      });

      assertEquals(result, {
        ref: 'inventory',
      });
    } finally {
      letStub.restore();
      refStub.restore();
      ifStub.restore();
      varStub.restore();
      minStub.restore();
      lteStub.restore();
      gteStub.restore();
      divideStub.restore();
      multiplyStub.restore();
      addStub.restore();
      subtractStub.restore();
      nowStub.restore();
      timeDiffStub.restore();
      timeAddStub.restore();
      updateStub.restore();
      selectStub.restore();
    }
  });

  await test.step('available pulls is 4 (add 1)', () => {
    const letStub = FakeLet();
    const refStub = FakeRef();
    const ifStub = FakeIf();

    const minStub = FakeMin();
    const lteStub = FakeLTE();
    const gteStub = FakeGTE();

    const divideStub = FakeDivide();
    const multiplyStub = FakeMultiply();
    const addStub = FakeAdd();
    const subtractStub = FakeSubtract();

    const now = new Date();

    const timestamp = new Date();

    timestamp.setMinutes(timestamp.getMinutes() - 15);

    const nowStub = FakeNow(now);

    const timeDiffStub = FakeTimeDiff();
    const timeAddStub = FakeTimeAdd();

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        timestamp,
        5,
      ]) as any,
    );

    const varStub = FakeVar({
      'rechargeTimestamp': timestamp,
      'newPulls': 1,
      'currentPulls': 4,
      'rechargedPulls': 5,
      'diffPulls': 1,
    });

    const updateStub = FakeUpdate();

    try {
      const result = rechargePulls({ inventory: 'inventory' as any }) as any;

      assertSpyCall(selectStub, 0, {
        args: [
          [
            'data',
            'rechargeTimestamp',
          ],
          'inventory' as any,
          now as any,
        ],
      });

      assertSpyCall(selectStub, 1, {
        args: [
          [
            'data',
            'availablePulls',
          ],
          'inventory' as any,
        ],
      });

      assertSpyCall(divideStub, 0, {
        args: [15, 15],
      });

      assertSpyCall(minStub, 0, {
        args: [5, 5],
      });

      assertSpyCall(subtractStub, 0, {
        args: [5, 4],
      });

      assertSpyCall(timeAddStub, 0, {
        args: [timestamp as any, 15],
      });

      assertSpyCall(updateStub, 0, {
        args: [{ ref: 'inventory' } as any, {
          availablePulls: 5,
          rechargeTimestamp: null,
        }],
      });

      assertEquals(result, {
        ref: 'inventory',
      });
    } finally {
      letStub.restore();
      refStub.restore();
      ifStub.restore();
      varStub.restore();
      minStub.restore();
      lteStub.restore();
      gteStub.restore();
      divideStub.restore();
      multiplyStub.restore();
      addStub.restore();
      subtractStub.restore();
      nowStub.restore();
      timeDiffStub.restore();
      timeAddStub.restore();
      updateStub.restore();
      selectStub.restore();
    }
  });

  await test.step('available pulls is 4 (add 5)', () => {
    const letStub = FakeLet();
    const refStub = FakeRef();
    const ifStub = FakeIf();

    const minStub = FakeMin();
    const lteStub = FakeLTE();
    const gteStub = FakeGTE();

    const divideStub = FakeDivide();
    const multiplyStub = FakeMultiply();
    const addStub = FakeAdd();
    const subtractStub = FakeSubtract();

    const now = new Date();

    const timestamp = new Date();

    timestamp.setMinutes(timestamp.getMinutes() - 60);

    const nowStub = FakeNow(now);

    const timeDiffStub = FakeTimeDiff();
    const timeAddStub = FakeTimeAdd();

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        timestamp,
        5,
      ]) as any,
    );

    const varStub = FakeVar({
      'rechargeTimestamp': timestamp,
      'newPulls': 5,
      'currentPulls': 4,
      'rechargedPulls': 5,
      'diffPulls': 1,
    });

    const updateStub = FakeUpdate();

    try {
      const result = rechargePulls({ inventory: 'inventory' as any }) as any;

      assertSpyCall(selectStub, 0, {
        args: [
          [
            'data',
            'rechargeTimestamp',
          ],
          'inventory' as any,
          now as any,
        ],
      });

      assertSpyCall(selectStub, 1, {
        args: [
          [
            'data',
            'availablePulls',
          ],
          'inventory' as any,
        ],
      });

      assertSpyCall(divideStub, 0, {
        args: [60, 15],
      });

      assertSpyCall(minStub, 0, {
        args: [5, 9],
      });

      assertSpyCall(subtractStub, 0, {
        args: [5, 4],
      });

      assertSpyCall(timeAddStub, 0, {
        args: [timestamp as any, 15],
      });

      assertSpyCall(updateStub, 0, {
        args: [{ ref: 'inventory' } as any, {
          availablePulls: 5,
          rechargeTimestamp: null,
        }],
      });

      assertEquals(result, {
        ref: 'inventory',
      });
    } finally {
      letStub.restore();
      refStub.restore();
      ifStub.restore();
      varStub.restore();
      minStub.restore();
      lteStub.restore();
      gteStub.restore();
      divideStub.restore();
      multiplyStub.restore();
      addStub.restore();
      subtractStub.restore();
      nowStub.restore();
      timeDiffStub.restore();
      timeAddStub.restore();
      updateStub.restore();
      selectStub.restore();
    }
  });

  await test.step('available pulls is 0 (add 1)', () => {
    const letStub = FakeLet();
    const refStub = FakeRef();
    const ifStub = FakeIf();

    const minStub = FakeMin();
    const lteStub = FakeLTE();
    const gteStub = FakeGTE();

    const divideStub = FakeDivide();
    const multiplyStub = FakeMultiply();
    const addStub = FakeAdd();
    const subtractStub = FakeSubtract();

    const now = new Date();

    const timestamp = new Date();

    timestamp.setMinutes(timestamp.getMinutes() - 15);

    const nowStub = FakeNow(now);

    const timeDiffStub = FakeTimeDiff();
    const timeAddStub = FakeTimeAdd();

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        timestamp,
        5,
      ]) as any,
    );

    const varStub = FakeVar({
      'rechargeTimestamp': timestamp,
      'newPulls': 1,
      'currentPulls': 0,
      'rechargedPulls': 1,
      'diffPulls': 1,
    });

    const updateStub = FakeUpdate();

    try {
      const result = rechargePulls({ inventory: 'inventory' as any }) as any;

      assertSpyCall(selectStub, 0, {
        args: [
          [
            'data',
            'rechargeTimestamp',
          ],
          'inventory' as any,
          now as any,
        ],
      });

      assertSpyCall(selectStub, 1, {
        args: [
          [
            'data',
            'availablePulls',
          ],
          'inventory' as any,
        ],
      });

      assertSpyCall(divideStub, 0, {
        args: [15, 15],
      });

      assertSpyCall(minStub, 0, {
        args: [5, 1],
      });

      assertSpyCall(subtractStub, 0, {
        args: [1, 0],
      });

      assertSpyCall(timeAddStub, 0, {
        args: [timestamp as any, 15],
      });

      assertSpyCall(updateStub, 0, {
        args: [{ ref: 'inventory' } as any, {
          availablePulls: 1,
          rechargeTimestamp: now,
        }],
      });

      assertEquals(result, {
        ref: 'inventory',
      });
    } finally {
      letStub.restore();
      refStub.restore();
      ifStub.restore();
      varStub.restore();
      minStub.restore();
      lteStub.restore();
      gteStub.restore();
      divideStub.restore();
      multiplyStub.restore();
      addStub.restore();
      subtractStub.restore();
      nowStub.restore();
      timeDiffStub.restore();
      timeAddStub.restore();
      updateStub.restore();
      selectStub.restore();
    }
  });

  await test.step('available pulls is 0 (add 5)', () => {
    const letStub = FakeLet();
    const refStub = FakeRef();
    const ifStub = FakeIf();

    const minStub = FakeMin();
    const lteStub = FakeLTE();
    const gteStub = FakeGTE();

    const divideStub = FakeDivide();
    const multiplyStub = FakeMultiply();
    const addStub = FakeAdd();
    const subtractStub = FakeSubtract();

    const now = new Date();

    const timestamp = new Date();

    timestamp.setMinutes(timestamp.getMinutes() - 120);

    const nowStub = FakeNow(now);

    const timeDiffStub = FakeTimeDiff();
    const timeAddStub = FakeTimeAdd();

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        timestamp,
        5,
      ]) as any,
    );

    const varStub = FakeVar({
      'rechargeTimestamp': timestamp,
      'newPulls': 8,
      'currentPulls': 0,
      'rechargedPulls': 5,
      'diffPulls': 5,
    });

    const updateStub = FakeUpdate();

    try {
      const result = rechargePulls({ inventory: 'inventory' as any }) as any;

      assertSpyCall(selectStub, 0, {
        args: [
          [
            'data',
            'rechargeTimestamp',
          ],
          'inventory' as any,
          now as any,
        ],
      });

      assertSpyCall(selectStub, 1, {
        args: [
          [
            'data',
            'availablePulls',
          ],
          'inventory' as any,
        ],
      });

      assertSpyCall(divideStub, 0, {
        args: [120, 15],
      });

      assertSpyCall(minStub, 0, {
        args: [5, 8],
      });

      assertSpyCall(subtractStub, 0, {
        args: [5, 0],
      });

      assertSpyCall(timeAddStub, 0, {
        args: [timestamp as any, 75],
      });

      assertSpyCall(updateStub, 0, {
        args: [{ ref: 'inventory' } as any, {
          availablePulls: 5,
          rechargeTimestamp: null,
        }],
      });

      assertEquals(result, {
        ref: 'inventory',
      });
    } finally {
      letStub.restore();
      refStub.restore();
      ifStub.restore();
      varStub.restore();
      minStub.restore();
      lteStub.restore();
      gteStub.restore();
      divideStub.restore();
      multiplyStub.restore();
      addStub.restore();
      subtractStub.restore();
      nowStub.restore();
      timeDiffStub.restore();
      timeAddStub.restore();
      updateStub.restore();
      selectStub.restore();
    }
  });
});

Deno.test('model', async (test) => {
  const client = FakeClient();

  Model(client as any).indexers?.forEach((q) => q());
  Model(client as any).resolvers?.forEach((q) => q());

  assertSpyCalls(client.query, 4);

  await assertSnapshot(test, client.query.calls[0].args);
  await assertSnapshot(test, client.query.calls[1].args);
  await assertSnapshot(test, client.query.calls[2].args);
  await assertSnapshot(test, client.query.calls[3].args);
});

Deno.test('variables', () => {
  assertEquals(MAX_PULLS, 5);
  assertEquals(RECHARGE_MINS, 15);
});
