import {
  assertEquals,
  assertRejects,
  assertThrows,
} from 'https://deno.land/std@0.175.0/testing/asserts.ts';

import {
  assertSpyCalls,
  returnsNext,
  Stub,
  stub,
} from 'https://deno.land/std@0.175.0/testing/mock.ts';

import utils from '../src/utils.ts';
import gacha from '../src/gacha.ts';
import packs from '../src/packs.ts';

import Rating from '../src/rating.ts';

import {
  CharacterRole,
  DisaggregatedCharacter,
  Manifest,
  MediaFormat,
  MediaType,
} from '../src/types.ts';

import { AniListCharacter } from '../packs/anilist/types.ts';

function fakePool(
  fill: AniListCharacter | DisaggregatedCharacter,
  variables: { range: number[]; role?: CharacterRole },
  length = 1,
): {
  readJsonStub: Stub;
  fetchStub: Stub;
} {
  const nodes: (AniListCharacter | DisaggregatedCharacter)[] = [];

  const prefix = fill.id || '';

  for (let index = 0; index < length; index++) {
    nodes.push(
      Object.assign(
        {},
        (fill.id = `${prefix}${index + 1}`, fill),
      ),
    );
  }

  const readJsonStub = stub(utils, 'readJson', () => {
    return Promise.resolve({
      [JSON.stringify(variables.range)]: {
        [variables.role || 'ALL']: nodes.map((node) => ({ id: node.id })),
      },
    });
  });

  const fetchStub = stub(
    globalThis,
    'fetch',
    () => ({
      ok: true,
      json: (() =>
        Promise.resolve({
          data: {
            Page: {
              characters: nodes,
            },
          },
        })),
      // deno-lint-ignore no-explicit-any
    } as any),
  );

  return { readJsonStub, fetchStub };
}

Deno.test('filter invalid pools', async (test) => {
  await test.step('no media', async () => {
    const variables = {
      range: [2000, 3000],
      role: CharacterRole.Main,
    };

    const { readJsonStub, fetchStub } = fakePool(
      {
        id: 'anilist:',
        name: {
          full: 'name',
        },
        popularity: 2500,
        media: {
          edges: [],
        },
      },
      variables,
      25,
    );

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([variables.range, variables.role]),
    );

    const randomStub = stub(Math, 'random', () => 0);

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      await assertRejects(
        async () => await gacha.rngPull(),
        Error,
        'failed to pull a character due to the pool not containing any characters that match the randomly chosen variables',
      );

      assertSpyCalls(fetchStub, 25);
      assertSpyCalls(rngStub, 2);
    } finally {
      rngStub.restore();
      randomStub.restore();
      readJsonStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('filter higher popularity media', async () => {
    const variables = {
      range: [1000, 2000],
    };

    const { readJsonStub, fetchStub } = fakePool(
      {
        id: 'anilist:',
        name: {
          full: 'name',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: {
              id: 'anime',
              type: MediaType.Anime,
              format: MediaFormat.TV,
              popularity: 2001,
              title: {
                english: 'title',
              },
            },
          }],
        },
      },
      variables,
      25,
    );

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([variables.range]),
    );

    const randomStub = stub(Math, 'random', () => 0);

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      await assertRejects(
        async () => await gacha.rngPull(),
        Error,
        'failed to pull a character due to the pool not containing any characters that match the randomly chosen variables',
      );

      assertSpyCalls(fetchStub, 25);
      assertSpyCalls(rngStub, 1);
    } finally {
      rngStub.restore();
      randomStub.restore();
      readJsonStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('filter higher popularity character', async () => {
    const variables = {
      range: [1000, 2000],
    };

    const { readJsonStub, fetchStub } = fakePool(
      {
        id: 'anilist:',
        name: {
          full: 'name',
        },
        popularity: 2001,
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: {
              id: 'anime',
              popularity: 1000,
              type: MediaType.Anime,
              format: MediaFormat.TV,
              title: {
                english: 'title',
              },
            },
          }],
        },
      },
      variables,
      25,
    );

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([variables.range]),
    );

    const randomStub = stub(Math, 'random', () => 0);

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      await assertRejects(
        async () => await gacha.rngPull(),
        Error,
        'failed to pull a character due to the pool not containing any characters that match the randomly chosen variables',
      );

      assertSpyCalls(fetchStub, 25);
      assertSpyCalls(rngStub, 1);
    } finally {
      rngStub.restore();
      randomStub.restore();
      readJsonStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('filter lesser popularity media', async () => {
    const variables = {
      range: [2000, 3000],
      role: CharacterRole.Main,
    };

    const { readJsonStub, fetchStub } = fakePool(
      {
        id: 'anilist:',
        name: {
          full: 'name',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: {
              id: 'anime',
              type: MediaType.Anime,
              format: MediaFormat.TV,
              popularity: 1999,
              title: {
                english: 'title',
              },
            },
          }],
        },
      },
      variables,
      25,
    );

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([variables.range, variables.role]),
    );

    const randomStub = stub(Math, 'random', () => 0);

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      await assertRejects(
        async () => await gacha.rngPull(),
        Error,
        'failed to pull a character due to the pool not containing any characters that match the randomly chosen variables',
      );

      assertSpyCalls(fetchStub, 25);
      assertSpyCalls(rngStub, 2);
    } finally {
      rngStub.restore();
      randomStub.restore();
      readJsonStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('filter lesser popularity character', async () => {
    const variables = {
      range: [2000, 3000],
      role: CharacterRole.Main,
    };

    const { readJsonStub, fetchStub } = fakePool(
      {
        id: 'anilist:',
        name: {
          full: 'name',
        },
        popularity: 1999,
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: {
              id: 'anime',
              popularity: 2500,
              type: MediaType.Anime,
              format: MediaFormat.TV,
              title: {
                english: 'title',
              },
            },
          }],
        },
      },
      variables,
      25,
    );

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([variables.range, variables.role]),
    );

    const randomStub = stub(Math, 'random', () => 0);

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      await assertRejects(
        async () => await gacha.rngPull(),
        Error,
        'failed to pull a character due to the pool not containing any characters that match the randomly chosen variables',
      );

      assertSpyCalls(fetchStub, 25);
      assertSpyCalls(rngStub, 2);
    } finally {
      rngStub.restore();
      randomStub.restore();
      readJsonStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('filter roles anilist', async () => {
    const variables = {
      range: [2000, 3000],
      role: CharacterRole.Main,
    };

    const { readJsonStub, fetchStub } = fakePool(
      {
        id: 'anilist:',
        name: {
          full: 'name',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Supporting,
            node: {
              id: 'anime',
              popularity: 2500,
              type: MediaType.Anime,
              format: MediaFormat.TV,
              title: {
                english: 'title',
              },
            },
          }],
        },
      },
      variables,
      25,
    );

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([variables.range, variables.role]),
    );

    const randomStub = stub(Math, 'random', () => 0);

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      await assertRejects(
        async () => await gacha.rngPull(),
        Error,
        'failed to pull a character due to the pool not containing any characters that match the randomly chosen variables',
      );

      assertSpyCalls(fetchStub, 25);
      assertSpyCalls(rngStub, 2);
    } finally {
      rngStub.restore();
      randomStub.restore();
      readJsonStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('filter roles packs', async () => {
    const variables = {
      range: [2000, 3000],
      role: CharacterRole.Main,
    };

    // deno-lint-ignore no-explicit-any
    const { fetchStub, readJsonStub } = fakePool({} as any, variables, 0);

    const manifest: Manifest = {
      id: 'pack-id',
      characters: {
        new: [{
          id: '1',
          name: {
            english: 'name',
          },
          media: [{
            role: CharacterRole.Supporting,
            mediaId: '2',
          }],
        }],
      },
      media: {
        new: [{
          id: '2',
          popularity: 2500,
          type: MediaType.Anime,
          format: MediaFormat.TV,
          title: {
            english: 'title',
          },
        }],
      },
    };

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([variables.range, variables.role]),
    );

    const randomStub = stub(Math, 'random', () => 0);

    const listStub = stub(
      packs,
      'list',
      () => [manifest],
    );

    try {
      await assertRejects(
        async () => await gacha.rngPull(),
        Error,
        'failed to pull a character due to the pool not containing any characters that match the randomly chosen variables',
      );

      assertSpyCalls(fetchStub, 0);
      assertSpyCalls(rngStub, 2);
    } finally {
      rngStub.restore();
      randomStub.restore();
      readJsonStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });
});

Deno.test('disabled', async (test) => {
  await test.step('media', async () => {
    const variables = {
      range: [2000, 3000],
      role: CharacterRole.Main,
    };

    const manifest: Manifest = {
      id: 'pack-id',
      media: {
        conflicts: ['anilist:anime'],
      },
    };

    const { readJsonStub, fetchStub } = fakePool(
      {
        id: 'anilist:',
        name: {
          full: 'name',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: {
              id: 'anime',
              packId: 'anilist',
              popularity: 2500,
              type: MediaType.Anime,
              format: MediaFormat.TV,
              title: {
                english: 'title',
              },
            },
          }],
        },
      },
      variables,
      25,
    );

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([variables.range, variables.role]),
    );

    const randomStub = stub(Math, 'random', () => 0);

    const listStub = stub(
      packs,
      'list',
      () => [manifest],
    );

    try {
      await assertRejects(
        async () => await gacha.rngPull(),
        Error,
        'failed to pull a character due to the pool not containing any characters that match the randomly chosen variables',
      );

      assertSpyCalls(fetchStub, 25);
      assertSpyCalls(rngStub, 2);
    } finally {
      rngStub.restore();
      randomStub.restore();
      readJsonStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('character', async () => {
    const variables = {
      range: [2000, 3000],
      role: CharacterRole.Main,
    };

    const manifest: Manifest = {
      id: 'pack-id',
      media: {
        conflicts: ['anilist:1'],
      },
    };

    const { readJsonStub, fetchStub } = fakePool(
      {
        id: 'anilist:',
        name: {
          full: 'name',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: {
              id: 'anime',
              popularity: 75,
              type: MediaType.Anime,
              format: MediaFormat.TV,
              title: {
                english: 'title',
              },
            },
          }],
        },
      },
      variables,
      1,
    );

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([variables.range, variables.role]),
    );

    const randomStub = stub(Math, 'random', () => 0);

    const listStub = stub(
      packs,
      'list',
      () => [manifest],
    );

    try {
      await assertRejects(
        async () => await gacha.rngPull(),
        Error,
        'failed to pull a character due to the pool not containing any characters that match the randomly chosen variables',
      );

      assertSpyCalls(fetchStub, 0);
      assertSpyCalls(rngStub, 2);
    } finally {
      rngStub.restore();
      randomStub.restore();
      readJsonStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });
});

Deno.test('valid pool', async (test) => {
  await test.step('normal', async () => {
    const variables = {
      range: [2000, 3000],
      role: CharacterRole.Main,
    };

    const { readJsonStub, fetchStub } = fakePool(
      {
        id: 'anilist:',
        name: {
          full: 'name',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: {
              id: 'anime',
              popularity: 2500,
              type: MediaType.Anime,
              format: MediaFormat.TV,
              title: {
                english: 'title',
              },
            },
          }],
        },
      },
      variables,
      25,
    );

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([variables.range, variables.role]),
    );

    const randomStub = stub(Math, 'random', () => 0);

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      assertEquals(await gacha.rngPull(), {
        character: {
          id: 'anilist:1',
          media: {
            edges: [
              {
                node: {
                  format: MediaFormat.TV,
                  id: 'anime',
                  packId: 'anilist',
                  popularity: 2500,
                  title: {
                    english: 'title',
                  },
                  type: MediaType.Anime,
                },
                role: CharacterRole.Main,
              },
            ],
          },
          name: {
            english: 'name',
          },
          packId: 'anilist',
        },
        media: {
          format: MediaFormat.TV,
          id: 'anime',
          packId: 'anilist',
          popularity: 2500,
          title: {
            english: 'title',
          },
          type: MediaType.Anime,
        },
        pool: 24,
        popularityGreater: 2000,
        popularityLesser: 3000,
        rating: new Rating({ role: CharacterRole.Main, popularity: 75 }),
        role: CharacterRole.Main,
      });

      assertSpyCalls(fetchStub, 1);
      assertSpyCalls(rngStub, 2);
    } finally {
      rngStub.restore();
      randomStub.restore();
      readJsonStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('exact popularity', async () => {
    const variables = {
      range: [2000, 3000],
      role: CharacterRole.Main,
    };

    const { readJsonStub, fetchStub } = fakePool(
      {
        id: 'anilist:',
        name: {
          full: 'name',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: {
              id: 'anime',
              popularity: 2000,
              type: MediaType.Anime,
              format: MediaFormat.TV,
              title: {
                english: 'title',
              },
            },
          }],
        },
      },
      variables,
      25,
    );

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([variables.range, variables.role]),
    );

    const randomStub = stub(Math, 'random', () => 0);

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      assertEquals(await gacha.rngPull(), {
        character: {
          id: 'anilist:1',
          media: {
            edges: [
              {
                node: {
                  format: MediaFormat.TV,
                  id: 'anime',
                  packId: 'anilist',
                  popularity: 2000,
                  title: {
                    english: 'title',
                  },
                  type: MediaType.Anime,
                },
                role: CharacterRole.Main,
              },
            ],
          },
          name: {
            english: 'name',
          },
          packId: 'anilist',
        },
        media: {
          format: MediaFormat.TV,
          id: 'anime',
          packId: 'anilist',
          popularity: 2000,
          title: {
            english: 'title',
          },
          type: MediaType.Anime,
        },
        pool: 24,
        popularityGreater: 2000,
        popularityLesser: 3000,
        rating: new Rating({ role: CharacterRole.Main, popularity: 100 }),
        role: CharacterRole.Main,
      });

      assertSpyCalls(fetchStub, 1);
      assertSpyCalls(rngStub, 2);
    } finally {
      rngStub.restore();
      randomStub.restore();
      readJsonStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('character popularity first', async () => {
    const variables = {
      range: [100_000, 500_000],
      role: CharacterRole.Main,
    };

    const { readJsonStub, fetchStub } = fakePool(
      {
        id: 'anilist:',
        name: {
          full: 'name',
        },
        popularity: 500_000,
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: {
              id: 'anime',
              popularity: 100,
              type: MediaType.Anime,
              format: MediaFormat.TV,
              title: {
                english: 'title',
              },
            },
          }],
        },
      },
      variables,
      25,
    );

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([variables.range, variables.role]),
    );

    const randomStub = stub(Math, 'random', () => 0);

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      assertEquals(await gacha.rngPull(), {
        character: {
          id: 'anilist:1',
          media: {
            edges: [
              {
                node: {
                  format: MediaFormat.TV,
                  id: 'anime',
                  packId: 'anilist',
                  popularity: 100,
                  title: {
                    english: 'title',
                  },
                  type: MediaType.Anime,
                },
                role: CharacterRole.Main,
              },
            ],
          },
          name: {
            english: 'name',
          },
          packId: 'anilist',
          popularity: 500_000,
        },
        media: {
          format: MediaFormat.TV,
          id: 'anime',
          packId: 'anilist',
          popularity: 100,
          title: {
            english: 'title',
          },
          type: MediaType.Anime,
        },
        pool: 24,
        popularityGreater: 100_000,
        popularityLesser: 500_000,
        rating: new Rating({ role: CharacterRole.Main, popularity: 500_000 }),
        role: CharacterRole.Main,
      });

      assertSpyCalls(fetchStub, 1);
      assertSpyCalls(rngStub, 2);
    } finally {
      rngStub.restore();
      randomStub.restore();
      readJsonStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('from pack', async () => {
    const variables = {
      range: [2000, 3000],
      role: CharacterRole.Main,
    };

    // deno-lint-ignore no-explicit-any
    const { fetchStub, readJsonStub } = fakePool({} as any, variables, 0);

    const manifest: Manifest = {
      id: 'pack-id',
      characters: {
        new: [{
          id: '1',
          name: {
            english: 'name',
          },
          media: [{
            role: CharacterRole.Main,
            mediaId: '2',
          }],
        }],
      },
      media: {
        new: [{
          id: '2',
          popularity: 2500,
          type: MediaType.Anime,
          format: MediaFormat.TV,
          title: {
            english: 'title',
          },
        }],
      },
    };

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([variables.range, variables.role]),
    );

    const randomStub = stub(Math, 'random', () => 0);

    const listStub = stub(
      packs,
      'list',
      () => [manifest],
    );

    try {
      assertEquals(await gacha.rngPull(), {
        character: {
          id: '1',
          media: {
            edges: [
              {
                node: {
                  format: MediaFormat.TV,
                  id: '2',
                  packId: 'pack-id',
                  popularity: 2500,
                  title: {
                    english: 'title',
                  },
                  type: MediaType.Anime,
                },
                role: CharacterRole.Main,
              },
            ],
          },
          name: {
            english: 'name',
          },
          packId: 'pack-id',
        },
        media: {
          format: MediaFormat.TV,
          id: '2',
          packId: 'pack-id',
          popularity: 2500,
          title: {
            english: 'title',
          },
          type: MediaType.Anime,
        },
        pool: 0,
        popularityGreater: 2000,
        popularityLesser: 3000,
        rating: new Rating({ role: CharacterRole.Main, popularity: 2500 }),
        role: CharacterRole.Main,
      });

      assertSpyCalls(fetchStub, 0);
      assertSpyCalls(rngStub, 2);
    } finally {
      rngStub.restore();
      randomStub.restore();
      readJsonStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });
});

Deno.test('variables', () => {
  assertEquals(gacha.lowest, 1000);

  assertEquals(gacha.variables.roles, {
    10: CharacterRole.Main,
    70: CharacterRole.Supporting,
    20: CharacterRole.Background,
  });

  assertEquals(gacha.variables.ranges, {
    65: [1000, 50_000],
    22: [50_000, 100_000],
    9: [100_000, 200_000],
    3: [200_000, 400_000],
    1: [400_000, NaN],
  });
});

Deno.test('rating', async (test) => {
  await test.step('1 star', () => {
    let rating = new Rating({
      role: CharacterRole.Background,
      popularity: 1000000,
    });

    assertEquals(rating.stars, 1);
    assertEquals(
      rating.emotes,
      '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
    );

    rating = new Rating({ role: CharacterRole.Main, popularity: 0 });

    assertEquals(rating.stars, 1);
    assertEquals(
      rating.emotes,
      '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
    );

    rating = new Rating({ popularity: 0 });

    assertEquals(rating.stars, 1);
    assertEquals(
      rating.emotes,
      '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
    );
  });

  await test.step('2 stars', () => {
    let rating = new Rating({
      role: CharacterRole.Supporting,
      popularity: 199999,
    });

    assertEquals(rating.stars, 2);
    assertEquals(
      rating.emotes,
      '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
    );

    rating = new Rating({
      popularity: 199999,
    });

    assertEquals(rating.stars, 2);
    assertEquals(
      rating.emotes,
      '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
    );
  });

  await test.step('3 stars', () => {
    let rating = new Rating({ role: CharacterRole.Main, popularity: 199999 });

    assertEquals(rating.stars, 3);
    assertEquals(
      rating.emotes,
      '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466>',
    );

    rating = new Rating({ role: CharacterRole.Supporting, popularity: 250000 });

    assertEquals(rating.stars, 3);
    assertEquals(
      rating.emotes,
      '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466>',
    );

    rating = new Rating({ popularity: 250000 });

    assertEquals(rating.stars, 3);
    assertEquals(
      rating.emotes,
      '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466>',
    );
  });

  await test.step('4 stars', () => {
    let rating = new Rating({ role: CharacterRole.Main, popularity: 250000 });

    assertEquals(rating.stars, 4);
    assertEquals(
      rating.emotes,
      '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466>',
    );

    rating = new Rating({ role: CharacterRole.Supporting, popularity: 500000 });

    assertEquals(rating.stars, 4);
    assertEquals(
      rating.emotes,
      '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466>',
    );

    rating = new Rating({ popularity: 500000 });

    assertEquals(rating.stars, 4);
    assertEquals(
      rating.emotes,
      '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466>',
    );
  });

  await test.step('5 stars', () => {
    let rating = new Rating({ role: CharacterRole.Main, popularity: 500000 });

    assertEquals(rating.stars, 5);
    assertEquals(
      rating.emotes,
      '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098>',
    );

    rating = new Rating({ popularity: 1000000 });

    assertEquals(rating.stars, 5);
    assertEquals(
      rating.emotes,
      '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098>',
    );
  });

  await test.step('fails', () => {
    assertThrows(
      () =>
        // deno-lint-ignore no-explicit-any
        new Rating({ role: CharacterRole.Main, popularity: undefined as any }),
      Error,
      'Couldn\'t determine the star rating',
    );

    assertThrows(
      // deno-lint-ignore no-explicit-any
      () => new Rating({ popularity: undefined as any }),
      Error,
      'Couldn\'t determine the star rating',
    );
  });
});
