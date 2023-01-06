import {
  assertEquals,
  assertRejects,
} from 'https://deno.land/std@0.168.0/testing/asserts.ts';

import {
  assertSpyCalls,
  returnsNext,
  stub,
} from 'https://deno.land/std@0.168.0/testing/mock.ts';

import utils from '../src/utils.ts';
import gacha from '../src/gacha.ts';

import { Character, CharacterRole } from '../src/types.ts';

function fakePool(fill: Character, length = 25) {
  const nodes: Character[] = [];

  for (let index = 0; index < length; index++) {
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

Deno.test('filter invalid pools', async (test) => {
  await test.step('filter higher popularity', async () => {
    const fetchStub = fakePool({
      media: {
        edges: [{
          characterRole: CharacterRole.MAIN,
          node: {
            popularity: 0,
          },
        }, {
          characterRole: CharacterRole.MAIN,
          node: {
            popularity: 50,
          },
        }, {
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

  await test.step('filter lesser popularity ', async () => {
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

  await test.step('filter roles', async () => {
    const fetchStub = fakePool({
      media: {
        edges: [{
          characterRole: CharacterRole.MAIN,
          node: {
            popularity: 100,
          },
        }, {
          characterRole: CharacterRole.SUPPORTING,
          node: {
            popularity: 150,
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

Deno.test('valid pool', async () => {
  const fetchStub = fakePool({
    media: {
      edges: [{
        characterRole: CharacterRole.MAIN,
        node: {
          id: 1,
          popularity: 200,
        },
      }, {
        characterRole: CharacterRole.MAIN,
        node: {
          id: 2,
          popularity: 200,
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
    const pull = await gacha.rngPull();

    assertEquals(pull.pool, 24);

    assertEquals(pull.character.id, 1);
    assertEquals(pull.media.id, 1);

    assertEquals(pull.media.popularity, 200);

    assertEquals(pull.role, 'MAIN');
    assertEquals(pull.popularityGreater, 100);
    assertEquals(pull.popularityLesser, 200);

    assertSpyCalls(fetchStub, 1);
    assertSpyCalls(rngStub, 2);
  } finally {
    rngStub.restore();
    randomStub.restore();
    fetchStub.restore();
  }
});
