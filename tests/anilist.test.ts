// deno-lint-ignore-file no-explicit-any

import {
  assertEquals,
  assertRejects,
} from 'https://deno.land/std@0.183.0/testing/asserts.ts';

import {
  assertSpyCallArg,
  assertSpyCalls,
  stub,
} from 'https://deno.land/std@0.183.0/testing/mock.ts';

import * as anilist from '../packs/anilist/index.ts';

import { Status } from '../packs/anilist/types.ts';

Deno.test('media', async (test) => {
  await test.step('normal search', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                media: [{
                  id: 1,
                }],
              },
            },
          }))),
      } as any),
    );

    try {
      const media = await anilist.media({ search: 'query' });

      assertEquals(media.length, 1);

      assertEquals(media[0].id, 1 as unknown as string);

      assertSpyCalls(fetchStub, 1);

      assertSpyCallArg(fetchStub, 0, 0, 'https://graphql.anilist.co');

      assertEquals(
        JSON.parse(fetchStub.calls[0].args[1]?.body as string).variables,
        {
          search: 'query',
        },
      );
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
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                media: [],
              },
            },
          }))),
      } as any),
    );

    try {
      const media = await anilist.media({ search: 'query' });

      assertEquals(media.length, 0);

      assertSpyCalls(fetchStub, 1);

      assertSpyCallArg(fetchStub, 0, 0, 'https://graphql.anilist.co');

      assertEquals(
        JSON.parse(fetchStub.calls[0].args[1]?.body as string).variables,
        {
          search: 'query',
        },
      );
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
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                characters: [{
                  id: 1,
                }],
              },
            },
          }))),
      } as any),
    );

    try {
      const characters = await anilist.characters({ search: 'query' });

      assertEquals(characters.length, 1);

      assertEquals(characters[0].id, 1 as unknown as string);

      assertSpyCalls(fetchStub, 1);

      assertSpyCallArg(fetchStub, 0, 0, 'https://graphql.anilist.co');

      assertEquals(
        JSON.parse(fetchStub.calls[0].args[1]?.body as string).variables,
        {
          search: 'query',
        },
      );
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
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                characters: [],
              },
            },
          }))),
      } as any),
    );

    try {
      const characters = await anilist.characters({ search: 'query' });

      assertEquals(characters.length, 0);

      assertSpyCalls(fetchStub, 1);

      assertSpyCallArg(fetchStub, 0, 0, 'https://graphql.anilist.co');

      assertEquals(
        JSON.parse(fetchStub.calls[0].args[1]?.body as string).variables,
        {
          search: 'query',
        },
      );
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
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Media: {
                status: Status.RELEASING,
                title: {
                  english: 'anime',
                },
                nextAiringEpisode: {
                  airingAt: 1,
                },
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await anilist.default.nextEpisode({ title: 'title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [],
          components: [],
          attachments: [],
          content: 'The next episode of `anime` is <t:1:R>.',
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('releasing with no date', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Media: {
                status: Status.RELEASING,
                title: {
                  english: 'anime',
                },
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await anilist.default.nextEpisode({ title: 'title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [],
          components: [],
          attachments: [],
          content:
            '`anime` is releasing new episodes but we can\'t figure out when the next episode will be.',
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
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Media: {
                status: Status.NOT_YET_RELEASED,
                title: {
                  english: 'anime',
                },
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await anilist.default.nextEpisode({ title: 'title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [],
          components: [],
          attachments: [],
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
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Media: {
                status: Status.HIATUS,
                title: {
                  english: 'anime',
                },
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await anilist.default.nextEpisode({ title: 'title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [],
          components: [],
          attachments: [],
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
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Media: {
                status: Status.FINISHED,
                title: {
                  english: 'anime',
                },
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await anilist.default.nextEpisode({ title: 'title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [],
          components: [],
          attachments: [],
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
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Media: {
                status: Status.CANCELLED,
                title: {
                  english: 'anime',
                },
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await anilist.default.nextEpisode({ title: 'title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [],
          components: [],
          attachments: [],
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
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Media: {},
            },
          }))),
      } as any),
    );

    try {
      await assertRejects(
        async () => await anilist.default.nextEpisode({ title: 'title' }),
        Error,
        '404',
      );

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
    }
  });
});
