// deno-lint-ignore-file no-explicit-any

import {
  assertSpyCall,
  assertSpyCallArg,
  assertSpyCalls,
  returnsNext,
  stub,
} from 'https://deno.land/std@0.179.0/testing/mock.ts';

import { assertEquals } from 'https://deno.land/std@0.179.0/testing/asserts.ts';

import { assertSnapshot } from 'https://deno.land/std@0.179.0/testing/snapshot.ts';

import {
  FakeClient,
  FakeConcat,
  FakeEquals,
  FakeGet,
  FakeIf,
  FakeIndex,
  FakeIsNonEmpty,
  FakeIsNull,
  FakeLet,
  FakeMatch,
  FakeMerge,
  FakeRef,
  FakeSelect,
  FakeToString,
  FakeUpdate,
  FakeVar,
} from './fql.mock.ts';

import {
  default as Model,
  removeCharacterFromParty,
  setCharacterToParty,
  swapCharactersInParty,
} from './set_character_to_party.ts';

import { fql } from './fql.ts';

Deno.test('set character to party', async (test) => {
  // TODO improve the test case for this

  await test.step('ok', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const getStub = FakeGet();
    const refStub = FakeRef();
    const matchStub = FakeMatch();
    const indexStub = FakeIndex();
    const mergeStub = FakeMerge();
    const equalsStub = FakeEquals();
    const updateStub = FakeUpdate();
    const isNotEmptyStub = FakeIsNonEmpty();
    const isNullStub = FakeIsNull();

    const selectStub = FakeSelect({
      ref: 'user',
    });

    const varStub = FakeVar({
      'spot': 1,
      'character': {
        ref: 'user',
      },
    });

    try {
      const response = setCharacterToParty({
        characterId: 'character_id',
        mediaId: 'media_id',
        inventory: 'inventory',
        instance: 'instance',
        user: 'user',
        spot: 1,
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

      assertSpyCall(equalsStub, 0, {
        args: [{
          ref: 'user',
        }, {
          ref: 'user',
        }],
        returned: true,
      });

      assertSpyCall(mergeStub, 0, {
        args: [
          {
            member1: {
              ref: 'user',
            },
            member2: {
              ref: 'user',
            },
            member3: {
              ref: 'user',
            },
            member4: {
              ref: 'user',
            },
            member5: {
              ref: 'user',
            },
          },
          {
            member1: {
              ref: '_match',
            },
          },
        ],
      });

      assertSpyCall(updateStub, 0, {
        args: [
          { ref: 'inventory' } as any,
          {
            party: 'member5',
          },
        ],
      });

      assertEquals(response, {
        ok: true,
        character: {
          ref: '_match',
        },
        inventory: {
          ref: {
            ref: 'inventory',
          },
        },
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      getStub.restore();
      varStub.restore();
      refStub.restore();
      matchStub.restore();
      indexStub.restore();
      mergeStub.restore();
      selectStub.restore();
      equalsStub.restore();
      updateStub.restore();
      isNotEmptyStub.restore();
      isNullStub.restore();
    }
  });

  await test.step('character not owned', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const getStub = FakeGet();
    const refStub = FakeRef();
    const matchStub = FakeMatch();
    const indexStub = FakeIndex();
    const equalsStub = FakeEquals();
    const isNotEmptyStub = FakeIsNonEmpty();
    const isNullStub = FakeIsNull();

    const selectStub = FakeSelect({
      ref: 'user2',
    });

    const varStub = FakeVar({
      'spot': 1,
      'character': {
        ref: 'user',
      },
    });

    try {
      const response = setCharacterToParty({
        characterId: 'character_id',
        mediaId: 'media_id',
        inventory: 'inventory',
        instance: 'instance',
        user: 'user',
        spot: 1,
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

      assertSpyCall(equalsStub, 0, {
        args: [{
          ref: 'user2',
        }, {
          ref: 'user',
        }],
        returned: false,
      });

      assertEquals(response, {
        ok: false,
        error: 'CHARACTER_NOT_OWNED',
        character: {
          ref: '_match',
        },
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
      isNullStub.restore();
    }
  });

  await test.step('character not found', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const getStub = FakeGet();
    const refStub = FakeRef();
    const matchStub = FakeMatch();
    const indexStub = FakeIndex();
    const equalsStub = FakeEquals();
    const isNotEmptyStub = FakeIsNonEmpty();
    const isNullStub = FakeIsNull();

    const varStub = FakeVar({
      '_match': null,
    });

    try {
      const response = setCharacterToParty({
        characterId: 'character_id',
        mediaId: 'media_id',
        inventory: 'inventory',
        instance: 'instance',
        user: 'user',
        member: 1,
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

      assertSpyCall(isNullStub, 0, {
        args: [null as any],
        returned: true,
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
      equalsStub.restore();
      isNotEmptyStub.restore();
      isNullStub.restore();
    }
  });
});

Deno.test('swap characters in party', async (test) => {
  await test.step('ok', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const refStub = FakeRef();
    const concatStub = FakeConcat();
    const toStringStub = FakeToString();

    const equalsStub = FakeEquals();
    const updateStub = FakeUpdate();

    const selectStub = FakeSelect();

    const varStub = FakeVar();

    try {
      const response = swapCharactersInParty({
        mediaId: 'media_id',
        inventory: 'inventory',
        a: 1,
        b: 2,
      } as any) as any;

      assertSpyCallArg(ifStub, 0, 0, false);
      assertSpyCallArg(ifStub, 1, 0, true);

      assertSpyCallArg(ifStub, 2, 0, true);
      assertSpyCallArg(ifStub, 3, 0, false);

      assertSpyCallArg(ifStub, 4, 0, false);
      assertSpyCallArg(ifStub, 5, 0, false);

      assertSpyCallArg(ifStub, 6, 0, false);
      assertSpyCallArg(ifStub, 7, 0, false);

      assertSpyCallArg(ifStub, 8, 0, false);
      assertSpyCallArg(ifStub, 9, 0, false);

      assertSpyCall(concatStub, 0, {
        args: [
          ['member', '2'],
        ],
        returned: 'member2',
      });

      assertSpyCall(concatStub, 1, {
        args: [
          ['member', '1'],
        ],
        returned: 'member1',
      });

      assertSpyCall(updateStub, 0, {
        args: [
          { ref: 'inventory' } as any,
          {
            party: 'party',
          },
        ],
      });

      assertEquals(response, {
        ok: true,
        inventory: {
          ref: {
            ref: 'inventory',
          },
        },
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      varStub.restore();
      refStub.restore();
      concatStub.restore();
      toStringStub.restore();
      selectStub.restore();
      equalsStub.restore();
      updateStub.restore();
    }
  });
});

Deno.test('remove character from party', async (test) => {
  await test.step('ok', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const refStub = FakeRef();
    const concatStub = FakeConcat();
    const toStringStub = FakeToString();

    const equalsStub = FakeEquals();
    const updateStub = FakeUpdate();

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        'member1',
        'member2',
        'member3',
        'member4',
        'member5',
        'member1',
      ] as any),
    );

    const varStub = FakeVar({
      'character': {
        ref: 'character',
      },
    });

    try {
      const response = removeCharacterFromParty({
        mediaId: 'media_id',
        inventory: 'inventory',
        spot: 1,
      } as any) as any;

      assertSpyCallArg(ifStub, 0, 0, true);
      assertSpyCallArg(ifStub, 1, 0, false);
      assertSpyCallArg(ifStub, 2, 0, false);
      assertSpyCallArg(ifStub, 3, 0, false);
      assertSpyCallArg(ifStub, 4, 0, false);

      assertSpyCall(concatStub, 0, {
        args: [
          ['member', '1'],
        ],
        returned: 'member1',
      });

      assertSpyCall(updateStub, 0, {
        args: [
          { ref: 'inventory' } as any,
          {
            party: 'party',
          },
        ],
      });

      assertEquals(response, {
        ok: true,
        character: 'member1',
        inventory: {
          ref: {
            ref: 'inventory',
          },
        },
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      varStub.restore();
      refStub.restore();
      concatStub.restore();
      toStringStub.restore();
      selectStub.restore();
      equalsStub.restore();
      updateStub.restore();
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
