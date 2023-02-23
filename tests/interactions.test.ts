// deno-lint-ignore-file no-explicit-any

import {
  assertEquals,
  assertRejects,
  assertThrows,
} from 'https://deno.land/std@0.177.0/testing/asserts.ts';

import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from 'https://deno.land/std@0.177.0/testing/mock.ts';

import { assertSnapshot } from 'https://deno.land/std@0.177.0/testing/snapshot.ts';

import { FakeTime } from 'https://deno.land/std@0.177.0/testing/time.ts';

import packs from '../src/packs.ts';

import config from '../src/config.ts';

import Rating from '../src/rating.ts';

import { help } from '../src/help.ts';

import gacha, { Pull } from '../src/gacha.ts';

import * as search from '../src/search.ts';

import * as user from '../src/user.ts';

import utils from '../src/utils.ts';

import {
  Character,
  CharacterRole,
  DisaggregatedCharacter,
  Manifest,
  ManifestType,
  Media,
  MediaFormat,
  MediaRelation,
  MediaType,
} from '../src/types.ts';

import { AniListCharacter, AniListMedia } from '../packs/anilist/types.ts';

import { NonFetalError, NoPullsError } from '../src/errors.ts';

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
            type: 'rich',
            author: {
              name: 'Anime',
            },
            title: 'english title',
            description: 'long description',
            image: {
              url: 'undefined/external/image_url',
            },
          }],
          components: [],
          attachments: [],
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
            type: 'rich',
            author: {
              name: 'Anime',
            },
            title: 'native title',
            description: 'long description',
            image: {
              url: 'undefined/external/image_url',
            },
          }],
          components: [],
          attachments: [],
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
            type: 'rich',
            author: {
              name: 'Novel',
            },
            title: 'english title',
            description: 'long description',
            image: {
              url: 'undefined/external/image_url',
            },
          }],
          components: [],
          attachments: [],
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
        extraLarge: 'image_url',
      },
      externalLinks: [
        { site: 'Crunchyroll', url: 'https://crunchyroll.com/title' },
        { site: 'Crunchyroll 2', url: 'crunchyroll.com/title' },
        { site: 'YouTube', url: 'https://www.youtube.com/video' },
        { site: 'FakeTube', url: 'https://faketube.net/video' },
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
            type: 'rich',
            author: {
              name: 'Anime',
            },
            title: 'english title',
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
            type: 'rich',
            author: {
              name: 'Anime',
            },
            description: undefined,
            title: 'english title',
            image: {
              url: 'undefined/external/',
            },
          }],
          components: [],
          attachments: [],
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
            type: 'rich',
            author: {
              name: 'Anime',
            },
            title: 'english title',
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
          attachments: [],
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
            type: 'rich',
            author: {
              name: 'Anime',
            },
            title: 'english title',
            description: 'long description',
            image: {
              url: 'undefined/external/image_url',
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
              url: 'undefined/external/main%20character%20url?size=thumbnail',
            },
          }, {
            type: 'rich',
            fields: [{
              name: 'supporting character name',
              value: 'supporting character description',
            }],
            thumbnail: {
              url:
                'undefined/external/supporting%20character%20url?size=thumbnail',
            },
          }],
          components: [{
            type: 1,
            components: [{
              custom_id: 'mcharacter=anilist:1',
              label: 'View Characters',
              style: 2,
              type: 2,
            }],
          }],
          attachments: [],
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
            type: 'rich',
            author: {
              name: 'Anime',
            },
            title: 'english title',
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
          attachments: [],
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
            type: 'rich',
            author: {
              name: 'Anime',
            },
            title: 'english title',
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
          attachments: [],
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
            type: 'rich',
            author: {
              name: 'Anime',
            },
            title: 'english title',
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
          attachments: [],
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
            type: 'rich',
            author: {
              name: 'Anime',
            },
            title: 'english title',
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
          attachments: [],
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
            type: 'rich',
            author: {
              name: 'Anime',
            },
            title: 'english title',
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
            type: 'rich',
            author: {
              name: 'Anime',
            },
            title: 'english title',
            description: 'long description',
            image: {
              url: 'undefined/external/image_url',
            },
          }, {
            type: 'rich',
            fields: [{
              name: 'main character name',
              value: '\u200B',
            }],
            thumbnail: {
              url: 'undefined/external/?size=thumbnail',
            },
          }, {
            type: 'rich',
            fields: [{
              name: 'supporting character name',
              value: '\u200B',
            }],
            thumbnail: {
              url: 'undefined/external/?size=thumbnail',
            },
          }],
          components: [{
            type: 1,
            components: [{
              custom_id: 'mcharacter=anilist:1',
              label: 'View Characters',
              style: 2,
              type: 2,
            }],
          }],
          attachments: [],
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
              url: 'undefined/external/image_url?size=thumbnail',
            },
            title: 'english title',
          }],
          components: [],
          attachments: [],
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
            type: 'rich',
            description: undefined,
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
          }],
          components: [],
          attachments: [],
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
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
            type: 'rich',
            description: undefined,
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
          }],
          components: [],
          attachments: [],
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
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

Deno.test('character', async (test) => {
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
              url: 'undefined/external/image_url',
            },
            footer: {
              text: 'Male, 420',
            },
          }],
          components: [],
          attachments: [],
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
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

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              data: {
                Page: {
                  characters: [character],
                },
              },
            })),
        } as any,
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              data: {
                findCharacter: {
                  user: {
                    id: 'user_id',
                  },
                  mediaId: 'media_id',
                  rating: 3,
                },
              },
            })),
        } as any,
      ]),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = await search.character({
        search: 'full name',
        guildId: 'guild_id',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
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
              url: 'undefined/external/image_url',
            },
          }],
          components: [],
          attachments: [],
        },
      });

      assertSpyCalls(fetchStub, 2);
    } finally {
      fetchStub.restore();
      listStub.restore();
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
              url: 'undefined/external/image_url',
            },
            footer: {
              text: 'Female',
            },
          }],
          components: [],
          attachments: [],
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
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
              url: 'undefined/external/image_url',
            },
            footer: {
              text: '18+',
            },
          }],
          components: [],
          attachments: [],
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
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
              url: 'undefined/external/',
            },
          }],
          components: [],
          attachments: [],
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
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
              url: 'undefined/external/',
            },
          }],
          attachments: [],
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
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              title: 'full name',
              description: undefined,
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
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: 'full name',
              description: undefined,
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
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              title: 'full name',
              description: undefined,
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
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              title: 'full name',
              description: undefined,
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
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
    }
  });
});

Deno.test('media characters', async (test) => {
  await test.step('normal', async () => {
    const characterStub = stub(
      packs,
      'mediaCharacter',
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

    try {
      const message = await search.mediaCharacter({
        mediaId: 'pack-id:1',
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
                custom_id: 'mcharacter=pack-id:1=1',
                label: 'Next',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'media=pack-id:1',
                label: 'title',
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
      packs.clear();
    }
  });

  await test.step('with owner', async () => {
    const characterStub = stub(
      packs,
      'mediaCharacter',
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
        json: (() =>
          Promise.resolve({
            data: {
              findCharacter: {
                user: {
                  id: 'user_id',
                },
                mediaId: 'media_id',
                rating: 3,
              },
            },
          })),
      } as any),
    );

    try {
      const message = await search.mediaCharacter({
        guildId: 'guild_id',
        mediaId: 'pack-id:1',
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
                custom_id: 'mcharacter=pack-id:1=1',
                label: 'Next',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'media=pack-id:1',
                label: 'title',
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
      packs.clear();
    }
  });

  await test.step('disabled character', async () => {
    const characterStub = stub(
      packs,
      'mediaCharacter',
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

    const disabledStub = stub(packs, 'isDisabled', () => true);

    try {
      await assertRejects(
        async () =>
          await search.mediaCharacter({
            mediaId: 'pack-id:1',
            index: 0,
          }),
        NonFetalError,
        'character is disabled or invalid',
      );
    } finally {
      disabledStub.restore();
      characterStub.restore();
      packs.clear();
    }
  });

  await test.step('no characters', async () => {
    const characterStub = stub(
      packs,
      'mediaCharacter',
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

    try {
      await assertRejects(
        async () =>
          await search.mediaCharacter({
            mediaId: 'pack-id:1',
            index: 0,
          }),
        NonFetalError,
        'title contains no characters',
      );
    } finally {
      characterStub.restore();
      packs.clear();
    }
  });

  await test.step('no more characters', async () => {
    const characterStub = stub(
      packs,
      'mediaCharacter',
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

    try {
      await assertRejects(
        async () =>
          await search.mediaCharacter({
            mediaId: 'pack-id:1',
            index: 1,
          }),
        NonFetalError,
        'title contains no more characters',
      );
    } finally {
      characterStub.restore();
      packs.clear();
    }
  });

  await test.step('not found', async () => {
    const characterStub = stub(
      packs,
      'mediaCharacter',
      () =>
        Promise.resolve({
          next: false,
        }),
    );

    try {
      await assertRejects(
        async () =>
          await search.mediaCharacter({
            mediaId: 'pack-id:1',
            index: 0,
          }),
        Error,
        '404',
      );
    } finally {
      characterStub.restore();
      packs.clear();
    }
  });
});

Deno.test('collection stars', async (test) => {
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
          json: (() =>
            Promise.resolve({
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
            })),
        } as any,
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              data: {
                Page: {
                  characters: [character],
                  media: [media],
                },
              },
            })),
        } as any,
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              data: {
                Page: {
                  characters: [character],
                  media: [media],
                },
              },
            })),
        } as any,
      ]),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
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
              {
                custom_id: 'media=anilist:2',
                label: 'name (Anime)',
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
      packs.clear();
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
          json: (() =>
            Promise.resolve({
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
            })),
        } as any,
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              data: {
                Page: {
                  characters: [character],
                  media: [media],
                },
              },
            })),
        } as any,
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              data: {
                Page: {
                  characters: [character],
                  media: [media],
                },
              },
            })),
        } as any,
      ]),
    );

    const disabledStub = stub(
      packs,
      'isDisabled',
      returnsNext([true, true]),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
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
      disabledStub.restore();
      listStub.restore();
      packs.clear();
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
          json: (() =>
            Promise.resolve({
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
            })),
        } as any,
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              data: {
                Page: {
                  characters: [character],
                  media: [media],
                },
              },
            })),
        } as any,
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              data: {
                Page: {
                  characters: [character],
                  media: [media],
                },
              },
            })),
        } as any,
      ]),
    );

    const disabledStub = stub(
      packs,
      'isDisabled',
      returnsNext([false, true]),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
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
      disabledStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('no characters (Dave)', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              data: { getUserStars: {} },
            })),
        } as any,
      ]),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

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
              description: 'Dave doesn\'t have any 5* characters',
            },
          ],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });

  await test.step('no characters (Self)', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              data: { getUserStars: {} },
            })),
        } as any,
      ]),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
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
              description: 'You don\'t have any 5* characters',
            },
          ],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      packs.clear();
    }
  });
});

Deno.test('collection media', async (test) => {
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
          json: (() =>
            Promise.resolve({
              data: {
                Page: {
                  characters: [character],
                  media: [media],
                },
              },
            })),
        } as any,
        {
          ok: true,
          json: (() =>
            Promise.resolve({
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
            })),
        } as any,
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              data: {
                Page: {
                  characters: [character],
                  media: [media],
                },
              },
            })),
        } as any,
      ]),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
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
              {
                custom_id: 'media=anilist:2',
                label: 'name (Anime)',
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
      packs.clear();
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
          json: (() =>
            Promise.resolve({
              data: {
                Page: {
                  characters: [character],
                  media: [media],
                },
              },
            })),
        } as any,
      ]),
    );

    const disabledStub = stub(
      packs,
      'isDisabled',
      returnsNext([true, true]),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
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
      disabledStub.restore();
      listStub.restore();
      packs.clear();
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
          json: (() =>
            Promise.resolve({
              data: {
                Page: {
                  characters: [character],
                  media: [media],
                },
              },
            })),
        } as any,
        {
          ok: true,
          json: (() =>
            Promise.resolve({
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
            })),
        } as any,
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              data: {
                Page: {
                  characters: [character],
                  media: [media],
                },
              },
            })),
        } as any,
      ]),
    );

    const disabledStub = stub(
      packs,
      'isDisabled',
      returnsNext([false, true]),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
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
      disabledStub.restore();
      listStub.restore();
      packs.clear();
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
          json: (() =>
            Promise.resolve({
              data: {
                Page: {
                  media: [media],
                },
              },
            })),
        } as any,
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              data: { getUserMedia: {} },
            })),
        } as any,
      ]),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
    );

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
              description: 'Dave doesn\'t have any name characters',
            },
          ],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      packs.clear();
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
          json: (() =>
            Promise.resolve({
              data: {
                Page: {
                  media: [media],
                },
              },
            })),
        } as any,
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              data: { getUserMedia: {} },
            })),
        } as any,
      ]),
    );

    const listStub = stub(
      packs,
      'list',
      () => [],
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
      packs.clear();
    }
  });
});

Deno.test('gacha', async (test) => {
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = gacha.start({ token: 'test_token', userId: 'user-id' });

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
                custom_id: 'gacha=user-id',
                label: '/gacha',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'character=pack-id-2:2',
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const formData = new FormData();

      const message = gacha.start({ token: 'test_token' });

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

      formData.append(
        'payload_json',
        JSON.stringify({
          embeds: [
            {
              type: 'rich',
              description: '**You don\'t have any more pulls!**',
            },
            { type: 'rich', description: '+1 <t:1675732089:R>' },
          ],
          attachments: [],
          components: [],
        }),
      );

      await timeStub.tickAsync(0);

      assertSpyCalls(fetchStub, 1);

      assertSpyCall(fetchStub, 0, {
        args: [
          'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
          {
            method: 'PATCH',
            body: formData,
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      pullStub.restore();
      fetchStub.restore();
    }
  });
});

Deno.test('manifest embeds', async (test) => {
  await test.step('builtin packs', () => {
    const manifest: Manifest = {
      id: 'pack-id',
      type: ManifestType.Builtin,
    };

    const listStub = stub(
      packs,
      'list',
      () => [manifest, manifest],
    );

    try {
      const message = packs.embed({
        index: 0,
        type: ManifestType.Builtin,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'builtin==1',
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
                custom_id: 'builtin==1',
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
            title: 'pack-id',
            url: undefined,
          }],
        },
      });
    } finally {
      listStub.restore();
    }
  });

  await test.step('community packs', () => {
    const manifest: Manifest = {
      id: 'pack-id',
      type: ManifestType.Community,
    };

    const listStub = stub(
      packs,
      'list',
      () => [manifest, manifest],
    );

    try {
      const message = packs.embed({
        index: 1,
        type: ManifestType.Community,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'community==0',
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
                custom_id: 'community==0',
                label: 'Next',
                style: 2,
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
            description: undefined,
            title: 'pack-id',
            url: undefined,
          }],
        },
      });
    } finally {
      listStub.restore();
    }
  });

  await test.step('use title and id ', () => {
    const manifest: Manifest = {
      id: 'pack-id',
      type: ManifestType.Builtin,
      title: 'Title',
    };

    const listStub = stub(
      packs,
      'list',
      () => [manifest],
    );

    try {
      const message = packs.embed({
        index: 0,
        type: ManifestType.Builtin,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'builtin==0',
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
                custom_id: 'builtin==0',
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
            url: undefined,
          }],
        },
      });
    } finally {
      listStub.restore();
    }
  });

  await test.step('no manifest', () => {
    const listStub = stub(
      packs,
      'list',
      () => [],
    );

    try {
      const message = packs.embed({
        index: 0,
        type: ManifestType.Builtin,
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

Deno.test('help guide', async (test) => {
  await test.step('navigation', () => {
    const message = help({ userId: 'user_id', index: 0 });

    assertEquals(message.json().data.components[0].components[0], {
      custom_id: 'help==2',
      label: 'Prev',
      style: 2,
      type: 2,
    });

    assertEquals(message.json().data.components[0].components[1], {
      custom_id: '_',
      disabled: true,
      label: '1/3',
      style: 2,
      type: 2,
    });

    assertEquals(message.json().data.components[0].components[2], {
      custom_id: 'help==1',
      label: 'Next',
      style: 2,
      type: 2,
    });
  });

  await test.step('page 1', () => {
    const message = help({ userId: 'user_id', index: 0 });

    assertSnapshot(test, message.json());
  });

  await test.step('page 2', () => {
    const message = help({ userId: 'user_id', index: 1 });

    assertSnapshot(test, message.json());
  });

  await test.step('page 3', () => {
    const message = help({ userId: 'user_id', index: 2 });

    assertSnapshot(test, message.json());
  });
});

Deno.test('user', async (test) => {
  await test.step('now with pulls', async () => {
    const textStub = stub(
      utils,
      'text',
      () => Promise.resolve(new Uint8Array()),
    );

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              getUserInventory: {
                availablePulls: 5,
                lastPull: undefined,
              },
            },
          })),
      } as any),
    );

    try {
      const message = await user.now({
        userId: 'user',
        guildId: 'guild',
        channelId: 'channel',
      });

      assertSpyCalls(fetchStub, 1);
      assertSpyCalls(textStub, 1);

      assertSpyCall(textStub, 0, {
        args: [5],
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [
            {
              filename: 'pulls.png',
              id: '0',
            },
          ],
          embeds: [
            {
              footer: {
                text: 'Available Pulls',
              },
              image: {
                url: 'attachment://pulls.png',
              },
              type: 'rich',
            },
          ],
          components: [
            {
              components: [
                {
                  custom_id: 'gacha=user',
                  label: '/gacha',
                  style: 2,
                  type: 2,
                },
              ],
              type: 1,
            },
          ],
        },
      });
    } finally {
      textStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('now with no pulls', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');

    const textStub = stub(
      utils,
      'text',
      () => Promise.resolve(new Uint8Array()),
    );

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        json: (() =>
          Promise.resolve({
            data: {
              getUserInventory: {
                availablePulls: 0,
                rechargeTimestamp: time.toISOString(),
              },
            },
          })),
      } as any),
    );

    try {
      const message = await user.now({
        userId: 'guild',
        guildId: 'user',
        channelId: 'channel',
      });

      assertSpyCalls(fetchStub, 1);
      assertSpyCalls(textStub, 1);

      assertSpyCall(textStub, 0, {
        args: [0],
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [
            {
              filename: 'pulls.png',
              id: '0',
            },
          ],
          embeds: [
            {
              footer: {
                text: 'Available Pulls',
              },
              image: {
                url: 'attachment://pulls.png',
              },
              type: 'rich',
            },
            { type: 'rich', description: '+1 <t:1675568206:R>' },
          ],
          components: [],
        },
      });
    } finally {
      textStub.restore();
      fetchStub.restore();
    }
  });
});
