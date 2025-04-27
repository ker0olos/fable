/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, afterEach, vi } from 'vitest';

import utils from '~/src/utils.ts';

import packs from '~/src/packs.ts';
import party from '~/src/party.ts';

import config from '~/src/config.ts';

import db from '~/db/index.ts';

import { Character, Media, MediaType } from '~/src/types.ts';

describe('/party view', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete config.appId;
    delete config.origin;
  });

  it('normal', async () => {
    const media: Media[] = [
      {
        id: '0',
        packId: 'anilist',
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
        rating: 1,
        name: {
          english: 'name 1',
        },
      },
      {
        id: '2',
        packId: 'anilist',
        rating: 2,
        name: {
          english: 'name 2',
        },
      },
      {
        id: '3',
        packId: 'anilist',
        rating: 3,
        name: {
          english: 'name 3',
        },
      },
      {
        id: '4',
        packId: 'anilist',
        rating: 4,
        name: {
          english: 'name 4',
        },
      },
      {
        id: '5',
        packId: 'anilist',
        rating: 5,
        name: {
          english: 'name 5',
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValue(undefined as any);

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {
        member1: {
          characterId: 'anilist:1',
          mediaId: 'anilist:0',
          rating: 1,
        },
        member2: {
          characterId: 'anilist:2',
          mediaId: 'anilist:0',
          rating: 2,
        },
        member3: {
          characterId: 'anilist:3',
          mediaId: 'anilist:0',
          rating: 3,
        },
        member4: {
          characterId: 'anilist:4',
          mediaId: 'anilist:0',
          rating: 4,
        },
        member5: {
          characterId: 'anilist:5',
          mediaId: 'anilist:0',
          rating: 5,
        },
      },
    } as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(packs, 'media').mockResolvedValue(media);

    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await party.view({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
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
      attachments: [
        { filename: 'default.webp', id: '0' },
        { filename: 'default.webp', id: '1' },
        { filename: 'default.webp', id: '2' },
        { filename: 'default.webp', id: '3' },
        { filename: 'default.webp', id: '4' },
      ],
      embeds: [
        {
          type: 'rich',
          fields: [
            {
              name: 'title',
              value: '**name 1**',
            },
          ],
          thumbnail: {
            url: 'attachment://default.webp',
          },
          description:
            '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'title',
              value: '**name 2**',
            },
          ],
          thumbnail: {
            url: 'attachment://default.webp',
          },
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'title',
              value: '**name 3**',
            },
          ],
          thumbnail: {
            url: 'attachment://default.webp',
          },
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906>',
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'title',
              value: '**name 4**',
            },
          ],
          thumbnail: {
            url: 'attachment://default.webp',
          },
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906>',
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'title',
              value: '**name 5**',
            },
          ],
          thumbnail: {
            url: 'attachment://default.webp',
          },
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098>',
        },
      ],
    });
  });

  it('custom', async () => {
    const media: Media[] = [
      {
        id: '0',
        packId: 'anilist',
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
        rating: 1,
        name: {
          english: 'name 1',
        },
      },
      {
        id: '2',
        packId: 'anilist',
        rating: 2,
        name: {
          english: 'name 2',
        },
      },
      {
        id: '3',
        packId: 'anilist',
        rating: 3,
        name: {
          english: 'name 3',
        },
      },
      {
        id: '4',
        packId: 'anilist',
        rating: 4,
        name: {
          english: 'name 4',
        },
      },
      {
        id: '5',
        packId: 'anilist',
        rating: 5,
        name: {
          english: 'name 5',
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValue(undefined as any);

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {
        member1: {
          characterId: 'anilist:1',
          mediaId: 'anilist:0',
          rating: 1,
          nickname: 'nickname 1',
          image: 'image 1',
        },
        member2: {
          characterId: 'anilist:2',
          mediaId: 'anilist:0',
          rating: 2,
          nickname: 'nickname 2',
          image: 'image 2',
        },
        member3: {
          characterId: 'anilist:3',
          mediaId: 'anilist:0',
          rating: 3,
          nickname: 'nickname 3',
          image: 'image 3',
        },
        member4: {
          characterId: 'anilist:4',
          mediaId: 'anilist:0',
          rating: 4,
          nickname: 'nickname 4',
          image: 'image 4',
        },
        member5: {
          characterId: 'anilist:5',
          mediaId: 'anilist:0',
          rating: 5,
          nickname: 'nickname 5',
          image: 'image 5',
        },
      },
    } as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    vi.spyOn(packs, 'media').mockResolvedValue(media);

    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await party.view({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
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
      attachments: [
        { filename: 'image 1.webp', id: '0' },
        { filename: 'image 2.webp', id: '1' },
        { filename: 'image 3.webp', id: '2' },
        { filename: 'image 4.webp', id: '3' },
        { filename: 'image 5.webp', id: '4' },
      ],
      embeds: [
        {
          type: 'rich',
          fields: [
            {
              name: 'title',
              value: '**nickname 1**',
            },
          ],
          thumbnail: {
            url: 'attachment://image 1.webp',
          },
          description:
            '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'title',
              value: '**nickname 2**',
            },
          ],
          thumbnail: {
            url: 'attachment://image 2.webp',
          },
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'title',
              value: '**nickname 3**',
            },
          ],
          thumbnail: {
            url: 'attachment://image 3.webp',
          },
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906>',
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'title',
              value: '**nickname 4**',
            },
          ],
          thumbnail: {
            url: 'attachment://image 4.webp',
          },
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906>',
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'title',
              value: '**nickname 5**',
            },
          ],
          thumbnail: {
            url: 'attachment://image 5.webp',
          },
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098>',
        },
      ],
    });
  });

  it('unassigned members', async () => {
    const media: Media[] = [
      {
        id: '0',
        packId: 'anilist',
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
        rating: 1,
        name: {
          english: 'name 1',
        },
      },
      {
        id: '2',
        packId: 'anilist',
        rating: 2,
        name: {
          english: 'name 2',
        },
      },
      {
        id: '3',
        packId: 'anilist',
        rating: 3,
        name: {
          english: 'name 3',
        },
      },
      {
        id: '4',
        packId: 'anilist',
        rating: 4,
        name: {
          english: 'name 4',
        },
      },
      {
        id: '5',
        packId: 'anilist',
        rating: 5,
        name: {
          english: 'name 5',
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValue(undefined as any);

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);

    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {
        member1: {
          characterId: 'anilist:1',
          mediaId: 'anilist:0',
          rating: 1,
        },
        member2: {
          characterId: 'anilist:2',
          mediaId: 'anilist:0',
          rating: 2,
        },
        member5: {
          characterId: 'anilist:5',
          mediaId: 'anilist:0',
          rating: 5,
        },
      },
    } as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    vi.spyOn(packs, 'media').mockResolvedValue(media);

    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await party.view({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
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
      attachments: [
        { filename: 'default.webp', id: '0' },
        { filename: 'default.webp', id: '1' },
        { filename: 'default.webp', id: '2' },
      ],
      embeds: [
        {
          type: 'rich',
          fields: [
            {
              name: 'title',
              value: '**name 1**',
            },
          ],
          thumbnail: {
            url: 'attachment://default.webp',
          },
          description:
            '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'title',
              value: '**name 2**',
            },
          ],
          thumbnail: {
            url: 'attachment://default.webp',
          },
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
        },
        {
          type: 'rich',
          description: 'Unassigned',
        },
        {
          type: 'rich',
          description: 'Unassigned',
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'title',
              value: '**name 5**',
            },
          ],
          thumbnail: {
            url: 'attachment://default.webp',
          },
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098>',
        },
      ],
    });
  });

  it('disabled media', async () => {
    const media: Media = {
      id: '0',
      packId: 'anilist',
      type: MediaType.Anime,
      title: {
        english: 'title',
      },
    };

    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        rating: 1,
        name: {
          english: 'name 1',
        },
      },
      {
        id: '2',
        packId: 'anilist',
        rating: 2,
        name: {
          english: 'name 2',
        },
      },
      {
        id: '3',
        packId: 'anilist',
        rating: 3,
        name: {
          english: 'name 3',
        },
      },
      {
        id: '4',
        packId: 'anilist',
        rating: 4,
        name: {
          english: 'name 4',
        },
      },
      {
        id: '5',
        packId: 'anilist',
        rating: 5,
        name: {
          english: 'name 5',
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValue(undefined as any);

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);

    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {
        member1: {
          characterId: 'anilist:1',
          mediaId: 'anilist:0',
          rating: 1,
        },
        member2: {
          characterId: 'anilist:2',
          mediaId: 'anilist:0',
          rating: 2,
        },
        member3: {
          characterId: 'anilist:3',
          mediaId: 'anilist:0',
          rating: 3,
        },
        member4: {
          characterId: 'anilist:4',
          mediaId: 'anilist:0',
          rating: 4,
        },
        member5: {
          characterId: 'anilist:5',
          mediaId: 'anilist:0',
          rating: 5,
        },
      },
    } as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(packs, 'isDisabled').mockImplementation(
      (id) => id === 'anilist:0'
    );

    vi.spyOn(packs, 'media').mockResolvedValue([media]);

    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await party.view({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
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
          description: 'This character was removed or disabled',
        },
        {
          type: 'rich',
          description: 'This character was removed or disabled',
        },
        {
          type: 'rich',
          description: 'This character was removed or disabled',
        },
        {
          type: 'rich',
          description: 'This character was removed or disabled',
        },
        {
          type: 'rich',
          description: 'This character was removed or disabled',
        },
      ],
      components: [],
      attachments: [],
    });
  });
});

describe('/party assign', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete config.appId;
    delete config.origin;
  });

  it('normal', async () => {
    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        rating: 1,
        name: {
          english: 'name 1',
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValue(undefined as any);

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);

    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);

    vi.spyOn(db, 'assignCharacter').mockReturnValue({
      id: 'anilist:1',
      mediaId: 'anilist:0',
      rating: 2,
    } as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    vi.spyOn(packs, 'media').mockResolvedValue([]);

    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );

    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await party.assign({
      spot: 1,
      token: 'test_token',
      userId: 'user_id',
      guildId: 'guild_id',
      id: 'anilist:1',
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
          description: 'Assigned',
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'name 1',
              value: '\u200B',
            },
          ],
          thumbnail: {
            url: 'attachment://default.webp',
          },
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
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
      attachments: [{ filename: 'default.webp', id: '0' }],
    });
  });

  it('custom', async () => {
    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        rating: 1,
        name: {
          english: 'name 1',
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValue(undefined as any);

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);

    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);

    vi.spyOn(db, 'assignCharacter').mockReturnValue({
      id: 'anilist:1',
      mediaId: 'anilist:0',
      rating: 2,
      nickname: 'nickname',
      image: 'image',
    } as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    vi.spyOn(packs, 'media').mockResolvedValue([]);

    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );

    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await party.assign({
      spot: 1,
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      id: 'anilist:1',
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
          description: 'Assigned',
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'nickname',
              value: '\u200B',
            },
          ],
          thumbnail: {
            url: 'attachment://image.webp',
          },
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
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
      attachments: [{ filename: 'image.webp', id: '0' }],
    });
  });

  it('character not found', async () => {
    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        rating: 1,
        name: {
          english: 'name 1',
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValue(undefined as any);

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);

    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);

    vi.spyOn(db, 'assignCharacter').mockImplementation(() => {
      throw new Error('CHARACTER_NOT_FOUND');
    });

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    vi.spyOn(packs, 'media').mockResolvedValue([]);

    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    vi.spyOn(packs, 'aggregate').mockImplementation(
      async (t) => t.media ?? t.character
    );

    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await party.assign({
      spot: 1,
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      id: 'anilist:1',
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
  });
});

describe('/party swap', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete config.appId;
    delete config.origin;
  });

  it('normal', async () => {
    const media: Media[] = [
      {
        id: '0',
        packId: 'anilist',
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
        rating: 1,
        name: {
          english: 'name 1',
        },
      },
      {
        id: '2',
        packId: 'anilist',
        rating: 2,
        name: {
          english: 'name 2',
        },
      },
      {
        id: '3',
        packId: 'anilist',
        rating: 3,
        name: {
          english: 'name 3',
        },
      },
      {
        id: '4',
        packId: 'anilist',
        rating: 4,
        name: {
          english: 'name 4',
        },
      },
      {
        id: '5',
        packId: 'anilist',
        rating: 5,
        name: {
          english: 'name 5',
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValue(undefined as any);

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {
        member1: {
          characterId: 'anilist:2',
          mediaId: 'anilist:0',
          rating: 2,
        },
        member2: {
          characterId: 'anilist:1',
          mediaId: 'anilist:0',
          rating: 1,
        },
        member3: {
          characterId: 'anilist:3',
          mediaId: 'anilist:0',
          rating: 3,
        },
        member4: {
          characterId: 'anilist:4',
          mediaId: 'anilist:0',
          rating: 4,
        },
        member5: {
          characterId: 'anilist:5',
          mediaId: 'anilist:0',
          rating: 5,
        },
      },
    } as any);

    vi.spyOn(db, 'swapSpots').mockReturnValue({} as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    vi.spyOn(packs, 'media').mockResolvedValue(media);

    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await party.swap({
      a: 1,
      b: 2,
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
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
      attachments: [
        { filename: 'default.webp', id: '0' },
        { filename: 'default.webp', id: '1' },
        { filename: 'default.webp', id: '2' },
        { filename: 'default.webp', id: '3' },
        { filename: 'default.webp', id: '4' },
      ],
      embeds: [
        {
          type: 'rich',
          fields: [
            {
              name: 'title',
              value: '**name 1**',
            },
          ],
          thumbnail: {
            url: 'attachment://default.webp',
          },
          description:
            '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'title',
              value: '**name 2**',
            },
          ],
          thumbnail: {
            url: 'attachment://default.webp',
          },
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'title',
              value: '**name 3**',
            },
          ],
          thumbnail: {
            url: 'attachment://default.webp',
          },
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906>',
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'title',
              value: '**name 4**',
            },
          ],
          thumbnail: {
            url: 'attachment://default.webp',
          },
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906>',
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'title',
              value: '**name 5**',
            },
          ],
          thumbnail: {
            url: 'attachment://default.webp',
          },
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098>',
        },
      ],
    });
  });

  it('custom', async () => {
    const media: Media[] = [
      {
        id: '0',
        packId: 'anilist',
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
        rating: 1,
        name: {
          english: 'name 1',
        },
      },
      {
        id: '2',
        packId: 'anilist',
        rating: 2,
        name: {
          english: 'name 2',
        },
      },
      {
        id: '3',
        packId: 'anilist',
        rating: 3,
        name: {
          english: 'name 3',
        },
      },
      {
        id: '4',
        packId: 'anilist',
        rating: 4,
        name: {
          english: 'name 4',
        },
      },
      {
        id: '5',
        packId: 'anilist',
        rating: 5,
        name: {
          english: 'name 5',
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValue(undefined as any);

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {
        member1: {
          characterId: 'anilist:2',
          mediaId: 'anilist:0',
          rating: 2,
          nickname: 'nickname 2',
          image: 'image 2',
        },
        member2: {
          characterId: 'anilist:1',
          mediaId: 'anilist:0',
          rating: 1,
          nickname: 'nickname 1',
          image: 'image 1',
        },
        member3: {
          characterId: 'anilist:3',
          mediaId: 'anilist:0',
          rating: 3,
          nickname: 'nickname 3',
          image: 'image 3',
        },
        member4: {
          characterId: 'anilist:4',
          mediaId: 'anilist:0',
          rating: 4,
          nickname: 'nickname 4',
          image: 'image 4',
        },
        member5: {
          characterId: 'anilist:5',
          mediaId: 'anilist:0',
          rating: 5,
          nickname: 'nickname 5',
          image: 'image 5',
        },
      },
    } as any);

    vi.spyOn(db, 'swapSpots').mockReturnValue({} as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    vi.spyOn(packs, 'media').mockResolvedValue(media);

    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await party.swap({
      a: 1,
      b: 2,
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
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
      attachments: [
        { filename: 'image 1.webp', id: '0' },
        { filename: 'image 2.webp', id: '1' },
        { filename: 'image 3.webp', id: '2' },
        { filename: 'image 4.webp', id: '3' },
        { filename: 'image 5.webp', id: '4' },
      ],
      embeds: [
        {
          type: 'rich',
          fields: [
            {
              name: 'title',
              value: '**nickname 1**',
            },
          ],
          thumbnail: {
            url: 'attachment://image 1.webp',
          },
          description:
            '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'title',
              value: '**nickname 2**',
            },
          ],
          thumbnail: {
            url: 'attachment://image 2.webp',
          },
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'title',
              value: '**nickname 3**',
            },
          ],
          thumbnail: {
            url: 'attachment://image 3.webp',
          },
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906>',
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'title',
              value: '**nickname 4**',
            },
          ],
          thumbnail: {
            url: 'attachment://image 4.webp',
          },
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906>',
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'title',
              value: '**nickname 5**',
            },
          ],
          thumbnail: {
            url: 'attachment://image 5.webp',
          },
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098>',
        },
      ],
    });
  });
});

describe('/party remove', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete config.appId;
    delete config.origin;
  });

  it('normal', async () => {
    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        rating: 1,
        name: {
          english: 'name 1',
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValue(undefined as any);

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {
        member1: {
          characterId: 'anilist:1',
          mediaId: 'anilist:0',
          rating: 2,
        },
      },
    } as any);

    vi.spyOn(db, 'unassignCharacter').mockReturnValue({} as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    vi.spyOn(packs, 'media').mockResolvedValue([]);

    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await party.remove({
      spot: 1,
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
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
          description: 'Removed',
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'name 1',
              value: '\u200B',
            },
          ],
          thumbnail: {
            url: 'attachment://default.webp',
          },
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
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
      attachments: [{ filename: 'default.webp', id: '0' }],
    });
  });

  it('custom', async () => {
    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        rating: 1,
        name: {
          english: 'name 1',
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValue(undefined as any);

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {
        member1: {
          characterId: 'anilist:1',
          mediaId: 'anilist:0',
          rating: 2,
          nickname: 'nickname',
          image: 'image',
        },
      },
    } as any);

    vi.spyOn(db, 'unassignCharacter').mockReturnValue({} as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    vi.spyOn(packs, 'media').mockResolvedValue([]);

    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    vi.spyOn(utils, 'proxy').mockImplementation(
      async (t) =>
        ({ filename: `${(t ?? 'default')?.replace(/_/g, '-')}.webp` }) as any
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await party.remove({
      spot: 1,
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
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
          description: 'Removed',
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'nickname',
              value: '\u200B',
            },
          ],
          thumbnail: {
            url: 'attachment://image.webp',
          },
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
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
      attachments: [{ filename: 'image.webp', id: '0' }],
    });
  });

  it('empty spot', async () => {
    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        rating: 1,
        name: {
          english: 'name 1',
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValue(undefined as any);

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);

    vi.spyOn(db, 'getInventory').mockReturnValue({ party: {} } as any);

    vi.spyOn(db, 'unassignCharacter').mockReturnValue(undefined as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    vi.spyOn(packs, 'media').mockResolvedValue([]);

    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await party.remove({
      spot: 1,
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
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
          description:
            'There was no character assigned to this spot of the party',
        },
      ],
      components: [],
      attachments: [],
    });
  });
});

describe('/party clear', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete config.appId;
    delete config.origin;
  });

  it('normal', async () => {
    const media: Media[] = [
      {
        id: '0',
        packId: 'anilist',
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
        rating: 1,
        name: {
          english: 'name 1',
        },
      },
    ];

    vi.useFakeTimers();

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockResolvedValue(undefined as any);

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);

    vi.spyOn(db, 'clearParty').mockResolvedValue();

    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {},
    } as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    vi.spyOn(packs, 'media').mockResolvedValue(media);

    vi.spyOn(packs, 'characters').mockResolvedValue(characters);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    await party.clear({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
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
          description: 'Unassigned',
        },
        {
          type: 'rich',
          description: 'Unassigned',
        },
        {
          type: 'rich',
          description: 'Unassigned',
        },
        {
          type: 'rich',
          description: 'Unassigned',
        },
        {
          type: 'rich',
          description: 'Unassigned',
        },
      ],
    });
  });
});
