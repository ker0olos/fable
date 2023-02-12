// deno-lint-ignore-file no-explicit-any

import {
  assertSpyCall,
  assertSpyCallArg,
  assertSpyCalls,
} from 'https://deno.land/std@0.177.0/testing/mock.ts';

import { assertEquals } from 'https://deno.land/std@0.177.0/testing/asserts.ts';

import { assertSnapshot } from 'https://deno.land/std@0.177.0/testing/snapshot.ts';

import {
  FakeClient,
  FakeGet,
  FakeIf,
  FakeIndex,
  FakeIsNonEmpty,
  FakeLet,
  FakeMatch,
  FakeRef,
} from './fql.mock.ts';

import { default as Model, findCharacter } from './find_character.ts';

Deno.test('find character', async (test) => {
  await test.step('find', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const refStub = FakeRef();
    const getStub = FakeGet();
    const indexStub = FakeIndex();
    const isNonEmptyStub = FakeIsNonEmpty();

    const matchStub = FakeMatch({
      match: true,
    });

    try {
      const match = findCharacter({
        characterId: 'character_id',
        instance: 'instance' as any,
      }) as any;

      assertSpyCall(indexStub, 0, {
        args: ['characters_instance_id'],
      });

      assertSpyCall(matchStub, 0, {
        args: [
          'characters_instance_id' as any,
          'character_id',
          { ref: 'instance' },
        ],
      });

      assertSpyCallArg(ifStub, 0, 0, true);

      assertEquals(match, {
        '0': 'character_id',
        '1': {
          ref: 'instance',
        },
        match: true,
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      refStub.restore();
      getStub.restore();
      indexStub.restore();
      isNonEmptyStub.restore();
      matchStub.restore();
    }
  });

  await test.step('null', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const refStub = FakeRef();
    const getStub = FakeGet();
    const indexStub = FakeIndex();
    const isNonEmptyStub = FakeIsNonEmpty();

    const matchStub = FakeMatch();

    try {
      const match = findCharacter({
        characterId: 'character_id',
        instance: 'instance' as any,
      }) as any;

      assertSpyCall(indexStub, 0, {
        args: ['characters_instance_id'],
      });

      assertSpyCall(matchStub, 0, {
        args: [
          'characters_instance_id' as any,
          'character_id',
          { ref: 'instance' },
        ],
      });

      assertSpyCallArg(ifStub, 0, 0, false);

      assertEquals(match, null);
    } finally {
      ifStub.restore();
      letStub.restore();
      refStub.restore();
      getStub.restore();
      indexStub.restore();
      isNonEmptyStub.restore();
      matchStub.restore();
    }
  });
});

Deno.test('model', async (test) => {
  const client = FakeClient();

  Model(client as any).forEach((q) => q());

  assertSpyCalls(client.query, 2);

  await assertSnapshot(test, client.query.calls[0].args);
  await assertSnapshot(test, client.query.calls[1].args);
});
