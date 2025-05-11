/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import utils from '~/src/utils.ts';
import packs from '~/src/packs.ts';
import config from '~/src/config.ts';
import search from '~/src/search.ts';
import db from '~/db/index.ts';

import * as discord from '~/src/discord.ts';
import * as discordV2 from '~/src/discordV2.ts';

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

describe('/media', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
    delete config.appId;
    delete config.origin;
  });

  it('normal', async () => {
    const media: DisaggregatedMedia = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
    };

    vi.spyOn(db, 'getGuild').mockReturnValue('' as any);
    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(packs, 'searchOneMedia').mockResolvedValue(media);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
      flags: 32768,
      attachments: [{ id: '0', filename: 'image-url.webp' }],
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content: '-# Anime',
            },
            {
              type: 10,
              content: '**english title**\nlong description',
            },
            {
              type: 12,
              items: [
                {
                  media: {
                    url: 'attachment://image-url.webp',
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('native title', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'native title',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
    };

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('' as any);
    vi.spyOn(packs, 'searchOneMedia').mockResolvedValue(media);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'native title',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
      flags: 32768,
      attachments: [{ id: '0', filename: 'image-url.webp' }],
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content: '-# Anime',
            },
            {
              type: 10,
              content: '**native title**\nlong description',
            },
            {
              type: 12,
              items: [
                {
                  media: {
                    url: 'attachment://image-url.webp',
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('format header', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.Novel,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
    };

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('' as any);
    vi.spyOn(packs, 'searchOneMedia').mockResolvedValue(media);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
      flags: 32768,
      attachments: [{ id: '0', filename: 'image-url.webp' }],
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content: '-# Novel',
            },
            {
              type: 10,
              content: '**english title**\nlong description',
            },
            {
              type: 12,
              items: [
                {
                  media: {
                    url: 'attachment://image-url.webp',
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('external links', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
      externalLinks: [
        { site: 'Crunchyroll', url: 'https://crunchyroll.com/title' },
        { site: 'Crunchyroll 2', url: 'crunchyroll.com/title' },
        { site: 'YouTube', url: 'https://www.youtube.com/video' },
        { site: 'FakeTube', url: 'https://faketube.net/video' },
      ],
    };

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('' as any);
    vi.spyOn(packs, 'searchOneMedia').mockResolvedValue(media);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
      flags: 32768,
      attachments: [{ id: '0', filename: 'image-url.webp' }],
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content: '-# Anime',
            },
            {
              type: 10,
              content: '**english title**\nlong description',
            },
            {
              type: 12,
              items: [
                {
                  media: {
                    url: 'attachment://image-url.webp',
                  },
                },
              ],
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              url: 'https://crunchyroll.com/title',
              label: 'Crunchyroll',
              style: 5,
              type: 2,
            },
            {
              url: 'crunchyroll.com/title',
              label: 'Crunchyroll 2',
              style: 5,
              type: 2,
            },
            {
              url: 'https://www.youtube.com/video',
              label: 'YouTube',
              style: 5,
              type: 2,
            },
          ],
        },
      ],
    });
  });

  it('default image', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {
        english: 'english title',
      },
    };

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('' as any);
    vi.spyOn(packs, 'searchOneMedia').mockResolvedValue(media);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
      flags: 32768,
      attachments: [{ id: '0', filename: 'default.webp' }],
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content: '-# Anime',
            },
            {
              type: 10,
              content: '**english title**',
            },
            {
              type: 12,
              items: [
                {
                  media: {
                    url: 'attachment://default.webp',
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('youtube trailer', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
      trailer: {
        site: 'youtube',
        id: 'video_id',
      },
    };

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('' as any);
    vi.spyOn(packs, 'searchOneMedia').mockResolvedValue(media);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
      flags: 32768,
      attachments: [{ id: '0', filename: 'image-url.webp' }],
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content: '-# Anime',
            },
            {
              type: 10,
              content: '**english title**\nlong description',
            },
            {
              type: 12,
              items: [
                {
                  media: {
                    url: 'attachment://image-url.webp',
                  },
                },
              ],
            },
          ],
        },
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
    });
  });

  it('characters embeds', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
      characters: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: '5',
              packId: 'pack-id',
              rating: 1,
              name: {
                english: 'main character name',
              },
              description: 'main character description',
              images: [
                {
                  url: 'main character url',
                },
              ],
              gender: 'Male',
              age: '69',
            },
          },
          {
            role: CharacterRole.Supporting,
            node: {
              id: '5',
              packId: 'pack-id',
              rating: 1,
              name: {
                english: 'supporting character name',
              },
              description: 'supporting character description',
              images: [
                {
                  url: 'supporting character url',
                },
              ],
            },
          },
          {
            role: CharacterRole.Background,
            node: {
              id: '5',
              packId: 'pack-id',
              rating: 1,
              name: {
                english: 'background character name',
              },
              description: 'background character description',
              images: [
                {
                  url: 'background character url',
                },
              ],
            },
          },
        ],
      },
    };

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('' as any);
    vi.spyOn(packs, 'searchOneMedia').mockResolvedValue(media);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
      flags: 32768,
      attachments: [
        { id: '0', filename: 'image-url.webp' },
        {
          id: '1',
          filename: 'main character url.webp',
        },
        {
          id: '2',
          filename: 'supporting character url.webp',
        },
      ],
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content: '-# Anime',
            },
            {
              type: 10,
              content: '**english title**\nlong description',
            },
            {
              type: 12,
              items: [
                {
                  media: {
                    url: 'attachment://image-url.webp',
                  },
                },
              ],
            },
          ],
        },
        {
          type: 17,
          components: [
            {
              type: 9,
              accessory: {
                type: 11,
                media: {
                  url: 'attachment://main character url.webp',
                },
              },
              components: [
                {
                  type: 10,
                  content:
                    '**main character name**\nmain character description',
                },
              ],
            },
            {
              type: 10,
              content: '-# Male, 69',
            },
          ],
        },
        {
          type: 17,
          components: [
            {
              type: 9,
              accessory: {
                type: 11,
                media: {
                  url: 'attachment://supporting character url.webp',
                },
              },
              components: [
                {
                  type: 10,
                  content:
                    '**supporting character name**\nsupporting character description',
                },
              ],
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              custom_id: 'mcharacters=pack-id:1=0',
              label: 'View Characters',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
    });
  });

  it('media relations', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
      relations: {
        edges: [
          {
            relation: MediaRelation.Sequel,
            node: {
              id: '5',
              packId: 'pack-id',
              type: MediaType.Anime,
              format: MediaFormat.TV,
              popularity: 0,
              title: {
                english: 'english title 2',
              },
            },
          },
          {
            relation: MediaRelation.Prequel,
            node: {
              id: '10',
              packId: 'pack-id',
              type: MediaType.Anime,
              format: MediaFormat.TV,
              popularity: 0,
              title: {
                english: 'english title',
              },
            },
          },
          {
            relation: MediaRelation.SideStory,
            node: {
              id: '15',
              packId: 'pack-id',
              type: MediaType.Anime,
              format: MediaFormat.TV,
              popularity: 0,
              title: {
                english: 'side story',
              },
            },
          },
          {
            relation: MediaRelation.SpinOff,
            node: {
              id: '20',
              packId: 'pack-id',
              type: MediaType.Manga,
              format: MediaFormat.Manga,
              popularity: 0,
              title: {
                english: 'spin off',
              },
            },
          },
          {
            relation: MediaRelation.Adaptation,
            node: {
              id: '25',
              packId: 'pack-id',
              type: MediaType.Anime,
              format: MediaFormat.TV,
              popularity: 0,
              title: {
                english: 'adaptation',
              },
            },
          },
          {
            relation: MediaRelation.Adaptation,
            node: {
              id: '30',
              packId: 'pack-id',
              type: MediaType.Manga,
              format: MediaFormat.Manga,
              popularity: 0,
              title: {
                english: 'second adaptation',
              },
            },
          },
        ],
      },
    };

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(packs, 'searchOneMedia').mockResolvedValue(media);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
      flags: 32768,
      attachments: [{ id: '0', filename: 'image-url.webp' }],
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content: '-# Anime',
            },
            {
              type: 10,
              content: '**english title**\nlong description',
            },
            {
              type: 12,
              items: [
                {
                  media: {
                    url: 'attachment://image-url.webp',
                  },
                },
              ],
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              custom_id: 'media=pack-id:5',
              label: 'english title 2 (Sequel)',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'media=pack-id:10',
              label: 'english title (Prequel)',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'media=pack-id:15',
              label: 'side story (Side Story)',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'media=pack-id:20',
              label: 'spin off (Spin Off)',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
    });
  });

  it('media relations 2', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
      relations: {
        edges: [
          {
            relation: MediaRelation.Contains,
            node: {
              id: '5',
              packId: 'pack-id',
              type: MediaType.Anime,
              format: MediaFormat.TV,
              popularity: 0,
              title: {
                english: 'child',
              },
            },
          },
          {
            relation: MediaRelation.Parent,
            node: {
              id: '10',
              packId: 'pack-id',
              type: MediaType.Anime,
              format: MediaFormat.TV,
              popularity: 0,
              title: {
                english: 'parent',
              },
            },
          },
          {
            relation: MediaRelation.Adaptation,
            node: {
              id: '15',
              packId: 'pack-id',
              type: MediaType.Anime,
              format: MediaFormat.TV,
              popularity: 0,
              title: {
                english: 'adaptation',
              },
            },
          },
          {
            relation: MediaRelation.Other,
            node: {
              id: '20',
              packId: 'pack-id',
              type: MediaType.Manga,
              format: MediaFormat.Manga,
              popularity: 0,
              title: {
                english: 'other',
              },
            },
          },
        ],
      },
    };

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(packs, 'searchOneMedia').mockResolvedValue(media);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
      flags: 32768,
      attachments: [{ id: '0', filename: 'image-url.webp' }],
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content: '-# Anime',
            },
            {
              type: 10,
              content: '**english title**\nlong description',
            },
            {
              type: 12,
              items: [
                {
                  media: {
                    url: 'attachment://image-url.webp',
                  },
                },
              ],
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              custom_id: 'media=pack-id:5',
              label: 'child (Anime)',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'media=pack-id:10',
              label: 'parent (Anime)',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'media=pack-id:15',
              label: 'adaptation (Anime)',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'media=pack-id:20',
              label: 'other (Manga)',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
    });
  });

  it('media relations 3', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
      relations: {
        edges: [
          {
            relation: MediaRelation.Other,
            node: {
              id: '5',
              packId: 'pack-id',
              type: MediaType.Anime,
              popularity: 0,
              title: {
                english: 'branch',
              },
            },
          },
        ],
      },
    };

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(packs, 'searchOneMedia').mockResolvedValue(media);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
      flags: 32768,
      attachments: [{ id: '0', filename: 'image-url.webp' }],
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content: '-# Anime',
            },
            {
              type: 10,
              content: '**english title**\nlong description',
            },
            {
              type: 12,
              items: [
                {
                  media: {
                    url: 'attachment://image-url.webp',
                  },
                },
              ],
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              custom_id: 'media=pack-id:5',
              label: 'branch',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
    });
  });

  it('music relations', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
      relations: {
        edges: [
          {
            relation: MediaRelation.Other,
            node: {
              id: '5',
              packId: 'pack-id',
              type: MediaType.Anime,
              format: MediaFormat.Music,
              popularity: 0,
              title: {
                english: 'op',
              },
              externalLinks: [{ site: 'Youtube', url: 'youtube_url' }],
            },
          },
          {
            relation: MediaRelation.Other,
            node: {
              id: '10',
              packId: 'pack-id',
              type: MediaType.Anime,
              format: MediaFormat.Music,
              popularity: 0,
              title: {
                english: 'fk',
              },
              externalLinks: [{ site: 'Spotify', url: 'spotify_url' }],
            },
          },
          {
            relation: MediaRelation.Other,
            node: {
              id: '15',
              packId: 'pack-id',
              type: MediaType.Anime,
              format: MediaFormat.Music,
              popularity: 0,
              title: {
                english: 'ed',
              },
              externalLinks: [{ site: 'FakeTube', url: 'faketube_url' }],
            },
          },
        ],
      },
    };

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(packs, 'searchOneMedia').mockResolvedValue(media);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
      flags: 32768,
      attachments: [{ id: '0', filename: 'image-url.webp' }],
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content: '-# Anime',
            },
            {
              type: 10,
              content: '**english title**\nlong description',
            },
            {
              type: 12,
              items: [
                {
                  media: {
                    url: 'attachment://image-url.webp',
                  },
                },
              ],
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              label: 'op',
              url: 'youtube_url',
              style: 5,
              type: 2,
            },
            {
              label: 'fk',
              url: 'spotify_url',
              style: 5,
              type: 2,
            },
          ],
        },
      ],
    });
  });

  it('relations sorting', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
      relations: {
        edges: [
          {
            relation: MediaRelation.Other,
            node: {
              id: '5',
              packId: 'pack-id',
              type: MediaType.Anime,
              format: MediaFormat.TV,
              popularity: 0,
              title: {
                english: 'title',
              },
            },
          },
          {
            relation: MediaRelation.Other,
            node: {
              id: '10',
              packId: 'pack-id',
              type: MediaType.Anime,
              format: MediaFormat.TV,
              popularity: 100,
              title: {
                english: 'title',
              },
            },
          },
          {
            relation: MediaRelation.Other,
            node: {
              id: '15',
              packId: 'pack-id',
              type: MediaType.Anime,
              format: MediaFormat.TV,
              popularity: 50,
              title: {
                english: 'title',
              },
            },
          },
        ],
      },
    };

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(packs, 'searchOneMedia').mockResolvedValue(media);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
      flags: 32768,
      attachments: [{ id: '0', filename: 'image-url.webp' }],
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content: '-# Anime',
            },
            {
              type: 10,
              content: '**english title**\nlong description',
            },
            {
              type: 12,
              items: [
                {
                  media: {
                    url: 'attachment://image-url.webp',
                  },
                },
              ],
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              custom_id: 'media=pack-id:5',
              label: 'title (Anime)',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'media=pack-id:10',
              label: 'title (Anime)',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'media=pack-id:15',
              label: 'title (Anime)',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
    });
  });

  it('characters sorting', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
      characters: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: '5',
              packId: 'pack-id',
              name: {
                english: 'main character name',
              },
              rating: 1,
            },
          },
          {
            role: CharacterRole.Supporting,
            node: {
              id: '10',
              packId: 'pack-id',
              name: {
                english: 'supporting character name',
              },
              rating: 2,
            },
          },
          {
            role: CharacterRole.Background,
            node: {
              id: '15',
              packId: 'pack-id',
              name: {
                english: 'background character name',
              },
              rating: 3,
            },
          },
        ],
      },
    };

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(packs, 'searchOneMedia').mockResolvedValue(media);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
      flags: 32768,
      attachments: [
        { id: '0', filename: 'image-url.webp' },
        {
          id: '1',
          filename: 'default.webp',
        },
        {
          id: '2',
          filename: 'default.webp',
        },
      ],
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content: '-# Anime',
            },
            {
              type: 10,
              content: '**english title**\nlong description',
            },
            {
              type: 12,
              items: [
                {
                  media: {
                    url: 'attachment://image-url.webp',
                  },
                },
              ],
            },
          ],
        },
        {
          type: 17,
          components: [
            {
              type: 9,
              accessory: {
                type: 11,
                media: {
                  url: 'attachment://default.webp',
                },
              },
              components: [
                {
                  type: 10,
                  content: '**main character name**',
                },
              ],
            },
          ],
        },
        {
          type: 17,
          components: [
            {
              type: 9,
              accessory: {
                type: 11,
                media: {
                  url: 'attachment://default.webp',
                },
              },
              components: [
                {
                  type: 10,
                  content: '**supporting character name**',
                },
              ],
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              custom_id: 'mcharacters=pack-id:1=0',
              label: 'View Characters',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
    });
  });

  it('not found', async () => {
    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(packs, 'searchOneMedia').mockResolvedValue(undefined);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'x'.repeat(100),
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
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

  it('no titles', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {},
    };

    await expect(() => search.mediaMessageV2(media)).rejects.toThrowError(
      '404'
    );
  });
});

describe('/character', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
    delete config.appId;
    delete config.origin;
  });

  it('normal', async () => {
    const character: DisaggregatedCharacter = {
      id: '1',
      packId: 'pack-id',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
      rating: 5,
      age: '420',
      gender: 'male',
    };

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(packs, 'searchOneCharacter').mockResolvedValue(character);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'findCharacter').mockReturnValue(undefined as any);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.character({
      token: 'test_token',
      guildId: 'guild_id',
      userId: 'user_id',
      search: 'full name',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchStub = vi.mocked(utils.fetchWithRetry);

    expect(
      JSON.parse(
        (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      flags: 32768,
      attachments: [{ filename: 'image-url.webp', id: '0' }],
      allowed_mentions: { parse: [] },
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098>',
            },
            {
              type: 10,
              content: '**full name**\nlong description',
            },
            {
              type: 12,
              items: [
                {
                  media: {
                    url: 'attachment://image-url.webp',
                  },
                },
              ],
            },
            {
              type: 10,
              content: '-# Male, 420',
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              custom_id: 'like=pack-id:1',
              label: '/like',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
    });
  });

  it('with 1 owner', async () => {
    const character: Character = {
      id: '1',
      packId: 'pack-id',
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
    };

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'findCharacter').mockReturnValue([
      {
        characterId: 'anilist:1',
        mediaId: 'media_id',
        userId: 'user_id',
        rating: 3,
        createdAt: new Date(),
      },
    ] as any);
    vi.spyOn(packs, 'searchOneCharacter').mockResolvedValue(character);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.character({
      token: 'test_token',
      search: 'full name',
      guildId: 'guild_id',
      userId: 'user_id',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchStub = vi.mocked(utils.fetchWithRetry);

    expect(
      JSON.parse(
        (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      flags: 32768,
      attachments: [{ filename: 'image-url.webp', id: '0' }],
      allowed_mentions: { parse: [] },
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content:
                '<@user_id>\n\n<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 10,
              content: '**full name**\nlong description',
            },
            {
              type: 12,
              items: [
                {
                  media: {
                    url: 'attachment://image-url.webp',
                  },
                },
              ],
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              custom_id: 'like=pack-id:1',
              label: '/like',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
    });
  });

  it('with 2 owner - sort userId first', async () => {
    const character: Character = {
      id: '1',
      packId: 'pack-id',
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
    };

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'findCharacter').mockReturnValue([
      {
        characterId: 'anilist:1',
        mediaId: 'media_id',
        userId: 'another_user_id',
        rating: 3,
        createdAt: new Date(),
      },
      {
        characterId: 'anilist:1',
        mediaId: 'media_id',
        userId: 'user_id',
        rating: 3,
        createdAt: new Date(),
      },
    ] as any);
    vi.spyOn(packs, 'searchOneCharacter').mockResolvedValue(character);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.character({
      token: 'test_token',
      search: 'full name',
      guildId: 'guild_id',
      userId: 'user_id',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchStub = vi.mocked(utils.fetchWithRetry);

    expect(
      JSON.parse(
        (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      flags: 32768,
      attachments: [{ filename: 'image-url.webp', id: '0' }],
      allowed_mentions: { parse: [] },
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content:
                '<@user_id><@another_user_id>\n\n<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 10,
              content: '**full name**\nlong description',
            },
            {
              type: 12,
              items: [
                {
                  media: {
                    url: 'attachment://image-url.webp',
                  },
                },
              ],
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              custom_id: 'like=pack-id:1',
              label: '/like',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
    });
  });

  it('with 2 owner - sort highest rating first', async () => {
    const character: Character = {
      id: '1',
      packId: 'pack-id',
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
    };

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'findCharacter').mockReturnValue([
      {
        characterId: 'anilist:1',
        mediaId: 'media_id',
        userId: 'another_user_id_1',
        rating: 2,
        createdAt: new Date(),
      },
      {
        characterId: 'anilist:1',
        mediaId: 'media_id',
        userId: 'another_user_id_2',
        rating: 3,
        createdAt: new Date(),
      },
    ] as any);
    vi.spyOn(packs, 'searchOneCharacter').mockResolvedValue(character);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.character({
      token: 'test_token',
      search: 'full name',
      guildId: 'guild_id',
      userId: 'user_id',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchStub = vi.mocked(utils.fetchWithRetry);

    expect(
      JSON.parse(
        (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      flags: 32768,
      attachments: [{ filename: 'image-url.webp', id: '0' }],
      allowed_mentions: { parse: [] },
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content:
                '<@another_user_id_2><@another_user_id_1>\n\n<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 10,
              content: '**full name**\nlong description',
            },
            {
              type: 12,
              items: [
                {
                  media: {
                    url: 'attachment://image-url.webp',
                  },
                },
              ],
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              custom_id: 'like=pack-id:1',
              label: '/like',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
    });
  });

  it('with 2 owner - sort older created first', async () => {
    const character: Character = {
      id: '1',
      packId: 'pack-id',
      description: 'long description',
      rating: 1,
      name: {
        english: 'full name',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
    };

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'findCharacter').mockReturnValue([
      {
        characterId: 'anilist:1',
        mediaId: 'media_id',
        userId: 'another_user_id_1',
        rating: 3,
        createdAt: new Date(),
      },
      {
        characterId: 'anilist:1',
        mediaId: 'media_id',
        userId: 'another_user_id_2',
        rating: 3,
        createdAt: new Date('1999-1-1'),
      },
    ] as any);
    vi.spyOn(packs, 'searchOneCharacter').mockResolvedValue(character);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.character({
      token: 'test_token',
      search: 'full name',
      guildId: 'guild_id',
      userId: 'user_id',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchStub = vi.mocked(utils.fetchWithRetry);

    expect(
      JSON.parse(
        (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      flags: 32768,
      attachments: [{ filename: 'image-url.webp', id: '0' }],
      allowed_mentions: { parse: [] },
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content:
                '<@another_user_id_2><@another_user_id_1>\n\n<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 10,
              content: '**full name**\nlong description',
            },
            {
              type: 12,
              items: [
                {
                  media: {
                    url: 'attachment://image-url.webp',
                  },
                },
              ],
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              custom_id: 'like=pack-id:1',
              label: '/like',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
    });
  });

  it('with gender', async () => {
    const character: Character = {
      id: '1',
      packId: 'pack-id',
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
      gender: 'female',
    };

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'findCharacter').mockReturnValue(undefined as any);
    vi.spyOn(packs, 'searchOneCharacter').mockResolvedValue(character);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.character({
      token: 'test_token',
      guildId: 'guild_id',
      userId: 'user_id',
      search: 'full name',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchStub = vi.mocked(utils.fetchWithRetry);

    expect(
      JSON.parse(
        (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      flags: 32768,
      attachments: [{ filename: 'image-url.webp', id: '0' }],
      allowed_mentions: { parse: [] },
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content:
                '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 10,
              content: '**full name**\nlong description',
            },
            {
              type: 12,
              items: [
                {
                  media: {
                    url: 'attachment://image-url.webp',
                  },
                },
              ],
            },
            {
              type: 10,
              content: '-# Female',
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              custom_id: 'like=pack-id:1',
              label: '/like',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
    });
  });

  it('with age', async () => {
    const character: Character = {
      id: '1',
      packId: 'pack-id',
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
      age: '18+',
    };

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'findCharacter').mockReturnValue(undefined as any);
    vi.spyOn(packs, 'searchOneCharacter').mockResolvedValue(character);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await await search.character({
      token: 'test_token',
      guildId: 'guild_id',
      userId: 'user_id',
      search: 'full name',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchStub = vi.mocked(utils.fetchWithRetry);

    expect(
      JSON.parse(
        (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      flags: 32768,
      attachments: [{ filename: 'image-url.webp', id: '0' }],
      allowed_mentions: { parse: [] },
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content:
                '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 10,
              content: '**full name**\nlong description',
            },
            {
              type: 12,
              items: [
                {
                  media: {
                    url: 'attachment://image-url.webp',
                  },
                },
              ],
            },
            {
              type: 10,
              content: '-# 18+',
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              custom_id: 'like=pack-id:1',
              label: '/like',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
    });
  });

  it('with relations', async () => {
    const character: Character = {
      id: '1',
      packId: 'pack-id',
      description: 'long description',
      rating: 1,
      name: {
        english: 'full name',
      },
      images: [{ url: 'image_url' }],
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: '5',
              packId: 'pack-id',
              type: MediaType.Anime,
              format: MediaFormat.Movie,
              popularity: 0,
              title: {
                english: 'movie',
              },
            },
          },
        ],
      },
    };

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'findCharacter').mockReturnValue(undefined as any);
    vi.spyOn(packs, 'searchOneCharacter').mockResolvedValue(character);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.character({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'full name',
      userId: 'user_id',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchStub = vi.mocked(utils.fetchWithRetry);

    expect(
      JSON.parse(
        (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      flags: 32768,
      attachments: [{ filename: 'image-url.webp', id: '0' }],
      allowed_mentions: { parse: [] },
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content:
                '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 10,
              content: '**full name**\nlong description',
            },
            {
              type: 12,
              items: [
                {
                  media: {
                    url: 'attachment://image-url.webp',
                  },
                },
              ],
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              custom_id: 'like=pack-id:1',
              label: '/like',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'media=pack-id:5',
              label: 'movie (Movie)',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
    });
  });

  it('default image', async () => {
    const character: Character = {
      id: '1',
      packId: 'pack-id',
      rating: 1,
      name: {
        english: 'full name',
      },
    };

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'findCharacter').mockReturnValue(undefined as any);
    vi.spyOn(packs, 'searchOneCharacter').mockResolvedValue(character);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.character({
      token: 'test_token',
      guildId: 'guild_id',
      userId: 'user_id',
      search: 'full name',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchStub = vi.mocked(utils.fetchWithRetry);

    expect(
      JSON.parse(
        (fetchStub.mock.calls[0][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      flags: 32768,
      attachments: [{ filename: 'default.webp', id: '0' }],
      allowed_mentions: { parse: [] },
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content:
                '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 10,
              content: '**full name**',
            },
            {
              type: 12,
              items: [
                {
                  media: {
                    url: 'attachment://default.webp',
                  },
                },
              ],
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              custom_id: 'like=pack-id:1',
              label: '/like',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
    });
  });

  it('not found', async () => {
    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'findCharacter').mockReturnValue(undefined as any);
    vi.spyOn(packs, 'searchOneCharacter').mockResolvedValue(undefined);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.character({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'x'.repeat(100),
      userId: 'user_id',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
      flags: 32768,
      attachments: [],
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content: 'Found _nothing_ matching that query!',
            },
          ],
        },
      ],
    });
  });
});

describe('media container', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
    delete config.appId;
    delete config.origin;
  });

  it('normal', async () => {
    const media: DisaggregatedMedia = {
      id: '1',
      packId: 'pack-id',
      description: 'long description',
      title: {
        english: 'full title',
      },
      images: [{ url: 'image_url' }],
      popularity: 1_000_000,
      type: MediaType.Anime,
      format: MediaFormat.TV,
    };

    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = new discordV2.Message();

    const embed = await search.mediaContainer(message, media);

    expect(embed.json()).toEqual({
      type: 17,
      components: [
        {
          type: 10,
          content: '-# Anime',
        },
        {
          type: 10,
          content: '**full title**\nlong description',
        },
        {
          type: 12,
          items: [
            {
              media: {
                url: 'attachment://image-url.webp',
              },
            },
          ],
        },
      ],
    });
  });

  it('minimized', async () => {
    const media: DisaggregatedMedia = {
      id: '1',
      packId: 'pack-id',
      description: 'long description',
      title: {
        english: 'full title',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
      popularity: 1_000_000,
      type: MediaType.Anime,
      format: MediaFormat.TV,
    };

    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = new discordV2.Message();

    const embed = await search.mediaContainer(message, media, {
      mode: 'thumbnail',
    });

    expect(embed.json()).toEqual({
      type: 17,
      components: [
        {
          type: 10,
          content: '-# Anime',
        },
        {
          type: 9,
          accessory: {
            type: 11,
            media: {
              url: 'attachment://image-url.webp',
            },
          },
          components: [
            {
              type: 10,
              content: '**full title**\nlong description',
            },
          ],
        },
      ],
    });
  });

  it('default image', async () => {
    const media: DisaggregatedMedia = {
      id: '1',
      packId: 'pack-id',
      description: 'long description',
      title: {
        english: 'full title',
      },
      popularity: 1_000_000,
      type: MediaType.Anime,
      format: MediaFormat.TV,
    };

    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = new discordV2.Message();

    const embed = await search.mediaContainer(message, media);

    expect(embed.json()).toEqual({
      type: 17,
      components: [
        {
          type: 10,
          content: '-# Anime',
        },
        {
          type: 10,
          content: '**full title**\nlong description',
        },
        {
          type: 12,
          items: [
            {
              media: {
                url: 'attachment://default.webp',
              },
            },
          ],
        },
      ],
    });
  });
});

describe('character embed', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
    delete config.appId;
    delete config.origin;
  });

  it('normal', async () => {
    const character: DisaggregatedCharacter = {
      id: '1',
      packId: 'pack-id',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
      rating: 5,
      age: '420',
      gender: 'male',
    };

    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = new discord.Message();

    const embed = await search.characterEmbed(message, character, {
      mode: 'full',
      description: true,
      footer: true,
      rating: false,
    });

    expect(embed.json()).toEqual({
      type: 'rich',
      fields: [
        {
          name: 'full name\n\u200B',
          value: 'long description',
        },
      ],
      image: {
        url: 'attachment://image-url.webp',
      },
      footer: {
        text: 'Male, 420',
      },
    });
  });

  it('media title', async () => {
    const character: Character = {
      id: '1',
      packId: 'pack-id',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
      rating: 5,
      age: '420',
      gender: 'male',
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: 'media_id',
              packId: 'pack-id',
              title: { english: 'media title' },
              type: MediaType.Anime,
            },
          },
        ],
      },
    };

    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = new discord.Message();

    const embed = await search.characterEmbed(message, character, {
      mode: 'thumbnail',
      description: true,
      media: { title: true },
      footer: true,
      rating: false,
    });

    expect(embed.json()).toEqual({
      type: 'rich',
      fields: [
        {
          name: 'media title',
          value: '**full name**',
        },
        {
          name: '\u200B',
          value: 'long description',
        },
      ],
      thumbnail: {
        url: 'attachment://image-url.webp',
      },
      footer: {
        text: 'Male, 420',
      },
    });
  });

  it('minimized', async () => {
    const character: DisaggregatedCharacter = {
      id: '1',
      packId: 'pack-id',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
      rating: 5,
      age: '420',
      gender: 'male',
    };

    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = new discord.Message();

    const embed = await search.characterEmbed(message, character, {
      mode: 'thumbnail',
      description: false,
      footer: false,
      rating: false,
    });

    expect(embed.json()).toEqual({
      fields: [
        {
          name: 'full name',
          value: '\u200B',
        },
      ],
      thumbnail: {
        url: 'attachment://image-url.webp',
      },
      type: 'rich',
    });
  });

  it('custom', async () => {
    const character: DisaggregatedCharacter = {
      id: '1',
      packId: 'pack-id',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
      rating: 5,
      age: '420',
      gender: 'male',
    };

    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = new discord.Message();

    const embed = await search.characterEmbed(message, character, {
      mode: 'thumbnail',
      description: false,
      footer: false,
      rating: false,
      existing: [
        {
          nickname: 'nickname',
          image: 'custom_image_url',
          createdAt: new Date(),
          rating: 1,
          userId: 'user_id',
        } as any,
      ],
    });

    expect(embed.json()).toEqual({
      type: 'rich',
      description: '<@user_id>',
      fields: [
        {
          name: 'nickname',
          value: '\u200B',
        },
      ],
      thumbnail: { url: 'attachment://custom-image-url.webp' },
    });
  });

  it('default image', async () => {
    const character: DisaggregatedCharacter = {
      id: '1',
      description: 'long description',
      name: {
        english: 'full name',
      },
      rating: 5,
      packId: 'pack-id',
      age: '420',
      gender: 'male',
    };

    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = new discord.Message();

    const embed = await search.characterEmbed(message, character, {
      mode: 'thumbnail',
      description: false,
      footer: false,
      rating: false,
    });

    expect(embed.json()).toEqual({
      fields: [
        {
          name: 'full name',
          value: '\u200B',
        },
      ],
      thumbnail: {
        url: 'attachment://default.webp',
      },
      type: 'rich',
    });
  });
});

describe('character container', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
    delete config.appId;
    delete config.origin;
  });

  it('normal', async () => {
    const character: DisaggregatedCharacter = {
      id: '1',
      packId: 'pack-id',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
      rating: 5,
      age: '420',
      gender: 'male',
    };

    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = new discordV2.Message();

    const embed = await search.characterContainer(message, character, {
      mode: 'full',
      description: true,
      footer: true,
      rating: false,
    });

    expect(embed.json()).toEqual({
      type: 17,
      components: [
        {
          type: 10,
          content: '**full name**\nlong description',
        },
        {
          type: 12,
          items: [
            {
              media: {
                url: 'attachment://image-url.webp',
              },
            },
          ],
        },
        {
          type: 10,
          content: '-# Male, 420',
        },
      ],
    });
  });

  it('media title', async () => {
    const character: Character = {
      id: '1',
      packId: 'pack-id',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
      rating: 5,
      age: '420',
      gender: 'male',
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: 'media_id',
              packId: 'pack-id',
              title: { english: 'media title' },
              type: MediaType.Anime,
            },
          },
        ],
      },
    };

    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = new discordV2.Message();

    const embed = await search.characterContainer(message, character, {
      mode: 'thumbnail',
      description: true,
      media: { title: true },
      footer: true,
      rating: false,
    });

    expect(embed.json()).toEqual({
      type: 17,
      components: [
        {
          type: 9,
          accessory: {
            type: 11,
            media: {
              url: 'attachment://image-url.webp',
            },
          },
          components: [
            {
              type: 10,
              content: 'media title\n**full name**\nlong description',
            },
          ],
        },
        {
          type: 10,
          content: '-# Male, 420',
        },
      ],
    });
  });

  it('minimized', async () => {
    const character: DisaggregatedCharacter = {
      id: '1',
      packId: 'pack-id',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
      rating: 5,
      age: '420',
      gender: 'male',
    };

    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = new discordV2.Message();

    const embed = await search.characterContainer(message, character, {
      mode: 'thumbnail',
      description: false,
      footer: false,
      rating: false,
    });

    expect(embed.json()).toEqual({
      type: 17,
      components: [
        {
          type: 9,
          accessory: {
            type: 11,
            media: {
              url: 'attachment://image-url.webp',
            },
          },
          components: [
            {
              type: 10,
              content: '**full name**',
            },
          ],
        },
      ],
    });
  });

  it('custom', async () => {
    const character: DisaggregatedCharacter = {
      id: '1',
      packId: 'pack-id',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
      rating: 5,
      age: '420',
      gender: 'male',
    };

    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = new discordV2.Message();

    const embed = await search.characterContainer(message, character, {
      mode: 'thumbnail',
      description: false,
      footer: false,
      rating: false,
      existing: [
        {
          nickname: 'nickname',
          image: 'custom_image_url',
          createdAt: new Date(),
          rating: 1,
          userId: 'user_id',
        } as any,
      ],
    });

    expect(embed.json()).toEqual({
      type: 17,
      components: [
        {
          type: 10,
          content: '<@user_id>',
        },
        {
          type: 9,
          accessory: {
            type: 11,
            media: {
              url: 'attachment://custom-image-url.webp',
            },
          },
          components: [
            {
              type: 10,
              content: '**nickname**',
            },
          ],
        },
      ],
    });
  });

  it('default image', async () => {
    const character: DisaggregatedCharacter = {
      id: '1',
      description: 'long description',
      name: {
        english: 'full name',
      },
      rating: 5,
      packId: 'pack-id',
      age: '420',
      gender: 'male',
    };

    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = new discordV2.Message();

    const embed = await search.characterContainer(message, character, {
      mode: 'thumbnail',
      description: false,
      footer: false,
      rating: false,
    });

    expect(embed.json()).toEqual({
      type: 17,
      components: [
        {
          type: 9,
          accessory: {
            type: 11,
            media: {
              url: 'attachment://default.webp',
            },
          },
          components: [
            {
              type: 10,
              content: '**full name**',
            },
          ],
        },
      ],
    });
  });
});

describe('media characters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
    delete config.appId;
    delete config.origin;
  });

  it('normal', async () => {
    vi.spyOn(packs, 'mediaCharacters').mockResolvedValue({
      next: true,
      media: {
        id: '1',
        packId: 'pack-id',
        type: MediaType.Anime,
        popularity: 200_000,
        title: {
          english: 'title',
        },
      },
      character: {
        id: '2',
        packId: 'pack-id',
        rating: 3,
        name: {
          english: 'name',
        },
      },
    });

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'findCharacter').mockReturnValue(undefined as any);
    vi.spyOn(packs, 'all').mockResolvedValue([]);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.mediaCharacters({
      token: 'test_token',
      id: 'pack-id:1',
      userId: 'user_id',
      guildId: 'guild_id',
      index: 0,
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
      flags: 32768,
      allowed_mentions: { parse: [] },
      attachments: [
        {
          id: '0',
          filename: 'default.webp',
        },
      ],
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 10,
              content: '**name**',
            },
            {
              type: 12,
              items: [
                {
                  media: {
                    url: 'attachment://default.webp',
                  },
                },
              ],
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              custom_id: '_',
              disabled: true,
              label: '1',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'mcharacters=pack-id:1=1=next',
              label: 'Next',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'like=pack-id:2',
              label: '/like',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'media=pack-id:1',
              label: '/anime',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
    });
  });

  it('with owner', async () => {
    vi.spyOn(packs, 'mediaCharacters').mockResolvedValue({
      next: true,
      media: {
        id: '1',
        packId: 'pack-id',
        type: MediaType.Manga,
        title: {
          english: 'title',
        },
      },
      character: {
        id: '2',
        packId: 'pack-id',
        rating: 1,
        name: {
          english: 'name',
        },
      },
    });

    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'findCharacter').mockReturnValue([
      {
        characterId: 'pack-id:2',
        mediaId: 'media_id',
        rating: 3,
        userId: 'user_id',
      },
    ] as any);
    vi.spyOn(packs, 'all').mockResolvedValue([]);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.mediaCharacters({
      token: 'test_token',
      id: 'pack-id:1',
      userId: 'user_id',
      guildId: 'guild_id',
      index: 0,
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
      flags: 32768,
      allowed_mentions: { parse: [] },
      attachments: [
        {
          id: '0',
          filename: 'default.webp',
        },
      ],
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content:
                '<@user_id>\n\n<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 10,
              content: '**name**',
            },
            {
              type: 12,
              items: [
                {
                  media: {
                    url: 'attachment://default.webp',
                  },
                },
              ],
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              custom_id: '_',
              disabled: true,
              label: '1',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'mcharacters=pack-id:1=1=next',
              label: 'Next',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'like=pack-id:2',
              label: '/like',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'media=pack-id:1',
              label: '/manga',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
    });
  });

  it('disabled media', async () => {
    vi.spyOn(packs, 'mediaCharacters').mockResolvedValue({
      next: false,
      media: {
        id: '1',
        packId: 'pack-id',
        type: MediaType.Anime,
        title: {
          english: 'title',
        },
      },
      character: {
        id: '2',
        packId: 'pack-id',
        rating: 1,
        name: {
          english: 'name',
        },
      },
    });

    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'findCharacter').mockReturnValue(undefined as any);
    vi.spyOn(packs, 'all').mockResolvedValue([]);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(true);

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.mediaCharacters({
      token: 'test_token',
      id: 'pack-id:1',
      userId: 'user_id',
      guildId: 'guild_id',
      index: 0,
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
      flags: 32768,
      attachments: [],
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content: 'Found _nothing_ matching that query!',
            },
          ],
        },
      ],
    });
  });

  it('no characters', async () => {
    vi.spyOn(packs, 'mediaCharacters').mockResolvedValue({
      next: false,
      media: {
        id: '1',
        packId: 'pack-id',
        type: MediaType.Anime,
        title: {
          english: 'title',
        },
      },
    });

    vi.spyOn(packs, 'all').mockResolvedValue([]);

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue({
      ok: true,
      text: () => undefined as any,
    } as any);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.mediaCharacters({
      token: 'test_token',
      id: 'pack-id:1',
      userId: 'user_id',
      guildId: 'guild_id',
      index: 0,
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
      flags: 32768,
      attachments: [],
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content: 'title contains no characters',
            },
          ],
        },
      ],
    });
  });

  it('no more characters', async () => {
    vi.spyOn(packs, 'mediaCharacters').mockResolvedValue({
      next: false,
      media: {
        id: '1',
        packId: 'pack-id',
        type: MediaType.Anime,
        title: {
          english: 'title',
        },
      },
    });

    vi.spyOn(packs, 'all').mockResolvedValue([]);

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.mediaCharacters({
      token: 'test_token',
      id: 'pack-id:1',
      userId: 'user_id',
      guildId: 'guild_id',
      index: 0,
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
      flags: 32768,
      attachments: [],
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content: 'title contains no characters',
            },
          ],
        },
      ],
    });
  });

  it('not found', async () => {
    vi.spyOn(packs, 'mediaCharacters').mockResolvedValue({
      next: false,
    });

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.mediaCharacters({
      token: 'test_token',
      id: 'pack-id:1',
      userId: 'user_id',
      guildId: 'guild_id',
      index: 0,
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
      flags: 32768,
      attachments: [],
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content: 'Found _nothing_ matching that query!',
            },
          ],
        },
      ],
    });
  });
});

describe('/found', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
    delete config.appId;
    delete config.origin;
  });

  it('normal', async () => {
    const media: Media[] = [
      {
        id: '3',
        packId: 'anilist',
        type: MediaType.Manga,
        title: {
          english: 'title',
        },
        popularity: 0,
      },
    ];

    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        rating: 2,
        name: {
          english: 'name',
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
        rating: 4,
        name: {
          english: 'name 2',
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

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(packs, 'media').mockResolvedValue(media);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);
    vi.spyOn(db, 'getMediaCharacters').mockReturnValue([
      {
        characterId: 'anilist:1',
        mediaId: 'anilist:3',
        rating: 2,
        userId: 'another_user_id',
      },
      {
        characterId: 'anilist:2',
        mediaId: 'anilist:3',
        rating: 4,
        userId: 'another_user_id',
      },
    ] as any);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );
    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.mediaFound({
      index: 0,
      token: 'test_token',
      userId: 'user_id',
      guildId: 'guild_id',
      id: 'anilist:3',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
      attachments: [],
      components: [
        {
          type: 1,
          components: [
            {
              custom_id: 'found=anilist:3=0=prev',
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
              custom_id: 'found=anilist:3=0=next',
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
              value: '2<:smolstar:1107503653956374638> <@another_user_id> name',
            },
            {
              inline: false,
              name: 'title',
              value:
                '4<:smolstar:1107503653956374638> <@another_user_id> name 2',
            },
          ],
        },
      ],
    });
  });

  it('relation groups', async () => {
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
          english: 'name',
        },
        rating: 2,
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
          english: 'name 2',
        },
        rating: 4,
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
          english: 'name 3',
        },
        rating: 4,
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

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(packs, 'media').mockResolvedValue(media);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'getMediaCharacters').mockReturnValue([
      {
        characterId: 'anilist:1',
        mediaId: 'anilist:4',
        rating: 2,
        userId: 'another_user_id',
      },
      {
        characterId: 'anilist:3',
        mediaId: 'anilist:4',
        rating: 4,
        userId: 'another_user_id',
      },
      {
        characterId: 'anilist:2',
        mediaId: 'anilist:5',
        rating: 4,
        userId: 'another_user_id',
      },
    ] as any);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.mediaFound({
      index: 0,
      token: 'test_token',
      userId: 'user_id',
      guildId: 'guild_id',
      id: 'anilist:4',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
      attachments: [],
      components: [
        {
          type: 1,
          components: [
            {
              custom_id: 'found=anilist:4=0=prev',
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
              custom_id: 'found=anilist:4=0=next',
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
              value: '2<:smolstar:1107503653956374638> <@another_user_id> name',
            },
            {
              inline: false,
              name: 'title 2',
              value:
                '4<:smolstar:1107503653956374638> <@another_user_id> name 2',
            },
            {
              inline: false,
              name: 'title',
              value:
                '4<:smolstar:1107503653956374638> <@another_user_id> name 3',
            },
          ],
        },
      ],
    });
  });

  it('media disabled', async () => {
    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(packs, 'media').mockResolvedValue([]);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(true);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.mediaFound({
      index: 0,
      token: 'test_token',
      userId: 'user_id',
      guildId: 'guild_id',
      id: 'anilist:2',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
      attachments: [],
      components: [],
      embeds: [
        {
          type: 'rich',
          description: 'Found _nothing_ matching that query!',
        },
      ],
    });
  });

  it('no characters', async () => {
    const media: Media = {
      id: '2',
      packId: 'anilist',
      type: MediaType.Manga,
      title: {
        english: 'title',
      },
      popularity: 0,
    };

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(packs, 'media').mockResolvedValue([media]);
    vi.spyOn(db, 'getMediaCharacters').mockReturnValue([] as any);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);
    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await search.mediaFound({
      index: 0,
      token: 'test_token',
      guildId: 'guild_id',
      userId: 'user_id',
      id: 'anilist:2',
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0][1];
    const formData = fetchCall?.body as FormData;
    const payload = JSON.parse(formData?.get('payload_json') as any);

    expect(payload).toEqual({
      attachments: [],
      components: [],
      embeds: [
        {
          type: 'rich',
          description: 'No one has found any title characters',
        },
      ],
    });
  });
});
