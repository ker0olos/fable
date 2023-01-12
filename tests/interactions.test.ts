// deno-lint-ignore-file no-explicit-any

import {
  assertEquals,
  assertRejects,
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
      type: Type.Anime,
      format: Format.TV,
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
      type: Type.Anime,
      format: Format.TV,
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
      type: Type.Anime,
      format: Format.TV,
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
      type: Type.Anime,
      format: Format.TV,
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
      type: Type.Anime,
      format: Format.TV,
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
            id: 5,
            name: {
              full: 'main character name',
            },
            description: 'main character description',
            image: {
              medium: 'main character url',
            },
            gender: 'Male',
            age: '69',
          },
        }, {
          role: CharacterRole.Supporting,
          node: {
            id: 5,
            name: {
              full: 'supporting character name',
            },
            description: 'supporting character description',
            image: {
              medium: 'supporting character url',
            },
          },
        }, {
          role: CharacterRole.Background,
          node: {
            id: 5,
            name: {
              full: 'background character name',
            },
            description: 'background character description',
            image: {
              medium: 'background character url',
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
      type: Type.Anime,
      format: Format.TV,
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
          relationType: RelationType.Sequel,
          node: {
            id: 5,
            type: Type.Anime,
            format: Format.TV,
            popularity: 0,
            title: {
              english: 'sequel',
            },
          },
        }, {
          relationType: RelationType.Prequel,
          node: {
            id: 10,
            type: Type.Anime,
            format: Format.TV,
            popularity: 0,
            title: {
              english: 'prequel',
            },
          },
        }, {
          relationType: RelationType.SideStory,
          node: {
            id: 15,
            type: Type.Anime,
            format: Format.TV,
            popularity: 0,
            title: {
              english: 'side story',
            },
          },
        }, {
          relationType: RelationType.Adaptation,
          node: {
            id: 20,
            type: Type.Manga,
            format: Format.Manga,
            popularity: 0,
            title: {
              english: 'adaptation',
            },
          },
        }, {
          relationType: RelationType.Other,
          node: {
            id: 25,
            type: Type.Anime,
            format: Format.TV,
            popularity: 0,
            title: {
              english: 'uninteresting relation',
            },
          },
        }, {
          relationType: RelationType.Adaptation,
          node: {
            id: 30,
            type: Type.Anime,
            format: Format.TV,
            popularity: 0,
            title: {
              english: 'second adaptation',
            },
          },
        }, {
          relationType: RelationType.Adaptation,
          node: {
            id: 35,
            type: Type.Manga,
            format: Format.Manga,
            popularity: 0,
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
      type: Type.Anime,
      format: Format.TV,
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
          relationType: RelationType.Other,
          node: {
            id: 5,
            type: Type.Anime,
            format: Format.Music,
            popularity: 0,
            title: {
              english: 'op',
            },
            externalLinks: [{ site: 'youtube', url: 'youtube url' }],
          },
        }, {
          relationType: RelationType.Other,
          node: {
            id: 10,
            type: Type.Anime,
            format: Format.Music,
            popularity: 0,
            title: {
              english: 'fk',
            },
            externalLinks: [{ site: 'spotify', url: 'spotify url' }],
          },
        }, {
          relationType: RelationType.Other,
          node: {
            id: 15,
            type: Type.Anime,
            format: Format.Music,
            popularity: 0,
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
          characterRole: CharacterRole.Main,
          node: {
            id: 5,
            type: Type.Anime,
            format: Format.Movie,
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

Deno.test('character debug', async (test) => {
  await test.step('no media', async () => {
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
      popularity: 1_000_000,
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
      const message = await search.character({ search: 'query', debug: true });

      assertEquals(message.json(), {
        type: 4,
        data: {
          components: [],
          content: undefined,
          embeds: [
            {
              type: 2,
              title: 'full name',
              description: undefined,
              thumbnail: {
                url: 'image_url',
              },
              fields: [
                {
                  name: 'Id',
                  value: '1',
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
    }
  });

  await test.step('no media nor popularity', async () => {
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
      const message = await search.character({ search: 'query', debug: true });

      assertEquals(message.json(), {
        type: 4,
        data: {
          components: [],
          content: undefined,
          embeds: [
            {
              type: 2,
              title: 'full name',
              description: undefined,
              thumbnail: {
                url: 'image_url',
              },
              fields: [
                {
                  name: 'Id',
                  value: '1',
                },
                {
                  name: 'Rating',
                  value: 'undefined',
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
                  value: 'undefined',
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
    }
  });

  await test.step('with media', async () => {
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
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: {
            id: 5,
            type: Type.Anime,
            format: Format.TV,
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

    try {
      const message = await search.character({ search: 'query', debug: true });

      assertEquals(message.json(), {
        type: 4,
        data: {
          components: [],
          content: undefined,
          embeds: [
            {
              type: 2,
              title: 'full name',
              description: undefined,
              thumbnail: {
                url: 'image_url',
              },
              fields: [
                {
                  name: 'Id',
                  value: '1',
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
    }
  });
});

Deno.test('themes', async (test) => {
  await test.step('normal search', async () => {
    const media: Media = {
      id: 1,
      type: Type.Anime,
      format: Format.Music,
      popularity: 0,
      title: {
        english: 'title',
      },
      relations: {
        edges: [{
          relationType: RelationType.Other,
          node: {
            id: 5,
            type: Type.Anime,
            format: Format.Music,
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

  await test.step('no available themes', async () => {
    const media: Media = {
      id: 1,
      type: Type.Anime,
      format: Format.Music,
      popularity: 0,
      title: {
        english: 'title',
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
