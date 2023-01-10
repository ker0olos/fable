import {
  assertEquals,
  assertRejects,
} from 'https://deno.land/std@0.168.0/testing/asserts.ts';

import {
  assertSpyCalls,
  stub,
} from 'https://deno.land/std@0.168.0/testing/mock.ts';

import anilist from '../packs/anilist/index.ts';

import { Status } from '../packs/anilist/types.ts';

import { Character, CharacterRole } from '../src/types.ts';

Deno.test('media', async (test) => {
  await test.step('normal search', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                media: [{
                  id: 1,
                }],
              },
            },
          })),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      const media = await anilist.media({ search: 'query' });

      assertEquals(media!.id, 1);
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('prioritize search', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                media: [{
                  id: 1,
                  type: 'ANIME',
                }, {
                  id: 2,
                  type: 'MANGA',
                }],
              },
            },
          })),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      const media = await anilist.media({ search: 'query' }, 'manga');

      assertEquals(media!.id, 2);
      assertEquals(media!.type, 'MANGA');
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('not found', async () => {
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

    try {
      const media = await anilist.media({ search: 'query' });

      assertEquals(media, undefined);
    } finally {
      fetchStub.restore();
    }
  });
});

Deno.test('character', async (test) => {
  await test.step('normal search', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                characters: [{
                  id: 1,
                }],
              },
            },
          })),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      const character = await anilist.character({ search: 'query' });

      assertEquals(character!.id, 1);
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('not found', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                characters: [],
              },
            },
          })),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      const character = await anilist.character({ search: 'query' });

      assertEquals(character, undefined);
    } finally {
      fetchStub.restore();
    }
  });
});

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

Deno.test('pool', async (test) => {
  await test.step('valid', async () => {
    const fetchStub = fakePool({
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: {
            popularity: 1000,
          },
        }],
      },
    });

    try {
      const pool = await anilist.pool({
        popularity_greater: 0,
      });

      for (let i = 1; i <= 25; i++) {
        assertEquals(pool[i].id, i);
      }

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('valid', async () => {
    const fetchStub = fakePool({
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: {
            popularity: 1000,
          },
        }],
      },
    }, 24);

    try {
      await assertRejects(
        async () =>
          await anilist.pool({
            popularity_greater: 0,
          }),
        Error,
        'failed to create a pool with {"popularity_greater":0,"page":null,"current_pool":24,"minimal_pool":25}',
      );

      const maxTries = 5;

      assertSpyCalls(fetchStub, maxTries);
    } finally {
      fetchStub.restore();
    }
  });
});

Deno.test('next episode', async (test) => {
  await test.step('releasing', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Media: {
                status: Status.RELEASING,
                title: {
                  english: 'anime',
                },
                nextAiringEpisode: {
                  airingAt: 0,
                },
              },
            },
          })),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      const message = await anilist.nextEpisode({ title: 'title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [],
          components: [],
          content: 'The next episode of `anime` is <t:0:R>.',
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('not yet released', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Media: {
                status: Status.NOT_YET_RELEASED,
                title: {
                  english: 'anime',
                },
              },
            },
          })),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      const message = await anilist.nextEpisode({ title: 'title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [],
          components: [],
          content: '`anime` is coming soon.',
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('on hiatus', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Media: {
                status: Status.HIATUS,
                title: {
                  english: 'anime',
                },
              },
            },
          })),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      const message = await anilist.nextEpisode({ title: 'title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [],
          components: [],
          content: '`anime` is taking a short break.',
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('finished', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Media: {
                status: Status.FINISHED,
                title: {
                  english: 'anime',
                },
              },
            },
          })),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      const message = await anilist.nextEpisode({ title: 'title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [],
          components: [],
          content:
            'Unfortunately, `anime` has already aired its final episode.',
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('cancelled', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Media: {
                status: Status.CANCELLED,
                title: {
                  english: 'anime',
                },
              },
            },
          })),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      const message = await anilist.nextEpisode({ title: 'title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [],
          components: [],
          content:
            'Unfortunately, `anime` has already aired its final episode.',
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('not found', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Media: {},
            },
          })),
        // deno-lint-ignore no-explicit-any
      } as any),
    );

    try {
      await assertRejects(
        async () => await anilist.nextEpisode({ title: 'title' }),
        Error,
        '404',
      );

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
    }
  });
});
