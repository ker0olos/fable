/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import serverOptions from '~/src/serverOptions.ts';
import utils from '~/src/utils.ts';
import db from '~/db/index.ts';
import config from '~/src/config.ts';

describe('/server options', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    config.origin = 'http://localhost:8000';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
    delete config.origin;
  });

  it('dupes allowed', async () => {
    vi.spyOn(db, 'getGuild').mockResolvedValue({
      options: { dupes: true },
    } as any);
    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);

    const message = serverOptions.view({
      token: 'test_token',
      guildId: 'guild_id',
      userId: 'user_id',
    });

    expect(db.getGuild).toHaveBeenCalledWith('guild_id');

    expect(message.json()).toEqual({
      type: 4,
      data: {
        flags: 64,
        attachments: [],
        components: [],
        embeds: [
          {
            type: 'rich',
            image: {
              url: 'http://localhost:8000/spinner3.gif',
            },
          },
        ],
      },
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalled();
    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0];
    expect(fetchCall[1]?.method).toBe('PATCH');

    const payloadJson = JSON.parse(
      (fetchCall[1]?.body as FormData)?.get('payload_json') as any
    );
    expect(payloadJson).toEqual({
      attachments: [],
      components: [
        {
          type: 1,
          components: [
            {
              custom_id: 'options=dupes',
              label: 'Disallow Dupes',
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
              name: 'Dupes are allowed (Experimental)',
              value: 'Multiple users can own the same character.',
            },
          ],
        },
      ],
    });
  });

  it('dupes disallowed', async () => {
    vi.spyOn(db, 'getGuild').mockResolvedValue({
      options: { dupes: false },
    } as any);
    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);

    const message = serverOptions.view({
      token: 'test_token',
      guildId: 'guild_id',
      userId: 'user_id',
    });

    expect(db.getGuild).toHaveBeenCalledWith('guild_id');

    expect(message.json()).toEqual({
      type: 4,
      data: {
        flags: 64,
        attachments: [],
        components: [],
        embeds: [
          {
            type: 'rich',
            image: {
              url: 'http://localhost:8000/spinner3.gif',
            },
          },
        ],
      },
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalled();
    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0];
    expect(fetchCall[1]?.method).toBe('PATCH');

    const payloadJson = JSON.parse(
      (fetchCall[1]?.body as FormData)?.get('payload_json') as any
    );
    expect(payloadJson).toEqual({
      attachments: [],
      components: [
        {
          type: 1,
          components: [
            {
              custom_id: 'options=dupes',
              label: 'Allow Dupes',
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
              name: 'Dupes are disallowed',
              value: 'Only one user can own a character.',
            },
          ],
        },
      ],
    });
  });

  it('options is null', async () => {
    vi.spyOn(db, 'getGuild').mockResolvedValue({ options: undefined } as any);
    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);

    const message = serverOptions.view({
      token: 'test_token',
      guildId: 'guild_id',
      userId: 'user_id',
    });

    expect(db.getGuild).toHaveBeenCalledWith('guild_id');

    expect(message.json()).toEqual({
      type: 4,
      data: {
        flags: 64,
        attachments: [],
        components: [],
        embeds: [
          {
            type: 'rich',
            image: {
              url: 'http://localhost:8000/spinner3.gif',
            },
          },
        ],
      },
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalled();
    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0];
    expect(fetchCall[1]?.method).toBe('PATCH');

    const payloadJson = JSON.parse(
      (fetchCall[1]?.body as FormData)?.get('payload_json') as any
    );
    expect(payloadJson).toEqual({
      attachments: [],
      components: [
        {
          type: 1,
          components: [
            {
              custom_id: 'options=dupes',
              label: 'Allow Dupes',
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
              name: 'Dupes are disallowed',
              value: 'Only one user can own a character.',
            },
          ],
        },
      ],
    });
  });
});

describe('invert dupes', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    config.origin = 'http://localhost:8000';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
    delete config.origin;
  });

  it('normal', async () => {
    vi.spyOn(db, 'invertDupes').mockResolvedValue({
      options: { dupes: true },
    } as any);
    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);

    const message = serverOptions.invertDupes({
      token: 'test_token',
      guildId: 'guild_id',
      userId: 'user_id',
    });

    expect(db.invertDupes).toHaveBeenCalledWith('guild_id');

    expect(message.json()).toEqual({
      type: 4,
      data: {
        attachments: [],
        components: [],
        embeds: [
          {
            type: 'rich',
            image: {
              url: 'http://localhost:8000/spinner3.gif',
            },
          },
        ],
      },
    });

    await vi.runAllTimersAsync();

    expect(utils.fetchWithRetry).toHaveBeenCalled();
    const fetchCall = vi.mocked(utils.fetchWithRetry).mock.calls[0];
    expect(fetchCall[1]?.method).toBe('PATCH');

    const payloadJson = JSON.parse(
      (fetchCall[1]?.body as FormData)?.get('payload_json') as any
    );
    expect(payloadJson).toEqual({
      attachments: [],
      components: [
        {
          type: 1,
          components: [
            {
              custom_id: 'options=dupes',
              label: 'Disallow Dupes',
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
              name: 'Dupes are allowed (Experimental)',
              value: 'Multiple users can own the same character.',
            },
          ],
        },
      ],
    });
  });
});
