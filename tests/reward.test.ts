/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, afterEach } from 'vitest';

import reward from '~/src/reward.ts';
import config from '~/src/config.ts';
import db from '~/db/index.ts';
import utils from '~/src/utils.ts';

describe('/reward pulls', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it('normal dialog', () => {
    const message = reward.pulls({
      targetId: 'another_user_id',
      userId: 'user_id',
      amount: 1,
    });

    expect(message.json()).toEqual({
      type: 4,
      data: {
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'reward=pulls=user_id=another_user_id=1',
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
            description:
              'You want to reward <@another_user_id> **1** pull <:add:1099004747123523644>?',
          },
        ],
      },
    });
  });

  it('normal dialog (plural)', () => {
    config.shop = true;

    const message = reward.pulls({
      targetId: 'another_user_id',
      userId: 'user_id',
      amount: 4,
    });

    expect(message.json()).toEqual({
      type: 4,
      data: {
        attachments: [],
        components: [
          {
            type: 1,
            components: [
              {
                custom_id: 'reward=pulls=user_id=another_user_id=4',
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
            description:
              'You want to reward <@another_user_id> **4** pulls <:add:1099004747123523644>?',
          },
        ],
      },
    });
  });

  it('normal confirmed', async () => {
    vi.useFakeTimers();

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    const addPullsStub = vi.spyOn(db, 'addPulls').mockReturnValue('_' as any);
    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = await reward.confirmPulls({
      userId: 'user_id',
      targetId: 'another_user_id',
      token: 'test_token',
      guildId: 'guild_id',
      amount: 1,
    });

    expect(addPullsStub).toHaveBeenCalledWith(
      'another_user_id',
      'guild_id',
      1,
      true
    );

    expect(message.json()).toEqual({
      type: 4,
      data: {
        attachments: [],
        components: [],
        embeds: [],
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
      attachments: [],
      components: [],
      embeds: [
        {
          type: 'rich',
          description:
            'You rewarded <@another_user_id> **1** pull <:add:1099004747123523644>',
        },
      ],
    });

    await vi.runAllTimersAsync();

    expect(fetchStub.mock.calls[1][0]).toBe(
      'https://discord.com/api/v10/webhooks/app_id/test_token'
    );

    expect(fetchStub.mock.calls[1][1]?.method).toBe('POST');

    expect(
      JSON.parse(
        (fetchStub.mock.calls[1][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      attachments: [],
      components: [],
      content: '<@another_user_id>',
      embeds: [
        {
          type: 'rich',
          description:
            '<@user_id> rewarded you **1** pull <:add:1099004747123523644>',
        },
      ],
    });

    delete config.appId;
    delete config.origin;
  });

  it('normal confirmed (plural)', async () => {
    vi.useFakeTimers();

    vi.spyOn(db, 'getUser').mockReturnValue('user' as any);
    vi.spyOn(db, 'getGuild').mockReturnValue('guild' as any);
    const addPullsStub = vi.spyOn(db, 'addPulls').mockReturnValue('_' as any);
    const fetchStub = vi
      .spyOn(utils, 'fetchWithRetry')
      .mockReturnValue(undefined as any);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    const message = await reward.confirmPulls({
      userId: 'user_id',
      targetId: 'another_user_id',
      token: 'test_token',
      guildId: 'guild_id',
      amount: 4,
    });

    expect(addPullsStub).toHaveBeenCalledWith(
      'another_user_id',
      'guild_id',
      4,
      true
    );

    expect(message.json()).toEqual({
      type: 4,
      data: {
        attachments: [],
        components: [],
        embeds: [],
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
      attachments: [],
      components: [],
      embeds: [
        {
          type: 'rich',
          description:
            'You rewarded <@another_user_id> **4** pulls <:add:1099004747123523644>',
        },
      ],
    });

    await vi.runAllTimersAsync();

    expect(fetchStub.mock.calls[1][0]).toBe(
      'https://discord.com/api/v10/webhooks/app_id/test_token'
    );

    expect(fetchStub.mock.calls[1][1]?.method).toBe('POST');

    expect(
      JSON.parse(
        (fetchStub.mock.calls[1][1]?.body as FormData)?.get(
          'payload_json'
        ) as any
      )
    ).toEqual({
      attachments: [],
      components: [],
      content: '<@another_user_id>',
      embeds: [
        {
          type: 'rich',
          description:
            '<@user_id> rewarded you **4** pulls <:add:1099004747123523644>',
        },
      ],
    });

    delete config.appId;
    delete config.origin;
  });
});
