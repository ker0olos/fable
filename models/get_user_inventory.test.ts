// deno-lint-ignore-file no-explicit-any

import { assertEquals } from 'https://deno.land/std@0.177.0/testing/asserts.ts';

import {
  assertSpyCall,
  assertSpyCallArg,
  assertSpyCalls,
  returnsNext,
  stub,
} from 'https://deno.land/std@0.177.0/testing/mock.ts';

import { assertSnapshot } from 'https://deno.land/std@0.177.0/testing/snapshot.ts';

import {
  FakeAnd,
  FakeAppend,
  FakeClient,
  FakeCreate,
  FakeGet,
  FakeGTE,
  FakeId,
  FakeIf,
  FakeIndex,
  FakeIsNonEmpty,
  FakeIsNull,
  FakeLength,
  FakeLet,
  FakeLTE,
  FakeMatch,
  FakeNow,
  FakePaginate,
  FakeRef,
  FakeReverse,
  FakeSelect,
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
  PULLS_DEFAULT,
  refillPulls,
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
            id: 'user_id',
            inventories: [],
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
            lastPull: null,
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
``;

// Deno.test('get character node', async (test) => {
//   await test.step('no before, no after', () => {
//     const ifStub = FakeIf();
//     const letStub = FakeLet();
//     const getStub = FakeGet();
//     const refStub = FakeRef();
//     const andStub = FakeAnd();
//     const isNonEmptyStub = FakeIsNonEmpty();
//     const lengthStub = FakeLength();
//     const isNullStub = FakeIsNull();
//     const indexStub = FakeIndex();
//     const matchStub = FakeMatch();

//     const selectStub = FakeSelect({ select: true });

//     const varStub = FakeVar({
//       'characters': ['0', '1'],
//     });

//     try {
//       const match = getCharacterNode({
//         inventory: 'inventory' as any,
//       }) as any;

//       assertSpyCall(matchStub, 0, {
//         args: [
//           'characters_inventory' as any,
//           {
//             ref: 'inventory',
//           },
//         ],
//       });

//       assertSpyCallArg(ifStub, 0, 0, true);
//       assertSpyCallArg(ifStub, 1, 0, true);
//       assertSpyCallArg(ifStub, 2, 0, true);
//       assertSpyCallArg(ifStub, 3, 0, true);
//       assertSpyCallArg(ifStub, 4, 0, true);

//       assertSpyCall(selectStub, 2, {
//         args: [
//           ['id'],
//           {
//             ref: '0',
//           } as any,
//           fql.Null(),
//         ],
//       });

//       assertEquals(match, {
//         anchor: {
//           select: true,
//         },
//         character: {
//           ref: '0',
//         },
//       });
//     } finally {
//       ifStub.restore();
//       letStub.restore();
//       getStub.restore();
//       varStub.restore();
//       refStub.restore();
//       andStub.restore();
//       isNonEmptyStub.restore();
//       lengthStub.restore();
//       isNullStub.restore();
//       indexStub.restore();
//       matchStub.restore();
//       selectStub.restore();
//     }
//   });

//   await test.step('before', () => {
//     const ifStub = FakeIf();
//     const fakeId = FakeId();
//     const letStub = FakeLet();
//     const getStub = FakeGet();
//     const refStub = FakeRef();
//     const andStub = FakeAnd();
//     const isNonEmptyStub = FakeIsNonEmpty();
//     const lengthStub = FakeLength();
//     const isNullStub = FakeIsNull();
//     const indexStub = FakeIndex();
//     const matchStub = FakeMatch();

//     const reverseStub = FakeReverse();
//     const paginateStub = FakePaginate();

//     const selectStub = FakeSelect({});

//     const varStub = FakeVar({
//       'characters': ['0', '1'],
//     });

//     try {
//       const match = getCharacterNode({
//         inventory: 'inventory' as any,
//         before: '1',
//       }) as any;

//       assertSpyCall(matchStub, 0, {
//         args: [
//           'characters_inventory' as any,
//           {
//             ref: 'inventory',
//           },
//         ],
//       });

//       assertSpyCallArg(ifStub, 0, 0, true);
//       assertSpyCallArg(ifStub, 1, 0, true);
//       assertSpyCallArg(ifStub, 2, 0, true);
//       assertSpyCallArg(ifStub, 3, 0, false);
//       assertSpyCallArg(ifStub, 4, 0, true);

//       assertSpyCall(paginateStub, 1, {
//         args: [
//           ['0', '1'] as any,
//           {
//             before: '1',
//             size: 1,
//           } as any,
//         ],
//         returned: ['0'] as any,
//       });

//       assertSpyCall(selectStub, 1, {
//         args: [
//           ['data', 0],
//           [
//             '0',
//           ] as any,
//           { ref: '1' } as any,
//         ],
//       });

//       assertEquals(match, {
//         anchor: {},
//         character: {},
//       });
//     } finally {
//       ifStub.restore();
//       fakeId.restore();
//       letStub.restore();
//       getStub.restore();
//       varStub.restore();
//       refStub.restore();
//       andStub.restore();
//       isNonEmptyStub.restore();
//       lengthStub.restore();
//       isNullStub.restore();
//       indexStub.restore();
//       matchStub.restore();
//       reverseStub.restore();
//       paginateStub.restore();
//       selectStub.restore();
//     }
//   });

//   await test.step('on', () => {
//     const ifStub = FakeIf();
//     const fakeId = FakeId();
//     const letStub = FakeLet();
//     const getStub = FakeGet();
//     const refStub = FakeRef();
//     const andStub = FakeAnd();
//     const isNonEmptyStub = FakeIsNonEmpty();
//     const lengthStub = FakeLength();
//     const isNullStub = FakeIsNull();
//     const indexStub = FakeIndex();
//     const matchStub = FakeMatch();

//     const reverseStub = FakeReverse();
//     const paginateStub = FakePaginate();

//     const selectStub = FakeSelect({});

//     const varStub = FakeVar({
//       'characters': ['0', '1'],
//     });

//     try {
//       const match = getCharacterNode({
//         inventory: 'inventory' as any,
//         on: '1',
//       }) as any;

//       assertSpyCall(matchStub, 0, {
//         args: [
//           'characters_inventory' as any,
//           {
//             ref: 'inventory',
//           },
//         ],
//       });

//       assertSpyCallArg(ifStub, 0, 0, true);
//       assertSpyCallArg(ifStub, 1, 0, true);
//       assertSpyCallArg(ifStub, 2, 0, false);
//       assertSpyCallArg(ifStub, 3, 0, true);
//       assertSpyCallArg(ifStub, 4, 0, true);

//       assertSpyCall(paginateStub, 0, {
//         args: [
//           ['0', '1'] as any,
//           {
//             after: '1',
//             size: 2,
//           } as any,
//         ],
//         returned: ['1'] as any,
//       });

//       assertSpyCall(selectStub, 0, {
//         args: [
//           ['data', 0],
//           [
//             '1',
//           ] as any,
//           { ref: '0' } as any,
//         ],
//       });

//       assertEquals(match, {
//         anchor: {},
//         character: {},
//       });
//     } finally {
//       ifStub.restore();
//       fakeId.restore();
//       letStub.restore();
//       getStub.restore();
//       varStub.restore();
//       refStub.restore();
//       andStub.restore();
//       isNonEmptyStub.restore();
//       lengthStub.restore();
//       isNullStub.restore();
//       indexStub.restore();
//       matchStub.restore();
//       reverseStub.restore();
//       paginateStub.restore();
//       selectStub.restore();
//     }
//   });

//   await test.step('after', () => {
//     const ifStub = FakeIf();
//     const fakeId = FakeId();
//     const letStub = FakeLet();
//     const getStub = FakeGet();
//     const refStub = FakeRef();
//     const andStub = FakeAnd();
//     const isNonEmptyStub = FakeIsNonEmpty();
//     const lengthStub = FakeLength();
//     const isNullStub = FakeIsNull();
//     const indexStub = FakeIndex();
//     const matchStub = FakeMatch();

//     const reverseStub = FakeReverse();
//     const paginateStub = FakePaginate();

//     const selectStub = FakeSelect({});

//     const varStub = FakeVar({
//       'characters': ['0', '1'],
//     });

//     try {
//       const match = getCharacterNode({
//         inventory: 'inventory' as any,
//         after: '0',
//       }) as any;

//       assertSpyCall(matchStub, 0, {
//         args: [
//           'characters_inventory' as any,
//           {
//             ref: 'inventory',
//           },
//         ],
//       });

//       assertSpyCallArg(ifStub, 0, 0, false);
//       assertSpyCallArg(ifStub, 1, 0, false);
//       assertSpyCallArg(ifStub, 2, 0, false);
//       assertSpyCallArg(ifStub, 3, 0, true);
//       assertSpyCallArg(ifStub, 4, 0, true);

//       assertSpyCall(paginateStub, 0, {
//         args: [
//           ['0', '1'] as any,
//           {
//             after: '0',
//             size: 2,
//           } as any,
//         ],
//         returned: ['0', '1'] as any,
//       });

//       assertSpyCall(selectStub, 0, {
//         args: [
//           ['data', 1],
//           [
//             '0',
//             '1',
//           ] as any,
//           { ref: '0' } as any,
//         ],
//       });

//       assertEquals(match, {
//         anchor: {},
//         character: {},
//       });
//     } finally {
//       ifStub.restore();
//       fakeId.restore();
//       letStub.restore();
//       getStub.restore();
//       varStub.restore();
//       refStub.restore();
//       andStub.restore();
//       isNonEmptyStub.restore();
//       lengthStub.restore();
//       isNullStub.restore();
//       indexStub.restore();
//       matchStub.restore();
//       reverseStub.restore();
//       paginateStub.restore();
//       selectStub.restore();
//     }
//   });

//   await test.step('empty', () => {
//     const ifStub = FakeIf();
//     const letStub = FakeLet();
//     const getStub = FakeGet();
//     const refStub = FakeRef();
//     const andStub = FakeAnd();
//     const isNonEmptyStub = FakeIsNonEmpty();
//     const lengthStub = FakeLength();
//     const isNullStub = FakeIsNull();
//     const indexStub = FakeIndex();
//     const matchStub = FakeMatch();

//     const selectStub = FakeSelect();

//     const varStub = FakeVar({
//       'characters': [],
//     });

//     try {
//       const match = getCharacterNode({
//         inventory: 'inventory' as any,
//       }) as any;

//       assertSpyCall(matchStub, 0, {
//         args: [
//           'characters_inventory' as any,
//           {
//             ref: 'inventory',
//           },
//         ],
//       });

//       assertSpyCallArg(ifStub, 0, 0, true);
//       assertSpyCallArg(ifStub, 1, 0, true);
//       assertSpyCallArg(ifStub, 2, 0, true);
//       assertSpyCallArg(ifStub, 3, 0, true);
//       assertSpyCallArg(ifStub, 4, 0, false);

//       assertEquals(match, {
//         anchor: fql.Null(),
//         character: fql.Null(),
//       });
//     } finally {
//       ifStub.restore();
//       letStub.restore();
//       getStub.restore();
//       varStub.restore();
//       refStub.restore();
//       andStub.restore();
//       isNonEmptyStub.restore();
//       lengthStub.restore();
//       isNullStub.restore();
//       indexStub.restore();
//       matchStub.restore();
//       selectStub.restore();
//     }
//   });
// });

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
      const result = refillPulls({ inventory: 'inventory' as any }) as any;

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
      const result = refillPulls({ inventory: 'inventory' as any }) as any;

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
      refillPulls({ inventory: 'inventory' as any }) as any;

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

  Model(client as any).forEach((q) => q());

  assertSpyCalls(client.query, 5);

  await assertSnapshot(test, client.query.calls[0].args);
  await assertSnapshot(test, client.query.calls[1].args);
  await assertSnapshot(test, client.query.calls[2].args);
  await assertSnapshot(test, client.query.calls[3].args);
  await assertSnapshot(test, client.query.calls[4].args);
  // await assertSnapshot(test, client.query.calls[5].args);
});

Deno.test('variables', () => {
  assertEquals(PULLS_DEFAULT, 5);
});
