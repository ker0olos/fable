// deno-lint-ignore-file no-explicit-any

import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from 'https://deno.land/std@0.179.0/testing/mock.ts';

import { assertEquals } from 'https://deno.land/std@0.179.0/testing/asserts.ts';

import { assertSnapshot } from 'https://deno.land/std@0.179.0/testing/snapshot.ts';

import {
  FakeAnd,
  FakeAppend,
  FakeClient,
  FakeEquals,
  FakeGet,
  FakeIf,
  FakeIndex,
  FakeIsNonEmpty,
  FakeLet,
  FakeMatch,
  FakeRef,
  FakeRemove,
  FakeUpdate,
  FakeVar,
} from './fql.mock.ts';

import { fql } from './fql.ts';

import {
  default as Model,
  giveCharacters,
  tradeCharacters,
} from './trade_characters.ts';

Deno.test('give characters', async (test) => {
  await test.step('ok', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const getStub = FakeGet();
    const refStub = FakeRef();
    const appendStub = FakeAppend();
    const removeStub = FakeRemove();
    const equalsStub = FakeEquals();
    const updateStub = FakeUpdate();
    const isNotEmptyStub = FakeIsNonEmpty();

    const indexStub = FakeIndex();

    const matchStub = FakeMatch({
      'id': 'given_character',
    });

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        { ref: 'user' },
        ['user_characters', { ref: 'character' }],
        ['target_characters'],
        ['character_history'],
      ]) as any,
    );

    const varStub = FakeVar({
      'giveCharacterRef': {
        ref: 'character',
      },
    });

    try {
      const response = giveCharacters({
        user: 'user',
        target: 'target',
        inventory: 'inventory',
        targetInventory: 'target_inventory',
        giveCharacterId: 'given_character_id',
        instance: 'instance',
      } as any) as any;

      assertSpyCall(indexStub, 0, {
        args: ['characters_instance_id'],
      });

      assertSpyCall(matchStub, 0, {
        args: [
          'characters_instance_id' as any,
          'given_character_id',
          {
            ref: 'instance',
          },
        ],
      });

      assertSpyCall(equalsStub, 0, {
        args: [{
          ref: 'user',
        }, {
          ref: 'user',
        }],
        returned: true,
      });

      assertSpyCall(removeStub, 0, {
        args: [
          { ref: 'character' } as any,
          ['user_characters', { ref: 'character' }] as any,
        ] as any,
        returned: ['user_characters'] as any,
      });

      assertSpyCall(appendStub, 0, {
        args: [
          { ref: 'character' } as any,
          ['target_characters'] as any,
        ],
        returned: ['target_characters', { ref: 'character' }] as any,
      });

      assertSpyCall(updateStub, 0, {
        args: [
          { ref: 'inventory' } as any,
          { characters: ['user_characters'] },
        ],
      });

      assertSpyCall(updateStub, 1, {
        args: [
          { ref: 'target_inventory' } as any,
          { characters: ['target_characters', { ref: 'character' }] },
        ],
      });

      assertSpyCall(updateStub, 2, {
        args: [
          { ref: 'character' } as any,
          {
            inventory: { ref: 'target_inventory' },
            user: { ref: 'target' },
            history: [
              'character_history',
              {
                from: {
                  ref: 'user',
                },
                to: {
                  ref: 'target',
                },
              },
            ],
          },
        ],
      });

      assertEquals(response, {
        ok: true,
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      getStub.restore();
      varStub.restore();
      refStub.restore();
      matchStub.restore();
      indexStub.restore();
      selectStub.restore();
      appendStub.restore();
      removeStub.restore();
      equalsStub.restore();
      updateStub.restore();
      isNotEmptyStub.restore();
    }
  });

  await test.step('not owned', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const getStub = FakeGet();
    const refStub = FakeRef();
    const equalsStub = FakeEquals();
    const isNotEmptyStub = FakeIsNonEmpty();

    const indexStub = FakeIndex();

    const matchStub = FakeMatch({
      'id': 'given_character',
    });

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        { ref: 'another_user' },
        ['user_characters', { ref: 'character' }],
        ['target_characters'],
        ['character_history'],
      ]) as any,
    );

    const varStub = FakeVar({
      'giveCharacterRef': {
        ref: 'character',
      },
    });

    try {
      const response = giveCharacters({
        user: 'user',
        target: 'target',
        inventory: 'inventory',
        targetInventory: 'target_inventory',
        giveCharacterId: 'given_character_id',
        instance: 'instance',
      } as any) as any;

      assertSpyCall(indexStub, 0, {
        args: ['characters_instance_id'],
      });

      assertSpyCall(matchStub, 0, {
        args: [
          'characters_instance_id' as any,
          'given_character_id',
          {
            ref: 'instance',
          },
        ],
      });

      assertEquals(response, {
        ok: false,
        error: 'CHARACTER_NOT_OWNED',
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      getStub.restore();
      varStub.restore();
      refStub.restore();
      matchStub.restore();
      indexStub.restore();
      selectStub.restore();
      equalsStub.restore();
      isNotEmptyStub.restore();
    }
  });

  await test.step('not found', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const getStub = FakeGet();
    const refStub = FakeRef();
    const isNotEmptyStub = FakeIsNonEmpty();

    const indexStub = FakeIndex();

    const matchStub = FakeMatch();

    const varStub = FakeVar();

    try {
      const response = giveCharacters({
        user: 'user',
        target: 'target',
        inventory: 'inventory',
        targetInventory: 'target_inventory',
        giveCharacterId: 'given_character_id',
        instance: 'instance',
      } as any) as any;

      assertSpyCall(indexStub, 0, {
        args: ['characters_instance_id'],
      });

      assertSpyCall(matchStub, 0, {
        args: [
          'characters_instance_id' as any,
          'given_character_id',
          {
            ref: 'instance',
          },
        ],
      });

      assertEquals(response, {
        ok: false,
        error: 'CHARACTER_NOT_FOUND',
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      getStub.restore();
      varStub.restore();
      refStub.restore();
      matchStub.restore();
      indexStub.restore();
      isNotEmptyStub.restore();
    }
  });
});

Deno.test('trade characters', async (test) => {
  await test.step('ok', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const getStub = FakeGet();
    const refStub = FakeRef();
    const andStub = FakeAnd();
    const appendStub = FakeAppend();
    const removeStub = FakeRemove();
    const equalsStub = FakeEquals();
    const updateStub = FakeUpdate();
    const isNotEmptyStub = FakeIsNonEmpty();

    const indexStub = FakeIndex();

    const matchStub = stub(
      fql,
      'Match',
      returnsNext([
        { id: 'given_character' },
        { id: 'taken_character' },
      ]) as any,
    );

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        { ref: 'user' },
        { ref: 'target' },
        ['user_characters', { ref: 'given_character' }],
        ['target_characters', { ref: 'taken_character' }],
        ['given_character_history'],
        ['taken_character_history'],
      ]) as any,
    );

    const varStub = FakeVar({
      'giveCharacterRef': {
        ref: 'given_character',
      },
      'takeCharacterRef': {
        ref: 'taken_character',
      },
    });

    try {
      const response = tradeCharacters({
        user: 'user',
        target: 'target',
        inventory: 'inventory',
        targetInventory: 'target_inventory',
        giveCharacterId: 'given_character_id',
        takeCharacterId: 'taken_character_id',
        instance: 'instance',
      } as any) as any;

      assertSpyCall(indexStub, 0, {
        args: ['characters_instance_id'],
      });

      assertSpyCall(indexStub, 1, {
        args: ['characters_instance_id'],
      });

      assertSpyCall(matchStub, 0, {
        args: [
          'characters_instance_id' as any,
          'given_character_id',
          {
            ref: 'instance',
          },
        ],
      });

      assertSpyCall(matchStub, 1, {
        args: [
          'characters_instance_id' as any,
          'taken_character_id',
          {
            ref: 'instance',
          },
        ],
      });

      assertSpyCall(equalsStub, 0, {
        args: [{
          ref: 'user',
        }, {
          ref: 'user',
        }],
        returned: true,
      });

      assertSpyCall(equalsStub, 1, {
        args: [{
          ref: 'target',
        }, {
          ref: 'target',
        }],
        returned: true,
      });

      assertSpyCall(removeStub, 0, {
        args: [
          { ref: 'given_character' } as any,
          ['user_characters', { ref: 'given_character' }] as any,
        ] as any,
        returned: ['user_characters'] as any,
      });

      assertSpyCall(removeStub, 1, {
        args: [
          { ref: 'taken_character' } as any,
          ['target_characters', { ref: 'taken_character' }] as any,
        ] as any,
        returned: ['target_characters'] as any,
      });

      assertSpyCall(appendStub, 0, {
        args: [
          { ref: 'taken_character' } as any,
          ['user_characters'] as any,
        ],
        returned: ['user_characters', { ref: 'taken_character' }] as any,
      });

      assertSpyCall(appendStub, 1, {
        args: [
          { ref: 'given_character' } as any,
          ['target_characters'] as any,
        ],
        returned: ['target_characters', { ref: 'given_character' }] as any,
      });

      assertSpyCall(updateStub, 0, {
        args: [
          { ref: 'inventory' } as any,
          { characters: ['user_characters', { ref: 'taken_character' }] },
        ],
      });

      assertSpyCall(updateStub, 1, {
        args: [
          { ref: 'target_inventory' } as any,
          { characters: ['target_characters', { ref: 'given_character' }] },
        ],
      });

      assertSpyCall(updateStub, 2, {
        args: [
          { ref: 'given_character' } as any,
          {
            inventory: { ref: 'target_inventory' },
            user: { ref: 'target' },
            history: [
              'given_character_history',
              {
                from: {
                  ref: 'user',
                },
                to: {
                  ref: 'target',
                },
              },
            ],
          },
        ],
      });

      assertSpyCall(updateStub, 3, {
        args: [
          { ref: 'taken_character' } as any,
          {
            inventory: { ref: 'inventory' },
            user: { ref: 'user' },
            history: [
              'taken_character_history',
              {
                from: {
                  ref: 'target',
                },
                to: {
                  ref: 'user',
                },
              },
            ],
          },
        ],
      });

      assertEquals(response, {
        ok: true,
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      getStub.restore();
      varStub.restore();
      refStub.restore();
      andStub.restore();
      appendStub.restore();
      removeStub.restore();
      matchStub.restore();
      indexStub.restore();
      selectStub.restore();
      equalsStub.restore();
      updateStub.restore();
      isNotEmptyStub.restore();
    }
  });

  await test.step('not owned (give)', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const getStub = FakeGet();
    const refStub = FakeRef();
    const andStub = FakeAnd();
    const equalsStub = FakeEquals();
    const isNotEmptyStub = FakeIsNonEmpty();

    const indexStub = FakeIndex();

    const matchStub = stub(
      fql,
      'Match',
      returnsNext([
        { id: 'given_character' },
        { id: 'taken_character' },
      ]) as any,
    );

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        { ref: 'another_user' },
        { ref: 'target' },
        ['user_characters', { ref: 'character' }],
        ['target_characters'],
        ['given_character_history'],
        ['taken_character_history'],
      ]) as any,
    );

    const varStub = FakeVar({
      'giveCharacterRef': {
        ref: 'given_character',
      },
      'takeCharacterRef': {
        ref: 'taken_character',
      },
    });

    try {
      const response = tradeCharacters({
        user: 'user',
        target: 'target',
        inventory: 'inventory',
        targetInventory: 'target_inventory',
        giveCharacterId: 'given_character_id',
        takeCharacterId: 'taken_character_id',
        instance: 'instance',
      } as any) as any;

      assertSpyCall(indexStub, 0, {
        args: ['characters_instance_id'],
      });

      assertSpyCall(indexStub, 1, {
        args: ['characters_instance_id'],
      });

      assertSpyCall(matchStub, 0, {
        args: [
          'characters_instance_id' as any,
          'given_character_id',
          {
            ref: 'instance',
          },
        ],
      });

      assertSpyCall(matchStub, 1, {
        args: [
          'characters_instance_id' as any,
          'taken_character_id',
          {
            ref: 'instance',
          },
        ],
      });

      assertEquals(response, {
        ok: false,
        error: 'CHARACTER_NOT_OWNED',
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      getStub.restore();
      varStub.restore();
      refStub.restore();
      andStub.restore();
      matchStub.restore();
      indexStub.restore();
      selectStub.restore();
      equalsStub.restore();
      isNotEmptyStub.restore();
    }
  });

  await test.step('not owned (take)', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const getStub = FakeGet();
    const refStub = FakeRef();
    const andStub = FakeAnd();
    const equalsStub = FakeEquals();
    const isNotEmptyStub = FakeIsNonEmpty();

    const indexStub = FakeIndex();

    const matchStub = stub(
      fql,
      'Match',
      returnsNext([
        { id: 'given_character' },
        { id: 'taken_character' },
      ]) as any,
    );

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        { ref: 'user' },
        { ref: 'another_user' },
        ['user_characters', { ref: 'character' }],
        ['target_characters'],
        ['given_character_history'],
        ['taken_character_history'],
      ]) as any,
    );

    const varStub = FakeVar({
      'giveCharacterRef': {
        ref: 'given_character',
      },
      'takeCharacterRef': {
        ref: 'taken_character',
      },
    });

    try {
      const response = tradeCharacters({
        user: 'user',
        target: 'target',
        inventory: 'inventory',
        targetInventory: 'target_inventory',
        giveCharacterId: 'given_character_id',
        takeCharacterId: 'taken_character_id',
        instance: 'instance',
      } as any) as any;

      assertSpyCall(indexStub, 0, {
        args: ['characters_instance_id'],
      });

      assertSpyCall(indexStub, 1, {
        args: ['characters_instance_id'],
      });

      assertSpyCall(matchStub, 0, {
        args: [
          'characters_instance_id' as any,
          'given_character_id',
          {
            ref: 'instance',
          },
        ],
      });

      assertSpyCall(matchStub, 1, {
        args: [
          'characters_instance_id' as any,
          'taken_character_id',
          {
            ref: 'instance',
          },
        ],
      });

      assertEquals(response, {
        ok: false,
        error: 'CHARACTER_NOT_OWNED',
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      getStub.restore();
      varStub.restore();
      refStub.restore();
      andStub.restore();
      matchStub.restore();
      indexStub.restore();
      selectStub.restore();
      equalsStub.restore();
      isNotEmptyStub.restore();
    }
  });

  await test.step('not found (give)', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const getStub = FakeGet();
    const refStub = FakeRef();
    const andStub = FakeAnd();
    const isNotEmptyStub = FakeIsNonEmpty();

    const indexStub = FakeIndex();

    const matchStub = stub(
      fql,
      'Match',
      returnsNext([
        undefined,
        { id: 'taken_character' },
      ]) as any,
    );

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        { ref: 'user' },
        { ref: 'another_user' },
        ['user_characters', { ref: 'character' }],
        ['target_characters'],
        ['given_character_history'],
        ['taken_character_history'],
      ]) as any,
    );

    const varStub = FakeVar({
      'giveCharacterRef': {
        ref: 'given_character',
      },
      'takeCharacterRef': {
        ref: 'taken_character',
      },
    });

    try {
      const response = tradeCharacters({
        user: 'user',
        target: 'target',
        inventory: 'inventory',
        targetInventory: 'target_inventory',
        giveCharacterId: 'given_character_id',
        takeCharacterId: 'taken_character_id',
        instance: 'instance',
      } as any) as any;

      assertSpyCall(indexStub, 0, {
        args: ['characters_instance_id'],
      });

      assertSpyCall(indexStub, 1, {
        args: ['characters_instance_id'],
      });

      assertSpyCall(matchStub, 0, {
        args: [
          'characters_instance_id' as any,
          'given_character_id',
          {
            ref: 'instance',
          },
        ],
      });

      assertSpyCall(matchStub, 1, {
        args: [
          'characters_instance_id' as any,
          'taken_character_id',
          {
            ref: 'instance',
          },
        ],
      });

      assertEquals(response, {
        ok: false,
        error: 'CHARACTER_NOT_FOUND',
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      getStub.restore();
      varStub.restore();
      refStub.restore();
      andStub.restore();
      matchStub.restore();
      indexStub.restore();
      selectStub.restore();
      isNotEmptyStub.restore();
    }
  });

  await test.step('not found (take)', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const getStub = FakeGet();
    const refStub = FakeRef();
    const andStub = FakeAnd();
    const isNotEmptyStub = FakeIsNonEmpty();

    const indexStub = FakeIndex();

    const matchStub = stub(
      fql,
      'Match',
      returnsNext([
        { id: 'given_character' },
        undefined,
      ]) as any,
    );

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        { ref: 'user' },
        { ref: 'another_user' },
        ['user_characters', { ref: 'character' }],
        ['target_characters'],
        ['given_character_history'],
        ['taken_character_history'],
      ]) as any,
    );

    const varStub = FakeVar({
      'giveCharacterRef': {
        ref: 'given_character',
      },
      'takeCharacterRef': {
        ref: 'taken_character',
      },
    });

    try {
      const response = tradeCharacters({
        user: 'user',
        target: 'target',
        inventory: 'inventory',
        targetInventory: 'target_inventory',
        giveCharacterId: 'given_character_id',
        takeCharacterId: 'taken_character_id',
        instance: 'instance',
      } as any) as any;

      assertSpyCall(indexStub, 0, {
        args: ['characters_instance_id'],
      });

      assertSpyCall(indexStub, 1, {
        args: ['characters_instance_id'],
      });

      assertSpyCall(matchStub, 0, {
        args: [
          'characters_instance_id' as any,
          'given_character_id',
          {
            ref: 'instance',
          },
        ],
      });

      assertSpyCall(matchStub, 1, {
        args: [
          'characters_instance_id' as any,
          'taken_character_id',
          {
            ref: 'instance',
          },
        ],
      });

      assertEquals(response, {
        ok: false,
        error: 'CHARACTER_NOT_FOUND',
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      getStub.restore();
      varStub.restore();
      refStub.restore();
      andStub.restore();
      matchStub.restore();
      indexStub.restore();
      selectStub.restore();
      isNotEmptyStub.restore();
    }
  });
});

Deno.test('model', async (test) => {
  const client = FakeClient();

  Model(client as any).resolvers?.forEach((q) => q());

  assertSpyCalls(client.query, 2);

  await assertSnapshot(test, client.query.calls[0].args);
  await assertSnapshot(test, client.query.calls[1].args);
});
