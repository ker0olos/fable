/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';

import utils from '~/src/utils.ts';

import packs from '~/src/packs.ts';
import gacha from '~/src/gacha.ts';

import config from '~/src/config.ts';

import Rating from '~/src/rating.ts';

import merge from '~/src/merge.ts';

import db from '~/db/index.ts';

import searchIndex, { IndexedCharacter } from '~/search-index-mod/mod.ts';

import {
  Character,
  CharacterRole,
  Media,
  MediaFormat,
  MediaType,
} from '~/src/types.ts';

import { NonFetalError, PoolError } from '~/src/errors.ts';

describe('auto merge', () => {
  it('5 ones', async () => {
    const characters = Array(25)
      .fill({})
      .map((_, i) => ({
        rating: 1,
        characterId: `id:${i}`,
      }));

    const { sacrifices } = merge.getSacrifices(characters as any, 'target', 2);

    expect(sacrifices.filter(({ rating }) => rating === 1).length).toBe(5);
    expect(sacrifices.filter(({ rating }) => rating === 2).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 3).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 4).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 5).length).toBe(0);

    expect(sacrifices).toMatchSnapshot();
  });

  it('25 ones', async () => {
    const characters = Array(25)
      .fill({})
      .map((_, i) => ({
        rating: 1,
        id: `id:${i}`,
      }));

    const { sacrifices } = merge.getSacrifices(characters as any, 'target', 3);

    expect(sacrifices.filter(({ rating }) => rating === 1).length).toBe(25);
    expect(sacrifices.filter(({ rating }) => rating === 2).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 3).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 4).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 5).length).toBe(0);

    expect(sacrifices).toMatchSnapshot();
  });

  it('5 twos', async () => {
    const characters = Array(25)
      .fill({})
      .map((_, i) => ({
        rating: 2,
        characterId: `id:${i}`,
        mediaId: 'media_id',
        user: { discordId: 'user_id' },
      }));

    const { sacrifices } = merge.getSacrifices(characters as any, 'target', 3);

    expect(sacrifices.filter(({ rating }) => rating === 1).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 2).length).toBe(5);
    expect(sacrifices.filter(({ rating }) => rating === 3).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 4).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 5).length).toBe(0);

    expect(sacrifices).toMatchSnapshot();
  });

  it('20 ones + 1 two', async () => {
    const characters = Array(20)
      .fill({})
      .map((_, i) => ({
        rating: 1,
        characterId: `id:${i}`,
        mediaId: 'media_id',
        user: { discordId: 'user_id' },
      }))
      .concat([
        {
          rating: 2,
          characterId: `id:20`,
          mediaId: 'media_id',
          user: { discordId: 'user_id' },
        },
      ]);

    const { sacrifices } = merge.getSacrifices(characters as any, 'target', 3);

    expect(sacrifices.filter(({ rating }) => rating === 1).length).toBe(20);
    expect(sacrifices.filter(({ rating }) => rating === 2).length).toBe(1);
    expect(sacrifices.filter(({ rating }) => rating === 3).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 4).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 5).length).toBe(0);

    expect(sacrifices).toMatchSnapshot();
  });

  it('625 ones', async () => {
    const characters = Array(625)
      .fill({})
      .map((_, i) => ({
        rating: 1,
        characterId: `id:${i}`,
        mediaId: 'media_id',
        user: { discordId: 'user_id' },
      }))
      .concat([
        {
          rating: 4,
          characterId: `id:20`,
          mediaId: 'media_id',
          user: { discordId: 'user_id' },
        },
      ]);

    const { sacrifices } = merge.getSacrifices(characters as any, 'target', 5);

    expect(sacrifices.filter(({ rating }) => rating === 1).length).toBe(625);
    expect(sacrifices.filter(({ rating }) => rating === 2).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 3).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 4).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 5).length).toBe(0);

    expect(sacrifices).toMatchSnapshot();
  });

  it('500 ones + 5 threes', async () => {
    const characters = Array(500)
      .fill({})
      .map((_, i) => ({
        rating: 1,
        characterId: `id:${i}`,
        mediaId: 'media_id',
        user: { discordId: 'user_id' },
      }))
      .concat(
        Array(25)
          .fill({})
          .map((_, i) => ({
            rating: 3,
            characterId: `id:${i}`,
            mediaId: 'media_id',
            user: { discordId: 'user_id' },
          }))
      );

    const { sacrifices } = merge.getSacrifices(characters as any, 'target', 5);

    expect(sacrifices.filter(({ rating }) => rating === 1).length).toBe(500);
    expect(sacrifices.filter(({ rating }) => rating === 2).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 3).length).toBe(5);
    expect(sacrifices.filter(({ rating }) => rating === 4).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 5).length).toBe(0);

    expect(sacrifices).toMatchSnapshot();
  });

  it('5 fours', async () => {
    const characters = Array(25)
      .fill({})
      .map((_, i) => ({
        rating: 4,
        characterId: `id:${i}`,
        mediaId: 'media_id',
        user: { discordId: 'user_id' },
      }));

    const { sacrifices } = merge.getSacrifices(characters as any, 'target', 5);

    expect(sacrifices.filter(({ rating }) => rating === 1).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 2).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 3).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 4).length).toBe(5);
    expect(sacrifices.filter(({ rating }) => rating === 5).length).toBe(0);

    expect(sacrifices).toMatchSnapshot();
  });

  it('5 fives', () => {
    const characters = Array(25)
      .fill({})
      .map((_, i) => ({
        rating: 5,
        characterId: `id:${i}`,
        mediaId: 'media_id',
        user: { discordId: 'user_id' },
      }));

    const { sacrifices } = merge.getSacrifices(characters as any, 'target', 5);

    expect(sacrifices.filter(({ rating }) => rating === 1).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 2).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 3).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 4).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 5).length).toBe(5);

    expect(sacrifices).toMatchSnapshot();
  });

  it('4 fours + 1 five', () => {
    const characters = Array(4)
      .fill({})
      .map((_, i) => ({
        rating: 4,
        characterId: `id:${i}`,
        mediaId: 'media_id',
        user: { discordId: 'user_id' },
      }));

    characters.push({
      rating: 5,
      characterId: 'id:4',
      mediaId: 'media_id',
      user: { discordId: 'user_id' },
    });

    const { sacrifices } = merge.getSacrifices(characters as any, 'target', 5);

    expect(sacrifices.filter(({ rating }) => rating === 1).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 2).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 3).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 4).length).toBe(4);
    expect(sacrifices.filter(({ rating }) => rating === 5).length).toBe(1);

    expect(sacrifices).toMatchSnapshot();
  });

  it('4 fives + 1 four', () => {
    const characters = Array(4)
      .fill({})
      .map((_, i) => ({
        rating: 5,
        characterId: `id:${i}`,
        mediaId: 'media_id',
        user: { discordId: 'user_id' },
      }));

    characters.push({
      rating: 4,
      characterId: 'id:4',
      mediaId: 'media_id',
      user: { discordId: 'user_id' },
    });

    const { sacrifices } = merge.getSacrifices(characters as any, 'target', 5);

    expect(sacrifices.filter(({ rating }) => rating === 1).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 2).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 3).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 4).length).toBe(1);
    expect(sacrifices.filter(({ rating }) => rating === 5).length).toBe(4);

    expect(sacrifices).toMatchSnapshot();
  });

  it('min', async () => {
    const characters = Array(25)
      .fill({})
      .map((_, i) => ({
        rating: 1,
        characterId: `id:${i}`,
        mediaId: 'media_id',
        user: { discordId: 'user_id' },
      }));

    const { sacrifices, target } = merge.getSacrifices(
      characters as any,
      'min'
    );

    expect(target).toBe(2);
    expect(sacrifices.filter(({ rating }) => rating === 1).length).toBe(5);
    expect(sacrifices.filter(({ rating }) => rating === 2).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 3).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 4).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 5).length).toBe(0);

    expect(sacrifices).toMatchSnapshot();
  });

  it('max', async () => {
    const characters = Array(25)
      .fill({})
      .map((_, i) => ({
        rating: 1,
        characterId: `id:${i}`,
        mediaId: 'media_id',
        user: { discordId: 'user_id' },
      }));

    const { sacrifices, target } = merge.getSacrifices(
      characters as any,
      'max'
    );

    expect(target).toBe(3);
    expect(sacrifices.filter(({ rating }) => rating === 1).length).toBe(25);
    expect(sacrifices.filter(({ rating }) => rating === 2).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 3).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 4).length).toBe(0);
    expect(sacrifices.filter(({ rating }) => rating === 5).length).toBe(0);

    expect(sacrifices).toMatchSnapshot();
  });
});

describe('synthesis confirmed', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();

    // Clean up config modifications
    delete config.appId;
    delete config.origin;
    delete config.synthesis;
  });

  it('normal', async () => {
    const media: Media = {
      id: '2',
      packId: 'anilist',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      popularity: 150_000,
      title: {
        english: 'title',
      },
      images: [{ url: 'media_image_url' }],
    };

    const character: Character = {
      id: '1',
      packId: 'anilist',
      name: {
        english: 'name',
      },
      images: [{ url: 'character_image_url' }],
      media: {
        edges: [
          {
            role: CharacterRole.Supporting,
            node: media,
          },
        ],
      },
    };

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'getActiveUsersIfLiked').mockResolvedValue([]);
    vi.spyOn(db, 'addCharacter').mockResolvedValue({ ok: true } as any);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'characters').mockResolvedValue([character]);
    vi.spyOn(searchIndex, 'pool').mockResolvedValue(
      new Map([
        [
          '',
          [
            new IndexedCharacter(
              'anilist:1',
              '',
              [],
              [],
              0,
              2,
              CharacterRole.Main
            ),
          ],
        ],
      ])
    );
    vi.spyOn(merge, 'getFilteredCharacters').mockResolvedValue([
      {
        characterId: 'anilist:1',
        rating: 1,
      },
      {
        characterId: 'anilist:2',
        rating: 1,
      },
      {
        characterId: 'anilist:3',
        rating: 1,
      },
      {
        characterId: 'anilist:4',
        rating: 1,
      },
      {
        characterId: 'anilist:5',
        rating: 1,
      },
    ] as any);
    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);
    vi.spyOn(db, 'findGuildCharacters').mockResolvedValue([]);
    vi.spyOn(db, 'findCharacter').mockResolvedValue([]);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = merge.confirmed({
      token: 'test_token',
      userId: 'user_id',
      guildId: 'guild_id',
      target: 2,
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

    expect(fetchStub).toHaveBeenCalledTimes(3);
    expect(fetchStub).toHaveBeenNthCalledWith(
      1,
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({ method: 'PATCH' })
    );

    const firstCallBody = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );
    expect(firstCallBody).toEqual({
      attachments: [{ filename: 'media-image-url.webp', id: '0' }],
      components: [],
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
      expect.objectContaining({ method: 'PATCH' })
    );

    const secondCallBody = JSON.parse(
      (fetchStub.mock.calls[1][1]?.body as FormData)?.get('payload_json') as any
    );
    expect(secondCallBody).toEqual({
      embeds: [
        {
          type: 'rich',
          image: {
            url: 'attachment://2.gif',
          },
        },
      ],
      components: [],
      attachments: [{ filename: '2.gif', id: '0' }],
    });

    expect(fetchStub).toHaveBeenNthCalledWith(
      3,
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({ method: 'PATCH' })
    );

    const thirdCallBody = JSON.parse(
      (fetchStub.mock.calls[2][1]?.body as FormData)?.get('payload_json') as any
    );
    expect(thirdCallBody).toEqual({
      attachments: [{ filename: 'character-image-url.webp', id: '0' }],
      embeds: [
        {
          type: 'rich',
          description: new Rating({ stars: 2 }).emotes,
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
        },
      ],
    });
  });

  it('liked', async () => {
    const media: Media = {
      id: '2',
      packId: 'anilist',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      popularity: 150_000,
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
      id: '1',
      packId: 'anilist',
      name: {
        english: 'name',
      },
      images: [{ url: 'character_image_url' }],
      media: {
        edges: [
          {
            role: CharacterRole.Supporting,
            node: media,
          },
        ],
      },
    };

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'getActiveUsersIfLiked').mockResolvedValue([
      'another_user_id',
    ]);
    vi.spyOn(db, 'addCharacter').mockResolvedValue({ ok: true } as any);
    vi.spyOn(packs, 'characters').mockResolvedValue([character]);
    vi.spyOn(searchIndex, 'pool').mockResolvedValue(
      new Map([
        [
          '',
          [
            new IndexedCharacter(
              'anilist:1',
              '',
              [],
              [],
              0,
              2,
              CharacterRole.Main
            ),
          ],
        ],
      ])
    );
    vi.spyOn(merge, 'getFilteredCharacters').mockResolvedValue([
      {
        characterId: 'anilist:1',
        rating: 1,
      },
      {
        characterId: 'anilist:2',
        rating: 1,
      },
      {
        characterId: 'anilist:3',
        rating: 1,
      },
      {
        characterId: 'anilist:4',
        rating: 1,
      },
      {
        characterId: 'anilist:5',
        rating: 1,
      },
    ] as any);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);
    vi.spyOn(db, 'findGuildCharacters').mockResolvedValue([]);
    vi.spyOn(db, 'findCharacter').mockResolvedValue([]);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = merge.confirmed({
      token: 'test_token',
      userId: 'user_id',
      guildId: 'guild_id',
      target: 2,
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

    expect(fetchStub).toHaveBeenCalledTimes(4);

    // Check the fourth call which notifies the user who liked the character
    expect(fetchStub).toHaveBeenNthCalledWith(
      4,
      'https://discord.com/api/v10/webhooks/app_id/test_token',
      expect.objectContaining({ method: 'POST' })
    );

    const fourthCallBody = JSON.parse(
      (fetchStub.mock.calls[3][1]?.body as FormData)?.get('payload_json') as any
    );
    expect(fourthCallBody).toEqual({
      components: [],
      attachments: [{ filename: 'character-image-url.webp', id: '0' }],
      content: '<@another_user_id>',
      embeds: [
        {
          type: 'rich',
          description:
            '<@user_id>\n\n<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
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
  });

  it('not enough sacrifices', async () => {
    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);
    vi.spyOn(merge, 'getFilteredCharacters').mockResolvedValue([
      {
        characterId: 'anilist:1',
        rating: 1,
      },
      {
        characterId: 'anilist:2',
        rating: 1,
      },
      {
        characterId: 'anilist:3',
        rating: 1,
      },
      {
        characterId: 'anilist:4',
        rating: 1,
      },
    ] as any);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = merge.confirmed({
      token: 'test_token',
      userId: 'user_id',
      guildId: 'guild_id',
      target: 2,
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

    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(fetchStub).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({ method: 'PATCH' })
    );

    const callBody = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );
    expect(callBody).toEqual({
      embeds: [
        {
          type: 'rich',
          description:
            'You only have **4 out the 5** sacrifices needed for 2<:smolstar:1107503653956374638>',
        },
      ],
      components: [],
      attachments: [],
    });
  });

  it('pool error', async () => {
    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);
    vi.spyOn(gacha, 'rngPull').mockRejectedValue(new PoolError());
    vi.spyOn(merge, 'getFilteredCharacters').mockResolvedValue([
      {
        characterId: 'anilist:1',
        rating: 1,
      },
      {
        characterId: 'anilist:2',
        rating: 1,
      },
      {
        characterId: 'anilist:3',
        rating: 1,
      },
      {
        characterId: 'anilist:4',
        rating: 1,
      },
      {
        characterId: 'anilist:5',
        rating: 1,
      },
    ] as any);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = merge.confirmed({
      token: 'test_token',
      userId: 'user_id',
      guildId: 'guild_id',
      target: 2,
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

    expect(fetchStub).toHaveBeenCalledTimes(1);
    expect(fetchStub).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({ method: 'PATCH' })
    );

    const callBody = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );
    expect(callBody).toEqual({
      embeds: [
        {
          type: 'rich',
          description:
            'There are no more 2<:smolstar:1107503653956374638>characters left',
        },
      ],
      components: [],
      attachments: [],
    });
  });
});

describe('/merge', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();

    // Clean up config modifications
    delete config.appId;
    delete config.origin;
    delete config.synthesis;
  });

  it('normal', async () => {
    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'character 1',
        },
        images: [{ url: 'image_url' }],
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: {
                id: 'anime',
                type: MediaType.Anime,
                title: {
                  english: 'media title',
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
        images: [{ url: 'image_url' }],
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: {
                id: 'anime',
                type: MediaType.Anime,
                title: {
                  english: 'media title',
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
        images: [{ url: 'image_url' }],
        media: {
          edges: [
            {
              role: CharacterRole.Main,
              node: {
                id: 'anime',
                type: MediaType.Anime,
                title: {
                  english: 'media title',
                },
              },
            },
          ],
        },
      },
      {
        id: '4',
        packId: 'anilist',
        name: {
          english: 'character 4',
        },
        images: [{ url: 'image_url' }],
      },
      {
        id: '5',
        packId: 'anilist',
        name: {
          english: 'character 5',
        },
        images: [{ url: 'image_url' }],
      },
    ];

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);
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
        rating: 1,
      },
      {
        characterId: 'anilist:2',
        rating: 1,
      },
      {
        characterId: 'anilist:3',
        rating: 1,
      },
      {
        characterId: 'anilist:4',
        rating: 1,
      },
      {
        characterId: 'anilist:5',
        rating: 1,
      },
    ] as any);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.synthesis = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = await merge.synthesize({
      token: 'test_token',
      userId: 'user_id',
      guildId: 'guild_id',
      mode: 'target',
      target: 2,
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
    expect(fetchStub).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({ method: 'PATCH' })
    );

    const callBody = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );
    expect(callBody).toEqual({
      attachments: [
        {
          filename: 'image-url.webp',
          id: '0',
        },
        {
          filename: 'image-url.webp',
          id: '1',
        },
        {
          filename: 'image-url.webp',
          id: '2',
        },
        {
          filename: 'image-url.webp',
          id: '3',
        },
        {
          filename: 'image-url.webp',
          id: '4',
        },
      ],
      components: [
        {
          type: 1,
          components: [
            {
              custom_id: 'synthesis=user_id=2',
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
      embeds: [
        {
          type: 'rich',
          description: 'Sacrifice **5** characters?',
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'media title',
              value: '1<:smolstar:1107503653956374638>character 1',
            },
          ],
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'media title',
              value: '1<:smolstar:1107503653956374638>character 2',
            },
          ],
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
        },
        {
          type: 'rich',
          fields: [
            {
              name: 'media title',
              value: '1<:smolstar:1107503653956374638>character 3',
            },
          ],
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
        },
        {
          type: 'rich',
          description: '1<:smolstar:1107503653956374638>character 4',
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
        },
        {
          type: 'rich',
          description: '1<:smolstar:1107503653956374638>character 5',
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
        },
      ],
    });
  });

  it('with nicknames', async () => {
    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'character 1',
        },
        images: [{ url: 'image_url' }],
      },
      {
        id: '2',
        packId: 'anilist',
        name: {
          english: 'character 2',
        },
        images: [{ url: 'image_url' }],
      },
      {
        id: '3',
        packId: 'anilist',
        name: {
          english: 'character 3',
        },
        images: [{ url: 'image_url' }],
      },
      {
        id: '4',
        packId: 'anilist',
        name: {
          english: 'character 4',
        },
        images: [{ url: 'image_url' }],
      },
      {
        id: '5',
        packId: 'anilist',
        name: {
          english: 'character 5',
        },
        images: [{ url: 'image_url' }],
      },
    ];

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);
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
        image: 'custom_image_url',
        nickname: 'nickname 1',
        characterId: 'anilist:1',
        rating: 1,
      },
      {
        image: 'custom_image_url',
        nickname: 'nickname 2',
        characterId: 'anilist:2',
        rating: 1,
      },
      {
        image: 'custom_image_url',
        nickname: 'nickname 3',
        characterId: 'anilist:3',
        rating: 1,
      },
      {
        image: 'custom_image_url',
        nickname: 'nickname 4',
        characterId: 'anilist:4',
        rating: 1,
      },
      {
        image: 'custom_image_url',
        nickname: 'nickname 5',
        characterId: 'anilist:5',
        rating: 1,
      },
    ] as any);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);
    vi.spyOn(packs, 'isDisabled').mockReturnValue(false);

    config.synthesis = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = await merge.synthesize({
      token: 'test_token',
      userId: 'user_id',
      guildId: 'guild_id',
      mode: 'target',
      target: 2,
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
    expect(fetchStub).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({ method: 'PATCH' })
    );

    const callBody = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );
    expect(callBody).toEqual({
      attachments: [
        {
          filename: 'custom-image-url.webp',
          id: '0',
        },
        {
          filename: 'custom-image-url.webp',
          id: '1',
        },
        {
          filename: 'custom-image-url.webp',
          id: '2',
        },
        {
          filename: 'custom-image-url.webp',
          id: '3',
        },
        {
          filename: 'custom-image-url.webp',
          id: '4',
        },
      ],
      components: [
        {
          type: 1,
          components: [
            {
              custom_id: 'synthesis=user_id=2',
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
      embeds: [
        {
          type: 'rich',
          description: 'Sacrifice **5** characters?',
        },
        {
          type: 'rich',
          description: '1<:smolstar:1107503653956374638>nickname 1',
          thumbnail: {
            url: 'attachment://custom-image-url.webp',
          },
        },
        {
          type: 'rich',
          description: '1<:smolstar:1107503653956374638>nickname 2',
          thumbnail: {
            url: 'attachment://custom-image-url.webp',
          },
        },
        {
          type: 'rich',
          description: '1<:smolstar:1107503653956374638>nickname 3',
          thumbnail: {
            url: 'attachment://custom-image-url.webp',
          },
        },
        {
          type: 'rich',
          description: '1<:smolstar:1107503653956374638>nickname 4',
          thumbnail: {
            url: 'attachment://custom-image-url.webp',
          },
        },
        {
          type: 'rich',
          description: '1<:smolstar:1107503653956374638>nickname 5',
          thumbnail: {
            url: 'attachment://custom-image-url.webp',
          },
        },
      ],
    });
  });

  it('disabled media', async () => {
    const characters: Character[] = [
      {
        id: '1',
        packId: 'anilist',
        name: {
          english: 'character 1',
        },
        images: [{ url: 'image_url' }],
      },
      {
        id: '2',
        packId: 'anilist',
        name: {
          english: 'character 2',
        },
        images: [{ url: 'image_url' }],
      },
      {
        id: '3',
        packId: 'anilist',
        name: {
          english: 'character 3',
        },
        images: [{ url: 'image_url' }],
      },
      {
        id: '4',
        packId: 'anilist',
        name: {
          english: 'character 4',
        },
        images: [{ url: 'image_url' }],
      },
      {
        id: '5',
        packId: 'anilist',
        name: {
          english: 'character 5',
        },
        images: [{ url: 'image_url' }],
      },
    ];

    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);
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
        mediaId: 'anilist:m',
        characterId: 'anilist:1',
        rating: 1,
      },
      {
        mediaId: 'anilist:m',
        characterId: 'anilist:2',
        rating: 1,
      },
      {
        characterId: 'anilist:3',
        rating: 1,
      },
      {
        characterId: 'anilist:4',
        rating: 1,
      },
      {
        characterId: 'anilist:5',
        rating: 1,
      },
    ] as any);
    vi.spyOn(packs, 'all').mockResolvedValue([
      { manifest: { id: 'anilist' } },
    ] as any);
    vi.spyOn(packs, 'characters').mockResolvedValue(characters);
    vi.spyOn(packs, 'isDisabled').mockImplementation(
      (id) => id === 'anilist:m'
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';
    config.synthesis = true;

    const message = await merge.synthesize({
      token: 'test_token',
      userId: 'user_id',
      guildId: 'guild_id',
      mode: 'target',
      target: 2,
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
    expect(fetchStub).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({ method: 'PATCH' })
    );

    const callBody = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );
    expect(callBody).toEqual({
      attachments: [
        {
          filename: 'image-url.webp',
          id: '0',
        },
        {
          filename: 'image-url.webp',
          id: '1',
        },
        {
          filename: 'image-url.webp',
          id: '2',
        },
      ],
      components: [
        {
          type: 1,
          components: [
            {
              custom_id: 'synthesis=user_id=2',
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
      embeds: [
        {
          type: 'rich',
          description: 'Sacrifice **5** characters?',
        },
        {
          type: 'rich',
          description: '1<:smolstar:1107503653956374638>character 3',
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
        },
        {
          type: 'rich',
          description: '1<:smolstar:1107503653956374638>character 4',
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
        },
        {
          type: 'rich',
          description: '1<:smolstar:1107503653956374638>character 5',
          thumbnail: {
            url: 'attachment://image-url.webp',
          },
        },
        {
          type: 'rich',
          description: '_+2 others..._',
        },
      ],
    });
  });

  it('filter (party)', async () => {
    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);
    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'getInventory').mockReturnValue({
      user: { likes: [] },
      party: {
        member1: {
          characterId: 'anilist:1',
        },
        member2: {
          characterId: 'anilist:2',
        },
        member3: {
          characterId: 'anilist:3',
        },
        member4: {
          characterId: 'anilist:4',
        },
        member5: {
          characterId: 'anilist:5',
        },
      },
    } as any);
    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      {
        characterId: 'anilist:1',
        mediaId: 'pack-id:1',
        rating: 1,
      },
      {
        characterId: 'anilist:2',
        mediaId: 'pack-id:1',
        rating: 1,
      },
      {
        characterId: 'anilist:3',
        mediaId: 'pack-id:1',
        rating: 1,
      },
      {
        characterId: 'anilist:4',
        mediaId: 'pack-id:1',
        rating: 1,
      },
      {
        characterId: 'anilist:5',
        mediaId: 'pack-id:2',
        rating: 1,
      },
      {
        characterId: 'anilist:6',
        mediaId: 'pack-id:1',
        rating: 1,
      },
      {
        characterId: 'anilist:7',
        mediaId: 'pack-id:1',
        rating: 1,
      },
      {
        characterId: 'anilist:8',
        mediaId: 'pack-id:1',
        rating: 1,
      },
      {
        characterId: 'anilist:9',
        mediaId: 'pack-id:1',
        rating: 1,
      },
    ] as any);
    vi.spyOn(packs, 'all').mockResolvedValue([]);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';
    config.synthesis = true;

    const message = await merge.synthesize({
      token: 'test_token',
      userId: 'user_id',
      guildId: 'guild_id',
      mode: 'target',
      target: 2,
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
    expect(fetchStub).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({ method: 'PATCH' })
    );

    const callBody = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );
    expect(callBody).toEqual({
      attachments: [],
      components: [],
      embeds: [
        {
          type: 'rich',
          description:
            'You only have **4 out the 5** sacrifices needed for 2<:smolstar:1107503653956374638>',
        },
      ],
    });
  });

  it('filter (liked characters)', async () => {
    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);
    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {},
      user: {
        likes: [
          { characterId: 'anilist:1' },
          { characterId: 'anilist:2' },
          { characterId: 'anilist:3' },
          { characterId: 'anilist:4' },
          { characterId: 'anilist:5' },
        ],
      },
    } as any);
    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      {
        characterId: 'anilist:1',
        mediaId: 'pack-id:1',
        rating: 1,
      },
      {
        characterId: 'anilist:2',
        mediaId: 'pack-id:1',
        rating: 1,
      },
      {
        characterId: 'anilist:3',
        mediaId: 'pack-id:1',
        rating: 1,
      },
      {
        characterId: 'anilist:4',
        mediaId: 'pack-id:1',
        rating: 1,
      },
      {
        characterId: 'anilist:5',
        mediaId: 'pack-id:2',
        rating: 1,
      },
      {
        characterId: 'anilist:6',
        mediaId: 'pack-id:1',
        rating: 1,
      },
      {
        characterId: 'anilist:7',
        mediaId: 'pack-id:1',
        rating: 1,
      },
      {
        characterId: 'anilist:8',
        mediaId: 'pack-id:1',
        rating: 1,
      },
      {
        characterId: 'anilist:9',
        mediaId: 'pack-id:1',
        rating: 1,
      },
    ] as any);
    vi.spyOn(packs, 'all').mockResolvedValue([]);

    config.synthesis = true;

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';
    config.synthesis = true;

    const message = await merge.synthesize({
      token: 'test_token',
      userId: 'user_id',
      guildId: 'guild_id',
      mode: 'target',
      target: 2,
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
    expect(fetchStub).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({ method: 'PATCH' })
    );

    const callBody = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );
    expect(callBody).toEqual({
      attachments: [],
      components: [],
      embeds: [
        {
          type: 'rich',
          description:
            'You only have **4 out the 5** sacrifices needed for 2<:smolstar:1107503653956374638>',
        },
      ],
    });
  });

  it('filter (liked media)', async () => {
    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);
    vi.spyOn(db, 'newMongo').mockReturnValue({
      connect: () => ({
        close: () => undefined,
      }),
    } as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    vi.spyOn(db, 'getInventory').mockReturnValue({
      party: {},
      user: {
        likes: [{ mediaId: 'pack-id:1' }],
      },
    } as any);
    vi.spyOn(db, 'getUserCharacters').mockReturnValue([
      {
        characterId: 'anilist:1',
        mediaId: 'pack-id:1',
        rating: 1,
      },
      {
        characterId: 'anilist:2',
        mediaId: 'pack-id:1',
        rating: 1,
      },
      {
        characterId: 'anilist:3',
        mediaId: 'pack-id:1',
        rating: 1,
      },
      {
        characterId: 'anilist:4',
        mediaId: 'pack-id:1',
        rating: 1,
      },
      {
        characterId: 'anilist:5',
        mediaId: 'pack-id:1',
        rating: 1,
      },
      {
        characterId: 'anilist:6',
        mediaId: 'pack-id:2',
        rating: 1,
      },
      {
        characterId: 'anilist:7',
        mediaId: 'pack-id:2',
        rating: 1,
      },
      {
        characterId: 'anilist:8',
        mediaId: 'pack-id:2',
        rating: 1,
      },
      {
        characterId: 'anilist:9',
        mediaId: 'pack-id:2',
        rating: 1,
      },
    ] as any);
    vi.spyOn(packs, 'all').mockResolvedValue([]);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';
    config.synthesis = true;

    const message = await merge.synthesize({
      token: 'test_token',
      userId: 'user_id',
      guildId: 'guild_id',
      mode: 'target',
      target: 2,
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
    expect(fetchStub).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({ method: 'PATCH' })
    );

    const callBody = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );
    expect(callBody).toEqual({
      attachments: [],
      components: [],
      embeds: [
        {
          type: 'rich',
          description:
            'You only have **4 out the 5** sacrifices needed for 2<:smolstar:1107503653956374638>',
        },
      ],
    });
  });

  it('not enough', async () => {
    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockImplementation(() => undefined as any);
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
    vi.spyOn(db, 'getUserCharacters').mockReturnValue([] as any);
    vi.spyOn(packs, 'all').mockResolvedValue([]);

    config.synthesis = true;

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';
    config.synthesis = true;

    const message = await merge.synthesize({
      token: 'test_token',
      userId: 'user_id',
      guildId: 'guild_id',
      mode: 'target',
      target: 2,
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
    expect(fetchStub).toHaveBeenCalledWith(
      'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      expect.objectContaining({ method: 'PATCH' })
    );

    const callBody = JSON.parse(
      (fetchStub.mock.calls[0][1]?.body as FormData)?.get('payload_json') as any
    );
    expect(callBody).toEqual({
      attachments: [],
      components: [],
      embeds: [
        {
          type: 'rich',
          description:
            'You only have **0 out the 5** sacrifices needed for 2<:smolstar:1107503653956374638>',
        },
      ],
    });
  });

  it('under maintenance', async () => {
    config.synthesis = false;

    expect(() =>
      merge.synthesize({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        mode: 'target',
        target: 2,
      })
    ).toThrow(
      new NonFetalError('Merging is under maintenance, try again later!')
    );
  });
});
