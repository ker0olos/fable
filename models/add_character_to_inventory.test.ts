// deno-lint-ignore-file no-explicit-any

import {
  assertSpyCall,
  assertSpyCallArg,
  assertSpyCalls,
  returnsNext,
  stub,
} from 'https://deno.land/std@0.178.0/testing/mock.ts';

import { assertEquals } from 'https://deno.land/std@0.178.0/testing/asserts.ts';

import { assertSnapshot } from 'https://deno.land/std@0.178.0/testing/snapshot.ts';

import {
  FakeAppend,
  FakeClient,
  FakeCreate,
  FakeIf,
  FakeIndex,
  FakeIsNonEmpty,
  FakeLet,
  FakeLTE,
  FakeMatch,
  FakeNow,
  FakeRef,
  FakeSelect,
  FakeSubtract,
  FakeUpdate,
  FakeVar,
} from './fql.mock.ts';

import {
  addCharacter,
  default as Model,
} from './add_character_to_inventory.ts';

import { fql } from './fql.ts';

Deno.test('add character to inventory', async (test) => {
  await test.step('ok', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const varStub = FakeVar();
    const refStub = FakeRef();
    const indexStub = FakeIndex();
    const appendStub = FakeAppend();
    const isNonEmptyStub = FakeIsNonEmpty();
    const subtractStub = FakeSubtract();
    const matchStub = FakeMatch();
    const lteStub = FakeLTE();

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([1, new Date('2023-02-19T18:29:17.549Z'), 1, {
        ref: 'anotherCharacter',
      }]) as any,
    );

    const nowStub = FakeNow(new Date('2023-02-06T00:44:59.295Z'));

    const createStub = FakeCreate();
    const updateStub = FakeUpdate();

    try {
      const response = addCharacter({
        characterId: 'character_id',
        mediaId: 'media_id',
        rating: 4,
        inventory: 'inventory',
        instance: 'instance',
        user: 'user',
        pool: 1,
        popularityChance: 1,
        popularityGreater: 0,
        popularityLesser: 100,
        roleChance: 1,
        role: 'role',
      } as any) as any;

      assertSpyCall(indexStub, 0, {
        args: ['characters_instance_id'],
      });

      assertSpyCall(matchStub, 0, {
        args: [
          'characters_instance_id' as any,
          'character_id',
          {
            ref: 'instance',
          },
        ],
      });

      assertSpyCall(selectStub, 0, {
        args: [
          ['data', 'availablePulls'],
          'inventory' as any,
        ],
      });

      assertSpyCallArg(ifStub, 1, 0, false);
      assertSpyCallArg(ifStub, 0, 0, false);

      assertSpyCall(createStub, 0, {
        args: [
          'character' as any,
          {
            id: 'character_id',
            mediaId: 'media_id',
            rating: 4,
            inventory: {
              ref: 'inventory',
            },
            user: {
              ref: 'user',
            },
            instance: {
              ref: 'instance',
            },
            history: [{
              gacha: {
                by: {
                  ref: 'user',
                },
                pool: 1,
                popularityChance: 1,
                popularityGreater: 0,
                popularityLesser: 100,
                roleChance: 1,
                role: 'role',
              },
            }],
          },
        ],
      });

      assertSpyCall(updateStub, 0, {
        args: [
          { ref: 'inventory' } as any,
          {
            lastPull: new Date('2023-02-06T00:44:59.295Z'),
            rechargeTimestamp: new Date('2023-02-19T18:29:17.549Z'),
            availablePulls: 0,
            characters: [
              {
                ref: 'createdCharacter',
              },
              {
                ref: 'anotherCharacter',
              },
            ],
          },
        ],
      });

      assertEquals(response, {
        ok: true,
        character: {
          ref: 'character',
        },
        inventory: {
          ref: 'inventory',
        },
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      varStub.restore();
      refStub.restore();
      indexStub.restore();
      appendStub.restore();
      isNonEmptyStub.restore();
      subtractStub.restore();
      matchStub.restore();
      selectStub.restore();
      lteStub.restore();
      nowStub.restore();
      createStub.restore();
      updateStub.restore();
    }
  });

  await test.step('character exists', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const refStub = FakeRef();
    const indexStub = FakeIndex();
    const isNonEmptyStub = FakeIsNonEmpty();
    const lteStub = FakeLTE();

    const selectStub = FakeSelect(1);

    const matchStub = FakeMatch({ match: true });

    try {
      const response = addCharacter({
        characterId: 'character_id',
        inventory: 'inventory',
        instance: 'instance',
        user: 'user',
        pool: 1,
        popularityChance: 1,
        popularityGreater: 0,
        popularityLesser: 100,
        roleChance: 1,
        role: 'role',
      } as any) as any;

      assertSpyCall(indexStub, 0, {
        args: ['characters_instance_id'],
      });

      assertSpyCall(matchStub, 0, {
        args: [
          'characters_instance_id' as any,
          'character_id',
          {
            ref: 'instance',
          },
        ],
      });

      assertSpyCallArg(ifStub, 0, 0, true);
      assertSpyCallArg(ifStub, 1, 0, false);

      assertEquals(response, {
        ok: false,
        error: 'CHARACTER_EXISTS',
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      refStub.restore();
      indexStub.restore();
      isNonEmptyStub.restore();
      selectStub.restore();
      lteStub.restore();
      matchStub.restore();
    }
  });

  await test.step('no available pulls', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const refStub = FakeRef();
    const indexStub = FakeIndex();
    const isNonEmptyStub = FakeIsNonEmpty();
    const matchStub = FakeMatch();
    const lteStub = FakeLTE();

    const selectStub = FakeSelect(0);

    try {
      const response = addCharacter({
        characterId: 'character_id',
        inventory: 'inventory',
        instance: 'instance',
        user: 'user',
        pool: 1,
        popularityChance: 1,
        popularityGreater: 0,
        popularityLesser: 100,
        roleChance: 1,
        role: 'role',
      } as any) as any;

      assertSpyCall(indexStub, 0, {
        args: ['characters_instance_id'],
      });

      assertSpyCall(matchStub, 0, {
        args: [
          'characters_instance_id' as any,
          'character_id',
          {
            ref: 'instance',
          },
        ],
      });

      assertSpyCall(selectStub, 0, {
        args: [
          ['data', 'availablePulls'],
          'inventory' as any,
        ],
      });

      assertSpyCallArg(ifStub, 0, 0, false);

      assertEquals(response, {
        ok: false,
        error: 'NO_PULLS_AVAILABLE',
        inventory: {
          ref: 'inventory',
        },
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      refStub.restore();
      indexStub.restore();
      isNonEmptyStub.restore();
      matchStub.restore();
      selectStub.restore();
      lteStub.restore();
    }
  });
});

Deno.test('model', async (test) => {
  const client = FakeClient();

  Model(client as any).indexers?.forEach((q) => q());
  Model(client as any).resolvers?.forEach((q) => q());

  assertSpyCalls(client.query, 1);

  await assertSnapshot(test, client.query.calls[0].args);
});
