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
  FakeAll,
  FakeAnd,
  FakeAppend,
  FakeAppendAll,
  FakeClient,
  FakeEquals,
  FakeFilter,
  FakeForeach,
  FakeGet,
  FakeIf,
  FakeIndex,
  FakeIsNonEmpty,
  FakeLet,
  FakeMap,
  FakeMatch,
  FakeNot,
  FakeRef,
  FakeRemoveAll,
  FakeUpdate,
  FakeVar,
} from './fql.mock.ts';

import { fql } from './fql.ts';

import {
  default as Model,
  giveCharacters,
  tradeCharacters,
  verifyCharacters,
} from './trade_characters.ts';

Deno.test('verify characters', async (test) => {
  await test.step('ok', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const getStub = FakeGet();
    const refStub = FakeRef();
    const notStub = FakeNot();
    const mapStub = FakeMap();
    const filterStub = FakeFilter();
    const allStub = FakeAll();
    const equalsStub = FakeEquals();
    const isNotEmptyStub = FakeIsNonEmpty();

    const indexStub = FakeIndex();

    const matchStub = stub(
      fql,
      'Match',
      returnsNext([
        { id: 'character_id' },
      ]) as any,
    );

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        { ref: 'user' },
        { ref: 'user' },
        'character_id',
        'character_id',
      ]) as any,
    );

    try {
      const response = verifyCharacters({
        user: 'user',
        inventory: 'inventory',
        charactersIds: ['character_id'],
        instance: 'instance',
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

      assertEquals(response, {
        ok: true,
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      getStub.restore();
      refStub.restore();
      notStub.restore();
      mapStub.restore();
      filterStub.restore();
      allStub.restore();
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
    const notStub = FakeNot();
    const mapStub = FakeMap();
    const filterStub = FakeFilter();
    const allStub = FakeAll();
    const equalsStub = FakeEquals();
    const isNotEmptyStub = FakeIsNonEmpty();

    const indexStub = FakeIndex();

    const matchStub = stub(
      fql,
      'Match',
      returnsNext([
        'character_id',
        undefined,
      ]) as any,
    );

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        { ref: 'user' },
        { ref: 'user' },
        { ref: 'user' },
        'character_id',
        'character_id',
        'character_id_2',
      ]) as any,
    );

    try {
      const response = verifyCharacters({
        user: 'user',
        inventory: 'inventory',
        charactersIds: ['character_id', 'character_id_2'],
        instance: 'instance',
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

      assertEquals(response, {
        ok: false,
        message: 'NOT_FOUND',
        errors: ['character_id_2'],
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      getStub.restore();
      refStub.restore();
      notStub.restore();
      mapStub.restore();
      filterStub.restore();
      allStub.restore();
      matchStub.restore();
      indexStub.restore();
      selectStub.restore();
      equalsStub.restore();
      isNotEmptyStub.restore();
    }
  });

  await test.step('not owned', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const getStub = FakeGet();
    const refStub = FakeRef();
    const notStub = FakeNot();
    const mapStub = FakeMap();
    const filterStub = FakeFilter();
    const allStub = FakeAll();
    const equalsStub = FakeEquals();
    const isNotEmptyStub = FakeIsNonEmpty();

    const indexStub = FakeIndex();

    const matchStub = stub(
      fql,
      'Match',
      returnsNext([
        { id: 'character_id' },
        { id: 'character_id_2' },
      ]) as any,
    );

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        { ref: 'user' },
        { ref: 'another_user' },
        { ref: 'user' },
        'character_id',
        'character_id_2',
        'character_id',
      ]) as any,
    );

    try {
      const response = verifyCharacters({
        user: 'user',
        inventory: 'inventory',
        charactersIds: ['character_id', 'character_id_2'],
        instance: 'instance',
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

      assertEquals(response, {
        ok: false,
        message: 'NOT_OWNED',
        errors: ['character_id_2'],
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      getStub.restore();
      refStub.restore();
      notStub.restore();
      mapStub.restore();
      filterStub.restore();
      allStub.restore();
      matchStub.restore();
      indexStub.restore();
      selectStub.restore();
      equalsStub.restore();
      isNotEmptyStub.restore();
    }
  });
});

Deno.test('give characters', async (test) => {
  await test.step('ok', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const getStub = FakeGet();
    const refStub = FakeRef();
    const mapStub = FakeMap();
    const allStub = FakeAll();
    const foreachStub = FakeForeach();
    const appendStub = FakeAppend();
    const appendAllStub = FakeAppendAll();
    const removeAllStub = FakeRemoveAll();
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
        { ref: 'user' },
        { ref: 'user' },
        ['user_characters', { ref: 'character' }],
        ['target_characters'],
        ['character_history'],
        ['character_history'],
        ['character_history'],
      ]) as any,
    );

    const varStub = FakeVar({
      'giveCharactersRefs': [
        {
          ref: 'character',
        },
        {
          ref: 'character2',
        },
        {
          ref: 'character3',
        },
      ],
    });

    try {
      const response = giveCharacters({
        user: 'user',
        target: 'target',
        instance: 'instance',
        inventory: 'inventory',
        targetInventory: 'target_inventory',
        charactersIds: [
          'given_character_id',
          'given_character_id_2',
          'given_character_id_3',
        ],
      } as any) as any;

      assertSpyCalls(indexStub, 3);

      assertSpyCall(indexStub, 0, {
        args: ['characters_instance_id'],
      });

      assertSpyCalls(matchStub, 3);

      assertSpyCall(matchStub, 0, {
        args: [
          'characters_instance_id' as any,
          'given_character_id',
          {
            ref: 'instance',
          },
        ],
      });
      assertSpyCalls(equalsStub, 3);

      assertSpyCall(equalsStub, 0, {
        args: [{
          ref: 'user',
        }, {
          ref: 'user',
        }],
        returned: true,
      });

      assertSpyCalls(removeAllStub, 1);

      assertSpyCall(removeAllStub, 0, {
        args: [
          [{
            ref: 'character',
          }, {
            ref: 'character2',
          }, {
            ref: 'character3',
          }] as any,
          ['user_characters', { ref: 'character' }] as any,
        ] as any,
        returned: ['user_characters'] as any,
      });

      assertSpyCalls(appendAllStub, 1);

      assertSpyCall(appendAllStub, 0, {
        args: [
          [{
            ref: 'character',
          }, {
            ref: 'character2',
          }, {
            ref: 'character3',
          }] as any,
          ['target_characters'] as any,
        ],
        returned: [
          { ref: 'character' },
          { ref: 'character2' },
          { ref: 'character3' },
          'target_characters',
        ] as any,
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
          {
            characters: [
              { ref: 'character' },
              { ref: 'character2' },
              { ref: 'character3' },
              'target_characters',
            ],
          },
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

      assertSpyCall(updateStub, 3, {
        args: [
          { ref: 'character2' } as any,
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

      assertSpyCall(updateStub, 4, {
        args: [
          { ref: 'character3' } as any,
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
      allStub.restore();
      mapStub.restore();
      foreachStub.restore();
      matchStub.restore();
      indexStub.restore();
      selectStub.restore();
      appendStub.restore();
      appendAllStub.restore();
      removeAllStub.restore();
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
    const mapStub = FakeMap();
    const allStub = FakeAll();
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
        instance: 'instance',
        inventory: 'inventory',
        targetInventory: 'target_inventory',
        charactersIds: ['given_character_id'],
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
      mapStub.restore();
      allStub.restore();
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
    const mapStub = FakeMap();
    const allStub = FakeAll();
    const equalsStub = FakeEquals();
    const isNotEmptyStub = FakeIsNonEmpty();

    const indexStub = FakeIndex();

    const matchStub = FakeMatch();

    const varStub = FakeVar();

    try {
      const response = giveCharacters({
        user: 'user',
        target: 'target',
        inventory: 'inventory',
        instance: 'instance',
        targetInventory: 'target_inventory',
        charactersIds: ['given_character_id'],
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
      mapStub.restore();
      allStub.restore();
      matchStub.restore();
      indexStub.restore();
      equalsStub.restore();
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
    const mapStub = FakeMap();
    const allStub = FakeAll();
    const foreachStub = FakeForeach();
    const appendStub = FakeAppend();
    const appendAllStub = FakeAppendAll();
    const removeAllStub = FakeRemoveAll();
    const equalsStub = FakeEquals();
    const updateStub = FakeUpdate();
    const isNotEmptyStub = FakeIsNonEmpty();

    const indexStub = FakeIndex();

    const matchStub = stub(
      fql,
      'Match',
      returnsNext([
        { id: 'given_character' },
        { id: 'given_character' },
        { id: 'given_character' },
        { id: 'taken_character' },
        { id: 'taken_character' },
        { id: 'taken_character' },
      ]) as any,
    );

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        { ref: 'user' },
        { ref: 'user' },
        { ref: 'user' },
        { ref: 'target' },
        { ref: 'target' },
        { ref: 'target' },
        ['user_characters', { ref: 'given_character' }],
        ['target_characters', { ref: 'taken_character' }],
        ['given_character_history'],
        ['given_character_history'],
        ['given_character_history'],
        ['taken_character_history'],
        ['taken_character_history'],
        ['taken_character_history'],
      ]) as any,
    );

    const varStub = FakeVar({
      'giveCharactersRefs': [
        {
          ref: 'given_character',
        },
        {
          ref: 'given_character2',
        },
        {
          ref: 'given_character3',
        },
      ],
      'takeCharactersRefs': [
        {
          ref: 'taken_character',
        },
        {
          ref: 'taken_character2',
        },
        {
          ref: 'taken_character3',
        },
      ],
    });

    try {
      const response = tradeCharacters({
        user: 'user',
        target: 'target',
        instance: 'instance',
        inventory: 'inventory',
        targetInventory: 'target_inventory',
        giveCharactersIds: [
          'given_character_id',
          'given_character_id_1',
          'given_character_id_2',
        ],
        takeCharactersIds: [
          'taken_character_id',
          'taken_character_id_2',
          'taken_character_id_3',
        ],
      } as any) as any;

      assertSpyCalls(indexStub, 6);

      assertSpyCall(indexStub, 0, {
        args: ['characters_instance_id'],
      });

      assertSpyCall(indexStub, 5, {
        args: ['characters_instance_id'],
      });

      assertSpyCalls(matchStub, 6);

      assertSpyCall(matchStub, 0, {
        args: [
          'characters_instance_id' as any,
          'given_character_id',
          {
            ref: 'instance',
          },
        ],
      });

      assertSpyCall(matchStub, 5, {
        args: [
          'characters_instance_id' as any,
          'taken_character_id_3',
          {
            ref: 'instance',
          },
        ],
      });

      assertSpyCalls(equalsStub, 6);

      assertSpyCall(equalsStub, 0, {
        args: [{
          ref: 'user',
        }, {
          ref: 'user',
        }],
        returned: true,
      });

      assertSpyCall(equalsStub, 5, {
        args: [{
          ref: 'target',
        }, {
          ref: 'target',
        }],
        returned: true,
      });

      assertSpyCalls(removeAllStub, 2);

      assertSpyCall(removeAllStub, 0, {
        args: [
          [
            { ref: 'given_character' },
            { ref: 'given_character2' },
            { ref: 'given_character3' },
          ] as any,
          ['user_characters', { ref: 'given_character' }] as any,
        ] as any,
        returned: ['user_characters'] as any,
      });

      assertSpyCall(removeAllStub, 1, {
        args: [
          [
            { ref: 'taken_character' },
            { ref: 'taken_character2' },
            { ref: 'taken_character3' },
          ] as any,
          ['target_characters', { ref: 'taken_character' }] as any,
        ] as any,
        returned: ['target_characters'] as any,
      });

      assertSpyCalls(appendAllStub, 2);

      assertSpyCall(appendAllStub, 0, {
        args: [
          ['user_characters'] as any,
          [
            { ref: 'taken_character' },
            { ref: 'taken_character2' },
            { ref: 'taken_character3' },
          ] as any,
        ],
        returned: [
          'user_characters',
          {
            ref: 'taken_character',
          },
          {
            ref: 'taken_character2',
          },
          {
            ref: 'taken_character3',
          },
        ] as any,
      });

      assertSpyCall(appendAllStub, 1, {
        args: [
          ['target_characters'] as any,
          [
            { ref: 'given_character' },
            { ref: 'given_character2' },
            { ref: 'given_character3' },
          ] as any,
        ],
        returned: [
          'target_characters',
          {
            ref: 'given_character',
          },
          {
            ref: 'given_character2',
          },
          {
            ref: 'given_character3',
          },
        ] as any,
      });

      assertSpyCall(updateStub, 0, {
        args: [
          { ref: 'inventory' } as any,
          {
            characters: [
              'user_characters',
              {
                ref: 'taken_character',
              },
              {
                ref: 'taken_character2',
              },
              {
                ref: 'taken_character3',
              },
            ],
          },
        ],
      });

      assertSpyCall(updateStub, 1, {
        args: [
          { ref: 'target_inventory' } as any,
          {
            characters: [
              'target_characters',
              {
                ref: 'given_character',
              },
              {
                ref: 'given_character2',
              },
              {
                ref: 'given_character3',
              },
            ],
          },
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
          { ref: 'given_character2' } as any,
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

      assertSpyCall(updateStub, 4, {
        args: [
          { ref: 'given_character3' } as any,
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

      assertSpyCall(updateStub, 5, {
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

      assertSpyCall(updateStub, 6, {
        args: [
          { ref: 'taken_character2' } as any,
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

      assertSpyCall(updateStub, 7, {
        args: [
          { ref: 'taken_character3' } as any,
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
      mapStub.restore();
      allStub.restore();
      foreachStub.restore();
      appendStub.restore();
      appendAllStub.restore();
      removeAllStub.restore();
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
    const mapStub = FakeMap();
    const allStub = FakeAll();
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
        giveCharactersIds: ['given_character_id'],
        takeCharactersIds: ['taken_character_id'],
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
      mapStub.restore();
      allStub.restore();
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
    const mapStub = FakeMap();
    const allStub = FakeAll();
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
        giveCharactersIds: ['given_character_id'],
        takeCharactersIds: ['taken_character_id'],
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
      mapStub.restore();
      allStub.restore();
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
    const mapStub = FakeMap();
    const allStub = FakeAll();
    const equalsStub = FakeEquals();
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
        giveCharactersIds: ['given_character_id'],
        takeCharactersIds: ['taken_character_id'],
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
      mapStub.restore();
      allStub.restore();
      matchStub.restore();
      indexStub.restore();
      selectStub.restore();
      equalsStub.restore();
      isNotEmptyStub.restore();
    }
  });

  await test.step('not found (take)', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const getStub = FakeGet();
    const refStub = FakeRef();
    const andStub = FakeAnd();
    const mapStub = FakeMap();
    const allStub = FakeAll();
    const equalsStub = FakeEquals();
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
        giveCharactersIds: ['given_character_id'],
        takeCharactersIds: ['taken_character_id'],
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
      mapStub.restore();
      allStub.restore();
      matchStub.restore();
      indexStub.restore();
      selectStub.restore();
      equalsStub.restore();
      isNotEmptyStub.restore();
    }
  });
});

Deno.test('model', async (test) => {
  const client = FakeClient();

  Model(client as any).resolvers?.forEach((q) => q());

  assertSpyCalls(client.query, 3);

  await assertSnapshot(test, client.query.calls[0].args);
  await assertSnapshot(test, client.query.calls[1].args);
  await assertSnapshot(test, client.query.calls[2].args);
});
