// deno-lint-ignore-file no-explicit-any

import { assertEquals } from '$std/testing/asserts.ts';

import { assertSpyCallArg, assertSpyCalls, stub } from '$std/testing/mock.ts';

import * as anilist from '../packs/anilist/index.ts';
import utils from '../src/utils.ts';

Deno.test('media', async (test) => {
  await test.step('normal search', async () => {
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
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
      utils,
      'fetchWithRetry',
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
      utils,
      'fetchWithRetry',
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
      utils,
      'fetchWithRetry',
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
