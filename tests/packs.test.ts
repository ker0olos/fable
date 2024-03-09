// deno-lint-ignore-file no-explicit-any

import { assert, assertEquals, assertRejects } from '$std/assert/mod.ts';

import { assertSpyCalls, stub } from '$std/testing/mock.ts';
import { assertMonochromeSnapshot } from '~/tests/utils.test.ts';

import validate, { assertValidManifest } from '~/src/validate.ts';

import utils from '~/src/utils.ts';

import packs from '~/src/packs.ts';

import config from '~/src/config.ts';

import db from '~/db/mod.ts';

import * as Schema from '~/db/schema.ts';

import {
  Character,
  CharacterRole,
  DisaggregatedCharacter,
  DisaggregatedMedia,
  Media,
  MediaFormat,
  MediaRelation,
  MediaType,
} from '~/src/types.ts';

import { AniListCharacter, AniListMedia } from '~/packs/anilist/types.ts';

import { NonFetalError } from '~/src/errors.ts';

Deno.test('list', async (test) => {
  await test.step('anilist', async (test) => {
    const getGuildStub = stub(
      db,
      'getGuild',
      () => ({}) as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => ({}) as any,
    );

    const getInstancePacksStub = stub(
      db,
      'getInstancePacks',
      () => Promise.resolve([]),
    );

    try {
      const list = await packs.all({ guildId: '0' });

      const pack = list[0];

      assertEquals(list.length, 2);

      assertValidManifest(pack.manifest);

      await assertMonochromeSnapshot(test, pack);
    } finally {
      getGuildStub.restore();
      getInstanceStub.restore();
      getInstancePacksStub.restore();
    }
  });

  await test.step('vtubers', async (test) => {
    const getGuildStub = stub(
      db,
      'getGuild',
      () => ({}) as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => ({}) as any,
    );

    const getInstancePacksStub = stub(
      db,
      'getInstancePacks',
      () => Promise.resolve([]),
    );

    try {
      const list = await packs.all({ guildId: '0' });

      const pack = list[1];

      assertEquals(list.length, 2);

      assertValidManifest(pack.manifest);

      await assertMonochromeSnapshot(test, pack);
    } finally {
      getGuildStub.restore();
      getInstanceStub.restore();
      getInstancePacksStub.restore();
    }
  });

  await test.step('filter builtins (only community)', async () => {
    const getGuildStub = stub(
      db,
      'getGuild',
      () => ({}) as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => ({}) as any,
    );

    const getInstancePacksStub = stub(
      db,
      'getInstancePacks',
      () => Promise.resolve([]),
    );

    try {
      const list = await packs.all({ guildId: '0', filter: true });

      assertEquals(list.length, 0);
    } finally {
      getGuildStub.restore();
      getInstanceStub.restore();
      getInstancePacksStub.restore();
    }
  });

  await test.step('disable builtins (only community)', async () => {
    const getGuildStub = stub(
      db,
      'getGuild',
      () => ({}) as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () =>
        ({
          builtinsDisabled: true,
        }) as any,
    );

    const getInstancePacksStub = stub(
      db,
      'getInstancePacks',
      () => Promise.resolve([]),
    );

    try {
      const list = await packs.all({ guildId: '0' });

      assertEquals(list.length, 0);
    } finally {
      getGuildStub.restore();
      getInstanceStub.restore();
      getInstancePacksStub.restore();
    }
  });
});

Deno.test('reserved ids', async () => {
  const getGuildStub = stub(
    db,
    'getGuild',
    () => ({}) as any,
  );

  const getInstanceStub = stub(
    db,
    'getInstance',
    () =>
      ({
        builtinsDisabled: true,
      }) as any,
  );

  const getInstancePacksStub = stub(
    db,
    'getInstancePacks',
    () => Promise.resolve([]),
  );

  try {
    const list = await packs.all({ guildId: '0' });

    list.forEach(({ manifest }) => {
      assertEquals(validate(manifest), {
        errors: [`${manifest.id} is a reserved id`],
      });
    });
  } finally {
    getGuildStub.restore();
    getInstanceStub.restore();
    getInstancePacksStub.restore();
  }
});

Deno.test('disabled', async (test) => {
  await test.step('disabled media', () => {
    packs.cachedGuilds = {
      'guild_id': {
        packs: [],
        disables: ['another-pack:1'],
      },
    };

    try {
      assert(packs.isDisabled('another-pack:1', 'guild_id'));
    } finally {
      packs.cachedGuilds = {};
    }
  });

  await test.step('disabled character', () => {
    packs.cachedGuilds = {
      'guild_id': {
        packs: [],
        disables: ['another-pack:1'],
      },
    };

    try {
      assert(packs.isDisabled('another-pack:1', 'guild_id'));
    } finally {
      packs.cachedGuilds = {};
    }
  });

  await test.step('none', () => {
    const pack: Schema.Pack = { _id: '_', manifest: { id: 'pack-id' } } as any;

    packs.cachedGuilds = {
      'guild_id': { packs: [pack], disables: [] },
    };

    try {
      assert(!packs.isDisabled('another-pack:1', 'guild_id'));
    } finally {
      packs.cachedGuilds = {};
    }
  });
});

Deno.test('media character', async (test) => {
  await test.step('anilist (id)', async () => {
    const media: AniListMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'title',
      },
      characters: {
        pageInfo: {
          hasNextPage: true,
        },
        edges: [{
          role: CharacterRole.Main,
          node: {
            id: '2',
            name: {
              full: 'name',
            },
          },
        }],
      } as any,
    };

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
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

    const listStub = stub(packs, 'all', () =>
      Promise.resolve([
        { manifest: { id: 'anilist' } },
      ] as any));

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      const result = await packs.mediaCharacters({
        id: 'anilist:1',
        guildId: 'guild_id',
        index: 0,
      });

      assertEquals(result, {
        total: 1,
        next: false,
        media: {
          id: '1',
          packId: 'anilist',
          type: MediaType.Anime,
          format: MediaFormat.TV,
          title: {
            english: 'title',
          },
          characters: {
            edges: [
              {
                role: 'MAIN',
                node: {
                  id: '2',
                  packId: 'anilist',
                  name: {
                    english: 'name',
                  },
                },
              },
            ],
            pageInfo: {
              hasNextPage: true,
            },
          } as any,
        },
        role: CharacterRole.Main,
        character: {
          id: '2',
          packId: 'anilist',
          name: {
            english: 'name',
          },
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('anilist (title)', async () => {
    const media: Media = {
      id: '1',
      packId: 'anilist',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'title',
      },
      characters: {
        edges: [{
          role: CharacterRole.Main,
          node: {
            id: '2',
            name: {
              full: 'name',
            },
          },
        }],
      } as any,
    };

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => (undefined as any),
    );

    const listStub = stub(
      packs,
      'searchOneMedia',
      () => Promise.resolve(media),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      const result = await packs.mediaCharacters({
        search: 'title',
        guildId: 'guild_id',
        index: 0,
      });

      assertEquals(result, {
        total: 1,
        next: false,
        media: {
          id: '1',
          packId: 'anilist',
          type: MediaType.Anime,
          format: MediaFormat.TV,
          title: {
            english: 'title',
          },
          characters: {
            edges: [
              {
                role: 'MAIN',
                node: {
                  id: '2',
                  name: {
                    full: 'name',
                  },
                },
              },
            ],
          } as any,
        },
        role: CharacterRole.Main,
        character: {
          id: '2',
          name: {
            full: 'name',
          },
        } as any,
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('pack', async () => {
    const pack: Schema.Pack = {
      _id: '_',
      manifest: {
        id: 'pack-id',
        media: {
          new: [{
            id: '1',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            title: {
              english: 'title',
            },
            characters: [{
              role: CharacterRole.Main,
              characterId: '2',
            }],
          }],
        },
        characters: {
          new: [{
            id: '2',
            name: {
              english: 'name',
            },
          }],
        },
      },
    } as any;

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([pack]),
    );

    packs.cachedGuilds = {
      'guild_id': { packs: [pack], disables: [] },
    };

    try {
      const result = await packs.mediaCharacters({
        id: 'pack-id:1',
        guildId: 'guild_id',
        index: 0,
      });

      assertEquals(result, {
        total: 1,
        next: false,
        media: {
          id: '1',
          packId: 'pack-id',
          type: MediaType.Anime,
          format: MediaFormat.TV,
          title: {
            english: 'title',
          },
          relations: {
            edges: [],
          },
          characters: {
            edges: [
              {
                role: 'MAIN',
                node: {
                  id: '2',
                  packId: 'pack-id',
                  name: {
                    english: 'name',
                  },
                },
              },
            ],
          } as any,
        },
        role: CharacterRole.Main,
        character: {
          id: '2',
          packId: 'pack-id',
          name: {
            english: 'name',
          },
        },
      });
    } finally {
      packs.cachedGuilds = {};
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('pack with no characters', async () => {
    const pack: Schema.Pack = {
      _id: '_',
      manifest: {
        id: 'pack-id',
        media: {
          new: [{
            id: '1',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            title: {
              english: 'title',
            },
            characters: [],
          }],
        },
      },
    } as any;

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([pack]),
    );

    packs.cachedGuilds = {
      'guild_id': { packs: [pack], disables: [] },
    };

    try {
      const result = await packs.mediaCharacters({
        id: 'pack-id:1',
        guildId: 'guild_id',
        index: 0,
      });

      assertEquals(result, {
        total: 0,
        next: false,
        role: undefined,
        character: undefined,
        media: {
          id: '1',
          packId: 'pack-id',
          type: MediaType.Anime,
          format: MediaFormat.TV,
          title: {
            english: 'title',
          },
          relations: {
            edges: [],
          },
          characters: {
            edges: [],
          },
        },
      });
    } finally {
      packs.cachedGuilds = {};
      fetchStub.restore();
      listStub.restore();
    }
  });
});

Deno.test('aggregate media', async (test) => {
  await test.step('aggregate from anilist', async () => {
    const parent: AniListMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'media parent',
      },
    };

    const character: AniListCharacter = {
      id: '2',
      name: {
        full: 'character name',
      },
    };

    const child: DisaggregatedMedia = {
      id: '1',
      packId: 'test',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'media child',
      },
      relations: [{
        relation: MediaRelation.Parent,
        mediaId: 'anilist:1',
      }],
      characters: [{
        role: CharacterRole.Main,
        characterId: 'anilist:2',
      }],
    };

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              Page: {
                media: [parent],
                characters: [character],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(packs, 'all', () =>
      Promise.resolve([
        { manifest: { id: 'anilist' } },
      ] as any));

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      assertEquals(
        await packs.aggregate<Media>({
          guildId: 'guild_id',
          media: child,
        }),
        {
          id: '1',
          packId: 'test',
          type: MediaType.Anime,
          format: MediaFormat.TV,
          title: {
            english: 'media child',
          },
          relations: {
            edges: [{
              relation: MediaRelation.Parent,
              node: {
                id: '1',
                packId: 'anilist',
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'media parent',
                },
              },
            }],
          },
          characters: {
            edges: [{
              role: CharacterRole.Main,
              node: {
                id: '2',
                packId: 'anilist',
                name: {
                  english: 'character name',
                },
              },
            }],
          },
        },
      );

      assertSpyCalls(fetchStub, 2);
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('aggregate from pack', async () => {
    const parent: DisaggregatedMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'media parent',
      },
    };

    const character: DisaggregatedCharacter = {
      id: '2',
      name: {
        english: 'character name',
      },
    };

    const child: DisaggregatedMedia = {
      id: '1',
      packId: 'test',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'media child',
      },
      relations: [{
        relation: MediaRelation.Parent,
        mediaId: 'pack-id:1',
      }],
      characters: [{
        role: CharacterRole.Main,
        characterId: 'pack-id:2',
      }],
    };

    const pack: Schema.Pack = {
      _id: '_',
      manifest: {
        id: 'pack-id',
        media: {
          new: [parent],
        },
        characters: {
          new: [character],
        },
      },
    } as any;

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([pack]),
    );

    packs.cachedGuilds = {
      'guild_id': { packs: [pack], disables: [] },
    };

    try {
      assertEquals(
        await packs.aggregate<Media>({
          guildId: 'guild_id',
          media: child,
        }),
        {
          id: '1',
          packId: 'test',
          type: MediaType.Anime,
          format: MediaFormat.TV,
          title: {
            english: 'media child',
          },
          relations: {
            edges: [{
              relation: MediaRelation.Parent,
              node: {
                id: '1',
                packId: 'pack-id',
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'media parent',
                },
              },
            }],
          },
          characters: {
            edges: [{
              role: CharacterRole.Main,
              node: {
                id: '2',
                packId: 'pack-id',
                name: {
                  english: 'character name',
                },
              },
            }],
          },
        },
      );

      assertSpyCalls(fetchStub, 0);
    } finally {
      packs.cachedGuilds = {};
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('referring to the same media more than once (anilist)', async () => {
    const media: Media = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'media parent',
      },
    };

    const child: DisaggregatedMedia = {
      id: '1',
      packId: 'test',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'media child',
      },
      relations: [{
        relation: MediaRelation.Parent,
        mediaId: 'anilist:1',
      }, {
        relation: MediaRelation.SpinOff,
        mediaId: 'anilist:1',
      }],
    };

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
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

    const listStub = stub(packs, 'all', () =>
      Promise.resolve([
        { manifest: { id: 'anilist' } },
      ] as any));

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      assertEquals(
        await packs.aggregate<Media>({
          guildId: 'guild_id',
          media: child,
        }),
        {
          id: '1',
          packId: 'test',
          type: MediaType.Anime,
          format: MediaFormat.TV,
          title: {
            english: 'media child',
          },
          relations: {
            edges: [{
              relation: MediaRelation.Parent,
              node: {
                id: '1',
                packId: 'anilist',
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'media parent',
                },
              },
            }, {
              relation: MediaRelation.SpinOff,
              node: {
                id: '1',
                packId: 'anilist',
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'media parent',
                },
              },
            }],
          },
          characters: {
            edges: [],
          },
        },
      );

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('referring to the same media more than once (packs)', async () => {
    const media: DisaggregatedMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'media parent',
      },
    };

    const pack: Schema.Pack = {
      _id: '_',
      manifest: {
        id: 'pack-id',
        media: {
          new: [media],
        },
      },
    } as any;

    const child: DisaggregatedMedia = {
      id: '1',
      packId: 'test',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'media child',
      },
      relations: [{
        relation: MediaRelation.Parent,
        mediaId: 'pack-id:1',
      }, {
        relation: MediaRelation.SpinOff,
        mediaId: 'pack-id:1',
      }],
    };

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );
    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([pack]),
    );

    packs.cachedGuilds = {
      'guild_id': { packs: [pack], disables: [] },
    };

    try {
      assertEquals(
        await packs.aggregate<Media>({
          guildId: 'guild_id',
          media: child,
        }),
        {
          id: '1',
          packId: 'test',
          type: MediaType.Anime,
          format: MediaFormat.TV,
          title: {
            english: 'media child',
          },
          relations: {
            edges: [{
              relation: MediaRelation.Parent,
              node: {
                id: '1',
                packId: 'pack-id',
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'media parent',
                },
              },
            }, {
              relation: MediaRelation.SpinOff,
              node: {
                id: '1',
                packId: 'pack-id',
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'media parent',
                },
              },
            }],
          },
          characters: {
            edges: [],
          },
        },
      );

      assertSpyCalls(fetchStub, 0);
    } finally {
      packs.cachedGuilds = {};
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('referring to a character as a media', async () => {
    const media: DisaggregatedMedia = {
      id: '1',
      packId: 'test',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'title',
      },
      relations: [{
        relation: MediaRelation.Adaptation,
        mediaId: 'pack-id:1',
      }],
    };

    const pack: Schema.Pack = {
      _id: '_',
      manifest: {
        id: 'pack-id',
        characters: {
          new: [{
            id: '1',
            name: {
              english: 'character name',
            },
          }],
        },
      },
    } as any;

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([pack]),
    );

    packs.cachedGuilds = {
      'guild_id': { packs: [pack], disables: [] },
    };

    try {
      assertEquals(
        await packs.aggregate<Media>({
          guildId: 'guild_id',
          media,
        }),
        {
          id: '1',
          packId: 'test',
          type: MediaType.Anime,
          format: MediaFormat.TV,
          title: {
            english: 'title',
          },
          relations: {
            edges: [],
          },
          characters: {
            edges: [],
          },
        },
      );

      assertSpyCalls(fetchStub, 0);
    } finally {
      packs.cachedGuilds = {};
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('referring to a non-existing ids', async () => {
    const media: DisaggregatedMedia = {
      id: '1',
      packId: 'test',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'title',
      },
      relations: [{
        relation: MediaRelation.Prequel,
        mediaId: 'anilist:1',
      }],
      characters: [{
        role: CharacterRole.Main,
        characterId: 'pack-id:1',
      }],
    };

    const pack: Schema.Pack = {
      _id: '_',
      manifest: {
        id: 'pack-id',
        media: {
          new: [],
        },
        characters: {
          new: [],
        },
      },
    } as any;

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
                characters: [],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(packs, 'all', () =>
      Promise.resolve([
        { manifest: { id: 'anilist' } },
      ] as any));

    packs.cachedGuilds = {
      'guild_id': { packs: [pack], disables: [] },
    };

    try {
      assertEquals(
        await packs.aggregate<Media>({
          guildId: 'guild_id',
          media,
        }),
        {
          id: '1',
          packId: 'test',
          type: MediaType.Anime,
          format: MediaFormat.TV,
          title: {
            english: 'title',
          },
          relations: {
            edges: [],
          },
          characters: {
            edges: [],
          },
        },
      );

      assertSpyCalls(fetchStub, 1);
    } finally {
      packs.cachedGuilds = {};
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('referring to the same pack', async () => {
    const parent: DisaggregatedMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'media parent',
      },
    };

    const spinoff: DisaggregatedMedia = {
      id: '2',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'media spinoff',
      },
    };

    const pack: Schema.Pack = {
      _id: '_',
      manifest: {
        id: 'pack-id',
        media: {
          new: [parent, spinoff],
        },
      },
    } as any;

    const child: DisaggregatedMedia = {
      id: '3',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'media child',
      },
      relations: [{
        relation: MediaRelation.Parent,
        mediaId: 'pack-id:1',
      }, {
        relation: MediaRelation.SpinOff,
        mediaId: '2',
      }],
    };

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([pack]),
    );

    packs.cachedGuilds = {
      'guild_id': { packs: [pack], disables: [] },
    };

    try {
      assertEquals(
        await packs.aggregate<Media>({
          guildId: 'guild_id',
          media: child,
        }),
        {
          id: '3',
          packId: 'pack-id',
          type: MediaType.Anime,
          format: MediaFormat.TV,
          title: {
            english: 'media child',
          },
          relations: {
            edges: [{
              relation: MediaRelation.Parent,
              node: {
                id: '1',
                packId: 'pack-id',
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'media parent',
                },
              },
            }, {
              relation: MediaRelation.SpinOff,
              node: {
                id: '2',
                packId: 'pack-id',
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'media spinoff',
                },
              },
            }],
          },
          characters: {
            edges: [],
          },
        },
      );

      assertSpyCalls(fetchStub, 0);
    } finally {
      packs.cachedGuilds = {};
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('no recursive aggregation', async () => {
    const spinoff: DisaggregatedMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'media spinoff',
      },
      relations: [{
        mediaId: 'test:1',
        relation: MediaRelation.SpinOff,
      }],
    };

    const pack: Schema.Pack = {
      _id: '_',
      manifest: {
        id: 'pack-id',
        media: {
          new: [spinoff],
        },
      },
    } as any;

    const adaptation: DisaggregatedMedia = {
      id: '1',
      packId: 'test',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'media adaptation',
      },
      relations: [{
        relation: MediaRelation.Adaptation,
        mediaId: 'pack-id:1',
      }],
    };

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([pack]),
    );

    packs.cachedGuilds = {
      'guild_id': { packs: [pack], disables: [] },
    };

    try {
      assertEquals(
        await packs.aggregate<Media>({
          guildId: 'guild_id',
          media: adaptation,
        }),
        {
          id: '1',
          packId: 'test',
          type: MediaType.Anime,
          format: MediaFormat.TV,
          title: {
            english: 'media adaptation',
          },
          relations: {
            edges: [{
              relation: MediaRelation.Adaptation,
              node: {
                id: '1',
                packId: 'pack-id',
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'media spinoff',
                },
                relations: [{
                  mediaId: 'test:1',
                  relation: MediaRelation.SpinOff,
                }] as any,
              },
            }],
          },
          characters: {
            edges: [],
          },
        },
      );

      assertSpyCalls(fetchStub, 0);
    } finally {
      packs.cachedGuilds = {};
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('already aggregated', async () => {
    const media: Media = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'title',
      },
      relations: {
        edges: [{
          relation: MediaRelation.Sequel,
          node: {
            id: '2',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            title: {
              english: 'sequel',
            },
          },
        }],
      },
      characters: {
        edges: [{
          role: CharacterRole.Supporting,
          node: {
            id: '3',
            name: {
              english: 'character name',
            },
          },
        }],
      },
    };

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      assertEquals(
        await packs.aggregate<Media>({
          guildId: 'guild_id',
          media,
        }),
        media,
      );

      assertSpyCalls(fetchStub, 0);
      assertSpyCalls(listStub, 0);
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('empty', async () => {
    const media: Media = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'title',
      },
    };

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      assertEquals(
        await packs.aggregate<Media>({
          guildId: 'guild_id',
          media,
        }),
        {
          ...media,
          relations: {
            edges: [],
          },
          characters: {
            edges: [],
          },
        },
      );

      assertSpyCalls(fetchStub, 0);
      assertSpyCalls(listStub, 2);
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });
});

Deno.test('aggregate characters', async (test) => {
  await test.step('aggregate from anilist', async () => {
    const media: Media = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'media',
      },
    };

    const character: DisaggregatedCharacter = {
      id: '1',
      packId: 'test',
      name: {
        english: 'full name',
      },
      media: [{
        role: CharacterRole.Main,
        mediaId: 'anilist:1',
      }],
    };

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
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

    const listStub = stub(packs, 'all', () =>
      Promise.resolve([
        { manifest: { id: 'anilist' } },
      ] as any));

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      assertEquals(
        await packs.aggregate<Character>({
          guildId: 'guild_id',
          character,
        }),
        {
          id: '1',
          packId: 'test',
          name: {
            english: 'full name',
          },
          media: {
            edges: [{
              role: CharacterRole.Main,
              node: {
                id: '1',
                packId: 'anilist',
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'media',
                },
              },
            }],
          },
        },
      );

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('aggregate from pack', async () => {
    const media: DisaggregatedMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'media',
      },
    };

    const character: DisaggregatedCharacter = {
      id: '1',
      packId: 'test',
      name: {
        english: 'full name',
      },
      media: [{
        role: CharacterRole.Main,
        mediaId: 'pack-id:1',
      }],
    };

    const pack: Schema.Pack = {
      _id: '_',
      manifest: {
        id: 'pack-id',
        media: {
          new: [media],
        },
      },
    } as any;

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([pack]),
    );

    packs.cachedGuilds = {
      'guild_id': { packs: [pack], disables: [] },
    };

    try {
      assertEquals(
        await packs.aggregate<Character>({
          guildId: 'guild_id',
          character,
        }),
        {
          id: '1',
          packId: 'test',
          name: {
            english: 'full name',
          },
          media: {
            edges: [{
              role: CharacterRole.Main,
              node: {
                id: '1',
                packId: 'pack-id',
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'media',
                },
              },
            }],
          },
        },
      );

      assertSpyCalls(fetchStub, 0);
    } finally {
      fetchStub.restore();
      listStub.restore();
      packs.cachedGuilds = {};
    }
  });

  await test.step('referring to the same media more than once (anilist)', async () => {
    const media: Media = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'media',
      },
    };

    const character: DisaggregatedCharacter = {
      id: '1',
      packId: 'test',
      name: {
        english: 'full name',
      },
      media: [{
        role: CharacterRole.Main,
        mediaId: 'anilist:1',
      }, {
        role: CharacterRole.Supporting,
        mediaId: 'anilist:1',
      }],
    };

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
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

    const listStub = stub(packs, 'all', () =>
      Promise.resolve([
        { manifest: { id: 'anilist' } },
      ] as any));

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      assertEquals(
        await packs.aggregate<Character>({
          guildId: 'guild_id',
          character,
        }),
        {
          id: '1',
          packId: 'test',
          name: {
            english: 'full name',
          },
          media: {
            edges: [{
              role: CharacterRole.Main,
              node: {
                id: '1',
                packId: 'anilist',
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'media',
                },
              },
            }, {
              role: CharacterRole.Supporting,
              node: {
                id: '1',
                packId: 'anilist',
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'media',
                },
              },
            }],
          },
        },
      );

      assertSpyCalls(fetchStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('referring to the same media more than once (packs)', async () => {
    const media: DisaggregatedMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'media',
      },
    };

    const character: DisaggregatedCharacter = {
      id: '1',
      packId: 'test',
      name: {
        english: 'full name',
      },
      media: [{
        role: CharacterRole.Main,
        mediaId: 'pack-id:1',
      }, {
        role: CharacterRole.Supporting,
        mediaId: 'pack-id:1',
      }],
    };

    const pack: Schema.Pack = {
      _id: '_',
      manifest: {
        id: 'pack-id',
        media: {
          new: [media],
        },
      },
    } as any;

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([pack]),
    );

    packs.cachedGuilds = {
      'guild_id': { packs: [pack], disables: [] },
    };

    try {
      assertEquals(
        await packs.aggregate<Character>({
          guildId: 'guild_id',
          character,
        }),
        {
          id: '1',
          packId: 'test',
          name: {
            english: 'full name',
          },
          media: {
            edges: [{
              role: CharacterRole.Main,
              node: {
                id: '1',
                packId: 'pack-id',
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'media',
                },
              },
            }, {
              role: CharacterRole.Supporting,
              node: {
                id: '1',
                packId: 'pack-id',
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'media',
                },
              },
            }],
          },
        },
      );

      assertSpyCalls(fetchStub, 0);
    } finally {
      packs.cachedGuilds = {};
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('referring to a non-existing ids', async () => {
    const character: DisaggregatedCharacter = {
      id: '1',
      packId: 'test',
      name: {
        english: 'full name',
      },
      media: [{
        role: CharacterRole.Main,
        mediaId: 'anilist:1',
      }, {
        role: CharacterRole.Main,
        mediaId: 'pack-id:1',
      }],
    };

    const pack: Schema.Pack = {
      _id: '_',
      manifest: {
        id: 'pack-id',
        media: {
          new: [],
        },
        characters: {
          new: [],
        },
      },
    } as any;

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
                characters: [],
              },
            },
          }))),
      } as any),
    );

    const listStub = stub(packs, 'all', () =>
      Promise.resolve([
        { manifest: { id: 'anilist' } },
      ] as any));
    packs.cachedGuilds = {
      'guild_id': { packs: [pack], disables: [] },
    };

    try {
      assertEquals(
        await packs.aggregate<Character>({
          guildId: 'guild_id',
          character,
        }),
        {
          id: '1',
          packId: 'test',
          name: {
            english: 'full name',
          },
          media: {
            edges: [],
          },
        },
      );

      assertSpyCalls(fetchStub, 1);
    } finally {
      packs.cachedGuilds = {};
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('referring to the same pack', async () => {
    const character: DisaggregatedCharacter = {
      id: '3',
      packId: 'pack-id',
      name: {
        english: 'full name',
      },
      media: [{
        role: CharacterRole.Main,
        mediaId: 'pack-id:1',
      }, {
        role: CharacterRole.Main,
        mediaId: '2',
      }],
    };

    const pack: Schema.Pack = {
      _id: '_',
      manifest: {
        id: 'pack-id',
        media: {
          new: [{
            id: '1',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            title: {
              english: 'media 1',
            },
          }, {
            id: '2',
            type: MediaType.Manga,
            format: MediaFormat.Manga,
            title: {
              english: 'media 2',
            },
          }],
        },
      },
    } as any;

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([pack]),
    );

    packs.cachedGuilds = {
      'guild_id': { packs: [pack], disables: [] },
    };

    try {
      assertEquals(
        await packs.aggregate<Character>({
          guildId: 'guild_id',
          character,
        }),
        {
          id: '3',
          packId: 'pack-id',
          name: {
            english: 'full name',
          },
          media: {
            edges: [{
              role: CharacterRole.Main,
              node: {
                id: '1',
                packId: 'pack-id',
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'media 1',
                },
              },
            }, {
              role: CharacterRole.Main,
              node: {
                id: '2',
                packId: 'pack-id',
                type: MediaType.Manga,
                format: MediaFormat.Manga,
                title: {
                  english: 'media 2',
                },
              },
            }],
          },
        },
      );

      assertSpyCalls(fetchStub, 0);
    } finally {
      packs.cachedGuilds = {};
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('no recursive aggregation', async () => {
    const media: DisaggregatedMedia = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'media',
      },
      relations: [{
        mediaId: 'test:1',
        relation: MediaRelation.SpinOff,
      }],
    };

    const character: DisaggregatedCharacter = {
      id: '1',
      packId: 'test',
      name: {
        english: 'full name',
      },
      media: [{
        role: CharacterRole.Main,
        mediaId: 'pack-id:1',
      }],
    };

    const pack: Schema.Pack = {
      _id: '_',
      manifest: {
        id: 'pack-id',
        media: {
          new: [media],
        },
      },
    } as any;

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([pack]),
    );

    packs.cachedGuilds = {
      'guild_id': { packs: [pack], disables: [] },
    };

    try {
      assertEquals(
        await packs.aggregate<Character>({
          guildId: 'guild_id',
          character,
        }),
        {
          id: '1',
          packId: 'test',
          name: {
            english: 'full name',
          },
          media: {
            edges: [{
              role: CharacterRole.Main,
              node: {
                id: '1',
                packId: 'pack-id',
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'media',
                },
                relations: [{
                  mediaId: 'test:1',
                  relation: MediaRelation.SpinOff,
                }] as any,
              },
            }],
          },
        },
      );

      assertSpyCalls(fetchStub, 0);
    } finally {
      packs.cachedGuilds = {};
      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('already aggregated', async () => {
    const character: Character = {
      id: '1',
      name: {
        english: 'full name',
      },
      media: {
        edges: [{
          role: CharacterRole.Main,
          node: {
            id: '2',
            type: MediaType.Anime,
            format: MediaFormat.TV,
            title: {
              english: 'media',
            },
          },
        }],
      },
    };

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      assertEquals(
        await packs.aggregate<Character>({
          guildId: 'guild_id',
          character,
        }),
        character,
      );

      assertSpyCalls(fetchStub, 0);
      assertSpyCalls(listStub, 0);
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('empty', async () => {
    const character: Character = {
      id: '1',
      name: {
        english: 'full name',
      },
    };

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      assertEquals(
        await packs.aggregate<Character>({
          guildId: 'guild_id',
          character,
        }),
        {
          ...character,
          media: {
            edges: [],
          },
        },
      );

      assertSpyCalls(fetchStub, 0);
      assertSpyCalls(listStub, 1);
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });
});

Deno.test('titles to array', async (test) => {
  await test.step('all titles', () => {
    const alias = packs.aliasToArray({
      romaji: 'romaji',
      native: 'native',
      english: 'english',
    });

    assertEquals(alias, [
      'english',
      'romaji',
      'native',
    ]);
  });

  await test.step('missing 1 title', () => {
    const alias = packs.aliasToArray({
      romaji: '',
      native: 'native',
      english: 'english',
    });

    assertEquals(alias, [
      'english',
      'native',
    ]);
  });
});

Deno.test('/installed packs', async (test) => {
  await test.step('normal', async () => {
    const pack: Schema.Pack = {
      _id: '_',
      manifest: {
        author: 'author',
        id: 'pack_id',
        description: 'description',
        image: 'image',
      },
    } as any;

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([pack, pack]),
    );

    config.communityPacks = true;

    try {
      const message = await packs.pages({
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
            description: '1. `pack_id`\n2. `pack_id`',
          }],
        },
      });
    } finally {
      delete config.communityPacks;

      listStub.restore();
    }
  });

  await test.step('use title and id ', async () => {
    const pack: Schema.Pack = {
      _id: '_',
      manifest: {
        id: 'pack-id',
        title: 'Title',
      },
    } as any;

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([pack]),
    );

    config.communityPacks = true;

    try {
      const message = await packs.pages({
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
            description: '1. Title | `pack-id`',
          }],
        },
      });
    } finally {
      delete config.communityPacks;

      listStub.restore();
    }
  });

  await test.step('no packs installed', async () => {
    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    config.communityPacks = true;

    try {
      const message = await packs.pages({
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
            description: "Server doesn't have any installed packs",
          }],
        },
      });
    } finally {
      delete config.communityPacks;

      listStub.restore();
    }
  });

  await test.step('under maintenance', async () => {
    config.communityPacks = false;

    try {
      await assertRejects(
        () =>
          packs.pages({
            userId: 'user_id',
            guildId: 'guild_id',
          }),
        NonFetalError,
        'Community Packs are under maintenance, try again later!',
      );
    } finally {
      delete config.communityPacks;
    }
  });
});

Deno.test('/packs install', async (test) => {
  await test.step('normal', async () => {
    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const addPackStub = stub(
      db,
      'addPack',
      () =>
        Promise.resolve({
          _id: '_',
          manifest: {
            author: 'author',
            id: 'pack_id',
            description: 'description',
            url: 'url',
            image: 'image',
          },
        } as any),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';
    config.communityPacks = true;

    try {
      const message = await packs.install({
        id: 'pack_id',
        guildId: 'guild_id',
        userId: 'user_id',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [
            {
              description: 'Installed',
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
              title: 'pack_id',
            },
          ],
        },
      });
    } finally {
      delete config.communityPacks;
      delete config.appId;
      delete config.origin;

      getGuildStub.restore();
      getInstanceStub.restore();
      addPackStub.restore();
    }
  });

  await test.step('private pack', async () => {
    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const addPackStub = stub(
      db,
      'addPack',
      () => {
        throw new Error('PACK_PRIVATE');
      },
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';
    config.communityPacks = true;

    try {
      await assertRejects(
        async () =>
          await packs.install({
            id: 'pack_id',
            guildId: 'guild_id',
            userId: 'user_id',
          }),
        NonFetalError,
        'This pack is private and cannot be installed by you',
      );
    } finally {
      delete config.communityPacks;
      delete config.appId;
      delete config.origin;

      getGuildStub.restore();
      getInstanceStub.restore();
      addPackStub.restore();
    }
  });

  await test.step('not found', async () => {
    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const addPackStub = stub(
      db,
      'addPack',
      () => {
        throw new Error('PACK_NOT_FOUND');
      },
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';
    config.communityPacks = true;

    try {
      await assertRejects(
        async () =>
          await packs.install({
            id: 'pack_id',
            guildId: 'guild_id',
            userId: 'user_id',
          }),
        Error,
        '404',
      );
    } finally {
      delete config.communityPacks;
      delete config.appId;
      delete config.origin;

      getGuildStub.restore();
      getInstanceStub.restore();
      addPackStub.restore();
    }
  });

  await test.step('under maintenance', async () => {
    await assertRejects(
      () =>
        packs.install({
          guildId: 'guild_id',
          userId: 'user_id',
          id: 'pack_id',
        }),
      NonFetalError,
      'Community Packs are under maintenance, try again later!',
    );
  });
});

Deno.test('/packs uninstall', async (test) => {
  await test.step('normal', async () => {
    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const removePackStub = stub(
      db,
      'removePack',
      () =>
        Promise.resolve({
          _id: '_',
          manifest: {
            author: 'author',
            id: 'pack_id',
            description: 'description',
            url: 'url',
            image: 'image',
          },
        } as any),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';
    config.communityPacks = true;

    try {
      const message = await packs.uninstall({
        id: 'pack_id',
        guildId: 'guild_id',
        userId: 'user_id',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: 'Uninstalled',
            },
            {
              type: 'rich',
              description: '**All characters from this pack are now disabled**',
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
              title: 'pack_id',
            },
          ],
        },
      });
    } finally {
      delete config.communityPacks;
      delete config.appId;
      delete config.origin;

      getGuildStub.restore();
      getInstanceStub.restore();
      removePackStub.restore();
    }
  });

  await test.step('under maintenance', async () => {
    config.communityPacks = false;

    try {
      await assertRejects(
        () =>
          packs.uninstall({
            id: 'pack_id',
            guildId: 'guild_id',
            userId: 'user_id',
          }),
        NonFetalError,
        'Community Packs are under maintenance, try again later!',
      );
    } finally {
      delete config.communityPacks;
    }
  });

  await test.step('not found', async () => {
    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const removePackStub = stub(
      db,
      'removePack',
      () => {
        throw new Error('PACK_NOT_FOUND');
      },
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';
    config.communityPacks = true;

    try {
      await assertRejects(
        async () =>
          await packs.uninstall({
            id: 'pack_id',
            guildId: 'guild_id',
            userId: 'user_id',
          }),
        Error,
        '404',
      );
    } finally {
      delete config.communityPacks;
      delete config.appId;
      delete config.origin;

      getGuildStub.restore();
      getInstanceStub.restore();
      removePackStub.restore();
    }
  });

  await test.step('not installed', async () => {
    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const removePackStub = stub(
      db,
      'removePack',
      () => {
        throw new Error('PACK_NOT_INSTALLED');
      },
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';
    config.communityPacks = true;

    try {
      await assertRejects(
        async () =>
          await packs.uninstall({
            id: 'pack_id',
            guildId: 'guild_id',
            userId: 'user_id',
          }),
        Error,
        '404',
      );
    } finally {
      delete config.communityPacks;
      delete config.appId;
      delete config.origin;

      getGuildStub.restore();
      getInstanceStub.restore();
      removePackStub.restore();
    }
  });
});

Deno.test('/packs disable builtins', async (test) => {
  await test.step('normal', async () => {
    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await packs.disableBuiltins({
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'disable-builtins=user_id',
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
          embeds: [
            {
              type: 'rich',
              title: 'DANGER',
              description:
                `**Once you disable builtin packs, you can never enable them again.**\n
1. __Disabling builtin packs might negatively impact your gacha pulls,__ possibly resulting in a lot of empty pulls that don't give any characters.
2. __Your server will be permanently excluded from across-servers activities and events.__`,
            },
          ],
        },
      });
    } finally {
      delete config.appId;
      delete config.origin;

      getGuildStub.restore();
      getInstanceStub.restore();
    }
  });

  await test.step('already disabled', async () => {
    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () =>
        ({
          builtinsDisabled: true,
        }) as any,
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await packs.disableBuiltins({
        userId: 'user_id',
        guildId: 'guild_id',
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
                `**Builtin packs have been disabled, this action is irreversible.**\n
 __Your server is permanently excluded from across-servers activities and events.__`,
            },
          ],
        },
      });
    } finally {
      delete config.appId;
      delete config.origin;

      getGuildStub.restore();
      getInstanceStub.restore();
    }
  });

  await test.step('confirmed', async () => {
    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const disableBuiltinsStub = stub(
      db,
      'disableBuiltins',
      () => 'instance' as any,
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await packs.confirmDisableBuiltins({
        guildId: 'guild_id',
        userId: 'user_id',
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
                `**Builtin packs have been disabled, this action is irreversible.**\n
 __Your server is permanently excluded from across-servers activities and events.__`,
            },
          ],
        },
      });
    } finally {
      delete config.appId;
      delete config.origin;

      getGuildStub.restore();
      getInstanceStub.restore();
      disableBuiltinsStub.restore();
    }
  });
});
