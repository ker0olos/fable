// import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";

import {
  assertSpyCalls,
  returnsNext,
  stub,
} from 'https://deno.land/std@0.168.0/testing/mock.ts';

import utils from '../src/utils.ts';
import gacha from '../src/gacha.ts';

import { Character, CharacterRole } from '../src/types.ts';

import {
  assertRejects,
  unimplemented,
} from 'https://deno.land/std@0.168.0/testing/asserts.ts';

function fakePool(fill: Character) {
  const nodes: Character[] = [];

  for (let index = 0; index < 25; index++) {
    nodes.push({
      id: index + 1,
      ...fill,
    });
  }

  return stub(
    globalThis,
    'fetch',
    () => ({
      ok: true,
      json: (() =>
        Promise.resolve({
          data: {
            Page: {
              media: [{
                characters: {
                  nodes,
                },
              }],
            },
          },
        })),
      // deno-lint-ignore no-explicit-any
    } as any),
  );
}

Deno.test('invalid pools', async (test) => {
  await test.step('higher popularity pool', async () => {
    const fetchStub = fakePool({
      media: {
        edges: [{
          characterRole: CharacterRole.MAIN,
          node: {
            popularity: 101,
          },
        }],
      },
    });

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([[0, 100]]),
    );

    const randomStub = stub(Math, 'random', () => 0);

    try {
      await assertRejects(
        async () => await gacha.rngPull(),
        Error,
        '501',
      );

      assertSpyCalls(fetchStub, 1);
      assertSpyCalls(rngStub, 1);
    } finally {
      rngStub.restore();
      randomStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('lesser popularity pool', async () => {
    const fetchStub = fakePool({
      media: {
        edges: [{
          characterRole: CharacterRole.MAIN,
          node: {
            popularity: 50,
          },
        }],
      },
    });

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([[100, 200], 'MAIN']),
    );

    const randomStub = stub(Math, 'random', () => 0);

    try {
      await assertRejects(
        async () => await gacha.rngPull(),
        Error,
        '501',
      );

      assertSpyCalls(fetchStub, 1);
      assertSpyCalls(rngStub, 2);
    } finally {
      rngStub.restore();
      randomStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('different role pool', async () => {
    const fetchStub = fakePool({
      media: {
        edges: [{
          characterRole: CharacterRole.SUPPORTING,
          node: {
            popularity: 100,
          },
        }],
      },
    });

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([[100, 200], 'MAIN']),
    );

    const randomStub = stub(Math, 'random', () => 0);

    try {
      await assertRejects(
        async () => await gacha.rngPull(),
        Error,
        '501',
      );

      assertSpyCalls(fetchStub, 1);
      assertSpyCalls(rngStub, 2);
    } finally {
      rngStub.restore();
      randomStub.restore();
      fetchStub.restore();
    }
  });
});

Deno.test('valid pool', () => {
  unimplemented();
});
