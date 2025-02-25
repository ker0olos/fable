/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, afterEach } from 'vitest';

import validate from '~/src/validate.ts';
import utils from '~/src/utils.ts';
import packs from '~/src/packs.ts';
import config from '~/src/config.ts';
import db from '~/db/index.ts';
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

import { NonFetalError } from '~/src/errors.ts';

describe('packs', () => {
  // Reset all mocks and restore original implementations after each test
  afterEach(() => {
    vi.restoreAllMocks();
    packs.cachedGuilds = {};
  });

  describe('list', () => {
    it('normal', async () => {
      vi.spyOn(db, 'getGuild').mockResolvedValue({ packs: [] } as any);

      const list = await packs.all({ guildId: '0' });

      expect(list.length).toBe(0);
    });
  });

  describe('reserved ids', () => {
    it('checks for reserved ids', () => {
      vi.spyOn(db, 'getGuild').mockResolvedValue({ packs: [] } as any);

      ['anilist', 'fable'].forEach((id) => {
        expect(validate({ id })).toEqual({
          errors: [`${id} is a reserved id`],
        });
      });
    });
  });

  describe('disabled', () => {
    it('disabled media', () => {
      packs.cachedGuilds = {
        guild_id: {
          packs: [],
          options: { dupes: true },
          disables: new Map([['another-pack:1', true]]),
        },
      };

      expect(packs.isDisabled('another-pack:1', 'guild_id')).toBe(true);
    });

    it('none', () => {
      const pack: Schema.Pack = {
        _id: '_',
        manifest: { id: 'pack-id' },
      } as any;

      packs.cachedGuilds = {
        guild_id: {
          packs: [pack],
          options: { dupes: true },
          disables: new Map(),
        },
      };

      expect(packs.isDisabled('another-pack:1', 'guild_id')).toBe(false);
    });
  });

  describe('media character', () => {
    it('anilist (id)', async () => {
      const media: Media = {
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
              role: CharacterRole.Main,
              node: {
                id: '2',
                packId: 'anilist',
                name: {
                  english: 'name',
                },
              },
            },
          ],
        } as any,
      };

      vi.spyOn(utils, 'fetchWithRetry').mockResolvedValue(undefined as any);
      vi.spyOn(packs, 'all').mockResolvedValue([
        { manifest: { id: 'anilist' } },
      ] as any);
      vi.spyOn(packs, 'media').mockResolvedValue([media]);
      vi.spyOn(packs, 'characters').mockResolvedValue([]);
      vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

      const result = await packs.mediaCharacters({
        id: 'anilist:1',
        guildId: 'guild_id',
        index: 0,
      });

      expect(result).toEqual({
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
    });

    it('anilist (title)', async () => {
      const media: Media = {
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
              role: CharacterRole.Main,
              node: {
                id: '2',
                name: {
                  full: 'name',
                },
              },
            },
          ],
        } as any,
      };

      vi.spyOn(utils, 'fetchWithRetry').mockResolvedValue(undefined as any);
      vi.spyOn(packs, 'searchOneMedia').mockResolvedValue(media);
      vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

      const result = await packs.mediaCharacters({
        search: 'title',
        guildId: 'guild_id',
        index: 0,
      });

      expect(result).toEqual({
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
    });

    it('pack', async () => {
      const pack: Schema.Pack = {
        _id: '_',
        manifest: {
          id: 'pack-id',
          media: {
            new: [
              {
                id: '1',
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'title',
                },
                characters: [
                  {
                    role: CharacterRole.Main,
                    characterId: '2',
                  },
                ],
              },
            ],
          },
          characters: {
            new: [
              {
                id: '2',
                name: {
                  english: 'name',
                },
              },
            ],
          },
        },
      } as any;

      vi.spyOn(utils, 'fetchWithRetry').mockResolvedValue(undefined as any);
      vi.spyOn(packs, 'all').mockResolvedValue([pack]);

      packs.cachedGuilds = {
        guild_id: {
          packs: [pack],
          options: { dupes: true },
          disables: new Map(),
        },
      };

      const result = await packs.mediaCharacters({
        id: 'pack-id:1',
        guildId: 'guild_id',
        index: 0,
      });

      expect(result).toEqual({
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
    });

    it('pack with no characters', async () => {
      const pack: Schema.Pack = {
        _id: '_',
        manifest: {
          id: 'pack-id',
          media: {
            new: [
              {
                id: '1',
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'title',
                },
                characters: [],
              },
            ],
          },
        },
      } as any;

      vi.spyOn(utils, 'fetchWithRetry').mockResolvedValue(undefined as any);
      vi.spyOn(packs, 'all').mockResolvedValue([pack]);

      packs.cachedGuilds = {
        guild_id: {
          packs: [pack],
          options: { dupes: true },
          disables: new Map(),
        },
      };

      const result = await packs.mediaCharacters({
        id: 'pack-id:1',
        guildId: 'guild_id',
        index: 0,
      });

      expect(result).toEqual({
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
    });
  });

  describe('aggregate media', () => {
    it('aggregate from pack', async () => {
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
        relations: [
          {
            relation: MediaRelation.Parent,
            mediaId: 'pack-id:1',
          },
        ],
        characters: [
          {
            role: CharacterRole.Main,
            characterId: 'pack-id:2',
          },
        ],
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

      const fetchStub = vi
        .spyOn(utils, 'fetchWithRetry')
        .mockResolvedValue(undefined as any);
      vi.spyOn(packs, 'all').mockResolvedValue([pack]);

      packs.cachedGuilds = {
        guild_id: {
          packs: [pack],
          options: { dupes: true },
          disables: new Map(),
        },
      };

      expect(
        await packs.aggregate<Media>({
          guildId: 'guild_id',
          media: child,
        })
      ).toEqual({
        id: '1',
        packId: 'test',
        type: MediaType.Anime,
        format: MediaFormat.TV,
        title: {
          english: 'media child',
        },
        relations: {
          edges: [
            {
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
            },
          ],
        },
        characters: {
          edges: [
            {
              role: CharacterRole.Main,
              node: {
                id: '2',
                packId: 'pack-id',
                name: {
                  english: 'character name',
                },
              },
            },
          ],
        },
      });

      expect(fetchStub).not.toHaveBeenCalled();
    });

    it('referring to the same media more than once (anilist)', async () => {
      const media: Media = {
        id: '1',
        packId: 'anilist',
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
        relations: [
          {
            relation: MediaRelation.Parent,
            mediaId: 'anilist:1',
          },
          {
            relation: MediaRelation.SpinOff,
            mediaId: 'anilist:1',
          },
        ],
      };

      vi.spyOn(utils, 'fetchWithRetry').mockResolvedValue(undefined as any);
      vi.spyOn(packs, 'findById').mockResolvedValue({ 'anilist:1': media });
      vi.spyOn(packs, 'all').mockResolvedValue([
        { manifest: { id: 'anilist' } },
      ] as any);
      vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

      expect(
        await packs.aggregate<Media>({
          guildId: 'guild_id',
          media: child,
        })
      ).toEqual({
        id: '1',
        packId: 'test',
        type: MediaType.Anime,
        format: MediaFormat.TV,
        title: {
          english: 'media child',
        },
        relations: {
          edges: [
            {
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
            },
            {
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
            },
          ],
        },
        characters: {
          edges: [],
        },
      });
    });

    it('referring to the same media more than once (packs)', async () => {
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
        relations: [
          {
            relation: MediaRelation.Parent,
            mediaId: 'pack-id:1',
          },
          {
            relation: MediaRelation.SpinOff,
            mediaId: 'pack-id:1',
          },
        ],
      };

      vi.spyOn(utils, 'fetchWithRetry').mockResolvedValue(undefined as any);
      vi.spyOn(packs, 'all').mockResolvedValue([pack]);

      packs.cachedGuilds = {
        guild_id: {
          packs: [pack],
          options: { dupes: true },
          disables: new Map(),
        },
      };

      expect(
        await packs.aggregate<Media>({
          guildId: 'guild_id',
          media: child,
        })
      ).toEqual({
        id: '1',
        packId: 'test',
        type: MediaType.Anime,
        format: MediaFormat.TV,
        title: {
          english: 'media child',
        },
        relations: {
          edges: [
            {
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
            },
            {
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
            },
          ],
        },
        characters: {
          edges: [],
        },
      });
    });

    it('referring to a character as a media', async () => {
      const media: DisaggregatedMedia = {
        id: '1',
        packId: 'test',
        type: MediaType.Anime,
        format: MediaFormat.TV,
        title: {
          english: 'title',
        },
        relations: [
          {
            relation: MediaRelation.Adaptation,
            mediaId: 'pack-id:1',
          },
        ],
      };

      const pack: Schema.Pack = {
        _id: '_',
        manifest: {
          id: 'pack-id',
          characters: {
            new: [
              {
                id: '1',
                name: {
                  english: 'character name',
                },
              },
            ],
          },
        },
      } as any;

      vi.spyOn(utils, 'fetchWithRetry').mockResolvedValue(undefined as any);
      vi.spyOn(packs, 'all').mockResolvedValue([pack]);

      packs.cachedGuilds = {
        guild_id: {
          packs: [pack],
          options: { dupes: true },
          disables: new Map(),
        },
      };

      expect(
        await packs.aggregate<Media>({
          guildId: 'guild_id',
          media,
        })
      ).toEqual({
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
      });
    });

    it('referring to a non-existing ids', async () => {
      const media: DisaggregatedMedia = {
        id: '1',
        packId: 'test',
        type: MediaType.Anime,
        format: MediaFormat.TV,
        title: {
          english: 'title',
        },
        relations: [
          {
            relation: MediaRelation.Prequel,
            mediaId: 'anilist:1',
          },
        ],
        characters: [
          {
            role: CharacterRole.Main,
            characterId: 'pack-id:1',
          },
        ],
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

      vi.spyOn(utils, 'fetchWithRetry').mockResolvedValue(undefined as any);
      vi.spyOn(packs, 'findById').mockResolvedValue({});
      vi.spyOn(packs, 'all').mockResolvedValue([
        { manifest: { id: 'anilist' } },
      ] as any);

      packs.cachedGuilds = {
        guild_id: {
          packs: [pack],
          options: { dupes: true },
          disables: new Map(),
        },
      };

      expect(
        await packs.aggregate<Media>({
          guildId: 'guild_id',
          media,
        })
      ).toEqual({
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
      });
    });

    it('referring to the same pack', async () => {
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
        relations: [
          {
            relation: MediaRelation.Parent,
            mediaId: 'pack-id:1',
          },
          {
            relation: MediaRelation.SpinOff,
            mediaId: '2',
          },
        ],
      };

      vi.spyOn(utils, 'fetchWithRetry').mockResolvedValue(undefined as any);
      vi.spyOn(packs, 'all').mockResolvedValue([pack]);

      packs.cachedGuilds = {
        guild_id: {
          packs: [pack],
          options: { dupes: true },
          disables: new Map(),
        },
      };

      expect(
        await packs.aggregate<Media>({
          guildId: 'guild_id',
          media: child,
        })
      ).toEqual({
        id: '3',
        packId: 'pack-id',
        type: MediaType.Anime,
        format: MediaFormat.TV,
        title: {
          english: 'media child',
        },
        relations: {
          edges: [
            {
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
            },
            {
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
            },
          ],
        },
        characters: {
          edges: [],
        },
      });
    });

    it('no recursive aggregation', async () => {
      const spinoff: DisaggregatedMedia = {
        id: '1',
        type: MediaType.Anime,
        format: MediaFormat.TV,
        title: {
          english: 'media spinoff',
        },
        relations: [
          {
            mediaId: 'test:1',
            relation: MediaRelation.SpinOff,
          },
        ],
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
        relations: [
          {
            relation: MediaRelation.Adaptation,
            mediaId: 'pack-id:1',
          },
        ],
      };

      vi.spyOn(utils, 'fetchWithRetry').mockResolvedValue(undefined as any);
      vi.spyOn(packs, 'all').mockResolvedValue([pack]);

      packs.cachedGuilds = {
        guild_id: {
          packs: [pack],
          options: { dupes: true },
          disables: new Map(),
        },
      };

      expect(
        await packs.aggregate<Media>({
          guildId: 'guild_id',
          media: adaptation,
        })
      ).toEqual({
        id: '1',
        packId: 'test',
        type: MediaType.Anime,
        format: MediaFormat.TV,
        title: {
          english: 'media adaptation',
        },
        relations: {
          edges: [
            {
              relation: MediaRelation.Adaptation,
              node: {
                id: '1',
                packId: 'pack-id',
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'media spinoff',
                },
                relations: [
                  {
                    mediaId: 'test:1',
                    relation: MediaRelation.SpinOff,
                  },
                ] as any,
              },
            },
          ],
        },
        characters: {
          edges: [],
        },
      });
    });

    it('already aggregated', async () => {
      const media: Media = {
        id: '1',
        type: MediaType.Anime,
        format: MediaFormat.TV,
        title: {
          english: 'title',
        },
        relations: {
          edges: [
            {
              relation: MediaRelation.Sequel,
              node: {
                id: '2',
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'sequel',
                },
              },
            },
          ],
        },
        characters: {
          edges: [
            {
              role: CharacterRole.Supporting,
              node: {
                id: '3',
                name: {
                  english: 'character name',
                },
              },
            },
          ],
        },
      };

      const fetchStub = vi
        .spyOn(utils, 'fetchWithRetry')
        .mockResolvedValue(undefined as any);
      const listStub = vi.spyOn(packs, 'all').mockResolvedValue([]);
      vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

      expect(
        await packs.aggregate<Media>({
          guildId: 'guild_id',
          media,
        })
      ).toEqual(media);

      expect(fetchStub).not.toHaveBeenCalled();
      expect(listStub).not.toHaveBeenCalled();
    });

    it('empty', async () => {
      const media: Media = {
        id: '1',
        type: MediaType.Anime,
        format: MediaFormat.TV,
        title: {
          english: 'title',
        },
      };

      const fetchStub = vi
        .spyOn(utils, 'fetchWithRetry')
        .mockResolvedValue(undefined as any);
      const listStub = vi.spyOn(packs, 'all').mockResolvedValue([]);
      vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

      expect(
        await packs.aggregate<Media>({
          guildId: 'guild_id',
          media,
        })
      ).toEqual({
        ...media,
        relations: {
          edges: [],
        },
        characters: {
          edges: [],
        },
      });

      expect(fetchStub).not.toHaveBeenCalled();
      expect(listStub).toHaveBeenCalledTimes(2);
    });
  });

  describe('aggregate characters', () => {
    it('aggregate from anilist', async () => {
      const media: Media = {
        id: '1',
        packId: 'anilist',
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
        media: [
          {
            role: CharacterRole.Main,
            mediaId: 'anilist:1',
          },
        ],
      };

      vi.spyOn(utils, 'fetchWithRetry').mockResolvedValue(undefined as any);
      vi.spyOn(packs, 'findById').mockResolvedValue({ 'anilist:1': media });
      vi.spyOn(packs, 'all').mockResolvedValue([
        { manifest: { id: 'anilist' } },
      ] as any);
      vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

      expect(
        await packs.aggregate<Character>({
          guildId: 'guild_id',
          character,
        })
      ).toEqual({
        id: '1',
        packId: 'test',
        name: {
          english: 'full name',
        },
        media: {
          edges: [
            {
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
            },
          ],
        },
      });
    });

    it('aggregate from pack', async () => {
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
        media: [
          {
            role: CharacterRole.Main,
            mediaId: 'pack-id:1',
          },
        ],
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

      vi.spyOn(utils, 'fetchWithRetry').mockResolvedValue(undefined as any);
      vi.spyOn(packs, 'all').mockResolvedValue([pack]);

      packs.cachedGuilds = {
        guild_id: {
          packs: [pack],
          options: { dupes: true },
          disables: new Map(),
        },
      };

      expect(
        await packs.aggregate<Character>({
          guildId: 'guild_id',
          character,
        })
      ).toEqual({
        id: '1',
        packId: 'test',
        name: {
          english: 'full name',
        },
        media: {
          edges: [
            {
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
            },
          ],
        },
      });
    });

    it('referring to the same media more than once (anilist)', async () => {
      const media: Media = {
        id: '1',
        packId: 'anilist',
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
        media: [
          {
            role: CharacterRole.Main,
            mediaId: 'anilist:1',
          },
          {
            role: CharacterRole.Supporting,
            mediaId: 'anilist:1',
          },
        ],
      };

      vi.spyOn(utils, 'fetchWithRetry').mockResolvedValue(undefined as any);
      vi.spyOn(packs, 'findById').mockResolvedValue({ 'anilist:1': media });
      vi.spyOn(packs, 'all').mockResolvedValue([
        { manifest: { id: 'anilist' } },
      ] as any);
      vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

      expect(
        await packs.aggregate<Character>({
          guildId: 'guild_id',
          character,
        })
      ).toEqual({
        id: '1',
        packId: 'test',
        name: {
          english: 'full name',
        },
        media: {
          edges: [
            {
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
            },
            {
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
            },
          ],
        },
      });
    });

    it('referring to the same media more than once (packs)', async () => {
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
        media: [
          {
            role: CharacterRole.Main,
            mediaId: 'pack-id:1',
          },
          {
            role: CharacterRole.Supporting,
            mediaId: 'pack-id:1',
          },
        ],
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

      const fetchStub = vi
        .spyOn(utils, 'fetchWithRetry')
        .mockResolvedValue(undefined as any);
      vi.spyOn(packs, 'all').mockResolvedValue([pack]);

      packs.cachedGuilds = {
        guild_id: {
          packs: [pack],
          options: { dupes: true },
          disables: new Map(),
        },
      };

      expect(
        await packs.aggregate<Character>({
          guildId: 'guild_id',
          character,
        })
      ).toEqual({
        id: '1',
        packId: 'test',
        name: {
          english: 'full name',
        },
        media: {
          edges: [
            {
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
            },
            {
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
            },
          ],
        },
      });

      expect(fetchStub).not.toHaveBeenCalled();
    });

    it('referring to a non-existing ids', async () => {
      const character: DisaggregatedCharacter = {
        id: '1',
        packId: 'test',
        name: {
          english: 'full name',
        },
        media: [
          {
            role: CharacterRole.Main,
            mediaId: 'anilist:1',
          },
          {
            role: CharacterRole.Main,
            mediaId: 'pack-id:1',
          },
        ],
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

      vi.spyOn(utils, 'fetchWithRetry').mockResolvedValue(undefined as any);
      vi.spyOn(packs, 'all').mockResolvedValue([
        { manifest: { id: 'anilist' } },
      ] as any);

      packs.cachedGuilds = {
        guild_id: {
          packs: [pack],
          options: { dupes: true },
          disables: new Map(),
        },
      };

      vi.spyOn(packs, 'findById').mockResolvedValue({ character });

      expect(
        await packs.aggregate<Character>({
          guildId: 'guild_id',
          character,
        })
      ).toEqual({
        id: '1',
        packId: 'test',
        name: {
          english: 'full name',
        },
        media: {
          edges: [],
        },
      });
    });

    it('referring to the same pack', async () => {
      const character: DisaggregatedCharacter = {
        id: '3',
        packId: 'pack-id',
        name: {
          english: 'full name',
        },
        media: [
          {
            role: CharacterRole.Main,
            mediaId: 'pack-id:1',
          },
          {
            role: CharacterRole.Main,
            mediaId: '2',
          },
        ],
      };

      const pack: Schema.Pack = {
        _id: '_',
        manifest: {
          id: 'pack-id',
          media: {
            new: [
              {
                id: '1',
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'media 1',
                },
              },
              {
                id: '2',
                type: MediaType.Manga,
                format: MediaFormat.Manga,
                title: {
                  english: 'media 2',
                },
              },
            ],
          },
        },
      } as any;

      const fetchStub = vi
        .spyOn(utils, 'fetchWithRetry')
        .mockResolvedValue(undefined as any);
      vi.spyOn(packs, 'all').mockResolvedValue([pack]);

      packs.cachedGuilds = {
        guild_id: {
          packs: [pack],
          options: { dupes: true },
          disables: new Map(),
        },
      };

      expect(
        await packs.aggregate<Character>({
          guildId: 'guild_id',
          character,
        })
      ).toEqual({
        id: '3',
        packId: 'pack-id',
        name: {
          english: 'full name',
        },
        media: {
          edges: [
            {
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
            },
            {
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
            },
          ],
        },
      });

      expect(fetchStub).not.toHaveBeenCalled();
    });

    it('no recursive aggregation', async () => {
      const media: DisaggregatedMedia = {
        id: '1',
        type: MediaType.Anime,
        format: MediaFormat.TV,
        title: {
          english: 'media',
        },
        relations: [
          {
            mediaId: 'test:1',
            relation: MediaRelation.SpinOff,
          },
        ],
      };

      const character: DisaggregatedCharacter = {
        id: '1',
        packId: 'test',
        name: {
          english: 'full name',
        },
        media: [
          {
            role: CharacterRole.Main,
            mediaId: 'pack-id:1',
          },
        ],
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

      const fetchStub = vi
        .spyOn(utils, 'fetchWithRetry')
        .mockResolvedValue(undefined as any);
      vi.spyOn(packs, 'all').mockResolvedValue([pack]);

      packs.cachedGuilds = {
        guild_id: {
          packs: [pack],
          options: { dupes: true },
          disables: new Map(),
        },
      };

      expect(
        await packs.aggregate<Character>({
          guildId: 'guild_id',
          character,
        })
      ).toEqual({
        id: '1',
        packId: 'test',
        name: {
          english: 'full name',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: {
                id: '1',
                packId: 'pack-id',
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'media',
                },
                relations: [
                  {
                    mediaId: 'test:1',
                    relation: MediaRelation.SpinOff,
                  },
                ] as any,
              },
            },
          ],
        },
      });

      expect(fetchStub).not.toHaveBeenCalled();
    });

    it('already aggregated', async () => {
      const character: Character = {
        id: '1',
        name: {
          english: 'full name',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: {
                id: '2',
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'media',
                },
              },
            },
          ],
        },
      };

      const fetchStub = vi
        .spyOn(utils, 'fetchWithRetry')
        .mockResolvedValue(undefined as any);
      const listStub = vi.spyOn(packs, 'all').mockResolvedValue([]);
      vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

      expect(
        await packs.aggregate<Character>({
          guildId: 'guild_id',
          character,
        })
      ).toEqual(character);

      expect(fetchStub).not.toHaveBeenCalled();
      expect(listStub).not.toHaveBeenCalled();
    });

    it('empty', async () => {
      const character: Character = {
        id: '1',
        name: {
          english: 'full name',
        },
      };

      const fetchStub = vi
        .spyOn(utils, 'fetchWithRetry')
        .mockResolvedValue(undefined as any);
      const listStub = vi.spyOn(packs, 'all').mockResolvedValue([]);
      vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

      expect(
        await packs.aggregate<Character>({
          guildId: 'guild_id',
          character,
        })
      ).toEqual({
        ...character,
        media: {
          edges: [],
        },
      });

      expect(fetchStub).not.toHaveBeenCalled();
      expect(listStub).toHaveBeenCalledTimes(1);
    });
  });

  describe('titles to array', () => {
    it('all titles', () => {
      const alias = packs.aliasToArray({
        romaji: 'romaji',
        native: 'native',
        english: 'english',
      });

      expect(alias).toEqual(['english', 'romaji', 'native']);
    });

    it('missing 1 title', () => {
      const alias = packs.aliasToArray({
        romaji: '',
        native: 'native',
        english: 'english',
      });

      expect(alias).toEqual(['english', 'native']);
    });
  });

  describe('/installed packs', () => {
    it('normal', async () => {
      const pack: Schema.Pack = {
        _id: '_',
        manifest: {
          author: 'author',
          id: 'pack_id',
          description: 'description',
          image: 'image',
        },
      } as any;

      const listStub = vi.spyOn(packs, 'all').mockResolvedValue([pack, pack]);

      config.packsUrl = 'http://localhost:8080/packs';
      config.communityPacks = true;

      const message = await packs.pages({
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description:
                '1. [`pack_id`](http://localhost:8080/packs/pack_id)\n' +
                '2. [`pack_id`](http://localhost:8080/packs/pack_id)',
            },
          ],
        },
      });

      delete config.communityPacks;
      delete config.packsUrl;

      listStub.mockRestore();
    });

    it('use title and id', async () => {
      const pack: Schema.Pack = {
        _id: '_',
        manifest: {
          id: 'pack-id',
          title: 'Title',
        },
      } as any;

      const listStub = vi.spyOn(packs, 'all').mockResolvedValue([pack]);

      config.packsUrl = 'http://localhost:8080/packs';
      config.communityPacks = true;

      const message = await packs.pages({
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description:
                '1. [Title | `pack-id`](http://localhost:8080/packs/pack-id)',
            },
          ],
        },
      });

      delete config.communityPacks;
      delete config.packsUrl;

      listStub.mockRestore();
    });

    it('no packs installed', async () => {
      const listStub = vi.spyOn(packs, 'all').mockResolvedValue([]);

      config.communityPacks = true;

      const message = await packs.pages({
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: "Server doesn't have any installed packs",
            },
          ],
        },
      });

      delete config.communityPacks;

      listStub.mockRestore();
    });

    it('under maintenance', async () => {
      config.communityPacks = false;

      await expect(
        packs.pages({
          userId: 'user_id',
          guildId: 'guild_id',
        })
      ).rejects.toThrow(
        new NonFetalError(
          'Community Packs are under maintenance, try again later!'
        )
      );

      delete config.communityPacks;
    });
  });

  describe('/packs install', () => {
    it('normal', async () => {
      const getGuildStub = vi
        .spyOn(db, 'getGuild')
        .mockResolvedValue('guild' as any);

      const addPackStub = vi.spyOn(db, 'addPack').mockResolvedValue({
        _id: '_',
        manifest: {
          author: 'author',
          id: 'pack_id',
          description: 'description',
          url: 'url',
          image: 'image',
        },
      } as any);

      config.appId = 'app_id';
      config.origin = 'http://localhost:8000';
      config.communityPacks = true;

      const message = await packs.install({
        id: 'pack_id',
        guildId: 'guild_id',
        userId: 'user_id',
      });

      expect(message.json()).toEqual({
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

      delete config.communityPacks;
      delete config.appId;
      delete config.origin;

      getGuildStub.mockRestore();
      addPackStub.mockRestore();
    });

    it('private pack', async () => {
      const getGuildStub = vi
        .spyOn(db, 'getGuild')
        .mockResolvedValue('guild' as any);

      const addPackStub = vi.spyOn(db, 'addPack').mockImplementation(() => {
        throw new Error('PACK_PRIVATE');
      });

      config.appId = 'app_id';
      config.origin = 'http://localhost:8000';
      config.communityPacks = true;

      await expect(
        packs.install({
          id: 'pack_id',
          guildId: 'guild_id',
          userId: 'user_id',
        })
      ).rejects.toThrow(new Error('PACK_PRIVATE'));

      delete config.communityPacks;
      delete config.appId;
      delete config.origin;

      getGuildStub.mockRestore();
      addPackStub.mockRestore();
    });

    it('not found', async () => {
      const getGuildStub = vi
        .spyOn(db, 'getGuild')
        .mockResolvedValue('guild' as any);

      const addPackStub = vi.spyOn(db, 'addPack').mockImplementation(() => {
        throw new Error('PACK_NOT_FOUND');
      });

      config.appId = 'app_id';
      config.origin = 'http://localhost:8000';
      config.communityPacks = true;

      await expect(
        packs.install({
          id: 'pack_id',
          guildId: 'guild_id',
          userId: 'user_id',
        })
      ).rejects.toThrow(new Error('PACK_NOT_FOUND'));

      delete config.communityPacks;
      delete config.appId;
      delete config.origin;

      getGuildStub.mockRestore();
      addPackStub.mockRestore();
    });

    it('under maintenance', async () => {
      await expect(
        packs.install({
          guildId: 'guild_id',
          userId: 'user_id',
          id: 'pack_id',
        })
      ).rejects.toThrow(
        new NonFetalError(
          'Community Packs are under maintenance, try again later!'
        )
      );
    });
  });

  describe('/packs uninstall', () => {
    it('normal', async () => {
      const getGuildStub = vi
        .spyOn(db, 'getGuild')
        .mockResolvedValue('guild' as any);

      const removePackStub = vi.spyOn(db, 'removePack').mockResolvedValue({
        _id: '_',
        manifest: {
          author: 'author',
          id: 'pack_id',
          description: 'description',
          url: 'url',
          image: 'image',
        },
      } as any);

      config.appId = 'app_id';
      config.origin = 'http://localhost:8000';
      config.communityPacks = true;

      const message = await packs.uninstall({
        id: 'pack_id',
        guildId: 'guild_id',
        userId: 'user_id',
      });

      expect(message.json()).toEqual({
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

      delete config.communityPacks;
      delete config.appId;
      delete config.origin;

      getGuildStub.mockRestore();
      removePackStub.mockRestore();
    });

    it('under maintenance', async () => {
      config.communityPacks = false;

      await expect(
        packs.uninstall({
          id: 'pack_id',
          guildId: 'guild_id',
          userId: 'user_id',
        })
      ).rejects.toThrow(
        new NonFetalError(
          'Community Packs are under maintenance, try again later!'
        )
      );

      delete config.communityPacks;
    });

    it('not found', async () => {
      const getGuildStub = vi
        .spyOn(db, 'getGuild')
        .mockResolvedValue('guild' as any);

      const removePackStub = vi
        .spyOn(db, 'removePack')
        .mockImplementation(() => {
          throw new Error('PACK_NOT_FOUND');
        });

      config.appId = 'app_id';
      config.origin = 'http://localhost:8000';
      config.communityPacks = true;

      await expect(
        packs.uninstall({
          id: 'pack_id',
          guildId: 'guild_id',
          userId: 'user_id',
        })
      ).rejects.toThrow(new Error('PACK_NOT_FOUND'));

      delete config.communityPacks;
      delete config.appId;
      delete config.origin;

      getGuildStub.mockRestore();
      removePackStub.mockRestore();
    });

    it('not installed', async () => {
      const getGuildStub = vi
        .spyOn(db, 'getGuild')
        .mockResolvedValue('guild' as any);

      const removePackStub = vi
        .spyOn(db, 'removePack')
        .mockImplementation(() => {
          throw new Error('PACK_NOT_INSTALLED');
        });

      config.appId = 'app_id';
      config.origin = 'http://localhost:8000';
      config.communityPacks = true;

      await expect(
        packs.uninstall({
          id: 'pack_id',
          guildId: 'guild_id',
          userId: 'user_id',
        })
      ).rejects.toThrow(new Error('PACK_NOT_INSTALLED'));

      delete config.communityPacks;
      delete config.appId;
      delete config.origin;

      getGuildStub.mockRestore();
      removePackStub.mockRestore();
    });
  });
});
