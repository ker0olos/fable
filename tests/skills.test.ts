/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, afterEach } from 'vitest';

import db from '~/db/index.ts';
import packs from '~/src/packs.ts';
import config from '~/src/config.ts';
import utils from '~/src/utils.ts';

import _skills, { skills } from '~/src/skills.ts';

import { type Character, CharacterRole, MediaType } from '~/src/types.ts';

import { NonFetalError } from '~/src/errors.ts';

describe('skills', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('all skills', () => {
    it('snapshot', async () => {
      expect(skills).toMatchSnapshot();
    });

    describe('crits', () => {
      it('hit', () => {
        const critSkill = skills.crit;
        vi.spyOn(Math, 'random').mockReturnValue(0);

        const output = critSkill.activation({
          attacking: {
            attack: 5,
          } as any,
          lvl: 1,
        });

        expect(output.damage).toBe(2);
      });

      it('miss', () => {
        const critSkill = skills.crit;
        vi.spyOn(Math, 'random').mockReturnValue(1);

        const output = critSkill.activation({
          attacking: {
            attack: 5,
          } as any,
          lvl: 1,
        });

        expect(output.damage).toBeUndefined();
      });
    });
  });

  describe('/skills showall', () => {
    it('page 0', async () => {
      const message = _skills.all(0);
      expect(message.json()).toMatchSnapshot();
    });
  });

  describe('/skills acquire', () => {
    afterEach(() => {
      vi.restoreAllMocks();
      vi.clearAllTimers();
    });

    it('normal', async () => {
      const character: Character = {
        id: '1',
        packId: 'id',
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

      vi.useFakeTimers();

      vi.spyOn(db, 'getInventory').mockReturnValue({} as any);
      vi.spyOn(db, 'findCharacter').mockReturnValue([
        { combat: { skills: {} }, userId: 'user_id' },
      ] as any);
      vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
      vi.spyOn(packs, 'characters').mockResolvedValue([character]);

      config.appId = 'app_id';
      config.origin = 'http://localhost:8000';

      const message = _skills.preAcquire({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        character: 'character',
        skillKey: 'crit',
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

      expect(utils.fetchWithRetry).toHaveBeenCalledWith(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
        })
      );

      const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
      const body = fetchCall?.body as FormData;
      const payloadJson = JSON.parse(body?.get('payload_json') as any);

      expect(payloadJson).toEqual({
        attachments: [{ filename: 'image-url.webp', id: '0' }],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 2,
                custom_id: 'cacquire=user_id=id:1=crit',
                label: 'Confirm',
              },
              {
                type: 2,
                style: 4,
                custom_id: 'cancel=user_id',
                label: 'Cancel',
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
                name: 'full name',
                value: '\u200B',
              },
            ],
            thumbnail: {
              url: 'attachment://image-url.webp',
            },
          },
          {
            type: 'rich',
            description: [
              `**Critical Hit** **(LVL 0 <:rarrow:1170533290105655428> LVL 1)**`,
              `The art of performing the traditional critical hit.`,
              `1. _Crit Chance (0.5%)_`,
              `2. _Crit Damage (30%)_`,
            ].join('\n'),
          },
          {
            type: 'rich',
            description: '<:remove:1099004424111792158> 2 Skill Points',
            title: 'Acquire Skill',
          },
        ],
      });

      delete config.appId;
      delete config.origin;
    });

    it('upgrade', async () => {
      const character: Character = {
        id: '1',
        packId: 'id',
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

      vi.useFakeTimers();

      vi.spyOn(db, 'getInventory').mockReturnValue({} as any);
      vi.spyOn(db, 'findCharacter').mockReturnValue([
        {
          combat: {
            skills: {
              crit: { level: 1 },
            },
          },
          userId: 'user_id',
        },
      ] as any);
      vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
      vi.spyOn(packs, 'characters').mockResolvedValue([character]);

      config.appId = 'app_id';
      config.origin = 'http://localhost:8000';

      const message = _skills.preAcquire({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        character: 'character',
        skillKey: 'crit',
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

      expect(utils.fetchWithRetry).toHaveBeenCalledWith(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
        })
      );

      const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
      const body = fetchCall?.body as FormData;
      const payloadJson = JSON.parse(body?.get('payload_json') as any);

      expect(payloadJson).toEqual({
        attachments: [{ filename: 'image-url.webp', id: '0' }],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 2,
                custom_id: 'cacquire=user_id=id:1=crit',
                label: 'Confirm',
              },
              {
                type: 2,
                style: 4,
                custom_id: 'cancel=user_id',
                label: 'Cancel',
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
                name: 'full name',
                value: '\u200B',
              },
            ],
            thumbnail: {
              url: 'attachment://image-url.webp',
            },
          },
          {
            type: 'rich',
            description: [
              `**Critical Hit** **(LVL 1 <:rarrow:1170533290105655428> LVL 2)**`,
              `The art of performing the traditional critical hit.`,
              `1. _Crit Chance (0.5% <:rarrow:1170533290105655428> 5%)_`,
              `2. _Crit Damage (30% <:rarrow:1170533290105655428> 45%)_`,
            ].join('\n'),
          },
          {
            type: 'rich',
            description: '<:remove:1099004424111792158> 2 Skill Points',
            title: 'Upgrade Skill',
          },
        ],
      });

      delete config.appId;
      delete config.origin;
    });

    it('skill is maxed', async () => {
      const character: Character = {
        id: '1',
        packId: 'id',
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

      vi.useFakeTimers();

      vi.spyOn(db, 'getInventory').mockReturnValue({} as any);
      vi.spyOn(db, 'findCharacter').mockReturnValue([
        {
          combat: {
            skills: {
              crit: { level: 3 },
            },
          },
          userId: 'user_id',
        },
      ] as any);
      vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
      vi.spyOn(packs, 'characters').mockResolvedValue([character]);

      config.appId = 'app_id';
      config.origin = 'http://localhost:8000';

      const message = _skills.preAcquire({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        character: 'character',
        skillKey: 'crit',
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

      expect(utils.fetchWithRetry).toHaveBeenCalledWith(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
        })
      );

      const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
      const body = fetchCall?.body as FormData;
      const payloadJson = JSON.parse(body?.get('payload_json') as any);

      expect(payloadJson).toEqual({
        attachments: [{ filename: 'image-url.webp', id: '0' }],
        components: [],
        embeds: [
          {
            type: 'rich',
            description:
              '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            fields: [
              {
                name: 'full name',
                value: '\u200B',
              },
            ],
            thumbnail: {
              url: 'attachment://image-url.webp',
            },
          },
          {
            type: 'rich',
            description: [
              `**Critical Hit** **(LVL MAX)**`,
              `The art of performing the traditional critical hit.`,
              `1. _Crit Chance (15%)_`,
              `2. _Crit Damage (60%)_`,
            ].join('\n'),
          },
          {
            type: 'rich',
            title: 'Skill is maxed',
          },
        ],
      });

      delete config.appId;
      delete config.origin;
    });

    it('character not owned', async () => {
      const character: Character = {
        id: '1',
        packId: 'id',
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

      vi.useFakeTimers();

      vi.spyOn(db, 'getInventory').mockReturnValue({} as any);
      vi.spyOn(db, 'findCharacter').mockReturnValue([] as any);
      vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
      vi.spyOn(packs, 'characters').mockResolvedValue([character]);

      config.appId = 'app_id';
      config.origin = 'http://localhost:8000';

      const message = _skills.preAcquire({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        character: 'character',
        skillKey: 'crit',
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

      expect(utils.fetchWithRetry).toHaveBeenCalledWith(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
        })
      );

      const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
      const body = fetchCall?.body as FormData;
      const payloadJson = JSON.parse(body?.get('payload_json') as any);

      expect(payloadJson).toEqual({
        attachments: [{ filename: 'image-url.webp', id: '0' }],
        components: [],
        embeds: [
          {
            type: 'rich',
            description:
              '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            fields: [
              {
                name: 'full name',
                value: '\u200B',
              },
            ],
            footer: {
              text: "Character is yet to be found and isn't combat ready",
            },
            thumbnail: {
              url: 'attachment://image-url.webp',
            },
          },
        ],
      });

      delete config.appId;
      delete config.origin;
    });

    it('character not owned by you', async () => {
      const character: Character = {
        id: '1',
        packId: 'id',
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

      vi.useFakeTimers();

      vi.spyOn(db, 'getInventory').mockReturnValue({} as any);
      vi.spyOn(db, 'findCharacter').mockReturnValue([
        {
          rating: 1,
          combat: { skills: {} },
          userId: 'another_user_id',
        },
      ] as any);
      vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
      vi.spyOn(packs, 'characters').mockResolvedValue([character]);

      config.appId = 'app_id';
      config.origin = 'http://localhost:8000';

      const message = _skills.preAcquire({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        character: 'character',
        skillKey: 'crit',
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

      expect(utils.fetchWithRetry).toHaveBeenCalledWith(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
        })
      );

      const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
      const body = fetchCall?.body as FormData;
      const payloadJson = JSON.parse(body?.get('payload_json') as any);

      expect(payloadJson).toEqual({
        attachments: [{ filename: 'image-url.webp', id: '0' }],
        components: [],
        embeds: [
          {
            type: 'rich',
            description: 'full name is not owned by you',
          },
          {
            type: 'rich',
            description:
              '<@another_user_id>\n\n<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            fields: [
              {
                name: 'full name',
                value: '\u200B',
              },
            ],
            thumbnail: {
              url: 'attachment://image-url.webp',
            },
          },
        ],
      });

      delete config.appId;
      delete config.origin;
    });

    it('character not found', async () => {
      vi.useFakeTimers();

      vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
      vi.spyOn(packs, 'all').mockResolvedValue([]);
      vi.spyOn(packs, 'characters').mockResolvedValue([]);

      config.appId = 'app_id';
      config.origin = 'http://localhost:8000';

      const message = _skills.preAcquire({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        character: 'character',
        skillKey: 'crit',
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

      expect(utils.fetchWithRetry).toHaveBeenCalledWith(
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
        })
      );

      const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
      const body = fetchCall?.body as FormData;
      const payloadJson = JSON.parse(body?.get('payload_json') as any);

      expect(payloadJson).toEqual({
        attachments: [],
        components: [],
        embeds: [
          {
            type: 'rich',
            description: 'Found _nothing_ matching that query!',
          },
        ],
      });

      delete config.appId;
      delete config.origin;
    });

    it("skill doesn't exist", () => {
      expect(() =>
        _skills.preAcquire({
          token: 'test_token',
          userId: 'user_id',
          guildId: 'guild_id',
          character: 'character',
          skillKey: 'skill' as any,
        })
      ).toThrowError('404');
    });
  });
});

describe('acquire skill', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('normal', async () => {
    vi.spyOn(db, 'acquireSkill').mockResolvedValue({ level: 1 });

    const message = await _skills.acquire({
      userId: 'user_id',
      guildId: 'guild_id',
      characterId: 'character_id',
      skillKey: 'crit',
    });

    expect(db.acquireSkill).toHaveBeenCalledWith(
      'user_id',
      'guild_id',
      'character_id',
      'crit'
    );

    expect(message.json()).toEqual({
      type: 4,
      data: {
        attachments: [],
        components: [],
        embeds: [
          {
            type: 'rich',
            title: 'Skill Acquired',
          },
          {
            type: 'rich',
            description: [
              `**Critical Hit** **(LVL 0 <:rarrow:1170533290105655428> LVL 1)**`,
              `The art of performing the traditional critical hit.`,
              `1. _Crit Chance (0.5%)_`,
              `2. _Crit Damage (30%)_`,
            ].join('\n'),
          },
        ],
      },
    });
  });

  it('upgrade', async () => {
    vi.spyOn(db, 'acquireSkill').mockResolvedValue({ level: 2 } as any);

    const message = await _skills.acquire({
      userId: 'user_id',
      guildId: 'guild_id',
      characterId: 'character_id',
      skillKey: 'crit',
    });

    expect(db.acquireSkill).toHaveBeenCalledWith(
      'user_id',
      'guild_id',
      'character_id',
      'crit'
    );

    expect(message.json()).toEqual({
      type: 4,
      data: {
        attachments: [],
        components: [],
        embeds: [
          {
            type: 'rich',
            title: 'Skill Upgraded',
          },
          {
            type: 'rich',
            description: [
              `**Critical Hit** **(LVL 1 <:rarrow:1170533290105655428> LVL 2)**`,
              `The art of performing the traditional critical hit.`,
              `1. _Crit Chance (0.5% <:rarrow:1170533290105655428> 5%)_`,
              `2. _Crit Damage (30% <:rarrow:1170533290105655428> 45%)_`,
            ].join('\n'),
          },
        ],
      },
    });
  });

  it('skill is maxed', async () => {
    vi.spyOn(db, 'acquireSkill').mockRejectedValue(new NonFetalError('failed'));

    const message = await _skills.acquire({
      userId: 'user_id',
      guildId: 'guild_id',
      characterId: 'character_id',
      skillKey: 'crit',
    });

    expect(db.acquireSkill).toHaveBeenCalledWith(
      'user_id',
      'guild_id',
      'character_id',
      'crit'
    );

    expect(message.json()).toEqual({
      type: 4,
      data: {
        attachments: [],
        components: [],
        embeds: [
          {
            type: 'rich',
            description: 'Failed',
          },
        ],
      },
    });
  });

  it('skill not found', async () => {
    await expect(() =>
      _skills.acquire({
        userId: 'user_id',
        guildId: 'guild_id',
        characterId: 'character_id',
        skillKey: 'skill' as any,
      })
    ).rejects.toThrowError('404');
  });
});
