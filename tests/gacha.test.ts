import {
  assertEquals,
  assertRejects,
  assertThrows,
} from 'https://deno.land/std@0.173.0/testing/asserts.ts';

import {
  assertSpyCalls,
  returnsNext,
  Stub,
  stub,
} from 'https://deno.land/std@0.173.0/testing/mock.ts';

import utils from '../src/utils.ts';
import gacha from '../src/gacha.ts';
import packs from '../src/packs.ts';

import Rating from '../src/rating.ts';

import {
  Character,
  CharacterRole,
  DisaggregatedCharacter,
  Manifest,
  MediaFormat,
  MediaType,
} from '../src/types.ts';

import { AniListCharacter } from '../packs/anilist/types.ts';

function fakePool<T = AniListCharacter>(
  fill: T,
  length = 25,
): T[] {
  const nodes: T[] = [];

  for (let index = 0; index < length; index++) {
    nodes.push(
      Object.assign(
        {},
        // deno-lint-ignore ban-ts-comment
        //@ts-ignore
        (fill.id = `${index + 1}`, fill),
      ),
    );
  }

  return nodes;
}

function fakePoolStub(
  fill: AniListCharacter | Character,
  length = 25,
): Stub {
  const nodes = fakePool(fill, length);

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
  await test.step('no media', async () => {
    const fetchStub = fakePoolStub({
      id: '1',
      name: {
        full: 'name',
      },
      popularity: 1_000_000,
      media: {
        edges: [],
      },
    });

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([[1_000_000, 1_000_000], 'MAIN']),
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

      assertSpyCalls(fetchStub, 1);
      assertSpyCalls(rngStub, 2);
    } finally {
      rngStub.restore();
      randomStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('filter higher popularity media', async () => {
    const fetchStub = fakePoolStub({
      id: '1',
      name: {
        full: 'name',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: {
            id: '101',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            popularity: 101,
            title: {
              english: 'title',
            },
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

      assertSpyCalls(fetchStub, 1);
      assertSpyCalls(rngStub, 1);
    } finally {
      rngStub.restore();
      randomStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('filter higher popularity character', async () => {
    const fetchStub = fakePoolStub({
      id: '1',
      name: {
        full: 'name',
      },
      popularity: 101,
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: {
            id: '0',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            popularity: 0,
            title: {
              english: 'title',
            },
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

      assertSpyCalls(fetchStub, 1);
      assertSpyCalls(rngStub, 1);
    } finally {
      rngStub.restore();
      randomStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('filter lesser popularity media', async () => {
    const fetchStub = fakePoolStub({
      id: '1',
      name: {
        full: 'name',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: {
            id: '50',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            popularity: 50,
            title: {
              english: 'title',
            },
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

      assertSpyCalls(fetchStub, 1);
      assertSpyCalls(rngStub, 2);
    } finally {
      rngStub.restore();
      randomStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('filter lesser popularity character', async () => {
    const fetchStub = fakePoolStub({
      id: '1',
      name: {
        full: 'name',
      },
      popularity: 50,
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: {
            id: '50',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            popularity: 150,
            title: {
              english: 'title',
            },
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

      assertSpyCalls(fetchStub, 1);
      assertSpyCalls(rngStub, 2);
    } finally {
      rngStub.restore();
      randomStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('filter roles media', async () => {
    const fetchStub = fakePoolStub({
      id: '1',
      name: {
        full: 'name',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Supporting,
          node: {
            id: '150',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            popularity: 150,
            title: {
              english: 'title',
            },
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

      assertSpyCalls(fetchStub, 1);
      assertSpyCalls(rngStub, 2);
    } finally {
      rngStub.restore();
      randomStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });
});

Deno.test('disabled', async (test) => {
  await test.step('anilist media', async () => {
    const fetchStub = fakePoolStub({
      id: '1',
      name: {
        full: 'name',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: {
            id: '100',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            popularity: 100,
            title: {
              english: 'title',
            },
          },
        }],
      },
    });

    const manifest: Manifest = {
      id: 'pack-id',
      media: {
        conflicts: ['anilist:100'],
      },
    };

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([[0, 100], 'MAIN']),
    );

    const randomStub = stub(Math, 'random', () => 0);

    const listStub = stub(
      packs,
      'list',
      () => [manifest],
    );

    try {
      await assertRejects(
        () => gacha.rngPull(),
        Error,
        'failed to pull a character due to the pool not containing any characters that match the randomly chosen variables',
      );

      assertSpyCalls(fetchStub, 1);
      assertSpyCalls(rngStub, 1);
    } finally {
      rngStub.restore();
      randomStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('anilist character', async () => {
    const fetchStub = fakePoolStub({
      id: '1',
      name: {
        full: 'name',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: {
            id: '100',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            popularity: 100,
            title: {
              english: 'title',
            },
          },
        }],
      },
    });

    const manifest: Manifest = {
      id: 'pack-id',
      characters: {
        conflicts: Array(25).fill({}).map((_, i) => `anilist:${i + 1}`),
      },
    };

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([[0, 100], 'MAIN']),
    );

    const randomStub = stub(Math, 'random', () => 0);

    const listStub = stub(
      packs,
      'list',
      () => [manifest],
    );

    try {
      await assertRejects(
        () => gacha.rngPull(),
        Error,
        'failed to pull a character due to the pool not containing any characters that match the randomly chosen variables',
      );

      assertSpyCalls(fetchStub, 1);
      assertSpyCalls(rngStub, 1);
    } finally {
      rngStub.restore();
      randomStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('pack media', async () => {
    const pool = fakePool<DisaggregatedCharacter>({
      id: '1',
      name: {
        english: 'name',
      },
      media: [{
        role: CharacterRole.Main,
        mediaId: '100',
      }],
    });

    const manifest: Manifest = {
      id: 'pack-id',
      media: {
        new: [{
          id: '100',
          type: MediaType.Anime,
          format: MediaFormat.TV,
          title: {
            english: 'title',
          },
          popularity: 100,
        }],
      },
      characters: {
        new: pool,
      },
    };
    const manifest2: Manifest = {
      id: 'pack2',
      media: {
        conflicts: ['pack-id:100'],
      },
    };

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                media: [],
              },
            },
          })),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([[0, 100], 'MAIN']),
    );

    const randomStub = stub(Math, 'random', () => 0);

    const listStub = stub(
      packs,
      'list',
      () => [manifest, manifest2],
    );

    try {
      await assertRejects(
        () => gacha.rngPull(),
        Error,
        'failed to pull a character due to the pool not containing any characters that match the randomly chosen variables',
      );

      assertSpyCalls(fetchStub, 1);
      assertSpyCalls(rngStub, 1);
    } finally {
      rngStub.restore();
      randomStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('pack characters', async () => {
    const pool = fakePool<DisaggregatedCharacter>({
      id: '1',
      name: {
        english: 'name',
      },
      media: [{
        role: CharacterRole.Main,
        mediaId: '100',
      }],
    });

    const manifest: Manifest = {
      id: 'pack-id',
      media: {
        new: [{
          id: '100',
          type: MediaType.Anime,
          format: MediaFormat.TV,
          title: {
            english: 'title',
          },
          popularity: 100,
        }],
      },
      characters: {
        new: pool,
      },
    };
    const manifest2: Manifest = {
      id: 'pack2',
      characters: {
        conflicts: Array(25).fill({}).map((_, i) => `pack-id:${i + 1}`),
      },
    };

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                media: [],
              },
            },
          })),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([[0, 100], 'MAIN']),
    );

    const randomStub = stub(Math, 'random', () => 0);

    const listStub = stub(
      packs,
      'list',
      () => [manifest, manifest2],
    );

    try {
      await assertRejects(
        () => gacha.rngPull(),
        Error,
        'failed to pull a character due to the pool not containing any characters that match the randomly chosen variables',
      );

      assertSpyCalls(fetchStub, 1);
      assertSpyCalls(rngStub, 1);
    } finally {
      rngStub.restore();
      randomStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });
});

Deno.test('valid pool', async (test) => {
  await test.step('anilist', async () => {
    const fetchStub = fakePoolStub({
      id: '1',
      name: {
        full: 'name',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Supporting,
          node: {
            id: '2',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            popularity: 100,
            title: {
              english: 'title',
            },
          },
        }],
      },
    });

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([[0, 100], 'MAIN']),
    );

    const randomStub = stub(Math, 'random', () => 0);

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const pull = await gacha.rngPull();

      assertEquals(pull.pool, 24);

      assertEquals(pull.character.id, '1');
      assertEquals(pull.media.id, '2');

      assertEquals(pull.character.popularity, undefined);
      assertEquals(pull.media.popularity, 100);

      assertEquals(pull.role, undefined);
      assertEquals(pull.popularityGreater, 0);
      assertEquals(pull.popularityLesser, 100);

      assertEquals(pull.rating.stars, 1);

      assertSpyCalls(fetchStub, 1);
      assertSpyCalls(rngStub, 1);
    } finally {
      rngStub.restore();
      randomStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('anilist using character popularity', async () => {
    const fetchStub = fakePoolStub({
      id: '1',
      name: {
        full: 'name',
      },
      popularity: 100,
      media: {
        edges: [{
          characterRole: CharacterRole.Supporting,
          node: {
            id: '2',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            popularity: 1_000_000,
            title: {
              english: 'title',
            },
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

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const pull = await gacha.rngPull();

      assertEquals(pull.pool, 24);

      assertEquals(pull.character.id, '1');
      assertEquals(pull.media.id, '2');

      assertEquals(pull.character.popularity, 100);
      assertEquals(pull.media.popularity, 1_000_000);

      assertEquals(pull.role, 'MAIN');
      assertEquals(pull.popularityGreater, 100);
      assertEquals(pull.popularityLesser, 200);

      assertEquals(pull.rating.stars, 1);

      assertSpyCalls(fetchStub, 1);
      assertSpyCalls(rngStub, 2);
    } finally {
      rngStub.restore();
      randomStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('anilist using media popularity', async () => {
    const fetchStub = fakePoolStub({
      id: '1',
      name: {
        full: 'name',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Supporting,
          node: {
            id: '2',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            popularity: 1_000_000,
            title: {
              english: 'title',
            },
          },
        }],
      },
    });

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([[100, 1_000_000], 'SUPPORTING']),
    );

    const randomStub = stub(Math, 'random', () => 0);

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const pull = await gacha.rngPull();

      assertEquals(pull.pool, 24);

      assertEquals(pull.character.id, '1');
      assertEquals(pull.media.id, '2');

      assertEquals(pull.media.popularity, 1_000_000);

      assertEquals(pull.role, 'SUPPORTING');
      assertEquals(pull.popularityGreater, 100);
      assertEquals(pull.popularityLesser, 1_000_000);

      assertEquals(pull.rating.stars, 4);

      assertSpyCalls(fetchStub, 1);
      assertSpyCalls(rngStub, 2);
    } finally {
      rngStub.restore();
      randomStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('packs', async () => {
    const pool = fakePool<DisaggregatedCharacter>({
      id: '1',
      name: {
        english: 'name',
      },
      media: [{
        role: CharacterRole.Main,
        mediaId: '2',
      }],
    });

    const manifest: Manifest = {
      id: 'pack-id',
      media: {
        new: [{
          id: '2',
          type: MediaType.Anime,
          format: MediaFormat.TV,
          title: {
            english: 'title',
          },
          popularity: 100,
        }],
      },
      characters: {
        new: pool,
      },
    };

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                media: [],
              },
            },
          })),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([[0, 100], 'MAIN']),
    );

    const randomStub = stub(Math, 'random', () => 0);

    const listStub = stub(
      packs,
      'list',
      () => [manifest],
    );

    try {
      const pull = await gacha.rngPull();

      assertEquals(pull.pool, 24);

      assertEquals(pull.character.id, '1');
      assertEquals(pull.media.id, '2');

      assertEquals(pull.character.popularity, undefined);
      assertEquals(pull.media.popularity, 100);

      assertEquals(pull.role, undefined);
      assertEquals(pull.popularityGreater, 0);
      assertEquals(pull.popularityLesser, 100);

      assertEquals(pull.rating.stars, 1);

      assertSpyCalls(fetchStub, 1);
      assertSpyCalls(rngStub, 1);
    } finally {
      rngStub.restore();
      randomStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('packs using character popularity', async () => {
    const pool = fakePool<DisaggregatedCharacter>({
      id: '1',
      name: {
        english: 'name',
      },
      popularity: 100,
      media: [{
        role: CharacterRole.Main,
        mediaId: '2',
      }],
    });

    const manifest: Manifest = {
      id: 'pack-id',
      media: {
        new: [{
          id: '2',
          type: MediaType.Anime,
          format: MediaFormat.TV,
          popularity: 1_000_000,
          title: {
            english: 'title',
          },
        }],
      },
      characters: {
        new: pool,
      },
    };

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                media: [],
              },
            },
          })),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([[100, 200], 'MAIN']),
    );

    const randomStub = stub(Math, 'random', () => 0);

    const listStub = stub(
      packs,
      'list',
      () => [manifest],
    );

    try {
      const pull = await gacha.rngPull();

      assertEquals(pull.pool, 24);

      assertEquals(pull.character.id, '1');
      assertEquals(pull.media.id, '2');

      assertEquals(pull.character.popularity, 100);
      assertEquals(pull.media.popularity, 1_000_000);

      assertEquals(pull.role, 'MAIN');
      assertEquals(pull.popularityGreater, 100);
      assertEquals(pull.popularityLesser, 200);

      assertEquals(pull.rating.stars, 1);

      assertSpyCalls(fetchStub, 1);
      assertSpyCalls(rngStub, 2);
    } finally {
      rngStub.restore();
      randomStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('packs using media popularity', async () => {
    const pool = fakePool<DisaggregatedCharacter>({
      id: '1',
      name: {
        english: 'name',
      },
      media: [{
        role: CharacterRole.Supporting,
        mediaId: '2',
      }],
    });

    const manifest: Manifest = {
      id: 'pack-id',
      media: {
        new: [{
          id: '2',
          type: MediaType.Anime,
          format: MediaFormat.TV,
          popularity: 1_000_000,
          title: {
            english: 'title',
          },
        }],
      },
      characters: {
        new: pool,
      },
    };

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                media: [],
              },
            },
          })),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    const rngStub = stub(
      utils,
      'rng',
      returnsNext([[100, 1_000_000], 'SUPPORTING']),
    );

    const randomStub = stub(Math, 'random', () => 0);

    const listStub = stub(
      packs,
      'list',
      () => [manifest],
    );

    try {
      const pull = await gacha.rngPull();

      assertEquals(pull.pool, 24);

      assertEquals(pull.character.id, '1');
      assertEquals(pull.media.id, '2');

      assertEquals(pull.media.popularity, 1_000_000);

      assertEquals(pull.role, 'SUPPORTING');
      assertEquals(pull.popularityGreater, 100);
      assertEquals(pull.popularityLesser, 1_000_000);

      assertEquals(pull.rating.stars, 4);

      assertSpyCalls(fetchStub, 1);
      assertSpyCalls(rngStub, 2);
    } finally {
      rngStub.restore();
      randomStub.restore();
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
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
