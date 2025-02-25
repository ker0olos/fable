/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

import utils from '~/src/utils.ts';
import packs from '~/src/packs.ts';
import stats from '~/src/stats.ts';
import config from '~/src/config.ts';
import db from '~/db/index.ts';

describe('/stats', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
    delete config.appId;
    delete config.origin;
    delete config.combat;
  });

  test('normal', async () => {
    vi.spyOn(packs, 'characters').mockResolvedValueOnce([
      {
        id: '1',
        packId: 'id',
        name: {
          english: 'full name',
        },
        images: [
          {
            url: 'image_url',
          },
        ],
      },
    ]);

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);

    vi.spyOn(db, 'findCharacter').mockReturnValue([
      {
        characterId: 'id:1',
        rating: 4,
        combat: {
          level: 2,
          exp: 10,
          // unclaimedStatsPoints: 1,
          curStats: {
            attack: 1,
            defense: 2,
            speed: 3,
            hp: 28,
          },
        },
        userId: 'user_id',
      },
    ] as any);

    config.combat = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = stats.view({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      character: 'character_id',
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

    expect(fetchStub).toHaveBeenCalledTimes(1);

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
      attachments: [{ filename: 'image-url.webp', id: '0' }],
      embeds: [
        {
          type: 'rich',
          description:
            '<@user_id>\n\n<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906>',
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
          fields: [
            {
              name: 'full name',
              value: 'Level 2\n10/20',
            },
            {
              name: 'Stats',
              value: 'Skill Points: 0\nAttack: 1\nDefense: 2\nSpeed: 3\nHP: 28',
            },
          ],
        },
      ],
      components: [
        {
          type: 1,
          components: [
            //     {
            //       custom_id: 'stats=atk=user_id=id:1',
            //       disabled: false,
            //       label: '+1 ATK',
            //       style: 2,
            //       type: 2,
            //     },
            //     {
            //       custom_id: 'stats=def=user_id=id:1',
            //       disabled: false,
            //       label: '+1 DEF',
            //       style: 2,
            //       type: 2,
            //     },
            //     {
            //       custom_id: 'stats=spd=user_id=id:1',
            //       disabled: false,
            //       label: '+1 SPD',
            //       style: 2,
            //       type: 2,
            //     },
            //   ],
            {
              custom_id: 'character=id:1',
              label: '/character',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'like=id:1',
              label: '/like',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'passign=user_id=id:1',
              label: '/p assign',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
    });
  });

  test('skills', async () => {
    vi.spyOn(packs, 'characters').mockResolvedValueOnce([
      {
        id: '1',
        packId: 'id',
        name: {
          english: 'full name',
        },
        images: [
          {
            url: 'image_url',
          },
        ],
      },
    ]);

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);

    vi.spyOn(db, 'findCharacter').mockReturnValue([
      {
        characterId: 'id:1',
        rating: 4,
        combat: {
          skillPoints: 2,
          skills: { crit: { level: 2 } },
          // unclaimedStatsPoints: 0,
          curStats: {
            attack: 1,
            defense: 2,
            speed: 3,
            hp: 18,
          },
        },
        userId: 'user_id',
      },
    ] as any);

    config.combat = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = stats.view({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      character: 'character_id',
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

    expect(fetchStub).toHaveBeenCalledTimes(1);

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
      attachments: [{ filename: 'image-url.webp', id: '0' }],
      embeds: [
        {
          type: 'rich',
          description:
            '<@user_id>\n\n<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906>',
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
          fields: [
            {
              name: 'full name',
              value: 'Level 1\n0/10',
            },
            {
              name: 'Skills',
              value: 'Critical Hit (LVL 2)',
            },
            {
              name: 'Stats',
              value: 'Skill Points: 2\nAttack: 1\nDefense: 2\nSpeed: 3\nHP: 18',
            },
          ],
        },
      ],
      components: [
        {
          type: 1,
          components: [
            //     {
            //       custom_id: 'stats=atk=user_id=id:1',
            //       disabled: true,
            //       label: '+1 ATK',
            //       style: 2,
            //       type: 2,
            //     },
            //     {
            //       custom_id: 'stats=def=user_id=id:1',
            //       disabled: true,
            //       label: '+1 DEF',
            //       style: 2,
            //       type: 2,
            //     },
            //     {
            //       custom_id: 'stats=spd=user_id=id:1',
            //       disabled: true,
            //       label: '+1 SPD',
            //       style: 2,
            //       type: 2,
            //     },
            {
              custom_id: 'character=id:1',
              label: '/character',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'like=id:1',
              label: '/like',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'passign=user_id=id:1',
              label: '/p assign',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
    });
  });

  test('another user', async () => {
    vi.spyOn(packs, 'characters').mockResolvedValueOnce([
      {
        id: '1',
        packId: 'id',
        name: {
          english: 'full name',
        },
        images: [
          {
            url: 'image_url',
          },
        ],
      },
    ]);

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);

    vi.spyOn(db, 'findCharacter').mockReturnValue([
      {
        characterId: 'id:1',
        rating: 4,
        combat: {
          level: 2,
          exp: 10,
          // unclaimedStatsPoints: 1,
          curStats: {
            attack: 1,
            defense: 2,
            speed: 3,
            hp: 8,
          },
        },
        userId: 'another_user_id',
      },
    ] as any);

    config.combat = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = stats.view({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      character: 'character_id',
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

    expect(fetchStub).toHaveBeenCalledTimes(1);

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
      attachments: [{ filename: 'image-url.webp', id: '0' }],
      embeds: [
        {
          type: 'rich',
          description:
            '<@another_user_id>\n\n<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906>',
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
          fields: [
            {
              name: 'full name',
              value: 'Level 2\n10/20',
            },
            {
              name: 'Stats',
              value: 'Skill Points: 0\nAttack: 1\nDefense: 2\nSpeed: 3\nHP: 8',
            },
          ],
        },
      ],
      components: [
        {
          type: 1,
          components: [
            //     {
            //       custom_id: 'stats=atk=user_id=id:1',
            //       disabled: false,
            //       label: '+1 ATK',
            //       style: 2,
            //       type: 2,
            //     },
            //     {
            //       custom_id: 'stats=def=user_id=id:1',
            //       disabled: false,
            //       label: '+1 DEF',
            //       style: 2,
            //       type: 2,
            //     },
            //     {
            //       custom_id: 'stats=spd=user_id=id:1',
            //       disabled: false,
            //       label: '+1 SPD',
            //       style: 2,
            //       type: 2,
            //     },
            //   ],
            {
              custom_id: 'character=id:1',
              label: '/character',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'like=id:1',
              label: '/like',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
    });
  });

  test('not fit for combat (not owned)', async () => {
    vi.spyOn(packs, 'characters').mockResolvedValueOnce([
      {
        id: '1',
        packId: 'id',
        name: {
          english: 'full name',
        },
        images: [
          {
            url: 'image_url',
          },
        ],
      },
    ]);

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);

    vi.spyOn(db, 'findCharacter').mockReturnValue([] as any);

    config.combat = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = stats.view({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      character: 'character_id',
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
      attachments: [{ filename: 'image-url.webp', id: '0' }],
      components: [],
      embeds: [
        {
          type: 'rich',
          description:
            '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
          fields: [
            {
              name: 'full name',
              value: '\u200B',
            },
          ],
          footer: {
            text: "Character is yet to be found and isn't combat ready",
          },
        },
      ],
    });
  });

  test('maintenance', () => {
    // Empty test preserved from original
  });
});
