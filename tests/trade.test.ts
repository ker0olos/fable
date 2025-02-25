/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import utils from '~/src/utils.ts';
import packs from '~/src/packs.ts';
import trade from '~/src/trade.ts';
import config from '~/src/config.ts';
import db from '~/db/index.ts';

import { Character, CharacterRole, MediaType } from '~/src/types.ts';
import { NonFetalError } from '~/src/errors.ts';

describe('give', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();

    delete config.appId;
    delete config.origin;
    delete config.trading;
  });

  it('normal', async () => {
    const character: Character = {
      id: '1',
      packId: 'anilist',
      description: 'description',
      name: {
        english: 'title',
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
                english: 'media',
              },
            },
          },
        ],
      },
    };

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'getInventory')
      .mockReturnValueOnce({ inventory: 'inventory' } as any)
      .mockReturnValueOnce({ inventory: 'targetInventory' } as any);

    vi.spyOn(db, 'giveCharacters').mockReturnValue({} as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = trade.give({
      token: 'test_token',
      userId: 'user_id',
      targetId: 'target_id',
      guildId: 'guild_id',
      giveCharactersIds: ['anilist:1'],
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

    expect(fetchStub).toHaveBeenNthCalledWith(
      1,
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const body = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );

    expect(body).toEqual({
      attachments: [],
      components: [],
      embeds: [
        {
          type: 'rich',
          description: 'Gift sent to <@target_id>!',
        },
      ],
    });

    expect(fetchStub).toHaveBeenNthCalledWith(
      2,
      'https://discord.com/api/v10/webhooks/app_id/test_token',
      expect.objectContaining({
        method: 'POST',
      })
    );

    const body1 = JSON.parse(
      (fetchStub.mock.calls[1][1]?.body as FormData)?.get('payload_json') as any
    );

    expect(body1).toEqual({
      content: '<@target_id>',
      attachments: [{ filename: 'default.webp', id: '0' }],
      components: [
        {
          components: [
            {
              custom_id: 'character=anilist:1=1',
              label: '/character',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'like=anilist:1',
              label: '/like',
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
          description: '<@user_id> sent you a gift',
        },
        {
          type: 'rich',
          description:
            '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          fields: [
            {
              name: 'media',
              value: '**title**',
            },
            {
              name: '\u200B',
              value: '<:add:1099004747123523644>',
            },
          ],
          thumbnail: {
            url: 'attachment://default.webp',
          },
        },
      ],
    });
  });

  it('not found', async () => {
    const character: Character = {
      id: '1',
      packId: 'anilist',
      description: 'description',
      name: {
        english: 'title',
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
                english: 'media',
              },
            },
          },
        ],
      },
    };

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'getInventory')
      .mockReturnValueOnce({ inventory: 'inventory' } as any)
      .mockReturnValueOnce({ inventory: 'targetInventory' } as any);

    vi.spyOn(db, 'giveCharacters').mockImplementation(() => {
      throw new NonFetalError('NOT_OWNED');
    });

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = trade.give({
      token: 'test_token',
      userId: 'user_id',
      targetId: 'target_id',
      guildId: 'guild_id',
      giveCharactersIds: ['anilist:1', 'anilist:1'],
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

    expect(fetchStub).toHaveBeenNthCalledWith(
      1,
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const body = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );

    expect(body).toEqual({
      attachments: [],
      components: [],
      embeds: [
        {
          type: 'rich',
          description: 'Some of those characters changed hands',
        },
      ],
    });
  });

  it('not owned', async () => {
    const character: Character = {
      id: '1',
      packId: 'anilist',
      description: 'description',
      name: {
        english: 'title',
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
                english: 'media',
              },
            },
          },
        ],
      },
    };

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'getInventory')
      .mockReturnValueOnce({ inventory: 'inventory' } as any)
      .mockReturnValueOnce({ inventory: 'targetInventory' } as any);

    vi.spyOn(db, 'giveCharacters').mockImplementation(() => {
      throw new NonFetalError('NOT_OWNED');
    });

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = trade.give({
      token: 'test_token',
      userId: 'user_id',
      targetId: 'target_id',
      guildId: 'guild_id',
      giveCharactersIds: ['anilist:1', 'anilist:1'],
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

    expect(fetchStub).toHaveBeenNthCalledWith(
      1,
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const body = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );

    expect(body).toEqual({
      attachments: [],
      components: [],
      embeds: [
        {
          type: 'rich',
          description: 'Some of those characters changed hands',
        },
      ],
    });
  });

  it('in party', async () => {
    const character: Character = {
      id: '1',
      packId: 'anilist',
      description: 'description',
      name: {
        english: 'title',
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
                english: 'media',
              },
            },
          },
        ],
      },
    };

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'getInventory')
      .mockReturnValueOnce({ inventory: 'inventory' } as any)
      .mockReturnValueOnce({ inventory: 'targetInventory' } as any);

    vi.spyOn(db, 'giveCharacters').mockImplementation(() => {
      throw new NonFetalError('CHARACTER_IN_PARTY');
    });

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = trade.give({
      token: 'test_token',
      userId: 'user_id',
      targetId: 'target_id',
      guildId: 'guild_id',
      giveCharactersIds: ['anilist:1', 'anilist:1'],
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

    expect(fetchStub).toHaveBeenNthCalledWith(
      1,
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const body = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );

    expect(body).toEqual({
      attachments: [],
      components: [],
      embeds: [
        {
          type: 'rich',
          description: 'Some of those characters are currently in your party',
        },
      ],
    });
  });
});

describe('trade', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();

    delete config.appId;
    delete config.origin;
  });

  it('normal', async () => {
    const character: Character = {
      id: '1',
      packId: 'anilist',
      name: {
        english: 'title',
      },
      description: 'description',
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: '2',
              packId: 'anilist',
              type: MediaType.Anime,
              title: {
                english: 'media',
              },
            },
          },
        ],
      },
    };

    const character2: Character = {
      id: '2',
      packId: 'anilist',
      name: {
        english: 'title 2',
      },
      description: 'description 2',
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: '3',
              packId: 'anilist',
              type: MediaType.Anime,
              title: {
                english: 'media 2',
              },
            },
          },
        ],
      },
    };

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'getInventory')
      .mockReturnValueOnce({ inventory: 'inventory' } as any)
      .mockReturnValueOnce({ inventory: 'targetInventory' } as any);

    vi.spyOn(db, 'tradeCharacters').mockReturnValue({} as any);

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    vi.spyOn(packs, 'characters').mockResolvedValue([character, character2]);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = trade.accepted({
      token: 'test_token',
      userId: 'user_id',
      targetId: 'target_id',
      guildId: 'guild_id',
      giveCharactersIds: ['anilist:1', 'anilist:1'],
      takeCharactersIds: ['anilist:2', 'anilist:2'],
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

    expect(fetchStub).toHaveBeenNthCalledWith(
      1,
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const body = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );

    expect(body).toEqual({
      content: '<@user_id>',
      attachments: [
        { filename: 'default.webp', id: '0' },
        { filename: 'default.webp', id: '1' },
        { filename: 'default.webp', id: '2' },
        { filename: 'default.webp', id: '3' },
      ],
      components: [],
      embeds: [
        {
          type: 'rich',
          description: '<@target_id> accepted your offer',
        },
        {
          type: 'rich',
          description:
            '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          fields: [
            {
              name: 'media 2',
              value: '**title 2**',
            },
            {
              name: '\u200B',
              value: '<:add:1099004747123523644>',
            },
          ],
          thumbnail: {
            url: 'attachment://default.webp',
          },
        },
        {
          type: 'rich',
          description:
            '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          fields: [
            {
              name: 'media 2',
              value: '**title 2**',
            },
            {
              name: '\u200B',
              value: '<:add:1099004747123523644>',
            },
          ],
          thumbnail: {
            url: 'attachment://default.webp',
          },
        },
        {
          type: 'rich',
          description:
            '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          fields: [
            {
              name: 'media',
              value: '**title**',
            },
            {
              name: '\u200B',
              value: '<:remove:1099004424111792158>',
            },
          ],
          thumbnail: {
            url: 'attachment://default.webp',
          },
        },
        {
          type: 'rich',
          description:
            '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          fields: [
            {
              name: 'media',
              value: '**title**',
            },
            {
              name: '\u200B',
              value: '<:remove:1099004424111792158>',
            },
          ],
          thumbnail: {
            url: 'attachment://default.webp',
          },
        },
      ],
    });

    expect(fetchStub).toHaveBeenNthCalledWith(
      2,
      'https://discord.com/api/v10/webhooks/app_id/test_token',
      expect.objectContaining({
        method: 'POST',
      })
    );

    const body1 = JSON.parse(
      (fetchStub.mock.calls[1][1]?.body as FormData)?.get('payload_json') as any
    );

    expect(body1).toEqual({
      content: '<@user_id> your offer was accepted!',
      attachments: [],
      components: [],
      embeds: [],
    });
  });

  it('not found', async () => {
    const character: Character = {
      id: '1',
      packId: 'anilist',
      name: {
        english: 'title',
      },
      description: 'description',
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: '2',
              packId: 'anilist',
              type: MediaType.Anime,
              title: {
                english: 'media',
              },
            },
          },
        ],
      },
    };

    const character2: Character = {
      id: '2',
      packId: 'anilist',
      name: {
        english: 'title 2',
      },
      description: 'description 2',
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: '3',
              packId: 'anilist',
              type: MediaType.Anime,
              title: {
                english: 'media 2',
              },
            },
          },
        ],
      },
    };

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'getInventory')
      .mockReturnValueOnce({ inventory: 'inventory' } as any)
      .mockReturnValueOnce({ inventory: 'targetInventory' } as any);

    vi.spyOn(db, 'tradeCharacters').mockImplementation(() => {
      throw new NonFetalError('CHARACTER_NOT_FOUND');
    });

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    vi.spyOn(packs, 'characters').mockResolvedValue([character, character2]);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = trade.accepted({
      token: 'test_token',
      userId: 'user_id',
      targetId: 'target_id',
      guildId: 'guild_id',

      giveCharactersIds: ['anilist:1', 'anilist:1'],
      takeCharactersIds: ['anilist:2', 'anilist:2'],
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

    expect(fetchStub).toHaveBeenNthCalledWith(
      1,
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const body = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );

    expect(body).toEqual({
      attachments: [],
      components: [],
      embeds: [
        {
          type: 'rich',
          description: 'Some of those characters changed hands',
        },
      ],
    });
  });

  it('not owned', async () => {
    const character: Character = {
      id: '1',
      packId: 'anilist',
      name: {
        english: 'title',
      },
      description: 'description',
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: '2',
              packId: 'anilist',
              type: MediaType.Anime,
              title: {
                english: 'media',
              },
            },
          },
        ],
      },
    };

    const character2: Character = {
      id: '2',
      packId: 'anilist',
      name: {
        english: 'title 2',
      },
      description: 'description 2',
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: '3',
              packId: 'anilist',
              type: MediaType.Anime,
              title: {
                english: 'media 2',
              },
            },
          },
        ],
      },
    };

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'getInventory')
      .mockReturnValueOnce({ inventory: 'inventory' } as any)
      .mockReturnValueOnce({ inventory: 'targetInventory' } as any);

    vi.spyOn(db, 'tradeCharacters').mockImplementation(() => {
      throw new NonFetalError('CHARACTER_NOT_OWNED');
    });

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    vi.spyOn(packs, 'characters').mockResolvedValue([character, character2]);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = trade.accepted({
      token: 'test_token',
      userId: 'user_id',
      targetId: 'target_id',
      guildId: 'guild_id',
      giveCharactersIds: ['anilist:1', 'anilist:1'],
      takeCharactersIds: ['anilist:2', 'anilist:2'],
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

    expect(fetchStub).toHaveBeenNthCalledWith(
      1,
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const body = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );

    expect(body).toEqual({
      attachments: [],
      components: [],
      embeds: [
        {
          type: 'rich',
          description: 'Some of those characters changed hands',
        },
      ],
    });
  });

  it('in party', async () => {
    const character: Character = {
      id: '1',
      packId: 'anilist',
      name: {
        english: 'title',
      },
      description: 'description',
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: '2',
              packId: 'anilist',
              type: MediaType.Anime,
              title: {
                english: 'media',
              },
            },
          },
        ],
      },
    };

    const character2: Character = {
      id: '2',
      packId: 'anilist',
      name: {
        english: 'title 2',
      },
      description: 'description 2',
      media: {
        edges: [
          {
            role: CharacterRole.Main,
            node: {
              id: '3',
              packId: 'anilist',
              type: MediaType.Anime,
              title: {
                english: 'media 2',
              },
            },
          },
        ],
      },
    };

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(db, 'getInventory')
      .mockReturnValueOnce({ inventory: 'inventory' } as any)
      .mockReturnValueOnce({ inventory: 'targetInventory' } as any);

    vi.spyOn(db, 'tradeCharacters').mockImplementation(() => {
      throw new NonFetalError('CHARACTER_IN_PARTY');
    });

    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);

    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    vi.spyOn(packs, 'characters').mockResolvedValue([character, character2]);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = trade.accepted({
      token: 'test_token',
      userId: 'user_id',
      targetId: 'target_id',
      guildId: 'guild_id',
      giveCharactersIds: ['anilist:1', 'anilist:1'],
      takeCharactersIds: ['anilist:2', 'anilist:2'],
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

    expect(fetchStub).toHaveBeenNthCalledWith(
      1,
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const body = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );

    expect(body).toEqual({
      attachments: [],
      components: [],
      embeds: [
        {
          type: 'rich',
          description: 'Some of those characters are currently in parties',
        },
      ],
    });
  });
});

describe('/give', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it('normal', async () => {
    vi.useFakeTimers();

    vi.spyOn(packs, 'characters')
      .mockReturnValueOnce(
        Promise.resolve([
          {
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
          },
        ])
      )
      .mockReturnValueOnce(
        Promise.resolve([
          {
            id: '2',
            packId: 'id',
            description: 'long description 2',
            name: {
              english: 'full name 2',
            },
            images: [
              {
                url: 'image_url2',
              },
            ],
          },
        ])
      );

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(packs, 'aggregate').mockImplementation(({ character }) =>
      Promise.resolve(character)
    );

    vi.spyOn(db, 'getInventory')
      .mockReturnValueOnce({ party: {}, user: { discordId: 'user-1' } } as any)
      .mockReturnValueOnce({ party: {}, user: { discordId: 'user-2' } } as any);

    vi.spyOn(db, 'getUserCharacters')
      .mockReturnValueOnce([
        {
          characterId: 'id:1',
          mediaId: 'media_id',
          rating: 2,
        },
        {
          characterId: 'id:2',
          mediaId: 'media_id',
          rating: 2,
        },
      ] as any)
      .mockReturnValueOnce([] as any);

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = trade.pre({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      targetId: 'another_user_id',
      give: ['id:1', 'id:2'],
      take: [],
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

    expect(fetchStub).toHaveBeenNthCalledWith(
      1,
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const body = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );

    expect(body).toEqual({
      attachments: [
        { filename: 'image-url.webp', id: '0' },
        { filename: 'image-url2.webp', id: '1' },
      ],
      embeds: [
        {
          type: 'rich',
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
          fields: [
            {
              name: 'full name',
              value: '\u200B',
            },
            {
              name: '\u200B',
              value: '<:remove:1099004424111792158>',
            },
          ],
        },
        {
          type: 'rich',
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          thumbnail: {
            url: 'attachment://image-url2.webp',
          },
          fields: [
            {
              name: 'full name 2',
              value: '\u200B',
            },
            {
              name: '\u200B',
              value: '<:remove:1099004424111792158>',
            },
          ],
        },
        {
          type: 'rich',
          description:
            'Are you sure you want to give **full name, full name 2** <:remove:1099004424111792158> to <@another_user_id> for free?',
        },
      ],
      components: [
        {
          type: 1,
          components: [
            {
              custom_id: 'give=user_id=another_user_id=id:1&id:2',
              label: 'Confirm',
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
        },
      ],
    });

    delete config.appId;
    delete config.origin;
    delete config.trading;
  });

  it('gifting yourself', () => {
    const message = trade.pre({
      userId: 'user_id',
      guildId: 'guild_id',

      token: 'test_token',
      targetId: 'user_id',
      give: ['give_character_id'],
      take: [],
    });

    expect(message.json()).toEqual({
      type: 4,
      data: {
        flags: 64,
        attachments: [],
        components: [],
        embeds: [
          {
            type: 'rich',
            description: "You can't gift yourself!",
          },
        ],
      },
    });
  });

  it('not owned', async () => {
    vi.useFakeTimers();

    vi.spyOn(packs, 'characters')
      .mockReturnValueOnce(
        Promise.resolve([
          {
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
          },
        ])
      )
      .mockReturnValueOnce(
        Promise.resolve([
          {
            id: '2',
            packId: 'id',
            description: 'long description 2',
            name: {
              english: 'full name 2',
            },
            images: [
              {
                url: 'image_url2',
              },
            ],
          },
        ])
      );

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(packs, 'aggregate').mockImplementation(({ character }) =>
      Promise.resolve(character)
    );

    vi.spyOn(db, 'getInventory')
      .mockReturnValueOnce({ party: {}, user: { discordId: 'user-1' } } as any)
      .mockReturnValueOnce({ party: {}, user: { discordId: 'user-2' } } as any);

    vi.spyOn(db, 'getUserCharacters')
      .mockReturnValueOnce([] as any)
      .mockReturnValueOnce([] as any);

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = trade.pre({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      targetId: 'another_user_id',
      give: ['id:1', 'id:2'],
      take: [],
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

    expect(fetchStub).toHaveBeenNthCalledWith(
      1,
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const body = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );

    expect(body).toEqual({
      attachments: [
        { filename: 'image-url.webp', id: '0' },
        { filename: 'image-url2.webp', id: '1' },
      ],
      components: [],
      embeds: [
        {
          type: 'rich',
          description: "You don't own full name",
        },
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
        },
        {
          type: 'rich',
          description: "You don't own full name 2",
        },
        {
          type: 'rich',
          description:
            '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          thumbnail: {
            url: 'attachment://image-url2.webp',
          },
          fields: [
            {
              name: 'full name 2',
              value: '\u200B',
            },
          ],
        },
      ],
    });

    delete config.appId;
    delete config.origin;
    delete config.trading;
  });

  it('in party', async () => {
    vi.useFakeTimers();

    vi.spyOn(packs, 'characters')
      .mockReturnValueOnce(
        Promise.resolve([
          {
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
          },
        ])
      )
      .mockReturnValueOnce(
        Promise.resolve([
          {
            id: '2',
            packId: 'id',
            description: 'long description 2',
            name: {
              english: 'full name 2',
            },
            images: [
              {
                url: 'image_url2',
              },
            ],
          },
        ])
      );

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(packs, 'aggregate').mockImplementation(({ character }) =>
      Promise.resolve(character)
    );

    vi.spyOn(db, 'getInventory')
      .mockReturnValueOnce({
        party: {
          member1: { characterId: 'id:1' },
          member5: { characterId: 'id:2' },
        },
        user: { discordId: 'user-1' },
      } as any)
      .mockReturnValueOnce({ party: {}, user: { discordId: 'user-2' } } as any);

    vi.spyOn(db, 'getUserCharacters')
      .mockReturnValueOnce([
        {
          characterId: 'id:1',
          mediaId: 'media_id',
          rating: 2,
        },
        {
          characterId: 'id:2',
          mediaId: 'media_id',
          rating: 2,
        },
      ] as any)
      .mockReturnValueOnce([] as any);

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = trade.pre({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      targetId: 'another_user_id',
      give: ['id:1', 'id:2'],
      take: [],
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

    expect(fetchStub).toHaveBeenNthCalledWith(
      1,
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const body = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );

    expect(body).toEqual({
      attachments: [
        { filename: 'image-url.webp', id: '0' },
        { filename: 'image-url2.webp', id: '1' },
      ],
      components: [],
      embeds: [
        {
          type: 'rich',
          description: "full name is in your party and can't be traded",
        },
        {
          type: 'rich',
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
          fields: [
            {
              name: 'full name',
              value: '\u200B',
            },
          ],
        },
        {
          type: 'rich',
          description: "full name 2 is in your party and can't be traded",
        },
        {
          type: 'rich',
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          thumbnail: {
            url: 'attachment://image-url2.webp',
          },
          fields: [
            {
              name: 'full name 2',
              value: '\u200B',
            },
          ],
        },
      ],
    });

    delete config.appId;
    delete config.origin;
    delete config.trading;
  });
});

describe('/trade', () => {
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
    };

    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(packs, 'aggregate').mockImplementation(({ character }) =>
      Promise.resolve(character)
    );

    vi.spyOn(db, 'getInventory')
      .mockReturnValueOnce({ party: {}, user: { discordId: 'user-1' } } as any)
      .mockReturnValueOnce({ party: {}, user: { discordId: 'user-2' } } as any);

    vi.spyOn(db, 'getUserCharacters')
      .mockReturnValueOnce([
        {
          characterId: 'id:1',
          mediaId: 'media_id',
          rating: 2,
        },
      ] as any)
      .mockReturnValueOnce([
        {
          characterId: 'id:1',
          mediaId: 'media_id',
          rating: 2,
        },
      ] as any);

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = trade.pre({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      targetId: 'another_user_id',
      give: ['id:1'],
      take: ['id:1'],
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

    expect(fetchStub).toHaveBeenNthCalledWith(
      1,
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const body = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );

    expect(body).toEqual({
      content: '<@another_user_id>',
      attachments: [
        { filename: 'image-url.webp', id: '0' },
        { filename: 'image-url.webp', id: '1' },
      ],
      embeds: [
        {
          type: 'rich',
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
          fields: [
            {
              name: 'full name',
              value: '\u200B',
            },
            {
              name: '\u200B',
              value: '<:remove:1099004424111792158>',
            },
          ],
        },
        {
          type: 'rich',
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
          fields: [
            {
              name: 'full name',
              value: '\u200B',
            },
            {
              name: '\u200B',
              value: '<:add:1099004747123523644>',
            },
          ],
        },
        {
          type: 'rich',
          description:
            '<@user_id> is offering that you lose **full name** <:remove:1099004424111792158> and get **full name** <:add:1099004747123523644>',
        },
      ],
      components: [
        {
          type: 1,
          components: [
            {
              custom_id: 'trade=user_id=another_user_id=id:1=id:1',
              label: 'Accept',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'cancel=user_id=another_user_id',
              label: 'Decline',
              style: 4,
              type: 2,
            },
          ],
        },
      ],
    });

    expect(fetchStub).toHaveBeenNthCalledWith(
      2,
      'https://discord.com/api/v10/webhooks/app_id/test_token',
      expect.objectContaining({
        method: 'POST',
      })
    );

    const body1 = JSON.parse(
      (fetchStub.mock.calls[1][1]?.body as FormData)?.get('payload_json') as any
    );

    expect(body1).toEqual({
      content: '<@another_user_id> you received an offer!',
      attachments: [],
      components: [],
      embeds: [],
    });

    delete config.appId;
    delete config.origin;
    delete config.trading;
  });

  it('repeated characters', async () => {
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
    };

    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(packs, 'aggregate').mockImplementation(({ character }) =>
      Promise.resolve(character)
    );

    vi.spyOn(db, 'getInventory')
      .mockReturnValueOnce({ party: {}, user: { discordId: 'user-1' } } as any)
      .mockReturnValueOnce({ party: {}, user: { discordId: 'user-2' } } as any);

    vi.spyOn(db, 'getUserCharacters')
      .mockReturnValueOnce([
        {
          characterId: 'id:1',
          mediaId: 'media_id',
          rating: 2,
        },
      ] as any)
      .mockReturnValueOnce([
        {
          characterId: 'id:1',
          mediaId: 'media_id',
          rating: 2,
        },
      ] as any);

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = trade.pre({
      userId: 'user_id',
      guildId: 'guild_id',

      token: 'test_token',
      targetId: 'another_user_id',
      give: ['id:1', 'id:1'],
      take: ['id:1', 'id:1'],
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

    expect(fetchStub).toHaveBeenNthCalledWith(
      1,
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const body = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );

    expect(body).toEqual({
      content: '<@another_user_id>',
      attachments: [
        { filename: 'image-url.webp', id: '0' },
        { filename: 'image-url.webp', id: '1' },
      ],
      embeds: [
        {
          type: 'rich',
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
          fields: [
            {
              name: 'full name',
              value: '\u200B',
            },
            {
              name: '\u200B',
              value: '<:remove:1099004424111792158>',
            },
          ],
        },
        {
          type: 'rich',
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
          fields: [
            {
              name: 'full name',
              value: '\u200B',
            },
            {
              name: '\u200B',
              value: '<:add:1099004747123523644>',
            },
          ],
        },
        {
          type: 'rich',
          description:
            '<@user_id> is offering that you lose **full name** <:remove:1099004424111792158> and get **full name** <:add:1099004747123523644>',
        },
      ],
      components: [
        {
          type: 1,
          components: [
            {
              custom_id: 'trade=user_id=another_user_id=id:1=id:1',
              label: 'Accept',
              style: 2,
              type: 2,
            },
            {
              custom_id: 'cancel=user_id=another_user_id',
              label: 'Decline',
              style: 4,
              type: 2,
            },
          ],
        },
      ],
    });

    expect(fetchStub).toHaveBeenNthCalledWith(
      2,
      'https://discord.com/api/v10/webhooks/app_id/test_token',
      expect.objectContaining({
        method: 'POST',
      })
    );

    const body1 = JSON.parse(
      (fetchStub.mock.calls[1][1]?.body as FormData)?.get('payload_json') as any
    );

    expect(body1).toEqual({
      content: '<@another_user_id> you received an offer!',
      attachments: [],
      components: [],
      embeds: [],
    });

    delete config.appId;
    delete config.origin;
    delete config.trading;
  });

  it('not owned', async () => {
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
    };

    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(packs, 'aggregate').mockImplementation(({ character }) =>
      Promise.resolve(character)
    );

    vi.spyOn(db, 'getInventory')
      .mockReturnValueOnce({ party: {}, user: { discordId: 'user-1' } } as any)
      .mockReturnValueOnce({ party: {}, user: { discordId: 'user-2' } } as any);

    vi.spyOn(db, 'getUserCharacters')
      .mockReturnValueOnce([
        {
          characterId: 'id:1',
          mediaId: 'media_id',
          rating: 2,
        },
      ] as any)
      .mockReturnValueOnce([] as any);

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = trade.pre({
      userId: 'user_id',
      guildId: 'guild_id',

      token: 'test_token',
      targetId: 'another_user_id',
      give: ['id:1'],
      take: ['id:1'],
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

    expect(fetchStub).toHaveBeenNthCalledWith(
      1,
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const body = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );

    expect(body).toEqual({
      attachments: [{ filename: 'image-url.webp', id: '0' }],
      components: [],
      embeds: [
        {
          type: 'rich',
          description: "<@another_user_id> doesn't own full name",
        },
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
        },
      ],
    });

    delete config.appId;
    delete config.origin;
    delete config.trading;
  });

  it('in party', async () => {
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
    };

    vi.spyOn(packs, 'characters').mockResolvedValue([character]);

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    vi.spyOn(packs, 'aggregate').mockImplementation(({ character }) =>
      Promise.resolve(character)
    );

    vi.spyOn(db, 'getInventory')
      .mockReturnValueOnce({ party: {}, user: { discordId: 'user-1' } } as any)
      .mockReturnValueOnce({
        party: {
          member1: { characterId: 'id:1' },
        },
        user: { discordId: 'user-2' },
      } as any);

    vi.spyOn(db, 'getUserCharacters')
      .mockReturnValueOnce([
        {
          characterId: 'id:1',
          mediaId: 'media_id',
          rating: 2,
        },
      ] as any)
      .mockReturnValueOnce([
        {
          characterId: 'id:1',
          mediaId: 'media_id',
          rating: 2,
        },
      ] as any);

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = trade.pre({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      targetId: 'another_user_id',
      give: ['id:1'],
      take: ['od:1'],
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

    expect(fetchStub).toHaveBeenNthCalledWith(
      1,
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const body = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );

    expect(body).toEqual({
      components: [],
      attachments: [{ filename: 'image-url.webp', id: '0' }],
      embeds: [
        {
          type: 'rich',
          description:
            "full name is in <@another_user_id>'s party and can't be traded",
        },
        {
          type: 'rich',
          description:
            '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
          fields: [
            {
              name: 'full name',
              value: '\u200B',
            },
          ],
        },
      ],
    });

    delete config.appId;
    delete config.origin;
    delete config.trading;
  });

  it('trading with yourself', () => {
    const message = trade.pre({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      targetId: 'user_id',
      give: ['id:1'],
      take: ['id:1'],
    });

    expect(message.json()).toEqual({
      type: 4,
      data: {
        flags: 64,
        attachments: [],
        components: [],
        embeds: [
          {
            type: 'rich',
            description: "You can't trade with yourself!",
          },
        ],
      },
    });
  });

  it('disabled', async () => {
    vi.spyOn(packs, 'characters').mockResolvedValue([]);

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = trade.pre({
      userId: 'user_id',
      guildId: 'guild_id',
      token: 'test_token',
      targetId: 'another_user_id',
      give: ['id:1'],
      take: ['id:1'],
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

    expect(fetchStub).toHaveBeenNthCalledWith(
      1,
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({
        method: 'PATCH',
      })
    );

    const body = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );

    expect(body).toEqual({
      attachments: [],
      components: [],
      embeds: [
        {
          type: 'rich',
          description: 'Some of those characters do not exist or are disabled',
        },
      ],
    });

    delete config.appId;
    delete config.origin;
    delete config.trading;
  });

  it('under maintenance', () => {
    config.trading = false;

    try {
      expect(() =>
        trade.pre({
          userId: 'user_id',
          guildId: 'guild_id',

          token: 'test_token',
          targetId: 'another_user_id',
          give: ['character_id'],
          take: [],
        })
      ).toThrowError(
        new NonFetalError('Trading is under maintenance, try again later!')
      );
    } finally {
      delete config.trading;
    }
  });
});
