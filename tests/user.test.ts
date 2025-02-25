/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, afterEach } from 'vitest';
import utils from '~/src/utils.ts';

import user from '~/src/user.ts';
import packs from '~/src/packs.ts';

import config from '~/src/config.ts';

import db from '~/db/index.ts';

import {
  Character,
  CharacterRole,
  DisaggregatedMedia,
  Media,
  MediaFormat,
  MediaRelation,
  MediaType,
} from '~/src/types.ts';

describe('/now', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it('with pulls', async () => {
    vi.spyOn(db, 'rechargeConsumables').mockReturnValue({
      availablePulls: 5,
      stealTimestamp: null,
      rechargeTimestamp: null,
      user: {},
    } as any);

    config.appId = 'app_id';

    try {
      const message = await user.now({
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(message.json()).toEqual({
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
              type: 1,
              components: [
                {
                  custom_id: 'gacha=user_id',
                  label: '/gacha',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.appId;
    }
  });

  it('no pulls', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');
    vi.useFakeTimers();
    vi.setSystemTime(time);

    vi.spyOn(db, 'rechargeConsumables').mockReturnValue({
      availablePulls: 0,
      stealTimestamp: null,
      rechargeTimestamp: time,
      user: {},
    } as any);

    config.appId = 'app_id';

    try {
      const message = await user.now({
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(message.json()).toEqual({
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
          components: [],
        },
      });
    } finally {
      delete config.appId;
    }
  });

  it('no pulls with mention', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');
    vi.useFakeTimers();
    vi.setSystemTime(time);

    vi.spyOn(db, 'rechargeConsumables').mockReturnValue({
      availablePulls: 0,
      stealTimestamp: null,
      rechargeTimestamp: time,
      user: {},
    } as any);

    config.appId = 'app_id';

    try {
      const message = await user.now({
        userId: 'user_id',
        guildId: 'guild_id',
        mention: true,
      });

      expect(message.json()).toEqual({
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
          components: [],
        },
      });
    } finally {
      delete config.appId;
    }
  });

  it('with keys (no cleared floors)', async () => {
    vi.spyOn(db, 'rechargeConsumables').mockReturnValue({
      availablePulls: 5,
      stealTimestamp: null,
      rechargeTimestamp: null,
      availableKeys: 5,
      lastPVE: new Date(),
      user: {},
    } as any);

    config.appId = 'app_id';
    config.combat = true;

    try {
      const message = await user.now({
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(message.json()).toEqual({
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
            {
              type: 'rich',
              title: '**5**',
              footer: {
                text: 'Available Keys',
              },
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'gacha=user_id',
                  label: '/gacha',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.appId;
      delete config.combat;
    }
  });

  it('with keys (1 floor cleared)', async () => {
    vi.spyOn(db, 'rechargeConsumables').mockReturnValue({
      availablePulls: 5,
      stealTimestamp: null,
      rechargeTimestamp: null,
      availableKeys: 5,
      lastPVE: new Date(),
      floorsCleared: 1,
      user: {},
    } as any);

    config.appId = 'app_id';
    config.combat = true;

    try {
      const message = await user.now({
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(message.json()).toEqual({
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
            {
              type: 'rich',
              title: '**5**',
              footer: {
                text: 'Available Keys',
              },
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'gacha=user_id',
                  label: '/gacha',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'treclear=user_id',
                  label: '/reclear',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.appId;
      delete config.combat;
    }
  });

  it('no keys', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');
    vi.useFakeTimers();
    vi.setSystemTime(time);

    vi.spyOn(db, 'rechargeConsumables').mockReturnValue({
      availablePulls: 0,
      availableKeys: 0,
      stealTimestamp: null,
      rechargeTimestamp: time,
      keysTimestamp: time,
      lastPVE: new Date(),
      user: {},
    } as any);

    config.appId = 'app_id';
    config.combat = true;

    try {
      const message = await user.now({
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(message.json()).toEqual({
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
              title: '**0**',
              footer: {
                text: 'Available Keys',
              },
            },
            { type: 'rich', description: '_+1 pull <t:1675569106:R>_' },
            { type: 'rich', description: '_+1 key <t:1675569706:R>_' },
          ],
          components: [],
        },
      });
    } finally {
      delete config.appId;
      delete config.combat;
    }
  });

  it('with 1 token', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');
    vi.useFakeTimers();
    vi.setSystemTime(time);

    vi.spyOn(db, 'rechargeConsumables').mockReturnValue({
      availablePulls: 0,
      stealTimestamp: null,
      rechargeTimestamp: time,
      user: {
        availableTokens: 1,
      },
    } as any);

    config.appId = 'app_id';

    try {
      const message = await user.now({
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(message.json()).toEqual({
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
              title: '**1**',
              footer: {
                text: 'Daily Token',
              },
            },
            { type: 'rich', description: '_+1 pull <t:1675569106:R>_' },
          ],
          components: [],
        },
      });
    } finally {
      delete config.appId;
    }
  });

  it('with 4 tokens', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');
    vi.useFakeTimers();
    vi.setSystemTime(time);

    vi.spyOn(db, 'rechargeConsumables').mockReturnValue({
      availablePulls: 0,
      stealTimestamp: null,
      rechargeTimestamp: time,
      user: {
        availableTokens: 4,
      },
    } as any);

    config.appId = 'app_id';

    try {
      const message = await user.now({
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(message.json()).toEqual({
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
              title: '**4**',
              footer: {
                text: 'Daily Tokens',
              },
            },
            { type: 'rich', description: '_+1 pull <t:1675569106:R>_' },
          ],
          components: [],
        },
      });
    } finally {
      delete config.appId;
    }
  });

  it('with 28 tokens', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');
    vi.useFakeTimers();
    vi.setSystemTime(time);

    vi.spyOn(db, 'rechargeConsumables').mockReturnValue({
      availablePulls: 4,
      stealTimestamp: null,
      rechargeTimestamp: time,
      user: { availableTokens: 28 },
    } as any);

    config.appId = 'app_id';

    try {
      const message = await user.now({
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(message.json()).toEqual({
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
              description: undefined,
            },
            {
              type: 'rich',
              title: '**28**',
              footer: {
                text: 'Daily Tokens',
              },
            },
            { type: 'rich', description: '_+1 pull <t:1675569106:R>_' },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'gacha=user_id',
                  label: '/gacha',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'buy=bguaranteed=user_id=5',
                  label: '/buy guaranteed 5',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.appId;
    }
  });

  it('with 27 tokens', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');
    vi.useFakeTimers();
    vi.setSystemTime(time);

    vi.spyOn(db, 'rechargeConsumables').mockReturnValue({
      availablePulls: 4,
      stealTimestamp: null,
      rechargeTimestamp: time,
      user: { availableTokens: 27 },
    } as any);

    config.appId = 'app_id';

    try {
      const message = await user.now({
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(message.json()).toEqual({
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
              description: undefined,
            },
            {
              type: 'rich',
              title: '**27**',
              footer: {
                text: 'Daily Tokens',
              },
            },
            { type: 'rich', description: '_+1 pull <t:1675569106:R>_' },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'gacha=user_id',
                  label: '/gacha',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'buy=bguaranteed=user_id=4',
                  label: '/buy guaranteed 4',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.appId;
    }
  });

  it('with guarantees', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');
    vi.useFakeTimers();
    vi.setSystemTime(time);

    vi.spyOn(db, 'rechargeConsumables').mockReturnValue({
      availablePulls: 4,
      stealTimestamp: null,
      rechargeTimestamp: time,
      user: {
        availableTokens: 5,
        guarantees: [5, 5, 4, 4, 3],
      },
    } as any);

    config.appId = 'app_id';

    try {
      const message = await user.now({
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(message.json()).toEqual({
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
                '5<:smolstar:1107503653956374638>4<:smolstar:1107503653956374638>3<:smolstar:1107503653956374638>',
            },
            {
              type: 'rich',
              title: '**5**',
              footer: {
                text: 'Daily Tokens',
              },
            },
            { type: 'rich', description: '_+1 pull <t:1675569106:R>_' },
          ],
          components: [
            {
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
              ],
            },
          ],
        },
      });
    } finally {
      delete config.appId;
    }
  });

  it('with steal cooldown', async () => {
    const timestamp = new Date('2023-02-05T03:21:46.253Z');
    vi.useFakeTimers();
    vi.setSystemTime(timestamp);

    const futureTimestamp = new Date(timestamp);
    futureTimestamp.setDate(futureTimestamp.getDate() + 2);

    vi.spyOn(db, 'rechargeConsumables').mockReturnValue({
      availablePulls: 5,
      stealTimestamp: futureTimestamp,
      rechargeTimestamp: null,
      user: {},
    } as any);

    config.appId = 'app_id';

    try {
      const message = await user.now({
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(message.json()).toEqual({
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

            {
              type: 'rich',
              description: '_Steal cooldown ends <t:1675999306:R>_',
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 2,
                  custom_id: 'gacha=user_id',
                  label: '/gacha',
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.appId;
    }
  });

  it('with notice', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');
    vi.useFakeTimers();
    vi.setSystemTime(time);

    vi.spyOn(db, 'rechargeConsumables').mockReturnValue({
      availablePulls: 0,
      stealTimestamp: null,
      rechargeTimestamp: time,
      user: {},
    } as any);

    config.appId = 'app_id';
    config.notice = '**test**\\n_message_';

    try {
      const message = await user.now({
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(message.json()).toEqual({
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
              description: '**test**\n_message_',
              type: 'rich',
            },
            { type: 'rich', description: '_+1 pull <t:1675569106:R>_' },
          ],
          components: [],
        },
      });
    } finally {
      delete config.appId;
      delete config.notice;
    }
  });

  it('with daily tokens cooldown', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');
    vi.useFakeTimers();
    vi.setSystemTime(time);

    vi.spyOn(db, 'rechargeConsumables').mockReturnValue({
      availablePulls: 5,
      user: {
        dailyTimestamp: time,
      },
    } as any);

    config.appId = 'app_id';

    try {
      const message = await user.now({
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(message.json()).toEqual({
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
            { type: 'rich', description: '_+1 daily token <t:1675610506:R>_' },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'gacha=user_id',
                  label: '/gacha',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.appId;
    }
  });
});

describe('/nick', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it('changed', async () => {
    const media: Media = {
      id: '2',
      type: MediaType.Anime,
      packId: 'anilist',
      format: MediaFormat.TV,
      popularity: 0,
      title: {
        english: 'title',
      },
    };

    const character: Character = {
      id: '1',
      packId: 'anilist',
      name: {
        english: 'name 1',
      },
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: media,
          },
        ],
      },
    };

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);
    vi.spyOn(db, 'setCharacterNickname').mockReturnValue({
      id: 'anilist:1',
      mediaId: 'anilist:0',
      nickname: 'new_nickname',
      rating: 2,
    } as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'media').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.nick({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild_id',
        id: 'anilist:1',
        nick: 'new_nickname',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        components: [],
        attachments: [{ filename: 'default.webp', id: '0' }],
        embeds: [
          {
            type: 'rich',
            description:
              "name 1's nickname has been changed to **new_nickname**",
          },
          {
            type: 'rich',
            fields: [
              {
                name: 'title',
                value: '**new_nickname**',
              },
            ],
            thumbnail: {
              url: 'attachment://default.webp',
            },
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('reset', async () => {
    const media: Media = {
      id: '2',
      type: MediaType.Anime,
      packId: 'anilist',
      format: MediaFormat.TV,
      popularity: 0,
      title: {
        english: 'title',
      },
    };

    const character: Character = {
      id: '1',
      packId: 'anilist',
      name: {
        english: 'name 1',
      },
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: media,
          },
        ],
      },
    };

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);
    vi.spyOn(db, 'setCharacterNickname').mockReturnValue({
      id: 'anilist:1',
      mediaId: 'anilist:0',
      image: 'image_url',
      rating: 2,
    } as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'media').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.nick({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild_id',
        id: 'anilist:1',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        components: [],
        attachments: [{ filename: 'image-url.webp', id: '0' }],
        embeds: [
          {
            type: 'rich',
            description: "name 1's nickname has been reset",
          },
          {
            type: 'rich',
            fields: [
              {
                name: 'title',
                value: '**name 1**',
              },
            ],
            thumbnail: {
              url: 'attachment://image-url.webp',
            },
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('not found', async () => {
    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'setCharacterNickname').mockImplementation(() => {
      throw new Error('CHARACTER_NOT_FOUND');
    });

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'media').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue([]);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.nick({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild_id',
        id: 'anilist:1',
        nick: 'new_nick',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        components: [],
        attachments: [],
        embeds: [
          {
            type: 'rich',
            description: 'Found _nothing_ matching that query!',
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('character not found', async () => {
    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'name 1',
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'setCharacterNickname').mockImplementation(() => {
      throw new Error('CHARACTER_NOT_FOUND');
    });

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'media').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.nick({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild_id',

        id: 'anilist:1',
        nick: 'new_nick',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        embeds: [
          {
            type: 'rich',
            description: "name 1 hasn't been found by anyone yet",
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'character=anilist:1',
                label: '/character',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
        attachments: [],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('character not owned', async () => {
    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'name 1',
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(db, 'setCharacterNickname').mockImplementation(() => {
      throw new Error('CHARACTER_NOT_OWNED');
    });

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'media').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.nick({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild_id',
        id: 'anilist:1',
        nick: 'new_nick',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        embeds: [
          {
            type: 'rich',
            description: 'name 1 is not owned by you',
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'character=anilist:1',
                label: '/character',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
        attachments: [],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });
});

describe('/image', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it('changed', async () => {
    const media: Media = {
      id: '2',
      type: MediaType.Anime,
      packId: 'anilist',
      format: MediaFormat.TV,
      popularity: 0,
      title: {
        english: 'title',
      },
    };

    const character: Character = {
      id: '1',
      packId: 'anilist',
      name: {
        english: 'name 1',
      },
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: media,
          },
        ],
      },
    };

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'setCharacterImage').mockReturnValue([
      {
        id: 'anilist:1',
        mediaId: 'anilist:0',
        image: 'new_image',
        rating: 2,
      },
    ] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'media').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.image({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild_id',
        id: 'anilist:1',
        image: 'new_image',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        components: [],
        attachments: [{ filename: 'new-image.webp', id: '0' }],
        embeds: [
          {
            type: 'rich',
            description: "name 1's image has been **changed**",
          },
          {
            type: 'rich',
            fields: [
              {
                name: 'title',
                value: '**name 1**',
              },
            ],
            image: {
              url: 'attachment://new-image.webp',
            },
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('reset', async () => {
    const media: Media = {
      id: '2',
      type: MediaType.Anime,
      packId: 'anilist',
      format: MediaFormat.TV,
      popularity: 0,
      title: {
        english: 'title',
      },
    };

    const character: Character = {
      id: '1',
      packId: 'anilist',
      name: {
        english: 'name 1',
      },
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: media,
          },
        ],
      },
    };

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'setCharacterImage').mockReturnValue({
      id: 'anilist:1',
      mediaId: 'anilist:0',
      nickname: 'nickname',
      rating: 2,
    } as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'media').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.image({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        id: 'anilist:1',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        components: [],
        attachments: [{ filename: 'default.webp', id: '0' }],
        embeds: [
          {
            type: 'rich',
            description: "name 1's image has been reset",
          },
          {
            type: 'rich',
            fields: [
              {
                name: 'title',
                value: '**nickname**',
              },
            ],
            image: {
              url: 'attachment://default.webp',
            },
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('not found', async () => {
    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'setCharacterImage').mockImplementation(() => {
      throw new Error('CHARACTER_NOT_FOUND');
    });

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'media').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue([]);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.image({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild_id',
        id: 'anilist:1',
        image: 'new_image',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        components: [],
        attachments: [],
        embeds: [
          {
            type: 'rich',
            description: 'Found _nothing_ matching that query!',
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('character not found', async () => {
    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'name 1',
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'setCharacterImage').mockImplementation(() => {
      throw new Error('CHARACTER_NOT_FOUND');
    });

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'media').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.image({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild_id',
        id: 'anilist:1',
        image: 'new_image',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        embeds: [
          {
            type: 'rich',
            description: "name 1 hasn't been found by anyone yet",
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'character=anilist:1',
                label: '/character',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
        attachments: [],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('character not owned', async () => {
    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'name 1',
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(db, 'setCharacterImage').mockImplementation(() => {
      throw new Error('CHARACTER_NOT_OWNED');
    });

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'media').mockResolvedValue([]);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.image({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild_id',
        id: 'anilist:1',
        image: 'new_image',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        embeds: [
          {
            type: 'rich',
            description: 'name 1 is not owned by you',
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'character=anilist:1',
                label: '/character',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
        attachments: [],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });
});

describe('/collection stars', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it('normal', async () => {
    const media: Media[] = [
      {
        id: '2',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
      },
      {
        id: '4',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
      },
      {
        id: '6',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 3',
        },
      },
      {
        id: '8',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 4',
        },
      },
      {
        id: '10',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 5',
        },
      },
      {
        id: '12',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 6',
        },
      },
    ];

    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'character 1',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[0],
            },
          ],
        },
      },
      {
        id: '3',
        packId: 'anilist',
        name: {
          english: 'character 2',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[1],
            },
          ],
        },
      },
      {
        id: '5',
        packId: 'anilist',
        name: {
          english: 'character 3',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[0],
            },
          ],
        },
      },
      {
        id: '7',
        packId: 'anilist',
        name: {
          english: 'character 4',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[3],
            },
          ],
        },
      },
      {
        id: '9',
        packId: 'anilist',
        name: {
          english: 'character 5',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[4],
            },
          ],
        },
      },
      {
        id: '11',
        packId: 'anilist',
        name: {
          english: 'character 6',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[5],
            },
          ],
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {},
      user: { likes: [] },
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      {
        characterId: 'anilist:1',
        mediaId: 'anilist:2',
        rating: 1,
      },
      {
        characterId: 'anilist:3',
        mediaId: 'anilist:4',
        rating: 2,
      },
      {
        characterId: 'anilist:5',
        mediaId: 'anilist:6',
        rating: 3,
      },
      {
        characterId: 'anilist:7',
        mediaId: 'anilist:8',
        rating: 4,
      },
      {
        characterId: 'anilist:9',
        mediaId: 'anilist:10',
        rating: 5,
      },
      {
        characterId: 'anilist:11',
        mediaId: 'anilist:12',
        rating: 1,
      },
    ] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'media').mockResolvedValue(media);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        rating: 1,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'list=user_id==1==0=prev',
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
                custom_id: 'list=user_id==1==0=next',
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
                value: '1<:smolstar:1107503653956374638> character 1',
              },
              {
                inline: false,
                name: 'title 6',
                value: '1<:smolstar:1107503653956374638> character 6',
              },
            ],
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('picture full view', async () => {
    const media: Media[] = [
      {
        id: '2',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
      },
      {
        id: '4',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
      },
      {
        id: '6',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 3',
        },
      },
      {
        id: '8',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 4',
        },
      },
      {
        id: '10',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 5',
        },
      },
      {
        id: '12',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 6',
        },
      },
    ];

    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'character 1',
        },
        description: 'small description',
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[0],
            },
          ],
        },
      },
      {
        id: '3',
        packId: 'anilist',
        name: {
          english: 'character 2',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[1],
            },
          ],
        },
      },
      {
        id: '5',
        packId: 'anilist',
        name: {
          english: 'character 3',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[0],
            },
          ],
        },
      },
      {
        id: '7',
        packId: 'anilist',
        name: {
          english: 'character 4',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[3],
            },
          ],
        },
      },
      {
        id: '9',
        packId: 'anilist',
        name: {
          english: 'character 5',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[4],
            },
          ],
        },
      },
      {
        id: '11',
        packId: 'anilist',
        name: {
          english: 'character 6',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[5],
            },
          ],
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {},
      user: { likes: [] },
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      {
        characterId: 'anilist:1',
        mediaId: 'anilist:2',
        rating: 1,
      },
      {
        characterId: 'anilist:3',
        mediaId: 'anilist:4',
        rating: 2,
      },
      {
        characterId: 'anilist:5',
        mediaId: 'anilist:6',
        rating: 3,
      },
      {
        characterId: 'anilist:7',
        mediaId: 'anilist:8',
        rating: 4,
      },
      {
        characterId: 'anilist:9',
        mediaId: 'anilist:10',
        rating: 5,
      },
      {
        characterId: 'anilist:11',
        mediaId: 'anilist:12',
        rating: 1,
      },
    ] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'media').mockResolvedValue(media);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        rating: 1,
        picture: true,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [
          {
            filename: 'default.webp',
            id: '0',
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'list=user_id==1=1=1=prev',
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
                custom_id: 'list=user_id==1=1=1=next',
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
            description:
              '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            fields: [
              {
                name: 'title 1',
                value: '**character 1**',
              },
            ],
            image: {
              url: 'attachment://default.webp',
            },
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('with nicknames', async () => {
    const media: Media[] = [
      {
        id: '2',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
      },
      {
        id: '4',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
      },
      {
        id: '6',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 3',
        },
      },
      {
        id: '8',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 4',
        },
      },
      {
        id: '10',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 5',
        },
      },
      {
        id: '12',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 6',
        },
      },
    ];

    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'character 1',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[0],
            },
          ],
        },
      },
      {
        id: '3',
        packId: 'anilist',
        name: {
          english: 'character 2',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[1],
            },
          ],
        },
      },
      {
        id: '5',
        packId: 'anilist',
        name: {
          english: 'character 3',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[0],
            },
          ],
        },
      },
      {
        id: '7',
        packId: 'anilist',
        name: {
          english: 'character 4',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[3],
            },
          ],
        },
      },
      {
        id: '9',
        packId: 'anilist',
        name: {
          english: 'character 5',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[4],
            },
          ],
        },
      },
      {
        id: '11',
        packId: 'anilist',
        name: {
          english: 'character 6',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[5],
            },
          ],
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {},
      user: { likes: [] },
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      {
        characterId: 'anilist:1',
        mediaId: 'anilist:2',
        nickname: 'nickname 1',
        rating: 1,
      },
      {
        characterId: 'anilist:3',
        mediaId: 'anilist:4',
        nickname: 'nickname 2',
        rating: 2,
      },
      {
        characterId: 'anilist:5',
        mediaId: 'anilist:6',
        nickname: 'nickname 3',
        rating: 3,
      },
      {
        characterId: 'anilist:7',
        mediaId: 'anilist:8',
        nickname: 'nickname 4',
        rating: 4,
      },
      {
        characterId: 'anilist:9',
        mediaId: 'anilist:10',
        nickname: 'nickname 5',
        rating: 5,
      },
      {
        characterId: 'anilist:11',
        mediaId: 'anilist:12',
        nickname: 'nickname 6',
        rating: 1,
      },
    ] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        rating: 1,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'list=user_id==1==0=prev',
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
                custom_id: 'list=user_id==1==0=next',
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
                value: '1<:smolstar:1107503653956374638> nickname 1',
              },
              {
                inline: false,
                name: 'title 6',
                value: '1<:smolstar:1107503653956374638> nickname 6',
              },
            ],
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('with likes', async () => {
    const media: Media[] = [
      {
        id: '2',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
      },
      {
        id: '4',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
      },
      {
        id: '6',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 3',
        },
      },
      {
        id: '8',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 4',
        },
      },
      {
        id: '10',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 5',
        },
      },
      {
        id: '12',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 6',
        },
      },
    ];

    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'character 1',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[0],
            },
          ],
        },
      },
      {
        id: '3',
        packId: 'anilist',
        name: {
          english: 'character 2',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[1],
            },
          ],
        },
      },
      {
        id: '5',
        packId: 'anilist',
        name: {
          english: 'character 3',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[0],
            },
          ],
        },
      },
      {
        id: '7',
        packId: 'anilist',
        name: {
          english: 'character 4',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[3],
            },
          ],
        },
      },
      {
        id: '9',
        packId: 'anilist',
        name: {
          english: 'character 5',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[4],
            },
          ],
        },
      },
      {
        id: '11',
        packId: 'anilist',
        name: {
          english: 'character 6',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[5],
            },
          ],
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {},
      user: {
        likes: [{ characterId: 'anilist:1' }, { mediaId: 'anilist:12' }],
      },
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      {
        characterId: 'anilist:1',
        mediaId: 'anilist:2',
        rating: 1,
      },
      {
        characterId: 'anilist:3',
        mediaId: 'anilist:4',
        rating: 2,
      },
      {
        characterId: 'anilist:5',
        mediaId: 'anilist:6',
        rating: 3,
      },
      {
        characterId: 'anilist:7',
        mediaId: 'anilist:8',
        rating: 4,
      },
      {
        characterId: 'anilist:9',
        mediaId: 'anilist:10',
        rating: 5,
      },
      {
        characterId: 'anilist:11',
        mediaId: 'anilist:12',
        rating: 1,
      },
    ] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        rating: 1,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'list=user_id==1==0=prev',
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
                custom_id: 'list=user_id==1==0=next',
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
                value:
                  '1<:smolstar:1107503653956374638><:liked:1110491720375873567> character 1',
              },
              {
                inline: false,
                name: 'title 6',
                value:
                  '1<:smolstar:1107503653956374638><:liked:1110491720375873567> character 6',
              },
            ],
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('with likes and party', async () => {
    const media: Media[] = [
      {
        id: '0',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
      },
    ];

    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'character 1',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[0],
            },
          ],
        },
      },
      {
        id: '2',
        packId: 'anilist',
        name: {
          english: 'character 2',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[0],
            },
          ],
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getUser').mockReturnValue({
      likes: [{ characterId: 'anilist:1' }, { characterId: 'anilist:2' }],
    } as any);

    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {
        member1Id: '1',
      },
      user: {
        likes: [{ characterId: 'anilist:1' }, { characterId: 'anilist:2' }],
      },
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      {
        _id: '1',
        characterId: 'anilist:1',
        mediaId: 'anilist:0',
        rating: 1,
      },
      {
        characterId: 'anilist:2',
        mediaId: 'anilist:0',
        rating: 1,
      },
    ] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        rating: 1,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'list=user_id==1==0=prev',
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
                custom_id: 'list=user_id==1==0=next',
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
                value:
                  '1<:smolstar:1107503653956374638><:partymember:1135706921312206921> character 1',
              },
              {
                inline: false,
                name: 'title 1',
                value:
                  '1<:smolstar:1107503653956374638><:liked:1110491720375873567> character 2',
              },
            ],
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('media disabled', async () => {
    const media: Media[] = [
      {
        id: '1',
        packId: 'anilist',
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

    const characters: Character[] = [
      {
        id: '3',
        packId: 'anilist',
        name: {
          english: 'character 1',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[0],
            },
          ],
        },
      },
      {
        id: '4',
        packId: 'anilist',
        name: {
          english: 'character 2',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[1],
            },
          ],
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {},
      user: { likes: [] },
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      {
        characterId: 'anilist:3',
        mediaId: 'anilist:1',
        rating: 1,
      },
      {
        characterId: 'anilist:4',
        mediaId: 'anilist:2',
        rating: 2,
      },
    ] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockImplementation(
      (id) => id === 'anilist:1'
    );
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'list=user_id====0=prev',
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
                custom_id: 'list=user_id====0=next',
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
                value: '2<:smolstar:1107503653956374638> character 2',
              },
            ],
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('no characters (Dave)', async () => {
    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {},
      user: { likes: [] },
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        nick: true,
        userId: 'another_user_id',
        guildId: 'guild_id',
        token: 'test_token',
        rating: 5,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [],
        embeds: [
          {
            type: 'rich',
            description:
              "<@another_user_id> doesn't have any 5<:smolstar:1107503653956374638>characters",
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('no characters (Self)', async () => {
    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);

    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {},
      user: { likes: [] },
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        rating: 5,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'gacha=user_id',
                label: '/gacha',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
        embeds: [
          {
            type: 'rich',
            description:
              "You don't have any 5<:smolstar:1107503653956374638>characters",
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });
});

describe('/collection media', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it('normal', async () => {
    const media: Media[] = [
      {
        id: '2',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
      },
      {
        id: '4',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
      },
    ];

    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'character 1',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[0],
            },
          ],
        },
      },
      {
        id: '3',
        packId: 'anilist',
        name: {
          english: 'character 2',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[1],
            },
          ],
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {},
      user: { likes: [] },
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      {
        characterId: 'anilist:1',
        mediaId: 'anilist:2',
        rating: 1,
      },
      {
        characterId: 'anilist:3',
        mediaId: 'anilist:4',
        rating: 2,
      },
    ] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'media').mockResolvedValue(media);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        id: 'anilist:2',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'list=user_id=anilist:2===0=prev',
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
                custom_id: 'list=user_id=anilist:2===0=next',
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
                value: '1<:smolstar:1107503653956374638> character 1',
              },
            ],
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('with nicknames', async () => {
    const media: Media[] = [
      {
        id: '2',
        packId: 'anilist',
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
    ];

    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'character 1',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[0],
            },
          ],
        },
      },
      {
        id: '3',
        packId: 'anilist',
        name: {
          english: 'character 2',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[0],
            },
          ],
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {},
      user: { likes: [] },
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      {
        characterId: 'anilist:1',
        mediaId: 'anilist:2',
        nickname: 'nickname 1',
        rating: 1,
      },
      {
        characterId: 'anilist:3',
        mediaId: 'anilist:4',
        nickname: 'nickname 2',
        rating: 2,
      },
    ] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'media').mockResolvedValue(media);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        id: 'anilist:2',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'list=user_id=anilist:2===0=prev',
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
                custom_id: 'list=user_id=anilist:2===0=next',
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
                value: '1<:smolstar:1107503653956374638> nickname 1',
              },
            ],
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('with relations', async () => {
    const media: Media[] = [
      {
        id: '4',
        packId: 'anilist',
        type: MediaType.Manga,
        title: {
          english: 'title',
        },
        popularity: 100,
        relations: {
          edges: [
            {
              relation: MediaRelation.Contains,
              node: {
                id: '5',
                packId: 'anilist',
                type: MediaType.Manga,
                title: {
                  english: 'title 2',
                },
                popularity: 0,
              },
            },
          ],
        },
      },
    ];

    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'character 1',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[0],
            },
          ],
        },
      },
      {
        id: '2',
        packId: 'anilist',
        name: {
          english: 'character 2',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,

              node: media[0].relations!.edges[0].node,
            },
          ],
        },
      },
      {
        id: '3',
        packId: 'anilist',
        name: {
          english: 'character 3',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[0],
            },
          ],
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {},
      user: { likes: [] },
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      {
        characterId: 'anilist:1',
        mediaId: 'anilist:4',
        rating: 1,
      },
      {
        characterId: 'anilist:2',
        mediaId: 'anilist:5',
        rating: 2,
      },
      {
        characterId: 'anilist:3',
        mediaId: 'anilist:4',
        rating: 4,
      },
    ] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'media').mockResolvedValue(media);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        id: 'anilist:4',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'list=user_id=anilist:4===0=prev',
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
                custom_id: 'list=user_id=anilist:4===0=next',
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
                name: 'title',
                value: '4<:smolstar:1107503653956374638> character 3',
              },
              {
                inline: false,
                name: 'title',
                value: '1<:smolstar:1107503653956374638> character 1',
              },
              {
                inline: false,
                name: 'title 2',
                value: '2<:smolstar:1107503653956374638> character 2',
              },
            ],
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('picture full view', async () => {
    const media: Media[] = [
      {
        id: '2',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
      },
      {
        id: '4',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
      },
    ];

    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'character 1',
        },
        description: 'small description',
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[0],
            },
          ],
        },
      },
      {
        id: '3',
        packId: 'anilist',
        name: {
          english: 'character 2',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[1],
            },
          ],
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {},
      user: { likes: [] },
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      {
        characterId: 'anilist:1',
        mediaId: 'anilist:2',
        rating: 1,
      },
      {
        characterId: 'anilist:3',
        mediaId: 'anilist:4',
        rating: 2,
      },
    ] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'media').mockResolvedValue(media);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        id: 'anilist:2',
        picture: true,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [
          {
            filename: 'default.webp',
            id: '0',
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'list=user_id=anilist:2==1=0=prev',
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
                custom_id: 'list=user_id=anilist:2==1=0=next',
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
            description:
              '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            fields: [
              {
                name: 'title 1',
                value: '**character 1**',
              },
            ],
            image: {
              url: 'attachment://default.webp',
            },
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('media disabled', async () => {
    const media: Media[] = [
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
    ];

    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'character 1',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[0],
            },
          ],
        },
      },
      {
        id: '3',
        packId: 'anilist',
        name: {
          english: 'character 2',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: media[1],
            },
          ],
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {},
      user: { likes: [] },
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      {
        characterId: 'anilist:1',
        mediaId: 'anilist:2',
        rating: 1,
      },
      {
        characterId: 'anilist:3',
        mediaId: 'anilist:4',
        rating: 2,
      },
    ] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(true);
    vi.spyOn(packs, 'media').mockResolvedValue(media);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        id: 'anilist:2',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [],
        embeds: [
          {
            type: 'rich',
            description: 'Found _nothing_ matching that query!',
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('no characters (Dave)', async () => {
    const media: Media[] = [
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
    ];

    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'character 1',
        },
      },
      {
        id: '3',
        packId: 'anilist',
        name: {
          english: 'character 2',
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);

    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {},
      user: { likes: [] },
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'media').mockResolvedValue(media);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'another_user_id',
        guildId: 'guild_id',
        token: 'test_token',
        id: 'anilist:2',
        nick: true,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [],
        embeds: [
          {
            type: 'rich',
            description:
              "<@another_user_id> doesn't have any characters from title 1",
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('no characters (Self)', async () => {
    const media: Media[] = [
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
    ];

    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'character 1',
        },
      },
      {
        id: '3',
        packId: 'anilist',
        name: {
          english: 'character 2',
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {},
      user: { likes: [] },
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'media').mockResolvedValue(media);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        id: 'anilist:2',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'gacha=user_id',
                label: '/gacha',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
        embeds: [
          {
            type: 'rich',
            description: "You don't have any characters from title 1",
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });
});

describe('/collection sum', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it('normal', async () => {
    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getUser').mockReturnValue({
      likes: [],
    } as any);

    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {},
      user: { likes: [] },
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      {
        _id: '1',
        characterId: 'anilist:1',
        mediaId: 'anilist:0',
        rating: 1,
      },
    ] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.sum({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
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

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      const t = [
        '1<:smolstar:1107503653956374638> — **1 character** — 0 <:liked:1110491720375873567>(1)',
        '2<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
        '3<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
        '4<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
        '5<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
      ];

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [],
        embeds: [
          {
            type: 'rich',
            description: t.join('\n'),
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('with liked characters', async () => {
    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {},
      user: { likes: [{ characterId: 'anilist:1' }] },
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      {
        _id: '1',
        characterId: 'anilist:1',
        mediaId: 'anilist:0',
        rating: 1,
      },
      {
        _id: '2',
        characterId: 'anilist:2',
        mediaId: 'anilist:0',
        rating: 1,
      },
    ] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.sum({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
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

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      const t = [
        '1<:smolstar:1107503653956374638> — **2 characters** — 1 <:liked:1110491720375873567>(1)',
        '2<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
        '3<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
        '4<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
        '5<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
      ];

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [],
        embeds: [
          {
            type: 'rich',
            description: t.join('\n'),
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('with liked media', async () => {
    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {},
      user: { likes: [{ mediaId: 'anilist:0' }] },
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      {
        _id: '1',
        characterId: 'anilist:1',
        mediaId: 'anilist:0',
        rating: 1,
      },
      {
        _id: '2',
        characterId: 'anilist:2',
        mediaId: 'anilist:10',
        rating: 1,
      },
    ] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.sum({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
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

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      const t = [
        '1<:smolstar:1107503653956374638> — **2 characters** — 1 <:liked:1110491720375873567>(1)',
        '2<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
        '3<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
        '4<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
        '5<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
      ];

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [],
        embeds: [
          {
            type: 'rich',
            description: t.join('\n'),
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('with likes and party', async () => {
    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: { member1: { characterId: 'anilist:1' } },
      user: { likes: [{ characterId: 'anilist:2' }] },
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      {
        _id: '1',
        characterId: 'anilist:1',
        mediaId: 'anilist:0',
        rating: 1,
      },
      {
        _id: '2',
        characterId: 'anilist:2',
        mediaId: 'anilist:0',
        rating: 1,
      },
    ] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.sum({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
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

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      const t = [
        '1<:smolstar:1107503653956374638> — **2 characters** — 2 <:liked:1110491720375873567>(0)',
        '2<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
        '3<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
        '4<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
        '5<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
      ];

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [],
        embeds: [
          {
            type: 'rich',
            description: t.join('\n'),
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });
});

describe('/collection show', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it('normal', async () => {
    const media: DisaggregatedMedia[] = [
      {
        id: '1',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
        characters: [{ role: CharacterRole.Main, characterId: 'anilist:11' }],
      },
      {
        id: '2',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
        characters: [{ role: CharacterRole.Main, characterId: 'anilist:12' }],
      },
      {
        id: '3',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 3',
        },
        characters: [{ role: CharacterRole.Main, characterId: 'anilist:13' }],
      },
      {
        id: '4',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 4',
        },
        characters: [{ role: CharacterRole.Main, characterId: 'anilist:14' }],
      },
      {
        id: '5',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 5',
        },
        characters: [{ role: CharacterRole.Main, characterId: 'anilist:15' }],
      },
      {
        id: '6',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 6',
        },
        characters: [{ role: CharacterRole.Main, characterId: 'anilist:16' }],
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getUser').mockReturnValue({ likes: [] } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      { characterId: 'anilist:11', mediaId: 'anilist:1' },
      { characterId: 'anilist:12', mediaId: 'anilist:2' },
      { characterId: 'anilist:13', mediaId: 'anilist:3' },
      { characterId: 'anilist:14', mediaId: 'anilist:4' },
      { characterId: 'anilist:15', mediaId: 'anilist:5' },
      { characterId: 'anilist:15', mediaId: 'anilist:6' },
    ] as any);

    vi.spyOn(db, 'getMediaCharacters').mockReturnValue([] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'media').mockResolvedValue(media);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.showcase({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        index: 0,
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

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'showcase=user_id=1=prev',
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
                custom_id: 'showcase=user_id=1=next',
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
                value: '~~100% — 1 / 1~~',
              },
              {
                inline: false,
                name: 'title 2',
                value: '~~100% — 1 / 1~~',
              },
              {
                inline: false,
                name: 'title 3',
                value: '~~100% — 1 / 1~~',
              },
              {
                inline: false,
                name: 'title 4',
                value: '~~100% — 1 / 1~~',
              },
              {
                inline: false,
                name: 'title 5',
                value: '~~100% — 1 / 1~~',
              },
            ],
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('sort by owned', async () => {
    const media: DisaggregatedMedia[] = [
      {
        id: '1',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
        characters: [
          { role: CharacterRole.Main, characterId: 'anilist:11' },
          { role: CharacterRole.Main, characterId: 'anilist:12' },
          { role: CharacterRole.Main, characterId: 'anilist:13' },
        ],
      },
      {
        id: '2',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
        characters: [
          { role: CharacterRole.Main, characterId: 'anilist:14' },
          { role: CharacterRole.Main, characterId: 'anilist:15' },
        ],
      },
      {
        id: '3',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 3',
        },
        characters: [
          { role: CharacterRole.Main, characterId: 'anilist:16' },
          { role: CharacterRole.Main, characterId: 'anilist:17' },
        ],
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getUser').mockReturnValue({ likes: [] } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      { characterId: 'anilist:11', mediaId: 'anilist:1' },
      { characterId: 'anilist:14', mediaId: 'anilist:2' },
      { characterId: 'anilist:15', mediaId: 'anilist:2' },
      { characterId: 'anilist:16', mediaId: 'anilist:3' },
    ] as any);

    vi.spyOn(db, 'getMediaCharacters').mockReturnValue([] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'media').mockResolvedValue(media);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.showcase({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        index: 0,
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

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'showcase=user_id=0=prev',
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
                custom_id: 'showcase=user_id=0=next',
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
                value: '~~100% — 2 / 2~~',
              },
              {
                inline: false,
                name: 'title 1',
                value: '33% — 1 / 3',
              },
              {
                inline: false,
                name: 'title 3',
                value: '50% — 1 / 2',
              },
            ],
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('sort by liked then owned', async () => {
    const media: DisaggregatedMedia[] = [
      {
        id: '1',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
        characters: [{ role: CharacterRole.Main, characterId: 'anilist:11' }],
      },
      {
        id: '2',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
        characters: [
          { role: CharacterRole.Main, characterId: 'anilist:12' },
          { role: CharacterRole.Main, characterId: 'anilist:13' },
          { role: CharacterRole.Main, characterId: 'anilist:14' },
        ],
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getUser').mockReturnValue({
      likes: [{ mediaId: 'anilist:1' }],
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      { characterId: 'anilist:11', mediaId: 'anilist:1' },
      { characterId: 'anilist:12', mediaId: 'anilist:2' },
      { characterId: 'anilist:13', mediaId: 'anilist:2' },
      { characterId: 'anilist:14', mediaId: 'anilist:2' },
    ] as any);

    vi.spyOn(db, 'getMediaCharacters').mockReturnValue([] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'media').mockResolvedValue(media);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.showcase({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        index: 0,
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

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'showcase=user_id=0=prev',
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
                custom_id: 'showcase=user_id=0=next',
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
                name: 'title 1 <:liked:1110491720375873567>',
                value: '~~100% — 1 / 1~~',
              },
              {
                inline: false,
                name: 'title 2',
                value: '~~100% — 3 / 3~~',
              },
            ],
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('aggregate liked media relations', async () => {
    const media: DisaggregatedMedia[] = [
      {
        id: '1',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
        popularity: 2000,
        characters: [{ role: CharacterRole.Main, characterId: 'anilist:11' }],
        relations: [{ relation: MediaRelation.Parent, mediaId: '2' }],
      },
      {
        id: '2',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
        popularity: 1000,
        characters: [{ role: CharacterRole.Main, characterId: 'anilist:12' }],
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getUser').mockReturnValue({
      likes: [{ mediaId: 'anilist:1' }],
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      { characterId: 'anilist:11', mediaId: 'anilist:1' },
      { characterId: 'anilist:12', mediaId: 'anilist:2' },
    ] as any);

    vi.spyOn(db, 'getMediaCharacters').mockReturnValue([] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'media').mockResolvedValue(media);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.showcase({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        index: 0,
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

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'showcase=user_id=0=prev',
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
                custom_id: 'showcase=user_id=0=next',
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
                name: 'title 1 <:liked:1110491720375873567>',
                value: '~~100% — 1 / 1~~',
              },
              {
                inline: false,
                name: 'title 2 <:liked:1110491720375873567>',
                value: '~~100% — 1 / 1~~',
              },
            ],
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('filter out background characters', async () => {
    const media: DisaggregatedMedia[] = [
      {
        id: '1',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
        characters: [
          { role: CharacterRole.Supporting, characterId: 'anilist:11' },
          { role: CharacterRole.Main, characterId: 'anilist:12' },
          { role: CharacterRole.Background, characterId: 'anilist:13' },
          { role: CharacterRole.Background, characterId: 'anilist:14' },
        ],
      },
      {
        id: '2',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
        characters: [
          { role: CharacterRole.Main, characterId: 'anilist:15' },
          { role: CharacterRole.Background, characterId: 'anilist:16' },
        ],
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getUser').mockReturnValue({ likes: [] } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      { characterId: 'anilist:11', mediaId: 'anilist:1' },
      { characterId: 'anilist:12', mediaId: 'anilist:1' },
      { characterId: 'anilist:13', mediaId: 'anilist:1' },
      { characterId: 'anilist:16', mediaId: 'anilist:2' },
    ] as any);

    vi.spyOn(db, 'getMediaCharacters').mockReturnValue([] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'media').mockResolvedValue(media);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.showcase({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        index: 0,
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

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'showcase=user_id=0=prev',
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
                custom_id: 'showcase=user_id=0=next',
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
                value: '~~100% — 2 / 2~~',
              },
              {
                inline: false,
                name: 'title 2',
                value: '0% — 0 / 1',
              },
            ],
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('owned by others', async () => {
    const media: DisaggregatedMedia[] = [
      {
        id: '1',
        packId: 'anilist',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
        characters: [
          { role: CharacterRole.Main, characterId: 'anilist:11' },
          { role: CharacterRole.Main, characterId: 'anilist:12' },
          { role: CharacterRole.Background, characterId: 'anilist:13' },
        ],
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getUser').mockReturnValue({ likes: [] } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      { characterId: 'anilist:11', mediaId: 'anilist:1' },
    ] as any);

    vi.spyOn(db, 'getMediaCharacters').mockReturnValue([
      {
        characterId: 'anilist:11',
        mediaId: 'anilist:1',
        userId: 'user_id',
      },
      {
        characterId: 'anilist:12',
        mediaId: 'anilist:1',
        userId: 'another_ser_id',
      },
      {
        characterId: 'anilist:13',
        mediaId: 'anilist:1',
        userId: 'another_ser_id',
      },
    ] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'media').mockResolvedValue(media);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.showcase({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        index: 0,
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

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'showcase=user_id=0=prev',
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
                custom_id: 'showcase=user_id=0=next',
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
                value: '_1 owned by other users!_\n50% — 1 / 2',
              },
            ],
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('no logs (Self)', async () => {
    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getUser').mockReturnValue({ likes: [] } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([] as any);

    vi.spyOn(db, 'getMediaCharacters').mockReturnValue([] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.showcase({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        index: 0,
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

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [
          {
            components: [
              {
                custom_id: 'gacha=user_id',
                label: '/gacha',
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
            description: "You don't have any characters",
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('no logs (Dave)', async () => {
    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    vi.spyOn(db, 'getUser').mockReturnValue({ likes: [] } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([] as any);

    vi.spyOn(db, 'getMediaCharacters').mockReturnValue([] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.showcase({
        userId: 'another_user_id',
        guildId: 'guild_id',
        token: 'test_token',
        index: 0,
        nick: true,
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

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [],
        embeds: [
          {
            type: 'rich',
            description: "<@another_user_id> doesn't have any characters",
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });
});

describe('/like', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it('normal', async () => {
    const character: Character = {
      id: '1',
      packId: 'pack-id',
      name: {
        english: 'character',
      },
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: '2',
              type: MediaType.Anime,
              title: {
                english: 'title',
              },
            },
          },
        ],
      },
    };

    vi.useFakeTimers();

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);

    vi.spyOn(db, 'likeCharacter').mockReturnValue('' as any);

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(packs, 'searchOneCharacter').mockResolvedValue(character);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.like({
        userId: 'user_id',
        guildId: 'guild_id',

        token: 'test_token',
        search: 'character',
        undo: false,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [{ filename: 'default.webp', id: '0' }],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'character=pack-id:1',
                label: '/character',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
        embeds: [
          {
            type: 'rich',
            description: 'Liked',
          },
          {
            type: 'rich',
            fields: [
              {
                name: 'title',
                value: '**character**',
              },
            ],
            thumbnail: {
              url: 'attachment://default.webp',
            },
            description:
              '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('normal (mentioned)', async () => {
    const character: Character = {
      id: '1',
      packId: 'pack-id',
      name: {
        english: 'character',
      },
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: '2',
              type: MediaType.Anime,
              title: {
                english: 'title',
              },
            },
          },
        ],
      },
    };

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(packs, 'searchOneCharacter').mockResolvedValue(character);

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);

    vi.spyOn(db, 'likeCharacter').mockReturnValue('' as any);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.like({
        userId: 'user_id',
        guildId: 'guild_id',

        token: 'test_token',
        search: 'character',
        mention: true,
        undo: false,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        allowed_mentions: { parse: [] },
        attachments: [{ filename: 'default.webp', id: '0' }],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'character=pack-id:1',
                label: '/character',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
        content: '<@user_id>',
        embeds: [
          {
            type: 'rich',
            description: 'Liked',
          },
          {
            type: 'rich',
            fields: [
              {
                name: 'title',
                value: '**character**',
              },
            ],
            thumbnail: {
              url: 'attachment://default.webp',
            },
            description:
              '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('undo', async () => {
    const character: Character = {
      id: '1',
      packId: 'pack-id',
      name: {
        english: 'character',
      },
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: '2',
              type: MediaType.Anime,
              title: {
                english: 'title',
              },
            },
          },
        ],
      },
    };

    vi.useFakeTimers();

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);

    vi.spyOn(db, 'unlikeCharacter').mockReturnValue('' as any);

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(packs, 'searchOneCharacter').mockResolvedValue(character);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.like({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        search: 'character',
        undo: true,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [{ filename: 'default.webp', id: '0' }],
        components: [],
        embeds: [
          {
            type: 'rich',
            description: 'Unliked',
          },
          {
            type: 'rich',
            fields: [
              {
                name: 'title',
                value: '**character**',
              },
            ],
            thumbnail: {
              url: 'attachment://default.webp',
            },
            description:
              '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('undo (exists)', async () => {
    const character: Character = {
      id: '1',
      packId: 'pack-id',
      name: {
        english: 'character',
      },
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: '2',
              type: MediaType.Anime,
              title: {
                english: 'title',
              },
            },
          },
        ],
      },
    };

    vi.useFakeTimers();

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);

    vi.spyOn(db, 'unlikeCharacter').mockReturnValue('' as any);

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(packs, 'searchOneCharacter').mockResolvedValue(character);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.like({
        userId: 'user_id',
        guildId: 'guild_id',

        token: 'test_token',
        search: 'character',
        undo: true,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [{ filename: 'default.webp', id: '0' }],
        components: [],
        embeds: [
          {
            type: 'rich',
            description: 'Unliked',
          },
          {
            type: 'rich',
            fields: [
              {
                name: 'title',
                value: '**character**',
              },
            ],
            thumbnail: {
              url: 'attachment://default.webp',
            },
            description:
              '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('undo (owned)', async () => {
    const character: Character = {
      id: '1',
      packId: 'pack-id',
      name: {
        english: 'character',
      },
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: '2',
              type: MediaType.Anime,
              title: {
                english: 'title',
              },
            },
          },
        ],
      },
    };

    vi.useFakeTimers();

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);

    vi.spyOn(db, 'unlikeCharacter').mockReturnValue('' as any);

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(packs, 'searchOneCharacter').mockResolvedValue(character);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.like({
        userId: 'user_id',
        guildId: 'guild_id',

        token: 'test_token',
        search: 'character',
        undo: true,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [{ filename: 'default.webp', id: '0' }],
        components: [],
        embeds: [
          {
            type: 'rich',
            description: 'Unliked',
          },
          {
            type: 'rich',
            fields: [
              {
                name: 'title',
                value: '**character**',
              },
            ],
            thumbnail: {
              url: 'attachment://default.webp',
            },
            description:
              '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('not found', async () => {
    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(packs, 'searchOneCharacter').mockResolvedValue(undefined);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.like({
        userId: 'user_id',
        guildId: 'guild_id',

        token: 'test_token',
        search: 'character',
        undo: false,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        components: [],
        attachments: [],
        embeds: [
          {
            type: 'rich',
            description: 'Found _nothing_ matching that query!',
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });
});

describe('/likeall', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it('normal', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      title: {
        english: 'title',
      },
    };

    vi.useFakeTimers();

    vi.spyOn(db, 'getGuild').mockReturnValue('' as any);

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);

    vi.spyOn(db, 'likeMedia').mockReturnValue('' as any);

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(packs, 'searchOneMedia').mockResolvedValue(media);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.likeall({
        userId: 'user_id',
        guildId: 'guild_id',

        token: 'test_token',
        search: 'title',
        undo: false,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [{ filename: 'default.webp', id: '0' }],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'media=pack-id:1',
                label: '/anime',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
        embeds: [
          {
            type: 'rich',
            description: 'Liked',
          },
          {
            type: 'rich',
            title: 'title',
            thumbnail: {
              url: 'attachment://default.webp',
            },
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('normal (undo)', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      title: {
        english: 'title',
      },
    };

    vi.useFakeTimers();

    vi.spyOn(db, 'getGuild').mockReturnValue('' as any);

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);

    vi.spyOn(db, 'unlikeMedia').mockReturnValue('' as any);

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(packs, 'searchOneMedia').mockResolvedValue(media);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.likeall({
        userId: 'user_id',
        guildId: 'guild_id',

        token: 'test_token',
        search: 'title',
        undo: true,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [{ filename: 'default.webp', id: '0' }],
        components: [],
        embeds: [
          {
            type: 'rich',
            description: 'Unliked',
          },
          {
            type: 'rich',
            title: 'title',
            thumbnail: {
              url: 'attachment://default.webp',
            },
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('not found', async () => {
    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'getGuild').mockReturnValue('' as any);

    vi.spyOn(packs, 'searchOneMedia').mockResolvedValue(undefined);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.likeall({
        userId: 'user_id',
        guildId: 'guild_id',

        token: 'test_token',
        search: 'title',
        undo: false,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        components: [],
        attachments: [],
        embeds: [
          {
            type: 'rich',
            description: 'Found _nothing_ matching that query!',
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });
});

describe('/likeslist', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it('normal', async () => {
    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'character 1',
        },
      },
      {
        id: '2',
        packId: 'anilist',
        name: {
          english: 'character 2',
        },
      },
      {
        id: '3',
        packId: 'anilist',
        name: {
          english: 'character 3',
        },
      },
      {
        id: '4',
        packId: 'anilist',
        name: {
          english: 'character 4',
        },
      },
      {
        id: '5',
        packId: 'anilist',
        name: {
          english: 'character 5',
        },
      },
      {
        id: '6',
        packId: 'anilist',
        name: {
          english: 'character 6',
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'getUser').mockReturnValue({
      likes: [
        { characterId: 'anilist:1' },
        { characterId: 'anilist:2' },
        { characterId: 'anilist:3' },
        { characterId: 'anilist:4' },
        { characterId: 'anilist:5' },
        { characterId: 'anilist:6' },
        { characterId: 'anilist:7' },
        { characterId: 'anilist:8' },
        { characterId: 'anilist:9' },
      ],
    } as any);

    vi.spyOn(db, 'findCharacters').mockReturnValue([] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.likeslist({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'likes=user_id=0==1=prev',
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
                custom_id: 'likes=user_id=0==1=next',
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
                name: '1<:smolstar:1107503653956374638> character 1',
                value: '\u200B',
              },
              {
                inline: false,
                name: '1<:smolstar:1107503653956374638> character 2',
                value: '\u200B',
              },
              {
                inline: false,
                name: '1<:smolstar:1107503653956374638> character 3',
                value: '\u200B',
              },
              {
                inline: false,
                name: '1<:smolstar:1107503653956374638> character 4',
                value: '\u200B',
              },
              {
                inline: false,
                name: '1<:smolstar:1107503653956374638> character 5',
                value: '\u200B',
              },
            ],
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('normal (exists)', async () => {
    const character: Character = {
      id: '1',
      packId: 'anilist',
      name: {
        english: 'character',
      },
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: '2',
              packId: 'anilist',
              type: MediaType.Anime,
              title: {
                english: 'title',
              },
            },
          },
        ],
      },
    };

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'getUser').mockReturnValue({
      likes: [{ characterId: 'anilist:1' }],
    } as any);

    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);

    vi.spyOn(db, 'findCharacters').mockReturnValue([
      {
        characterId: 'anilist:1',
        rating: 3,
        userId: 'another_user_id',
      },
    ] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.likeslist({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'likes=user_id=0==0=prev',
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
                custom_id: 'likes=user_id=0==0=next',
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
                name: 'title',
                value:
                  '3<:smolstar:1107503653956374638> <@another_user_id> character',
              },
            ],
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('normal (filtered)', async () => {
    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'character 1',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: {
                id: '1',
                packId: 'anilist',
                type: MediaType.Anime,
                title: {
                  english: 'title 1',
                },
              },
            },
          ],
        },
      },
      {
        id: '2',
        packId: 'anilist',
        name: {
          english: 'character 2',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: {
                id: '2',
                packId: 'anilist',
                type: MediaType.Anime,
                title: {
                  english: 'title 2',
                },
              },
            },
          ],
        },
      },
      {
        id: '3',
        packId: 'anilist',
        name: {
          english: 'character 3',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: {
                id: '3',
                packId: 'anilist',
                type: MediaType.Anime,
                title: {
                  english: 'title 3',
                },
              },
            },
          ],
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'getUser').mockReturnValue({
      likes: [
        { characterId: 'anilist:1' },
        { characterId: 'anilist:2' },
        { characterId: 'anilist:3' },
      ],
    } as any);

    vi.spyOn(db, 'findCharacters').mockReturnValue([
      {
        characterId: 'anilist:1',
        rating: 3,
        userId: 'user_id',
      },
      {
        characterId: 'anilist:2',
        rating: 3,
        userId: 'another_user_id',
      },
    ] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.likeslist({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        filter: true,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'likes=user_id=1==0=prev',
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
                custom_id: 'likes=user_id=1==0=next',
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
                value:
                  '3<:smolstar:1107503653956374638> <@another_user_id> character 2',
              },
              {
                inline: false,
                name: 'title 3',
                value: '1<:smolstar:1107503653956374638> character 3',
              },
            ],
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('normal (owned by)', async () => {
    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'character 1',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: {
                id: '1',
                packId: 'anilist',
                type: MediaType.Anime,
                title: {
                  english: 'title 1',
                },
              },
            },
          ],
        },
      },
      {
        id: '2',
        packId: 'anilist',
        name: {
          english: 'character 2',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: {
                id: '2',
                packId: 'anilist',
                type: MediaType.Anime,
                title: {
                  english: 'title 2',
                },
              },
            },
          ],
        },
      },
      {
        id: '3',
        packId: 'anilist',
        name: {
          english: 'character 3',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: {
                id: '3',
                packId: 'anilist',
                type: MediaType.Anime,
                title: {
                  english: 'title 3',
                },
              },
            },
          ],
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'getUser').mockReturnValue({
      likes: [
        { characterId: 'anilist:1' },
        { characterId: 'anilist:2' },
        { characterId: 'anilist:3' },
      ],
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      {
        characterId: 'anilist:1',
        rating: 3,
        userId: 'another_user_id',
      },
      {
        characterId: 'anilist:2',
        rating: 3,
        userId: 'another_user_id',
      },
    ] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.likeslist({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        filter: true,
        ownedBy: 'another_user_id',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'likes=user_id=1=another_user_id=0=prev',
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
                custom_id: 'likes=user_id=1=another_user_id=0=next',
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
                value:
                  '3<:smolstar:1107503653956374638> <@another_user_id> character 1',
              },
              {
                inline: false,
                name: 'title 2',
                value:
                  '3<:smolstar:1107503653956374638> <@another_user_id> character 2',
              },
            ],
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('empty', async () => {
    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'character 1',
        },
      },
      {
        id: '2',
        packId: 'anilist',
        name: {
          english: 'character 2',
        },
      },
      {
        id: '3',
        packId: 'anilist',
        name: {
          english: 'character 3',
        },
      },
      {
        id: '4',
        packId: 'anilist',
        name: {
          english: 'character 4',
        },
      },
      {
        id: '5',
        packId: 'anilist',
        name: {
          english: 'character 5',
        },
      },
      {
        id: '6',
        packId: 'anilist',
        name: {
          english: 'character 6',
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'getUser').mockReturnValue({
      likes: [],
    } as any);

    vi.spyOn(db, 'findCharacters').mockReturnValue([] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.likeslist({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        components: [],
        attachments: [],
        embeds: [
          {
            type: 'rich',
            description: "You don't have any likes",
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('empty (Dave)', async () => {
    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'character 1',
        },
      },
      {
        id: '2',
        packId: 'anilist',
        name: {
          english: 'character 2',
        },
      },
      {
        id: '3',
        packId: 'anilist',
        name: {
          english: 'character 3',
        },
      },
      {
        id: '4',
        packId: 'anilist',
        name: {
          english: 'character 4',
        },
      },
      {
        id: '5',
        packId: 'anilist',
        name: {
          english: 'character 5',
        },
      },
      {
        id: '6',
        packId: 'anilist',
        name: {
          english: 'character 6',
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'getUser').mockReturnValue({
      likes: [],
    } as any);

    vi.spyOn(db, 'findCharacters').mockReturnValue([] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.likeslist({
        index: 0,
        userId: 'another_user_id',
        guildId: 'guild_id',
        token: 'test_token',
        nick: true,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        components: [],
        attachments: [],
        embeds: [
          {
            type: 'rich',
            description: "<@another_user_id> doesn't have any likes",
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });
});

describe('/logs', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it('normal', async () => {
    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'character 1',
        },
      },
      {
        id: '2',
        packId: 'anilist',
        name: {
          english: 'character 2',
        },
      },
      {
        id: '3',
        packId: 'anilist',
        name: {
          english: 'character 3',
        },
      },
      {
        id: '4',
        packId: 'anilist',
        name: {
          english: 'character 4',
        },
      },
      {
        id: '5',
        packId: 'anilist',
        name: {
          english: 'character 5',
        },
      },
      {
        id: '6',
        packId: 'anilist',
        name: {
          english: 'character 6',
        },
      },
      {
        id: '7',
        packId: 'anilist',
        name: {
          english: 'character 7',
        },
      },
      {
        id: '8',
        packId: 'anilist',
        name: {
          english: 'character 8',
        },
      },
      {
        id: '9',
        packId: 'anilist',
        name: {
          english: 'character 9',
        },
      },
      {
        id: '10',
        packId: 'anilist',
        name: {
          english: 'character 10',
        },
      },
      {
        id: '11',
        packId: 'anilist',
        name: {
          english: 'character 11',
        },
      },
    ];

    const now = new Date('2024-04-10T11:30:29.172Z');
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {},
      user: { likes: [] },
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      { characterId: 'anilist:1', rating: 4, createdAt: now },
      { characterId: 'anilist:2', rating: 4, createdAt: now },
      { characterId: 'anilist:3', rating: 4, createdAt: now },
      { characterId: 'anilist:4', rating: 4, createdAt: now },
      { characterId: 'anilist:5', rating: 4, createdAt: now },
      { characterId: 'anilist:6', rating: 4, createdAt: now },
      { characterId: 'anilist:7', rating: 4, createdAt: now },
      { characterId: 'anilist:8', rating: 4, createdAt: now },
      { characterId: 'anilist:9', rating: 4, createdAt: now },
      { characterId: 'anilist:10', rating: 4, createdAt: now },
      { characterId: 'anilist:11', rating: 4, createdAt: now },
    ] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.logs({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [],
        embeds: [
          {
            type: 'rich',
            description: [
              '4<:smolstar:1107503653956374638> character 11 <t:1712748629:R>',
              '4<:smolstar:1107503653956374638> character 10 <t:1712748629:R>',
              '4<:smolstar:1107503653956374638> character 9 <t:1712748629:R>',
              '4<:smolstar:1107503653956374638> character 8 <t:1712748629:R>',
              '4<:smolstar:1107503653956374638> character 7 <t:1712748629:R>',
              '4<:smolstar:1107503653956374638> character 6 <t:1712748629:R>',
              '4<:smolstar:1107503653956374638> character 5 <t:1712748629:R>',
              '4<:smolstar:1107503653956374638> character 4 <t:1712748629:R>',
              '4<:smolstar:1107503653956374638> character 3 <t:1712748629:R>',
              '4<:smolstar:1107503653956374638> character 2 <t:1712748629:R>',
            ].join('\n'),
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('with nicknames', async () => {
    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'character 1',
        },
      },
      {
        id: '2',
        packId: 'anilist',
        name: {
          english: 'character 2',
        },
      },
      {
        id: '3',
        packId: 'anilist',
        name: {
          english: 'character 3',
        },
      },
      {
        id: '4',
        packId: 'anilist',
        name: {
          english: 'character 4',
        },
      },
      {
        id: '5',
        packId: 'anilist',
        name: {
          english: 'character 5',
        },
      },
      {
        id: '6',
        packId: 'anilist',
        name: {
          english: 'character 6',
        },
      },
      {
        id: '7',
        packId: 'anilist',
        name: {
          english: 'character 7',
        },
      },
      {
        id: '8',
        packId: 'anilist',
        name: {
          english: 'character 8',
        },
      },
      {
        id: '9',
        packId: 'anilist',
        name: {
          english: 'character 9',
        },
      },
      {
        id: '10',
        packId: 'anilist',
        name: {
          english: 'character 10',
        },
      },
      {
        id: '11',
        packId: 'anilist',
        name: {
          english: 'character 11',
        },
      },
    ];

    const now = new Date('2024-04-10T11:30:29.172Z');
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {},
      user: { likes: [] },
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      {
        characterId: 'anilist:1',
        rating: 4,
        nickname: 'nickname 1',
        createdAt: now,
      },
      {
        characterId: 'anilist:2',
        rating: 4,
        nickname: 'nickname 2',
        createdAt: now,
      },
      {
        characterId: 'anilist:3',
        rating: 4,
        nickname: 'nickname 3',
        createdAt: now,
      },
      {
        characterId: 'anilist:4',
        rating: 4,
        nickname: 'nickname 4',
        createdAt: now,
      },
      {
        characterId: 'anilist:5',
        rating: 4,
        nickname: 'nickname 5',
        createdAt: now,
      },
      {
        characterId: 'anilist:6',
        rating: 4,
        nickname: 'nickname 6',
        createdAt: now,
      },
      {
        characterId: 'anilist:7',
        rating: 4,
        nickname: 'nickname 7',
        createdAt: now,
      },
      {
        characterId: 'anilist:8',
        rating: 4,
        nickname: 'nickname 8',
        createdAt: now,
      },
      {
        characterId: 'anilist:9',
        rating: 4,
        nickname: 'nickname 9',
        createdAt: now,
      },
      {
        characterId: 'anilist:10',
        rating: 4,
        nickname: 'nickname 10',
        createdAt: now,
      },
      {
        characterId: 'anilist:11',
        rating: 4,
        nickname: 'nickname 11',
        createdAt: now,
      },
    ] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.logs({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [],
        components: [],
        embeds: [
          {
            type: 'rich',
            description: [
              '4<:smolstar:1107503653956374638> nickname 11 <t:1712748629:R>',
              '4<:smolstar:1107503653956374638> nickname 10 <t:1712748629:R>',
              '4<:smolstar:1107503653956374638> nickname 9 <t:1712748629:R>',
              '4<:smolstar:1107503653956374638> nickname 8 <t:1712748629:R>',
              '4<:smolstar:1107503653956374638> nickname 7 <t:1712748629:R>',
              '4<:smolstar:1107503653956374638> nickname 6 <t:1712748629:R>',
              '4<:smolstar:1107503653956374638> nickname 5 <t:1712748629:R>',
              '4<:smolstar:1107503653956374638> nickname 4 <t:1712748629:R>',
              '4<:smolstar:1107503653956374638> nickname 3 <t:1712748629:R>',
              '4<:smolstar:1107503653956374638> nickname 2 <t:1712748629:R>',
            ].join('\n'),
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('no logs (Self)', async () => {
    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {},
      user: { likes: [] },
    } as any);

    vi.spyOn(db, 'getUserCharacters').mockReturnValue([] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.logs({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        components: [],
        attachments: [],
        embeds: [
          {
            type: 'rich',
            description: "You don't have any characters",
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });

  it('no logs (Dave)', async () => {
    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {},
      user: { likes: [] },
    } as any);
    vi.spyOn(db, 'getUserCharacters').mockReturnValue([] as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.logs({
        userId: 'another_user_id',
        guildId: 'guild_id',
        token: 'test_token',
        nick: true,
      });

      expect(message.json()).toEqual({
        type: 4,
        data: {
          attachments: [{ filename: 'spinner.gif', id: '0' }],
          components: [],
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'attachment://spinner.gif',
              },
            },
          ],
        },
      });

      await vi.runAllTimersAsync();

      expect(fetchStub.mock.calls[0][0]).toBe(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original'
      );

      expect(fetchStub.mock.calls[0][1]?.method).toBe('PATCH');

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        components: [],
        attachments: [],
        embeds: [
          {
            type: 'rich',
            description: "<@another_user_id> doesn't have any characters",
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
    }
  });
});
