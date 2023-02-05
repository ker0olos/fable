// deno-lint-ignore-file no-explicit-any

import { assertEquals } from 'https://deno.land/std@0.175.0/testing/asserts.ts';

import {
  assertSpyCall,
  assertSpyCallArg,
  assertSpyCalls,
  returnsNext,
  spy,
  stub,
} from 'https://deno.land/std@0.175.0/testing/mock.ts';

import { assertSnapshot } from 'https://deno.land/std@0.175.0/testing/snapshot.ts';

import { fql } from './fql.ts';

import {
  checkPullsForRefill,
  default as Model,
  getOrCreateGuild,
  getOrCreateInstance,
  getOrCreateInventory,
  getOrCreateUser,
  PULLS_DEFAULT,
} from './get_user_inventory.ts';

const FakeIndex = () => stub(fql, 'Index', () => ({}) as any);
const FakeRef = () => stub(fql, 'Ref', (obj: any) => ({ ref: obj }) as any);

const FakeVar = () => stub(fql, 'Var', (name) => name as any);
const FakeLet = () => stub(fql, 'Let', (params, cb) => cb(params));
const FakeGet = () => stub(fql, 'Get', (r) => r);
const FakeAppend = () => stub(fql, 'Append', (a: any, b: any) => [a, b]);

const FakeGTE = () => stub(fql, 'GTE', (a: any, b: any) => a >= b);
const FakeLTE = () => stub(fql, 'LTE', (a: any, b: any) => a <= b);

const FakeAnd = () => stub(fql, 'And', (a: any, b: any) => a && b);
const FakeIsNonEmpty = () =>
  stub(fql, 'IsNonEmpty', ((match: any) => Boolean(match)) as any);

const FakeSelect = (obj?: any) => stub(fql, 'Select', () => obj);
const FakeMatch = (obj?: any) =>
  stub(
    fql,
    'Match',
    (_: any, ...terms: any[]) => obj ? ({ ...obj, ...terms }) : undefined,
  );

const FakeNow = () => stub(fql, 'Now', () => new Date() as any);
const FakeTimeDiff = () =>
  stub(fql, 'TimeDiffInMinutes', (a: any, b: any) => {
    const diff = b.getTime() - a.getTime();
    return (diff / 60000);
  });

const FakeCreate = () => stub(fql, 'Create', (_: any, data: any) => data);
const FakeUpdate = () => stub(fql, 'Update', (_: any, data: any) => data);

const FakeIf = () =>
  stub(
    fql,
    'If',
    ((cond: boolean, _then: any, _else: any) => cond ? _then : _else) as any,
  );

const FakeClient = () => ({
  query: spy(),
});

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
      const match = getOrCreateUser('user_id') as any;

      assertSpyCall(indexStub, 0, {
        args: ['users_discord_id'],
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
    const isNonEmptyStub = FakeIsNonEmpty();
    const createStub = FakeCreate();

    const matchStub = FakeMatch();

    try {
      const match = getOrCreateUser('user_id') as any;

      assertSpyCall(indexStub, 0, {
        args: ['users_discord_id'],
      });

      assertSpyCallArg(ifStub, 0, 0, false);
      assertSpyCallArg(createStub, 0, 0, 'user');

      assertEquals(match, {
        id: 'user_id',
        inventories: [],
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
      const match = getOrCreateGuild('guild_id') as any;

      assertSpyCall(indexStub, 0, {
        args: ['guilds_discord_id'],
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
      const match = getOrCreateGuild('guild_id') as any;

      assertSpyCall(indexStub, 0, {
        args: ['guilds_discord_id'],
      });

      assertSpyCallArg(ifStub, 0, 0, false);
      assertSpyCallArg(createStub, 0, 0, 'guild');

      assertEquals(match, {
        id: 'guild_id',
        instances: [],
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
      const match = getOrCreateInstance('guild' as any) as any;

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
      const match = getOrCreateInstance('guild' as any) as any;

      assertSpyCall(selectStub, 0, {
        args: [['data', 'instances'], 'guild' as any],
      });

      assertSpyCallArg(ifStub, 0, 0, false);

      assertSpyCall(updateStub, 0, {
        args: [{ ref: 'guild' } as any, {
          instances: [{ ref: 'createdInstance' }],
        }],
      });

      assertEquals(match, {
        main: true,
        guild: { ref: 'guild' },
        inventories: [],
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
      const match = getOrCreateInventory({
        instance: 'instance' as any,
        user: 'user' as any,
      }) as any;

      assertSpyCall(refStub, 0, {
        args: ['instance' as any],
      });

      assertSpyCall(refStub, 1, {
        args: ['user' as any],
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
      const match = getOrCreateInventory({
        instance: 'instance' as any,
        user: 'user' as any,
      }) as any;

      assertSpyCall(refStub, 0, {
        args: ['instance' as any],
      });

      assertSpyCall(refStub, 1, {
        args: ['user' as any],
      });

      assertSpyCallArg(ifStub, 0, 0, false);

      assertSpyCall(updateStub, 0, {
        args: [{ ref: 'instance' } as any, {
          inventories: [{ ref: 'createdInventory' }, { select: true }],
        }],
      });

      assertSpyCall(updateStub, 1, {
        args: [{ ref: 'user' } as any, {
          inventories: [{ ref: 'createdInventory' }, { select: true }],
        }],
      });

      assertEquals(match, {
        lastPull: null,
        availablePulls: 5,
        characters: [],
        instance: { ref: 'instance' },
        user: { ref: 'user' },
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

Deno.test('check for pulls refill', async (test) => {
  await test.step('available pulls is 5', () => {
    const ifStub = FakeIf();
    const andStub = FakeAnd();
    const lteStub = FakeLTE();
    const gteStub = FakeGTE();

    const nowStub = FakeNow();
    const timeDiffStub = FakeTimeDiff();

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        5,
        new Date(),
      ]) as any,
    );

    try {
      const result = checkPullsForRefill('inventory' as any) as any;

      assertSpyCall(selectStub, 0, {
        args: [['data', 'availablePulls'], 'inventory' as any],
      });

      assertSpyCall(selectStub, 1, {
        args: [['data', 'lastPull'], 'inventory' as any],
      });

      assertSpyCallArg(ifStub, 0, 0, false);

      assertEquals(result, 'inventory');
    } finally {
      ifStub.restore();
      andStub.restore();
      lteStub.restore();
      gteStub.restore();
      nowStub.restore();
      timeDiffStub.restore();
      selectStub.restore();
    }
  });

  await test.step('date is t-0', () => {
    const ifStub = FakeIf();
    const andStub = FakeAnd();
    const lteStub = FakeLTE();
    const gteStub = FakeGTE();

    const nowStub = FakeNow();
    const timeDiffStub = FakeTimeDiff();

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        0,
        new Date(),
      ]) as any,
    );

    try {
      const result = checkPullsForRefill('inventory' as any) as any;

      assertSpyCall(selectStub, 0, {
        args: [['data', 'availablePulls'], 'inventory' as any],
      });

      assertSpyCall(selectStub, 1, {
        args: [['data', 'lastPull'], 'inventory' as any],
      });

      assertSpyCallArg(ifStub, 0, 0, false);

      assertEquals(result, 'inventory');
    } finally {
      ifStub.restore();
      andStub.restore();
      lteStub.restore();
      gteStub.restore();
      nowStub.restore();
      timeDiffStub.restore();
      selectStub.restore();
    }
  });

  await test.step('date is t-60 mins', () => {
    const ifStub = FakeIf();
    const andStub = FakeAnd();
    const lteStub = FakeLTE();
    const gteStub = FakeGTE();

    const nowStub = FakeNow();
    const timeDiffStub = FakeTimeDiff();

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        0,
        (() => {
          const a = new Date();
          a.setMinutes(a.getMinutes() - 60);
          return a;
        })(),
      ]) as any,
    );

    const refStub = FakeRef();
    const updateStub = FakeUpdate();

    try {
      const result = checkPullsForRefill('inventory' as any) as any;

      assertSpyCall(selectStub, 0, {
        args: [['data', 'availablePulls'], 'inventory' as any],
      });

      assertSpyCall(selectStub, 1, {
        args: [['data', 'lastPull'], 'inventory' as any],
      });

      assertSpyCallArg(ifStub, 0, 0, true);

      assertSpyCall(updateStub, 0, {
        args: [{ ref: 'inventory' } as any, {
          availablePulls: 5,
        }],
      });

      assertEquals(result, {
        availablePulls: 5,
      });
    } finally {
      ifStub.restore();
      andStub.restore();
      lteStub.restore();
      gteStub.restore();
      nowStub.restore();
      timeDiffStub.restore();
      selectStub.restore();
      refStub.restore();
      updateStub.restore();
    }
  });
});

Deno.test('model', async (test) => {
  const client = FakeClient();

  Model(client as any);

  assertSpyCalls(client.query, 4);

  await assertSnapshot(test, client.query.calls[0].args);
  await assertSnapshot(test, client.query.calls[1].args);
  await assertSnapshot(test, client.query.calls[2].args);
  await assertSnapshot(test, client.query.calls[3].args);
});

Deno.test('variables', () => {
  assertEquals(PULLS_DEFAULT, 5);
});
