/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

import packs from '~/src/packs.ts';
import utils from '~/src/utils.ts';

import steal from '~/src/steal.ts';

import config from '~/src/config.ts';

import db, { ObjectId } from '~/db/index.ts';

import { Character, CharacterRole, MediaType } from '~/src/types.ts';

import { NonFetalError } from '~/src/errors.ts';

beforeEach(() => {
  // Setup fake timers
  vi.useFakeTimers({ now: 0 });
});

afterEach(() => {
  // Clean up all mocks and timers
  vi.restoreAllMocks();
  vi.clearAllTimers();

  // Clean up config
  delete config.stealing;
  delete config.appId;
  delete config.origin;
});

describe('chances', () => {
  describe('5*', () => {
    const rating = 5;

    test('no inactive time', () => {
      const inactiveDays = steal.getInactiveDays({
        lastPull: undefined,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(90);
    });

    test('1 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 1);

      const inactiveDays = steal.getInactiveDays({
        lastPull: date,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(1);
    });

    test('7 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 7);

      const inactiveDays = steal.getInactiveDays({
        lastPull: date,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(26);
    });

    test('15 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 15);

      const inactiveDays = steal.getInactiveDays({
        lastPull: date,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(51);
    });

    test('32 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 32);

      const inactiveDays = steal.getInactiveDays({
        lastPull: date,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(90);
    });
  });

  describe('4*', () => {
    const rating = 4;

    test('no inactive time', () => {
      const inactiveDays = steal.getInactiveDays({
        lastPull: undefined,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(90);
    });

    test('1 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 1);

      const inactiveDays = steal.getInactiveDays({
        lastPull: date,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(3);
    });

    test('6 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 8);

      const inactiveDays = steal.getInactiveDays({
        lastPull: date,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(28);
    });

    test('15 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 15);

      const inactiveDays = steal.getInactiveDays({
        lastPull: date,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(53);
    });

    test('32 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 32);

      const inactiveDays = steal.getInactiveDays({
        lastPull: date,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(90);
    });
  });

  describe('3*', () => {
    const rating = 3;

    test('no inactive time', () => {
      const inactiveDays = steal.getInactiveDays({
        lastPull: undefined,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(90);
    });

    test('1 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 1);

      const inactiveDays = steal.getInactiveDays({
        lastPull: date,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(15);
    });

    test('7 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 7);

      const inactiveDays = steal.getInactiveDays({
        lastPull: date,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(40);
    });

    test('15 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 15);

      const inactiveDays = steal.getInactiveDays({
        lastPull: date,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(65);
    });

    test('32 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 32);

      const inactiveDays = steal.getInactiveDays({
        lastPull: date,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(90);
    });
  });

  describe('2*', () => {
    const rating = 2;

    test('no inactive time', () => {
      const inactiveDays = steal.getInactiveDays({
        lastPull: undefined,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(90);
    });

    test('1 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 1);

      const inactiveDays = steal.getInactiveDays({
        lastPull: date,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(25);
    });

    test('7 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 7);

      const inactiveDays = steal.getInactiveDays({
        lastPull: date,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(50);
    });

    test('15 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 15);

      const inactiveDays = steal.getInactiveDays({
        lastPull: date,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(75);
    });

    test('32 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 32);

      const inactiveDays = steal.getInactiveDays({
        lastPull: date,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(90);
    });
  });

  describe('1*', () => {
    const rating = 1;

    test('no inactive time', () => {
      const inactiveDays = steal.getInactiveDays({
        lastPull: undefined,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(90);
    });

    test('1 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 1);

      const inactiveDays = steal.getInactiveDays({
        lastPull: date,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(50);
    });

    test('7 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 7);

      const inactiveDays = steal.getInactiveDays({
        lastPull: date,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(75);
    });

    test('15 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 15);

      const inactiveDays = steal.getInactiveDays({
        lastPull: date,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(90);
    });

    test('32 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 32);

      const inactiveDays = steal.getInactiveDays({
        lastPull: date,
      });

      const chance = steal.getChances(
        {
          rating,
        } as any,
        inactiveDays
      );

      expect(chance).toBe(90);
    });
  });
});

describe('/steal', () => {
  const character: Character = {
    id: '1',
    packId: 'id',
    rating: 1,
    description: 'long description',
    name: {
      english: 'full name',
    },
    images: [
      {
        url: 'image_url',
      },
    ],
    media: {
      edges: [
        {
          role: CharacterRole.Main,
          node: {
            id: 'media',
            packId: 'id',
            type: MediaType.Anime,
            title: {
              english: 'media title',
            },
          },
        },
      ],
    },
  };

  test('normal', async () => {
    const fetchMock = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValueOnce(undefined as any)
      .mockResolvedValueOnce(undefined as any);

    vi.spyOn(packs, 'all').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    vi.spyOn(db, 'rechargeConsumables').mockResolvedValue({
      party: {},
      user: { discordId: 'user-id' },
      stealTimestamp: undefined,
    } as any);

    vi.spyOn(db, 'findCharacter').mockResolvedValue([
      {
        rating: 2,
        characterId: 'id:1',
        userId: 'another_user_id',
        inventory: { party: {} },
      },
    ] as any);

    vi.spyOn(db, 'getGuild').mockResolvedValue({
      options: undefined,
    } as any);

    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await steal.pre({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      id: 'character_id',
    });

    await vi.runAllTimersAsync();

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
    );

    expect(fetchMock.mock.calls[0][1]?.method).toBe('PATCH');

    expect(
      JSON.parse(
        (fetchMock.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      embeds: [
        {
          type: 'rich',
          description: '<@another_user_id>',
          fields: [
            {
              name: 'media title',
              value: '**full name**',
            },
          ],
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
        },
        {
          type: 'rich',
          description: 'Your chance of success is **90.00%**',
        },
      ],
      components: [
        {
          components: [
            {
              custom_id: 'steal=another_user_id=id:1=90',
              label: 'Attempt',
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
          type: 1,
        },
      ],
      attachments: [{ filename: 'image-url.webp', id: '0' }],
    });
  });

  test('on cooldown', async () => {
    // Set specific date for the test
    vi.setSystemTime(new Date('2011/1/25 00:00 UTC'));

    const fetchMock = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValueOnce(undefined as any)
      .mockResolvedValueOnce(undefined as any);

    vi.spyOn(packs, 'all').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    vi.spyOn(db, 'rechargeConsumables').mockResolvedValue({
      party: {},
      user: { discordId: 'user-id' },
      stealTimestamp: new Date(),
    } as any);

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await steal.pre({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      id: 'character_id',
    });

    await vi.runAllTimersAsync();

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
    );

    expect(fetchMock.mock.calls[0][1]?.method).toBe('PATCH');

    expect(
      JSON.parse(
        (fetchMock.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      embeds: [
        {
          type: 'rich',
          description: 'Steal is on cooldown, try again <t:1296172800:R>',
        },
      ],
      components: [],
      attachments: [],
    });
  });

  test('stealing from party (inactive user)', async () => {
    const fetchMock = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValueOnce(undefined as any)
      .mockResolvedValueOnce(undefined as any);

    vi.spyOn(packs, 'all').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    vi.spyOn(db, 'rechargeConsumables').mockResolvedValue({
      party: {},
      user: { discordId: 'user-id' },
      stealTimestamp: undefined,
    } as any);

    vi.spyOn(db, 'findCharacter').mockResolvedValue([
      {
        rating: 2,
        characterId: 'id:1',
        userId: 'another_user_id',
        inventory: {
          party: {
            member1: { characterId: 'id:1' },
          },
        },
      },
    ] as any);

    vi.spyOn(db, 'getGuild').mockResolvedValue({
      options: undefined,
    } as any);

    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await steal.pre({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      id: 'character_id',
    });

    await vi.runAllTimersAsync();

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
    );

    expect(fetchMock.mock.calls[0][1]?.method).toBe('PATCH');

    expect(
      JSON.parse(
        (fetchMock.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      embeds: [
        {
          type: 'rich',
          description: '<@another_user_id>',
          fields: [
            {
              name: 'media title',
              value: '**full name**',
            },
          ],
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
        },
        {
          type: 'rich',
          description: 'Your chance of success is **90.00%**',
        },
      ],
      components: [
        {
          components: [
            {
              custom_id: 'steal=another_user_id=id:1=90',
              label: 'Attempt',
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
          type: 1,
        },
      ],
      attachments: [{ filename: 'image-url.webp', id: '0' }],
    });
  });

  test('stealing from party (active user)', async () => {
    const id = new ObjectId();

    const fetchMock = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValueOnce(undefined as any)
      .mockResolvedValueOnce(undefined as any);

    vi.spyOn(packs, 'all').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    vi.spyOn(db, 'rechargeConsumables').mockResolvedValue({
      party: {},
      user: { discordId: 'user-id' },
      stealTimestamp: undefined,
    } as any);

    vi.spyOn(db, 'findCharacter').mockResolvedValue([
      {
        _id: id,
        rating: 2,
        characterId: 'id:1',
        userId: 'another_user_id',
        inventory: {
          lastPull: new Date(),
          party: {
            member1Id: id,
          },
        },
      },
    ] as any);

    vi.spyOn(db, 'getGuild').mockResolvedValue({
      options: undefined,
    } as any);

    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await steal.pre({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      id: 'character_id',
    });

    await vi.runAllTimersAsync();

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
    );

    expect(fetchMock.mock.calls[0][1]?.method).toBe('PATCH');

    expect(
      JSON.parse(
        (fetchMock.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      components: [],
      attachments: [{ filename: 'image-url.webp', id: '0' }],
      embeds: [
        {
          type: 'rich',
          description:
            "As part of <@another_user_id>'s party, **full name** cannot be stolen while <@another_user_id> is still active",
        },
        {
          type: 'rich',
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          fields: [
            {
              name: 'media title',
              value: '**full name**',
            },
          ],
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
        },
      ],
    });
  });

  test('co-owned character sorting', async () => {
    const fetchMock = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValueOnce(undefined as any)
      .mockResolvedValueOnce(undefined as any);

    vi.spyOn(packs, 'all').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    vi.spyOn(db, 'rechargeConsumables').mockResolvedValue({
      party: {},
      user: { discordId: 'user-id' },
      stealTimestamp: undefined,
    } as any);

    vi.spyOn(db, 'findCharacter').mockResolvedValue([
      {
        rating: 2,
        characterId: 'id:1',
        userId: 'another_user_id',
        inventory: { party: {}, lastPull: new Date() },
      },
      {
        rating: 2,
        characterId: 'id:1',
        userId: 'another_user_id_2',
        inventory: { party: {}, lastPull: new Date('1999-1-1') },
      },
    ] as any);

    vi.spyOn(db, 'getGuild').mockResolvedValue({
      options: undefined,
    } as any);

    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await steal.pre({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      id: 'character_id',
    });

    await vi.runAllTimersAsync();

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
    );

    expect(fetchMock.mock.calls[0][1]?.method).toBe('PATCH');

    expect(
      JSON.parse(
        (fetchMock.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      embeds: [
        {
          type: 'rich',
          description: '<@another_user_id_2>',
          fields: [
            {
              name: 'media title',
              value: '**full name**',
            },
          ],
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
        },
        {
          type: 'rich',
          description: 'Your chance of success is **90.00%**',
        },
      ],
      components: [
        {
          components: [
            {
              custom_id: 'steal=another_user_id_2=id:1=90',
              label: 'Attempt',
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
          type: 1,
        },
      ],
      attachments: [{ filename: 'image-url.webp', id: '0' }],
    });
  });

  test('stealing from yourself', async () => {
    const fetchMock = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValueOnce(undefined as any)
      .mockResolvedValueOnce(undefined as any);

    vi.spyOn(packs, 'all').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    vi.spyOn(db, 'rechargeConsumables').mockResolvedValue({
      party: {},
      user: { discordId: 'user-id' },
      stealTimestamp: undefined,
    } as any);

    vi.spyOn(db, 'findCharacter').mockResolvedValue([
      {
        rating: 2,
        characterId: 'id:1',
        userId: 'user_id',
        inventory: { party: {} },
      },
    ] as any);

    vi.spyOn(db, 'getGuild').mockResolvedValue({
      options: undefined,
    } as any);

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await steal.pre({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      id: 'character_id',
    });

    await vi.runAllTimersAsync();

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
    );

    expect(fetchMock.mock.calls[0][1]?.method).toBe('PATCH');

    expect(
      JSON.parse(
        (fetchMock.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      embeds: [
        {
          type: 'rich',
          description: "You can't steal from yourself!",
        },
      ],
      components: [],
      attachments: [],
    });
  });

  test('not found', async () => {
    const fetchMock = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValueOnce(undefined as any)
      .mockResolvedValueOnce(undefined as any);

    vi.spyOn(packs, 'all').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue([]);

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await steal.pre({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      id: 'character_id',
    });

    await vi.runAllTimersAsync();

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
    );

    expect(fetchMock.mock.calls[0][1]?.method).toBe('PATCH');

    expect(
      JSON.parse(
        (fetchMock.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      embeds: [
        {
          type: 'rich',
          description: 'Found _nothing_ matching that query!',
        },
      ],
      components: [],
      attachments: [],
    });
  });

  test('not owned', async () => {
    const fetchMock = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValueOnce(undefined as any)
      .mockResolvedValueOnce(undefined as any);

    vi.spyOn(packs, 'all').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    vi.spyOn(db, 'rechargeConsumables').mockResolvedValue({
      party: {},
      user: { discordId: 'user-id' },
      stealTimestamp: undefined,
    } as any);

    vi.spyOn(db, 'findCharacter').mockResolvedValue(undefined as any);

    vi.spyOn(db, 'getGuild').mockResolvedValue({
      options: undefined,
    } as any);

    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await steal.pre({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      id: 'character_id',
    });

    await vi.runAllTimersAsync();

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
    );

    expect(fetchMock.mock.calls[0][1]?.method).toBe('PATCH');

    expect(
      JSON.parse(
        (fetchMock.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      components: [],
      attachments: [{ filename: 'image-url.webp', id: '0' }],
      embeds: [
        {
          type: 'rich',
          description: "full name hasn't been found by anyone yet",
        },
        {
          type: 'rich',
          description:
            '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          fields: [
            {
              name: 'media title',
              value: '**full name**',
            },
          ],
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
        },
      ],
    });
  });

  test('stealing disabled on server', async () => {
    const fetchMock = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValueOnce(undefined as any)
      .mockResolvedValueOnce(undefined as any);

    vi.spyOn(packs, 'all').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    vi.spyOn(db, 'rechargeConsumables').mockResolvedValue({
      party: {},
      user: { discordId: 'user-id' },
      stealTimestamp: undefined,
    } as any);

    vi.spyOn(db, 'findCharacter').mockResolvedValue(undefined as any);

    vi.spyOn(db, 'getGuild').mockResolvedValue({
      options: { steal: false },
    } as any);

    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await steal.pre({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      id: 'character_id',
    });

    await vi.runAllTimersAsync();

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
    );

    expect(fetchMock.mock.calls[0][1]?.method).toBe('PATCH');

    expect(
      JSON.parse(
        (fetchMock.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      attachments: [],
      components: [],
      embeds: [
        {
          description: 'Stealing is disabled on this server.',
          type: 'rich',
        },
      ],
    });
  });

  test('under maintenance', () => {
    config.stealing = false;

    try {
      expect(() =>
        steal.pre({
          userId: 'user_id',
          guildId: 'guild_id',
          token: 'test_token',
          id: 'character_id',
        })
      ).toThrowError(
        new NonFetalError('Stealing is under maintenance, try again later!')
      );
    } finally {
      delete config.stealing;
    }
  });
});

describe('attempt', () => {
  const character: Character = {
    id: '1',
    packId: 'id',
    rating: 2,
    description: 'long description',
    name: {
      english: 'full name',
    },
    images: [
      {
        url: 'image_url',
      },
    ],
    media: {
      edges: [
        {
          role: CharacterRole.Main,
          node: {
            id: 'media',
            packId: 'id',
            type: MediaType.Anime,
            title: {
              english: 'media title',
            },
          },
        },
      ],
    },
  };

  beforeEach(() => {
    // Setup fake timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Clean up all mocks and timers
    vi.restoreAllMocks();
    vi.clearAllTimers();

    // Clean up config
    delete config.stealing;
    delete config.appId;
    delete config.origin;
  });

  test('success', async () => {
    const sleepMock = vi.spyOn(utils, 'sleep').mockResolvedValue(undefined);
    const rngMock = vi.spyOn(utils, 'getRandomFloat').mockReturnValue(0);
    const fetchMock = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValueOnce(undefined as any)
      .mockResolvedValueOnce(undefined as any)
      .mockResolvedValueOnce(undefined as any);

    vi.spyOn(packs, 'all').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    vi.spyOn(db, 'getInventory').mockResolvedValue({
      party: {},
      user: { discordId: 'user-id' },
    } as any);

    vi.spyOn(db, 'findOneCharacter').mockResolvedValue({
      rating: 2,
      characterId: 'id:1',
      userId: 'another_user_id',
      inventory: { party: {} },
    } as any);

    vi.spyOn(db, 'stealCharacter').mockResolvedValue('_' as any);
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await steal.attempt({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      characterId: 'character_id',
      targetUserId: 'another_user_id',
      pre: 0,
    });

    await vi.runAllTimersAsync();

    expect(rngMock).toHaveBeenCalledTimes(1);
    expect(sleepMock).toHaveBeenCalledWith(5);

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
    );

    expect(fetchMock.mock.calls[0][1]?.method).toBe('PATCH');

    expect(
      JSON.parse(
        (fetchMock.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      attachments: [{ filename: 'image-url.webp', id: '0' }],
      components: [
        {
          type: 1,
          components: [
            {
              custom_id: 'character=character_id=1',
              label: '/character',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'like=character_id',
              label: '/like',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
      embeds: [
        {
          type: 'rich',
          description: '**You Succeeded**',
        },
        {
          type: 'rich',
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          fields: [
            {
              name: 'media title',
              value: '**full name**',
            },
            {
              name: '\u200B',
              value: '<:add:1099004747123523644>',
            },
          ],
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
        },
      ],
    });

    expect(fetchMock.mock.calls[1][0]).toBe(
      'https://discord.com/api/v10/webhooks/app_id/test_token'
    );

    expect(fetchMock.mock.calls[1][1]?.method).toBe('POST');

    expect(
      JSON.parse(
        (fetchMock.mock.calls[1][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      content: '<@another_user_id>',
      attachments: [{ filename: 'image-url.webp', id: '0' }],
      components: [
        {
          components: [
            {
              custom_id: 'character=character_id=1',
              label: '/character',
              style: 2,
              type: 2,
            },
          ],
          type: 1,
        },
      ],
      embeds: [
        {
          type: 'rich',
          description: '**full name** was stolen from you!',
        },
        {
          type: 'rich',
          description:
            '<@user_id>\n\n<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          fields: [
            {
              name: 'media title',
              value: '**full name**',
            },
            {
              name: '\u200B',
              value: '<:remove:1099004424111792158>',
            },
          ],
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
        },
      ],
    });
  });

  test('fail', async () => {
    const sleepMock = vi.spyOn(utils, 'sleep').mockResolvedValue(undefined);
    const rngMock = vi.spyOn(utils, 'getRandomFloat').mockReturnValue(1);
    const fetchMock = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValueOnce(undefined as any)
      .mockResolvedValueOnce(undefined as any);

    vi.spyOn(packs, 'all').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    vi.spyOn(db, 'getInventory').mockResolvedValue({
      party: {},
      user: { discordId: 'user-id' },
    } as any);

    vi.spyOn(db, 'findOneCharacter').mockResolvedValue({
      rating: 2,
      characterId: 'id:1',
      userId: 'another_user_id',
      inventory: { party: {} },
    } as any);

    vi.spyOn(db, 'failSteal').mockResolvedValue(undefined as any);

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await steal.attempt({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      characterId: 'character_id',
      targetUserId: 'another_user_id',
      pre: 0,
    });

    await vi.runAllTimersAsync();

    expect(rngMock).toHaveBeenCalledTimes(1);
    expect(sleepMock).toHaveBeenCalledWith(5);

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
    );

    expect(fetchMock.mock.calls[0][1]?.method).toBe('PATCH');

    expect(
      JSON.parse(
        (fetchMock.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      components: [],
      attachments: [],
      embeds: [
        {
          type: 'rich',
          description: '**You Failed**',
        },
        {
          type: 'rich',
          description: 'You can try again <t:259200:R>',
        },
      ],
    });
  });

  test('on cooldown', async () => {
    // Set specific date for the test
    vi.setSystemTime(new Date('2011/1/25 00:00 UTC'));

    const fetchMock = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValueOnce(undefined as any)
      .mockResolvedValueOnce(undefined as any)
      .mockResolvedValueOnce(undefined as any);

    vi.spyOn(packs, 'all').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    vi.spyOn(db, 'getInventory').mockResolvedValue({
      party: {},
      user: { discordId: 'user-id' },
      stealTimestamp: new Date(),
    } as any);

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await steal.attempt({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      characterId: 'character_id',
      targetUserId: 'another_user_id',
      pre: 0,
    });

    await vi.runAllTimersAsync();

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
    );

    expect(fetchMock.mock.calls[0][1]?.method).toBe('PATCH');

    expect(
      JSON.parse(
        (fetchMock.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      components: [],
      attachments: [],
      embeds: [
        {
          type: 'rich',
          description: 'Steal is on cooldown, try again <t:1296172800:R>',
        },
      ],
    });
  });

  test('chances lowered', async () => {
    const fetchMock = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValueOnce(undefined as any)
      .mockResolvedValueOnce(undefined as any)
      .mockResolvedValueOnce(undefined as any);

    vi.spyOn(packs, 'all').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    vi.spyOn(db, 'getInventory').mockResolvedValue({
      party: {},
      user: { discordId: 'user-id' },
    } as any);

    vi.spyOn(db, 'findOneCharacter').mockResolvedValue({
      rating: 2,
      characterId: 'id:1',
      userId: 'another_user_id',
      inventory: { party: {} },
    } as any);

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await steal.attempt({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      characterId: 'character_id',
      targetUserId: 'another_user_id',
      pre: 100,
    });

    await vi.runAllTimersAsync();

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
    );

    expect(fetchMock.mock.calls[0][1]?.method).toBe('PATCH');

    expect(
      JSON.parse(
        (fetchMock.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      components: [],
      attachments: [],
      embeds: [
        {
          type: 'rich',
          description:
            'Something happened and affected your chances of stealing **full name**, Please try again!',
        },
      ],
    });
  });

  test('not found', async () => {
    const fetchMock = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValueOnce(undefined as any)
      .mockResolvedValueOnce(undefined as any);

    vi.spyOn(packs, 'all').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    vi.spyOn(db, 'getInventory').mockResolvedValue({
      party: {},
      user: { discordId: 'user-id' },
    } as any);

    vi.spyOn(db, 'findOneCharacter').mockResolvedValue(undefined as any);

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await steal.attempt({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      characterId: 'character_id',
      targetUserId: 'another_user_id',
      pre: 0,
    });

    await vi.runAllTimersAsync();

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
    );

    expect(fetchMock.mock.calls[0][1]?.method).toBe('PATCH');

    expect(
      JSON.parse(
        (fetchMock.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      components: [],
      attachments: [],
      embeds: [
        {
          type: 'rich',
          description: "full name hasn't been found by anyone yet",
        },
      ],
    });
  });

  test('not found 2', async () => {
    vi.spyOn(utils, 'getRandomFloat').mockReturnValue(0);
    const sleepMock = vi.spyOn(utils, 'sleep').mockResolvedValue(undefined);
    const fetchMock = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValueOnce(undefined as any)
      .mockResolvedValueOnce(undefined as any);

    vi.spyOn(packs, 'all').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    vi.spyOn(db, 'getInventory').mockResolvedValue({
      party: {},
      user: { discordId: 'user-id' },
    } as any);

    vi.spyOn(db, 'findOneCharacter').mockResolvedValue({
      rating: 2,
      characterId: 'id:1',
      userId: 'another_user_id',
      inventory: { party: {} },
    } as any);

    vi.spyOn(db, 'stealCharacter').mockImplementation(() => {
      throw new Error('CHARACTER_NOT_FOUND');
    });

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await steal.attempt({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      characterId: 'character_id',
      targetUserId: 'another_user_id',
      pre: 0,
    });

    await vi.runAllTimersAsync();

    expect(sleepMock).toHaveBeenCalledWith(5);

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
    );

    expect(fetchMock.mock.calls[0][1]?.method).toBe('PATCH');

    expect(
      JSON.parse(
        (fetchMock.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      components: [],
      attachments: [],
      embeds: [
        {
          type: 'rich',
          description: "full name hasn't been found by anyone yet",
        },
      ],
    });
  });

  test('not owned', async () => {
    const fetchMock = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValueOnce(undefined as any)
      .mockResolvedValueOnce(undefined as any);

    vi.spyOn(packs, 'all').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    vi.spyOn(db, 'getInventory').mockResolvedValue({
      party: {},
      user: { discordId: 'user-id' },
    } as any);

    vi.spyOn(db, 'findOneCharacter').mockResolvedValue(undefined as any);

    vi.spyOn(db, 'stealCharacter').mockImplementation(() => {
      throw new Error('CHARACTER_NOT_OWNED');
    });

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await steal.attempt({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      characterId: 'character_id',
      targetUserId: 'another_user_id',
      pre: 0,
    });

    await vi.runAllTimersAsync();

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
    );

    expect(fetchMock.mock.calls[0][1]?.method).toBe('PATCH');

    expect(
      JSON.parse(
        (fetchMock.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      components: [],
      attachments: [],
      embeds: [
        {
          description: "full name hasn't been found by anyone yet",
          type: 'rich',
        },
      ],
    });
  });
});
