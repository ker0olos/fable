// deno-lint-ignore-file no-explicit-any

import {
  assertSpyCall,
  assertSpyCalls,
} from 'https://deno.land/std@0.179.0/testing/mock.ts';

import { assertEquals } from 'https://deno.land/std@0.179.0/testing/asserts.ts';

import { assertSnapshot } from 'https://deno.land/std@0.179.0/testing/snapshot.ts';

import {
  FakeClient,
  FakeEquals,
  FakeGet,
  FakeIf,
  FakeIndex,
  FakeIsNonEmpty,
  FakeIsNull,
  FakeLet,
  FakeMatch,
  FakeRef,
  FakeSelect,
  FakeUpdate,
  FakeVar,
} from './fql.mock.ts';

import { customizeCharacter, default as Model } from './customize_character.ts';

Deno.test('customize character', async (test) => {
  await test.step('ok', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const getStub = FakeGet();
    const varStub = FakeVar();
    const refStub = FakeRef();
    const matchStub = FakeMatch();
    const indexStub = FakeIndex();
    const equalsStub = FakeEquals();
    const updateStub = FakeUpdate();
    const isNotEmptyStub = FakeIsNonEmpty();
    const isNullStub = FakeIsNull();

    const selectStub = FakeSelect({
      ref: 'user',
    });

    try {
      const response = customizeCharacter({
        image: 'image_url',
        nickname: 'nickname',
        characterId: 'character_id',
        inventory: 'inventory',
        instance: 'instance',
        user: 'user',
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

      assertSpyCall(updateStub, 0, {
        args: [
          { ref: '_match' } as any,
          {
            image: 'image_url',
            nickname: 'nickname',
          },
        ],
      });

      assertEquals(response, {
        ok: true,
        character: {
          ref: {
            ref: '_match',
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
      const response = customizeCharacter({
        image: 'image_url',
        nickname: 'nickname',
        characterId: 'character_id',
        inventory: 'inventory',
        instance: 'instance',
        user: 'user',
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
      const response = customizeCharacter({
        image: 'image_url',
        nickname: 'nickname',
        characterId: 'character_id',
        inventory: 'inventory',
        instance: 'instance',
        user: 'user',
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

Deno.test('model', async (test) => {
  const client = FakeClient();

  Model(client as any).resolvers?.forEach((q) => q());

  assertSpyCalls(client.query, 1);

  await assertSnapshot(test, client.query.calls[0].args);
});
