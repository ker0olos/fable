/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest';

import tower, {
  getEnemyMaxSkillLevel,
  getEnemyRating,
  getEnemySkillSlots,
  getFloorExp,
  MAX_FLOORS,
} from '~/src/tower.ts';

import db from '~/db/index.ts';
import utils from '~/src/utils.ts';
import config from '~/src/config.ts';
import packs from '~/src/packs.ts';

import { Character, Media, MediaType } from '~/src/types.ts';

describe('tower tests', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  test('max floors', () => {
    expect(MAX_FLOORS).toBe(20);
  });

  describe('exp gained amount', () => {
    test('floors 1-10', () => {
      expect(getFloorExp(1)).toBe(1);
      expect(getFloorExp(2)).toBe(1);
      expect(getFloorExp(3)).toBe(1);
      expect(getFloorExp(4)).toBe(1);

      expect(getFloorExp(5)).toBe(2);

      expect(getFloorExp(6)).toBe(1.5);
      expect(getFloorExp(7)).toBe(1.5);
      expect(getFloorExp(8)).toBe(1.5);
      expect(getFloorExp(9)).toBe(1.5);

      expect(getFloorExp(10)).toBe(3);
    });

    test('floors 11-20', () => {
      expect(getFloorExp(11)).toBe(2);
      expect(getFloorExp(12)).toBe(2);
      expect(getFloorExp(13)).toBe(2);
      expect(getFloorExp(14)).toBe(2);

      expect(getFloorExp(15)).toBe(4);

      expect(getFloorExp(16)).toBe(3);
      expect(getFloorExp(17)).toBe(3);
      expect(getFloorExp(18)).toBe(3);
      expect(getFloorExp(19)).toBe(3);

      expect(getFloorExp(20)).toBe(6);
    });
  });

  describe('enemy rating', () => {
    test('floors 1-10', () => {
      expect(getEnemyRating(1)).toBe(1);
      expect(getEnemyRating(2)).toBe(1);
      expect(getEnemyRating(3)).toBe(1);

      expect(getEnemyRating(4)).toBe(2);
      expect(getEnemyRating(6)).toBe(2);

      expect(getEnemyRating(7)).toBe(3);
      expect(getEnemyRating(8)).toBe(3);
      expect(getEnemyRating(9)).toBe(3);

      expect(getEnemyRating(5)).toBe(4);
      expect(getEnemyRating(10)).toBe(5);
    });

    test('floors 11-20', () => {
      expect(getEnemyRating(11)).toBe(1);
      expect(getEnemyRating(12)).toBe(1);
      expect(getEnemyRating(13)).toBe(1);

      expect(getEnemyRating(14)).toBe(2);
      expect(getEnemyRating(16)).toBe(2);

      expect(getEnemyRating(17)).toBe(3);
      expect(getEnemyRating(18)).toBe(3);
      expect(getEnemyRating(19)).toBe(3);

      expect(getEnemyRating(15)).toBe(4);
      expect(getEnemyRating(20)).toBe(5);
    });
  });

  describe('enemy skill slots', () => {
    test('floors 1-10', () => {
      expect(getEnemySkillSlots(1)).toBe(0);
      expect(getEnemySkillSlots(2)).toBe(0);
      expect(getEnemySkillSlots(3)).toBe(0);
      expect(getEnemySkillSlots(4)).toBe(0);

      expect(getEnemySkillSlots(5)).toBe(1);
      expect(getEnemySkillSlots(6)).toBe(1);
      expect(getEnemySkillSlots(7)).toBe(1);
      expect(getEnemySkillSlots(8)).toBe(1);
      expect(getEnemySkillSlots(9)).toBe(1);

      expect(getEnemySkillSlots(10)).toBe(2);
    });

    test('floors 11-20', () => {
      expect(getEnemySkillSlots(11)).toBe(2);
      expect(getEnemySkillSlots(12)).toBe(2);
      expect(getEnemySkillSlots(13)).toBe(2);
      expect(getEnemySkillSlots(14)).toBe(2);

      expect(getEnemySkillSlots(15)).toBe(3);
      expect(getEnemySkillSlots(16)).toBe(3);
      expect(getEnemySkillSlots(17)).toBe(3);
      expect(getEnemySkillSlots(18)).toBe(3);
      expect(getEnemySkillSlots(19)).toBe(3);

      expect(getEnemySkillSlots(20)).toBe(4);
    });
  });

  describe('enemy skill levels', () => {
    test('floors 1-10', () => {
      expect(getEnemyMaxSkillLevel(1)).toBe(1);
      expect(getEnemyMaxSkillLevel(2)).toBe(1);
      expect(getEnemyMaxSkillLevel(3)).toBe(1);
      expect(getEnemyMaxSkillLevel(4)).toBe(1);

      expect(getEnemyMaxSkillLevel(5)).toBe(1);
      expect(getEnemyMaxSkillLevel(6)).toBe(1);
      expect(getEnemyMaxSkillLevel(7)).toBe(1);
      expect(getEnemyMaxSkillLevel(8)).toBe(1);
      expect(getEnemyMaxSkillLevel(9)).toBe(1);

      expect(getEnemyMaxSkillLevel(10)).toBe(2);
    });

    test('floors 11-20', () => {
      expect(getEnemyMaxSkillLevel(11)).toBe(2);
      expect(getEnemyMaxSkillLevel(12)).toBe(2);
      expect(getEnemyMaxSkillLevel(13)).toBe(2);
      expect(getEnemyMaxSkillLevel(14)).toBe(2);

      expect(getEnemyMaxSkillLevel(15)).toBe(3);
      expect(getEnemyMaxSkillLevel(16)).toBe(3);
      expect(getEnemyMaxSkillLevel(17)).toBe(3);
      expect(getEnemyMaxSkillLevel(18)).toBe(3);
      expect(getEnemyMaxSkillLevel(19)).toBe(3);

      expect(getEnemyMaxSkillLevel(20)).toBe(4);
    });
  });

  describe('/tower view', () => {
    test('no floor cleared', async () => {
      const fetchSpy = vi
        .spyOn(utils, 'fetchWithRetry')
        .mockResolvedValue(undefined as any);

      vi.spyOn(db, 'getInventory').mockResolvedValue({
        floorsCleared: 0,
      } as any);

      config.combat = true;
      config.appId = 'app_id';
      config.origin = 'http://localhost:8000';

      const message = await tower.view({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner3.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner3.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchSpy).toHaveBeenCalledTimes(1);

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
        })
      );

      const body = JSON.parse(
        (fetchSpy.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      );

      expect(body).toEqual({
        attachments: [],
        embeds: [
          {
            type: 'rich',
            description: [
              '<:undiscoveredfloor:1128724910609551481> Floor 5 - Undiscovered',
              '<:undiscoveredfloor:1128724910609551481> Floor 4 - Undiscovered',
              '<:undiscoveredfloor:1128724910609551481> Floor 3 - Undiscovered',
              '<:undiscoveredfloor:1128724910609551481> Floor 2 - Undiscovered',
              '<:currentfloor:1128724907245711452> Floor 1 - Current',
            ].join('\n'),
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'tchallenge=user_id',
                disabled: false,
                label: '/bt challenge',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'treclear',
                disabled: true,
                label: '/reclear',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
      });

      delete config.appId;
      delete config.origin;
      delete config.combat;
    });

    test('1 floor cleared', async () => {
      const fetchSpy = vi
        .spyOn(utils, 'fetchWithRetry')
        .mockResolvedValue(undefined as any);

      vi.spyOn(db, 'getInventory').mockResolvedValue({
        floorsCleared: 1,
      } as any);

      config.combat = true;
      config.appId = 'app_id';
      config.origin = 'http://localhost:8000';

      const message = await tower.view({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner3.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner3.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchSpy).toHaveBeenCalledTimes(1);

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
        })
      );

      const body = JSON.parse(
        (fetchSpy.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      );

      expect(body).toEqual({
        attachments: [],
        embeds: [
          {
            type: 'rich',
            description: [
              '<:undiscoveredfloor:1128724910609551481> Floor 5 - Undiscovered',
              '<:undiscoveredfloor:1128724910609551481> Floor 4 - Undiscovered',
              '<:undiscoveredfloor:1128724910609551481> Floor 3 - Undiscovered',
              '<:currentfloor:1128724907245711452> Floor 2 - Current',
              '<:clearedfloor:1131872032456446053> Floor 1 - Cleared',
            ].join('\n'),
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'tchallenge=user_id',
                disabled: false,
                label: '/bt challenge',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'treclear',
                disabled: false,
                label: '/reclear',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
      });

      delete config.appId;
      delete config.origin;
      delete config.combat;
    });

    test('2 floors cleared', async () => {
      const fetchSpy = vi
        .spyOn(utils, 'fetchWithRetry')
        .mockResolvedValue(undefined as any);

      vi.spyOn(db, 'getInventory').mockResolvedValue({
        floorsCleared: 2,
      } as any);

      config.combat = true;
      config.appId = 'app_id';
      config.origin = 'http://localhost:8000';

      const message = await tower.view({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner3.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner3.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchSpy).toHaveBeenCalledTimes(1);

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
        })
      );

      const body = JSON.parse(
        (fetchSpy.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      );

      expect(body).toEqual({
        attachments: [],
        embeds: [
          {
            type: 'rich',
            description: [
              '<:undiscoveredfloor:1128724910609551481> Floor 5 - Undiscovered',
              '<:undiscoveredfloor:1128724910609551481> Floor 4 - Undiscovered',
              '<:currentfloor:1128724907245711452> Floor 3 - Current',
              '<:clearedfloor:1131872032456446053> Floor 2 - Cleared',
              '<:clearedfloor:1131872032456446053> Floor 1 - Cleared',
            ].join('\n'),
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'tchallenge=user_id',
                disabled: false,
                label: '/bt challenge',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'treclear',
                disabled: false,
                label: '/reclear',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
      });

      delete config.appId;
      delete config.origin;
      delete config.combat;
    });

    test('5 floors cleared', async () => {
      const fetchSpy = vi
        .spyOn(utils, 'fetchWithRetry')
        .mockResolvedValue(undefined as any);

      vi.spyOn(db, 'getInventory').mockResolvedValue({
        floorsCleared: 5,
      } as any);

      config.combat = true;
      config.appId = 'app_id';
      config.origin = 'http://localhost:8000';

      const message = await tower.view({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner3.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner3.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchSpy).toHaveBeenCalledTimes(1);

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
        })
      );

      const body = JSON.parse(
        (fetchSpy.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      );

      expect(body).toEqual({
        attachments: [],
        embeds: [
          {
            type: 'rich',
            description: [
              '<:undiscoveredfloor:1128724910609551481> Floor 8 - Undiscovered',
              '<:undiscoveredfloor:1128724910609551481> Floor 7 - Undiscovered',
              '<:currentfloor:1128724907245711452> Floor 6 - Current',
              '<:clearedfloor:1131872032456446053> Floor 5 - Cleared',
              '<:clearedfloor:1131872032456446053> Floor 4 - Cleared',
            ].join('\n'),
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'tchallenge=user_id',
                disabled: false,
                label: '/bt challenge',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'treclear',
                disabled: false,
                label: '/reclear',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
      });

      delete config.appId;
      delete config.origin;
      delete config.combat;
    });

    test('max-2 floors cleared', async () => {
      const fetchSpy = vi
        .spyOn(utils, 'fetchWithRetry')
        .mockResolvedValue(undefined as any);

      vi.spyOn(db, 'getInventory').mockResolvedValue({
        floorsCleared: MAX_FLOORS - 2,
      } as any);

      config.combat = true;
      config.appId = 'app_id';
      config.origin = 'http://localhost:8000';

      const message = await tower.view({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner3.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner3.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchSpy).toHaveBeenCalledTimes(1);

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
        })
      );

      const body = JSON.parse(
        (fetchSpy.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      );

      expect(body).toEqual({
        attachments: [],
        embeds: [
          {
            type: 'rich',
            description: [
              '<:undiscoveredfloor:1128724910609551481> Floor 20 - Undiscovered',
              '<:currentfloor:1128724907245711452> Floor 19 - Current',
              '<:clearedfloor:1131872032456446053> Floor 18 - Cleared',
              '<:clearedfloor:1131872032456446053> Floor 17 - Cleared',
              '<:clearedfloor:1131872032456446053> Floor 16 - Cleared',
            ].join('\n'),
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'tchallenge=user_id',
                disabled: false,
                label: '/bt challenge',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'treclear',
                disabled: false,
                label: '/reclear',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
      });

      delete config.appId;
      delete config.origin;
      delete config.combat;
    });

    test('max-1 floors cleared', async () => {
      const fetchSpy = vi
        .spyOn(utils, 'fetchWithRetry')
        .mockResolvedValue(undefined as any);

      vi.spyOn(db, 'getInventory').mockResolvedValue({
        floorsCleared: MAX_FLOORS - 1,
      } as any);

      config.combat = true;
      config.appId = 'app_id';
      config.origin = 'http://localhost:8000';

      const message = await tower.view({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner3.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner3.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchSpy).toHaveBeenCalledTimes(1);

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
        })
      );

      const body = JSON.parse(
        (fetchSpy.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      );

      expect(body).toEqual({
        attachments: [],
        embeds: [
          {
            type: 'rich',
            description: [
              '<:currentfloor:1128724907245711452> Floor 20 - Current',
              '<:clearedfloor:1131872032456446053> Floor 19 - Cleared',
              '<:clearedfloor:1131872032456446053> Floor 18 - Cleared',
              '<:clearedfloor:1131872032456446053> Floor 17 - Cleared',
              '<:clearedfloor:1131872032456446053> Floor 16 - Cleared',
            ].join('\n'),
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'tchallenge=user_id',
                disabled: false,
                label: '/bt challenge',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'treclear',
                disabled: false,
                label: '/reclear',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
      });

      delete config.appId;
      delete config.origin;
      delete config.combat;
    });

    test('max floors cleared', async () => {
      const fetchSpy = vi
        .spyOn(utils, 'fetchWithRetry')
        .mockResolvedValue(undefined as any);

      vi.spyOn(db, 'getInventory').mockResolvedValue({
        floorsCleared: MAX_FLOORS,
      } as any);

      config.combat = true;
      config.appId = 'app_id';
      config.origin = 'http://localhost:8000';

      const message = await tower.view({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner3.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner3.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchSpy).toHaveBeenCalledTimes(1);

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
        })
      );

      const body = JSON.parse(
        (fetchSpy.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      );

      expect(body).toEqual({
        attachments: [],
        embeds: [
          {
            type: 'rich',
            description: [
              '<:clearedfloor:1131872032456446053> Floor 20 - Cleared',
              '<:clearedfloor:1131872032456446053> Floor 19 - Cleared',
              '<:clearedfloor:1131872032456446053> Floor 18 - Cleared',
              '<:clearedfloor:1131872032456446053> Floor 17 - Cleared',
              '<:clearedfloor:1131872032456446053> Floor 16 - Cleared',
            ].join('\n'),
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'tchallenge=user_id',
                disabled: true,
                label: '/bt challenge',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'treclear',
                disabled: false,
                label: '/reclear',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
      });

      delete config.appId;
      delete config.origin;
      delete config.combat;
    });
  });

  describe('/reclear', () => {
    test('normal', async () => {
      const media: Media[] = [
        {
          id: '0',
          type: MediaType.Anime,
          title: {
            english: 'title',
          },
        },
      ];

      const characters: Character[] = [
        {
          id: '1',
          packId: 'anilist',
          name: {
            english: 'name 1',
          },
        },
        {
          id: '2',
          packId: 'anilist',
          name: {
            english: 'name 2',
          },
        },
        {
          id: '3',
          packId: 'anilist',
          name: {
            english: 'name 3',
          },
        },
        {
          id: '4',
          packId: 'anilist',
          name: {
            english: 'name 4',
          },
        },
        {
          id: '5',
          packId: 'anilist',
          name: {
            english: 'name 5',
          },
        },
      ];

      const fetchSpy = vi
        .spyOn(utils, 'fetchWithRetry')
        .mockResolvedValue(undefined as any);

      vi.spyOn(db, 'getGuild').mockResolvedValue({} as any);

      vi.spyOn(db, 'rechargeConsumables').mockResolvedValue({
        user: {},
        floorsCleared: 1,
        availableKeys: 1,
        party: {
          member1: {
            characterId: 'anilist:1',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
          member2: {
            characterId: 'anilist:2',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
          member3: {
            characterId: 'anilist:3',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
          member4: {
            characterId: 'anilist:4',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
          member5: {
            characterId: 'anilist:5',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
        },
      } as any);

      vi.spyOn(db, 'gainExp').mockResolvedValue(
        Array(5)
          .fill({
            levelUp: 0,
            skillPoints: 0,
            statPoints: 0,
            exp: 1,
            expToLevel: 10,
            expGained: 1,
          })
          .map((_, i) => ({ ..._, id: `anilist:${i + 1}` }))
      );

      vi.spyOn(packs, 'all').mockResolvedValue([
        { manifest: { id: 'anilist' } },
      ] as any);
      vi.spyOn(packs, 'media').mockResolvedValue(media);
      vi.spyOn(packs, 'characters').mockResolvedValue(characters);

      config.combat = true;
      config.appId = 'app_id';
      config.origin = 'http://localhost:8000';

      try {
        const message = await tower.reclear({
          token: 'test_token',
          userId: 'user_id',
          guildId: 'guild_id',
        });

        expect(message.json()).toEqual({
          type: 4,
          data: {
            attachments: [{ filename: 'spinner3.gif', id: '0' }],
            components: [],
            embeds: [
              {
                type: 'rich',
                image: {
                  url: 'attachment://spinner3.gif',
                },
              },
            ],
          },
        });

        await vi.runAllTimersAsync();

        expect(fetchSpy).toHaveBeenCalledTimes(1);

        expect(fetchSpy).toHaveBeenCalledWith(
          'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
          expect.objectContaining({
            method: 'PATCH',
          })
        );

        const body = JSON.parse(
          (fetchSpy.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        );

        expect(body).toEqual({
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: 'Floor 1 x1',
              description:
                '**name 1** 1(+1)/10 EXP\n' +
                '**name 2** 1(+1)/10 EXP\n' +
                '**name 3** 1(+1)/10 EXP\n' +
                '**name 4** 1(+1)/10 EXP\n' +
                '**name 5** 1(+1)/10 EXP',
            },
          ],
          components: [],
        });
      } finally {
        delete config.appId;
        delete config.origin;
        delete config.combat;

        vi.restoreAllMocks();
      }
    });

    test('multiple reclear', async () => {
      const media: Media[] = [
        {
          id: '0',
          type: MediaType.Anime,
          title: {
            english: 'title',
          },
        },
      ];

      const characters: Character[] = [
        {
          id: '1',
          packId: 'anilist',
          name: {
            english: 'name 1',
          },
        },
        {
          id: '2',
          packId: 'anilist',
          name: {
            english: 'name 2',
          },
        },
        {
          id: '3',
          packId: 'anilist',
          name: {
            english: 'name 3',
          },
        },
        {
          id: '4',
          packId: 'anilist',
          name: {
            english: 'name 4',
          },
        },
        {
          id: '5',
          packId: 'anilist',
          name: {
            english: 'name 5',
          },
        },
      ];

      const fetchSpy = vi
        .spyOn(utils, 'fetchWithRetry')
        .mockResolvedValue(undefined as any);

      vi.spyOn(db, 'getGuild').mockResolvedValue({} as any);

      vi.spyOn(db, 'rechargeConsumables').mockResolvedValue({
        user: {},
        floorsCleared: 1,
        availableKeys: 5,
        party: {
          member1: {
            characterId: 'anilist:1',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
          member2: {
            characterId: 'anilist:2',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
          member3: {
            characterId: 'anilist:3',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
          member4: {
            characterId: 'anilist:4',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
          member5: {
            characterId: 'anilist:5',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
        },
      } as any);

      vi.spyOn(db, 'gainExp').mockResolvedValue(
        Array(5)
          .fill({
            levelUp: 0,
            skillPoints: 0,
            statPoints: 0,
            exp: 1,
            expToLevel: 10,
            expGained: 1,
          })
          .map((_, i) => ({ ..._, id: `anilist:${i + 1}` }))
      );

      vi.spyOn(packs, 'all').mockResolvedValue([
        { manifest: { id: 'anilist' } },
      ] as any);
      vi.spyOn(packs, 'media').mockResolvedValue(media);
      vi.spyOn(packs, 'characters').mockResolvedValue(characters);

      config.combat = true;
      config.appId = 'app_id';
      config.origin = 'http://localhost:8000';

      try {
        const message = await tower.reclear({
          token: 'test_token',
          userId: 'user_id',
          guildId: 'guild_id',
        });

        expect(message.json()).toEqual({
          type: 4,
          data: {
            attachments: [{ filename: 'spinner3.gif', id: '0' }],
            components: [],
            embeds: [
              {
                type: 'rich',
                image: {
                  url: 'attachment://spinner3.gif',
                },
              },
            ],
          },
        });

        await vi.runAllTimersAsync();

        expect(fetchSpy).toHaveBeenCalledTimes(1);

        expect(fetchSpy).toHaveBeenCalledWith(
          'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
          expect.objectContaining({
            method: 'PATCH',
          })
        );

        const body = JSON.parse(
          (fetchSpy.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        );

        expect(body).toEqual({
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: 'Floor 1 x5',
              description:
                '**name 1** 1(+1)/10 EXP\n' +
                '**name 2** 1(+1)/10 EXP\n' +
                '**name 3** 1(+1)/10 EXP\n' +
                '**name 4** 1(+1)/10 EXP\n' +
                '**name 5** 1(+1)/10 EXP',
            },
          ],
          components: [],
        });
      } finally {
        delete config.appId;
        delete config.origin;
        delete config.combat;

        vi.restoreAllMocks();
      }
    });

    test('level up x1', async () => {
      const media: Media[] = [
        {
          id: '0',
          type: MediaType.Anime,
          title: {
            english: 'title',
          },
        },
      ];

      const characters: Character[] = [
        {
          id: '1',
          packId: 'anilist',
          name: {
            english: 'name 1',
          },
        },
        {
          id: '2',
          packId: 'anilist',
          name: {
            english: 'name 2',
          },
        },
        {
          id: '3',
          packId: 'anilist',
          name: {
            english: 'name 3',
          },
        },
        {
          id: '4',
          packId: 'anilist',
          name: {
            english: 'name 4',
          },
        },
        {
          id: '5',
          packId: 'anilist',
          name: {
            english: 'name 5',
          },
        },
      ];

      const fetchSpy = vi
        .spyOn(utils, 'fetchWithRetry')
        .mockResolvedValue(undefined as any);

      vi.spyOn(db, 'getGuild').mockResolvedValue({} as any);

      vi.spyOn(db, 'rechargeConsumables').mockResolvedValue({
        user: {},
        floorsCleared: 1,
        availableKeys: 1,
        party: {
          member1: {
            characterId: 'anilist:1',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
          member2: {
            characterId: 'anilist:2',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
          member3: {
            characterId: 'anilist:3',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
          member4: {
            characterId: 'anilist:4',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
          member5: {
            characterId: 'anilist:5',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
        },
      } as any);

      vi.spyOn(db, 'gainExp').mockResolvedValue(
        Array(5)
          .fill({
            levelUp: 1,
            skillPoints: 1,
            statPoints: 3,
            exp: 1,
            expToLevel: 10,
            expGained: 1,
          })
          .map((_, i) => ({ ..._, id: `anilist:${i + 1}` }))
      );

      vi.spyOn(packs, 'all').mockResolvedValue([
        { manifest: { id: 'anilist' } },
      ] as any);
      vi.spyOn(packs, 'media').mockResolvedValue(media);
      vi.spyOn(packs, 'characters').mockResolvedValue(characters);

      config.combat = true;
      config.appId = 'app_id';
      config.origin = 'http://localhost:8000';

      try {
        const message = await tower.reclear({
          token: 'test_token',
          userId: 'user_id',
          guildId: 'guild_id',
        });

        expect(message.json()).toEqual({
          type: 4,
          data: {
            attachments: [{ filename: 'spinner3.gif', id: '0' }],
            components: [],
            embeds: [
              {
                type: 'rich',
                image: {
                  url: 'attachment://spinner3.gif',
                },
              },
            ],
          },
        });

        await vi.runAllTimersAsync();

        expect(fetchSpy).toHaveBeenCalledTimes(1);

        expect(fetchSpy).toHaveBeenCalledWith(
          'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
          expect.objectContaining({
            method: 'PATCH',
          })
        );

        const body = JSON.parse(
          (fetchSpy.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        );

        expect(body).toEqual({
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: 'Floor 1 x1',
              description:
                '**name 1** leveled up and gained 3 stat points and 1 skill point.\n' +
                '**name 2** leveled up and gained 3 stat points and 1 skill point.\n' +
                '**name 3** leveled up and gained 3 stat points and 1 skill point.\n' +
                '**name 4** leveled up and gained 3 stat points and 1 skill point.\n' +
                '**name 5** leveled up and gained 3 stat points and 1 skill point.',
            },
          ],
          components: [],
        });
      } finally {
        delete config.appId;
        delete config.origin;
        delete config.combat;

        vi.restoreAllMocks();
      }
    });

    test('level up x2', async () => {
      const media: Media[] = [
        {
          id: '0',
          type: MediaType.Anime,
          title: {
            english: 'title',
          },
        },
      ];

      const characters: Character[] = [
        {
          id: '1',
          packId: 'anilist',
          name: {
            english: 'name 1',
          },
        },
        {
          id: '2',
          packId: 'anilist',
          name: {
            english: 'name 2',
          },
        },
        {
          id: '3',
          packId: 'anilist',
          name: {
            english: 'name 3',
          },
        },
        {
          id: '4',
          packId: 'anilist',
          name: {
            english: 'name 4',
          },
        },
        {
          id: '5',
          packId: 'anilist',
          name: {
            english: 'name 5',
          },
        },
      ];

      const fetchSpy = vi
        .spyOn(utils, 'fetchWithRetry')
        .mockResolvedValue(undefined as any);

      vi.spyOn(db, 'getGuild').mockResolvedValue({} as any);

      vi.spyOn(db, 'rechargeConsumables').mockResolvedValue({
        user: {},
        floorsCleared: 1,
        availableKeys: 1,
        party: {
          member1: {
            characterId: 'anilist:1',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
          member2: {
            characterId: 'anilist:2',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
          member3: {
            characterId: 'anilist:3',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
          member4: {
            characterId: 'anilist:4',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
          member5: {
            characterId: 'anilist:5',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
        },
      } as any);

      vi.spyOn(db, 'gainExp').mockResolvedValue(
        Array(5)
          .fill({
            levelUp: 2,
            skillPoints: 2,
            statPoints: 6,
            exp: 1,
            expToLevel: 10,
            expGained: 1,
          })
          .map((_, i) => ({ ..._, id: `anilist:${i + 1}` }))
      );

      vi.spyOn(packs, 'all').mockResolvedValue([
        { manifest: { id: 'anilist' } },
      ] as any);
      vi.spyOn(packs, 'media').mockResolvedValue(media);
      vi.spyOn(packs, 'characters').mockResolvedValue(characters);

      config.combat = true;
      config.appId = 'app_id';
      config.origin = 'http://localhost:8000';

      try {
        const message = await tower.reclear({
          token: 'test_token',
          userId: 'user_id',
          guildId: 'guild_id',
        });

        expect(message.json()).toEqual({
          type: 4,
          data: {
            attachments: [{ filename: 'spinner3.gif', id: '0' }],
            components: [],
            embeds: [
              {
                type: 'rich',
                image: {
                  url: 'attachment://spinner3.gif',
                },
              },
            ],
          },
        });

        await vi.runAllTimersAsync();

        expect(fetchSpy).toHaveBeenCalledTimes(1);

        expect(fetchSpy).toHaveBeenCalledWith(
          'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
          expect.objectContaining({
            method: 'PATCH',
          })
        );

        const body = JSON.parse(
          (fetchSpy.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        );

        expect(body).toEqual({
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: 'Floor 1 x1',
              description:
                '**name 1** leveled up 2x and gained 6 stat points and 2 skill points.\n' +
                '**name 2** leveled up 2x and gained 6 stat points and 2 skill points.\n' +
                '**name 3** leveled up 2x and gained 6 stat points and 2 skill points.\n' +
                '**name 4** leveled up 2x and gained 6 stat points and 2 skill points.\n' +
                '**name 5** leveled up 2x and gained 6 stat points and 2 skill points.',
            },
          ],
          components: [],
        });
      } finally {
        delete config.appId;
        delete config.origin;
        delete config.combat;

        vi.restoreAllMocks();
      }
    });

    test('no keys', async () => {
      const media: Media[] = [
        {
          id: '0',
          type: MediaType.Anime,
          title: {
            english: 'title',
          },
        },
      ];

      const characters: Character[] = [
        {
          id: '1',
          packId: 'anilist',
          name: {
            english: 'name 1',
          },
        },
        {
          id: '2',
          packId: 'anilist',
          name: {
            english: 'name 2',
          },
        },
        {
          id: '3',
          packId: 'anilist',
          name: {
            english: 'name 3',
          },
        },
        {
          id: '4',
          packId: 'anilist',
          name: {
            english: 'name 4',
          },
        },
        {
          id: '5',
          packId: 'anilist',
          name: {
            english: 'name 5',
          },
        },
      ];

      const fetchSpy = vi
        .spyOn(utils, 'fetchWithRetry')
        .mockResolvedValue(undefined as any);

      vi.spyOn(db, 'getGuild').mockResolvedValue({} as any);

      vi.spyOn(db, 'rechargeConsumables').mockResolvedValue({
        user: {},
        floorsCleared: 1,
        availableKeys: 0,
        party: {
          member1: {
            characterId: 'anilist:1',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
          member2: {
            characterId: 'anilist:2',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
          member3: {
            characterId: 'anilist:3',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
          member4: {
            characterId: 'anilist:4',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
          member5: {
            characterId: 'anilist:5',
            mediaId: 'anilist:0',
            rating: 1,
            combat: {},
          },
        },
      } as any);

      vi.spyOn(db, 'gainExp').mockResolvedValue(
        Array(5)
          .fill({
            levelUp: 0,
            skillPoints: 0,
            statPoints: 0,
            exp: 1,
            expToLevel: 10,
            expGained: 1,
          })
          .map((_, i) => ({ ..._, id: `anilist:${i + 1}` }))
      );

      vi.spyOn(packs, 'all').mockResolvedValue([
        { manifest: { id: 'anilist' } },
      ] as any);
      vi.spyOn(packs, 'media').mockResolvedValue(media);
      vi.spyOn(packs, 'characters').mockResolvedValue(characters);

      config.combat = true;
      config.appId = 'app_id';
      config.origin = 'http://localhost:8000';

      try {
        const message = await tower.reclear({
          token: 'test_token',
          userId: 'user_id',
          guildId: 'guild_id',
        });

        expect(message.json()).toEqual({
          type: 4,
          data: {
            attachments: [{ filename: 'spinner3.gif', id: '0' }],
            components: [],
            embeds: [
              {
                type: 'rich',
                image: {
                  url: 'attachment://spinner3.gif',
                },
              },
            ],
          },
        });

        await vi.runAllTimersAsync();

        expect(fetchSpy).toHaveBeenCalledTimes(1);

        expect(fetchSpy).toHaveBeenCalledWith(
          'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
          expect.objectContaining({
            method: 'PATCH',
          })
        );

        const body = JSON.parse(
          (fetchSpy.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        );

        expect(body).toEqual({
          attachments: [],
          embeds: [
            {
              type: 'rich',
              description: "You don't have any more keys!",
            },
            {
              type: 'rich',
              description: '_+1 key <t:600:R>_',
            },
          ],
          components: [],
        });
      } finally {
        delete config.appId;
        delete config.origin;
        delete config.combat;

        vi.restoreAllMocks();
      }
    });
  });
});
