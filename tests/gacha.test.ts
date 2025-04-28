/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, vi, afterEach } from 'vitest';

import Rating from '~/src/rating.ts';
import gacha, { Pull } from '~/src/gacha.ts';
import utils from '~/src/utils.ts';
import packs from '~/src/packs.ts';
import config from '~/src/config.ts';
import db from '~/db/index.ts';

import {
  Character,
  CharacterRole,
  Media,
  MediaFormat,
  MediaRelation,
  MediaType,
} from '~/src/types.ts';

import { NoPullsError } from '~/src/errors.ts';

describe('adding character to inventory', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  test('rng pool', async () => {
    const variables = {
      rating: 1,
    };

    const poolStub = vi.spyOn(db, 'ratingPool').mockResolvedValue([
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'name',
        },
        rating: 1,
        media: [
          {
            role: CharacterRole.Main,
            mediaId: 'anilist:anime',
          },
        ],
      },
    ]);

    vi.spyOn(utils, 'rng')
      .mockReturnValueOnce({ value: false, chance: NaN })
      .mockReturnValueOnce({ value: variables.rating, chance: NaN });

    vi.spyOn(utils, 'fetchWithRetry').mockImplementation(
      () => undefined as any
    );
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'getActiveUsersIfLiked').mockReturnValue([] as any);
    vi.spyOn(db, 'addCharacter').mockReturnValue({ ok: true } as any);
    vi.spyOn(db, 'findGuildCharacters').mockResolvedValue([]);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(packs, 'aggregate').mockResolvedValue({
      id: '1',
      packId: 'anilist',
      rating: 1,
      name: {
        english: 'name',
      },
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: 'anime',
              packId: 'anilist',
              popularity: 2500,
              type: MediaType.Anime,
              format: MediaFormat.TV,
              title: {
                english: 'title',
              },
            },
          },
        ],
      },
    });

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    const result = await gacha.rngPull({
      userId: 'user_id',
      guildId: 'guild_id',
    });

    expect(result).toMatchObject({
      character: {
        id: '1',
        packId: 'anilist',
        media: {
          edges: [
            {
              node: {
                format: MediaFormat.TV,
                id: 'anime',
                packId: 'anilist',
                popularity: 2500,
                title: {
                  english: 'title',
                },
                type: MediaType.Anime,
              },
              role: CharacterRole.Main,
            },
          ],
        },
        name: {
          english: 'name',
        },
      },
    });

    expect(poolStub).toHaveBeenCalledTimes(1);
  });

  test.skip('liked pool (one liked character)', async () => {
    const mediaPoolStub = vi.spyOn(db, 'likesPool').mockResolvedValue([
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'name',
        },
        rating: 5,
        media: [
          {
            role: CharacterRole.Main,
            mediaId: 'anilist:anime',
          },
        ],
      },
    ]);

    vi.spyOn(utils, 'rng').mockReturnValue({ value: true, chance: NaN });
    vi.spyOn(utils, 'fetchWithRetry').mockImplementation(
      () => undefined as any
    );
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'getUser').mockReturnValue({
      likes: [{ characterId: 'anilist:1' }],
    } as any);
    vi.spyOn(db, 'getActiveUsersIfLiked').mockReturnValue([] as any);
    vi.spyOn(db, 'findCharacters').mockReturnValue([undefined] as any);
    vi.spyOn(db, 'addCharacter').mockReturnValue({ ok: true } as any);
    vi.spyOn(db, 'findGuildCharacters').mockResolvedValue([]);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'aggregate').mockResolvedValue({
      id: '1',
      packId: 'anilist',
      rating: 5,
      name: {
        english: 'name',
      },
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: 'anime',
              packId: 'anilist',
              popularity: 100000,
              type: MediaType.Anime,
              format: MediaFormat.TV,
              title: {
                english: 'title',
              },
            },
          },
        ],
      },
    });

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    const result = await gacha.rngPull({
      userId: 'user_id',
      guildId: 'guild_id',
    });

    expect(result).toMatchObject({
      character: {
        id: '1',
        packId: 'anilist',
        media: {
          edges: [
            {
              node: {
                format: MediaFormat.TV,
                id: 'anime',
                packId: 'anilist',
                title: {
                  english: 'title',
                },
                type: MediaType.Anime,
              },
              role: CharacterRole.Main,
            },
          ],
        },
        name: {
          english: 'name',
        },
      },
    });

    expect(mediaPoolStub).toHaveBeenCalledTimes(1);
  });

  test.skip('liked pool (one media)', async () => {
    const mediaPoolStub = vi.spyOn(db, 'likesPool').mockResolvedValue([
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'name',
        },
        rating: 5,
        media: [
          {
            role: CharacterRole.Main,
            mediaId: 'anilist:anime',
          },
        ],
      },
    ]);

    vi.spyOn(utils, 'rng').mockReturnValue({ value: true, chance: NaN });
    vi.spyOn(utils, 'fetchWithRetry').mockImplementation(
      () => undefined as any
    );
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'getUser').mockReturnValue({
      likes: [{ mediaId: 'anilist:media_id' }],
    } as any);
    vi.spyOn(db, 'getActiveUsersIfLiked').mockReturnValue([] as any);
    vi.spyOn(db, 'findCharacters').mockReturnValue([undefined] as any);
    vi.spyOn(db, 'addCharacter').mockReturnValue({ ok: true } as any);
    vi.spyOn(db, 'findGuildCharacters').mockResolvedValue([]);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'aggregate').mockResolvedValue({
      id: '1',
      packId: 'anilist',
      rating: 5,
      name: {
        english: 'name',
      },
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: 'anime',
              packId: 'anilist',
              popularity: 100000,
              type: MediaType.Anime,
              format: MediaFormat.TV,
              title: {
                english: 'title',
              },
            },
          },
        ],
      },
    });

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    const result = await gacha.rngPull({
      userId: 'user_id',
      guildId: 'guild_id',
    });

    expect(result).toMatchObject({
      character: {
        id: '1',
        packId: 'anilist',
        media: {
          edges: [
            {
              node: {
                format: MediaFormat.TV,
                id: 'anime',
                packId: 'anilist',
                title: {
                  english: 'title',
                },
                type: MediaType.Anime,
              },
              role: CharacterRole.Main,
            },
          ],
        },
        name: {
          english: 'name',
        },
      },
    });

    expect(mediaPoolStub).toHaveBeenCalledTimes(1);
  });

  test('character exists', async () => {
    const variables = {
      rating: 1,
    };

    const poolStub = vi.spyOn(db, 'ratingPool').mockResolvedValue([
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'name',
        },
        rating: 1,
        media: [
          {
            role: CharacterRole.Main,
            mediaId: 'anilist:anime',
          },
        ],
      },
    ]);

    vi.spyOn(utils, 'rng')
      .mockReturnValueOnce({ value: false, chance: NaN })
      .mockReturnValueOnce({ value: variables.rating, chance: NaN });

    vi.spyOn(utils, 'fetchWithRetry').mockImplementation(
      () => undefined as any
    );
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'getActiveUsersIfLiked').mockReturnValue([] as any);
    vi.spyOn(db, 'addCharacter').mockImplementation(() => {
      throw new Error('');
    });
    vi.spyOn(db, 'findGuildCharacters').mockResolvedValue([]);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    await expect(
      gacha.rngPull({
        userId: 'user_id',
        guildId: 'guild_id',
      })
    ).rejects.toThrow();

    expect(poolStub).toHaveBeenCalledTimes(1);
  });

  test('no pulls available', async () => {
    const variables = {
      rating: 1,
    };

    const poolStub = vi.spyOn(db, 'ratingPool').mockResolvedValue([
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'name',
        },
        rating: 1,
        media: [
          {
            role: CharacterRole.Main,
            mediaId: 'anilist:anime',
          },
        ],
      },
    ]);

    vi.spyOn(utils, 'rng')
      .mockReturnValueOnce({ value: false, chance: NaN })
      .mockReturnValueOnce({ value: variables.rating, chance: NaN });

    vi.spyOn(utils, 'fetchWithRetry').mockImplementation(
      () => undefined as any
    );
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'getActiveUsersIfLiked').mockReturnValue([] as any);
    vi.spyOn(db, 'addCharacter').mockImplementation(() => {
      throw new NoPullsError(new Date('2023-02-07T01:00:55.222Z'));
    });
    vi.spyOn(packs, 'aggregate').mockResolvedValue({
      id: '1',
      packId: 'anilist',
      rating: 5,
      name: {
        english: 'name',
      },
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: 'anime',
              packId: 'anilist',
              popularity: 100000,
              type: MediaType.Anime,
              format: MediaFormat.TV,
              title: {
                english: 'title',
              },
            },
          },
        ],
      },
    });
    vi.spyOn(db, 'findGuildCharacters').mockResolvedValue([]);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    await expect(
      gacha.rngPull({
        userId: 'user_id',
        guildId: 'guild_id',
      })
    ).rejects.toThrow(NoPullsError);

    expect(poolStub).toHaveBeenCalledTimes(1);
  });

  test('no guarantees', async () => {
    const variables = {
      rating: 1,
    };

    const poolStub = vi.spyOn(db, 'ratingPool').mockResolvedValue([
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'name',
        },
        rating: 1,
        media: [
          {
            role: CharacterRole.Main,
            mediaId: 'anilist:anime',
          },
        ],
      },
    ]);

    vi.spyOn(utils, 'rng')
      .mockReturnValueOnce({ value: false, chance: NaN })
      .mockReturnValueOnce({ value: variables.rating, chance: NaN });

    vi.spyOn(utils, 'fetchWithRetry').mockImplementation(
      () => undefined as any
    );
    vi.spyOn(packs, 'characters').mockResolvedValue([
      {
        id: '1',
        packId: 'anilist',
        rating: 1,
        name: {
          english: 'name',
        },
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: {
                id: 'anime',
                packId: 'anilist',
                popularity: 2500,
                type: MediaType.Anime,
                format: MediaFormat.TV,
                title: {
                  english: 'title',
                },
              },
            },
          ],
        },
      },
    ]);

    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'getActiveUsersIfLiked').mockReturnValue([] as any);
    vi.spyOn(db, 'addCharacter').mockImplementation(() => {
      throw new Error('403');
    });
    vi.spyOn(db, 'findGuildCharacters').mockResolvedValue([]);
    vi.spyOn(packs, 'aggregate').mockResolvedValue({
      id: '1',
      packId: 'anilist',
      rating: 5,
      name: {
        english: 'name',
      },
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: 'anime',
              packId: 'anilist',
              popularity: 100000,
              type: MediaType.Anime,
              format: MediaFormat.TV,
              title: {
                english: 'title',
              },
            },
          },
        ],
      },
    });
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    await expect(
      gacha.rngPull({
        userId: 'user_id',
        guildId: 'guild_id',
        guarantee: 1,
      })
    ).rejects.toThrow('403');

    expect(poolStub).toHaveBeenCalledTimes(1);
  });
});

describe('variables', () => {
  test('constants check', () => {
    expect(gacha.lowest).toBe(1000);

    expect(gacha.variables.liked).toEqual({
      5: true,
      95: false,
    });

    expect(gacha.variables.rating).toEqual({
      50: 1,
      30: 2,
      15: 3,
      4: 4,
      1: 5,
    });
  });
});

describe('/gacha', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  test('normal', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      popularity: 1,
      title: {
        english: 'title',
      },
      images: [
        {
          url: 'media_image_url',
        },
      ],
    };

    const character: Character = {
      id: '2',
      packId: 'pack-id-2',
      rating: 1,
      name: {
        english: 'name',
      },
      images: [
        {
          url: 'character_image_url',
        },
      ],
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: media,
          },
        ],
      },
    };

    const pull: Pull = {
      media,
      character,
      rating: new Rating({ stars: 1 }),
    };

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'findGuildCharacters').mockResolvedValue([]);
    vi.spyOn(db, 'findCharacter').mockResolvedValue([]);
    vi.spyOn(db, 'getActiveUsersIfLiked').mockReturnValue([] as any);
    vi.spyOn(gacha, 'rngPull').mockResolvedValue(pull);
    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );
    vi.spyOn(utils, 'sleep').mockImplementation(() => Promise.resolve());

    config.gacha = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      await gacha.start({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      await vi.runAllTimersAsync();

      expect(fetchStub).toHaveBeenCalledTimes(3);

      expect(fetchStub).toHaveBeenNthCalledWith(
        1,
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.any(FormData),
        })
      );

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
            title: 'title',
            image: {
              url: 'attachment://media-image-url.webp',
            },
          },
        ],
        components: [],
        attachments: [{ filename: 'media-image-url.webp', id: '0' }],
      });

      expect(fetchStub).toHaveBeenNthCalledWith(
        2,
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.any(FormData),
        })
      );

      expect(
        JSON.parse(
          (fetchStub.mock.calls[1][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        embeds: [
          {
            type: 'rich',
            image: {
              url: 'http://localhost:8000/stars/1.gif',
            },
          },
        ],
        components: [],
        attachments: [],
      });

      expect(fetchStub).toHaveBeenNthCalledWith(
        3,
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.any(FormData),
        })
      );

      expect(
        JSON.parse(
          (fetchStub.mock.calls[2][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [{ filename: 'character-image-url.webp', id: '0' }],
        embeds: [
          {
            type: 'rich',
            description: new Rating({ stars: 1 }).emotes,
            fields: [
              {
                name: 'title',
                value: '**name**',
              },
            ],
            image: {
              url: 'attachment://character-image-url.webp',
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
                custom_id: 'character=pack-id-2:2=1',
                label: '/character',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'like=pack-id-2:2',
                label: '/like',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.gacha;
    }
  });

  test('mention', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'title',
      },
      images: [
        {
          url: 'media_image_url',
        },
      ],
    };

    const character: Character = {
      id: '2',
      packId: 'pack-id-2',
      rating: 1,
      name: {
        english: 'name',
      },
      images: [
        {
          url: 'character_image_url',
        },
      ],
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: media,
          },
        ],
      },
    };

    const pull: Pull = {
      media,
      character,
      rating: new Rating({ stars: 1 }),
    };

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'findGuildCharacters').mockResolvedValue([]);
    vi.spyOn(db, 'findCharacter').mockResolvedValue([]);
    vi.spyOn(db, 'getActiveUsersIfLiked').mockReturnValue([] as any);
    vi.spyOn(gacha, 'rngPull').mockResolvedValue(pull);
    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );
    vi.spyOn(utils, 'sleep').mockImplementation(() => Promise.resolve());

    config.gacha = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      await gacha.start({
        mention: true,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      await vi.runAllTimersAsync();

      expect(fetchStub).toHaveBeenCalledTimes(3);

      expect(fetchStub).toHaveBeenNthCalledWith(
        1,
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.any(FormData),
        })
      );

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        content: '<@user_id>',
        allowed_mentions: { parse: [] },
        components: [],
        attachments: [{ filename: 'media-image-url.webp', id: '0' }],
        embeds: [
          {
            type: 'rich',
            title: 'title',
            image: {
              url: 'attachment://media-image-url.webp',
            },
          },
        ],
      });

      expect(fetchStub).toHaveBeenNthCalledWith(
        2,
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.any(FormData),
        })
      );

      expect(
        JSON.parse(
          (fetchStub.mock.calls[1][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        content: '<@user_id>',
        allowed_mentions: { parse: [] },
        components: [],
        attachments: [],
        embeds: [
          {
            type: 'rich',
            image: {
              url: 'http://localhost:8000/stars/1.gif',
            },
          },
        ],
      });

      expect(fetchStub).toHaveBeenNthCalledWith(
        3,
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.any(FormData),
        })
      );

      expect(
        JSON.parse(
          (fetchStub.mock.calls[2][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        content: '<@user_id>',
        allowed_mentions: { parse: [] },
        attachments: [{ filename: 'character-image-url.webp', id: '0' }],
        embeds: [
          {
            type: 'rich',
            description: new Rating({ stars: 1 }).emotes,
            fields: [
              {
                name: 'title',
                value: '**name**',
              },
            ],
            image: {
              url: 'attachment://character-image-url.webp',
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
                custom_id: 'character=pack-id-2:2=1',
                label: '/character',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'like=pack-id-2:2',
                label: '/like',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.gacha;
    }
  });

  test('quiet', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'title',
      },
      images: [
        {
          url: 'media_image_url',
        },
      ],
    };

    const character: Character = {
      id: '2',
      packId: 'pack-id-2',
      rating: 1,
      name: {
        english: 'name',
      },
      images: [
        {
          url: 'character_image_url',
        },
      ],
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: media,
          },
        ],
      },
    };

    const pull: Pull = {
      media,
      character,
      rating: new Rating({ stars: 1 }),
    };

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'findGuildCharacters').mockResolvedValue([]);
    vi.spyOn(db, 'findCharacter').mockResolvedValue([]);
    vi.spyOn(db, 'getActiveUsersIfLiked').mockReturnValue([] as any);
    vi.spyOn(gacha, 'rngPull').mockResolvedValue(pull);
    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );
    vi.spyOn(utils, 'sleep').mockImplementation(() => Promise.resolve());

    config.gacha = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      await gacha.start({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        quiet: true,
      });

      await vi.runAllTimersAsync();

      expect(fetchStub).toHaveBeenCalledTimes(1);

      expect(fetchStub).toHaveBeenNthCalledWith(
        1,
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.any(FormData),
        })
      );

      expect(
        JSON.parse(
          (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [{ filename: 'character-image-url.webp', id: '0' }],
        embeds: [
          {
            type: 'rich',
            description: new Rating({ stars: 1 }).emotes,
            fields: [
              {
                name: 'title',
                value: '**name**',
              },
            ],
            image: {
              url: 'attachment://character-image-url.webp',
            },
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'q=user_id',
                label: '/q',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'character=pack-id-2:2=1',
                label: '/character',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'like=pack-id-2:2',
                label: '/like',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.gacha;
    }
  });

  test('likes (character)', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'title',
      },
      images: [
        {
          url: 'media_image_url',
        },
      ],
    };

    const character: Character = {
      id: '2',
      packId: 'pack-id-2',
      rating: 1,
      name: {
        english: 'name',
      },
      images: [
        {
          url: 'character_image_url',
        },
      ],
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: media,
          },
        ],
      },
    };

    const pull: Pull = {
      media,
      character,
      rating: new Rating({ stars: 1 }),
    };

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'findGuildCharacters').mockResolvedValue([]);
    vi.spyOn(db, 'findCharacter').mockResolvedValue([]);
    vi.spyOn(db, 'getActiveUsersIfLiked').mockResolvedValue([
      'another_user_id',
    ]);
    vi.spyOn(gacha, 'rngPull').mockResolvedValue(pull);
    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );
    vi.spyOn(utils, 'sleep').mockImplementation(() => Promise.resolve());

    config.gacha = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      await gacha.start({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      await vi.runAllTimersAsync();

      expect(fetchStub).toHaveBeenCalledTimes(4);

      expect(fetchStub).toHaveBeenNthCalledWith(
        1,
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.any(FormData),
        })
      );

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
            title: 'title',
            image: {
              url: 'attachment://media-image-url.webp',
            },
          },
        ],
        components: [],
        attachments: [{ filename: 'media-image-url.webp', id: '0' }],
      });

      expect(fetchStub).toHaveBeenNthCalledWith(
        2,
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.any(FormData),
        })
      );

      expect(
        JSON.parse(
          (fetchStub.mock.calls[1][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        embeds: [
          {
            type: 'rich',
            image: {
              url: 'http://localhost:8000/stars/1.gif',
            },
          },
        ],
        components: [],
        attachments: [],
      });

      expect(fetchStub).toHaveBeenNthCalledWith(
        3,
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.any(FormData),
        })
      );

      expect(
        JSON.parse(
          (fetchStub.mock.calls[2][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [{ filename: 'character-image-url.webp', id: '0' }],
        embeds: [
          {
            type: 'rich',
            description: new Rating({ stars: 1 }).emotes,
            fields: [
              {
                name: 'title',
                value: '**name**',
              },
            ],
            image: {
              url: 'attachment://character-image-url.webp',
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
                custom_id: 'character=pack-id-2:2=1',
                label: '/character',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'like=pack-id-2:2',
                label: '/like',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
      });

      expect(fetchStub).toHaveBeenNthCalledWith(
        4,
        'https://discord.com/api/v10/webhooks/app_id/test_token',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );

      expect(
        JSON.parse(
          (fetchStub.mock.calls[3][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        components: [],
        attachments: [{ filename: 'character-image-url.webp', id: '0' }],
        content: '<@another_user_id>',
        embeds: [
          {
            type: 'rich',
            description:
              '<@user_id>\n\n<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            fields: [
              {
                name: 'title',
                value: '**name**',
              },
            ],
            thumbnail: {
              url: 'attachment://character-image-url.webp',
            },
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.gacha;
    }
  });

  test('likes (media)', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'title',
      },
      images: [
        {
          url: 'media_image_url',
        },
      ],
    };

    const character: Character = {
      id: '2',
      packId: 'pack-id-2',
      rating: 1,
      name: {
        english: 'name',
      },
      images: [
        {
          url: 'character_image_url',
        },
      ],
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: media,
          },
        ],
      },
    };

    const pull: Pull = {
      media,
      character,
      rating: new Rating({ stars: 1 }),
    };

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'findGuildCharacters').mockResolvedValue([]);
    vi.spyOn(db, 'findCharacter').mockResolvedValue([]);
    vi.spyOn(db, 'getActiveUsersIfLiked').mockResolvedValue([
      'another_user_id',
    ]);
    vi.spyOn(gacha, 'rngPull').mockResolvedValue(pull);
    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );
    vi.spyOn(utils, 'sleep').mockImplementation(() => Promise.resolve());

    config.gacha = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      await gacha.start({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      await vi.runAllTimersAsync();

      expect(fetchStub).toHaveBeenCalledTimes(4);

      expect(fetchStub).toHaveBeenNthCalledWith(
        1,
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.any(FormData),
        })
      );

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
            title: 'title',
            image: {
              url: 'attachment://media-image-url.webp',
            },
          },
        ],
        components: [],
        attachments: [{ filename: 'media-image-url.webp', id: '0' }],
      });

      expect(fetchStub).toHaveBeenNthCalledWith(
        2,
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.any(FormData),
        })
      );

      expect(
        JSON.parse(
          (fetchStub.mock.calls[1][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        embeds: [
          {
            type: 'rich',
            image: {
              url: 'http://localhost:8000/stars/1.gif',
            },
          },
        ],
        components: [],
        attachments: [],
      });

      expect(fetchStub).toHaveBeenNthCalledWith(
        3,
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.any(FormData),
        })
      );

      expect(
        JSON.parse(
          (fetchStub.mock.calls[2][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [{ filename: 'character-image-url.webp', id: '0' }],
        embeds: [
          {
            type: 'rich',
            description: new Rating({ stars: 1 }).emotes,
            fields: [
              {
                name: 'title',
                value: '**name**',
              },
            ],
            image: {
              url: 'attachment://character-image-url.webp',
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
                custom_id: 'character=pack-id-2:2=1',
                label: '/character',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'like=pack-id-2:2',
                label: '/like',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
      });

      expect(fetchStub).toHaveBeenNthCalledWith(
        4,
        'https://discord.com/api/v10/webhooks/app_id/test_token',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );

      expect(
        JSON.parse(
          (fetchStub.mock.calls[3][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        components: [],
        attachments: [{ filename: 'character-image-url.webp', id: '0' }],
        content: '<@another_user_id>',
        embeds: [
          {
            type: 'rich',
            description:
              '<@user_id>\n\n<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            fields: [
              {
                name: 'title',
                value: '**name**',
              },
            ],
            thumbnail: {
              url: 'attachment://character-image-url.webp',
            },
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.gacha;
    }
  });

  test('likes (relation)', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'title',
      },
      images: [
        {
          url: 'media_image_url',
        },
      ],
      relations: {
        edges: [
          {
            relation: MediaRelation.Parent,
            node: {
              id: '5',
              packId: 'pack-id',
              type: MediaType.Anime,
              title: {
                english: 'title',
              },
            },
          },
        ],
      },
    };

    const character: Character = {
      id: '2',
      packId: 'pack-id-2',
      rating: 1,
      name: {
        english: 'name',
      },
      images: [
        {
          url: 'character_image_url',
        },
      ],
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: media,
          },
        ],
      },
    };

    const pull: Pull = {
      media,
      character,
      rating: new Rating({ stars: 1 }),
    };

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'getActiveUsersIfLiked').mockResolvedValue([
      'another_user_id',
    ]);
    vi.spyOn(gacha, 'rngPull').mockResolvedValue(pull);
    vi.spyOn(db, 'findGuildCharacters').mockResolvedValue([]);
    vi.spyOn(db, 'findCharacter').mockResolvedValue([]);
    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );
    vi.spyOn(utils, 'sleep').mockImplementation(() => Promise.resolve());

    config.gacha = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      await gacha.start({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      await vi.runAllTimersAsync();

      expect(fetchStub).toHaveBeenCalledTimes(4);

      expect(fetchStub).toHaveBeenNthCalledWith(
        1,
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.any(FormData),
        })
      );

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
            title: 'title',
            image: {
              url: 'attachment://media-image-url.webp',
            },
          },
        ],
        components: [],
        attachments: [{ filename: 'media-image-url.webp', id: '0' }],
      });

      expect(fetchStub).toHaveBeenNthCalledWith(
        2,
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.any(FormData),
        })
      );

      expect(
        JSON.parse(
          (fetchStub.mock.calls[1][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        embeds: [
          {
            type: 'rich',
            image: {
              url: 'http://localhost:8000/stars/1.gif',
            },
          },
        ],
        components: [],
        attachments: [],
      });

      expect(fetchStub).toHaveBeenNthCalledWith(
        3,
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.any(FormData),
        })
      );

      expect(
        JSON.parse(
          (fetchStub.mock.calls[2][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        attachments: [{ filename: 'character-image-url.webp', id: '0' }],
        embeds: [
          {
            type: 'rich',
            description: new Rating({ stars: 1 }).emotes,
            fields: [
              {
                name: 'title',
                value: '**name**',
              },
            ],
            image: {
              url: 'attachment://character-image-url.webp',
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
                custom_id: 'character=pack-id-2:2=1',
                label: '/character',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'like=pack-id-2:2',
                label: '/like',
                style: 2,
                type: 2,
              },
            ],
          },
        ],
      });

      expect(fetchStub).toHaveBeenNthCalledWith(
        4,
        'https://discord.com/api/v10/webhooks/app_id/test_token',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );

      expect(
        JSON.parse(
          (fetchStub.mock.calls[3][1]?.body as FormData)?.get(
            'payload_json'
          ) as any
        )
      ).toEqual({
        components: [],
        attachments: [{ filename: 'character-image-url.webp', id: '0' }],
        content: '<@another_user_id>',
        embeds: [
          {
            type: 'rich',
            description:
              '<@user_id>\n\n<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            fields: [
              {
                name: 'title',
                value: '**name**',
              },
            ],
            thumbnail: {
              url: 'attachment://character-image-url.webp',
            },
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.gacha;
    }
  });

  test('no pulls available', async () => {
    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);
    vi.spyOn(gacha, 'rngPull').mockImplementation(async () => {
      throw new NoPullsError(new Date('2023-02-07T00:53:09.199Z'));
    });
    vi.spyOn(db, 'findGuildCharacters').mockResolvedValue([]);
    vi.spyOn(db, 'findCharacter').mockResolvedValue([]);
    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    config.gacha = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      await gacha.start({
        token: 'test_token',
        guildId: 'guild_id',
      });

      await vi.runAllTimersAsync();

      expect(fetchStub).toHaveBeenCalledTimes(1);

      expect(fetchStub).toHaveBeenNthCalledWith(
        1,
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.any(FormData),
        })
      );

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
            description: "You don't have any more pulls!",
          },
          { type: 'rich', description: '_+1 pull <t:1675732989:R>_' },
        ],
        components: [],
        attachments: [],
      });
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.gacha;
    }
  });

  test('no guaranteed', async () => {
    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);
    vi.spyOn(gacha, 'rngPull').mockImplementation(async () => {
      throw new Error('403');
    });
    vi.spyOn(db, 'findGuildCharacters').mockResolvedValue([]);
    vi.spyOn(db, 'findCharacter').mockResolvedValue([]);
    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    config.gacha = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      await gacha.start({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        guarantee: 5,
      });

      await vi.runAllTimersAsync();

      expect(fetchStub).toHaveBeenCalledTimes(1);

      expect(fetchStub).toHaveBeenNthCalledWith(
        1,
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.any(FormData),
        })
      );

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
                custom_id: 'buy=bguaranteed=user_id=5',
                label: '/buy guaranteed 5',
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
              'You don`t have any 5<:smolstar:1107503653956374638>pulls',
          },
        ],
      });
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.gacha;
    }
  });

  test('no more characters', async () => {
    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);
    vi.spyOn(gacha, 'rngPool').mockResolvedValue([]);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'findGuildCharacters').mockResolvedValue([]);
    vi.spyOn(db, 'findCharacter').mockResolvedValue([]);
    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    config.gacha = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      await gacha.start({
        token: 'test_token',
        guildId: 'guild_id',
      });

      await vi.runAllTimersAsync();

      expect(fetchStub).toHaveBeenCalledTimes(1);

      expect(fetchStub).toHaveBeenNthCalledWith(
        1,
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.any(FormData),
        })
      );

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
            description: 'There are no more characters left in this range',
          },
        ],
        components: [],
        attachments: [],
      });
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.gacha;
    }
  });

  test('no more guaranteed characters', async () => {
    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);
    vi.spyOn(gacha, 'guaranteedPool').mockResolvedValue([]);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'findGuildCharacters').mockResolvedValue([]);
    vi.spyOn(db, 'findCharacter').mockResolvedValue([]);
    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);

    config.gacha = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      await gacha.start({
        token: 'test_token',
        guildId: 'guild_id',
        guarantee: 5,
      });

      await vi.runAllTimersAsync();

      expect(fetchStub).toHaveBeenCalledTimes(1);

      expect(fetchStub).toHaveBeenNthCalledWith(
        1,
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.any(FormData),
        })
      );

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
            description:
              'There are no more 5<:smolstar:1107503653956374638>characters left',
          },
        ],
        components: [],
        attachments: [],
      });
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.gacha;
    }
  });
});
