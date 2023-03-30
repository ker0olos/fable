// deno-lint-ignore-file no-explicit-any

import {
  assertSpyCall,
  assertSpyCallArg,
  assertSpyCalls,
} from 'https://deno.land/std@0.179.0/testing/mock.ts';

import { assertEquals } from 'https://deno.land/std@0.179.0/testing/asserts.ts';

import { assertSnapshot } from 'https://deno.land/std@0.179.0/testing/snapshot.ts';

import {
  FakeClient,
  FakeGet,
  FakeId,
  FakeIf,
  FakeIndex,
  FakeIsNonEmpty,
  FakeIsNull,
  FakeLet,
  FakeMatch,
  FakePaginate,
  FakeRef,
  FakeReverse,
  FakeSelect,
  FakeVar,
} from './fql.mock.ts';

import { default as Model, findCharacter, findMedia } from './find_media.ts';
import { fql } from './fql.ts';

Deno.test('find media', async (test) => {
  await test.step('no before, no after', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const getStub = FakeGet();
    const refStub = FakeRef();
    const isNonEmptyStub = FakeIsNonEmpty();
    const isNullStub = FakeIsNull();
    const indexStub = FakeIndex();
    const matchStub = FakeMatch();

    const selectStub = FakeSelect({ select: true });

    const varStub = FakeVar({
      'characters': ['0', '1'],
    });

    try {
      const match = findMedia({
        instance: 'instance' as any,
        mediaId: 'media_id',
      }) as any;

      assertSpyCall(matchStub, 0, {
        args: [
          'media_instance_id' as any,
          'media_id',
          {
            ref: 'instance',
          },
        ],
      });

      assertSpyCallArg(ifStub, 0, 0, true);
      assertSpyCallArg(ifStub, 1, 0, true);
      assertSpyCallArg(ifStub, 2, 0, true);

      assertSpyCall(selectStub, 4, {
        args: [
          ['id'],
          {
            ref: '0',
          } as any,
          fql.Null(),
        ],
      });

      assertEquals(match, {
        anchor: {
          select: true,
        },
        character: {
          ref: '0',
        },
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      getStub.restore();
      varStub.restore();
      refStub.restore();
      isNonEmptyStub.restore();
      isNullStub.restore();
      indexStub.restore();
      matchStub.restore();
      selectStub.restore();
    }
  });

  await test.step('before', () => {
    const ifStub = FakeIf();
    const fakeId = FakeId();
    const letStub = FakeLet();
    const getStub = FakeGet();
    const refStub = FakeRef();
    const isNonEmptyStub = FakeIsNonEmpty();
    const isNullStub = FakeIsNull();
    const indexStub = FakeIndex();
    const matchStub = FakeMatch();

    const reverseStub = FakeReverse();
    const paginateStub = FakePaginate();

    const selectStub = FakeSelect({});

    const varStub = FakeVar({
      'characters': ['0', '1'],
    });

    try {
      const match = findMedia({
        instance: 'instance' as any,
        mediaId: 'media_id',
        before: '1',
      }) as any;

      assertSpyCall(matchStub, 0, {
        args: [
          'media_instance_id' as any,
          'media_id',
          {
            ref: 'instance',
          },
        ],
      });

      assertSpyCallArg(ifStub, 0, 0, true);
      assertSpyCallArg(ifStub, 1, 0, false);
      assertSpyCallArg(ifStub, 2, 0, true);

      assertSpyCall(paginateStub, 1, {
        args: [
          ['0', '1'] as any,
          {
            before: [
              {},
              '1',
              '1',
            ],
            size: 1,
          } as any,
        ],
        returned: ['0'] as any,
      });

      assertSpyCall(selectStub, 1, {
        args: [
          ['data', 'rating'],
          '1' as any,
        ],
      });

      assertSpyCall(selectStub, 3, {
        args: [
          ['data', 0, 1],
          [
            '0',
          ] as any,
          { ref: '1' } as any,
        ],
      });

      assertEquals(match, {
        anchor: {},
        character: {},
      });
    } finally {
      ifStub.restore();
      fakeId.restore();
      letStub.restore();
      getStub.restore();
      varStub.restore();
      refStub.restore();
      isNonEmptyStub.restore();
      isNullStub.restore();
      indexStub.restore();
      matchStub.restore();
      reverseStub.restore();
      paginateStub.restore();
      selectStub.restore();
    }
  });

  await test.step('after', () => {
    const ifStub = FakeIf();
    const fakeId = FakeId();
    const letStub = FakeLet();
    const getStub = FakeGet();
    const refStub = FakeRef();
    const isNonEmptyStub = FakeIsNonEmpty();
    const isNullStub = FakeIsNull();
    const indexStub = FakeIndex();
    const matchStub = FakeMatch();

    const reverseStub = FakeReverse();
    const paginateStub = FakePaginate();

    const selectStub = FakeSelect({});

    const varStub = FakeVar({
      'characters': ['0', '1'],
    });

    try {
      const match = findMedia({
        instance: 'instance' as any,
        mediaId: 'media_id',
        after: '0',
      }) as any;

      assertSpyCall(matchStub, 0, {
        args: [
          'media_instance_id' as any,
          'media_id',
          {
            ref: 'instance',
          },
        ],
      });

      assertSpyCallArg(ifStub, 0, 0, false);
      assertSpyCallArg(ifStub, 1, 0, true);
      assertSpyCallArg(ifStub, 2, 0, true);

      assertSpyCall(paginateStub, 0, {
        args: [
          ['0', '1'] as any,
          {
            after: [
              {},
              '0',
              '0',
            ],
            size: 2,
          } as any,
        ],
        returned: ['0', '1'] as any,
      });

      assertSpyCall(selectStub, 0, {
        args: [
          ['data', 'rating'],
          '0' as any,
        ],
      });

      assertSpyCall(selectStub, 2, {
        args: [
          ['data', 1, 1],
          [
            '0',
            '1',
          ] as any,
          { ref: '0' } as any,
        ],
      });

      assertEquals(match, {
        anchor: {},
        character: {},
      });
    } finally {
      ifStub.restore();
      fakeId.restore();
      letStub.restore();
      getStub.restore();
      varStub.restore();
      refStub.restore();
      isNonEmptyStub.restore();
      isNullStub.restore();
      indexStub.restore();
      matchStub.restore();
      reverseStub.restore();
      paginateStub.restore();
      selectStub.restore();
    }
  });

  await test.step('empty', () => {
    const ifStub = FakeIf();
    const letStub = FakeLet();
    const getStub = FakeGet();
    const refStub = FakeRef();
    const isNonEmptyStub = FakeIsNonEmpty();
    const isNullStub = FakeIsNull();
    const indexStub = FakeIndex();
    const matchStub = FakeMatch();

    const selectStub = FakeSelect();

    const varStub = FakeVar({
      'characters': [],
    });

    try {
      const match = findMedia({
        instance: 'instance' as any,
        mediaId: 'media_id',
      }) as any;

      assertSpyCall(matchStub, 0, {
        args: [
          'media_instance_id' as any,
          'media_id',
          {
            ref: 'instance',
          },
        ],
      });

      assertSpyCallArg(ifStub, 0, 0, true);
      assertSpyCallArg(ifStub, 1, 0, true);
      assertSpyCallArg(ifStub, 2, 0, false);

      assertEquals(match, {
        anchor: fql.Null(),
        character: fql.Null(),
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      getStub.restore();
      varStub.restore();
      refStub.restore();
      isNonEmptyStub.restore();
      isNullStub.restore();
      indexStub.restore();
      matchStub.restore();
      selectStub.restore();
    }
  });
});

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

  Model(client as any).indexers?.forEach((q) => q());
  Model(client as any).resolvers?.forEach((q) => q());

  assertSpyCalls(client.query, 4);

  await assertSnapshot(test, client.query.calls[0].args);
  await assertSnapshot(test, client.query.calls[1].args);
  await assertSnapshot(test, client.query.calls[2].args);
  await assertSnapshot(test, client.query.calls[3].args);
});
