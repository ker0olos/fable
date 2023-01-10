import {
  assertEquals,
  assertRejects,
  assertThrows,
} from 'https://deno.land/std@0.168.0/testing/asserts.ts';

import {
  assertSpyCalls,
  returnsNext,
  stub,
} from 'https://deno.land/std@0.168.0/testing/mock.ts';

import utils from '../src/utils.ts';
import gacha from '../src/gacha.ts';

import Rating from '../src/rating.ts';

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
          characterRole: CharacterRole.Main,
          node: {
            popularity: 0,
          },
        }, {
          characterRole: CharacterRole.Main,
          node: {
            popularity: 50,
          },
        }, {
          characterRole: CharacterRole.Main,
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
        'failed to pull a character due to the pool not containing any characters that match the randomly chosen variables',
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
          characterRole: CharacterRole.Main,
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
        'failed to pull a character due to the pool not containing any characters that match the randomly chosen variables',
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
          characterRole: CharacterRole.Main,
          node: {
            popularity: 100,
          },
        }, {
          characterRole: CharacterRole.Supporting,
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
        'failed to pull a character due to the pool not containing any characters that match the randomly chosen variables',
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
        characterRole: CharacterRole.Main,
        node: {
          id: 1,
          popularity: 200,
        },
      }, {
        characterRole: CharacterRole.Main,
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

Deno.test('rating', async (test) => {
  await test.step('1 star', () => {
    let rating = new Rating(CharacterRole.Background, 1_000_000);

    assertEquals(rating.stars, 1);
    assertEquals(
      rating.emotes,
      '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
    );

    rating = new Rating(CharacterRole.Main, 0);

    assertEquals(rating.stars, 1);
    assertEquals(
      rating.emotes,
      '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
    );
  });

  await test.step('2 stars', () => {
    const rating = new Rating(CharacterRole.Supporting, 199_999);

    assertEquals(rating.stars, 2);
    assertEquals(
      rating.emotes,
      '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
    );
  });

  await test.step('3 stars', () => {
    let rating = new Rating(CharacterRole.Main, 199_999);

    assertEquals(rating.stars, 3);
    assertEquals(
      rating.emotes,
      '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466>',
    );

    rating = new Rating(CharacterRole.Supporting, 250_000);

    assertEquals(rating.stars, 3);
    assertEquals(
      rating.emotes,
      '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466>',
    );
  });

  await test.step('4 stars', () => {
    let rating = new Rating(CharacterRole.Main, 250_000);

    assertEquals(rating.stars, 4);
    assertEquals(
      rating.emotes,
      '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466>',
    );

    rating = new Rating(CharacterRole.Supporting, 500_000);

    assertEquals(rating.stars, 4);
    assertEquals(
      rating.emotes,
      '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466>',
    );
  });

  await test.step('5 stars', () => {
    const rating = new Rating(CharacterRole.Main, 500_000);

    assertEquals(rating.stars, 5);
    assertEquals(
      rating.emotes,
      '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098>',
    );
  });

  await test.step('fails', () => {
    assertThrows(
      // deno-lint-ignore no-explicit-any
      () => new Rating(CharacterRole.Main, undefined as any),
      Error,
      'Couldn\'t determine the star rating',
    );
  });
});
