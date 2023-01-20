// deno-lint-ignore-file no-explicit-any

import {
  assertEquals,
  assertRejects,
} from 'https://deno.land/std@0.172.0/testing/asserts.ts';

import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from 'https://deno.land/std@0.172.0/testing/mock.ts';

import { FakeTime } from 'https://deno.land/std@0.172.0/testing/time.ts';

import packs from '../src/packs.ts';
import config from '../src/config.ts';

import Rating from '../src/rating.ts';

import gacha, { Pull } from '../src/gacha.ts';

import * as search from '../src/search.ts';

import {
  Character,
  CharacterRole,
  DisaggregatedCharacter,
  Manifest,
  Media,
  MediaFormat,
  MediaRelation,
  MediaType,
} from '../src/types.ts';

import { AniListCharacter, AniListMedia } from '../packs/anilist/types.ts';

Deno.test('media', async (test) => {
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
        color: '#ffffff',
        extraLarge: 'image_url',
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
                media: [media],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.media({ search: 'english title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            type: 2,
            author: {
              name: 'Anime',
            },
            footer: {
              text: 'native title',
            },
            title: 'english title',
            color: 16777215,
            description: 'long description',
            image: {
              url: 'undefined/external/image_url',
            },
          }],
          components: [],
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('prioritize search', async () => {
    const media: AniListMedia[] = [{
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'title',
      },
    }, {
      id: '2',
      type: MediaType.Manga,
      format: MediaFormat.Manga,
      title: {
        english: 'title',
      },
    }];

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                media,
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.media({
        search: 'title',
        type: MediaType.Manga,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            type: 2,
            author: {
              name: 'Manga',
            },
            color: undefined,
            description: undefined,
            image: {
              url: 'undefined/external/',
            },
            title: 'title',
          }],
          components: [],
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
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
        color: '#ffffff',
        extraLarge: 'image_url',
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
                media: [media],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.media({ search: 'native title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            type: 2,
            author: {
              name: 'Anime',
            },
            title: 'native title',
            color: 16777215,
            description: 'long description',
            image: {
              url: 'undefined/external/image_url',
            },
          }],
          components: [],
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
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
        color: '#ffffff',
        extraLarge: 'image_url',
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
                media: [media],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.media({ search: 'english title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            type: 2,
            author: {
              name: 'Novel',
            },
            title: 'english title',
            color: 16777215,
            description: 'long description',
            image: {
              url: 'undefined/external/image_url',
            },
          }],
          components: [],
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
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
        color: '#ffffff',
        extraLarge: 'image_url',
      },
      externalLinks: [
        { site: 'Crunchyroll', url: 'url2' },
      ],
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
                media: [media],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.media({ search: 'english title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            type: 2,
            author: {
              name: 'Anime',
            },
            title: 'english title',
            color: 16777215,
            description: 'long description',
            image: {
              url: 'undefined/external/image_url',
            },
          }],
          components: [
            {
              type: 1,
              components: [
                {
                  url: 'url2',
                  label: 'Crunchyroll',
                  style: 5,
                  type: 2,
                },
              ],
            },
          ],
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
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

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                media: [media],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.media({ search: 'english title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            type: 2,
            author: {
              name: 'Anime',
            },
            color: undefined,
            description: undefined,
            title: 'english title',
            image: {
              url: 'undefined/external/',
            },
          }],
          components: [],
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
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
        color: '#ffffff',
        extraLarge: 'image_url',
      },
      trailer: {
        site: 'youtube',
        id: 'video_id',
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
                media: [media],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.media({ search: 'english title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            type: 2,
            author: {
              name: 'Anime',
            },
            title: 'english title',
            color: 16777215,
            description: 'long description',
            image: {
              url: 'undefined/external/image_url',
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
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
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
        color: '#ffffff',
        extraLarge: 'image_url',
      },
      characters: {
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

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                media: [media],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.media({ search: 'english title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            type: 2,
            author: {
              name: 'Anime',
            },
            title: 'english title',
            color: 16777215,
            description: 'long description',
            image: {
              url: 'undefined/external/image_url',
            },
          }, {
            type: 2,
            footer: {
              text: 'Male, 69',
            },
            title: 'main character name',
            color: 16777215,
            description: 'main character description',
            thumbnail: {
              url: 'undefined/external/main%20character%20url?size=thumbnail',
            },
          }, {
            type: 2,
            title: 'supporting character name',
            color: 16777215,
            description: 'supporting character description',
            thumbnail: {
              url:
                'undefined/external/supporting%20character%20url?size=thumbnail',
            },
          }],
          components: [],
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
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
        color: '#ffffff',
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

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                media: [media],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.media({ search: 'english title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            type: 2,
            author: {
              name: 'Anime',
            },
            title: 'english title',
            color: 16777215,
            description: 'long description',
            image: {
              url: 'undefined/external/image_url',
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
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
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
        color: '#ffffff',
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

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                media: [media],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.media({ search: 'english title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            type: 2,
            author: {
              name: 'Anime',
            },
            title: 'english title',
            color: 16777215,
            description: 'long description',
            image: {
              url: 'undefined/external/image_url',
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
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
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
        color: '#ffffff',
        extraLarge: 'image_url',
      },
      relations: {
        edges: [{
          relationType: MediaRelation.Other,
          node: {
            id: '5',
            type: MediaType.Anime,
            format: MediaFormat.Internet,
            popularity: 0,
            title: {
              english: 'branch',
            },
          },
        }],
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
                media: [media],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.media({ search: 'english title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            type: 2,
            author: {
              name: 'Anime',
            },
            title: 'english title',
            color: 16777215,
            description: 'long description',
            image: {
              url: 'undefined/external/image_url',
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
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
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
        color: '#ffffff',
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

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                media: [media],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.media({ search: 'english title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            type: 2,
            author: {
              name: 'Anime',
            },
            title: 'english title',
            color: 16777215,
            description: 'long description',
            image: {
              url: 'undefined/external/image_url',
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
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
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
        color: '#ffffff',
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

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                media: [media],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.media({ search: 'english title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            type: 2,
            author: {
              name: 'Anime',
            },
            title: 'english title',
            color: 16777215,
            description: 'long description',
            image: {
              url: 'undefined/external/image_url',
            },
          }],
          components: [
            {
              type: 1,
              components: [
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
                {
                  custom_id: 'media=anilist:5',
                  label: 'title (Anime)',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
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
        color: '#ffffff',
        extraLarge: 'image_url',
      },
      characters: {
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

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                media: [media],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.media({ search: 'english title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            type: 2,
            author: {
              name: 'Anime',
            },
            title: 'english title',
            color: 16777215,
            description: 'long description',
            image: {
              url: 'undefined/external/image_url',
            },
          }, {
            type: 2,
            title: 'supporting character name',
            color: 16777215,
            description: undefined,
            thumbnail: {
              url: 'undefined/external/?size=thumbnail',
            },
          }, {
            type: 2,
            title: 'background character name',
            color: 16777215,
            description: undefined,
            thumbnail: {
              url: 'undefined/external/?size=thumbnail',
            },
          }],
          components: [],
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
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

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                media: [media],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      await assertRejects(
        async () => await search.media({ search: 'x'.repeat(100) }),
        Error,
        '404',
      );

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
    }
  });
});

Deno.test('media debug', async (test) => {
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
        color: '#ffffff',
        extraLarge: 'image_url',
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
                media: [media],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.media({
        search: 'english title',
        debug: true,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            description: 'romaji title\nnative title',
            color: 16777215,
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
              url: 'undefined/external/image_url?size=thumbnail',
            },
            title: 'english title',
            type: 2,
          }],
          components: [],
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
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

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                media: [media],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.media({
        search: 'english title',
        debug: true,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            description: undefined,
            color: undefined,
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
              url: 'undefined/external/?size=thumbnail',
            },
            title: 'english title',
            type: 2,
          }],
          components: [],
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
    }
  });
});

Deno.test('character', async (test) => {
  await test.step('normal search', async () => {
    const character: DisaggregatedCharacter = {
      id: '1',
      description: 'long description',
      name: {
        english: 'full name',
      },
      image: {
        featured: {
          url: 'image_url',
          color: '#ffffff',
        },
      },
      age: '420',
      gender: 'male',
    };

    const manifest: Manifest = {
      id: 'pack-id',
      characters: {
        new: [character],
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
                characters: [character],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [manifest],
    );

    try {
      const message = await search.character({ search: 'full name' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            type: 2,
            title: 'full name',
            description: 'long description',
            color: 16777215,
            image: {
              url: 'undefined/external/image_url',
            },
            footer: {
              text: 'Male, 420',
            },
          }],
          components: [],
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('gender only', async () => {
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

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                characters: [character],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.character({ search: 'full name' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            type: 2,
            title: 'full name',
            description: 'long description',
            color: undefined,
            image: {
              url: 'undefined/external/image_url',
            },
            footer: {
              text: 'Female',
            },
          }],
          components: [],
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('age only', async () => {
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

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                characters: [character],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.character({ search: 'full name' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            type: 2,
            title: 'full name',
            description: 'long description',
            color: undefined,
            image: {
              url: 'undefined/external/image_url',
            },
            footer: {
              text: '18+',
            },
          }],
          components: [],
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('relations', async () => {
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

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                characters: [character],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.character({ search: 'full name' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            type: 2,
            title: 'full name',
            description: 'long description',
            color: undefined,
            image: {
              url: 'undefined/external/image_url',
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
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('default image', async () => {
    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'full name',
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
                characters: [character],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.character({ search: 'full name' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            type: 2,
            title: 'full name',
            description: undefined,
            color: undefined,
            image: {
              url: 'undefined/external/',
            },
          }],
          components: [],
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
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

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                characters: [character],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      await assertRejects(
        async () => await search.character({ search: 'x'.repeat(100) }),
        Error,
        '404',
      );

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
    }
  });
});

Deno.test('character debug', async (test) => {
  await test.step('no media', async () => {
    const character: DisaggregatedCharacter = {
      id: '1',
      description: 'long description',
      name: {
        english: 'full name',
      },
      image: {
        featured: {
          url: 'image_url',
          color: '#ffffff',
        },
      },
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

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                characters: [character],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [manifest],
    );

    try {
      const message = await search.character({
        search: 'full name',
        debug: true,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          components: [],

          embeds: [
            {
              type: 2,
              title: 'full name',
              description: undefined,
              color: 16777215,
              thumbnail: {
                url: 'undefined/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'Id',
                  value: 'pack-id:1',
                },
                {
                  name: 'Rating',
                  value:
                    '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098>',
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
                  value: 'undefined',
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
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
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

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                characters: [character],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.character({
        search: 'full name',
        debug: true,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          components: [],

          embeds: [
            {
              type: 2,
              title: 'full name',
              description: undefined,
              color: undefined,
              thumbnail: {
                url: 'undefined/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'Id',
                  value: 'anilist:1',
                },
                {
                  name: 'Rating',
                  value:
                    '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
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
                  value: 'undefined',
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
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('default image', async () => {
    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'full name',
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
                characters: [character],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.character({
        search: 'full name',
        debug: true,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          components: [],

          embeds: [
            {
              type: 2,
              title: 'full name',
              description: undefined,
              color: undefined,
              thumbnail: {
                url: 'undefined/external/?size=thumbnail',
              },
              fields: [
                {
                  name: 'Id',
                  value: 'anilist:1',
                },
                {
                  name: 'Rating',
                  value:
                    '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
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
                  value: 'undefined',
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
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
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

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              Page: {
                characters: [character],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.character({
        search: 'full name',
        debug: true,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          components: [],

          embeds: [
            {
              type: 2,
              title: 'full name',
              description: undefined,
              color: undefined,
              thumbnail: {
                url: 'undefined/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'Id',
                  value: 'anilist:1',
                },
                {
                  name: 'Rating',
                  value:
                    '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
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
                  value: '5',
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
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
    }
  });
});

Deno.test('gacha', async (test) => {
  await test.step('normal', async () => {
    const media: Media = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      popularity: 100,
      title: {
        english: 'title',
      },
      image: {
        featured: {
          url: 'media_image_url',
        },
      },
    };

    const character: Character = {
      id: '2',
      name: {
        english: 'name',
      },
      image: {
        featured: {
          url: 'character_image_url',
        },
      },
    };

    const pull: Pull = {
      media,
      character,
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

    config.origin = 'http://localhost:8000';

    try {
      const message = await gacha.start({ token: 'token' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          components: [],
          embeds: [{
            type: 2,
            image: {
              url: 'http://localhost:8000/file/spinner.gif',
            },
          }],
        },
      });

      assertSpyCalls(fetchStub, 1);

      assertSpyCall(fetchStub, 0, {
        args: [
          'https://discord.com/api/v10/webhooks/undefined/token/messages/@original',
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
              embeds: [{
                type: 2,
                title: 'title',
                image: {
                  url:
                    'http://localhost:8000/external/media_image_url?size=medium',
                },
              }],
              components: [],
            }),
          },
        ],
      });

      await timeStub.tickAsync(4000);

      assertSpyCalls(fetchStub, 2);

      assertSpyCall(fetchStub, 1, {
        args: [
          'https://discord.com/api/v10/webhooks/undefined/token/messages/@original',
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
              embeds: [{
                type: 2,
                image: {
                  url: 'http://localhost:8000/file/stars/1.gif',
                },
              }],
              components: [],
            }),
          },
        ],
      });

      await timeStub.tickAsync(5000);

      assertSpyCalls(fetchStub, 3);

      assertSpyCall(fetchStub, 2, {
        args: [
          'https://discord.com/api/v10/webhooks/undefined/token/messages/@original',
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
              embeds: [{
                type: 2,
                title: new Rating({ popularity: 100 }).emotes,
                fields: [{
                  name: 'title',
                  value: '**name**',
                }],
                image: {
                  url:
                    'http://localhost:8000/external/character_image_url?size=medium',
                },
              }],
              components: [],
            }),
          },
        ],
      });
    } finally {
      delete config.origin;

      timeStub.restore();
      pullStub.restore();
      fetchStub.restore();
    }
  });
});

Deno.test('music', async (test) => {
  await test.step('normal search', async () => {
    const media: AniListMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.Music,
      popularity: 0,
      title: {
        english: 'english title',
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
              english: 'music',
            },
            externalLinks: [{ site: 'youtube', url: 'youtube url' }],
          },
        }],
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
                media: [media],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.music({ search: 'english title' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [],
          components: [
            {
              type: 1,
              components: [
                {
                  url: 'youtube url',
                  label: 'music',
                  style: 5,
                  type: 2,
                },
              ],
            },
          ],
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
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
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      await assertRejects(
        async () => await search.music({ search: 'x'.repeat(100) }),
        Error,
        '404',
      );

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('no available music', async () => {
    const media: AniListMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.Music,
      popularity: 0,
      title: {
        english: 'english title',
      },
      relations: {
        edges: [],
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
                media: [media],
              },
            },
          })),
      } as any),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      await assertRejects(
        async () => await search.music({ search: 'english title' }),
        Error,
        '404',
      );

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
    }
  });
});
