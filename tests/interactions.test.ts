// deno-lint-ignore-file no-explicit-any

import {
  assertEquals,
  assertRejects,
  assertThrows,
} from 'https://deno.land/std@0.179.0/testing/asserts.ts';

import {
  assertSpyCalls,
  returnsNext,
  stub,
} from 'https://deno.land/std@0.179.0/testing/mock.ts';

import { assertSnapshot } from 'https://deno.land/std@0.179.0/testing/snapshot.ts';

import { FakeTime } from 'https://deno.land/std@0.179.0/testing/time.ts';

import Rating from '../src/rating.ts';

import gacha, { Pull } from '../src/gacha.ts';

import packs from '../src/packs.ts';
import config from '../src/config.ts';
import help from '../src/help.ts';

import party from '../src/party.ts';
import search from '../src/search.ts';
import user from '../src/user.ts';
import trade from '../src/trade.ts';
import shop from '../src/shop.ts';

import github from '../src/github.ts';

import {
  Character,
  CharacterRole,
  DisaggregatedCharacter,
  Manifest,
  Media,
  MediaFormat,
  MediaRelation,
  MediaType,
  PackType,
} from '../src/types.ts';

import { AniListCharacter, AniListMedia } from '../packs/anilist/types.ts';

import { NonFetalError, NoPullsError, PoolError } from '../src/errors.ts';

Deno.test('/media', async (test) => {
  await test.step('normal search', async () => {
    const media: AniListMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
        romaji: 'romaji title',
        native: 'native title',
      },
      coverImage: {
        extraLarge: 'image_url',
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                media: [media],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.media({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'english title',
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

      await timeStub.tickAsync(0);

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
          embeds: [{
            type: 'rich',
            author: {
              name: 'Anime',
            },
            title: 'english title',
            description: 'long description',
            image: {
              url: 'http://localhost:8000/external/image_url',
            },
          }],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('native title', async () => {
    const media: AniListMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        native: 'native title',
      },
      coverImage: {
        extraLarge: 'image_url',
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                media: [media],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.media({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'native title',
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

      await timeStub.tickAsync(0);

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
          embeds: [{
            type: 'rich',
            author: {
              name: 'Anime',
            },
            title: 'native title',
            description: 'long description',
            image: {
              url: 'http://localhost:8000/external/image_url',
            },
          }],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('format header', async () => {
    const media: AniListMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.Novel,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
      },
      coverImage: {
        extraLarge: 'image_url',
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                media: [media],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.media({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'english title',
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

      await timeStub.tickAsync(0);

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
          embeds: [{
            type: 'rich',
            author: {
              name: 'Novel',
            },
            title: 'english title',
            description: 'long description',
            image: {
              url: 'http://localhost:8000/external/image_url',
            },
          }],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('external links', async () => {
    const media: AniListMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
      },
      coverImage: {
        extraLarge: 'image_url',
      },
      externalLinks: [
        { site: 'Crunchyroll', url: 'https://crunchyroll.com/title' },
        { site: 'Crunchyroll 2', url: 'crunchyroll.com/title' },
        { site: 'YouTube', url: 'https://www.youtube.com/video' },
        { site: 'FakeTube', url: 'https://faketube.net/video' },
      ],
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                media: [media],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.media({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'english title',
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

      await timeStub.tickAsync(0);

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
          embeds: [{
            type: 'rich',
            author: {
              name: 'Anime',
            },
            title: 'english title',
            description: 'long description',
            image: {
              url: 'http://localhost:8000/external/image_url',
            },
          }],
          components: [
            {
              type: 1,
              components: [
                {
                  url: 'https://crunchyroll.com/title',
                  label: 'Crunchyroll',
                  style: 5,
                  type: 2,
                },
                {
                  url: 'crunchyroll.com/title',
                  label: 'Crunchyroll 2',
                  style: 5,
                  type: 2,
                },
                {
                  url: 'https://www.youtube.com/video',
                  label: 'YouTube',
                  style: 5,
                  type: 2,
                },
              ],
            },
          ],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('default image', async () => {
    const media: AniListMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'english title',
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                media: [media],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.media({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'english title',
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

      await timeStub.tickAsync(0);

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
          embeds: [{
            type: 'rich',
            author: {
              name: 'Anime',
            },
            title: 'english title',
            image: {
              url: 'http://localhost:8000/external/',
            },
          }],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('youtube trailer', async () => {
    const media: AniListMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
      },
      coverImage: {
        extraLarge: 'image_url',
      },
      trailer: {
        site: 'youtube',
        id: 'video_id',
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                media: [media],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.media({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'english title',
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

      await timeStub.tickAsync(0);

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
          embeds: [{
            type: 'rich',
            author: {
              name: 'Anime',
            },
            title: 'english title',
            description: 'long description',
            image: {
              url: 'http://localhost:8000/external/image_url',
            },
          }],
          components: [
            {
              type: 1,
              components: [
                {
                  url: 'https://youtu.be/video_id',
                  label: 'Trailer',
                  style: 5,
                  type: 2,
                },
              ],
            },
          ],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('characters embeds', async () => {
    const media: AniListMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
      },
      coverImage: {
        extraLarge: 'image_url',
      },
      characters: {
        pageInfo: {
          hasNextPage: false,
        },
        edges: [{
          role: CharacterRole.Main,
          node: {
            id: '5',
            name: {
              full: 'main character name',
            },
            description: 'main character description',
            image: {
              large: 'main character url',
            },
            gender: 'Male',
            age: '69',
          },
        }, {
          role: CharacterRole.Supporting,
          node: {
            id: '5',
            name: {
              full: 'supporting character name',
            },
            description: 'supporting character description',
            image: {
              large: 'supporting character url',
            },
          },
        }, {
          role: CharacterRole.Background,
          node: {
            id: '5',
            name: {
              full: 'background character name',
            },
            description: 'background character description',
            image: {
              large: 'background character url',
            },
          },
        }],
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                media: [media],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.media({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'english title',
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

      await timeStub.tickAsync(0);

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
          embeds: [{
            type: 'rich',
            author: {
              name: 'Anime',
            },
            title: 'english title',
            description: 'long description',
            image: {
              url: 'http://localhost:8000/external/image_url',
            },
          }, {
            type: 'rich',
            footer: {
              text: 'Male, 69',
            },
            fields: [{
              name: 'main character name',
              value: 'main character description',
            }],
            thumbnail: {
              url:
                'http://localhost:8000/external/main%20character%20url?size=thumbnail',
            },
          }, {
            type: 'rich',
            fields: [{
              name: 'supporting character name',
              value: 'supporting character description',
            }],
            thumbnail: {
              url:
                'http://localhost:8000/external/supporting%20character%20url?size=thumbnail',
            },
          }],
          components: [{
            type: 1,
            components: [{
              custom_id: 'mcharacters=anilist:1',
              label: 'View Characters',
              style: 2,
              type: 2,
            }],
          }],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('media relations', async () => {
    const media: AniListMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
      },
      coverImage: {
        extraLarge: 'image_url',
      },
      relations: {
        edges: [{
          relationType: MediaRelation.Sequel,
          node: {
            id: '5',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            popularity: 0,
            title: {
              english: 'english title 2',
            },
          },
        }, {
          relationType: MediaRelation.Prequel,
          node: {
            id: '10',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            popularity: 0,
            title: {
              english: 'english title',
            },
          },
        }, {
          relationType: MediaRelation.SideStory,
          node: {
            id: '15',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            popularity: 0,
            title: {
              english: 'side story',
            },
          },
        }, {
          relationType: MediaRelation.SpinOff,
          node: {
            id: '20',
            type: MediaType.Manga,
            format: MediaFormat.Manga,
            popularity: 0,
            title: {
              english: 'spin off',
            },
          },
        }, {
          relationType: MediaRelation.Adaptation,
          node: {
            id: '25',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            popularity: 0,
            title: {
              english: 'adaptation',
            },
          },
        }, {
          relationType: MediaRelation.Adaptation,
          node: {
            id: '30',
            type: MediaType.Manga,
            format: MediaFormat.Manga,
            popularity: 0,
            title: {
              english: 'second adaptation',
            },
          },
        }],
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                media: [media],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.media({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'english title',
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

      await timeStub.tickAsync(0);

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
          embeds: [{
            type: 'rich',
            author: {
              name: 'Anime',
            },
            title: 'english title',
            description: 'long description',
            image: {
              url: 'http://localhost:8000/external/image_url',
            },
          }],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'media=anilist:5',
                  label: 'english title 2 (Sequel)',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'media=anilist:10',
                  label: 'english title (Prequel)',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'media=anilist:15',
                  label: 'side story (Side Story)',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'media=anilist:20',
                  label: 'spin off (Spin Off)',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('media relations 2', async () => {
    const media: AniListMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
      },
      coverImage: {
        extraLarge: 'image_url',
      },
      relations: {
        edges: [{
          relationType: MediaRelation.Contains,
          node: {
            id: '5',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            popularity: 0,
            title: {
              english: 'child',
            },
          },
        }, {
          relationType: MediaRelation.Parent,
          node: {
            id: '10',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            popularity: 0,
            title: {
              english: 'parent',
            },
          },
        }, {
          relationType: MediaRelation.Adaptation,
          node: {
            id: '15',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            popularity: 0,
            title: {
              english: 'adaptation',
            },
          },
        }, {
          relationType: MediaRelation.Other,
          node: {
            id: '20',
            type: MediaType.Manga,
            format: MediaFormat.Manga,
            popularity: 0,
            title: {
              english: 'other',
            },
          },
        }],
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                media: [media],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.media({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'english title',
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

      await timeStub.tickAsync(0);

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
          embeds: [{
            type: 'rich',
            author: {
              name: 'Anime',
            },
            title: 'english title',
            description: 'long description',
            image: {
              url: 'http://localhost:8000/external/image_url',
            },
          }],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'media=anilist:5',
                  label: 'child (Anime)',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'media=anilist:10',
                  label: 'parent (Anime)',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'media=anilist:15',
                  label: 'adaptation (Anime)',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'media=anilist:20',
                  label: 'other (Manga)',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('media relations 3', async () => {
    const media: AniListMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
      },
      coverImage: {
        extraLarge: 'image_url',
      },
      relations: {
        edges: [{
          relationType: MediaRelation.Other,
          node: {
            id: '5',
            type: MediaType.Anime,
            popularity: 0,
            title: {
              english: 'branch',
            },
          },
        }],
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                media: [media],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.media({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'english title',
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

      await timeStub.tickAsync(0);

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
          embeds: [{
            type: 'rich',
            author: {
              name: 'Anime',
            },
            title: 'english title',
            description: 'long description',
            image: {
              url: 'http://localhost:8000/external/image_url',
            },
          }],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'media=anilist:5',
                  label: 'branch',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('music relations', async () => {
    const media: AniListMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
      },
      coverImage: {
        extraLarge: 'image_url',
      },
      relations: {
        edges: [{
          relationType: MediaRelation.Other,
          node: {
            id: '5',
            type: MediaType.Anime,
            format: MediaFormat.Music,
            popularity: 0,
            title: {
              english: 'op',
            },
            externalLinks: [{ site: 'Youtube', url: 'youtube_url' }],
          },
        }, {
          relationType: MediaRelation.Other,
          node: {
            id: '10',
            type: MediaType.Anime,
            format: MediaFormat.Music,
            popularity: 0,
            title: {
              english: 'fk',
            },
            externalLinks: [{ site: 'Spotify', url: 'spotify_url' }],
          },
        }, {
          relationType: MediaRelation.Other,
          node: {
            id: '15',
            type: MediaType.Anime,
            format: MediaFormat.Music,
            popularity: 0,
            title: {
              english: 'ed',
            },
            externalLinks: [{ site: 'FakeTube', url: 'faketube_url' }],
          },
        }],
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                media: [media],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.media({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'english title',
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

      await timeStub.tickAsync(0);

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
          embeds: [{
            type: 'rich',
            author: {
              name: 'Anime',
            },
            title: 'english title',
            description: 'long description',
            image: {
              url: 'http://localhost:8000/external/image_url',
            },
          }],
          components: [
            {
              type: 1,
              components: [
                {
                  label: 'op',
                  url: 'youtube_url',
                  style: 5,
                  type: 2,
                },
                {
                  label: 'fk',
                  url: 'spotify_url',
                  style: 5,
                  type: 2,
                },
              ],
            },
          ],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('relations sorting', async () => {
    const media: AniListMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
      },
      coverImage: {
        extraLarge: 'image_url',
      },
      relations: {
        edges: [{
          relationType: MediaRelation.Other,
          node: {
            id: '5',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            popularity: 0,
            title: {
              english: 'title',
            },
          },
        }, {
          relationType: MediaRelation.Other,
          node: {
            id: '10',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            popularity: 100,
            title: {
              english: 'title',
            },
          },
        }, {
          relationType: MediaRelation.Other,
          node: {
            id: '15',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            popularity: 50,
            title: {
              english: 'title',
            },
          },
        }],
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                media: [media],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.media({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'english title',
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

      await timeStub.tickAsync(0);

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
          embeds: [{
            type: 'rich',
            author: {
              name: 'Anime',
            },
            title: 'english title',
            description: 'long description',
            image: {
              url: 'http://localhost:8000/external/image_url',
            },
          }],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'media=anilist:5',
                  label: 'title (Anime)',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'media=anilist:10',
                  label: 'title (Anime)',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'media=anilist:15',
                  label: 'title (Anime)',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('characters sorting', async () => {
    const media: AniListMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
      },
      coverImage: {
        extraLarge: 'image_url',
      },
      characters: {
        pageInfo: {
          hasNextPage: false,
        },
        edges: [{
          role: CharacterRole.Main,
          node: {
            id: '5',
            name: {
              full: 'main character name',
            },
            popularity: 0,
          },
        }, {
          role: CharacterRole.Supporting,
          node: {
            id: '10',
            name: {
              full: 'supporting character name',
            },
            popularity: 100,
          },
        }, {
          role: CharacterRole.Background,
          node: {
            id: '15',
            name: {
              full: 'background character name',
            },
            popularity: 50,
          },
        }],
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                media: [media],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.media({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'english title',
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

      await timeStub.tickAsync(0);

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
          embeds: [{
            type: 'rich',
            author: {
              name: 'Anime',
            },
            title: 'english title',
            description: 'long description',
            image: {
              url: 'http://localhost:8000/external/image_url',
            },
          }, {
            type: 'rich',
            fields: [{
              name: 'main character name',
              value: '\u200B',
            }],
            thumbnail: {
              url: 'http://localhost:8000/external/?size=thumbnail',
            },
          }, {
            type: 'rich',
            fields: [{
              name: 'supporting character name',
              value: '\u200B',
            }],
            thumbnail: {
              url: 'http://localhost:8000/external/?size=thumbnail',
            },
          }],
          components: [{
            type: 1,
            components: [{
              custom_id: 'mcharacters=anilist:1',
              label: 'View Characters',
              style: 2,
              type: 2,
            }],
          }],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('not found', async () => {
    const media: AniListMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
        romaji: 'romaji title',
        native: 'native title',
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                media: [media],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.media({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'x'.repeat(100),
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

      await timeStub.tickAsync(0);

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
          embeds: [{
            type: 'rich',
            description: 'Found _nothing_ matching that query!',
          }],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('no titles', () => {
    const media: Media = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {},
    };

    assertThrows(() => search.mediaMessage(media), Error, '404');
  });
});

Deno.test('/media debug', async (test) => {
  await test.step('normal', async () => {
    const media: AniListMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
        romaji: 'romaji title',
        native: 'native title',
      },
      coverImage: {
        extraLarge: 'image_url',
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                media: [media],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.media({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'english title',
        debug: true,
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

      await timeStub.tickAsync(0);

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
          embeds: [{
            type: 'rich',
            description: 'romaji title\nnative title',
            fields: [
              {
                name: 'Id',
                value: 'anilist:1',
              },
              {
                inline: true,
                name: 'Type',
                value: 'Anime',
              },
              {
                inline: true,
                name: 'Format',
                value: 'TV',
              },
              {
                inline: true,
                name: 'Popularity',
                value: '0',
              },
            ],
            thumbnail: {
              url: 'http://localhost:8000/external/image_url?size=thumbnail',
            },
            title: 'english title',
          }],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('default image', async () => {
    const media: AniListMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'english title',
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                media: [media],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.media({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'english title',
        debug: true,
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

      await timeStub.tickAsync(0);

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
          embeds: [{
            type: 'rich',
            fields: [
              {
                name: 'Id',
                value: 'anilist:1',
              },
              {
                inline: true,
                name: 'Type',
                value: 'Anime',
              },
              {
                inline: true,
                name: 'Format',
                value: 'TV',
              },
              {
                inline: true,
                name: 'Popularity',
                value: '0',
              },
            ],
            thumbnail: {
              url: 'http://localhost:8000/external/?size=thumbnail',
            },
            title: 'english title',
          }],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('default image 2', async () => {
    const media: AniListMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'english title',
      },
      coverImage: {
        extraLarge: 'default.jpg',
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                media: [media],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.media({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'english title',
        debug: true,
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

      await timeStub.tickAsync(0);

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
          embeds: [{
            type: 'rich',
            fields: [
              {
                name: 'Id',
                value: 'anilist:1',
              },
              {
                inline: true,
                name: 'Type',
                value: 'Anime',
              },
              {
                inline: true,
                name: 'Format',
                value: 'TV',
              },
              {
                inline: true,
                name: 'Popularity',
                value: '0',
              },
            ],
            thumbnail: {
              url: 'http://localhost:8000/external/?size=thumbnail',
            },
            title: 'english title',
          }],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('no titles', () => {
    const media: Media = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {},
    };

    assertThrows(() => search.mediaDebugMessage(media), Error, '404');
  });
});

Deno.test('/character', async (test) => {
  await test.step('normal search', async () => {
    const character: DisaggregatedCharacter = {
      id: '1',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [{
        url: 'image_url',
      }],
      popularity: 1_000_000,
      age: '420',
      gender: 'male',
    };

    const manifest: Manifest = {
      id: 'pack-id',
      characters: {
        new: [character],
      },
    };

    const timeStub = new FakeTime();

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

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([{ manifest, type: PackType.Community }]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.character({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'full name',
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

      await timeStub.tickAsync(0);

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
            description:
              '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098>',
            fields: [
              {
                name: 'full name\n\u200B',
                value: 'long description',
              },
            ],
            image: {
              url: 'http://localhost:8000/external/image_url',
            },
            footer: {
              text: 'Male, 420',
            },
          }],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('with owner', async () => {
    const character: AniListCharacter = {
      id: '1',
      description: 'long description',
      name: {
        full: 'full name',
      },
      image: {
        large: 'image_url',
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
                findCharacter: {
                  user: {
                    id: 'user_id',
                  },
                  id: 'character_id',
                  mediaId: 'media_id',
                  rating: 3,
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.character({
        token: 'test_token',
        search: 'full name',
        userId: 'user_id',
        guildId: 'guild_id',
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

      await timeStub.tickAsync(0);

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
            description:
              '<@user_id>\n\n<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466>',
            fields: [
              {
                name: 'full name\n\u200B',
                value: 'long description',
              },
            ],
            image: {
              url: 'http://localhost:8000/external/image_url',
            },
          }],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'passign=character_id',
                  label: '/p assign',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('with gender', async () => {
    const character: AniListCharacter = {
      id: '1',
      description: 'long description',
      name: {
        full: 'full name',
      },
      image: {
        large: 'image_url',
      },
      gender: 'female',
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                characters: [character],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.character({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'full name',
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

      await timeStub.tickAsync(0);

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
            description:
              '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
            fields: [
              {
                name: 'full name\n\u200B',
                value: 'long description',
              },
            ],
            image: {
              url: 'http://localhost:8000/external/image_url',
            },
            footer: {
              text: 'Female',
            },
          }],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('with age', async () => {
    const character: AniListCharacter = {
      id: '1',
      description: 'long description',
      name: {
        full: 'full name',
      },
      image: {
        large: 'image_url',
      },
      age: '18+',
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                characters: [character],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await search.character({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'full name',
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

      await timeStub.tickAsync(0);

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
            description:
              '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
            fields: [
              {
                name: 'full name\n\u200B',
                value: 'long description',
              },
            ],
            image: {
              url: 'http://localhost:8000/external/image_url',
            },
            footer: {
              text: '18+',
            },
          }],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('with relations', async () => {
    const character: AniListCharacter = {
      id: '1',
      description: 'long description',
      name: {
        full: 'full name',
      },
      image: {
        large: 'image_url',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: {
            id: '5',
            type: MediaType.Anime,
            format: MediaFormat.Movie,
            popularity: 0,
            title: {
              english: 'movie',
            },
          },
        }],
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                characters: [character],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.character({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'full name',
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

      await timeStub.tickAsync(0);

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
          embeds: [{
            type: 'rich',
            description:
              '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
            fields: [
              {
                name: 'full name\n\u200B',
                value: 'long description',
              },
            ],
            image: {
              url: 'http://localhost:8000/external/image_url',
            },
          }],
          components: [{
            type: 1,
            components: [{
              custom_id: 'media=anilist:5',
              label: 'movie (Movie)',
              style: 2,
              type: 2,
            }],
          }],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('default image', async () => {
    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'full name',
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                characters: [character],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.character({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'full name',
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

      await timeStub.tickAsync(0);

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
            description:
              '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
            fields: [
              {
                name: 'full name',
                value: '\u200B',
              },
            ],
            image: {
              url: 'http://localhost:8000/external/',
            },
          }],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('default image 2', async () => {
    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'full name',
      },
      image: {
        large: 'default.jpg',
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                characters: [character],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.character({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'full name',
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

      await timeStub.tickAsync(0);

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
            description:
              '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
            fields: [
              {
                name: 'full name',
                value: '\u200B',
              },
            ],
            image: {
              url: 'http://localhost:8000/external/',
            },
          }],
          attachments: [],
          components: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('not found', async () => {
    const character: AniListCharacter = {
      id: '1',
      description: 'long description',
      name: {
        full: 'full name',
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                characters: [character],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.character({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'x'.repeat(100),
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

      await timeStub.tickAsync(0);

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
          embeds: [{
            type: 'rich',
            description: 'Found _nothing_ matching that query!',
          }],
          attachments: [],
          components: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });
});

Deno.test('/character debug', async (test) => {
  await test.step('no media', async () => {
    const character: DisaggregatedCharacter = {
      id: '1',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [{
        url: 'image_url',
      }],
      age: '420',
      gender: 'male',
      popularity: 1_000_000,
    };

    const manifest: Manifest = {
      id: 'pack-id',
      characters: {
        new: [character],
      },
    };

    const timeStub = new FakeTime();

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

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([{ manifest, type: PackType.Community }]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.character({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'full name',
        debug: true,
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

      await timeStub.tickAsync(0);

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
          components: [],
          embeds: [
            {
              type: 'rich',
              title: 'full name',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'Id',
                  value: 'pack-id:1',
                },
                {
                  name: 'Rating',
                  value: '5*',
                },
                {
                  inline: true,
                  name: 'Gender',
                  value: 'male',
                },
                {
                  inline: true,
                  name: 'Age',
                  value: '420',
                },
                {
                  inline: true,
                  name: 'Media',
                  value: 'undefined:undefined',
                },
                {
                  inline: true,
                  name: 'Role',
                  value: 'undefined',
                },
                {
                  inline: true,
                  name: 'Popularity',
                  value: '1,000,000',
                },
                {
                  name: '**WARN**',
                  value:
                    'Character not available in gacha.\nAdd at least one media to the character.',
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('no media nor popularity', async () => {
    const character: AniListCharacter = {
      id: '1',
      description: 'long description',
      name: {
        full: 'full name',
      },
      image: {
        large: 'image_url',
      },
      age: '420',
      gender: 'male',
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                characters: [character],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.character({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'full name',
        debug: true,
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

      await timeStub.tickAsync(0);

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
          components: [],
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: 'full name',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'Id',
                  value: 'anilist:1',
                },
                {
                  name: 'Rating',
                  value: '1*',
                },
                {
                  inline: true,
                  name: 'Gender',
                  value: 'male',
                },
                {
                  inline: true,
                  name: 'Age',
                  value: '420',
                },
                {
                  inline: true,
                  name: 'Media',
                  value: 'undefined:undefined',
                },
                {
                  inline: true,
                  name: 'Role',
                  value: 'undefined',
                },
                {
                  inline: true,
                  name: 'Popularity',
                  value: '0',
                },
                {
                  name: '**WARN**',
                  value:
                    'Character not available in gacha.\nAdd at least one media to the character.',
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('default image', async () => {
    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'full name',
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                characters: [character],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.character({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'full name',
        debug: true,
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

      await timeStub.tickAsync(0);

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
          components: [],
          embeds: [
            {
              type: 'rich',
              title: 'full name',
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              fields: [
                {
                  name: 'Id',
                  value: 'anilist:1',
                },
                {
                  name: 'Rating',
                  value: '1*',
                },
                {
                  inline: true,
                  name: 'Gender',
                  value: 'undefined',
                },
                {
                  inline: true,
                  name: 'Age',
                  value: 'undefined',
                },
                {
                  inline: true,
                  name: 'Media',
                  value: 'undefined:undefined',
                },
                {
                  inline: true,
                  name: 'Role',
                  value: 'undefined',
                },
                {
                  inline: true,
                  name: 'Popularity',
                  value: '0',
                },
                {
                  name: '**WARN**',
                  value:
                    'Character not available in gacha.\nAdd at least one media to the character.',
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('with media', async () => {
    const character: AniListCharacter = {
      id: '1',
      description: 'long description',
      name: {
        full: 'full name',
      },
      image: {
        large: 'image_url',
      },
      age: '420',
      gender: 'male',
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: {
            id: '5',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            popularity: 10,
            title: {
              english: 'title',
            },
          },
        }],
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                characters: [character],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = search.character({
        token: 'test_token',
        guildId: 'guild_id',
        search: 'full name',
        debug: true,
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

      await timeStub.tickAsync(0);

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
          components: [],
          embeds: [
            {
              type: 'rich',
              title: 'full name',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'Id',
                  value: 'anilist:1',
                },
                {
                  name: 'Rating',
                  value: '1*',
                },
                {
                  inline: true,
                  name: 'Gender',
                  value: 'male',
                },
                {
                  inline: true,
                  name: 'Age',
                  value: '420',
                },
                {
                  inline: true,
                  name: 'Media',
                  value: 'anilist:5',
                },
                {
                  inline: true,
                  name: 'Role',
                  value: 'Main',
                },
                {
                  inline: true,
                  name: 'Popularity',
                  value: '10',
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });
});

Deno.test('media characters', async (test) => {
  await test.step('normal', async () => {
    const characterStub = stub(
      packs,
      'mediaCharacters',
      () =>
        Promise.resolve({
          next: true,
          media: {
            id: '1',
            packId: 'pack-id',
            type: MediaType.Anime,
            title: {
              english: 'title',
            },
          },
          character: {
            id: '2',
            packId: 'pack-id',
            name: {
              english: 'name',
            },
          },
        }),
    );

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {},
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      const message = await search.mediaCharacters({
        id: 'pack-id:1',
        guildId: 'guild_id',
        index: 0,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: '_',
                disabled: true,
                label: '1',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'mcharacters=pack-id:1=1=next',
                label: 'Next',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'media=pack-id:1',
                label: '/anime',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
              fields: [
                {
                  name: 'name',
                  value: '\u200B',
                },
              ],
              image: {
                url: 'undefined/external/',
              },
            },
          ],
        },
      });
    } finally {
      characterStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('with owner', async () => {
    const characterStub = stub(
      packs,
      'mediaCharacters',
      () =>
        Promise.resolve({
          next: true,
          media: {
            id: '1',
            packId: 'pack-id',
            type: MediaType.Manga,
            title: {
              english: 'title',
            },
          },
          character: {
            id: '2',
            packId: 'pack-id',
            name: {
              english: 'name',
            },
          },
        }),
    );

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              findCharacter: {
                user: {
                  id: 'user_id',
                },
                id: 'character_id',
                mediaId: 'media_id',
                rating: 3,
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      const message = await search.mediaCharacters({
        id: 'pack-id:1',
        userId: 'user_id',
        guildId: 'guild_id',
        index: 0,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: '_',
                disabled: true,
                label: '1',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'mcharacters=pack-id:1=1=next',
                label: 'Next',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'passign=character_id',
                label: '/p assign',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'media=pack-id:1',
                label: '/manga',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [
            {
              type: 'rich',
              description:
                '<@user_id>\n\n<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466>',
              fields: [
                {
                  name: 'name',
                  value: '\u200B',
                },
              ],
              image: {
                url: 'undefined/external/',
              },
            },
          ],
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      characterStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('disabled character', async () => {
    const characterStub = stub(
      packs,
      'mediaCharacters',
      () =>
        Promise.resolve({
          next: false,
          media: {
            id: '1',
            type: MediaType.Anime,
            title: {
              english: 'title',
            },
          },
          character: {
            id: '2',
            name: {
              english: 'name',
            },
          },
        }),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => true);

    try {
      await assertRejects(
        async () =>
          await search.mediaCharacters({
            id: 'pack-id:1',
            guildId: 'guild_id',
            index: 0,
          }),
        NonFetalError,
        'This character was removed or disabled',
      );
    } finally {
      characterStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('no characters', async () => {
    const characterStub = stub(
      packs,
      'mediaCharacters',
      () =>
        Promise.resolve({
          next: false,
          media: {
            id: '1',
            type: MediaType.Anime,
            title: {
              english: 'title',
            },
          },
        }),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    try {
      await assertRejects(
        async () =>
          await search.mediaCharacters({
            id: 'pack-id:1',
            guildId: 'guild_id',
            index: 0,
          }),
        NonFetalError,
        'title contains no characters',
      );
    } finally {
      characterStub.restore();
      listStub.restore();
    }
  });

  await test.step('no more characters', async () => {
    const characterStub = stub(
      packs,
      'mediaCharacters',
      () =>
        Promise.resolve({
          next: false,
          media: {
            id: '1',
            type: MediaType.Anime,
            title: {
              english: 'title',
            },
          },
        }),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    try {
      await assertRejects(
        async () =>
          await search.mediaCharacters({
            id: 'pack-id:1',
            guildId: 'guild_id',
            index: 1,
          }),
        NonFetalError,
        'title contains no more characters',
      );
    } finally {
      characterStub.restore();
      listStub.restore();
    }
  });

  await test.step('not found', async () => {
    const characterStub = stub(
      packs,
      'mediaCharacters',
      () =>
        Promise.resolve({
          next: false,
        }),
    );

    try {
      await assertRejects(
        async () =>
          await search.mediaCharacters({
            id: 'pack-id:1',
            guildId: 'guild_id',
            index: 0,
          }),
        Error,
        '404',
      );
    } finally {
      characterStub.restore();
    }
  });
});

Deno.test('/collection stars', async (test) => {
  await test.step('normal', async () => {
    const media: AniListMedia = {
      id: '2',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'name',
      },
      popularity: 0,
    };

    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'title',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: media,
        }],
      },
    };

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                getUserStars: {
                  anchor: 'anchor',
                  character: {
                    id: 'anilist:1',
                    mediaId: 'anilist:2',
                    rating: 4,
                  },
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
                  characters: [character],
                  media: [media],
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
                  characters: [character],
                  media: [media],
                },
              },
            }))),
        } as any,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      const message = await user.stars({
        userId: 'user_id',
        guildId: 'guild_id',
        stars: 5,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'cstars=5=user_id=anchor=prev',
                label: 'Prev',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'cstars=5=user_id=anchor=next',
                label: 'Next',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'passign=anilist:1',
                label: '/p assign',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'media=anilist:2',
                label: '/anime',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466>',
              fields: [
                {
                  name: 'name',
                  value: '**title**',
                },
              ],
              image: {
                url: 'undefined/external/',
              },
            },
          ],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('different user', async () => {
    const media: AniListMedia = {
      id: '2',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'name',
      },
      popularity: 0,
    };

    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'title',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: media,
        }],
      },
    };

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                getUserStars: {
                  anchor: 'anchor',
                  character: {
                    id: 'anilist:1',
                    mediaId: 'anilist:2',
                    rating: 4,
                  },
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
                  characters: [character],
                  media: [media],
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
                  characters: [character],
                  media: [media],
                },
              },
            }))),
        } as any,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      const message = await user.stars({
        nick: 'nickname',
        userId: 'user_id',
        guildId: 'guild_id',
        stars: 5,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'cstars=5=user_id=anchor=prev',
                label: 'Prev',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'cstars=5=user_id=anchor=next',
                label: 'Next',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'media=anilist:2',
                label: '/anime',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466>',
              fields: [
                {
                  name: 'name',
                  value: '**title**',
                },
              ],
              image: {
                url: 'undefined/external/',
              },
            },
          ],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('media disabled', async () => {
    const media: AniListMedia = {
      id: '2',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'name',
      },
      popularity: 0,
    };

    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'title',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: media,
        }],
      },
    };

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                getUserStars: {
                  anchor: 'anchor',
                  character: {
                    id: 'anilist:1',
                    mediaId: 'anilist:2',
                    rating: 4,
                  },
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
                  characters: [character],
                  media: [media],
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
                  characters: [character],
                  media: [media],
                },
              },
            }))),
        } as any,
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
      returnsNext([true, true]),
    );

    try {
      const message = await user.stars({
        userId: 'user_id',
        guildId: 'guild_id',
        stars: 5,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'cstars=5=user_id=anchor=prev',
                label: 'Prev',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'cstars=5=user_id=anchor=next',
                label: 'Next',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [
            {
              type: 'rich',
              description: 'This media was removed or disabled',
            },
          ],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('character disabled', async () => {
    const media: AniListMedia = {
      id: '2',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'name',
      },
      popularity: 0,
    };

    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'title',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: media,
        }],
      },
    };

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                getUserStars: {
                  anchor: 'anchor',
                  character: {
                    id: 'anilist:1',
                    mediaId: 'anilist:2',
                    rating: 4,
                  },
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
                  characters: [character],
                  media: [media],
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
                  characters: [character],
                  media: [media],
                },
              },
            }))),
        } as any,
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
      returnsNext([false, true]),
    );

    try {
      const message = await user.stars({
        userId: 'user_id',
        guildId: 'guild_id',
        stars: 5,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'cstars=5=user_id=anchor=prev',
                label: 'Prev',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'cstars=5=user_id=anchor=next',
                label: 'Next',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [
            {
              type: 'rich',
              description: 'This character was removed or disabled',
            },
          ],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('no characters (Dave)', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: { getUserStars: {} },
            }))),
        } as any,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      const message = await user.stars({
        nick: 'Dave',
        userId: 'user_id',
        guildId: 'guild_id',
        stars: 5,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description:
                'Dave doesn\'t have any 5<:smol_star:1088427421096751224>characters',
            },
          ],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('no characters (Self)', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: { getUserStars: {} },
            }))),
        } as any,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      const message = await user.stars({
        userId: 'user_id',
        guildId: 'guild_id',
        stars: 5,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'gacha=user_id',
                label: '/gacha',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [
            {
              type: 'rich',
              description:
                'You don\'t have any 5<:smol_star:1088427421096751224>characters',
            },
          ],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });
});

Deno.test('/collection media', async (test) => {
  await test.step('normal', async () => {
    const media: AniListMedia = {
      id: '2',
      type: MediaType.Manga,
      title: {
        english: 'title',
      },
      popularity: 0,
    };

    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'name',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: media,
        }],
      },
    };

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
                  media: [media],
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                getUserMedia: {
                  anchor: 'anchor',
                  character: {
                    id: 'anilist:1',
                    mediaId: 'anilist:2',
                    rating: 4,
                  },
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
                  characters: [character],
                  media: [media],
                },
              },
            }))),
        } as any,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      const message = await user.media({
        userId: 'user_id',
        guildId: 'guild_id',
        id: 'anilist:2',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'cmedia=anilist:2=user_id=anchor=prev',
                label: 'Prev',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'cmedia=anilist:2=user_id=anchor=next',
                label: 'Next',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'passign=anilist:1',
                label: '/p assign',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'media=anilist:2',
                label: '/manga',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466>',
              fields: [
                {
                  name: 'name',
                  value: '\u200B',
                },
              ],
              image: {
                url: 'undefined/external/',
              },
            },
          ],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('different user', async () => {
    const media: AniListMedia = {
      id: '2',
      type: MediaType.Manga,
      title: {
        english: 'title',
      },
      popularity: 0,
    };

    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'name',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: media,
        }],
      },
    };

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
                  media: [media],
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                getUserMedia: {
                  anchor: 'anchor',
                  character: {
                    id: 'anilist:1',
                    mediaId: 'anilist:2',
                    rating: 4,
                  },
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
                  characters: [character],
                  media: [media],
                },
              },
            }))),
        } as any,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      const message = await user.media({
        nick: 'nickname',
        userId: 'user_id',
        guildId: 'guild_id',
        id: 'anilist:2',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'cmedia=anilist:2=user_id=anchor=prev',
                label: 'Prev',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'cmedia=anilist:2=user_id=anchor=next',
                label: 'Next',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'media=anilist:2',
                label: '/manga',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466>',
              fields: [
                {
                  name: 'name',
                  value: '\u200B',
                },
              ],
              image: {
                url: 'undefined/external/',
              },
            },
          ],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('media disabled', async () => {
    const media: AniListMedia = {
      id: '2',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'name',
      },
      popularity: 0,
    };

    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'title',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: media,
        }],
      },
    };

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
                  media: [media],
                },
              },
            }))),
        } as any,
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
      returnsNext([true, true]),
    );

    try {
      await assertRejects(
        async () =>
          await user.media({
            userId: 'user_id',
            guildId: 'guild_id',
            id: 'anilist:2',
          }),
        Error,
        '404',
      );
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('character disabled', async () => {
    const media: AniListMedia = {
      id: '2',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'name',
      },
      popularity: 0,
    };

    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'title',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: media,
        }],
      },
    };

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
                  media: [media],
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                getUserMedia: {
                  anchor: 'anchor',
                  character: {
                    id: 'anilist:1',
                    mediaId: 'anilist:2',
                    rating: 4,
                  },
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
                  characters: [character],
                  media: [media],
                },
              },
            }))),
        } as any,
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
      returnsNext([false, true]),
    );

    try {
      const message = await user.media({
        userId: 'user_id',
        guildId: 'guild_id',
        id: 'anilist:2',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'cmedia=anilist:2=user_id=anchor=prev',
                label: 'Prev',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'cmedia=anilist:2=user_id=anchor=next',
                label: 'Next',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [
            {
              type: 'rich',
              description: 'This character was removed or disabled',
            },
          ],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('no characters (Dave)', async () => {
    const media: AniListMedia = {
      id: '2',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'name',
      },
      popularity: 0,
    };

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
                  media: [media],
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: { getUserMedia: {} },
            }))),
        } as any,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      const message = await user.media({
        nick: 'Dave',
        userId: 'user_id',
        guildId: 'guild_id',
        id: 'anilist:2',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: 'Dave doesn\'t have any name characters',
            },
          ],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('no characters (Self)', async () => {
    const media: AniListMedia = {
      id: '2',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'name',
      },
      popularity: 0,
    };

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
                  media: [media],
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: { getUserMedia: {} },
            }))),
        } as any,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      const message = await user.media({
        userId: 'user_id',
        guildId: 'guild_id',
        id: 'anilist:2',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'gacha=user_id',
                label: '/gacha',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [
            {
              type: 'rich',
              description: 'You don\'t have any name characters',
            },
          ],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });
});

Deno.test('/collection list', async (test) => {
  await test.step('normal', async () => {
    const media: AniListMedia[] = [
      {
        id: '2',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
      },
      {
        id: '4',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
      },
      {
        id: '6',
        type: MediaType.Anime,
        title: {
          english: 'title 3',
        },
      },
      {
        id: '8',
        type: MediaType.Anime,
        title: {
          english: 'title 4',
        },
      },
      {
        id: '10',
        type: MediaType.Anime,
        title: {
          english: 'title 5',
        },
      },
      {
        id: '12',
        type: MediaType.Anime,
        title: {
          english: 'title 6',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
      },
      {
        id: '3',
        name: {
          full: 'character 2',
        },
      },
      {
        id: '5',
        name: {
          full: 'character 3',
        },
      },
      {
        id: '7',
        name: {
          full: 'character 4',
        },
      },
      {
        id: '9',
        name: {
          full: 'character 5',
        },
      },
      {
        id: '11',
        name: {
          full: 'character 6',
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
                  characters: [
                    {
                      id: 'anilist:1',
                      mediaId: 'anilist:2',
                      rating: 1,
                    },
                    {
                      id: 'anilist:3',
                      mediaId: 'anilist:4',
                      rating: 2,
                    },
                    {
                      id: 'anilist:5',
                      mediaId: 'anilist:6',
                      rating: 3,
                    },
                    {
                      id: 'anilist:7',
                      mediaId: 'anilist:8',
                      rating: 4,
                    },
                    {
                      id: 'anilist:9',
                      mediaId: 'anilist:10',
                      rating: 5,
                    },
                    {
                      id: 'anilist:11',
                      mediaId: 'anilist:12',
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
                  media,
                  characters,
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
                  media,
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
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

      await timeStub.tickAsync(0);

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
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'clist=user_id==1=prev',
                  label: 'Prev',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: '_',
                  disabled: true,
                  label: '1/2',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'clist=user_id==1=next',
                  label: 'Next',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
          embeds: [
            {
              type: 'rich',
              fields: [
                {
                  inline: false,
                  name: 'title 1',
                  value: '1<:smol_star:1088427421096751224> character 1',
                },
                {
                  inline: false,
                  name: 'title 2',
                  value: '2<:smol_star:1088427421096751224> character 2',
                },
                {
                  inline: false,
                  name: 'title 3',
                  value: '3<:smol_star:1088427421096751224> character 3',
                },
                {
                  inline: false,
                  name: 'title 4',
                  value: '4<:smol_star:1088427421096751224> character 4',
                },
                {
                  inline: false,
                  name: 'title 5',
                  value: '5<:smol_star:1088427421096751224> character 5',
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('normal (Nicknames)', async () => {
    const media: AniListMedia[] = [
      {
        id: '2',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
      },
      {
        id: '4',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
      },
      {
        id: '6',
        type: MediaType.Anime,
        title: {
          english: 'title 3',
        },
      },
      {
        id: '8',
        type: MediaType.Anime,
        title: {
          english: 'title 4',
        },
      },
      {
        id: '10',
        type: MediaType.Anime,
        title: {
          english: 'title 5',
        },
      },
      {
        id: '12',
        type: MediaType.Anime,
        title: {
          english: 'title 6',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
      },
      {
        id: '3',
        name: {
          full: 'character 2',
        },
      },
      {
        id: '5',
        name: {
          full: 'character 3',
        },
      },
      {
        id: '7',
        name: {
          full: 'character 4',
        },
      },
      {
        id: '9',
        name: {
          full: 'character 5',
        },
      },
      {
        id: '11',
        name: {
          full: 'character 6',
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
                  characters: [
                    {
                      id: 'anilist:1',
                      mediaId: 'anilist:2',
                      nickname: 'Nickname 2',
                      rating: 1,
                    },
                    {
                      id: 'anilist:3',
                      mediaId: 'anilist:4',
                      rating: 2,
                    },
                    {
                      id: 'anilist:5',
                      mediaId: 'anilist:6',
                      nickname: 'Nickname 1',
                      rating: 3,
                    },
                    {
                      id: 'anilist:7',
                      mediaId: 'anilist:8',
                      rating: 4,
                    },
                    {
                      id: 'anilist:9',
                      mediaId: 'anilist:10',
                      rating: 5,
                    },
                    {
                      id: 'anilist:11',
                      mediaId: 'anilist:12',
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
                  media,
                  characters,
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
                  media,
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
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

      await timeStub.tickAsync(0);

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
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'clist=user_id==1=prev',
                  label: 'Prev',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: '_',
                  disabled: true,
                  label: '1/2',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'clist=user_id==1=next',
                  label: 'Next',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
          embeds: [
            {
              type: 'rich',
              fields: [
                {
                  inline: false,
                  name: 'title 1',
                  value: '1<:smol_star:1088427421096751224> Nickname 2',
                },
                {
                  inline: false,
                  name: 'title 2',
                  value: '2<:smol_star:1088427421096751224> character 2',
                },
                {
                  inline: false,
                  name: 'title 3',
                  value: '3<:smol_star:1088427421096751224> Nickname 1',
                },
                {
                  inline: false,
                  name: 'title 4',
                  value: '4<:smol_star:1088427421096751224> character 4',
                },
                {
                  inline: false,
                  name: 'title 5',
                  value: '5<:smol_star:1088427421096751224> character 5',
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('normal (Ratings Filter)', async () => {
    const media: AniListMedia[] = [
      {
        id: '4',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
      },
      {
        id: '6',
        type: MediaType.Anime,
        title: {
          english: 'title 3',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '3',
        name: {
          full: 'character 2',
        },
      },
      {
        id: '5',
        name: {
          full: 'character 3',
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
                  characters: [
                    {
                      id: 'anilist:1',
                      mediaId: 'anilist:2',
                      rating: 1,
                    },
                    {
                      id: 'anilist:3',
                      mediaId: 'anilist:4',
                      rating: 2,
                    },
                    {
                      id: 'anilist:5',
                      mediaId: 'anilist:6',
                      rating: 2,
                    },
                    {
                      id: 'anilist:7',
                      mediaId: 'anilist:8',
                      rating: 3,
                    },
                    {
                      id: 'anilist:9',
                      mediaId: 'anilist:10',
                      rating: 4,
                    },
                    {
                      id: 'anilist:11',
                      mediaId: 'anilist:12',
                      rating: 5,
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
                  media,
                  characters,
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
                  media,
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        filter: 2,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
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

      await timeStub.tickAsync(0);

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
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'clist=user_id=2=0=prev',
                  label: 'Prev',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: '_',
                  disabled: true,
                  label: '1/1',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'clist=user_id=2=0=next',
                  label: 'Next',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
          embeds: [
            {
              type: 'rich',
              fields: [
                {
                  inline: false,
                  name: 'title 2',
                  value: '2<:smol_star:1088427421096751224> character 2',
                },
                {
                  inline: false,
                  name: 'title 3',
                  value: '2<:smol_star:1088427421096751224> character 3',
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('different user', async () => {
    const media: AniListMedia[] = [
      {
        id: '2',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
      },
      {
        id: '4',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
      },
      {
        id: '6',
        type: MediaType.Anime,
        title: {
          english: 'title 3',
        },
      },
      {
        id: '8',
        type: MediaType.Anime,
        title: {
          english: 'title 4',
        },
      },
      {
        id: '10',
        type: MediaType.Anime,
        title: {
          english: 'title 5',
        },
      },
      {
        id: '12',
        type: MediaType.Anime,
        title: {
          english: 'title 6',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
      },
      {
        id: '3',
        name: {
          full: 'character 2',
        },
      },
      {
        id: '5',
        name: {
          full: 'character 3',
        },
      },
      {
        id: '7',
        name: {
          full: 'character 4',
        },
      },
      {
        id: '9',
        name: {
          full: 'character 5',
        },
      },
      {
        id: '11',
        name: {
          full: 'character 6',
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
                  characters: [
                    {
                      id: 'anilist:1',
                      mediaId: 'anilist:2',
                      rating: 1,
                    },
                    {
                      id: 'anilist:3',
                      mediaId: 'anilist:4',
                      rating: 2,
                    },
                    {
                      id: 'anilist:5',
                      mediaId: 'anilist:6',
                      rating: 3,
                    },
                    {
                      id: 'anilist:7',
                      mediaId: 'anilist:8',
                      rating: 4,
                    },
                    {
                      id: 'anilist:9',
                      mediaId: 'anilist:10',
                      rating: 5,
                    },
                    {
                      id: 'anilist:11',
                      mediaId: 'anilist:12',
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
                  media,
                  characters,
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
                  media,
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'another_user_id',
        guildId: 'guild_id',
        token: 'test_token',
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

      await timeStub.tickAsync(0);

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
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'clist=another_user_id==1=prev',
                  label: 'Prev',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: '_',
                  disabled: true,
                  label: '1/2',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'clist=another_user_id==1=next',
                  label: 'Next',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
          embeds: [
            {
              type: 'rich',
              fields: [
                {
                  inline: false,
                  name: 'title 1',
                  value: '1<:smol_star:1088427421096751224> character 1',
                },
                {
                  inline: false,
                  name: 'title 2',
                  value: '2<:smol_star:1088427421096751224> character 2',
                },
                {
                  inline: false,
                  name: 'title 3',
                  value: '3<:smol_star:1088427421096751224> character 3',
                },
                {
                  inline: false,
                  name: 'title 4',
                  value: '4<:smol_star:1088427421096751224> character 4',
                },
                {
                  inline: false,
                  name: 'title 5',
                  value: '5<:smol_star:1088427421096751224> character 5',
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('media disabled', async () => {
    const media: AniListMedia[] = [
      {
        id: '1',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
      },
      {
        id: '2',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '3',
        name: {
          full: 'character 1',
        },
      },
      {
        id: '4',
        name: {
          full: 'character 2',
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
                  characters: [
                    {
                      id: 'anilist:3',
                      mediaId: 'anilist:1',
                      rating: 1,
                    },
                    {
                      id: 'anilist:4',
                      mediaId: 'anilist:2',
                      rating: 2,
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
                  media,
                  characters,
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
                  media,
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
        false,
        true,
        false,
        false,
      ]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
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

      await timeStub.tickAsync(0);

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
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'clist=user_id==0=prev',
                  label: 'Prev',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: '_',
                  disabled: true,
                  label: '1/1',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'clist=user_id==0=next',
                  label: 'Next',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
          embeds: [
            {
              type: 'rich',
              fields: [
                {
                  inline: false,
                  name: 'title 1',
                  value: '1<:smol_star:1088427421096751224> character 1',
                },
                {
                  inline: false,
                  name: 'Media disabled or removed',
                  value: '\u200B',
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('character disabled', async () => {
    const media: AniListMedia[] = [
      {
        id: '1',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
      },
      {
        id: '2',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '3',
        name: {
          full: 'character 1',
        },
      },
      {
        id: '4',
        name: {
          full: 'character 2',
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
                  characters: [
                    {
                      id: 'anilist:3',
                      mediaId: 'anilist:1',
                      rating: 1,
                    },
                    {
                      id: 'anilist:4',
                      mediaId: 'anilist:2',
                      rating: 2,
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
                  media,
                  characters,
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
                  media,
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
        false,
        false,
        false,
        true,
      ]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
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

      await timeStub.tickAsync(0);

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
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'clist=user_id==0=prev',
                  label: 'Prev',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: '_',
                  disabled: true,
                  label: '1/1',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'clist=user_id==0=next',
                  label: 'Next',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
          embeds: [
            {
              type: 'rich',
              fields: [
                {
                  inline: false,
                  name: 'title 1',
                  value: '1<:smol_star:1088427421096751224> character 1',
                },
                {
                  inline: false,
                  name: 'title 2',
                  value: '_1 disabled characters_',
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('no characters (Dave)', async () => {
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        nick: 'Dave',
        userId: 'another_user_id',
        guildId: 'guild_id',
        token: 'test_token',
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

      await timeStub.tickAsync(0);

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
            description: 'Dave doesn\'t have any characters',
          }],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('no characters (Self)', async () => {
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
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

      await timeStub.tickAsync(0);

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
            components: [{
              custom_id: 'gacha=user_id',
              label: '/gacha',
              style: 2,
              type: 2,
            }],
          }],
          embeds: [{
            type: 'rich',
            description: 'You don\'t have any characters',
          }],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('no characters (Self) (Ratings Filter)', async () => {
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        filter: 3,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
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

      await timeStub.tickAsync(0);

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
            components: [{
              custom_id: 'gacha=user_id',
              label: '/gacha',
              style: 2,
              type: 2,
            }],
          }],
          embeds: [{
            type: 'rich',
            description:
              'You don\'t have any 3<:smol_star:1088427421096751224> characters',
          }],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });
});

Deno.test('/found', async (test) => {
  await test.step('normal', async () => {
    const media: AniListMedia = {
      id: '2',
      type: MediaType.Manga,
      title: {
        english: 'title',
      },
      popularity: 0,
    };

    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'name',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: media,
        }],
      },
    };

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
                  media: [media],
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                findMedia: {
                  anchor: 'anchor',
                  character: {
                    id: 'anilist:1',
                    mediaId: 'anilist:2',
                    rating: 4,
                    user: {
                      id: 'another_user_id',
                    },
                  },
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
                  characters: [character],
                  media: [media],
                },
              },
            }))),
        } as any,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      const message = await search.mediaFound({
        guildId: 'guild_id',
        id: 'anilist:2',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'found=anilist:2==anchor=prev',
                label: 'Prev',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'found=anilist:2==anchor=next',
                label: 'Next',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'media=anilist:2',
                label: '/manga',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [
            {
              type: 'rich',
              description:
                '<@another_user_id>\n\n<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466>',
              fields: [
                {
                  name: 'name',
                  value: '\u200B',
                },
              ],
              image: {
                url: 'undefined/external/',
              },
            },
          ],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('media disabled', async () => {
    const media: AniListMedia = {
      id: '2',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'name',
      },
      popularity: 0,
    };

    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'title',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: media,
        }],
      },
    };

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
                  media: [media],
                },
              },
            }))),
        } as any,
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
      returnsNext([true, true]),
    );

    try {
      await assertRejects(
        async () =>
          await search.mediaFound({
            guildId: 'guild_id',
            id: 'anilist:2',
          }),
        Error,
        '404',
      );
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('character disabled', async () => {
    const media: AniListMedia = {
      id: '2',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'name',
      },
      popularity: 0,
    };

    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'title',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: media,
        }],
      },
    };

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
                  media: [media],
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                findMedia: {
                  anchor: 'anchor',
                  character: {
                    id: 'anilist:1',
                    mediaId: 'anilist:2',
                    rating: 4,
                    user: {
                      id: 'another_user_id',
                    },
                  },
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
                  characters: [character],
                  media: [media],
                },
              },
            }))),
        } as any,
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
      returnsNext([false, true]),
    );

    try {
      const message = await search.mediaFound({
        guildId: 'guild_id',
        id: 'anilist:2',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'found=anilist:2==anchor=prev',
                label: 'Prev',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'found=anilist:2==anchor=next',
                label: 'Next',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [
            {
              type: 'rich',
              description: 'This character was removed or disabled',
            },
          ],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('no characters', async () => {
    const media: AniListMedia = {
      id: '2',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'name',
      },
      popularity: 0,
    };

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
                  media: [media],
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: { findMedia: {} },
            }))),
        } as any,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      const message = await search.mediaFound({
        guildId: 'guild_id',
        id: 'anilist:2',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: 'No one has found any name characters',
            },
          ],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });
});

Deno.test('/gacha', async (test) => {
  await test.step('normal', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      popularity: 100,
      title: {
        english: 'title',
      },
      images: [{
        url: 'media_image_url',
      }],
    };

    const character: Character = {
      id: '2',
      packId: 'pack-id-2',
      name: {
        english: 'name',
      },
      images: [{
        url: 'character_image_url',
      }],
      media: {
        edges: [{
          role: CharacterRole.Main,
          node: media,
        }],
      },
    };

    const pull: Pull = {
      media,
      character,
      popularityChance: 0,
      popularityGreater: 0,
      popularityLesser: 100,
      rating: new Rating({ popularity: 100 }),
      pool: 1,
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const pullStub = stub(
      gacha,
      'rngPull',
      returnsNext([Promise.resolve(pull)]),
    );

    config.gacha = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = gacha.start({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
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

      await timeStub.tickAsync(0);

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
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/stars/1.gif',
            },
          }],
          components: [],
          attachments: [],
        },
      );

      await timeStub.tickAsync(6000);

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
          embeds: [{
            type: 'rich',
            description: new Rating({ popularity: 100 }).emotes,
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
                custom_id: 'gacha=user_id',
                label: '/gacha',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'character=pack-id-2:2=1',
                label: '/character',
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
      delete config.gacha;

      timeStub.restore();
      pullStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('guarantees', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      popularity: 100,
      title: {
        english: 'title',
      },
      images: [{
        url: 'media_image_url',
      }],
    };

    const character: Character = {
      id: '2',
      packId: 'pack-id-2',
      name: {
        english: 'name',
      },
      images: [{
        url: 'character_image_url',
      }],
      media: {
        edges: [{
          role: CharacterRole.Main,
          node: media,
        }],
      },
    };

    const pull: Pull = {
      media,
      character,
      popularityChance: 0,
      popularityGreater: 0,
      popularityLesser: 100,
      guarantees: [3, 4, 3],
      rating: new Rating({ popularity: 100 }),
      pool: 1,
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const pullStub = stub(
      gacha,
      'rngPull',
      returnsNext([Promise.resolve(pull)]),
    );

    config.gacha = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = gacha.start({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        guarantee: 5,
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

      await timeStub.tickAsync(0);

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
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/stars/1.gif',
            },
          }],
          components: [],
          attachments: [],
        },
      );

      await timeStub.tickAsync(6000);

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
          embeds: [{
            type: 'rich',
            description: new Rating({ popularity: 100 }).emotes,
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
                custom_id: 'pull=user_id=4',
                label: '/pull 4',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'character=pack-id-2:2=1',
                label: '/character',
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
      delete config.gacha;

      timeStub.restore();
      pullStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('mention', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      popularity: 100,
      title: {
        english: 'title',
      },
      images: [{
        url: 'media_image_url',
      }],
    };

    const character: Character = {
      id: '2',
      packId: 'pack-id-2',
      name: {
        english: 'name',
      },
      images: [{
        url: 'character_image_url',
      }],
      media: {
        edges: [{
          role: CharacterRole.Main,
          node: media,
        }],
      },
    };

    const pull: Pull = {
      media,
      character,
      popularityChance: 0,
      popularityGreater: 0,
      popularityLesser: 100,
      rating: new Rating({ popularity: 100 }),
      pool: 1,
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const pullStub = stub(
      gacha,
      'rngPull',
      returnsNext([Promise.resolve(pull)]),
    );

    config.gacha = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = gacha.start({
        mention: true,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          content: '<@user_id>',
          allowed_mentions: { parse: [] },
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

      await timeStub.tickAsync(0);

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
          content: '<@user_id>',
          allowed_mentions: { parse: [] },
          components: [],
          attachments: [],
          embeds: [{
            type: 'rich',
            title: 'title',
            image: {
              url: 'http://localhost:8000/external/media_image_url?size=medium',
            },
          }],
        },
      );

      await timeStub.tickAsync(4000);

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
          content: '<@user_id>',
          allowed_mentions: { parse: [] },
          components: [],
          attachments: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/stars/1.gif',
            },
          }],
        },
      );

      await timeStub.tickAsync(6000);

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
          content: '<@user_id>',
          allowed_mentions: { parse: [] },
          attachments: [],
          embeds: [{
            type: 'rich',
            description: new Rating({ popularity: 100 }).emotes,
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
                custom_id: 'gacha=user_id',
                label: '/gacha',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'character=pack-id-2:2=1',
                label: '/character',
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
      delete config.gacha;

      timeStub.restore();
      pullStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('quiet', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      popularity: 100,
      title: {
        english: 'title',
      },
      images: [{
        url: 'media_image_url',
      }],
    };

    const character: Character = {
      id: '2',
      packId: 'pack-id-2',
      name: {
        english: 'name',
      },
      images: [{
        url: 'character_image_url',
      }],
      media: {
        edges: [{
          role: CharacterRole.Main,
          node: media,
        }],
      },
    };

    const pull: Pull = {
      media,
      character,
      popularityChance: 0,
      popularityGreater: 0,
      popularityLesser: 100,
      rating: new Rating({ popularity: 100 }),
      pool: 1,
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const pullStub = stub(
      gacha,
      'rngPull',
      returnsNext([Promise.resolve(pull)]),
    );

    config.gacha = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = gacha.start({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        quiet: true,
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

      await timeStub.tickAsync(0);

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
          attachments: [],
          embeds: [{
            type: 'rich',
            description: new Rating({ popularity: 100 }).emotes,
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
                custom_id: 'q=user_id',
                label: '/q',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'character=pack-id-2:2=1',
                label: '/character',
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
      delete config.gacha;

      timeStub.restore();
      pullStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('no pulls available', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const pullStub = stub(
      gacha,
      'rngPull',
      // deno-lint-ignore require-await
      async () => {
        throw new NoPullsError('2023-02-07T00:53:09.199Z');
      },
    );

    config.gacha = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = gacha.start({
        token: 'test_token',
        guildId: 'guild_id',
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

      await timeStub.tickAsync(0);

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
          embeds: [
            {
              type: 'rich',
              description: 'You don\'t have any more pulls!',
            },
            { type: 'rich', description: '_+1 pull <t:1675732989:R>_' },
          ],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.gacha;

      timeStub.restore();
      pullStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('no guaranteed', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const pullStub = stub(
      gacha,
      'rngPull',
      // deno-lint-ignore require-await
      async () => {
        throw new Error('403');
      },
    );

    config.gacha = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = gacha.start({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        guarantee: 5,
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

      await timeStub.tickAsync(0);

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
          attachments: [],
          components: [{
            type: 1,
            components: [{
              custom_id: 'buy=bguaranteed=user_id=5',
              label: '/buy guaranteed 5',
              style: 2,
              type: 2,
            }],
          }],
          embeds: [
            {
              type: 'rich',
              description:
                'You don`t have any 5<:smol_star:1088427421096751224>pulls',
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.gacha;

      timeStub.restore();
      pullStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('no more characters', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const pullStub = stub(
      gacha,
      'rngPull',
      // deno-lint-ignore require-await
      async () => {
        throw new PoolError({} as any);
      },
    );

    config.gacha = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = gacha.start({
        token: 'test_token',
        guildId: 'guild_id',
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

      await timeStub.tickAsync(0);

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
          embeds: [
            {
              type: 'rich',
              description: 'There are no more characters left',
            },
          ],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.gacha;

      timeStub.restore();
      pullStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('no more guaranteed characters', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const pullStub = stub(
      gacha,
      'rngPull',
      // deno-lint-ignore require-await
      async () => {
        throw new PoolError({} as any);
      },
    );

    config.gacha = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = gacha.start({
        token: 'test_token',
        guildId: 'guild_id',
        guarantee: 5,
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

      await timeStub.tickAsync(0);

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
          embeds: [
            {
              type: 'rich',
              description:
                'There are no more 5<:smol_star:1088427421096751224>characters left',
            },
          ],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.gacha;

      timeStub.restore();
      pullStub.restore();
      fetchStub.restore();
    }
  });
});

Deno.test('/party view', async (test) => {
  await test.step('normal', async () => {
    const media: AniListMedia[] = [
      {
        id: '0',
        type: MediaType.Anime,
        title: {
          english: 'title',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
      {
        id: '2',
        name: {
          full: 'name 2',
        },
      },
      {
        id: '3',
        name: {
          full: 'name 3',
        },
      },
      {
        id: '4',
        name: {
          full: 'name 4',
        },
      },
      {
        id: '5',
        name: {
          full: 'name 5',
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
                      mediaId: 'anilist:0',
                      rating: 1,
                    },
                    member2: {
                      id: 'anilist:2',
                      mediaId: 'anilist:0',
                      rating: 2,
                    },
                    member3: {
                      id: 'anilist:3',
                      mediaId: 'anilist:0',
                      rating: 3,
                    },
                    member4: {
                      id: 'anilist:4',
                      mediaId: 'anilist:0',
                      rating: 4,
                    },
                    member5: {
                      id: 'anilist:5',
                      mediaId: 'anilist:0',
                      rating: 5,
                    },
                  },
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
                  media,
                  characters,
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
                  media,
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = party.view({
        userId: 'user',
        guildId: 'guild',
        token: 'test_token',
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

      await timeStub.tickAsync(0);

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
          embeds: [
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 1**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 2**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 3**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 4**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 5**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098>',
            },
          ],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      listStub.restore();
      fetchStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('unassigned members', async () => {
    const media: AniListMedia[] = [
      {
        id: '0',
        type: MediaType.Anime,
        title: {
          english: 'title',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
      {
        id: '2',
        name: {
          full: 'name 2',
        },
      },
      {
        id: '3',
        name: {
          full: 'name 3',
        },
      },
      {
        id: '4',
        name: {
          full: 'name 4',
        },
      },
      {
        id: '5',
        name: {
          full: 'name 5',
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
                      mediaId: 'anilist:0',
                      rating: 1,
                    },
                    member2: {
                      id: 'anilist:2',
                      mediaId: 'anilist:0',
                      rating: 2,
                    },
                    member5: {
                      id: 'anilist:5',
                      mediaId: 'anilist:0',
                      rating: 5,
                    },
                  },
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
                  media,
                  characters,
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
                  media,
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = party.view({
        userId: 'user',
        guildId: 'guild',
        token: 'test_token',
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

      await timeStub.tickAsync(0);

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
          embeds: [
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 1**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 2**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
            },
            {
              type: 'rich',
              description: 'Unassigned',
            },
            {
              type: 'rich',
              description: 'Unassigned',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 5**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098>',
            },
          ],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      listStub.restore();
      fetchStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('disabled characters', async () => {
    const media: AniListMedia[] = [
      {
        id: '0',
        type: MediaType.Anime,
        title: {
          english: 'title',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
      {
        id: '2',
        name: {
          full: 'name 2',
        },
      },
      {
        id: '3',
        name: {
          full: 'name 3',
        },
      },
      {
        id: '4',
        name: {
          full: 'name 4',
        },
      },
      {
        id: '5',
        name: {
          full: 'name 5',
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
                      mediaId: 'anilist:0',
                      rating: 1,
                    },
                    member2: {
                      id: 'anilist:2',
                      mediaId: 'anilist:0',
                      rating: 2,
                    },
                    member3: {
                      id: 'anilist:3',
                      mediaId: 'anilist:0',
                      rating: 3,
                    },
                    member4: {
                      id: 'anilist:4',
                      mediaId: 'anilist:0',
                      rating: 4,
                    },
                    member5: {
                      id: 'anilist:5',
                      mediaId: 'anilist:0',
                      rating: 5,
                    },
                  },
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
                  media,
                  characters,
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
                  media,
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
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
      ]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';
    try {
      const message = party.view({
        userId: 'user',
        guildId: 'guild',
        token: 'test_token',
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

      await timeStub.tickAsync(0);

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
          embeds: [
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 1**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 2**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 3**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466>',
            },
            {
              type: 'rich',
              description: 'This character was removed or disabled',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 5**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098>',
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
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });
});

Deno.test('/party assign', async (test) => {
  await test.step('normal', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
    ];

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
                  characters,
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                setCharacterToParty: {
                  ok: true,
                  character: {
                    id: 'anilist:1',
                    mediaId: 'anilist:0',
                    rating: 2,
                  },
                },
              },
            }))),
        } as any,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      const message = await party.assign({
        spot: 1,
        userId: 'user',
        guildId: 'guild',
        id: 'anilist:1',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              description: 'ASSIGNED',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'name 1',
                  value: '\u200B',
                },
              ],
              thumbnail: {
                url: 'undefined/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
            },
          ],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'character=anilist:1',
                label: '/character',
                style: 2,
                type: 2,
              },
            ],
          }],
          attachments: [],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('character not found', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
    ];

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
                  characters,
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                setCharacterToParty: {
                  ok: false,
                  error: 'CHARACTER_NOT_FOUND',
                },
              },
            }))),
        } as any,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      const message = await party.assign({
        spot: 1,
        userId: 'user',
        guildId: 'guild',
        id: 'anilist:1',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          flags: 64,
          embeds: [
            {
              type: 'rich',
              description: 'name 1 hasn\'t been found by anyone yet.',
            },
          ],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'character=anilist:1',
                label: '/character',
                style: 2,
                type: 2,
              },
            ],
          }],
          attachments: [],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('character not owned', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
    ];

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
                  characters,
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                setCharacterToParty: {
                  ok: false,
                  error: 'CHARACTER_NOT_OWNED',
                  character: {
                    id: 'anilist:1',
                    mediaId: 'anilist:0',
                    rating: 2,
                    user: {
                      id: 'user_2',
                    },
                  },
                },
              },
            }))),
        } as any,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      const message = await party.assign({
        spot: 1,
        userId: 'user',
        guildId: 'guild',
        id: 'anilist:1',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          flags: 64,
          embeds: [
            {
              type: 'rich',
              description:
                'name 1 is owned by <@user_2> and cannot be assigned to your party.',
            },
          ],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'character=anilist:1',
                label: '/character',
                style: 2,
                type: 2,
              },
            ],
          }],
          attachments: [],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });
});

Deno.test('/party swap', async (test) => {
  await test.step('normal', async () => {
    const media: AniListMedia[] = [
      {
        id: '0',
        type: MediaType.Anime,
        title: {
          english: 'title',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
      {
        id: '2',
        name: {
          full: 'name 2',
        },
      },
      {
        id: '3',
        name: {
          full: 'name 3',
        },
      },
      {
        id: '4',
        name: {
          full: 'name 4',
        },
      },
      {
        id: '5',
        name: {
          full: 'name 5',
        },
      },
    ];

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                swapCharactersInParty: {
                  ok: true,
                  inventory: {
                    party: {
                      member1: {
                        id: 'anilist:1',
                        mediaId: 'anilist:0',
                        rating: 1,
                      },
                      member2: {
                        id: 'anilist:2',
                        mediaId: 'anilist:0',
                        rating: 2,
                      },
                      member3: {
                        id: 'anilist:3',
                        mediaId: 'anilist:0',
                        rating: 3,
                      },
                      member4: {
                        id: 'anilist:4',
                        mediaId: 'anilist:0',
                        rating: 4,
                      },
                      member5: {
                        id: 'anilist:5',
                        mediaId: 'anilist:0',
                        rating: 5,
                      },
                    },
                  },
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
                  media,
                  characters,
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
                  media,
                  characters,
                },
              },
            }))),
        } as any,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      const message = await party.swap({
        a: 1,
        b: 2,
        userId: 'user',
        guildId: 'guild',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 1**',
                },
              ],
              thumbnail: {
                url: 'undefined/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 2**',
                },
              ],
              thumbnail: {
                url: 'undefined/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 3**',
                },
              ],
              thumbnail: {
                url: 'undefined/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 4**',
                },
              ],
              thumbnail: {
                url: 'undefined/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 5**',
                },
              ],
              thumbnail: {
                url: 'undefined/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098>',
            },
          ],
          components: [],
          attachments: [],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('unknown error', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                swapCharactersInParty: {
                  ok: false,
                  error: 'UNKNOWN_ERROR',
                },
              },
            }))),
        } as any,
      ]),
    );

    try {
      await assertRejects(
        async () =>
          await party.swap({
            a: 1,
            b: 2,
            userId: 'user',
            guildId: 'guild',
          }),
        Error,
        'UNKNOWN_ERROR',
      );
    } finally {
      fetchStub.restore();
    }
  });
});

Deno.test('/party remove', async (test) => {
  await test.step('normal', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
    ];

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                removeCharacterFromParty: {
                  ok: true,
                  character: {
                    id: 'anilist:1',
                    mediaId: 'anilist:0',
                    rating: 2,
                  },
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
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      const message = await party.remove({
        spot: 1,
        userId: 'user',
        guildId: 'guild',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              description: 'REMOVED',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'name 1',
                  value: '\u200B',
                },
              ],
              thumbnail: {
                url: 'undefined/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
            },
          ],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'character=anilist:1',
                label: '/character',
                style: 2,
                type: 2,
              },
            ],
          }],
          attachments: [],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('disabled character', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
    ];

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                removeCharacterFromParty: {
                  ok: true,
                  character: {
                    id: 'anilist:1',
                    mediaId: 'anilist:0',
                    rating: 2,
                  },
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
      returnsNext([true]),
    );

    try {
      const message = await party.remove({
        spot: 2,
        userId: 'user',
        guildId: 'guild',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              description: 'REMOVED FROM #2',
            },
            {
              type: 'rich',
              description: 'This character was removed or disabled',
            },
          ],
          components: [],
          attachments: [],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('empty spot', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
    ];

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                removeCharacterFromParty: {
                  ok: true,
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
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      const message = await party.remove({
        spot: 1,
        userId: 'user',
        guildId: 'guild',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              description:
                'There was no character assigned to this spot of the party',
            },
          ],
          components: [],
          attachments: [],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('unknown error', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                removeCharacterFromParty: {
                  ok: false,
                  error: 'UNKNOWN_ERROR',
                },
              },
            }))),
        } as any,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      await assertRejects(
        async () =>
          await party.remove({
            spot: 1,
            userId: 'user',
            guildId: 'guild',
          }),
        Error,
        'UNKNOWN_ERROR',
      );
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });
});

Deno.test('/packs [builtin-community]', async (test) => {
  await test.step('builtin packs', async () => {
    const manifest: Manifest = {
      author: 'author',
      id: 'manifest_id',
      description: 'description',
      image: 'image',
    };

    const listStub = stub(
      packs,
      'all',
      () =>
        Promise.resolve([
          { manifest, type: PackType.Builtin },
          { manifest, type: PackType.Builtin },
        ]),
    );

    try {
      const message = await packs.pages({
        type: PackType.Builtin,
        guildId: 'guild_id',
        index: 0,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'builtin==1=prev',
                label: 'Prev',
                style: 2,
                type: 2,
              },
              {
                custom_id: '_',
                disabled: true,
                label: '1/2',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'builtin==1=next',
                label: 'Next',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description:
              'Builtin packs are developed and maintained directly by Fable',
          }, {
            type: 'rich',
            title: 'manifest_id',
            description: 'description',
            footer: {
              text: 'author',
            },
            thumbnail: {
              url: 'image',
            },
          }],
        },
      });
    } finally {
      listStub.restore();
    }
  });

  await test.step('community packs', async () => {
    const manifest: Manifest = {
      author: 'author',
      id: 'manifest_id',
      description: 'description',
      image: 'image',
    };

    const listStub = stub(
      packs,
      'all',
      () =>
        Promise.resolve([
          { manifest, type: PackType.Community },
          { manifest, type: PackType.Community },
        ]),
    );

    try {
      const message = await packs.pages({
        type: PackType.Community,
        guildId: 'guild_id',
        index: 1,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'community==0=prev',
                label: 'Prev',
                style: 2,
                type: 2,
              },
              {
                custom_id: '_',
                disabled: true,
                label: '2/2',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'community==0=next',
                label: 'Next',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'puninstall=manifest_id',
                label: 'Uninstall',
                style: 4,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description:
              'The following third-party packs were manually installed by your server members',
          }, {
            type: 'rich',
            title: 'manifest_id',
            description: 'description',
            footer: {
              text: 'author',
            },
            thumbnail: {
              url: 'image',
            },
          }],
        },
      });
    } finally {
      listStub.restore();
    }
  });

  await test.step('use title and id ', async () => {
    const manifest: Manifest = {
      id: 'pack-id',
      title: 'Title',
    };

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([{ manifest, type: PackType.Builtin }]),
    );

    try {
      const message = await packs.pages({
        type: PackType.Builtin,
        guildId: 'guild_id',
        index: 0,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'builtin==0=prev',
                label: 'Prev',
                style: 2,
                type: 2,
              },
              {
                custom_id: '_',
                disabled: true,
                label: '1/1',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'builtin==0=next',
                label: 'Next',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description:
              'Builtin packs are developed and maintained directly by Fable',
          }, {
            type: 'rich',
            description: undefined,
            title: 'Title',
          }],
        },
      });
    } finally {
      listStub.restore();
    }
  });

  await test.step('homepage url', async () => {
    const manifest: Manifest = {
      id: 'pack-id',
      url: 'https://example.org',
    };

    const listStub = stub(
      packs,
      'all',
      () =>
        Promise.resolve([
          { manifest, type: PackType.Builtin },
        ]),
    );

    try {
      const message = await packs.pages({
        type: PackType.Builtin,
        guildId: 'guild_id',
        index: 0,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'builtin==0=prev',
                label: 'Prev',
                style: 2,
                type: 2,
              },
              {
                custom_id: '_',
                disabled: true,
                label: '1/1',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'builtin==0=next',
                label: 'Next',
                style: 2,
                type: 2,
              },
              {
                label: 'Homepage',
                url: 'https://example.org',
                style: 5,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description:
              'Builtin packs are developed and maintained directly by Fable',
          }, {
            type: 'rich',
            description: undefined,
            title: 'pack-id',
          }],
        },
      });
    } finally {
      listStub.restore();
    }
  });

  await test.step('no manifest', async () => {
    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    try {
      const message = await packs.pages({
        type: PackType.Builtin,
        guildId: 'guild_id',
        index: 0,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          components: [],
          attachments: [],
          embeds: [{
            type: 'rich',
            description: 'No packs have been installed yet',
          }],
        },
      });
    } finally {
      listStub.restore();
    }
  });
});

Deno.test('/packs [install-validate]', async (test) => {
  await test.step('shallow validate', async () => {
    const manifestStub = stub(
      github,
      'manifest',
      () =>
        Promise.resolve({
          repo: { id: 1 },
          manifest: { id: 'manifest_id' },
        }) as any,
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = packs.install({
        shallow: true,
        guildId: 'guild_id',
        token: 'token',
        url: 'url',
      });

      assertEquals(message.json(), {
        type: 5,
        data: {
          attachments: [],
          components: [],
          embeds: [],
        },
      });

      await timeStub.tickAsync(0);

      assertSpyCalls(fetchStub, 1);

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [
            {
              type: 'rich',
              color: 43115,
              description: 'Valid',
            },
          ],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      manifestStub.restore();
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('reserved id (shallow)', async () => {
    const manifestStub = stub(
      github,
      'manifest',
      () =>
        Promise.resolve({
          repo: { id: 1 },
          manifest: { id: 'anilist' },
        }) as any,
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = packs.install({
        shallow: true,
        guildId: 'guild_id',
        token: 'token',
        url: 'url',
      });

      assertEquals(message.json(), {
        type: 5,
        data: {
          attachments: [],
          components: [],
          embeds: [],
        },
      });

      await timeStub.tickAsync(0);

      assertSpyCalls(fetchStub, 1);

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [
            {
              type: 'rich',
              color: 10819367,
              description: '```json\nanilist is a reserved id\n```',
            },
          ],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      manifestStub.restore();
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('reserved id (not shallow)', async () => {
    const manifestStub = stub(
      github,
      'manifest',
      () =>
        Promise.resolve({
          repo: { id: 1 },
          manifest: { id: 'anilist' },
        }) as any,
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = packs.install({
        guildId: 'guild_id',
        token: 'token',
        url: 'url',
      });

      assertEquals(message.json(), {
        type: 5,
        data: {
          attachments: [],
          components: [],
          embeds: [],
        },
      });

      await timeStub.tickAsync(0);

      assertSpyCalls(fetchStub, 1);

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [
            {
              type: 'rich',
              description: 'Pack is invalid and cannot be installed.',
            },
          ],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      manifestStub.restore();
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('same manifest id but github id changed', async () => {
    const manifestStub = stub(
      github,
      'manifest',
      () =>
        Promise.resolve({
          repo: { id: 1 },
          manifest: { id: 'manifest_id' },
        }) as any,
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const listStub = stub(
      packs,
      'all',
      () =>
        Promise.resolve([
          {
            id: 2,
            type: PackType.Community,
            manifest: {
              id: 'manifest_id',
            },
          },
        ]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = packs.install({
        guildId: 'guild_id',
        token: 'token',
        url: 'url',
      });

      assertEquals(message.json(), {
        type: 5,
        data: {
          attachments: [],
          components: [],
          embeds: [],
        },
      });

      await timeStub.tickAsync(0);

      assertSpyCalls(fetchStub, 1);

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [
            {
              type: 'rich',
              description: 'A pack with the same id is already installed.',
            },
          ],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      manifestStub.restore();
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('existing conflicts with installation', async () => {
    const manifestStub = stub(
      github,
      'manifest',
      () =>
        Promise.resolve({
          repo: { id: 1 },
          manifest: { id: 'manifest_id' },
        }) as any,
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const listStub = stub(
      packs,
      'all',
      () =>
        Promise.resolve([
          {
            type: PackType.Community,
            manifest: {
              id: 'fake-id',
              conflicts: ['manifest_id'],
            },
          },
        ]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = packs.install({
        guildId: 'guild_id',
        token: 'token',
        url: 'url',
      });

      assertEquals(message.json(), {
        type: 5,
        data: {
          attachments: [],
          components: [],
          embeds: [],
        },
      });

      await timeStub.tickAsync(0);

      assertSpyCalls(fetchStub, 1);

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [
            {
              type: 'rich',
              description:
                '__Conflicts must be removed before you can install this pack__.',
            },
            {
              type: 'rich',
              description: `This pack conflicts with fake-id`,
            },
          ],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      manifestStub.restore();
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('installation conflicts with existing', async () => {
    const manifestStub = stub(
      github,
      'manifest',
      () =>
        Promise.resolve({
          repo: { id: 1 },
          manifest: { id: 'manifest_id', conflicts: ['fake-id'] },
        }) as any,
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const listStub = stub(
      packs,
      'all',
      () =>
        Promise.resolve([
          {
            type: PackType.Community,
            manifest: {
              id: 'fake-id',
            },
          },
        ]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = packs.install({
        guildId: 'guild_id',
        token: 'token',
        url: 'url',
      });

      assertEquals(message.json(), {
        type: 5,
        data: {
          attachments: [],
          components: [],
          embeds: [],
        },
      });

      await timeStub.tickAsync(0);

      assertSpyCalls(fetchStub, 1);

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [
            {
              type: 'rich',
              description:
                '__Conflicts must be removed before you can install this pack__.',
            },
            {
              type: 'rich',
              description: `This pack conflicts with fake-id`,
            },
          ],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      manifestStub.restore();
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('installation missing dependencies', async () => {
    const manifestStub = stub(
      github,
      'manifest',
      () =>
        Promise.resolve({
          repo: { id: 1 },
          manifest: { id: 'manifest_id', depends: ['fake-id'] },
        }) as any,
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = packs.install({
        guildId: 'guild_id',
        token: 'token',
        url: 'url',
      });

      assertEquals(message.json(), {
        type: 5,
        data: {
          attachments: [],
          components: [],
          embeds: [],
        },
      });

      await timeStub.tickAsync(0);

      assertSpyCalls(fetchStub, 1);

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [
            {
              type: 'rich',
              description:
                '__Dependencies must be installed before you can install this pack__.',
            },
            {
              type: 'rich',
              description: `This pack requires fake-id`,
            },
          ],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      manifestStub.restore();
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('invalid manifest (shallow)', async () => {
    const manifestStub = stub(
      github,
      'manifest',
      () =>
        Promise.resolve({
          repo: { id: 1 },
          manifest: { id: '$&*#&$*#' },
        }) as any,
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = packs.install({
        shallow: true,
        guildId: 'guild_id',
        token: 'token',
        url: 'url',
      });

      assertEquals(message.json(), {
        type: 5,
        data: {
          attachments: [],
          components: [],
          embeds: [],
        },
      });

      await timeStub.tickAsync(0);

      assertSpyCalls(fetchStub, 1);

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [
            {
              type: 'rich',
              color: 10819367,
              description: `\`\`\`json
The .id string must match ^[-_a-z0-9]+$

  1 | {
> 2 |   "id": "$&*#&$*#"
    |         ^^^^^^^^^^ Ensure this matches the regex pattern
  3 | }
\`\`\``,
            },
          ],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      manifestStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('invalid manifest (not shallow)', async () => {
    const manifestStub = stub(
      github,
      'manifest',
      () =>
        Promise.resolve({
          repo: { id: 1 },
          manifest: { id: '$&*#&$*#' },
        }) as any,
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = packs.install({
        guildId: 'guild_id',
        token: 'token',
        url: 'url',
      });

      assertEquals(message.json(), {
        type: 5,
        data: {
          attachments: [],
          components: [],
          embeds: [],
        },
      });

      await timeStub.tickAsync(0);

      assertSpyCalls(fetchStub, 1);

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [
            {
              type: 'rich',
              description: 'Pack is invalid and cannot be installed.',
            },
          ],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      manifestStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('pack id changed', async () => {
    const manifestStub = stub(
      github,
      'manifest',
      () =>
        Promise.resolve({
          repo: { id: 1 },
          manifest: { id: 'new_manifest_id' },
        }) as any,
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              addPackToInstance: {
                ok: false,
                error: 'PACK_ID_CHANGED',
                manifest: {
                  id: 'manifest_id',
                },
              },
            },
          }))),
      } as any),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = packs.install({
        guildId: 'guild_id',
        token: 'token',
        url: 'url',
      });

      assertEquals(message.json(), {
        type: 5,
        data: {
          attachments: [],
          components: [],
          embeds: [],
        },
      });

      await timeStub.tickAsync(0);

      assertSpyCalls(fetchStub, 2);

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://graphql.us.fauna.com/graphql',
      );

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [
            {
              type: 'rich',
              description:
                'Pack id changed. Found `new_manifest_id` but it should ne `manifest_id`',
            },
          ],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      manifestStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('installed', async () => {
    const manifestStub = stub(
      github,
      'manifest',
      () =>
        Promise.resolve({
          repo: { id: 1 },
          manifest: { id: 'manifest_id' },
        }) as any,
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              addPackToInstance: {
                ok: true,
                manifest: {
                  author: 'author',
                  id: 'manifest_id',
                  description: 'description',
                  url: 'url',
                  image: 'image',
                },
              },
            },
          }))),
      } as any),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = packs.install({
        guildId: 'guild_id',
        token: 'token',
        url: 'url',
      });

      assertEquals(message.json(), {
        type: 5,
        data: {
          attachments: [],
          components: [],
          embeds: [],
        },
      });

      await timeStub.tickAsync(0);

      assertSpyCalls(fetchStub, 2);

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://graphql.us.fauna.com/graphql',
      );

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [
            {
              type: 'rich',
              description: 'Installed',
            },
            {
              type: 'rich',
              title: 'manifest_id',
              description: 'description',
              footer: {
                text: 'author',
              },
              thumbnail: {
                url: 'image',
              },
            },
          ],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      manifestStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('updated', async () => {
    const manifestStub = stub(
      github,
      'manifest',
      () =>
        Promise.resolve({
          id: 1,
          manifest: { id: 'manifest_id' },
        }) as any,
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              addPackToInstance: {
                ok: true,
                manifest: {
                  author: 'author',
                  id: 'manifest_id',
                  description: 'description',
                  url: 'url',
                  image: 'image',
                },
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () =>
        Promise.resolve([
          {
            id: 1,
            type: PackType.Community,
            manifest: {
              id: 'manifest_id',
            },
          },
        ]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = packs.install({
        guildId: 'guild_id',
        token: 'token',
        url: 'url',
      });

      assertEquals(message.json(), {
        type: 5,
        data: {
          attachments: [],
          components: [],
          embeds: [],
        },
      });

      await timeStub.tickAsync(0);

      assertSpyCalls(fetchStub, 2);

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://graphql.us.fauna.com/graphql',
      );

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [
            {
              type: 'rich',
              description: 'Installed',
            },
            {
              type: 'rich',
              title: 'manifest_id',
              description: 'description',
              footer: {
                text: 'author',
              },
              thumbnail: {
                url: 'image',
              },
            },
          ],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      manifestStub.restore();
      fetchStub.restore();
      listStub.restore();
    }
  });
});

Deno.test('/packs uninstall', async (test) => {
  await test.step('normal', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              removePackFromInstance: {
                ok: true,
                manifest: {
                  author: 'author',
                  id: 'manifest_id',
                  description: 'description',
                  url: 'url',
                  image: 'image',
                },
              },
            },
          }))),
      } as any),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await packs.uninstall({
        guildId: 'guild_id',
        manifestId: 'manifest_id',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [
            {
              description: 'Uninstalled',
              type: 'rich',
            },
            {
              type: 'rich',
              description: 'description',
              footer: {
                text: 'author',
              },
              thumbnail: {
                url: 'image',
              },
              title: 'manifest_id',
            },
          ],
        },
      });
    } finally {
      delete config.appId;
      delete config.origin;

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
              removePackFromInstance: {
                ok: false,
                error: 'PACK_NOT_FOUND',
              },
            },
          }))),
      } as any),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      await assertRejects(
        async () =>
          await packs.uninstall({
            guildId: 'guild_id',
            manifestId: 'manifest_id',
          }),
        Error,
        '404',
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
    }
  });

  await test.step('not installed', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              removePackFromInstance: {
                ok: false,
                error: 'PACK_NOT_INSTALLED',
              },
            },
          }))),
      } as any),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      await assertRejects(
        async () =>
          await packs.uninstall({
            guildId: 'guild_id',
            manifestId: 'manifest_id',
          }),
        Error,
        '404',
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
    }
  });
});

Deno.test('/help', async (test) => {
  await test.step('navigation', () => {
    const message = help.pages({ userId: 'user_id', index: 0 });

    assertEquals(message.json().data.components[0].components[0], {
      custom_id: 'help==4=prev',
      label: 'Prev',
      style: 2,
      type: 2,
    });

    assertEquals(message.json().data.components[0].components[1], {
      custom_id: '_',
      disabled: true,
      label: '1/5',
      style: 2,
      type: 2,
    });

    assertEquals(message.json().data.components[0].components[2], {
      custom_id: 'help==1=next',
      label: 'Next',
      style: 2,
      type: 2,
    });
  });

  await test.step('page 1', () => {
    const message = help.pages({ userId: 'user_id', index: 0 });

    assertSnapshot(test, message.json());
  });

  await test.step('page 2', () => {
    const message = help.pages({ userId: 'user_id', index: 1 });

    assertSnapshot(test, message.json());
  });

  await test.step('page 3', () => {
    const message = help.pages({ userId: 'user_id', index: 2 });

    assertSnapshot(test, message.json());
  });

  await test.step('page 4', () => {
    const message = help.pages({ userId: 'user_id', index: 3 });

    assertSnapshot(test, message.json());
  });
});

Deno.test('/now', async (test) => {
  await test.step('with pulls', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              getUserInventory: {
                availablePulls: 5,
                lastPull: undefined,
                user: {},
              },
            },
          }))),
      } as any),
    );

    config.topggCipher = 12;

    try {
      const message = await user.now({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertSpyCalls(fetchStub, 1);

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: '**5**',
              footer: {
                text: 'Available Pulls',
              },
              description: undefined,
            },
          ],
          components: [
            {
              components: [
                {
                  custom_id: 'gacha=user_id',
                  label: '/gacha',
                  style: 2,
                  type: 2,
                },
                {
                  label: 'Vote for Rewards',
                  style: 5,
                  type: 2,
                  url:
                    'https://top.gg/bot/1041970851559522304/vote?ref=gHt3cXo=&gid=guild_id',
                },
              ],
              type: 1,
            },
          ],
        },
      });
    } finally {
      delete config.topggCipher;

      fetchStub.restore();
    }
  });

  await test.step('no pulls', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              getUserInventory: {
                availablePulls: 0,
                rechargeTimestamp: time.toISOString(),
                user: {},
              },
            },
          }))),
      } as any),
    );

    config.topggCipher = 12;

    try {
      const message = await user.now({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertSpyCalls(fetchStub, 1);

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: '**0**',
              footer: {
                text: 'Available Pulls',
              },
              description: undefined,
            },
            { type: 'rich', description: '_+1 pull <t:1675569106:R>_' },
          ],
          components: [{
            type: 1,
            components: [{
              label: 'Vote for Rewards',
              style: 5,
              type: 2,
              url:
                'https://top.gg/bot/1041970851559522304/vote?ref=gHt3cXo=&gid=guild_id',
            }],
          }],
        },
      });
    } finally {
      delete config.topggCipher;

      fetchStub.restore();
    }
  });

  await test.step('no pulls with mention', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              getUserInventory: {
                availablePulls: 0,
                rechargeTimestamp: time.toISOString(),
                user: {},
              },
            },
          }))),
      } as any),
    );

    config.topggCipher = 12;

    try {
      const message = await user.now({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        mention: true,
      });

      assertSpyCalls(fetchStub, 1);

      assertEquals(message.json(), {
        type: 4,
        data: {
          content: '<@user_id>',
          allowed_mentions: { parse: [] },
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: '**0**',
              footer: {
                text: 'Available Pulls',
              },
              description: undefined,
            },
            { type: 'rich', description: '_+1 pull <t:1675569106:R>_' },
          ],
          components: [{
            type: 1,
            components: [{
              label: 'Vote for Rewards',
              style: 5,
              type: 2,
              url:
                'https://top.gg/bot/1041970851559522304/vote?ref=gHt3cXo=&gid=guild_id',
            }],
          }],
        },
      });
    } finally {
      delete config.topggCipher;

      fetchStub.restore();
    }
  });

  await test.step('with votes', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              getUserInventory: {
                availablePulls: 0,
                rechargeTimestamp: time.toISOString(),
                user: {
                  availableVotes: 5,
                  lastVote: time.toISOString(),
                },
              },
            },
          }))),
      } as any),
    );

    config.topggCipher = 12;

    try {
      const message = await user.now({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertSpyCalls(fetchStub, 1);

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: '**0**',
              footer: {
                text: 'Available Pulls',
              },
              description: undefined,
            },
            {
              type: 'rich',
              title: '**5**',
              footer: {
                text: 'Available Votes',
              },
            },
            { type: 'rich', description: '_+1 pull <t:1675569106:R>_' },
          ],
          components: [{
            type: 1,
            components: [{
              label: 'Vote',
              style: 5,
              type: 2,
              url:
                'https://top.gg/bot/1041970851559522304/vote?ref=gHt3cXo=&gid=guild_id',
            }],
          }],
        },
      });
    } finally {
      delete config.topggCipher;

      fetchStub.restore();
    }
  });

  await test.step('with guarantees', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              getUserInventory: {
                availablePulls: 4,
                rechargeTimestamp: time.toISOString(),
                user: {
                  availableVotes: 5,
                  lastVote: time.toISOString(),
                  guarantees: [5, 5, 4, 4, 3],
                },
              },
            },
          }))),
      } as any),
    );

    config.topggCipher = 12;

    try {
      const message = await user.now({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertSpyCalls(fetchStub, 1);

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: '**4**',
              footer: {
                text: 'Available Pulls',
              },
              description:
                '5<:smol_star:1088427421096751224> 4<:smol_star:1088427421096751224> 3<:smol_star:1088427421096751224>',
            },
            {
              type: 'rich',
              title: '**5**',
              footer: {
                text: 'Available Votes',
              },
            },
            { type: 'rich', description: '_+1 pull <t:1675569106:R>_' },
          ],
          components: [{
            type: 1,
            components: [
              {
                style: 2,
                type: 2,
                custom_id: 'gacha=user_id',
                label: '/gacha',
              },
              {
                style: 2,
                type: 2,
                custom_id: 'pull=user_id=5',
                label: '/pull 5',
              },
              {
                label: 'Vote',
                style: 5,
                type: 2,
                url:
                  'https://top.gg/bot/1041970851559522304/vote?ref=gHt3cXo=&gid=guild_id',
              },
            ],
          }],
        },
      });
    } finally {
      delete config.topggCipher;

      fetchStub.restore();
    }
  });

  await test.step('can\'t vote', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');

    const timeStub = new FakeTime(time);

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              getUserInventory: {
                availablePulls: 0,
                rechargeTimestamp: time.toISOString(),
                user: {
                  availableVotes: 5,
                  lastVote: new Date().toISOString(),
                },
              },
            },
          }))),
      } as any),
    );

    config.topggCipher = 12;

    try {
      const message = await user.now({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertSpyCalls(fetchStub, 1);

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: '**0**',
              footer: {
                text: 'Available Pulls',
              },
              description: undefined,
            },
            {
              type: 'rich',
              title: '**5**',
              footer: {
                text: 'Available Votes',
              },
            },
            { type: 'rich', description: '_+1 pull <t:1675569106:R>_' },
            {
              type: 'rich',
              description: '_Can vote again <t:1675610506:R>_',
            },
          ],
          components: [],
        },
      });
    } finally {
      delete config.topggCipher;

      timeStub.restore();
      fetchStub.restore();
    }
  });
});

Deno.test('/trade', async (test) => {
  await test.step('normal', async () => {
    const character: Character = {
      id: '1',
      packId: 'id',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [{
        url: 'image_url',
      }],
    };

    const characterStub = stub(
      packs,
      'characters',
      () => Promise.resolve([character]),
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const aggregateStub = stub(
      packs,
      'aggregate',
      ({ character }) => Promise.resolve(character),
    );

    const tradeStub = stub(
      trade,
      'verifyCharacters',
      returnsNext([
        Promise.resolve({ ok: true }),
        Promise.resolve({ ok: true }),
      ]),
    );

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.pre({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        targetId: 'another_user_id',
        give: ['give_character_id'],
        take: ['take_character_id'],
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

      await timeStub.tickAsync(0);

      assertSpyCalls(fetchStub, 2);

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
          content: '<@another_user_id>',
          attachments: [],
          embeds: [
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name\n\u200B',
                  value: '\u200B',
                },
                {
                  name: '\u200B',
                  value: '<:remove:1085033678180208641>',
                },
              ],
            },
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name\n\u200B',
                  value: '\u200B',
                },
                {
                  name: '\u200B',
                  value: '<:add:1085034731810332743>',
                },
              ],
            },
            {
              type: 'rich',
              description:
                '<@user_id> is offering that you lose **full name** <:remove:1085033678180208641> and get **full name** <:add:1085034731810332743>',
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'trade=user_id=another_user_id=id:1=id:1',
                  label: 'Accept',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'cancel=user_id=another_user_id',
                  label: 'Decline',
                  style: 4,
                  type: 2,
                },
              ],
            },
          ],
        },
      );

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'POST');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          content: '<@another_user_id> you received an offer!',
          attachments: [],
          components: [],
          embeds: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.trading;

      timeStub.restore();
      characterStub.restore();
      aggregateStub.restore();
      tradeStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('repeated characters', async () => {
    const character: Character = {
      id: '1',
      packId: 'id',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [{
        url: 'image_url',
      }],
    };

    const characterStub = stub(
      packs,
      'characters',
      () => Promise.resolve([character]),
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const aggregateStub = stub(
      packs,
      'aggregate',
      ({ character }) => Promise.resolve(character),
    );

    const tradeStub = stub(
      trade,
      'verifyCharacters',
      returnsNext([
        Promise.resolve({ ok: true }),
        Promise.resolve({ ok: true }),
      ]),
    );

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.pre({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        targetId: 'another_user_id',
        give: ['give_character_id', 'give_character_id'],
        take: ['take_character_id', 'take_character_id'],
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

      await timeStub.tickAsync(0);

      assertSpyCalls(fetchStub, 2);

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
          content: '<@another_user_id>',
          attachments: [],
          embeds: [
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name\n\u200B',
                  value: '\u200B',
                },
                {
                  name: '\u200B',
                  value: '<:remove:1085033678180208641>',
                },
              ],
            },
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name\n\u200B',
                  value: '\u200B',
                },
                {
                  name: '\u200B',
                  value: '<:add:1085034731810332743>',
                },
              ],
            },
            {
              type: 'rich',
              description:
                '<@user_id> is offering that you lose **full name** <:remove:1085033678180208641> and get **full name** <:add:1085034731810332743>',
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'trade=user_id=another_user_id=id:1=id:1',
                  label: 'Accept',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'cancel=user_id=another_user_id',
                  label: 'Decline',
                  style: 4,
                  type: 2,
                },
              ],
            },
          ],
        },
      );

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'POST');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          content: '<@another_user_id> you received an offer!',
          attachments: [],
          components: [],
          embeds: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.trading;

      timeStub.restore();
      characterStub.restore();
      aggregateStub.restore();
      tradeStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('not found', async () => {
    const character: Character = {
      id: '1',
      packId: 'id',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [{
        url: 'image_url',
      }],
    };

    const characterStub = stub(
      packs,
      'characters',
      () => Promise.resolve([character]),
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const aggregateStub = stub(
      packs,
      'aggregate',
      ({ character }) => Promise.resolve(character),
    );

    const tradeStub = stub(
      trade,
      'verifyCharacters',
      returnsNext([
        Promise.resolve({
          ok: true,
        }),
        Promise.resolve({
          ok: false,
          // deno-lint-ignore prefer-as-const
          message: 'NOT_FOUND' as 'NOT_FOUND',
          errors: ['id:1'],
        }),
      ]),
    );

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.pre({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        targetId: 'another_user_id',
        give: ['give_character_id'],
        take: ['take_character_id'],
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

      await timeStub.tickAsync(0);

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
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name\n\u200B',
                  value: '\u200B',
                },
              ],
            },
            {
              type: 'rich',
              description:
                '_Those characters haven\'t been found by anyone yet_',
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.trading;

      timeStub.restore();
      characterStub.restore();
      aggregateStub.restore();
      tradeStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('not owned', async () => {
    const character: Character = {
      id: '1',
      packId: 'id',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [{
        url: 'image_url',
      }],
    };

    const characterStub = stub(
      packs,
      'characters',
      () => Promise.resolve([character]),
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const aggregateStub = stub(
      packs,
      'aggregate',
      ({ character }) => Promise.resolve(character),
    );

    const tradeStub = stub(
      trade,
      'verifyCharacters',
      returnsNext([
        Promise.resolve({
          ok: true,
        }),
        Promise.resolve({
          ok: false,
          // deno-lint-ignore prefer-as-const
          message: 'NOT_OWNED' as 'NOT_OWNED',
          errors: ['id:1'],
        }),
      ]),
    );

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.pre({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        targetId: 'another_user_id',
        give: ['give_character_id'],
        take: ['take_character_id'],
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

      await timeStub.tickAsync(0);

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
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name\n\u200B',
                  value: '\u200B',
                },
              ],
            },
            {
              type: 'rich',
              description: '<@another_user_id> doesn\'t those characters**',
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.trading;

      timeStub.restore();
      characterStub.restore();
      aggregateStub.restore();
      tradeStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('trading with yourself', () => {
    const message = trade.pre({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      targetId: 'user_id',
      give: ['give_character_id'],
      take: ['take_character_id'],
    });

    assertEquals(message.json(), {
      type: 4,
      data: {
        flags: 64,
        attachments: [],
        components: [],
        embeds: [{
          type: 'rich',
          description: 'You can\'t trade with yourself.',
        }],
      },
    });
  });

  await test.step('disabled', async () => {
    const characterStub = stub(
      packs,
      'characters',
      () => Promise.resolve([]),
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.pre({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        targetId: 'another_user_id',
        give: ['give_character_id'],
        take: ['take_character_id'],
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

      await timeStub.tickAsync(0);

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
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description:
                'Some of those character do not exist or are disabled',
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.trading;

      timeStub.restore();
      characterStub.restore();
      fetchStub.restore();
    }
  });
});

Deno.test('/give', async (test) => {
  await test.step('normal', async () => {
    const character: Character = {
      id: '1',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [{
        url: 'image_url',
      }],
    };

    const characterStub = stub(
      packs,
      'characters',
      () => Promise.resolve([character]),
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const aggregateStub = stub(
      packs,
      'aggregate',
      ({ character }) => Promise.resolve(character),
    );

    const tradeStub = stub(
      trade,
      'verifyCharacters',
      returnsNext([
        Promise.resolve({ ok: true }),
      ]),
    );

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.pre({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        targetId: 'another_user_id',
        give: ['give_character_id'],
        take: [],
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

      await timeStub.tickAsync(0);

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
          attachments: [],
          embeds: [
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name\n\u200B',
                  value: '\u200B',
                },
                {
                  name: '\u200B',
                  value: '<:remove:1085033678180208641>',
                },
              ],
            },
            {
              type: 'rich',
              description:
                'Are you sure you want to give **full name** <:remove:1085033678180208641> to <@another_user_id> for free?',
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'give=user_id=another_user_id=undefined:1',
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
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.trading;

      timeStub.restore();
      characterStub.restore();
      aggregateStub.restore();
      tradeStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('not found', async () => {
    const character: Character = {
      id: '1',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [{
        url: 'image_url',
      }],
    };

    const characterStub = stub(
      packs,
      'characters',
      () => Promise.resolve([character]),
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const aggregateStub = stub(
      packs,
      'aggregate',
      ({ character }) => Promise.resolve(character),
    );

    const tradeStub = stub(
      trade,
      'verifyCharacters',
      returnsNext([
        Promise.resolve({
          ok: false,
          // deno-lint-ignore prefer-as-const
          message: 'NOT_FOUND' as 'NOT_FOUND',
          errors: ['undefined:1'],
        }),
      ]),
    );

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.pre({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        targetId: 'another_user_id',
        give: ['give_character_id'],
        take: [],
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

      await timeStub.tickAsync(0);

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
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name\n\u200B',
                  value: '\u200B',
                },
              ],
            },
            {
              type: 'rich',
              description:
                '_Those characters haven\'t been found by anyone yet_',
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.trading;

      timeStub.restore();
      characterStub.restore();
      aggregateStub.restore();
      tradeStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('not owned', async () => {
    const character: Character = {
      id: '1',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [{
        url: 'image_url',
      }],
    };

    const characterStub = stub(
      packs,
      'characters',
      () => Promise.resolve([character]),
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const aggregateStub = stub(
      packs,
      'aggregate',
      ({ character }) => Promise.resolve(character),
    );

    const tradeStub = stub(
      trade,
      'verifyCharacters',
      returnsNext([
        Promise.resolve({
          ok: false,
          // deno-lint-ignore prefer-as-const
          message: 'NOT_OWNED' as 'NOT_OWNED',
          errors: ['undefined:1'],
        }),
      ]),
    );

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.pre({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        targetId: 'another_user_id',
        give: ['give_character_id'],
        take: [],
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

      await timeStub.tickAsync(0);

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
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name\n\u200B',
                  value: '\u200B',
                },
              ],
            },
            {
              type: 'rich',
              description: 'You don\'t have the those characters',
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.trading;

      timeStub.restore();
      characterStub.restore();
      aggregateStub.restore();
      tradeStub.restore();
      fetchStub.restore();
    }
  });
});

Deno.test('/buy', async (test) => {
  await test.step('random dialog', () => {
    const message = shop.random({
      userId: 'user_id',
      amount: 1,
    });

    assertEquals(message.json(), {
      type: 4,
      data: {
        attachments: [],
        components: [{
          type: 1,
          components: [
            {
              custom_id: 'buy=random=user_id=1',
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
        embeds: [{
          type: 'rich',
          description:
            'Are you sure you want to spent **1** vote <:remove:1085033678180208641>',
        }],
      },
    });
  });

  await test.step('random dialog (plural)', () => {
    const message = shop.random({
      userId: 'user_id',
      amount: 4,
    });

    assertEquals(message.json(), {
      type: 4,
      data: {
        attachments: [],
        components: [{
          type: 1,
          components: [
            {
              custom_id: 'buy=random=user_id=4',
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
        embeds: [{
          type: 'rich',
          description:
            'Are you sure you want to spent **4** votes <:remove:1085033678180208641>',
        }],
      },
    });
  });

  await test.step('random confirmed', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              exchangeVotesForPulls: {
                ok: true,
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmRandom({
        userId: 'user_id',
        guildId: 'guild_id',
        amount: 1,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'gacha=user_id',
                label: '/gacha',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'q=user_id',
                label: '/q',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description:
              'You bought **1** random pull <:add:1085034731810332743>',
          }],
        },
      });
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('random confirmed (plural)', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              exchangeVotesForPulls: {
                ok: true,
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmRandom({
        userId: 'user_id',
        guildId: 'guild_id',
        amount: 5,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'gacha=user_id',
                label: '/gacha',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'q=user_id',
                label: '/q',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description:
              'You bought **5** random pulls <:add:1085034731810332743>',
          }],
        },
      });
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('random no votes', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              exchangeVotesForPulls: {
                ok: false,
                error: 'INSUFFICIENT_VOTES',
                user: {},
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmRandom({
        userId: 'user_id',
        guildId: 'guild_id',
        amount: 1,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'now=user_id',
                label: '/vote',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description: 'You don\'t have any votes',
          }],
        },
      });
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('random insufficient votes', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              exchangeVotesForPulls: {
                ok: false,
                error: 'INSUFFICIENT_VOTES',
                user: {
                  availableVotes: 1,
                },
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmRandom({
        userId: 'user_id',
        guildId: 'guild_id',
        amount: 10,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'now=user_id',
                label: '/vote',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description: 'You only have **1** vote',
          }],
        },
      });
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('random insufficient votes (plural)', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              exchangeVotesForPulls: {
                ok: false,
                error: 'INSUFFICIENT_VOTES',
                user: {
                  availableVotes: 5,
                },
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmRandom({
        userId: 'user_id',
        guildId: 'guild_id',
        amount: 10,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'now=user_id',
                label: '/vote',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description: 'You only have **5** votes',
          }],
        },
      });
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('guaranteed 3*', () => {
    const message = shop.guaranteed({
      userId: 'user_id',
      stars: 3,
    });

    assertEquals(message.json(), {
      type: 4,
      data: {
        attachments: [],
        components: [{
          type: 1,
          components: [
            {
              custom_id: 'buy=guaranteed=user_id=3',
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
        embeds: [{
          type: 'rich',
          description:
            'Are you sure you want to spent **4** votes <:remove:1085033678180208641>',
        }],
      },
    });
  });

  await test.step('guaranteed 4*', () => {
    const message = shop.guaranteed({
      userId: 'user_id',
      stars: 4,
    });

    assertEquals(message.json(), {
      type: 4,
      data: {
        attachments: [],
        components: [{
          type: 1,
          components: [
            {
              custom_id: 'buy=guaranteed=user_id=4',
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
        embeds: [{
          type: 'rich',
          description:
            'Are you sure you want to spent **12** votes <:remove:1085033678180208641>',
        }],
      },
    });
  });

  await test.step('guaranteed 5*', () => {
    const message = shop.guaranteed({
      userId: 'user_id',
      stars: 5,
    });

    assertEquals(message.json(), {
      type: 4,
      data: {
        attachments: [],
        components: [{
          type: 1,
          components: [
            {
              custom_id: 'buy=guaranteed=user_id=5',
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
        embeds: [{
          type: 'rich',
          description:
            'Are you sure you want to spent **36** votes <:remove:1085033678180208641>',
        }],
      },
    });
  });

  await test.step('guaranteed 3* confirmed', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              exchangeVotesForGuarantees: {
                ok: true,
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmGuaranteed({
        userId: 'user_id',
        stars: 3,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'pull=user_id=3',
                label: '/pull 3',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description:
              'You bought a **3**<:smol_star:1088427421096751224>pull <:add:1085034731810332743>',
          }],
        },
      });
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('guaranteed 4* confirmed', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              exchangeVotesForGuarantees: {
                ok: true,
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmGuaranteed({
        userId: 'user_id',
        stars: 4,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'pull=user_id=4',
                label: '/pull 4',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description:
              'You bought a **4**<:smol_star:1088427421096751224>pull <:add:1085034731810332743>',
          }],
        },
      });
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('guaranteed 5* confirmed', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              exchangeVotesForGuarantees: {
                ok: true,
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmGuaranteed({
        userId: 'user_id',
        stars: 5,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'pull=user_id=5',
                label: '/pull 5',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description:
              'You bought a **5**<:smol_star:1088427421096751224>pull <:add:1085034731810332743>',
          }],
        },
      });
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('guaranteed no votes', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              exchangeVotesForGuarantees: {
                ok: false,
                error: 'INSUFFICIENT_VOTES',
                user: {},
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmGuaranteed({
        userId: 'user_id',
        stars: 4,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'now=user_id',
                label: '/vote',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description: 'You don\'t have any votes',
          }],
        },
      });
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('guaranteed insufficient votes', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              exchangeVotesForGuarantees: {
                ok: false,
                error: 'INSUFFICIENT_VOTES',
                user: {
                  availableVotes: 1,
                },
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmGuaranteed({
        userId: 'user_id',
        stars: 4,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'now=user_id',
                label: '/vote',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description: 'You only have **1** vote',
          }],
        },
      });
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('guaranteed insufficient votes (plural', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              exchangeVotesForGuarantees: {
                ok: false,
                error: 'INSUFFICIENT_VOTES',
                user: {
                  availableVotes: 5,
                },
              },
            },
          }))),
      } as any),
    );

    try {
      const message = await shop.confirmGuaranteed({
        userId: 'user_id',
        stars: 4,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'now=user_id',
                label: '/vote',
                style: 2,
                type: 2,
              },
            ],
          }],
          embeds: [{
            type: 'rich',
            description: 'You only have **5** votes',
          }],
        },
      });
    } finally {
      fetchStub.restore();
    }
  });
});

Deno.test('/nick', async (test) => {
  await test.step('normal', async () => {
    const media: AniListMedia = {
      id: '2',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'title',
      },
      popularity: 0,
    };

    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'name 1',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
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
                  media,
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
                customizeCharacter: {
                  ok: true,
                  character: {
                    id: 'anilist:1',
                    mediaId: 'anilist:0',
                    nickname: 'returned_name',
                    rating: 2,
                  },
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.customize({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild',
        id: 'anilist:1',
        nick: 'new_nick',
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

      await timeStub.tickAsync(0);

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
              fields: [
                {
                  name: 'title',
                  value: '**returned_name**',
                },
              ],
              image: {
                url: 'http://localhost:8000/external/',
              },
            },
          ],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'character=anilist:1',
                label: '/character',
                style: 2,
                type: 2,
              },
            ],
          }],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('character not found', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
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
                Page: {
                  characters,
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                customizeCharacter: {
                  ok: false,
                  error: 'CHARACTER_NOT_FOUND',
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.customize({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild',
        id: 'anilist:1',
        nick: 'new_nick',
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

      await timeStub.tickAsync(0);

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
              description: 'name 1 hasn\'t been found by anyone yet.',
            },
          ],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'character=anilist:1',
                label: '/character',
                style: 2,
                type: 2,
              },
            ],
          }],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('character not owned', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
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
                Page: {
                  characters,
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                customizeCharacter: {
                  ok: false,
                  error: 'CHARACTER_NOT_OWNED',
                  character: {
                    id: 'anilist:1',
                    mediaId: 'anilist:0',
                    rating: 2,
                    user: {
                      id: 'user_2',
                    },
                  },
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.customize({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild',
        id: 'anilist:1',
        nick: 'new_nick',
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

      await timeStub.tickAsync(0);

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
              description:
                'name 1 is owned by <@user_2> and cannot be customized by you.',
            },
          ],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'character=anilist:1',
                label: '/character',
                style: 2,
                type: 2,
              },
            ],
          }],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });
});

Deno.test('/image', async (test) => {
  await test.step('normal', async () => {
    const media: AniListMedia = {
      id: '2',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'title',
      },
      popularity: 0,
    };

    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'name 1',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
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
                  media,
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
                customizeCharacter: {
                  ok: true,
                  character: {
                    id: 'anilist:1',
                    mediaId: 'anilist:0',
                    rating: 2,
                    image: 'returned_image',
                  },
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.customize({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild',
        id: 'anilist:1',
        image: 'image_url',
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

      await timeStub.tickAsync(0);

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
              fields: [
                {
                  name: 'title',
                  value: '**name 1**',
                },
              ],
              image: {
                url: 'http://localhost:8000/external/returned_image',
              },
            },
          ],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'character=anilist:1',
                label: '/character',
                style: 2,
                type: 2,
              },
            ],
          }],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('character not found', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
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
                Page: {
                  characters,
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                customizeCharacter: {
                  ok: false,
                  error: 'CHARACTER_NOT_FOUND',
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.customize({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild',
        id: 'anilist:1',
        image: 'image_url',
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

      await timeStub.tickAsync(0);

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
              description: 'name 1 hasn\'t been found by anyone yet.',
            },
          ],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'character=anilist:1',
                label: '/character',
                style: 2,
                type: 2,
              },
            ],
          }],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('character not owned', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
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
                Page: {
                  characters,
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                customizeCharacter: {
                  ok: false,
                  error: 'CHARACTER_NOT_OWNED',
                  character: {
                    id: 'anilist:1',
                    mediaId: 'anilist:0',
                    rating: 2,
                    user: {
                      id: 'user_2',
                    },
                  },
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.customize({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild',
        id: 'anilist:1',
        image: 'image_url',
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

      await timeStub.tickAsync(0);

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
              description:
                'name 1 is owned by <@user_2> and cannot be customized by you.',
            },
          ],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'character=anilist:1',
                label: '/character',
                style: 2,
                type: 2,
              },
            ],
          }],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });
});
