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

    const message = await serverOptions.view({
      guildId: 'guild_id',
      userId: 'user_id',
    });

    expect(db.getGuild).toHaveBeenCalledWith('guild_id');

    expect(message.json()).toEqual({
      type: 4,
      data: {
        flags: 32768,
        attachments: [],
        components: [
          {
            type: 17,
            components: [
              {
                type: 9,
                accessory: {
                  custom_id: 'options=dupes',
                  label: 'Disable',
                  style: 2,
                  type: 2,
                },
                components: [
                  {
                    type: 10,
                    content:
                      '**Dupes are enabled (Experimental)**\n-# Multiple users can own the same character.',
                  },
                ],
              },
              { type: 14 },
              {
                type: 9,
                accessory: {
                  custom_id: 'options=steal',
                  label: 'Enable',
                  style: 2,
                  type: 2,
                },
                components: [
                  {
                    type: 10,
                    content:
                      "**Stealing is disabled**\n-# Users can't steal characters.",
                  },
                ],
              },
            ],
          },
        ],
      },
    });
  });

  it('dupes disallowed', async () => {
    vi.spyOn(db, 'getGuild').mockResolvedValue({
      options: { dupes: false },
    } as any);
    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);

    const message = await serverOptions.view({
      guildId: 'guild_id',
      userId: 'user_id',
    });

    expect(db.getGuild).toHaveBeenCalledWith('guild_id');

    expect(message.json()).toEqual({
      type: 4,
      data: {
        flags: 32768,
        attachments: [],
        components: [
          {
            type: 17,
            components: [
              {
                type: 9,
                accessory: {
                  custom_id: 'options=dupes',
                  label: 'Enable',
                  style: 2,
                  type: 2,
                },
                components: [
                  {
                    type: 10,
                    content:
                      '**Dupes are disabled**\n-# Only one user can own a character.',
                  },
                ],
              },
              { type: 14 },
              {
                type: 9,
                accessory: {
                  custom_id: 'options=steal',
                  label: 'Enable',
                  style: 2,
                  type: 2,
                },
                components: [
                  {
                    type: 10,
                    content:
                      "**Stealing is disabled**\n-# Users can't steal characters.",
                  },
                ],
              },
            ],
          },
        ],
      },
    });
  });

  it('steal allowed', async () => {
    vi.spyOn(db, 'getGuild').mockResolvedValue({
      options: { steal: true },
    } as any);
    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);

    const message = await serverOptions.view({
      guildId: 'guild_id',
      userId: 'user_id',
    });

    expect(db.getGuild).toHaveBeenCalledWith('guild_id');

    expect(message.json()).toEqual({
      type: 4,
      data: {
        flags: 32768,
        attachments: [],
        components: [
          {
            type: 17,
            components: [
              {
                type: 9,
                accessory: {
                  custom_id: 'options=dupes',
                  label: 'Enable',
                  style: 2,
                  type: 2,
                },
                components: [
                  {
                    type: 10,
                    content:
                      '**Dupes are disabled**\n-# Only one user can own a character.',
                  },
                ],
              },
              { type: 14 },
              {
                type: 9,
                accessory: {
                  custom_id: 'options=steal',
                  label: 'Disable',
                  style: 2,
                  type: 2,
                },
                components: [
                  {
                    type: 10,
                    content:
                      '**Stealing is enabled**\n-# Users can steal characters from each other.',
                  },
                ],
              },
            ],
          },
        ],
      },
    });
  });

  it('options is null', async () => {
    vi.spyOn(db, 'getGuild').mockResolvedValue({ options: undefined } as any);
    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);

    const message = await serverOptions.view({
      guildId: 'guild_id',
      userId: 'user_id',
    });

    expect(db.getGuild).toHaveBeenCalledWith('guild_id');

    expect(message.json()).toEqual({
      type: 4,
      data: {
        flags: 32768,
        attachments: [],
        components: [
          {
            type: 17,
            components: [
              {
                type: 9,
                accessory: {
                  custom_id: 'options=dupes',
                  label: 'Enable',
                  style: 2,
                  type: 2,
                },
                components: [
                  {
                    type: 10,
                    content:
                      '**Dupes are disabled**\n-# Only one user can own a character.',
                  },
                ],
              },
              { type: 14 },
              {
                type: 9,
                accessory: {
                  custom_id: 'options=steal',
                  label: 'Enable',
                  style: 2,
                  type: 2,
                },
                components: [
                  {
                    type: 10,
                    content:
                      "**Stealing is disabled**\n-# Users can't steal characters.",
                  },
                ],
              },
            ],
          },
        ],
      },
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

    const message = await serverOptions.invertDupes({
      guildId: 'guild_id',
      userId: 'user_id',
    });

    expect(db.invertDupes).toHaveBeenCalledWith('guild_id');

    expect(message.json()).toEqual({
      type: 4,
      data: {
        flags: 32768,
        attachments: [],
        components: [
          {
            type: 17,
            components: [
              {
                type: 9,
                accessory: {
                  custom_id: 'options=dupes',
                  label: 'Disable',
                  style: 2,
                  type: 2,
                },
                components: [
                  {
                    type: 10,
                    content:
                      '**Dupes are enabled (Experimental)**\n-# Multiple users can own the same character.',
                  },
                ],
              },
              { type: 14 },
              {
                type: 9,
                accessory: {
                  custom_id: 'options=steal',
                  label: 'Enable',
                  style: 2,
                  type: 2,
                },
                components: [
                  {
                    type: 10,
                    content:
                      "**Stealing is disabled**\n-# Users can't steal characters.",
                  },
                ],
              },
            ],
          },
        ],
      },
    });
  });
});

describe('invert steal', () => {
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
    vi.spyOn(db, 'invertSteal').mockResolvedValue({
      options: { steal: true },
    } as any);
    vi.spyOn(utils, 'fetchWithRetry').mockReturnValue(undefined as any);

    const message = await serverOptions.invertSteal({
      guildId: 'guild_id',
      userId: 'user_id',
    });

    expect(db.invertSteal).toHaveBeenCalledWith('guild_id');

    expect(message.json()).toEqual({
      type: 4,
      data: {
        flags: 32768,
        attachments: [],
        components: [
          {
            type: 17,
            components: [
              {
                type: 9,
                accessory: {
                  custom_id: 'options=dupes',
                  label: 'Enable',
                  style: 2,
                  type: 2,
                },
                components: [
                  {
                    type: 10,
                    content:
                      '**Dupes are disabled**\n-# Only one user can own a character.',
                  },
                ],
              },
              { type: 14 },
              {
                type: 9,
                accessory: {
                  custom_id: 'options=steal',
                  label: 'Disable',
                  style: 2,
                  type: 2,
                },
                components: [
                  {
                    type: 10,
                    content:
                      '**Stealing is enabled**\n-# Users can steal characters from each other.',
                  },
                ],
              },
            ],
          },
        ],
      },
    });
  });
});
