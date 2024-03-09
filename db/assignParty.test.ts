// deno-lint-ignore-file

import { assertEquals } from '$std/assert/mod.ts';
import { stub } from '$std/testing/mock.ts';

import db, { kv } from '~/db/mod.ts';

Deno.test('assign character', async (test) => {
  await test.step('assign a character and init its stats', async () => {
    const inventorySpy = { _id: 'user_id' };

    const getInventoryStub = stub(
      db,
      'getInventory',
      () =>
        Promise.resolve({
          inventory: inventorySpy,
          inventoryCheck: '_',
        }) as any,
    );

    const getValueAndTimestampStub = stub(
      db,
      'getValueAndTimestamp',
      () =>
        Promise.resolve({
          value: { _id: 'character_id', inventory: 'user_id', rating: 3 },
          versionstamp: '_',
        }) as any,
    );

    const randomStub = stub(Math, 'random', () => 0.5);

    const atomicMock = {
      check: () => atomicMock,
      set: () => atomicMock,
      commit: () => Promise.resolve({ ok: true }),
    };

    const atomicStub = stub(kv, 'atomic', () => atomicMock as any);

    try {
      const result = await db.assignCharacter(
        'user' as any,
        'instance' as any,
        'character_id',
      );

      assertEquals(result.combat?.baseStats, {
        attack: 0,
        defense: 9,
        speed: 0,
        hp: 10,
      });

      assertEquals(result.combat?.skills, {});

      assertEquals(inventorySpy, {
        _id: 'user_id',
        party: {
          member1: 'character_id',
        },
      } as any);
    } finally {
      getInventoryStub.restore();
      getValueAndTimestampStub.restore();
      atomicStub.restore();
      randomStub.restore();
    }
  });

  await test.step('assign a character in existing spot', async () => {
    const inventorySpy = {
      _id: 'user_id',
      party: {
        member1: 'another_character_id',
      },
    };

    const getInventoryStub = stub(
      db,
      'getInventory',
      () =>
        Promise.resolve({
          inventory: inventorySpy,
          inventoryCheck: '_',
        }) as any,
    );

    const getValueAndTimestampStub = stub(
      db,
      'getValueAndTimestamp',
      () =>
        Promise.resolve({
          value: {
            _id: 'character_id',
            inventory: 'user_id',
            rating: 3,
            combat: {
              baseStats: {
                attack: 1,
              },
            },
          },
          versionstamp: '_',
        }) as any,
    );

    const atomicMock = {
      check: () => atomicMock,
      set: () => atomicMock,
      commit: () => Promise.resolve({ ok: true }),
    };

    const atomicStub = stub(kv, 'atomic', () => atomicMock as any);

    try {
      const result = await db.assignCharacter(
        'user' as any,
        'instance' as any,
        'character_id',
        1,
      );

      assertEquals(result.combat?.baseStats, {
        attack: 1,
      } as any);

      assertEquals(inventorySpy, {
        _id: 'user_id',
        party: {
          member1: 'character_id',
        },
      } as any);
    } finally {
      getInventoryStub.restore();
      getValueAndTimestampStub.restore();
      atomicStub.restore();
    }
  });

  await test.step('assign a character to the next free spot', async () => {
    const inventorySpy = {
      _id: 'user_id',
      party: {
        member1: 'another_character_id',
      },
    };

    const getInventoryStub = stub(
      db,
      'getInventory',
      () =>
        Promise.resolve({
          inventory: inventorySpy,
          inventoryCheck: '_',
        }) as any,
    );

    const getValueAndTimestampStub = stub(
      db,
      'getValueAndTimestamp',
      () =>
        Promise.resolve({
          value: {
            _id: 'character_id',
            inventory: 'user_id',
            rating: 3,
            combat: {
              baseStats: {
                attack: 1,
              },
            },
          },
          versionstamp: '_',
        }) as any,
    );

    const atomicMock = {
      check: () => atomicMock,
      set: () => atomicMock,
      commit: () => Promise.resolve({ ok: true }),
    };

    const atomicStub = stub(kv, 'atomic', () => atomicMock as any);

    try {
      const result = await db.assignCharacter(
        'user' as any,
        'instance' as any,
        'character_id',
      );

      assertEquals(result.combat?.baseStats, {
        attack: 1,
      } as any);

      assertEquals(inventorySpy, {
        _id: 'user_id',
        party: {
          member1: 'another_character_id',
          member2: 'character_id',
        },
      } as any);
    } finally {
      getInventoryStub.restore();
      getValueAndTimestampStub.restore();
      atomicStub.restore();
    }
  });
});
