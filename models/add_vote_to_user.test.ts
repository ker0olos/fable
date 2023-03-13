// deno-lint-ignore-file no-explicit-any

import { assertEquals } from 'https://deno.land/std@0.179.0/testing/asserts.ts';

import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from 'https://deno.land/std@0.179.0/testing/mock.ts';

import { assertSnapshot } from 'https://deno.land/std@0.179.0/testing/snapshot.ts';

import {
  FakeAdd,
  FakeClient,
  FakeEquals,
  FakeIf,
  FakeLet,
  FakeNow,
  FakeRef,
  FakeUpdate,
} from './fql.mock.ts';

import { fql } from './fql.ts';

import { addVote, default as Model } from './add_vote_to_user.ts';

Deno.test('voting', async (test) => {
  await test.step('normal', () => {
    const date = new Date();

    const letStub = FakeLet();
    const refStub = FakeRef();
    const ifStub = FakeIf();
    const equalsStub = FakeEquals();
    const addStub = FakeAdd();

    const nowStub = FakeNow(date);

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        5,
        1,
      ]) as any,
    );

    const updateStub = FakeUpdate();

    try {
      const result = addVote({ user: 'user' as any, weekend: false }) as any;

      assertSpyCall(ifStub, 0, {
        args: [false, 2, 1],
        returned: 1,
      });

      assertSpyCall(selectStub, 0, {
        args: [
          [
            'data',
            'totalVotes',
          ],
          'user' as any,
          0,
        ],
      });

      assertSpyCall(selectStub, 1, {
        args: [
          [
            'data',
            'availableVotes',
          ],
          'user' as any,
          0,
        ],
      });

      assertSpyCall(addStub, 0, {
        args: [5, 1],
      });

      assertSpyCall(addStub, 1, {
        args: [1, 1],
      });

      assertSpyCall(updateStub, 0, {
        args: [{ ref: 'user' } as any, {
          lastVote: date,
          totalVotes: 6,
          availableVotes: 2,
        }],
      });

      assertEquals(result, {
        ok: true,
      });
    } finally {
      letStub.restore();
      refStub.restore();
      ifStub.restore();
      equalsStub.restore();
      addStub.restore();
      nowStub.restore();
      selectStub.restore();
      updateStub.restore();
    }
  });

  await test.step('weekend', () => {
    const date = new Date();

    const letStub = FakeLet();
    const refStub = FakeRef();
    const ifStub = FakeIf();
    const equalsStub = FakeEquals();
    const addStub = FakeAdd();

    const nowStub = FakeNow(date);

    const selectStub = stub(
      fql,
      'Select',
      returnsNext([
        5,
        1,
      ]) as any,
    );

    const updateStub = FakeUpdate();

    try {
      const result = addVote({ user: 'user' as any, weekend: true }) as any;

      assertSpyCall(ifStub, 0, {
        args: [true, 2, 1],
        returned: 2,
      });

      assertSpyCall(selectStub, 0, {
        args: [
          [
            'data',
            'totalVotes',
          ],
          'user' as any,
          0,
        ],
      });

      assertSpyCall(selectStub, 1, {
        args: [
          [
            'data',
            'availableVotes',
          ],
          'user' as any,
          0,
        ],
      });

      assertSpyCall(addStub, 0, {
        args: [5, 1],
      });

      assertSpyCall(addStub, 1, {
        args: [1, 2],
      });

      assertSpyCall(updateStub, 0, {
        args: [{ ref: 'user' } as any, {
          lastVote: date,
          totalVotes: 6,
          availableVotes: 3,
        }],
      });

      assertEquals(result, {
        ok: true,
      });
    } finally {
      letStub.restore();
      refStub.restore();
      ifStub.restore();
      equalsStub.restore();
      addStub.restore();
      nowStub.restore();
      selectStub.restore();
      updateStub.restore();
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
