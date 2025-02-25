/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import utils from '~/src/utils.ts';
import * as discord from '~/src/discord.ts';
import packs from '~/src/packs.ts';
import config from '~/src/config.ts';
import search from '~/src/search.ts';
import db from '~/db/index.ts';

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
        romaji: 'romaji title',
        native: 'native title',
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
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
          author: {
            name: 'Anime',
          },
          title: 'english title',
          description: 'long description',
          image: {
            url: 'attachment://image-url.webp',
          },
        },
      ],
      components: [],
      attachments: [{ filename: 'image-url.webp', id: '0' }],
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
        native: 'native title',
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'native title',
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
          author: {
            name: 'Anime',
          },
          title: 'native title',
          description: 'long description',
          image: {
            url: 'attachment://image-url.webp',
          },
        },
      ],
      components: [],
      attachments: [{ filename: 'image-url.webp', id: '0' }],
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
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
          author: {
            name: 'Novel',
          },
          title: 'english title',
          description: 'long description',
          image: {
            url: 'attachment://image-url.webp',
          },
        },
      ],
      components: [],
      attachments: [{ filename: 'image-url.webp', id: '0' }],
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
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
          author: {
            name: 'Anime',
          },
          title: 'english title',
          description: 'long description',
          image: {
            url: 'attachment://image-url.webp',
          },
        },
      ],
      components: [
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
      attachments: [{ filename: 'image-url.webp', id: '0' }],
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
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
          author: {
            name: 'Anime',
          },
          title: 'english title',
          image: {
            url: 'attachment://default.webp',
          },
        },
      ],
      components: [],
      attachments: [{ filename: 'default.webp', id: '0' }],
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
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
          author: {
            name: 'Anime',
          },
          title: 'english title',
          description: 'long description',
          image: {
            url: 'attachment://image-url.webp',
          },
        },
      ],
      components: [
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
      attachments: [{ filename: 'image-url.webp', id: '0' }],
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
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
          author: {
            name: 'Anime',
          },
          title: 'english title',
          description: 'long description',
          image: {
            url: 'attachment://image-url.webp',
          },
        },
        {
          type: 'rich',
          footer: {
            text: 'Male, 69',
          },
          fields: [
            {
              name: 'main character name',
              value: 'main character description',
            },
          ],
          thumbnail: {
            url: 'attachment://maincharacterurl.webp',
          },
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'supporting character name',
              value: 'supporting character description',
            },
          ],
          thumbnail: {
            url: 'attachment://supportingcharacterurl.webp',
          },
        },
      ],
      components: [
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
      attachments: [
        { filename: 'image-url.webp', id: '0' },
        { filename: 'maincharacterurl.webp', id: '1' },
        { filename: 'supportingcharacterurl.webp', id: '2' },
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
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
          author: {
            name: 'Anime',
          },
          title: 'english title',
          description: 'long description',
          image: {
            url: 'attachment://image-url.webp',
          },
        },
      ],
      components: [
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
      attachments: [{ filename: 'image-url.webp', id: '0' }],
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
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
          author: {
            name: 'Anime',
          },
          title: 'english title',
          description: 'long description',
          image: {
            url: 'attachment://image-url.webp',
          },
        },
      ],
      components: [
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
      attachments: [{ filename: 'image-url.webp', id: '0' }],
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
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
          author: {
            name: 'Anime',
          },
          title: 'english title',
          description: 'long description',
          image: {
            url: 'attachment://image-url.webp',
          },
        },
      ],
      components: [
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
      attachments: [{ filename: 'image-url.webp', id: '0' }],
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
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
          author: {
            name: 'Anime',
          },
          title: 'english title',
          description: 'long description',
          image: {
            url: 'attachment://image-url.webp',
          },
        },
      ],
      components: [
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
      attachments: [{ filename: 'image-url.webp', id: '0' }],
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
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
          author: {
            name: 'Anime',
          },
          title: 'english title',
          description: 'long description',
          image: {
            url: 'attachment://image-url.webp',
          },
        },
      ],
      components: [
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
      attachments: [{ filename: 'image-url.webp', id: '0' }],
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
              name: {
                english: 'main character name',
              },
              popularity: 0,
            },
          },
          {
            role: CharacterRole.Supporting,
            node: {
              id: '10',
              name: {
                english: 'supporting character name',
              },
              popularity: 100,
            },
          },
          {
            role: CharacterRole.Background,
            node: {
              id: '15',
              name: {
                english: 'background character name',
              },
              popularity: 50,
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
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
          author: {
            name: 'Anime',
          },
          title: 'english title',
          description: 'long description',
          image: {
            url: 'attachment://image-url.webp',
          },
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'main character name',
              value: '\u200B',
            },
          ],
          thumbnail: {
            url: 'attachment://default.webp',
          },
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'supporting character name',
              value: '\u200B',
            },
          ],
          thumbnail: {
            url: 'attachment://default.webp',
          },
        },
      ],
      components: [
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
      attachments: [
        { filename: 'image-url.webp', id: '0' },
        { filename: 'default.webp', id: '1' },
        { filename: 'default.webp', id: '2' },
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

    const message = search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'x'.repeat(100),
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
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {},
    };

    await expect(() => search.mediaMessage(media)).rejects.toThrowError('404');
  });
});

describe('/media debug', () => {
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
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      description: 'long description',
      popularity: 0,
      title: {
        english: 'english title',
        romaji: 'romaji title',
        native: 'native title',
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
      debug: true,
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
          description: 'romaji title\nnative title',
          fields: [
            {
              name: 'Id',
              value: 'pack-id:1',
            },
            {
              inline: true,
              name: 'Type',
              value: 'Anime',
            },
            {
              inline: true,
              name: 'Format',
              value: 'TV',
            },
            {
              inline: true,
              name: 'Popularity',
              value: '0',
            },
          ],
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
          title: 'english title',
        },
      ],
      components: [],
      attachments: [{ filename: 'image-url.webp', id: '0' }],
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.media({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'english title',
      debug: true,
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
          fields: [
            {
              name: 'Id',
              value: 'pack-id:1',
            },
            {
              inline: true,
              name: 'Type',
              value: 'Anime',
            },
            {
              inline: true,
              name: 'Format',
              value: 'TV',
            },
            {
              inline: true,
              name: 'Popularity',
              value: '0',
            },
          ],
          thumbnail: {
            url: 'attachment://default.webp',
          },
          title: 'english title',
        },
      ],
      components: [],
      attachments: [{ filename: 'default.webp', id: '0' }],
    });
  });

  it('no titles', async () => {
    vi.spyOn(db, 'getGuild').mockReturnValue('' as any);

    const media: Media = {
      id: '1',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      title: {},
    };

    await expect(() => search.mediaDebugMessage(media)).rejects.toThrowError(
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
      popularity: 1_000_000,
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.character({
      token: 'test_token',
      guildId: 'guild_id',
      userId: 'user_id',
      search: 'full name',
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
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098>',
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
        },
      ],
      components: [
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
      attachments: [{ filename: 'image-url.webp', id: '0' }],
    });
  });

  it('with 1 owner', async () => {
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.character({
      token: 'test_token',
      search: 'full name',
      guildId: 'guild_id',
      userId: 'user_id',
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
          description:
            '<@user_id>\n\n<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          fields: [
            {
              name: 'full name\n\u200B',
              value: 'long description',
            },
          ],
          image: {
            url: 'attachment://image-url.webp',
          },
        },
      ],
      components: [
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
              custom_id: 'stats=pack-id:1',
              label: '/stats',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
      attachments: [{ filename: 'image-url.webp', id: '0' }],
    });
  });

  it('with 2 owner - sort userId first', async () => {
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.character({
      token: 'test_token',
      search: 'full name',
      guildId: 'guild_id',
      userId: 'user_id',
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
          description:
            '<@user_id><@another_user_id>\n\n<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          fields: [
            {
              name: 'full name\n\u200B',
              value: 'long description',
            },
          ],
          image: {
            url: 'attachment://image-url.webp',
          },
        },
      ],
      components: [
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
              custom_id: 'stats=pack-id:1',
              label: '/stats',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
      attachments: [{ filename: 'image-url.webp', id: '0' }],
    });
  });

  it('with 2 owner - sort highest rating first', async () => {
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.character({
      token: 'test_token',
      search: 'full name',
      guildId: 'guild_id',
      userId: 'user_id',
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
          description:
            '<@another_user_id_2><@another_user_id_1>\n\n<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          fields: [
            {
              name: 'full name\n\u200B',
              value: 'long description',
            },
          ],
          image: {
            url: 'attachment://image-url.webp',
          },
        },
      ],
      components: [
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
              custom_id: 'stats=pack-id:1',
              label: '/stats',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
      attachments: [{ filename: 'image-url.webp', id: '0' }],
    });
  });

  it('with 2 owner - sort older created first', async () => {
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.character({
      token: 'test_token',
      search: 'full name',
      guildId: 'guild_id',
      userId: 'user_id',
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
          description:
            '<@another_user_id_2><@another_user_id_1>\n\n<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          fields: [
            {
              name: 'full name\n\u200B',
              value: 'long description',
            },
          ],
          image: {
            url: 'attachment://image-url.webp',
          },
        },
      ],
      components: [
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
              custom_id: 'stats=pack-id:1',
              label: '/stats',
              style: 2,
              type: 2,
            },
          ],
        },
      ],
      attachments: [{ filename: 'image-url.webp', id: '0' }],
    });
  });

  it('with gender', async () => {
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.character({
      token: 'test_token',
      guildId: 'guild_id',
      userId: 'user_id',
      search: 'full name',
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
          description:
            '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
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
            text: 'Female',
          },
        },
      ],
      components: [
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
      attachments: [{ filename: 'image-url.webp', id: '0' }],
    });
  });

  it('with age', async () => {
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = await search.character({
      token: 'test_token',
      guildId: 'guild_id',
      userId: 'user_id',
      search: 'full name',
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
          description:
            '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
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
            text: '18+',
          },
        },
      ],
      components: [
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
      attachments: [{ filename: 'image-url.webp', id: '0' }],
    });
  });

  it('with relations', async () => {
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.character({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'full name',
      userId: 'user_id',
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
      attachments: [{ filename: 'image-url.webp', id: '0' }],
      embeds: [
        {
          type: 'rich',
          description:
            '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          fields: [
            {
              name: 'full name\n\u200B',
              value: 'long description',
            },
          ],
          image: {
            url: 'attachment://image-url.webp',
          },
        },
      ],
      components: [
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.character({
      token: 'test_token',
      guildId: 'guild_id',
      userId: 'user_id',
      search: 'full name',
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
          description:
            '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          fields: [
            {
              name: 'full name',
              value: '\u200B',
            },
          ],
          image: {
            url: 'attachment://default.webp',
          },
        },
      ],
      components: [
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
      attachments: [{ filename: 'default.webp', id: '0' }],
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

    const message = search.character({
      token: 'test_token',
      guildId: 'guild_id',
      search: 'x'.repeat(100),
      userId: 'user_id',
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
      components: [],
      attachments: [],
      embeds: [
        {
          type: 'rich',
          description: 'Found _nothing_ matching that query!',
        },
      ],
    });
  });
});

describe('media embed', () => {
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = new discord.Message();

    const embed = await search.mediaEmbed(message, media);

    expect(embed.json()).toEqual({
      type: 'rich',
      title: 'full title',
      description: 'long description',
      image: {
        url: 'attachment://image-url.webp',
      },
      author: {
        name: 'Anime',
      },
    });
  });

  it('minimized', async () => {
    const media: DisaggregatedMedia = {
      id: '1',
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = new discord.Message();

    const embed = await search.mediaEmbed(message, media, {
      mode: 'thumbnail',
    });

    expect(embed.json()).toEqual({
      type: 'rich',
      title: 'full title',
      description: 'long description',
      thumbnail: {
        url: 'attachment://image-url.webp',
      },
      author: {
        name: 'Anime',
      },
    });
  });

  it('default image', async () => {
    const media: DisaggregatedMedia = {
      id: '1',
      description: 'long description',
      title: {
        english: 'full title',
      },
      popularity: 1_000_000,
      type: MediaType.Anime,
      format: MediaFormat.TV,
    };

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = new discord.Message();

    const embed = await search.mediaEmbed(message, media);

    expect(embed.json()).toEqual({
      type: 'rich',
      title: 'full title',
      description: 'long description',
      image: {
        url: 'attachment://default.webp',
      },
      author: {
        name: 'Anime',
      },
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
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
      popularity: 1_000_000,
      age: '420',
      gender: 'male',
    };

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
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
      popularity: 1_000_000,
      age: '420',
      gender: 'male',
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: 'media_id',
              title: { english: 'media title' },
              type: MediaType.Anime,
            },
          },
        ],
      },
    };

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
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
      popularity: 1_000_000,
      age: '420',
      gender: 'male',
    };

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
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [
        {
          url: 'image_url',
        },
      ],
      popularity: 1_000_000,
      age: '420',
      gender: 'male',
    };

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
      popularity: 1_000_000,
      age: '420',
      gender: 'male',
    };

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

describe('/character debug', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
    delete config.appId;
    delete config.origin;
  });

  it('no media', async () => {
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
      age: '420',
      gender: 'male',
      popularity: 1_000_000,
    };

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'findCharacter').mockReturnValue(undefined as any);
    vi.spyOn(packs, 'searchOneCharacter').mockResolvedValue(character);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.character({
      token: 'test_token',
      guildId: 'guild_id',
      userId: 'user_id',
      search: 'full name',
      debug: true,
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
      attachments: [{ filename: 'image-url.webp', id: '0' }],
      components: [],
      embeds: [
        {
          type: 'rich',
          title: 'full name',
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
          fields: [
            {
              name: 'Id',
              value: 'pack-id:1',
            },
            {
              name: 'Rating',
              value: '5*',
            },
            {
              inline: true,
              name: 'Gender',
              value: 'male',
            },
            {
              inline: true,
              name: 'Age',
              value: '420',
            },
            {
              inline: true,
              name: 'Media',
              value: 'undefined:undefined',
            },
            {
              inline: true,
              name: 'Role',
              value: 'undefined',
            },
            {
              inline: true,
              name: 'Popularity',
              value: '1,000,000',
            },
            {
              name: '**WARN**',
              value:
                'Character not available in gacha.\nAdd at least one media to the character.',
            },
          ],
        },
      ],
    });
  });

  it('no media nor popularity', async () => {
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
      age: '420',
      gender: 'male',
    };

    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'findCharacter').mockReturnValue(undefined as any);
    vi.spyOn(packs, 'searchOneCharacter').mockResolvedValue(character);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.character({
      token: 'test_token',
      guildId: 'guild_id',
      userId: 'user_id',
      search: 'full name',
      debug: true,
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
      components: [],
      attachments: [{ filename: 'image-url.webp', id: '0' }],
      embeds: [
        {
          type: 'rich',
          title: 'full name',
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
          fields: [
            {
              name: 'Id',
              value: 'pack-id:1',
            },
            {
              name: 'Rating',
              value: '1*',
            },
            {
              inline: true,
              name: 'Gender',
              value: 'male',
            },
            {
              inline: true,
              name: 'Age',
              value: '420',
            },
            {
              inline: true,
              name: 'Media',
              value: 'undefined:undefined',
            },
            {
              inline: true,
              name: 'Role',
              value: 'undefined',
            },
            {
              inline: true,
              name: 'Popularity',
              value: '0',
            },
            {
              name: '**WARN**',
              value:
                'Character not available in gacha.\nAdd at least one media to the character.',
            },
          ],
        },
      ],
    });
  });

  it('with media', async () => {
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
      age: '420',
      gender: 'male',
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: '5',
              packId: 'pack-id',
              type: MediaType.Anime,
              format: MediaFormat.TV,
              popularity: 10,
              title: {
                english: 'title',
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
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.character({
      token: 'test_token',
      guildId: 'guild_id',
      userId: 'user_id',
      search: 'full name',
      debug: true,
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
      attachments: [{ filename: 'image-url.webp', id: '0' }],
      components: [],
      embeds: [
        {
          type: 'rich',
          title: 'full name',
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
          fields: [
            {
              name: 'Id',
              value: 'pack-id:1',
            },
            {
              name: 'Rating',
              value: '1*',
            },
            {
              inline: true,
              name: 'Gender',
              value: 'male',
            },
            {
              inline: true,
              name: 'Age',
              value: '420',
            },
            {
              inline: true,
              name: 'Media',
              value: 'pack-id:5',
            },
            {
              inline: true,
              name: 'Role',
              value: 'Main',
            },
            {
              inline: true,
              name: 'Popularity',
              value: '10',
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.character({
      token: 'test_token',
      guildId: 'guild_id',
      userId: 'user_id',
      search: 'full name',
      debug: true,
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
      attachments: [{ filename: 'default.webp', id: '0' }],
      components: [],
      embeds: [
        {
          type: 'rich',
          title: 'full name',
          thumbnail: {
            url: 'attachment://default.webp',
          },
          fields: [
            {
              name: 'Id',
              value: 'pack-id:1',
            },
            {
              name: 'Rating',
              value: '1*',
            },
            {
              inline: true,
              name: 'Gender',
              value: 'undefined',
            },
            {
              inline: true,
              name: 'Age',
              value: 'undefined',
            },
            {
              inline: true,
              name: 'Media',
              value: 'undefined:undefined',
            },
            {
              inline: true,
              name: 'Role',
              value: 'undefined',
            },
            {
              inline: true,
              name: 'Popularity',
              value: '0',
            },
            {
              name: '**WARN**',
              value:
                'Character not available in gacha.\nAdd at least one media to the character.',
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.mediaCharacters({
      token: 'test_token',
      id: 'pack-id:1',
      userId: 'user_id',
      guildId: 'guild_id',
      index: 0,
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
      attachments: [{ filename: 'default.webp', id: '0' }],
      components: [
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
      embeds: [
        {
          type: 'rich',
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          fields: [
            {
              name: 'name',
              value: '\u200B',
            },
          ],
          image: {
            url: 'attachment://default.webp',
          },
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.mediaCharacters({
      token: 'test_token',
      id: 'pack-id:1',
      userId: 'user_id',
      guildId: 'guild_id',
      index: 0,
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
      attachments: [{ filename: 'default.webp', id: '0' }],
      components: [
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
      embeds: [
        {
          type: 'rich',
          description:
            '<@user_id>\n\n<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          fields: [
            {
              name: 'name',
              value: '\u200B',
            },
          ],
          image: {
            url: 'attachment://default.webp',
          },
        },
      ],
    });
  });

  it('disabled media', async () => {
    vi.spyOn(packs, 'mediaCharacters').mockResolvedValue({
      next: false,
      media: {
        id: '1',
        type: MediaType.Anime,
        title: {
          english: 'title',
        },
      },
      character: {
        id: '2',
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

    const message = search.mediaCharacters({
      token: 'test_token',
      id: 'pack-id:1',
      userId: 'user_id',
      guildId: 'guild_id',
      index: 0,
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
    vi.spyOn(packs, 'mediaCharacters').mockResolvedValue({
      next: false,
      media: {
        id: '1',
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

    const message = search.mediaCharacters({
      token: 'test_token',
      id: 'pack-id:1',
      userId: 'user_id',
      guildId: 'guild_id',
      index: 0,
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
          description: 'title contains no characters',
        },
      ],
    });
  });

  it('no more characters', async () => {
    vi.spyOn(packs, 'mediaCharacters').mockResolvedValue({
      next: false,
      media: {
        id: '1',
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

    const message = search.mediaCharacters({
      token: 'test_token',
      id: 'pack-id:1',
      userId: 'user_id',
      guildId: 'guild_id',
      index: 0,
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
          description: 'title contains no characters',
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

    const message = search.mediaCharacters({
      token: 'test_token',
      id: 'pack-id:1',
      userId: 'user_id',
      guildId: 'guild_id',
      index: 0,
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.mediaFound({
      index: 0,
      token: 'test_token',
      userId: 'user_id',
      guildId: 'guild_id',
      id: 'anilist:3',
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

    const message = search.mediaFound({
      index: 0,
      token: 'test_token',
      userId: 'user_id',
      guildId: 'guild_id',
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

    const message = search.mediaFound({
      index: 0,
      token: 'test_token',
      userId: 'user_id',
      guildId: 'guild_id',
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = search.mediaFound({
      index: 0,
      token: 'test_token',
      guildId: 'guild_id',
      userId: 'user_id',
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
