// deno-lint-ignore-file no-explicit-any

import {
  assertEquals,
  assertRejects,
  unimplemented,
} from 'https://deno.land/std@0.168.0/testing/asserts.ts';

import {
  assertSpyCalls,
  stub,
} from 'https://deno.land/std@0.168.0/testing/mock.ts';

import * as search from '../src/search.ts';

import {
  Character,
  CharacterRole,
  Format,
  Media,
  RelationType,
  Type,
} from '../src/types.ts';

Deno.test('media', async (test) => {
  await test.step('normal search', async () => {
    const media: Media = {
      id: 1,
      type: Type.ANIME,
      format: Format.TV,
      description: 'long description',
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

    try {
      const message = await search.media({ search: 'query' });

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
              url: 'image_url',
            },
          }],
          components: [],
          content: undefined,
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('non-english title', async () => {
    const media: Media = {
      id: 1,
      type: Type.ANIME,
      format: Format.TV,
      description: 'long description',
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

    try {
      const message = await search.media({ search: 'query' });

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
              url: 'image_url',
            },
          }],
          components: [],
          content: undefined,
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('external links', async () => {
    const media: Media = {
      id: 1,
      type: Type.ANIME,
      format: Format.TV,
      description: 'long description',
      title: {
        english: 'english title',
      },
      coverImage: {
        color: '#ffffff',
        extraLarge: 'image_url',
      },
      externalLinks: [
        { site: 'FakeTube', url: 'url' },
        { site: 'Crunchyroll', url: 'url' },
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

    try {
      const message = await search.media({ search: 'query' });

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
              url: 'image_url',
            },
          }],
          components: [
            {
              type: 1,
              components: [
                {
                  url: 'url',
                  label: 'Crunchyroll',
                  style: 5,
                  type: 2,
                },
              ],
            },
          ],
          content: undefined,
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('youtube trailer', async () => {
    const media: Media = {
      id: 1,
      type: Type.ANIME,
      format: Format.TV,
      description: 'long description',
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

    try {
      const message = await search.media({ search: 'query' });

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
              url: 'image_url',
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
          content: undefined,
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('characters embeds', async () => {
    const media: Media = {
      id: 1,
      type: Type.ANIME,
      format: Format.TV,
      description: 'long description',
      title: {
        english: 'english title',
      },
      coverImage: {
        color: '#ffffff',
        extraLarge: 'image_url',
      },
      characters: {
        edges: [{
          role: CharacterRole.MAIN,
          node: {
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
          role: CharacterRole.SUPPORTING,
          node: {
            name: {
              full: 'supporting character name',
            },
            description: 'supporting character description',
            image: {
              large: 'supporting character url',
            },
          },
        }, {
          role: CharacterRole.BACKGROUND,
          node: {
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

    try {
      const message = await search.media({ search: 'query' });

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
              url: 'image_url',
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
              url: 'main character url',
            },
          }, {
            type: 2,
            title: 'supporting character name',
            color: 16777215,
            description: 'supporting character description',
            thumbnail: {
              url: 'supporting character url',
            },
          }],
          components: [],
          content: undefined,
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('media relations', async () => {
    const media: Media = {
      id: 1,
      type: Type.ANIME,
      format: Format.TV,
      description: 'long description',
      title: {
        english: 'english title',
      },
      coverImage: {
        color: '#ffffff',
        extraLarge: 'image_url',
      },
      relations: {
        edges: [{
          relationType: RelationType.SEQUEL,
          node: {
            id: 5,
            title: {
              english: 'sequel',
            },
          },
        }, {
          relationType: RelationType.PREQUEL,
          node: {
            id: 10,
            title: {
              english: 'prequel',
            },
          },
        }, {
          relationType: RelationType.SIDE_STORY,
          node: {
            id: 15,
            title: {
              english: 'side story',
            },
          },
        }, {
          relationType: RelationType.ADAPTATION,
          node: {
            id: 20,
            type: Type.MANGA,
            title: {
              english: 'adaptation',
            },
          },
        }, {
          relationType: RelationType.CONTAINS,
          node: {
            id: 25,
            type: Type.ANIME,
            title: {
              english: 'uninteresting relation',
            },
          },
        }, {
          relationType: RelationType.ADAPTATION,
          node: {
            id: 30,
            type: Type.ANIME,
            title: {
              english: 'second adaptation',
            },
          },
        }, {
          relationType: RelationType.ADAPTATION,
          node: {
            id: 35,
            type: Type.MANGA,
            title: {
              english: 'third adaptation',
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

    try {
      const message = await search.media({ search: 'query' });

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
              url: 'image_url',
            },
          }],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'media:5',
                  label: 'sequel (Sequel)',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'media:10',
                  label: 'prequel (Prequel)',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'media:15',
                  label: 'side story (Side Story)',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'media:20',
                  label: 'adaptation (Manga)',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'media:30',
                  label: 'second adaptation (Anime)',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
          content: undefined,
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('music relations', async () => {
    const media: Media = {
      id: 1,
      type: Type.ANIME,
      format: Format.TV,
      description: 'long description',
      title: {
        english: 'english title',
      },
      coverImage: {
        color: '#ffffff',
        extraLarge: 'image_url',
      },
      relations: {
        edges: [{
          relationType: RelationType.OTHER,
          node: {
            id: 5,
            format: Format.MUSIC,
            title: {
              english: 'op',
            },
            externalLinks: [{ site: 'youtube', url: 'youtube url' }],
          },
        }, {
          relationType: RelationType.OTHER,
          node: {
            id: 10,
            format: Format.MUSIC,
            title: {
              english: 'fk',
            },
            externalLinks: [{ site: 'spotify', url: 'spotify url' }],
          },
        }, {
          relationType: RelationType.OTHER,
          node: {
            id: 15,
            format: Format.MUSIC,
            title: {
              english: 'ed',
            },
            externalLinks: [{ site: 'spiketone', url: 'spiketone url' }],
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

    try {
      const message = await search.media({ search: 'query' });

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
              url: 'image_url',
            },
          }],
          components: [
            {
              type: 1,
              components: [
                {
                  url: 'youtube url',
                  label: 'op',
                  style: 5,
                  type: 2,
                },
                {
                  url: 'spotify url',
                  label: 'fk',
                  style: 5,
                  type: 2,
                },
                {
                  url: 'spiketone url',
                  label: 'ed',
                  style: 5,
                  type: 2,
                },
              ],
            },
          ],
          content: undefined,
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
              Page: {
                media: [],
              },
            },
          })),
      } as any),
    );

    try {
      await assertRejects(
        async () => await search.media({ search: 'query' }),
        Error,
        '404',
      );

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
    }
  });
});

Deno.test('character', async (test) => {
  await test.step('normal search', async () => {
    const character: Character = {
      id: 1,
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

    try {
      const message = await search.character({ search: 'query' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            type: 2,
            title: 'full name',
            description: 'long description',
            image: {
              url: 'image_url',
            },
            footer: {
              text: 'Male, 420',
            },
          }],
          components: [],
          content: undefined,
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('gender only', async () => {
    const character: Character = {
      id: 1,
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

    try {
      const message = await search.character({ search: 'query' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            type: 2,
            title: 'full name',
            description: 'long description',
            image: {
              url: 'image_url',
            },
            footer: {
              text: 'Female',
            },
          }],
          components: [],
          content: undefined,
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('age only', async () => {
    const character: Character = {
      id: 1,
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

    try {
      const message = await search.character({ search: 'query' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            type: 2,
            title: 'full name',
            description: 'long description',
            image: {
              url: 'image_url',
            },
            footer: {
              text: '18+',
            },
          }],
          components: [],
          content: undefined,
        },
      });

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('relations', async () => {
    const character: Character = {
      id: 1,
      description: 'long description',
      name: {
        full: 'full name',
      },
      image: {
        large: 'image_url',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.MAIN,
          node: {
            id: 5,
            title: {
              english: 'movie',
            },
            format: Format.MOVIE,
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

    try {
      const message = await search.character({ search: 'query' });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [{
            type: 2,
            title: 'full name',
            description: 'long description',
            image: {
              url: 'image_url',
            },
          }],
          components: [{
            type: 1,
            components: [{
              custom_id: 'media:5',
              label: 'movie (Movie)',
              style: 2,
              type: 2,
            }],
          }],
          content: undefined,
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
              Page: {
                characters: [],
              },
            },
          })),
      } as any),
    );

    try {
      await assertRejects(
        async () => await search.character({ search: 'query' }),
        Error,
        '404',
      );

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
    }
  });
});

Deno.test('themes', async (test) => {
  await test.step('normal search', async () => {
    const media: Media = {
      relations: {
        edges: [{
          relationType: RelationType.OTHER,
          node: {
            id: 5,
            format: Format.MUSIC,
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

    try {
      const message = await search.themes({ search: 'query' });

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
          content: undefined,
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
              Page: {
                media: [],
              },
            },
          })),
      } as any),
    );

    try {
      await assertRejects(
        async () => await search.themes({ search: 'query' }),
        Error,
        '404',
      );

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
    }
  });
});
