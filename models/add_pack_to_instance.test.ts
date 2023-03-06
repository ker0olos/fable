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
  FakeEquals,
  FakeGet,
  FakeIf,
  FakeIncludes,
  FakeIndex,
  FakeIsNonEmpty,
  FakeLet,
  FakeMatch,
  FakeNow,
  FakeRef,
  FakeUpdate,
  FakeVar,
} from './fql.mock.ts';

import { addPack, default as Model } from './add_pack_to_instance.ts';
import { fql } from './fql.ts';

Deno.test('add pack', async (test) => {
  await test.step('normal', () => {
    const date = new Date();

    const ifStub = FakeIf();
    const letStub = FakeLet();
    const refStub = FakeRef();
    const getStub = FakeGet();
    const nowStub = FakeNow(date);
    const equalsStub = FakeEquals();
    const indexStub = FakeIndex();
    const isNonEmptyStub = FakeIsNonEmpty();
    const includesStub = FakeIncludes();
    const appendStub = FakeAppend();

    const createStub = FakeCreate();
    const updateStub = FakeUpdate();

    const matchStub = FakeMatch({
      match: true,
    });

    const varStub = FakeVar({});

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        'manifest_id',
        'manifest_id',
        [],
        [],
        [],
        [],
        [],
        'manifest',
      ]) as any,
    );

    try {
      const match = addPack({
        user: 'user' as any,
        instance: 'instance' as any,
        manifest: 'manifest' as any,
        githubId: 123,
      }) as any;

      assertSpyCall(indexStub, 0, {
        args: ['pack_github_id'],
      });

      assertSpyCall(matchStub, 0, {
        args: [
          'pack_github_id' as any,
          123,
        ],
      });

      assertSpyCallArg(ifStub, 0, 0, true);
      assertSpyCallArg(ifStub, 1, 0, false);
      assertSpyCallArg(ifStub, 2, 0, false);
      assertSpyCallArg(ifStub, 3, 0, true);

      assertSpyCall(createStub, 0, {
        args: [
          'pack' as any,
          {
            id: 123,
            instances: [],
            installedBy: {
              ref: 'user',
            },
            firstInstall: date,
            lastInstall: date,
            manifest: 'manifest',
          },
        ],
      });

      assertSpyCall(appendStub, 0, {
        args: [
          { ref: 'match' } as any,
          [],
        ] as any,
        returned: [{ ref: 'match' } as any],
      });

      assertSpyCall(appendStub, 1, {
        args: [
          { ref: 'instance' } as any,
          [] as any,
        ],
        returned: [{ ref: 'instance' } as any],
      });

      assertSpyCall(updateStub, 0, {
        args: [
          { ref: 'instance' } as any,
          {
            packs: [{ ref: 'match' }],
          },
        ],
      });

      assertSpyCall(updateStub, 1, {
        args: [
          { ref: 'match' } as any,
          {
            manifest: 'manifest',
            instances: [{ ref: 'instance' }],
            lastInstall: date,
          },
        ],
      });

      assertEquals(match, {
        ok: true,
        manifest: 'manifest',
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      refStub.restore();
      getStub.restore();
      nowStub.restore();
      equalsStub.restore();
      indexStub.restore();
      isNonEmptyStub.restore();
      includesStub.restore();
      appendStub.restore();
      createStub.restore();
      updateStub.restore();
      varStub.restore();
      matchStub.restore();
      selectStub.restore();
    }
  });

  await test.step('exists', () => {
    const date = new Date();

    const ifStub = FakeIf();
    const letStub = FakeLet();
    const refStub = FakeRef();
    const getStub = FakeGet();
    const nowStub = FakeNow(date);
    const equalsStub = FakeEquals();
    const indexStub = FakeIndex();
    const isNonEmptyStub = FakeIsNonEmpty();
    const includesStub = FakeIncludes();
    const appendStub = FakeAppend();

    const createStub = FakeCreate();
    const updateStub = FakeUpdate();

    const matchStub = FakeMatch({
      match: true,
    });

    const varStub = FakeVar({});

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        'manifest_id',
        'manifest_id',
        [{ ref: 'match' }],
        [{ ref: 'match' }],
        [{ ref: 'instance' }],
        [{ ref: 'instance' }],
        [{ ref: 'instance' }],
        'manifest',
      ]) as any,
    );

    try {
      const match = addPack({
        user: 'user' as any,
        instance: 'instance' as any,
        manifest: 'manifest' as any,
        githubId: 123,
      }) as any;

      assertSpyCall(indexStub, 0, {
        args: ['pack_github_id'],
      });

      assertSpyCall(matchStub, 0, {
        args: [
          'pack_github_id' as any,
          123,
        ],
      });

      assertSpyCallArg(ifStub, 0, 0, true);
      assertSpyCallArg(ifStub, 1, 0, true);
      assertSpyCallArg(ifStub, 2, 0, true);
      assertSpyCallArg(ifStub, 3, 0, true);

      assertSpyCall(createStub, 0, {
        args: [
          'pack' as any,
          {
            id: 123,
            instances: [],
            installedBy: {
              ref: 'user',
            },
            firstInstall: date,
            lastInstall: date,
            manifest: 'manifest',
          },
        ],
      });

      assertSpyCall(updateStub, 1, {
        args: [
          { ref: 'match' } as any,
          {
            manifest: 'manifest',
            instances: [{ ref: 'instance' }],
            lastInstall: date,
          },
        ],
      });

      assertEquals(match, {
        ok: true,
        manifest: 'manifest',
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      refStub.restore();
      getStub.restore();
      nowStub.restore();
      equalsStub.restore();
      indexStub.restore();
      isNonEmptyStub.restore();
      includesStub.restore();
      appendStub.restore();
      createStub.restore();
      updateStub.restore();
      varStub.restore();
      matchStub.restore();
      selectStub.restore();
    }
  });

  await test.step('pack id changed', () => {
    const date = new Date();

    const ifStub = FakeIf();
    const letStub = FakeLet();
    const refStub = FakeRef();
    const getStub = FakeGet();
    const nowStub = FakeNow(date);
    const equalsStub = FakeEquals();
    const indexStub = FakeIndex();
    const isNonEmptyStub = FakeIsNonEmpty();
    const includesStub = FakeIncludes();
    const appendStub = FakeAppend();

    const createStub = FakeCreate();
    const updateStub = FakeUpdate();

    const matchStub = FakeMatch({
      match: true,
    });

    const varStub = FakeVar({});

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        'old_id',
        'new_id',
        [],
        [],
        [],
        [],
        [],
        'manifest',
      ]) as any,
    );

    try {
      const match = addPack({
        user: 'user' as any,
        instance: 'instance' as any,
        manifest: 'manifest' as any,
        githubId: 123,
      }) as any;

      assertSpyCall(indexStub, 0, {
        args: ['pack_github_id'],
      });

      assertSpyCall(matchStub, 0, {
        args: [
          'pack_github_id' as any,
          123,
        ],
      });

      assertSpyCallArg(ifStub, 0, 0, true);
      assertSpyCallArg(ifStub, 3, 0, false);

      assertEquals(match, {
        ok: false,
        error: 'PACK_ID_CHANGED',
        manifest: 'manifest',
      });
    } finally {
      ifStub.restore();
      letStub.restore();
      refStub.restore();
      getStub.restore();
      nowStub.restore();
      equalsStub.restore();
      indexStub.restore();
      isNonEmptyStub.restore();
      includesStub.restore();
      appendStub.restore();
      createStub.restore();
      updateStub.restore();
      varStub.restore();
      matchStub.restore();
      selectStub.restore();
    }
  });
});

Deno.test('model', async (test) => {
  const client = FakeClient();

  Model(client as any).indexers?.forEach((q) => q());
  Model(client as any).resolvers?.forEach((q) => q());

  assertSpyCalls(client.query, 3);

  await assertSnapshot(test, client.query.calls[0].args);
  await assertSnapshot(test, client.query.calls[1].args);
  await assertSnapshot(test, client.query.calls[2].args);
});
