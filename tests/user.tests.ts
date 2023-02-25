import { assertEquals } from 'https://deno.land/std@0.177.0/testing/asserts.ts';

import {
  assertSpyCallArg,
  assertSpyCalls,
  stub,
} from 'https://deno.land/std@0.177.0/testing/mock.ts';

import * as user from '../src/user.ts';

Deno.test('find character', async () => {
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => ({
      ok: true,
      text: (() =>
        Promise.resolve(JSON.stringify({
          data: {
            findCharacter: {
              rating: 1,
              mediaId: 'media_id',
              user: {
                id: 'user_id',
              },
            },
          },
        }))),
      // deno-lint-ignore no-explicit-any
    } as any),
  );

  try {
    const characters = await user.findCharacter({
      characterId: 'character_id',
      guildId: 'guild_id',
    });

    assertSpyCalls(fetchStub, 1);

    assertSpyCallArg(
      fetchStub,
      0,
      0,
      'https://graphql.us.fauna.com/graphql',
    );

    assertEquals(characters, {
      rating: 1,
      mediaId: 'media_id',
      userId: 'user_id',
    });
  } finally {
    fetchStub.restore();
  }
});

Deno.test('all characters', async () => {
  const fetchStub = stub(
    globalThis,
    'fetch',
    () => ({
      ok: true,
      text: (() =>
        Promise.resolve(JSON.stringify({
          data: {
            getUserInventory: {
              characters: ['1', '2'],
            },
          },
        }))),
      // deno-lint-ignore no-explicit-any
    } as any),
  );

  try {
    const characters = await user.allCharacters({
      guildId: 'guild_id',
      userId: 'user_id',
    });

    assertSpyCalls(fetchStub, 1);

    assertSpyCallArg(
      fetchStub,
      0,
      0,
      'https://graphql.us.fauna.com/graphql',
    );

    // deno-lint-ignore no-explicit-any
    assertEquals(characters, ['1', '2'] as any);
  } finally {
    fetchStub.restore();
  }
});
