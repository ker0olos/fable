// deno-lint-ignore-file no-explicit-any

import {
  assertEquals,
  assertThrows,
} from 'https://deno.land/std@0.186.0/testing/asserts.ts';

import {
  assertSpyCalls,
  returnsNext,
  stub,
} from 'https://deno.land/std@0.186.0/testing/mock.ts';

import { assertSnapshot } from 'https://deno.land/std@0.186.0/testing/snapshot.ts';

import { FakeTime } from 'https://deno.land/std@0.186.0/testing/time.ts';

import user from '../src/user.ts';
import packs from '../src/packs.ts';
import config from '../src/config.ts';
import gacha from '../src/gacha.ts';

import Rating from '../src/rating.ts';

import synthesis from '../src/synthesis.ts';

import {
  CharacterRole,
  DisaggregatedCharacter,
  Manifest,
  MediaFormat,
  MediaType,
  PackType,
  Schema,
} from '../src/types.ts';

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
      'You only have **0 out the 5** sacrifices needed for 5<:smolstar:1107503653956374638>',
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

    const userStub = stub(
      user,
      'getActiveInventories',
      () => Promise.resolve([]),
    );

    const gachaStub = stub(gacha, 'guaranteedPool', () =>
      Promise.resolve({
        pool: [{ id: 'anilist:1', mediaId: 'anilist:2', rating: 1 }],
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

      await timeStub.runMicrotasks();
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      synthesisStub.restore();
      userStub.restore();
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
        pool: [{ id: 'anilist:1', mediaId: 'anilist:2', rating: 1 }],
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
              'You only have **4 out the 5** sacrifices needed for 2<:smolstar:1107503653956374638>',
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
          new PoolError(),
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
              'There are no more 2<:smolstar:1107503653956374638>characters left',
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
        image: {
          large: 'image_url',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: {
              id: 'anime',
              type: MediaType.Anime,
              title: {
                english: 'media title',
              },
            },
          }],
        },
      },
      {
        id: '2',
        name: {
          full: 'character 2',
        },
        image: {
          large: 'image_url',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: {
              id: 'anime',
              type: MediaType.Anime,
              title: {
                english: 'media title',
              },
            },
          }],
        },
      },
      {
        id: '3',
        name: {
          full: 'character 3',
        },
        image: {
          large: 'image_url',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: {
              id: 'anime',
              type: MediaType.Anime,
              title: {
                english: 'media title',
              },
            },
          }],
        },
      },
      {
        id: '4',
        name: {
          full: 'character 4',
        },
        image: {
          large: 'image_url',
        },
      },
      {
        id: '5',
        name: {
          full: 'character 5',
        },
        image: {
          large: 'image_url',
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
              description:
                'Sacrifice \u200B (**1<:smolstar:1107503653956374638>x5**) \u200B characters? <:remove:1099004424111792158>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'media title',
                  value: 'character 1',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=preview',
              },
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'media title',
                  value: 'character 2',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=preview',
              },
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'media title',
                  value: 'character 3',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=preview',
              },
            },
            {
              type: 'rich',
              description: 'character 4',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=preview',
              },
            },
            {
              type: 'rich',
              description: 'character 5',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=preview',
              },
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

  await test.step('with nicknames', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
        image: {
          large: 'image_url',
        },
      },
      {
        id: '2',
        name: {
          full: 'character 2',
        },
        image: {
          large: 'image_url',
        },
      },
      {
        id: '3',
        name: {
          full: 'character 3',
        },
        image: {
          large: 'image_url',
        },
      },
      {
        id: '4',
        name: {
          full: 'character 4',
        },
        image: {
          large: 'image_url',
        },
      },
      {
        id: '5',
        name: {
          full: 'character 5',
        },
        image: {
          large: 'image_url',
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
                      image: 'custom_image_url',
                      nickname: 'nickname 1',
                      id: 'anilist:1',
                      rating: 1,
                    },
                    {
                      image: 'custom_image_url',
                      nickname: 'nickname 2',
                      id: 'anilist:2',
                      rating: 1,
                    },
                    {
                      image: 'custom_image_url',
                      nickname: 'nickname 3',
                      id: 'anilist:3',
                      rating: 1,
                    },
                    {
                      image: 'custom_image_url',
                      nickname: 'nickname 4',
                      id: 'anilist:4',
                      rating: 1,
                    },
                    {
                      image: 'custom_image_url',
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
              description:
                'Sacrifice \u200B (**1<:smolstar:1107503653956374638>x5**) \u200B characters? <:remove:1099004424111792158>',
            },
            {
              type: 'rich',
              description: 'nickname 1',
              thumbnail: {
                url:
                  'http://localhost:8000/external/custom_image_url?size=preview',
              },
            },
            {
              type: 'rich',
              description: 'nickname 2',
              thumbnail: {
                url:
                  'http://localhost:8000/external/custom_image_url?size=preview',
              },
            },
            {
              type: 'rich',
              description: 'nickname 3',
              thumbnail: {
                url:
                  'http://localhost:8000/external/custom_image_url?size=preview',
              },
            },
            {
              type: 'rich',
              description: 'nickname 4',
              thumbnail: {
                url:
                  'http://localhost:8000/external/custom_image_url?size=preview',
              },
            },
            {
              type: 'rich',
              description: 'nickname 5',
              thumbnail: {
                url:
                  'http://localhost:8000/external/custom_image_url?size=preview',
              },
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

  await test.step('with blur', async () => {
    const characters: DisaggregatedCharacter[] = [
      {
        id: '1',
        packId: 'pack-id',
        name: {
          english: 'character 1',
        },
        images: [{
          nsfw: true,
          url: 'image_url',
        }],
      },
      {
        id: '2',
        packId: 'pack-id',
        name: {
          english: 'character 2',
        },
        images: [{
          nsfw: true,
          url: 'image_url',
        }],
      },
      {
        id: '3',
        packId: 'pack-id',
        name: {
          english: 'character 3',
        },
        images: [{
          nsfw: true,
          url: 'image_url',
        }],
      },
      {
        id: '4',
        packId: 'pack-id',
        name: {
          english: 'character 4',
        },
        images: [{
          nsfw: false,
          url: 'image_url',
        }],
      },
      {
        id: '5',
        packId: 'pack-id',
        name: {
          english: 'character 5',
        },
        images: [{
          nsfw: false,
          url: 'image_url',
        }],
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
                      id: 'pack-id:1',
                      rating: 1,
                    },
                    {
                      id: 'pack-id:2',
                      rating: 1,
                    },
                    {
                      id: 'pack-id:3',
                      rating: 1,
                    },
                    {
                      id: 'pack-id:4',
                      rating: 1,
                    },
                    {
                      id: 'pack-id:5',
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
                  characters: [],
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const manifest: Manifest = {
      id: 'pack-id',
      characters: {
        new: characters,
      },
    };

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([{ manifest, type: PackType.Community }]),
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
              description:
                'Sacrifice \u200B (**1<:smolstar:1107503653956374638>x5**) \u200B characters? <:remove:1099004424111792158>',
            },
            {
              type: 'rich',
              description: 'character 1',
              thumbnail: {
                url:
                  'http://localhost:8000/external/image_url?size=preview&blur',
              },
            },
            {
              type: 'rich',
              description: 'character 2',
              thumbnail: {
                url:
                  'http://localhost:8000/external/image_url?size=preview&blur',
              },
            },
            {
              type: 'rich',
              description: 'character 3',
              thumbnail: {
                url:
                  'http://localhost:8000/external/image_url?size=preview&blur',
              },
            },
            {
              type: 'rich',
              description: 'character 4',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=preview',
              },
            },
            {
              type: 'rich',
              description: 'character 5',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=preview',
              },
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
        image: {
          large: 'image_url',
        },
      },
      {
        id: '2',
        name: {
          full: 'character 2',
        },
        image: {
          large: 'image_url',
        },
      },
      {
        id: '3',
        name: {
          full: 'character 3',
        },
        image: {
          large: 'image_url',
        },
      },
      {
        id: '4',
        name: {
          full: 'character 4',
        },
        image: {
          large: 'image_url',
        },
      },
      {
        id: '5',
        name: {
          full: 'character 5',
        },
        image: {
          large: 'image_url',
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
              description:
                'Sacrifice \u200B (**1<:smolstar:1107503653956374638>x5**) \u200B characters? <:remove:1099004424111792158>',
            },
            {
              type: 'rich',
              description: 'character 3',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=preview',
              },
            },
            {
              type: 'rich',
              description: 'character 4',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=preview',
              },
            },
            {
              type: 'rich',
              description: 'character 5',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=preview',
              },
            },
            {
              type: 'rich',
              description: '_+2 others..._',
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

  await test.step('filter (party)', async () => {
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
                  user: {},
                  characters: [
                    {
                      id: 'anilist:1',
                      mediaId: 'pack-id:1',
                      rating: 1,
                    },
                    {
                      id: 'anilist:2',
                      mediaId: 'pack-id:1',
                      rating: 1,
                    },
                    {
                      id: 'anilist:3',
                      mediaId: 'pack-id:1',
                      rating: 1,
                    },
                    {
                      id: 'anilist:4',
                      mediaId: 'pack-id:1',
                      rating: 1,
                    },
                    {
                      id: 'anilist:5',
                      mediaId: 'pack-id:2',
                      rating: 1,
                    },
                    {
                      id: 'anilist:6',
                      mediaId: 'pack-id:1',
                      rating: 1,
                    },
                    {
                      id: 'anilist:7',
                      mediaId: 'pack-id:1',
                      rating: 1,
                    },
                    {
                      id: 'anilist:8',
                      mediaId: 'pack-id:1',
                      rating: 1,
                    },
                    {
                      id: 'anilist:9',
                      mediaId: 'pack-id:1',
                      rating: 1,
                    },
                  ],
                },
              },
            }))),
        } as any,
        // {
        //   ok: true,
        //   text: (() =>
        //     Promise.resolve(JSON.stringify({
        //       data: {
        //         Page: {
        //           characters,
        //         },
        //       },
        //     }))),
        // } as any,
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
              'You only have **4 out the 5** sacrifices needed for 2<:smolstar:1107503653956374638>',
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

  await test.step('filter (characters)', async () => {
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
                  user: {
                    likes: [
                      { characterId: 'anilist:1' },
                      { characterId: 'anilist:2' },
                      { characterId: 'anilist:3' },
                      { characterId: 'anilist:4' },
                      { characterId: 'anilist:5' },
                    ],
                  },
                  characters: [
                    {
                      id: 'anilist:1',
                      mediaId: 'pack-id:1',
                      rating: 1,
                    },
                    {
                      id: 'anilist:2',
                      mediaId: 'pack-id:1',
                      rating: 1,
                    },
                    {
                      id: 'anilist:3',
                      mediaId: 'pack-id:1',
                      rating: 1,
                    },
                    {
                      id: 'anilist:4',
                      mediaId: 'pack-id:1',
                      rating: 1,
                    },
                    {
                      id: 'anilist:5',
                      mediaId: 'pack-id:2',
                      rating: 1,
                    },
                    {
                      id: 'anilist:6',
                      mediaId: 'pack-id:1',
                      rating: 1,
                    },
                    {
                      id: 'anilist:7',
                      mediaId: 'pack-id:1',
                      rating: 1,
                    },
                    {
                      id: 'anilist:8',
                      mediaId: 'pack-id:1',
                      rating: 1,
                    },
                    {
                      id: 'anilist:9',
                      mediaId: 'pack-id:1',
                      rating: 1,
                    },
                  ],
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
              'You only have **4 out the 5** sacrifices needed for 2<:smolstar:1107503653956374638>',
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

  await test.step('filter (media)', async () => {
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
                  user: {
                    likes: [
                      { mediaId: 'pack-id:1' },
                    ],
                  },
                  characters: [
                    {
                      id: 'anilist:1',
                      mediaId: 'pack-id:1',
                      rating: 1,
                    },
                    {
                      id: 'anilist:2',
                      mediaId: 'pack-id:1',
                      rating: 1,
                    },
                    {
                      id: 'anilist:3',
                      mediaId: 'pack-id:1',
                      rating: 1,
                    },
                    {
                      id: 'anilist:4',
                      mediaId: 'pack-id:1',
                      rating: 1,
                    },
                    {
                      id: 'anilist:5',
                      mediaId: 'pack-id:1',
                      rating: 1,
                    },
                    {
                      id: 'anilist:6',
                      mediaId: 'pack-id:2',
                      rating: 1,
                    },
                    {
                      id: 'anilist:7',
                      mediaId: 'pack-id:2',
                      rating: 1,
                    },
                    {
                      id: 'anilist:8',
                      mediaId: 'pack-id:2',
                      rating: 1,
                    },
                    {
                      id: 'anilist:9',
                      mediaId: 'pack-id:2',
                      rating: 1,
                    },
                  ],
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
              'You only have **4 out the 5** sacrifices needed for 2<:smolstar:1107503653956374638>',
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
        channelId: 'channel_id',
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
              'You only have **0 out the 5** sacrifices needed for 5<:smolstar:1107503653956374638>',
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

  await test.step('under maintenance', () => {
    config.synthesis = false;

    try {
      assertThrows(
        () =>
          synthesis.synthesize({
            token: 'test_token',
            userId: 'user_id',
            guildId: 'guild_id',
            channelId: 'channel_id',
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
