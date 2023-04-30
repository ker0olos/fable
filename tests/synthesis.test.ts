// deno-lint-ignore-file no-explicit-any

import {
  assertEquals,
  assertThrows,
} from 'https://deno.land/std@0.183.0/testing/asserts.ts';

import {
  assertSpyCalls,
  returnsNext,
  stub,
} from 'https://deno.land/std@0.183.0/testing/mock.ts';

import { assertSnapshot } from 'https://deno.land/std@0.183.0/testing/snapshot.ts';

import { FakeTime } from 'https://deno.land/std@0.183.0/testing/time.ts';

import packs from '../src/packs.ts';
import config from '../src/config.ts';
import gacha from '../src/gacha.ts';

import Rating from '../src/rating.ts';

import synthesis from '../src/synthesis.ts';

import { CharacterRole, MediaFormat, MediaType, Schema } from '../src/types.ts';

import { AniListCharacter, AniListMedia } from '../packs/anilist/types.ts';

import { NonFetalError, PoolError } from '../src/errors.ts';

Deno.test('auto synthesize', async (test) => {
  await test.step('5 ones', async (test) => {
    const characters: Schema.Character[] = Array(25).fill({}).map((_, i) => ({
      rating: 1,
      id: `id:${i}`,
      mediaId: 'media_id',
      user: { id: 'user_id' },
    }));

    const sacrifices = synthesis.getSacrifices(characters, 2);

    assertEquals(sacrifices.filter(({ rating }) => rating === 1).length, 5);
    assertEquals(sacrifices.filter(({ rating }) => rating === 2).length, 0);
    assertEquals(sacrifices.filter(({ rating }) => rating === 3).length, 0);
    assertEquals(sacrifices.filter(({ rating }) => rating === 4).length, 0);
    assertEquals(sacrifices.filter(({ rating }) => rating === 5).length, 0);

    await assertSnapshot(test, sacrifices);
  });

  await test.step('25 ones', async (test) => {
    const characters: Schema.Character[] = Array(50).fill({}).map((_, i) => ({
      rating: 1,
      id: `id:${i}`,
      mediaId: 'media_id',
      user: { id: 'user_id' },
    }));

    const sacrifices = synthesis.getSacrifices(characters, 3);

    assertEquals(sacrifices.filter(({ rating }) => rating === 1).length, 25);
    assertEquals(sacrifices.filter(({ rating }) => rating === 2).length, 0);
    assertEquals(sacrifices.filter(({ rating }) => rating === 3).length, 0);
    assertEquals(sacrifices.filter(({ rating }) => rating === 4).length, 0);
    assertEquals(sacrifices.filter(({ rating }) => rating === 5).length, 0);

    await assertSnapshot(test, sacrifices);
  });

  await test.step('5 twos', async (test) => {
    const characters: Schema.Character[] = Array(25).fill({}).map((_, i) => ({
      rating: 2,
      id: `id:${i}`,
      mediaId: 'media_id',
      user: { id: 'user_id' },
    }));

    const sacrifices = synthesis.getSacrifices(characters, 3);

    assertEquals(sacrifices.filter(({ rating }) => rating === 1).length, 0);
    assertEquals(sacrifices.filter(({ rating }) => rating === 2).length, 5);
    assertEquals(sacrifices.filter(({ rating }) => rating === 3).length, 0);
    assertEquals(sacrifices.filter(({ rating }) => rating === 4).length, 0);
    assertEquals(sacrifices.filter(({ rating }) => rating === 5).length, 0);

    await assertSnapshot(test, sacrifices);
  });

  await test.step('20 ones + 1 two', async (test) => {
    const characters: Schema.Character[] = Array(20).fill({}).map((_, i) => ({
      rating: 1,
      id: `id:${i}`,
      mediaId: 'media_id',
      user: { id: 'user_id' },
    })).concat(
      [{
        rating: 2,
        id: `id:20`,
        mediaId: 'media_id',
        user: { id: 'user_id' },
      }],
    );

    const sacrifices = synthesis.getSacrifices(characters, 3);

    assertEquals(sacrifices.filter(({ rating }) => rating === 1).length, 20);
    assertEquals(sacrifices.filter(({ rating }) => rating === 2).length, 1);
    assertEquals(sacrifices.filter(({ rating }) => rating === 3).length, 0);
    assertEquals(sacrifices.filter(({ rating }) => rating === 4).length, 0);
    assertEquals(sacrifices.filter(({ rating }) => rating === 5).length, 0);

    await assertSnapshot(test, sacrifices);
  });

  await test.step('625 ones', async (test) => {
    const characters: Schema.Character[] = Array(625).fill({}).map((
      _,
      i,
    ) => ({
      rating: 1,
      id: `id:${i}`,
      mediaId: 'media_id',
      user: { id: 'user_id' },
    })).concat(
      [{
        rating: 4,
        id: `id:20`,
        mediaId: 'media_id',
        user: { id: 'user_id' },
      }],
    );

    const sacrifices = synthesis.getSacrifices(characters, 5);

    assertEquals(sacrifices.filter(({ rating }) => rating === 1).length, 625);
    assertEquals(sacrifices.filter(({ rating }) => rating === 2).length, 0);
    assertEquals(sacrifices.filter(({ rating }) => rating === 3).length, 0);
    assertEquals(sacrifices.filter(({ rating }) => rating === 4).length, 0);
    assertEquals(sacrifices.filter(({ rating }) => rating === 5).length, 0);

    await assertSnapshot(test, sacrifices);
  });

  await test.step('500 ones + 5 threes', async (test) => {
    const characters: Schema.Character[] = Array(500).fill({}).map((
      _,
      i,
    ) => ({
      rating: 1,
      id: `id:${i}`,
      mediaId: 'media_id',
      user: { id: 'user_id' },
    })).concat(
      Array(25).fill({}).map((
        _,
        i,
      ) => ({
        rating: 3,
        id: `id:${i}`,
        mediaId: 'media_id',
        user: { id: 'user_id' },
      })),
    );

    const sacrifices = synthesis.getSacrifices(characters, 5);

    assertEquals(sacrifices.filter(({ rating }) => rating === 1).length, 500);
    assertEquals(sacrifices.filter(({ rating }) => rating === 2).length, 0);
    assertEquals(sacrifices.filter(({ rating }) => rating === 3).length, 5);
    assertEquals(sacrifices.filter(({ rating }) => rating === 4).length, 0);
    assertEquals(sacrifices.filter(({ rating }) => rating === 5).length, 0);

    await assertSnapshot(test, sacrifices);
  });

  await test.step('5 fours', async (test) => {
    const characters: Schema.Character[] = Array(25).fill({}).map((
      _,
      i,
    ) => ({
      rating: 4,
      id: `id:${i}`,
      mediaId: 'media_id',
      user: { id: 'user_id' },
    }));

    const sacrifices = synthesis.getSacrifices(characters, 5);

    assertEquals(sacrifices.filter(({ rating }) => rating === 1).length, 0);
    assertEquals(sacrifices.filter(({ rating }) => rating === 2).length, 0);
    assertEquals(sacrifices.filter(({ rating }) => rating === 3).length, 0);
    assertEquals(sacrifices.filter(({ rating }) => rating === 4).length, 5);
    assertEquals(sacrifices.filter(({ rating }) => rating === 5).length, 0);

    await assertSnapshot(test, sacrifices);
  });

  await test.step('5 fives', () => {
    const characters: Schema.Character[] = Array(25).fill({}).map((_, i) => ({
      rating: 5,
      id: `id:${i}`,
      mediaId: 'media_id',
      user: { id: 'user_id' },
    }));

    assertThrows(
      () => synthesis.getSacrifices(characters, 5),
      NonFetalError,
      'You don\'t have enough sacrifices for 5<:smol_star:1088427421096751224>',
    );
  });
});

Deno.test('synthesis confirmed', async (test) => {
  await test.step('normal', async () => {
    const media: AniListMedia = {
      id: '2',
      packId: 'anilist',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      popularity: 150_000,
      title: {
        english: 'title',
      },
      coverImage: {
        extraLarge: 'media_image_url',
      },
    };

    const character: AniListCharacter = {
      id: '1',
      packId: 'anilist',
      name: {
        full: 'name',
      },
      image: {
        large: 'character_image_url',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Supporting,
          node: media,
        }],
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  characters: [character],
                  // media: [media],
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                replaceCharacters: {
                  ok: true,
                },
              },
            }))),
        },
        undefined,
        undefined,
        undefined,
      ] as any),
    );

    const gachaStub = stub(gacha, 'guaranteedPool', () =>
      Promise.resolve({
        pool: [{ id: 'anilist:1' }],
        poolInfo: { pool: 1 },
        validate: () => true,
      }));

    const synthesisStub = stub(
      synthesis,
      'getFilteredCharacters',
      () =>
        Promise.resolve([
          {
            mediaId: 'media_id',
            user: { id: 'user_id' },
            id: 'anilist:1',
            rating: 1,
          },
          {
            mediaId: 'media_id',
            user: { id: 'user_id' },
            id: 'anilist:2',
            rating: 1,
          },
          {
            mediaId: 'media_id',
            user: { id: 'user_id' },
            id: 'anilist:3',
            rating: 1,
          },
          {
            mediaId: 'media_id',
            user: { id: 'user_id' },
            id: 'anilist:4',
            rating: 1,
          },
          {
            mediaId: 'media_id',
            user: { id: 'user_id' },
            id: 'anilist:5',
            rating: 1,
          },
        ]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = synthesis.confirmed({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        target: 2,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 3);

      assertEquals(
        fetchStub.calls[2].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[2].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[2].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [{
            type: 'rich',
            title: 'title',
            image: {
              url: 'http://localhost:8000/external/media_image_url?size=medium',
            },
          }],
          components: [],
          attachments: [],
        },
      );

      await timeStub.tickAsync(4000);

      assertSpyCalls(fetchStub, 4);

      assertEquals(
        fetchStub.calls[3].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[3].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[3].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/stars/2.gif',
            },
          }],
          components: [],
          attachments: [],
        },
      );

      await timeStub.tickAsync(6000);

      assertSpyCalls(fetchStub, 5);

      assertEquals(
        fetchStub.calls[4].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[4].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[4].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          embeds: [{
            type: 'rich',
            description: new Rating({ stars: 2 }).emotes,
            fields: [{
              name: 'title',
              value: '**name**',
            }],
            image: {
              url: 'http://localhost:8000/external/character_image_url',
            },
          }],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'character=anilist:1=1',
                label: '/character',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'like=anilist:1',
                label: '/like',
                style: 2,
                type: 2,
              },
            ],
          }],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      synthesisStub.restore();
      gachaStub.restore();
      timeStub.restore();
    }
  });

  await test.step('no pulls available', async () => {
    const media: AniListMedia = {
      id: '2',
      packId: 'anilist',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      popularity: 150_000,
      title: {
        english: 'title',
      },
      coverImage: {
        extraLarge: 'media_image_url',
      },
    };

    const character: AniListCharacter = {
      id: '1',
      packId: 'anilist',
      name: {
        full: 'name',
      },
      image: {
        large: 'character_image_url',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Supporting,
          node: media,
        }],
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  characters: [character],
                  // media: [media],
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                replaceCharacters: {
                  ok: false,
                  error: 'NO_PULLS_AVAILABLE',
                  inventory: {
                    rechargeTimestamp: '2023-02-07T01:00:55.222Z',
                  },
                },
              },
            }))),
        },
        undefined,
        undefined,
      ] as any),
    );

    const gachaStub = stub(gacha, 'guaranteedPool', () =>
      Promise.resolve({
        pool: [{ id: 'anilist:1' }],
        poolInfo: { pool: 1 },
        validate: () => true,
      }));

    const synthesisStub = stub(
      synthesis,
      'getFilteredCharacters',
      () =>
        Promise.resolve([
          {
            mediaId: 'media_id',
            user: { id: 'user_id' },
            id: 'anilist:1',
            rating: 1,
          },
          {
            mediaId: 'media_id',
            user: { id: 'user_id' },
            id: 'anilist:2',
            rating: 1,
          },
          {
            mediaId: 'media_id',
            user: { id: 'user_id' },
            id: 'anilist:3',
            rating: 1,
          },
          {
            mediaId: 'media_id',
            user: { id: 'user_id' },
            id: 'anilist:4',
            rating: 1,
          },
          {
            mediaId: 'media_id',
            user: { id: 'user_id' },
            id: 'anilist:5',
            rating: 1,
          },
        ]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = synthesis.confirmed({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        target: 2,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 3);

      assertEquals(
        fetchStub.calls[2].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[2].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[2].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [
            {
              description: 'You don\'t have any more pulls!',
              type: 'rich',
            },
            {
              type: 'rich',
              description: '_+1 pull <t:1675733455:R>_',
            },
          ],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      synthesisStub.restore();
      gachaStub.restore();
      timeStub.restore();
    }
  });

  await test.step('characters changed hands', async () => {
    const media: AniListMedia = {
      id: '2',
      packId: 'anilist',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      popularity: 150_000,
      title: {
        english: 'title',
      },
      coverImage: {
        extraLarge: 'media_image_url',
      },
    };

    const character: AniListCharacter = {
      id: '1',
      packId: 'anilist',
      name: {
        full: 'name',
      },
      image: {
        large: 'character_image_url',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Supporting,
          node: media,
        }],
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  characters: [character],
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                replaceCharacters: {
                  ok: false,
                  error: 'CHARACTER_NOT_OWNED',
                },
              },
            }))),
        },
        undefined,
        undefined,
      ] as any),
    );

    const gachaStub = stub(gacha, 'guaranteedPool', () =>
      Promise.resolve({
        pool: [{ id: 'anilist:1' }],
        poolInfo: { pool: 1 },
        validate: () => true,
      }));

    const synthesisStub = stub(
      synthesis,
      'getFilteredCharacters',
      () =>
        Promise.resolve([
          {
            mediaId: 'media_id',
            user: { id: 'user_id' },
            id: 'anilist:1',
            rating: 1,
          },
          {
            mediaId: 'media_id',
            user: { id: 'user_id' },
            id: 'anilist:2',
            rating: 1,
          },
          {
            mediaId: 'media_id',
            user: { id: 'user_id' },
            id: 'anilist:3',
            rating: 1,
          },
          {
            mediaId: 'media_id',
            user: { id: 'user_id' },
            id: 'anilist:4',
            rating: 1,
          },
          {
            mediaId: 'media_id',
            user: { id: 'user_id' },
            id: 'anilist:5',
            rating: 1,
          },
        ]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = synthesis.confirmed({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        target: 2,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 3);

      assertEquals(
        fetchStub.calls[2].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[2].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[2].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [
            {
              type: 'rich',
              description: 'Some of those characters changed hands',
            },
          ],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      synthesisStub.restore();
      gachaStub.restore();
      timeStub.restore();
    }
  });

  await test.step('not enough sacrifices', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(globalThis, 'fetch', () => undefined as any);

    const synthesisStub = stub(
      synthesis,
      'getFilteredCharacters',
      () => Promise.resolve([]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = synthesis.confirmed({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        target: 2,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 1);

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [{
            type: 'rich',
            description:
              'You don\'t have enough sacrifices for 2<:smol_star:1088427421096751224>',
          }],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      synthesisStub.restore();
      timeStub.restore();
    }
  });

  await test.step('pool error', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const gachaStub = stub(
      gacha,
      'rngPull',
      () =>
        Promise.reject(
          new PoolError({
            pool: 0,
          }),
        ),
    );

    const synthesisStub = stub(
      synthesis,
      'getFilteredCharacters',
      () =>
        Promise.resolve([
          {
            mediaId: 'media_id',
            user: { id: 'user_id' },
            id: 'anilist:1',
            rating: 1,
          },
          {
            mediaId: 'media_id',
            user: { id: 'user_id' },
            id: 'anilist:2',
            rating: 1,
          },
          {
            mediaId: 'media_id',
            user: { id: 'user_id' },
            id: 'anilist:3',
            rating: 1,
          },
          {
            mediaId: 'media_id',
            user: { id: 'user_id' },
            id: 'anilist:4',
            rating: 1,
          },
          {
            mediaId: 'media_id',
            user: { id: 'user_id' },
            id: 'anilist:5',
            rating: 1,
          },
        ]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = synthesis.confirmed({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        target: 2,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 1);

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [{
            type: 'rich',
            description:
              'There are no more 2<:smol_star:1088427421096751224>characters left',
          }],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      synthesisStub.restore();
      gachaStub.restore();
      timeStub.restore();
    }
  });
});

Deno.test('/synthesis', async (test) => {
  await test.step('normal', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
      },
      {
        id: '2',
        name: {
          full: 'character 2',
        },
      },
      {
        id: '3',
        name: {
          full: 'character 3',
        },
      },
      {
        id: '4',
        name: {
          full: 'character 4',
        },
      },
      {
        id: '5',
        name: {
          full: 'character 5',
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                getUserInventory: {
                  user: {},
                  characters: [
                    {
                      id: 'anilist:1',
                      rating: 1,
                    },
                    {
                      id: 'anilist:2',
                      rating: 1,
                    },
                    {
                      id: 'anilist:3',
                      rating: 1,
                    },
                    {
                      id: 'anilist:4',
                      rating: 1,
                    },
                    {
                      id: 'anilist:5',
                      rating: 1,
                    },
                  ],
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.synthesis = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = synthesis.synthesize({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        target: 2,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner3.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 3);

      assertEquals(
        fetchStub.calls[2].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[2].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[2].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'synthesis=user_id=2',
                label: 'Confirm',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'cancel=user_id',
                label: 'Cancel',
                style: 4,
                type: 2,
              },
            ],
          }],
          embeds: [
            {
              type: 'rich',
              description: 'Sacrifice **5** characters',
            },
            {
              type: 'rich',
              description:
                `1<:smol_star:1088427421096751224> character 1 <:remove:1099004424111792158>
1<:smol_star:1088427421096751224> character 2 <:remove:1099004424111792158>
1<:smol_star:1088427421096751224> character 3 <:remove:1099004424111792158>
1<:smol_star:1088427421096751224> character 4 <:remove:1099004424111792158>
1<:smol_star:1088427421096751224> character 5 <:remove:1099004424111792158>`,
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.synthesis;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('nicknames', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
      },
      {
        id: '2',
        name: {
          full: 'character 2',
        },
      },
      {
        id: '3',
        name: {
          full: 'character 3',
        },
      },
      {
        id: '4',
        name: {
          full: 'character 4',
        },
      },
      {
        id: '5',
        name: {
          full: 'character 5',
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                getUserInventory: {
                  user: {},
                  characters: [
                    {
                      nickname: 'nickname 1',
                      id: 'anilist:1',
                      rating: 1,
                    },
                    {
                      nickname: 'nickname 2',
                      id: 'anilist:2',
                      rating: 1,
                    },
                    {
                      nickname: 'nickname 3',
                      id: 'anilist:3',
                      rating: 1,
                    },
                    {
                      nickname: 'nickname 4',
                      id: 'anilist:4',
                      rating: 1,
                    },
                    {
                      nickname: 'nickname 5',
                      id: 'anilist:5',
                      rating: 1,
                    },
                  ],
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.synthesis = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = synthesis.synthesize({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        target: 2,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner3.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 3);

      assertEquals(
        fetchStub.calls[2].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[2].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[2].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'synthesis=user_id=2',
                label: 'Confirm',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'cancel=user_id',
                label: 'Cancel',
                style: 4,
                type: 2,
              },
            ],
          }],
          embeds: [
            {
              type: 'rich',
              description: 'Sacrifice **5** characters',
            },
            {
              type: 'rich',
              description:
                `1<:smol_star:1088427421096751224> nickname 1 <:remove:1099004424111792158>
1<:smol_star:1088427421096751224> nickname 2 <:remove:1099004424111792158>
1<:smol_star:1088427421096751224> nickname 3 <:remove:1099004424111792158>
1<:smol_star:1088427421096751224> nickname 4 <:remove:1099004424111792158>
1<:smol_star:1088427421096751224> nickname 5 <:remove:1099004424111792158>`,
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.synthesis;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('disabled characters', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
      },
      {
        id: '2',
        name: {
          full: 'character 2',
        },
      },
      {
        id: '3',
        name: {
          full: 'character 3',
        },
      },
      {
        id: '4',
        name: {
          full: 'character 4',
        },
      },
      {
        id: '5',
        name: {
          full: 'character 5',
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                getUserInventory: {
                  user: {},
                  characters: [
                    {
                      id: 'anilist:1',
                      rating: 1,
                    },
                    {
                      id: 'anilist:2',
                      rating: 1,
                    },
                    {
                      id: 'anilist:3',
                      rating: 1,
                    },
                    {
                      id: 'anilist:4',
                      rating: 1,
                    },
                    {
                      id: 'anilist:5',
                      rating: 1,
                    },
                  ],
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(
      packs,
      'isDisabled',
      returnsNext([
        true,
        true,
        false,
        false,
        false,
      ]),
    );

    config.synthesis = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = synthesis.synthesize({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        target: 2,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner3.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 3);

      assertEquals(
        fetchStub.calls[2].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[2].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[2].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'synthesis=user_id=2',
                label: 'Confirm',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'cancel=user_id',
                label: 'Cancel',
                style: 4,
                type: 2,
              },
            ],
          }],
          embeds: [
            {
              type: 'rich',
              description: 'Sacrifice **5** characters',
            },
            {
              type: 'rich',
              description:
                `1<:smol_star:1088427421096751224> character 3 <:remove:1099004424111792158>
1<:smol_star:1088427421096751224> character 4 <:remove:1099004424111792158>
1<:smol_star:1088427421096751224> character 5 <:remove:1099004424111792158>
+2 Others <:remove:1099004424111792158>`,
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.synthesis;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('filtered', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
      },
      {
        id: '2',
        name: {
          full: 'character 2',
        },
      },
      {
        id: '3',
        name: {
          full: 'character 3',
        },
      },
      {
        id: '4',
        name: {
          full: 'character 4',
        },
      },
      {
        id: '5',
        name: {
          full: 'character 5',
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                getUserInventory: {
                  party: {
                    member1: {
                      id: 'anilist:1',
                    },
                    member2: {
                      id: 'anilist:2',
                    },
                    member3: {
                      id: 'anilist:3',
                    },
                    member4: {
                      id: 'anilist:4',
                    },
                    member5: {
                      id: 'anilist:5',
                    },
                  },
                  user: {
                    likes: [
                      'anilist:6',
                      'anilist:7',
                      'anilist:8',
                      'anilist:9',
                      'anilist:10',
                    ],
                  },
                  characters: [
                    {
                      id: 'anilist:1',
                      rating: 1,
                    },
                    {
                      id: 'anilist:2',
                      rating: 1,
                    },
                    {
                      id: 'anilist:3',
                      rating: 1,
                    },
                    {
                      id: 'anilist:4',
                      rating: 1,
                    },
                    {
                      id: 'anilist:5',
                      rating: 1,
                    },
                    {
                      id: 'anilist:6',
                      rating: 1,
                    },
                    {
                      id: 'anilist:7',
                      rating: 1,
                    },
                    {
                      id: 'anilist:8',
                      rating: 1,
                    },
                    {
                      id: 'anilist:9',
                      rating: 1,
                    },
                    {
                      id: 'anilist:10',
                      rating: 1,
                    },
                  ],
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.synthesis = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = synthesis.synthesize({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        target: 2,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner3.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 2);

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            description:
              'You don\'t have enough sacrifices for 2<:smol_star:1088427421096751224>',
          }],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.synthesis;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('not enough', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                getUserInventory: {
                  user: {},
                  characters: [],
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.synthesis = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = synthesis.synthesize({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        target: 5,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner3.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 2);

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            description:
              'You don\'t have enough sacrifices for 5<:smol_star:1088427421096751224>',
          }],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.synthesis;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('maintenance', () => {
    config.synthesis = false;

    try {
      assertThrows(
        () =>
          synthesis.synthesize({
            token: 'test_token',
            userId: 'user_id',
            guildId: 'guild_id',
            target: 2,
          }),
        NonFetalError,
        'Synthesis is under maintenance, try again later!',
      );
    } finally {
      delete config.synthesis;
    }
  });
});
