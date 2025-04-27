/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, afterEach } from 'vitest';

import validate from '~/src/validate.ts';
import packs from '~/src/packs.ts';
import config from '~/src/config.ts';
import db from '~/db/index.ts';
import * as Schema from '~/db/schema.ts';

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
          errors: `${id} is a reserved id`,
          ok: false,
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

  describe('titles to array', () => {
    it('all titles', () => {
      const alias = packs.aliasToArray({
        english: 'english',
        alternative: ['romaji', 'native'],
      });

      expect(alias).toEqual(['english', 'romaji', 'native']);
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

      delete config.packsUrl;

      listStub.mockRestore();
    });

    it('no packs installed', async () => {
      const listStub = vi.spyOn(packs, 'all').mockResolvedValue([]);

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

      listStub.mockRestore();
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

      await expect(
        packs.install({
          id: 'pack_id',
          guildId: 'guild_id',
          userId: 'user_id',
        })
      ).rejects.toThrow(new Error('PACK_PRIVATE'));

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

      await expect(
        packs.install({
          id: 'pack_id',
          guildId: 'guild_id',
          userId: 'user_id',
        })
      ).rejects.toThrow(new Error('PACK_NOT_FOUND'));

      delete config.appId;
      delete config.origin;

      getGuildStub.mockRestore();
      addPackStub.mockRestore();
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

      delete config.appId;
      delete config.origin;

      getGuildStub.mockRestore();
      removePackStub.mockRestore();
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

      await expect(
        packs.uninstall({
          id: 'pack_id',
          guildId: 'guild_id',
          userId: 'user_id',
        })
      ).rejects.toThrow(new Error('PACK_NOT_FOUND'));

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

      await expect(
        packs.uninstall({
          id: 'pack_id',
          guildId: 'guild_id',
          userId: 'user_id',
        })
      ).rejects.toThrow(new Error('PACK_NOT_INSTALLED'));

      delete config.appId;
      delete config.origin;

      getGuildStub.mockRestore();
      removePackStub.mockRestore();
    });
  });
});
