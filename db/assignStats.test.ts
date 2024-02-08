// deno-lint-ignore-file

import { assertEquals, assertRejects } from '$std/assert/mod.ts';
import { stub } from '$std/testing/mock.ts';

import db, { kv } from '~/db/mod.ts';

import {
  initStats,
  //  upgradeStats
} from '~/db/assignStats.ts';

import { CharacterCombat } from '~/db/schema.ts';

Deno.test('initStats', async (test) => {
  await test.step('1*', async () => {
    const getValueAndTimestampStub = stub(
      db,
      'getValueAndTimestamp',
      () => Promise.resolve({ value: { rating: 1 }, versionstamp: '_' }) as any,
    );

    const getValueStub = stub(db, 'getValue', () => Promise.resolve({}));

    const randomStub = stub(Math, 'random', () => 0.5);

    const atomicMock = {
      check: () => atomicMock,
      set: () => atomicMock,
      commit: () => Promise.resolve({ ok: true }),
    };

    const atomicStub = stub(kv, 'atomic', () => atomicMock as any);

    try {
      const result = await initStats('instance' as any, 'character_id');

      assertEquals(result.character.combat?.baseStats, {
        attack: 1,
        defense: 1,
        speed: 1,
      });

      assertEquals(result.character.combat?.skills, {});
    } finally {
      getValueAndTimestampStub.restore();
      getValueStub.restore();
      atomicStub.restore();
      randomStub.restore();
    }
  });

  await test.step('2*', async () => {
    const getValueAndTimestampStub = stub(
      db,
      'getValueAndTimestamp',
      () => Promise.resolve({ value: { rating: 2 }, versionstamp: '_' }) as any,
    );

    const getValueStub = stub(db, 'getValue', () => Promise.resolve({}));

    const randomStub = stub(Math, 'random', () => 0.5);

    const atomicMock = {
      check: () => atomicMock,
      set: () => atomicMock,
      commit: () => Promise.resolve({ ok: true }),
    };

    const atomicStub = stub(kv, 'atomic', () => atomicMock as any);

    try {
      const result = await initStats('instance' as any, 'character_id');

      assertEquals(result.character.combat?.baseStats, {
        attack: 3,
        defense: 1,
        speed: 2,
      });

      assertEquals(result.character.combat?.skills, {});
    } finally {
      getValueAndTimestampStub.restore();
      getValueStub.restore();
      atomicStub.restore();
      randomStub.restore();
    }
  });

  await test.step('3*', async () => {
    const getValueAndTimestampStub = stub(
      db,
      'getValueAndTimestamp',
      () => Promise.resolve({ value: { rating: 3 }, versionstamp: '_' }) as any,
    );

    const getValueStub = stub(db, 'getValue', () => Promise.resolve({}));

    const randomStub = stub(Math, 'random', () => 0.5);

    const atomicMock = {
      check: () => atomicMock,
      set: () => atomicMock,
      commit: () => Promise.resolve({ ok: true }),
    };

    const atomicStub = stub(kv, 'atomic', () => atomicMock as any);

    try {
      const result = await initStats('instance' as any, 'character_id');

      assertEquals(result.character.combat?.baseStats, {
        attack: 4,
        defense: 2,
        speed: 3,
      });

      assertEquals(result.character.combat?.skills, {});
    } finally {
      getValueAndTimestampStub.restore();
      getValueStub.restore();
      atomicStub.restore();
      randomStub.restore();
    }
  });

  await test.step('4*', async () => {
    const getValueAndTimestampStub = stub(
      db,
      'getValueAndTimestamp',
      () => Promise.resolve({ value: { rating: 4 }, versionstamp: '_' }) as any,
    );

    const getValueStub = stub(db, 'getValue', () => Promise.resolve({}));

    const randomStub = stub(Math, 'random', () => 0.5);

    const atomicMock = {
      check: () => atomicMock,
      set: () => atomicMock,
      commit: () => Promise.resolve({ ok: true }),
    };

    const atomicStub = stub(kv, 'atomic', () => atomicMock as any);

    try {
      const result = await initStats('instance' as any, 'character_id');

      assertEquals(result.character.combat?.baseStats, {
        attack: 6,
        defense: 3,
        speed: 3,
      });

      assertEquals(result.character.combat?.skills, {
        dodge: { level: 1 },
      });
    } finally {
      getValueAndTimestampStub.restore();
      getValueStub.restore();
      atomicStub.restore();
      randomStub.restore();
    }
  });

  await test.step('5*', async () => {
    const getValueAndTimestampStub = stub(
      db,
      'getValueAndTimestamp',
      () => Promise.resolve({ value: { rating: 5 }, versionstamp: '_' }) as any,
    );

    const getValueStub = stub(db, 'getValue', () => Promise.resolve({}));

    const randomStub = stub(Math, 'random', () => 0.5);

    const atomicMock = {
      check: () => atomicMock,
      set: () => atomicMock,
      commit: () => Promise.resolve({ ok: true }),
    };

    const atomicStub = stub(kv, 'atomic', () => atomicMock as any);

    try {
      const result = await initStats('instance' as any, 'character_id');

      assertEquals(result.character.combat?.baseStats, {
        attack: 7,
        defense: 4,
        speed: 4,
      });

      assertEquals(result.character.combat?.skills, {
        dodge: { level: 1 },
      });
    } finally {
      getValueAndTimestampStub.restore();
      getValueStub.restore();
      atomicStub.restore();
      randomStub.restore();
    }
  });
});

// Deno.test('upgradeStats', async (test) => {
//   await test.step('upgrade attack', async () => {
//     const inventory = { _id: 'inventory_id' };
//     const characterId = 'someCharacterId';
//     const type = 'atk';
//     const amount = 5;

//     const getValueAndTimestampStub = stub(
//       db,
//       'getValueAndTimestamp',
//       () =>
//         Promise.resolve({
//           value: {
//             inventory: 'inventory_id',
//             combat: {
//               baseStats: { attack: 10, defense: 0, speed: 0 },
//               curStats: { attack: 10, defense: 0, speed: 0 },
//               unclaimedStatsPoints: 10,
//             } satisfies CharacterCombat,
//           },
//           versionstamp: '_',
//         } as any),
//     );

//     const getValueStub = stub(db, 'getValue', () => Promise.resolve({}));

//     const atomicMock = {
//       check: () => atomicMock,
//       set: () => atomicMock,
//       commit: () => Promise.resolve({ ok: true }),
//     };

//     const atomicStub = stub(kv, 'atomic', () => atomicMock as any);

//     try {
//       const updatedCharacter = await upgradeStats(
//         inventory as any,
//         characterId,
//         type,
//         amount,
//       );

//       assertEquals(updatedCharacter.combat?.curStats?.attack, 15);
//     } finally {
//       getValueAndTimestampStub.restore();
//       getValueStub.restore();
//       atomicStub.restore();
//     }
//   });

//   await test.step('upgrade defense', async () => {
//     const inventory = { _id: 'inventory_id' };
//     const characterId = 'someCharacterId';
//     const type = 'def';
//     const amount = 5;

//     const getValueAndTimestampStub = stub(
//       db,
//       'getValueAndTimestamp',
//       () =>
//         Promise.resolve({
//           value: {
//             inventory: 'inventory_id',
//             combat: {
//               baseStats: { defense: 10, attack: 0, speed: 0 },
//               curStats: { defense: 10, attack: 0, speed: 0 },
//               unclaimedStatsPoints: 10,
//             } satisfies CharacterCombat,
//           },
//           versionstamp: '_',
//         } as any),
//     );

//     const getValueStub = stub(db, 'getValue', () => Promise.resolve({}));

//     const atomicMock = {
//       check: () => atomicMock,
//       set: () => atomicMock,
//       commit: () => Promise.resolve({ ok: true }),
//     };

//     const atomicStub = stub(kv, 'atomic', () => atomicMock as any);

//     try {
//       const updatedCharacter = await upgradeStats(
//         inventory as any,
//         characterId,
//         type,
//         amount,
//       );

//       assertEquals(updatedCharacter.combat?.curStats?.defense, 15);
//     } finally {
//       getValueAndTimestampStub.restore();
//       getValueStub.restore();
//       atomicStub.restore();
//     }
//   });

//   await test.step('upgrade speed', async () => {
//     const inventory = { _id: 'inventory_id' };
//     const characterId = 'someCharacterId';
//     const type = 'spd';
//     const amount = 5;

//     const getValueAndTimestampStub = stub(
//       db,
//       'getValueAndTimestamp',
//       () =>
//         Promise.resolve({
//           value: {
//             inventory: 'inventory_id',
//             combat: {
//               baseStats: { speed: 10, defense: 0, attack: 0 },
//               curStats: { speed: 10, defense: 0, attack: 0 },
//               unclaimedStatsPoints: 10,
//             } satisfies CharacterCombat,
//           },
//           versionstamp: '_',
//         } as any),
//     );

//     const getValueStub = stub(db, 'getValue', () => Promise.resolve({}));

//     const atomicMock = {
//       check: () => atomicMock,
//       set: () => atomicMock,
//       commit: () => Promise.resolve({ ok: true }),
//     };

//     const atomicStub = stub(kv, 'atomic', () => atomicMock as any);

//     try {
//       const updatedCharacter = await upgradeStats(
//         inventory as any,
//         characterId,
//         type,
//         amount,
//       );

//       assertEquals(updatedCharacter.combat?.curStats?.speed, 15);
//     } finally {
//       getValueAndTimestampStub.restore();
//       getValueStub.restore();
//       atomicStub.restore();
//     }
//   });

//   await test.step('not enough unclaimed stat points', async () => {
//     const inventory = { _id: 'inventory_id' };
//     const characterId = 'someCharacterId';
//     const type = 'atk';
//     const amount = 5;

//     const getValueAndTimestampStub = stub(
//       db,
//       'getValueAndTimestamp',
//       () =>
//         Promise.resolve({
//           value: {
//             inventory: 'inventory_id',
//             combat: {
//               baseStats: { attack: 10, defense: 0, speed: 0 },
//               curStats: { attack: 10, defense: 0, speed: 0 },
//               unclaimedStatsPoints: 0,
//             } satisfies CharacterCombat,
//           },
//           versionstamp: '_',
//         } as any),
//     );

//     const getValueStub = stub(db, 'getValue', () => Promise.resolve({}));

//     const atomicMock = {
//       check: () => atomicMock,
//       set: () => atomicMock,
//       commit: () => Promise.resolve({ ok: true }),
//     };

//     const atomicStub = stub(kv, 'atomic', () => atomicMock as any);

//     try {
//       await assertRejects(
//         () =>
//           upgradeStats(
//             inventory as any,
//             characterId,
//             type,
//             amount,
//           ),
//         Error,
//         'NOT_ENOUGH_UNCLAIMED',
//       );
//     } finally {
//       getValueAndTimestampStub.restore();
//       getValueStub.restore();
//       atomicStub.restore();
//     }
//   });

//   await test.step('unknown stat type', async () => {
//     const inventory = { _id: 'inventory_id' };
//     const characterId = 'someCharacterId';
//     const type = 'faketype';
//     const amount = 5;

//     const getValueAndTimestampStub = stub(
//       db,
//       'getValueAndTimestamp',
//       () =>
//         Promise.resolve({
//           value: {
//             inventory: 'inventory_id',
//             combat: {
//               baseStats: { attack: 10, defense: 0, speed: 0 },
//               curStats: { attack: 10, defense: 0, speed: 0 },
//               unclaimedStatsPoints: 0,
//             } satisfies CharacterCombat,
//           },
//           versionstamp: '_',
//         } as any),
//     );

//     const getValueStub = stub(db, 'getValue', () => Promise.resolve({}));

//     const atomicMock = {
//       check: () => atomicMock,
//       set: () => atomicMock,
//       commit: () => Promise.resolve({ ok: true }),
//     };

//     const atomicStub = stub(kv, 'atomic', () => atomicMock as any);

//     try {
//       await assertRejects(
//         () =>
//           upgradeStats(
//             inventory as any,
//             characterId,
//             type,
//             amount,
//           ),
//         Error,
//         'UNKNOWN_STAT_TYPE',
//       );
//     } finally {
//       getValueAndTimestampStub.restore();
//       getValueStub.restore();
//       atomicStub.restore();
//     }
//   });

//   await test.step('character not initiated', async () => {
//     const inventory = { _id: 'inventory_id' };
//     const characterId = 'someCharacterId';
//     const type = 'atk';
//     const amount = 5;

//     const getValueAndTimestampStub = stub(
//       db,
//       'getValueAndTimestamp',
//       () =>
//         Promise.resolve({
//           value: {
//             inventory: 'inventory_id',
//           },
//           versionstamp: '_',
//         } as any),
//     );

//     const getValueStub = stub(db, 'getValue', () => Promise.resolve({}));

//     const atomicMock = {
//       check: () => atomicMock,
//       set: () => atomicMock,
//       commit: () => Promise.resolve({ ok: true }),
//     };

//     const atomicStub = stub(kv, 'atomic', () => atomicMock as any);

//     try {
//       await assertRejects(
//         () =>
//           upgradeStats(
//             inventory as any,
//             characterId,
//             type,
//             amount,
//           ),
//         Error,
//         'CHARACTER_NOT_INITIATED',
//       );
//     } finally {
//       getValueAndTimestampStub.restore();
//       getValueStub.restore();
//       atomicStub.restore();
//     }
//   });

//   await test.step('character not found', async () => {
//     const inventory = { _id: 'inventory_id' };
//     const characterId = 'someCharacterId';
//     const type = 'atk';
//     const amount = 5;

//     const getValueAndTimestampStub = stub(
//       db,
//       'getValueAndTimestamp',
//       () =>
//         Promise.resolve({
//           value: undefined,
//           versionstamp: '_',
//         } as any),
//     );

//     const getValueStub = stub(db, 'getValue', () => Promise.resolve({}));

//     const atomicMock = {
//       check: () => atomicMock,
//       set: () => atomicMock,
//       commit: () => Promise.resolve({ ok: true }),
//     };

//     const atomicStub = stub(kv, 'atomic', () => atomicMock as any);

//     try {
//       await assertRejects(
//         () =>
//           upgradeStats(
//             inventory as any,
//             characterId,
//             type,
//             amount,
//           ),
//         Error,
//         'CHARACTER_NOT_FOUND',
//       );
//     } finally {
//       getValueAndTimestampStub.restore();
//       getValueStub.restore();
//       atomicStub.restore();
//     }
//   });
// });
