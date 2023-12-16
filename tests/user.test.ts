// deno-lint-ignore-file no-explicit-any prefer-ascii

import { assertEquals } from '$std/assert/mod.ts';

import { FakeTime } from '$std/testing/time.ts';

import { assertSpyCalls, returnsNext, stub } from '$std/testing/mock.ts';

import utils from '../src/utils.ts';

import user from '../src/user.ts';
import packs from '../src/packs.ts';

import config from '../src/config.ts';

import db from '../db/mod.ts';

import {
  Character,
  CharacterRole,
  Media,
  MediaFormat,
  MediaRelation,
  MediaType,
} from '../src/types.ts';

import { AniListCharacter, AniListMedia } from '../packs/anilist/types.ts';

Deno.test('/now', async (test) => {
  await test.step('with pulls', async () => {
    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const rechargeConsumablesStub = stub(
      db,
      'rechargeConsumables',
      () =>
        ({
          inventory: {
            availablePulls: 5,
            stealTimestamp: null,
            rechargeTimestamp: null,
          },
        }) as any,
    );

    const createVoteRefStub = stub(
      db,
      'createVoteRef',
      () => Promise.resolve('fake_ref'),
    );

    config.appId = 'app_id';

    try {
      const message = await user.now({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(
        getUserStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(
        getGuildStub.calls[0].args[0],
        'guild_id',
      );

      assertEquals(
        getInstanceStub.calls[0].args[0],
        'guild' as any,
      );

      assertEquals(
        rechargeConsumablesStub.calls[0].args[0],
        'instance' as any,
      );

      assertEquals(
        rechargeConsumablesStub.calls[0].args[1],
        'user' as any,
      );

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: '**5**',
              footer: {
                text: 'Available Pulls',
              },
              description: undefined,
            },
          ],
          components: [
            {
              components: [
                {
                  custom_id: 'gacha=user_id',
                  label: '/gacha',
                  style: 2,
                  type: 2,
                },
                {
                  label: 'Vote',
                  style: 5,
                  type: 2,
                  url: 'https://top.gg/bot/app_id/vote?ref=fake_ref',
                },
              ],
              type: 1,
            },
          ],
        },
      });
    } finally {
      delete config.appId;

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      rechargeConsumablesStub.restore();
      createVoteRefStub.restore();
    }
  });

  await test.step('no pulls', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const rechargeConsumablesStub = stub(
      db,
      'rechargeConsumables',
      () =>
        ({
          inventory: {
            availablePulls: 0,
            stealTimestamp: null,
            rechargeTimestamp: time.toISOString(),
          },
        }) as any,
    );

    const createVoteRefStub = stub(
      db,
      'createVoteRef',
      () => Promise.resolve('fake_ref'),
    );

    config.appId = 'app_id';

    try {
      const message = await user.now({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(
        getUserStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(
        getGuildStub.calls[0].args[0],
        'guild_id',
      );

      assertEquals(
        getInstanceStub.calls[0].args[0],
        'guild' as any,
      );

      assertEquals(
        rechargeConsumablesStub.calls[0].args[0],
        'instance' as any,
      );

      assertEquals(
        rechargeConsumablesStub.calls[0].args[1],
        'user' as any,
      );

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: '**0**',
              footer: {
                text: 'Available Pulls',
              },
              description: undefined,
            },
            { type: 'rich', description: '_+1 pull <t:1675569106:R>_' },
          ],
          components: [{
            type: 1,
            components: [{
              label: 'Vote',
              style: 5,
              type: 2,
              url: 'https://top.gg/bot/app_id/vote?ref=fake_ref',
            }],
          }],
        },
      });
    } finally {
      delete config.appId;

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      rechargeConsumablesStub.restore();
      createVoteRefStub.restore();
    }
  });

  await test.step('no pulls with mention', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const rechargeConsumablesStub = stub(
      db,
      'rechargeConsumables',
      () =>
        ({
          inventory: {
            availablePulls: 0,
            stealTimestamp: null,
            rechargeTimestamp: time.toISOString(),
          },
        }) as any,
    );

    const createVoteRefStub = stub(
      db,
      'createVoteRef',
      () => Promise.resolve('fake_ref'),
    );

    config.appId = 'app_id';

    try {
      const message = await user.now({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        mention: true,
      });

      assertEquals(
        getUserStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(
        getGuildStub.calls[0].args[0],
        'guild_id',
      );

      assertEquals(
        getInstanceStub.calls[0].args[0],
        'guild' as any,
      );

      assertEquals(
        rechargeConsumablesStub.calls[0].args[0],
        'instance' as any,
      );

      assertEquals(
        rechargeConsumablesStub.calls[0].args[1],
        'user' as any,
      );

      assertEquals(message.json(), {
        type: 4,
        data: {
          content: '<@user_id>',
          allowed_mentions: { parse: [] },
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: '**0**',
              footer: {
                text: 'Available Pulls',
              },
              description: undefined,
            },
            { type: 'rich', description: '_+1 pull <t:1675569106:R>_' },
          ],
          components: [{
            type: 1,
            components: [{
              label: 'Vote',
              style: 5,
              type: 2,
              url: 'https://top.gg/bot/app_id/vote?ref=fake_ref',
            }],
          }],
        },
      });
    } finally {
      delete config.appId;

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      rechargeConsumablesStub.restore();
      createVoteRefStub.restore();
    }
  });

  await test.step('with sweeps', async () => {
    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const rechargeConsumablesStub = stub(
      db,
      'rechargeConsumables',
      () =>
        ({
          inventory: {
            availablePulls: 5,
            stealTimestamp: null,
            rechargeTimestamp: null,
            availableSweeps: 5,
            lastSweep: new Date().toISOString(),
          },
        }) as any,
    );

    const createVoteRefStub = stub(
      db,
      'createVoteRef',
      () => Promise.resolve('fake_ref'),
    );

    config.appId = 'app_id';

    try {
      const message = await user.now({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(
        getUserStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(
        getGuildStub.calls[0].args[0],
        'guild_id',
      );

      assertEquals(
        getInstanceStub.calls[0].args[0],
        'guild' as any,
      );

      assertEquals(
        rechargeConsumablesStub.calls[0].args[0],
        'instance' as any,
      );

      assertEquals(
        rechargeConsumablesStub.calls[0].args[1],
        'user' as any,
      );

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: '**5**',
              footer: {
                text: 'Available Pulls',
              },
              description: undefined,
            },
            {
              type: 'rich',
              title: '**5**',
              footer: {
                text: 'Available Sweeps',
              },
            },
          ],
          components: [
            {
              components: [
                {
                  custom_id: 'gacha=user_id',
                  label: '/gacha',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'tsweep=user_id',
                  label: '/sweep',
                  style: 2,
                  type: 2,
                },
                {
                  label: 'Vote',
                  style: 5,
                  type: 2,
                  url: 'https://top.gg/bot/app_id/vote?ref=fake_ref',
                },
              ],
              type: 1,
            },
          ],
        },
      });
    } finally {
      delete config.appId;

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      rechargeConsumablesStub.restore();
      createVoteRefStub.restore();
    }
  });

  await test.step('no sweeps', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const rechargeConsumablesStub = stub(
      db,
      'rechargeConsumables',
      () =>
        ({
          inventory: {
            availablePulls: 0,
            availableSweeps: 0,
            stealTimestamp: null,
            rechargeTimestamp: time.toISOString(),
            sweepsTimestamp: time.toISOString(),
            lastSweep: new Date().toISOString(),
          },
        }) as any,
    );

    const createVoteRefStub = stub(
      db,
      'createVoteRef',
      () => Promise.resolve('fake_ref'),
    );

    config.appId = 'app_id';

    try {
      const message = await user.now({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(
        getUserStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(
        getGuildStub.calls[0].args[0],
        'guild_id',
      );

      assertEquals(
        getInstanceStub.calls[0].args[0],
        'guild' as any,
      );

      assertEquals(
        rechargeConsumablesStub.calls[0].args[0],
        'instance' as any,
      );

      assertEquals(
        rechargeConsumablesStub.calls[0].args[1],
        'user' as any,
      );

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: '**0**',
              footer: {
                text: 'Available Pulls',
              },
              description: undefined,
            },
            {
              type: 'rich',
              title: '**0**',
              footer: {
                text: 'Available Sweeps',
              },
            },
            { type: 'rich', description: '_+1 pull <t:1675569106:R>_' },
            { type: 'rich', description: '_+5 sweeps <t:1675570906:R>_' },
          ],
          components: [{
            type: 1,
            components: [{
              label: 'Vote',
              style: 5,
              type: 2,
              url: 'https://top.gg/bot/app_id/vote?ref=fake_ref',
            }],
          }],
        },
      });
    } finally {
      delete config.appId;

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      rechargeConsumablesStub.restore();
      createVoteRefStub.restore();
    }
  });

  await test.step('with 1 token', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');

    const getUserStub = stub(
      db,
      'getUser',
      () =>
        ({
          availableTokens: 1,
          lastVote: time.toISOString(),
        }) as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const rechargeConsumablesStub = stub(
      db,
      'rechargeConsumables',
      () =>
        ({
          inventory: {
            availablePulls: 0,
            stealTimestamp: null,
            rechargeTimestamp: time.toISOString(),
          },
        }) as any,
    );

    const createVoteRefStub = stub(
      db,
      'createVoteRef',
      () => Promise.resolve('fake_ref'),
    );

    config.appId = 'app_id';

    try {
      const message = await user.now({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(
        getUserStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(
        getGuildStub.calls[0].args[0],
        'guild_id',
      );

      assertEquals(
        getInstanceStub.calls[0].args[0],
        'guild' as any,
      );

      assertEquals(
        rechargeConsumablesStub.calls[0].args[0],
        'instance' as any,
      );

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: '**0**',
              footer: {
                text: 'Available Pulls',
              },
              description: undefined,
            },
            {
              type: 'rich',
              title: '**1**',
              footer: {
                text: 'Daily Token',
              },
            },
            { type: 'rich', description: '_+1 pull <t:1675569106:R>_' },
          ],
          components: [{
            type: 1,
            components: [{
              label: 'Vote',
              style: 5,
              type: 2,
              url: 'https://top.gg/bot/app_id/vote?ref=fake_ref',
            }],
          }],
        },
      });
    } finally {
      delete config.appId;

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      rechargeConsumablesStub.restore();
      createVoteRefStub.restore();
    }
  });

  await test.step('with 4 tokens', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');

    const getUserStub = stub(
      db,
      'getUser',
      () =>
        ({
          availableTokens: 4,
          lastVote: time.toISOString(),
        }) as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const rechargeConsumablesStub = stub(
      db,
      'rechargeConsumables',
      () =>
        ({
          inventory: {
            availablePulls: 0,
            stealTimestamp: null,
            rechargeTimestamp: time.toISOString(),
          },
        }) as any,
    );

    const createVoteRefStub = stub(
      db,
      'createVoteRef',
      () => Promise.resolve('fake_ref'),
    );

    config.appId = 'app_id';

    try {
      const message = await user.now({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(
        getUserStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(
        getGuildStub.calls[0].args[0],
        'guild_id',
      );

      assertEquals(
        getInstanceStub.calls[0].args[0],
        'guild' as any,
      );

      assertEquals(
        rechargeConsumablesStub.calls[0].args[0],
        'instance' as any,
      );
      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: '**0**',
              footer: {
                text: 'Available Pulls',
              },
              description: undefined,
            },
            {
              type: 'rich',
              title: '**4**',
              footer: {
                text: 'Daily Tokens',
              },
            },
            { type: 'rich', description: '_+1 pull <t:1675569106:R>_' },
          ],
          components: [{
            type: 1,
            components: [{
              label: 'Vote',
              style: 5,
              type: 2,
              url: 'https://top.gg/bot/app_id/vote?ref=fake_ref',
            }],
          }],
        },
      });
    } finally {
      delete config.appId;

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      rechargeConsumablesStub.restore();
      createVoteRefStub.restore();
    }
  });

  await test.step('with 28 tokens', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');

    const getUserStub = stub(
      db,
      'getUser',
      () =>
        ({
          availableTokens: 28,
          lastVote: time.toISOString(),
        }) as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const rechargeConsumablesStub = stub(
      db,
      'rechargeConsumables',
      () =>
        ({
          inventory: {
            availablePulls: 4,
            stealTimestamp: null,
            rechargeTimestamp: time.toISOString(),
          },
        }) as any,
    );

    const createVoteRefStub = stub(
      db,
      'createVoteRef',
      () => Promise.resolve('fake_ref'),
    );

    config.appId = 'app_id';

    try {
      const message = await user.now({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(
        getUserStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(
        getGuildStub.calls[0].args[0],
        'guild_id',
      );

      assertEquals(
        getInstanceStub.calls[0].args[0],
        'guild' as any,
      );

      assertEquals(
        rechargeConsumablesStub.calls[0].args[0],
        'instance' as any,
      );

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: '**4**',
              footer: {
                text: 'Available Pulls',
              },
              description: undefined,
            },
            {
              type: 'rich',
              title: '**28**',
              footer: {
                text: 'Daily Tokens',
              },
            },
            { type: 'rich', description: '_+1 pull <t:1675569106:R>_' },
          ],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'gacha=user_id',
                label: '/gacha',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'buy=bguaranteed=user_id=5',
                label: '/buy guaranteed 5',
                style: 2,
                type: 2,
              },
              {
                label: 'Vote',
                style: 5,
                type: 2,
                url: 'https://top.gg/bot/app_id/vote?ref=fake_ref',
              },
            ],
          }],
        },
      });
    } finally {
      delete config.appId;

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      rechargeConsumablesStub.restore();
      createVoteRefStub.restore();
    }
  });

  await test.step('with 27 tokens', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');

    const getUserStub = stub(
      db,
      'getUser',
      () =>
        ({
          availableTokens: 27,
          lastVote: time.toISOString(),
        }) as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const rechargeConsumablesStub = stub(
      db,
      'rechargeConsumables',
      () =>
        ({
          inventory: {
            availablePulls: 4,
            stealTimestamp: null,
            rechargeTimestamp: time.toISOString(),
          },
        }) as any,
    );

    const createVoteRefStub = stub(
      db,
      'createVoteRef',
      () => Promise.resolve('fake_ref'),
    );

    config.appId = 'app_id';

    try {
      const message = await user.now({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(
        getUserStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(
        getGuildStub.calls[0].args[0],
        'guild_id',
      );

      assertEquals(
        getInstanceStub.calls[0].args[0],
        'guild' as any,
      );

      assertEquals(
        rechargeConsumablesStub.calls[0].args[0],
        'instance' as any,
      );

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: '**4**',
              footer: {
                text: 'Available Pulls',
              },
              description: undefined,
            },
            {
              type: 'rich',
              title: '**27**',
              footer: {
                text: 'Daily Tokens',
              },
            },
            { type: 'rich', description: '_+1 pull <t:1675569106:R>_' },
          ],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'gacha=user_id',
                label: '/gacha',
                style: 2,
                type: 2,
              },
              {
                custom_id: 'buy=bguaranteed=user_id=4',
                label: '/buy guaranteed 4',
                style: 2,
                type: 2,
              },
              {
                label: 'Vote',
                style: 5,
                type: 2,
                url: 'https://top.gg/bot/app_id/vote?ref=fake_ref',
              },
            ],
          }],
        },
      });
    } finally {
      delete config.appId;

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      rechargeConsumablesStub.restore();
      createVoteRefStub.restore();
    }
  });

  await test.step('with guarantees', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');

    const getUserStub = stub(
      db,
      'getUser',
      () =>
        ({
          availableTokens: 5,
          lastVote: time.toISOString(),
          guarantees: [5, 5, 4, 4, 3],
        }) as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const rechargeConsumablesStub = stub(
      db,
      'rechargeConsumables',
      () =>
        ({
          inventory: {
            availablePulls: 4,
            stealTimestamp: null,
            rechargeTimestamp: time.toISOString(),
          },
        }) as any,
    );

    const createVoteRefStub = stub(
      db,
      'createVoteRef',
      () => Promise.resolve('fake_ref'),
    );

    config.appId = 'app_id';

    try {
      const message = await user.now({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(
        getUserStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(
        getGuildStub.calls[0].args[0],
        'guild_id',
      );

      assertEquals(
        getInstanceStub.calls[0].args[0],
        'guild' as any,
      );

      assertEquals(
        rechargeConsumablesStub.calls[0].args[0],
        'instance' as any,
      );

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: '**4**',
              footer: {
                text: 'Available Pulls',
              },
              description:
                '5<:smolstar:1107503653956374638>4<:smolstar:1107503653956374638>3<:smolstar:1107503653956374638>',
            },
            {
              type: 'rich',
              title: '**5**',
              footer: {
                text: 'Daily Tokens',
              },
            },
            { type: 'rich', description: '_+1 pull <t:1675569106:R>_' },
          ],
          components: [{
            type: 1,
            components: [
              {
                style: 2,
                type: 2,
                custom_id: 'gacha=user_id',
                label: '/gacha',
              },
              {
                style: 2,
                type: 2,
                custom_id: 'pull=user_id=5',
                label: '/pull 5',
              },
              {
                label: 'Vote',
                style: 5,
                type: 2,
                url: 'https://top.gg/bot/app_id/vote?ref=fake_ref',
              },
            ],
          }],
        },
      });
    } finally {
      delete config.appId;

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      rechargeConsumablesStub.restore();
      createVoteRefStub.restore();
    }
  });

  await test.step('with steal cooldown', async () => {
    const timestamp = new Date('2023-02-05T03:21:46.253Z');

    const timeStub = new FakeTime(timestamp);

    timestamp.setDate(timestamp.getDate() + 2);

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const rechargeConsumablesStub = stub(
      db,
      'rechargeConsumables',
      () =>
        ({
          inventory: {
            availablePulls: 5,
            stealTimestamp: timestamp,
            rechargeTimestamp: null,
          },
        }) as any,
    );

    const createVoteRefStub = stub(
      db,
      'createVoteRef',
      () => Promise.resolve('fake_ref'),
    );

    config.appId = 'app_id';

    try {
      const message = await user.now({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(
        getUserStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(
        getGuildStub.calls[0].args[0],
        'guild_id',
      );

      assertEquals(
        getInstanceStub.calls[0].args[0],
        'guild' as any,
      );

      assertEquals(
        rechargeConsumablesStub.calls[0].args[0],
        'instance' as any,
      );

      assertEquals(
        rechargeConsumablesStub.calls[0].args[1],
        'user' as any,
      );

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: '**5**',
              footer: {
                text: 'Available Pulls',
              },
              description: undefined,
            },

            {
              type: 'rich',
              description: '_Steal cooldown ends <t:1675740106:R>_',
            },
          ],
          components: [{
            type: 1,
            components: [
              {
                type: 2,
                style: 2,
                custom_id: 'gacha=user_id',
                label: '/gacha',
              },
              {
                label: 'Vote',
                style: 5,
                type: 2,
                url: 'https://top.gg/bot/app_id/vote?ref=fake_ref',
              },
            ],
          }],
        },
      });
    } finally {
      delete config.appId;

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      rechargeConsumablesStub.restore();
      timeStub.restore();
      createVoteRefStub.restore();
    }
  });

  await test.step('with notice', async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const rechargeConsumablesStub = stub(
      db,
      'rechargeConsumables',
      () =>
        ({
          inventory: {
            availablePulls: 0,
            stealTimestamp: null,
            rechargeTimestamp: time.toISOString(),
          },
        }) as any,
    );

    const createVoteRefStub = stub(
      db,
      'createVoteRef',
      () => Promise.resolve('fake_ref'),
    );

    config.appId = 'app_id';

    config.notice = '**test**\\n_message_';

    try {
      const message = await user.now({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(
        getUserStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(
        getGuildStub.calls[0].args[0],
        'guild_id',
      );

      assertEquals(
        getInstanceStub.calls[0].args[0],
        'guild' as any,
      );

      assertEquals(
        rechargeConsumablesStub.calls[0].args[0],
        'instance' as any,
      );

      assertEquals(
        rechargeConsumablesStub.calls[0].args[1],
        'user' as any,
      );

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: '**0**',
              footer: {
                text: 'Available Pulls',
              },
              description: undefined,
            },
            {
              description: '**test**\n_message_',
              type: 'rich',
            },
            { type: 'rich', description: '_+1 pull <t:1675569106:R>_' },
          ],
          components: [{
            type: 1,
            components: [{
              label: 'Vote',
              style: 5,
              type: 2,
              url: 'https://top.gg/bot/app_id/vote?ref=fake_ref',
            }],
          }],
        },
      });
    } finally {
      delete config.appId;

      delete config.notice;

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      rechargeConsumablesStub.restore();
      createVoteRefStub.restore();
    }
  });

  await test.step("can't vote", async () => {
    const time = new Date('2023-02-05T03:21:46.253Z');

    const timeStub = new FakeTime(time);

    const getUserStub = stub(
      db,
      'getUser',
      () =>
        ({
          availableTokens: 5,
          lastVote: new Date().toISOString(),
        }) as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const rechargeConsumablesStub = stub(
      db,
      'rechargeConsumables',
      () =>
        ({
          inventory: {
            availablePulls: 0,
            stealTimestamp: null,
            rechargeTimestamp: time.toISOString(),
          },
        }) as any,
    );

    try {
      const message = await user.now({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(
        getUserStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(
        getGuildStub.calls[0].args[0],
        'guild_id',
      );

      assertEquals(
        getInstanceStub.calls[0].args[0],
        'guild' as any,
      );

      assertEquals(
        rechargeConsumablesStub.calls[0].args[0],
        'instance' as any,
      );

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          embeds: [
            {
              type: 'rich',
              title: '**0**',
              footer: {
                text: 'Available Pulls',
              },
              description: undefined,
            },
            {
              type: 'rich',
              title: '**5**',
              footer: {
                text: 'Daily Tokens',
              },
            },
            { type: 'rich', description: '_+1 pull <t:1675569106:R>_' },
            {
              type: 'rich',
              description: '_Can vote again <t:1675610506:R>_',
            },
          ],
          components: [],
        },
      });
    } finally {
      timeStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      rechargeConsumablesStub.restore();
    }
  });
});

Deno.test('/nick', async (test) => {
  await test.step('changed', async () => {
    const media: AniListMedia = {
      id: '2',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      popularity: 0,
      title: {
        english: 'title',
      },
    };

    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'name 1',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: media,
        }],
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters: [character],
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const setCharacterNicknameStub = stub(
      db,
      'setCharacterNickname',
      () =>
        ({
          id: 'anilist:1',
          mediaId: 'anilist:0',
          nickname: 'returned_nickname',
          image: 'image_url',
          rating: 2,
        }) as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.nick({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild_id',
        id: 'anilist:1',
        nick: 'new_nickname',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 2);

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          components: [],
          attachments: [],
          embeds: [
            {
              type: 'rich',
              description:
                "name 1's nickname has been changed to **returned_nickname**",
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**returned_nickname**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      setCharacterNicknameStub.restore();
    }
  });

  await test.step('reset', async () => {
    const media: AniListMedia = {
      id: '2',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      popularity: 0,
      title: {
        english: 'title',
      },
    };

    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'name 1',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: media,
        }],
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters: [character],
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const setCharacterNicknameStub = stub(
      db,
      'setCharacterNickname',
      () =>
        ({
          id: 'anilist:1',
          mediaId: 'anilist:0',
          image: 'image_url',
          rating: 2,
        }) as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.nick({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild_id',
        id: 'anilist:1',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 2);

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          components: [],
          attachments: [],
          embeds: [
            {
              type: 'rich',
              description: "name 1's nickname has been reset",
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 1**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      setCharacterNicknameStub.restore();
    }
  });

  await test.step('not found', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media: [],
                  characters: [],
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const setCharacterNicknameStub = stub(
      db,
      'setCharacterNickname',
      () => {
        throw new Error('CHARACTER_NOT_FOUND');
      },
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.nick({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild_id',
        id: 'anilist:1',
        nick: 'new_nick',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 2);

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          components: [],
          attachments: [],
          embeds: [
            {
              type: 'rich',
              description: 'Found _nothing_ matching that query!',
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      timeStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      setCharacterNicknameStub.restore();
    }
  });

  await test.step('character not found', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const setCharacterNicknameStub = stub(
      db,
      'setCharacterNickname',
      () => {
        throw new Error('CHARACTER_NOT_FOUND');
      },
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.nick({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild_id',

        id: 'anilist:1',
        nick: 'new_nick',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 2);

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [
            {
              type: 'rich',
              description: "name 1 hasn't been found by anyone yet",
            },
          ],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'character=anilist:1',
                label: '/character',
                style: 2,
                type: 2,
              },
            ],
          }],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      setCharacterNicknameStub.restore();
    }
  });

  await test.step('character not owned', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const setCharacterNicknameStub = stub(
      db,
      'setCharacterNickname',
      () => {
        throw new Error('CHARACTER_NOT_OWNED');
      },
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.nick({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild_id',
        id: 'anilist:1',
        nick: 'new_nick',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 2);

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [
            {
              type: 'rich',
              description: 'name 1 is not owned by you',
            },
          ],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'character=anilist:1',
                label: '/character',
                style: 2,
                type: 2,
              },
            ],
          }],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      setCharacterNicknameStub.restore();
    }
  });
});

Deno.test('/image', async (test) => {
  await test.step('changed', async () => {
    const media: AniListMedia = {
      id: '2',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      popularity: 0,
      title: {
        english: 'title',
      },
    };

    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'name 1',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: media,
        }],
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters: [character],
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const setCharacterImageStub = stub(
      db,
      'setCharacterImage',
      () =>
        ({
          id: 'anilist:1',
          mediaId: 'anilist:0',
          nickname: 'nickname',
          image: 'returned_image',
          rating: 2,
        }) as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.image({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild_id',
        id: 'anilist:1',
        image: 'returned_image',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 2);

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          components: [],
          attachments: [],
          embeds: [
            {
              type: 'rich',
              description: "name 1's image has been **changed**",
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**nickname**',
                },
              ],
              image: {
                url: 'http://localhost:8000/external/returned_image',
              },
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      setCharacterImageStub.restore();
    }
  });

  await test.step('reset', async () => {
    const media: AniListMedia = {
      id: '2',
      type: MediaType.Anime,
      format: MediaFormat.TV,
      popularity: 0,
      title: {
        english: 'title',
      },
    };

    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'name 1',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: media,
        }],
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters: [character],
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const setCharacterImageStub = stub(
      db,
      'setCharacterImage',
      () =>
        ({
          id: 'anilist:1',
          mediaId: 'anilist:0',
          nickname: 'nickname',
          rating: 2,
        }) as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.image({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild_id',
        id: 'anilist:1',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 2);

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          components: [],
          attachments: [],
          embeds: [
            {
              type: 'rich',
              description: "name 1's image has been reset",
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**nickname**',
                },
              ],
              image: {
                url: 'http://localhost:8000/external/',
              },
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      setCharacterImageStub.restore();
    }
  });

  await test.step('not found', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media: [],
                  characters: [],
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const setCharacterImageStub = stub(
      db,
      'setCharacterImage',
      () => {
        throw new Error('CHARACTER_NOT_FOUND');
      },
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.image({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild_id',
        id: 'anilist:1',
        image: 'new_image',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 2);

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          components: [],
          attachments: [],
          embeds: [
            {
              type: 'rich',
              description: 'Found _nothing_ matching that query!',
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      timeStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      setCharacterImageStub.restore();
    }
  });

  await test.step('character not found', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const setCharacterImageStub = stub(
      db,
      'setCharacterImage',
      () => {
        throw new Error('CHARACTER_NOT_FOUND');
      },
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.image({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild_id',
        id: 'anilist:1',
        image: 'new_image',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 2);

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [
            {
              type: 'rich',
              description: "name 1 hasn't been found by anyone yet",
            },
          ],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'character=anilist:1',
                label: '/character',
                style: 2,
                type: 2,
              },
            ],
          }],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      setCharacterImageStub.restore();
    }
  });

  await test.step('character not owned', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const setCharacterImageStub = stub(
      db,
      'setCharacterImage',
      () => {
        throw new Error('CHARACTER_NOT_OWNED');
      },
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.image({
        token: 'test_token',
        userId: 'user',
        guildId: 'guild_id',
        id: 'anilist:1',
        image: 'new_image',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 2);

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [
            {
              type: 'rich',
              description: 'name 1 is not owned by you',
            },
          ],
          components: [{
            type: 1,
            components: [
              {
                custom_id: 'character=anilist:1',
                label: '/character',
                style: 2,
                type: 2,
              },
            ],
          }],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
      timeStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      setCharacterImageStub.restore();
    }
  });
});

Deno.test('/collection stars', async (test) => {
  await test.step('normal', async () => {
    const media: AniListMedia[] = [
      {
        id: '2',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
      },
      {
        id: '4',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
      },
      {
        id: '6',
        type: MediaType.Anime,
        title: {
          english: 'title 3',
        },
      },
      {
        id: '8',
        type: MediaType.Anime,
        title: {
          english: 'title 4',
        },
      },
      {
        id: '10',
        type: MediaType.Anime,
        title: {
          english: 'title 5',
        },
      },
      {
        id: '12',
        type: MediaType.Anime,
        title: {
          english: 'title 6',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[0],
          }],
        },
      },
      {
        id: '3',
        name: {
          full: 'character 2',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[1],
          }],
        },
      },
      {
        id: '5',
        name: {
          full: 'character 3',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[2],
          }],
        },
      },
      {
        id: '7',
        name: {
          full: 'character 4',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[3],
          }],
        },
      },
      {
        id: '9',
        name: {
          full: 'character 5',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[4],
          }],
        },
      },
      {
        id: '11',
        name: {
          full: 'character 6',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[5],
          }],
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const getUserCharactersStub = stub(
      db,
      'getUserCharacters',
      () =>
        [
          {
            value: {
              id: 'anilist:1',
              mediaId: 'anilist:2',
              rating: 1,
            },
          },
          {
            value: {
              id: 'anilist:3',
              mediaId: 'anilist:4',
              rating: 2,
            },
          },
          {
            value: {
              id: 'anilist:5',
              mediaId: 'anilist:6',
              rating: 3,
            },
          },
          {
            value: {
              id: 'anilist:7',
              mediaId: 'anilist:8',
              rating: 4,
            },
          },
          {
            value: {
              id: 'anilist:9',
              mediaId: 'anilist:10',
              rating: 5,
            },
          },
          {
            value: {
              id: 'anilist:11',
              mediaId: 'anilist:12',
              rating: 1,
            },
          },
        ] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        rating: 1,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'list=user_id==1=0=prev',
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
                  custom_id: 'list=user_id==1=0=next',
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
                  name: 'title 1',
                  value: '1<:smolstar:1107503653956374638> character 1',
                },
                {
                  inline: false,
                  name: 'title 6',
                  value: '1<:smolstar:1107503653956374638> character 6',
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      getUserCharactersStub.restore();
    }
  });

  await test.step('with nicknames', async () => {
    const media: AniListMedia[] = [
      {
        id: '2',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
      },
      {
        id: '4',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
      },
      {
        id: '6',
        type: MediaType.Anime,
        title: {
          english: 'title 3',
        },
      },
      {
        id: '8',
        type: MediaType.Anime,
        title: {
          english: 'title 4',
        },
      },
      {
        id: '10',
        type: MediaType.Anime,
        title: {
          english: 'title 5',
        },
      },
      {
        id: '12',
        type: MediaType.Anime,
        title: {
          english: 'title 6',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[0],
          }],
        },
      },
      {
        id: '3',
        name: {
          full: 'character 2',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[1],
          }],
        },
      },
      {
        id: '5',
        name: {
          full: 'character 3',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[2],
          }],
        },
      },
      {
        id: '7',
        name: {
          full: 'character 4',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[3],
          }],
        },
      },
      {
        id: '9',
        name: {
          full: 'character 5',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[4],
          }],
        },
      },
      {
        id: '11',
        name: {
          full: 'character 6',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[5],
          }],
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const getUserCharactersStub = stub(
      db,
      'getUserCharacters',
      () =>
        [
          {
            value: {
              id: 'anilist:1',
              mediaId: 'anilist:2',
              nickname: 'nickname 1',
              rating: 1,
            },
          },
          {
            value: {
              id: 'anilist:3',
              mediaId: 'anilist:4',
              nickname: 'nickname 2',
              rating: 2,
            },
          },
          {
            value: {
              id: 'anilist:5',
              mediaId: 'anilist:6',
              nickname: 'nickname 3',
              rating: 3,
            },
          },
          {
            value: {
              id: 'anilist:7',
              mediaId: 'anilist:8',
              nickname: 'nickname 4',
              rating: 4,
            },
          },
          {
            value: {
              id: 'anilist:9',
              mediaId: 'anilist:10',
              nickname: 'nickname 5',
              rating: 5,
            },
          },
          {
            value: {
              id: 'anilist:11',
              mediaId: 'anilist:12',
              nickname: 'nickname 6',
              rating: 1,
            },
          },
        ] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        rating: 1,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'list=user_id==1=0=prev',
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
                  custom_id: 'list=user_id==1=0=next',
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
                  name: 'title 1',
                  value: '1<:smolstar:1107503653956374638> nickname 1',
                },
                {
                  inline: false,
                  name: 'title 6',
                  value: '1<:smolstar:1107503653956374638> nickname 6',
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      getUserCharactersStub.restore();
    }
  });

  await test.step('with likes', async () => {
    const media: AniListMedia[] = [
      {
        id: '2',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
      },
      {
        id: '4',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
      },
      {
        id: '6',
        type: MediaType.Anime,
        title: {
          english: 'title 3',
        },
      },
      {
        id: '8',
        type: MediaType.Anime,
        title: {
          english: 'title 4',
        },
      },
      {
        id: '10',
        type: MediaType.Anime,
        title: {
          english: 'title 5',
        },
      },
      {
        id: '12',
        type: MediaType.Anime,
        title: {
          english: 'title 6',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[0],
          }],
        },
      },
      {
        id: '3',
        name: {
          full: 'character 2',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[1],
          }],
        },
      },
      {
        id: '5',
        name: {
          full: 'character 3',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[2],
          }],
        },
      },
      {
        id: '7',
        name: {
          full: 'character 4',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[3],
          }],
        },
      },
      {
        id: '9',
        name: {
          full: 'character 5',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[4],
          }],
        },
      },
      {
        id: '11',
        name: {
          full: 'character 6',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[5],
          }],
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => ({
        likes: [
          { characterId: 'anilist:1' },
          { mediaId: 'anilist:12' },
        ],
      } as any),
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const getUserCharactersStub = stub(
      db,
      'getUserCharacters',
      () =>
        [
          {
            value: {
              id: 'anilist:1',
              mediaId: 'anilist:2',
              rating: 1,
            },
          },
          {
            value: {
              id: 'anilist:3',
              mediaId: 'anilist:4',
              rating: 2,
            },
          },
          {
            value: {
              id: 'anilist:5',
              mediaId: 'anilist:6',
              rating: 3,
            },
          },
          {
            value: {
              id: 'anilist:7',
              mediaId: 'anilist:8',
              rating: 4,
            },
          },
          {
            value: {
              id: 'anilist:9',
              mediaId: 'anilist:10',
              rating: 5,
            },
          },
          {
            value: {
              id: 'anilist:11',
              mediaId: 'anilist:12',
              rating: 1,
            },
          },
        ] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        rating: 1,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'list=user_id==1=0=prev',
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
                  custom_id: 'list=user_id==1=0=next',
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
                  name: 'title 1',
                  value:
                    '1<:smolstar:1107503653956374638><:liked:1110491720375873567> character 1',
                },
                {
                  inline: false,
                  name: 'title 6',
                  value: '1<:smolstar:1107503653956374638> character 6',
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      getUserCharactersStub.restore();
    }
  });

  await test.step('with likes and party', async () => {
    const media: AniListMedia[] = [
      {
        id: '0',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[0],
          }],
        },
      },
      {
        id: '2',
        name: {
          full: 'character 2',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[0],
          }],
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => ({
        likes: [
          { characterId: 'anilist:1' },
          { characterId: 'anilist:2' },
        ],
      } as any),
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () =>
        ({
          inventory: {
            party: {
              member1: '1',
            },
          },
        }) as any,
    );

    const getUserCharactersStub = stub(
      db,
      'getUserCharacters',
      () =>
        [
          {
            value: {
              _id: '1',
              id: 'anilist:1',
              mediaId: 'anilist:0',
              rating: 1,
            },
          },
          {
            value: {
              id: 'anilist:2',
              mediaId: 'anilist:0',
              rating: 1,
            },
          },
        ] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        rating: 1,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'list=user_id==1=0=prev',
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
                  custom_id: 'list=user_id==1=0=next',
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
                  name: 'title 1',
                  value:
                    '1<:smolstar:1107503653956374638><:partymember:1135706921312206921> character 1',
                },
                {
                  inline: false,
                  name: 'title 1',
                  value:
                    '1<:smolstar:1107503653956374638><:liked:1110491720375873567> character 2',
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      getUserCharactersStub.restore();
    }
  });

  await test.step('media disabled', async () => {
    const media: AniListMedia[] = [
      {
        id: '1',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
      },
      {
        id: '2',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '3',
        name: {
          full: 'character 1',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[0],
          }],
        },
      },
      {
        id: '4',
        name: {
          full: 'character 2',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[1],
          }],
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const getUserCharactersStub = stub(
      db,
      'getUserCharacters',
      () =>
        [
          {
            value: {
              id: 'anilist:3',
              mediaId: 'anilist:1',
              rating: 1,
            },
          },
          {
            value: {
              id: 'anilist:4',
              mediaId: 'anilist:2',
              rating: 2,
            },
          },
        ] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(
      packs,
      'isDisabled',
      (id) => id === 'anilist:1',
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'list=user_id===0=prev',
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
                  custom_id: 'list=user_id===0=next',
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
                  name: 'title 2',
                  value: '2<:smolstar:1107503653956374638> character 2',
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      getUserCharactersStub.restore();
    }
  });

  await test.step('character disabled', async () => {
    const media: AniListMedia[] = [
      {
        id: '1',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
      },
      {
        id: '2',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '3',
        name: {
          full: 'character 1',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[0],
          }],
        },
      },
      {
        id: '4',
        name: {
          full: 'character 2',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[1],
          }],
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const getUserCharactersStub = stub(
      db,
      'getUserCharacters',
      () =>
        [
          {
            value: {
              id: 'anilist:3',
              mediaId: 'anilist:1',
              rating: 1,
            },
          },
          {
            value: {
              id: 'anilist:4',
              mediaId: 'anilist:2',
              rating: 2,
            },
          },
        ] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(
      packs,
      'isDisabled',
      (id) => id === 'anilist:3',
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'list=user_id===0=prev',
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
                  custom_id: 'list=user_id===0=next',
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
                  name: 'title 2',
                  value: '2<:smolstar:1107503653956374638> character 2',
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      getUserCharactersStub.restore();
    }
  });

  await test.step('no characters (Dave)', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        undefined,
      ] as any),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const getUserCharactersStub = stub(
      db,
      'getUserCharacters',
      () => [] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        nick: true,
        userId: 'another_user_id',
        guildId: 'guild_id',
        token: 'test_token',
        rating: 5,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            description:
              "<@another_user_id> doesn't have any 5<:smolstar:1107503653956374638>characters",
          }],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      getUserCharactersStub.restore();
    }
  });

  await test.step('no characters (Self)', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        undefined,
      ] as any),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const getUserCharactersStub = stub(
      db,
      'getUserCharacters',
      () => [] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        rating: 5,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [{
            type: 1,
            components: [{
              custom_id: 'gacha=user_id',
              label: '/gacha',
              style: 2,
              type: 2,
            }],
          }],
          embeds: [{
            type: 'rich',
            description:
              "You don't have any 5<:smolstar:1107503653956374638>characters",
          }],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      getUserCharactersStub.restore();
    }
  });
});

Deno.test('/collection media', async (test) => {
  await test.step('normal', async () => {
    const media: AniListMedia[] = [
      {
        id: '2',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
      },
      {
        id: '4',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[0],
          }],
        },
      },
      {
        id: '3',
        name: {
          full: 'character 2',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[1],
          }],
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const getUserCharactersStub = stub(
      db,
      'getUserCharacters',
      () =>
        [
          {
            value: {
              id: 'anilist:1',
              mediaId: 'anilist:2',
              rating: 1,
            },
          },
          {
            value: {
              id: 'anilist:3',
              mediaId: 'anilist:4',
              rating: 2,
            },
          },
        ] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        id: 'anilist:2',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[2].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[2].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[2].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'list=user_id=anilist:2==0=prev',
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
                  custom_id: 'list=user_id=anilist:2==0=next',
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
                  name: 'title 1',
                  value: '1<:smolstar:1107503653956374638> character 1',
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      getUserCharactersStub.restore();
    }
  });

  await test.step('with nicknames', async () => {
    const media: AniListMedia[] = [
      {
        id: '2',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
      },
      {
        id: '4',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[0],
          }],
        },
      },
      {
        id: '3',
        name: {
          full: 'character 2',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[0],
          }],
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const getUserCharactersStub = stub(
      db,
      'getUserCharacters',
      () =>
        [
          {
            value: {
              id: 'anilist:1',
              mediaId: 'anilist:2',
              nickname: 'nickname 1',
              rating: 1,
            },
          },
          {
            value: {
              id: 'anilist:3',
              mediaId: 'anilist:4',
              nickname: 'nickname 2',
              rating: 2,
            },
          },
        ] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        id: 'anilist:2',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[2].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[2].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[2].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'list=user_id=anilist:2==0=prev',
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
                  custom_id: 'list=user_id=anilist:2==0=next',
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
                  name: 'title 1',
                  value: '1<:smolstar:1107503653956374638> nickname 1',
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      getUserCharactersStub.restore();
    }
  });

  await test.step('with relations', async () => {
    const media: AniListMedia[] = [
      {
        id: '4',
        type: MediaType.Manga,
        title: {
          english: 'title',
        },
        popularity: 100,
        relations: {
          edges: [{
            relationType: MediaRelation.Contains,
            node: {
              id: '5',
              type: MediaType.Manga,
              title: {
                english: 'title 2',
              },
              popularity: 0,
            },
          }],
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[0],
          }],
        },
      },
      {
        id: '2',
        name: {
          full: 'character 2',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            // deno-lint-ignore no-non-null-assertion
            node: media[0].relations!.edges[0].node,
          }],
        },
      },
      {
        id: '3',
        name: {
          full: 'character 3',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[0],
          }],
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const getUserCharactersStub = stub(
      db,
      'getUserCharacters',
      () =>
        [
          {
            value: {
              id: 'anilist:1',
              mediaId: 'anilist:4',
              rating: 1,
            },
          },
          {
            value: {
              id: 'anilist:2',
              mediaId: 'anilist:5',
              rating: 2,
            },
          },
          {
            value: {
              id: 'anilist:3',
              mediaId: 'anilist:4',
              rating: 4,
            },
          },
        ] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        id: 'anilist:4',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[2].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[2].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[2].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'list=user_id=anilist:4==0=prev',
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
                  custom_id: 'list=user_id=anilist:4==0=next',
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
                  value: '4<:smolstar:1107503653956374638> character 3',
                },
                {
                  inline: false,
                  name: 'title',
                  value: '1<:smolstar:1107503653956374638> character 1',
                },
                {
                  inline: false,
                  name: 'title 2',
                  value: '2<:smolstar:1107503653956374638> character 2',
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      getUserCharactersStub.restore();
    }
  });

  await test.step('media disabled', async () => {
    const media: AniListMedia[] = [
      {
        id: '2',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
      },
      {
        id: '4',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[0],
          }],
        },
      },
      {
        id: '3',
        name: {
          full: 'character 2',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[1],
          }],
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const getUserCharactersStub = stub(
      db,
      'getUserCharacters',
      () =>
        [
          {
            value: {
              id: 'anilist:1',
              mediaId: 'anilist:2',
              rating: 1,
            },
          },
          {
            value: {
              id: 'anilist:3',
              mediaId: 'anilist:4',
              rating: 2,
            },
          },
        ] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(
      packs,
      'isDisabled',
      () => true,
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        id: 'anilist:2',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: 'Found _nothing_ matching that query!',
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      getUserCharactersStub.restore();
    }
  });

  await test.step('character disabled', async () => {
    const media: AniListMedia[] = [
      {
        id: '2',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
      },
      {
        id: '4',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[0],
          }],
        },
      },
      {
        id: '3',
        name: {
          full: 'character 2',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: media[1],
          }],
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const getUserCharactersStub = stub(
      db,
      'getUserCharacters',
      () =>
        [
          {
            value: {
              id: 'anilist:1',
              mediaId: 'anilist:2',
              rating: 1,
            },
          },
          {
            value: {
              id: 'anilist:3',
              mediaId: 'anilist:4',
              rating: 2,
            },
          },
        ] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(
      packs,
      'isDisabled',
      returnsNext([
        false,
        true,
      ]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        id: 'anilist:2',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[2].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[2].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[2].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
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
              ],
            },
          ],
          embeds: [
            {
              type: 'rich',
              description: "You don't have any characters from title 1",
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      getUserCharactersStub.restore();
    }
  });

  await test.step('no characters (Dave)', async () => {
    const media: AniListMedia[] = [
      {
        id: '2',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
      },
      {
        id: '4',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
      },
      {
        id: '3',
        name: {
          full: 'character 2',
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const getUserCharactersStub = stub(
      db,
      'getUserCharacters',
      () => [] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'another_user_id',
        guildId: 'guild_id',
        token: 'test_token',
        id: 'anilist:2',
        nick: true,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description:
                "<@another_user_id> doesn't have any characters from title 1",
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      getUserCharactersStub.restore();
    }
  });

  await test.step('no characters (Self)', async () => {
    const media: AniListMedia[] = [
      {
        id: '2',
        type: MediaType.Anime,
        title: {
          english: 'title 1',
        },
      },
      {
        id: '4',
        type: MediaType.Anime,
        title: {
          english: 'title 2',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
      },
      {
        id: '3',
        name: {
          full: 'character 2',
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const getUserCharactersStub = stub(
      db,
      'getUserCharacters',
      () => [] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.list({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        id: 'anilist:2',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
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
              ],
            },
          ],
          embeds: [
            {
              type: 'rich',
              description: "You don't have any characters from title 1",
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      getUserCharactersStub.restore();
    }
  });
});

Deno.test('/collection sum', async (test) => {
  await test.step('normal', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => ({
        likes: [],
      } as any),
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () =>
        ({
          inventory: {
            party: {},
          },
        }) as any,
    );

    const getUserCharactersStub = stub(
      db,
      'getUserCharacters',
      () =>
        [
          {
            value: {
              _id: '1',
              id: 'anilist:1',
              mediaId: 'anilist:0',
              rating: 1,
            },
          },
        ] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.sum({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      const t = [
        '1<:smolstar:1107503653956374638> — **1 character** — 0 <:liked:1110491720375873567>(1)',
        '2<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
        '3<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
        '4<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
        '5<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
      ];

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: t.join('\n'),
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      getUserCharactersStub.restore();
    }
  });

  await test.step('with likes', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => ({
        likes: [
          { characterId: 'anilist:1' },
        ],
      } as any),
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () =>
        ({
          inventory: {
            party: {},
          },
        }) as any,
    );

    const getUserCharactersStub = stub(
      db,
      'getUserCharacters',
      () =>
        [
          {
            value: {
              _id: '1',
              id: 'anilist:1',
              mediaId: 'anilist:0',
              rating: 1,
            },
          },
          {
            value: {
              _id: '2',
              id: 'anilist:2',
              mediaId: 'anilist:0',
              rating: 1,
            },
          },
        ] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.sum({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      const t = [
        '1<:smolstar:1107503653956374638> — **2 characters** — 1 <:liked:1110491720375873567>(1)',
        '2<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
        '3<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
        '4<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
        '5<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
      ];

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: t.join('\n'),
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      getUserCharactersStub.restore();
    }
  });

  await test.step('with likes and party', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => ({
        likes: [
          { characterId: 'anilist:2' },
        ],
      } as any),
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () =>
        ({
          inventory: {
            party: {
              member1: '1',
            },
          },
        }) as any,
    );

    const getUserCharactersStub = stub(
      db,
      'getUserCharacters',
      () =>
        [
          {
            value: {
              _id: '1',
              id: 'anilist:1',
              mediaId: 'anilist:0',
              rating: 1,
            },
          },
          {
            value: {
              _id: '2',
              id: 'anilist:2',
              mediaId: 'anilist:0',
              rating: 1,
            },
          },
        ] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.sum({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      const t = [
        '1<:smolstar:1107503653956374638> — **2 characters** — 2 <:liked:1110491720375873567>(0)',
        '2<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
        '3<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
        '4<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
        '5<:smolstar:1107503653956374638> — **0 characters** — 0 <:liked:1110491720375873567>(0)',
      ];

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: t.join('\n'),
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      getUserCharactersStub.restore();
    }
  });
});

Deno.test('/like', async (test) => {
  await test.step('normal', async () => {
    const character: Character = {
      id: '1',
      packId: 'pack-id',
      name: {
        english: 'character',
      },
      media: {
        edges: [{
          role: CharacterRole.Main,
          node: {
            id: '2',
            type: MediaType.Anime,
            title: {
              english: 'title',
            },
          },
        }],
      },
    };

    const timeStub = new FakeTime();

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const likeCharacterStub = stub(
      db,
      'likeCharacter',
      () => '' as any,
    );

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => (undefined as any),
    );

    const listStub = stub(
      packs,
      'searchOneCharacter',
      () => Promise.resolve(character),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.like({
        userId: 'user_id',
        guildId: 'guild_id',

        token: 'test_token',
        search: 'character',
        undo: false,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'character=pack-id:1',
                  label: '/character',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
          embeds: [
            {
              type: 'rich',
              description: 'Liked',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**character**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      likeCharacterStub.restore();
    }
  });

  await test.step('normal (mentioned)', async () => {
    const character: Character = {
      id: '1',
      packId: 'pack-id',
      name: {
        english: 'character',
      },
      media: {
        edges: [{
          role: CharacterRole.Main,
          node: {
            id: '2',
            type: MediaType.Anime,
            title: {
              english: 'title',
            },
          },
        }],
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => (undefined as any),
    );

    const listStub = stub(
      packs,
      'searchOneCharacter',
      () => Promise.resolve(character),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const likeCharacterStub = stub(
      db,
      'likeCharacter',
      () => '' as any,
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.like({
        userId: 'user_id',
        guildId: 'guild_id',

        token: 'test_token',
        search: 'character',
        mention: true,
        undo: false,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          allowed_mentions: { parse: [] },
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'character=pack-id:1',
                  label: '/character',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
          content: '<@user_id>',
          embeds: [
            {
              type: 'rich',
              description: 'Liked',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**character**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      likeCharacterStub.restore();
    }
  });

  await test.step('undo', async () => {
    const character: Character = {
      id: '1',
      packId: 'pack-id',
      name: {
        english: 'character',
      },
      media: {
        edges: [{
          role: CharacterRole.Main,
          node: {
            id: '2',
            type: MediaType.Anime,
            title: {
              english: 'title',
            },
          },
        }],
      },
    };

    const timeStub = new FakeTime();

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const likeCharacterStub = stub(
      db,
      'unlikeCharacter',
      () => '' as any,
    );

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => (undefined as any),
    );

    const listStub = stub(
      packs,
      'searchOneCharacter',
      () => Promise.resolve(character),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.like({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        search: 'character',
        undo: true,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: 'Unliked',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**character**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      likeCharacterStub.restore();
    }
  });

  await test.step('undo (exists)', async () => {
    const character: Character = {
      id: '1',
      packId: 'pack-id',
      name: {
        english: 'character',
      },
      media: {
        edges: [{
          role: CharacterRole.Main,
          node: {
            id: '2',
            type: MediaType.Anime,
            title: {
              english: 'title',
            },
          },
        }],
      },
    };

    const timeStub = new FakeTime();

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const likeCharacterStub = stub(
      db,
      'unlikeCharacter',
      () => '' as any,
    );

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => (undefined as any),
    );

    const listStub = stub(
      packs,
      'searchOneCharacter',
      () => Promise.resolve(character),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.like({
        userId: 'user_id',
        guildId: 'guild_id',

        token: 'test_token',
        search: 'character',
        undo: true,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: 'Unliked',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**character**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      likeCharacterStub.restore();
    }
  });

  await test.step('undo (owned)', async () => {
    const character: Character = {
      id: '1',
      packId: 'pack-id',
      name: {
        english: 'character',
      },
      media: {
        edges: [{
          role: CharacterRole.Main,
          node: {
            id: '2',
            type: MediaType.Anime,
            title: {
              english: 'title',
            },
          },
        }],
      },
    };

    const timeStub = new FakeTime();

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const likeCharacterStub = stub(
      db,
      'unlikeCharacter',
      () => '' as any,
    );

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => (undefined as any),
    );

    const listStub = stub(
      packs,
      'searchOneCharacter',
      () => Promise.resolve(character),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.like({
        userId: 'user_id',
        guildId: 'guild_id',

        token: 'test_token',
        search: 'character',
        undo: true,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: 'Unliked',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**character**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      likeCharacterStub.restore();
    }
  });

  await test.step('not found', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => (undefined as any),
    );

    const listStub = stub(
      packs,
      'searchOneCharacter',
      () => Promise.resolve(undefined),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.like({
        userId: 'user_id',
        guildId: 'guild_id',

        token: 'test_token',
        search: 'character',
        undo: false,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: 'Found _nothing_ matching that query!',
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
    }
  });
});

Deno.test('/likeall', async (test) => {
  await test.step('normal', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      title: {
        english: 'title',
      },
    };

    const timeStub = new FakeTime();

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const likeMediaStub = stub(
      db,
      'likeMedia',
      () => '' as any,
    );

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => (undefined as any),
    );

    const listStub = stub(
      packs,
      'searchOneMedia',
      () => Promise.resolve(media),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.likeall({
        userId: 'user_id',
        guildId: 'guild_id',

        token: 'test_token',
        search: 'title',
        undo: false,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [
            {
              type: 1,
              components: [
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
              description: 'Liked',
            },
            {
              type: 'rich',
              title: 'title',
              image: {
                url: 'http://localhost:8000/external/',
              },
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      likeMediaStub.restore();
    }
  });

  await test.step('normal (undo)', async () => {
    const media: Media = {
      id: '1',
      packId: 'pack-id',
      type: MediaType.Anime,
      title: {
        english: 'title',
      },
    };

    const timeStub = new FakeTime();

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const likeMediaStub = stub(
      db,
      'unlikeMedia',
      () => '' as any,
    );

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => (undefined as any),
    );

    const listStub = stub(
      packs,
      'searchOneMedia',
      () => Promise.resolve(media),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.likeall({
        userId: 'user_id',
        guildId: 'guild_id',

        token: 'test_token',
        search: 'title',
        undo: true,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: 'Unliked',
            },
            {
              type: 'rich',
              title: 'title',
              image: {
                url: 'http://localhost:8000/external/',
              },
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      likeMediaStub.restore();
    }
  });

  await test.step('not found', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => (undefined as any),
    );

    const listStub = stub(
      packs,
      'searchOneMedia',
      () => Promise.resolve(undefined),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.likeall({
        userId: 'user_id',
        guildId: 'guild_id',

        token: 'test_token',
        search: 'title',
        undo: false,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: 'Found _nothing_ matching that query!',
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });
});

Deno.test('/likeslist', async (test) => {
  await test.step('normal', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
      },
      {
        id: '2',
        name: {
          full: 'character 2',
        },
      },
      {
        id: '3',
        name: {
          full: 'character 3',
        },
      },
      {
        id: '4',
        name: {
          full: 'character 4',
        },
      },
      {
        id: '5',
        name: {
          full: 'character 5',
        },
        media: {
          edges: [],
        },
      },
      {
        id: '6',
        name: {
          full: 'character 6',
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => ({
        likes: [
          { characterId: 'anilist:1' },
          { characterId: 'anilist:2' },
          { characterId: 'anilist:3' },
          { characterId: 'anilist:4' },
          { characterId: 'anilist:5' },
          { characterId: 'anilist:6' },
          { characterId: 'anilist:7' },
          { characterId: 'anilist:8' },
          { characterId: 'anilist:9' },
        ],
      } as any),
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const findCharactersStub = stub(
      db,
      'findCharacters',
      () => [] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.likeslist({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'likes=user_id=0=1=prev',
                  label: 'Prev',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: '_',
                  disabled: true,
                  label: '1/2',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'likes=user_id=0=1=next',
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
                  name: '1<:smolstar:1107503653956374638> character 1',
                  value: '\u200B',
                },
                {
                  inline: false,
                  name: '1<:smolstar:1107503653956374638> character 2',
                  value: '\u200B',
                },
                {
                  inline: false,
                  name: '1<:smolstar:1107503653956374638> character 3',
                  value: '\u200B',
                },
                {
                  inline: false,
                  name: '1<:smolstar:1107503653956374638> character 4',
                  value: '\u200B',
                },
                {
                  inline: false,
                  name: '1<:smolstar:1107503653956374638> character 5',
                  value: '\u200B',
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      findCharactersStub.restore();
    }
  });

  await test.step('normal (exists)', async () => {
    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'character',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: {
            id: '2',
            type: MediaType.Anime,
            title: {
              english: 'title',
            },
          },
        }],
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  characters: [character],
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => ({
        likes: [
          { characterId: 'anilist:1' },
        ],
      } as any),
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const findCharactersStub = stub(
      db,
      'findCharacters',
      () =>
        [
          [{ id: 'anilist:1', rating: 3 }, { id: 'another_user_id' }],
        ] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.likeslist({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'likes=user_id=0=0=prev',
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
                  custom_id: 'likes=user_id=0=0=next',
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
                  value:
                    '3<:smolstar:1107503653956374638> <@another_user_id> character',
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      findCharactersStub.restore();
    }
  });

  await test.step('normal (filtered)', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: {
              id: '1',
              type: MediaType.Anime,
              title: {
                english: 'title 1',
              },
            },
          }],
        },
      },
      {
        id: '2',
        name: {
          full: 'character 2',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: {
              id: '2',
              type: MediaType.Anime,
              title: {
                english: 'title 2',
              },
            },
          }],
        },
      },
      {
        id: '3',
        name: {
          full: 'character 3',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: {
              id: '3',
              type: MediaType.Anime,
              title: {
                english: 'title 3',
              },
            },
          }],
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => ({
        likes: [
          { characterId: 'anilist:1' },
          { characterId: 'anilist:2' },
          { characterId: 'anilist:3' },
        ],
      } as any),
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const findCharactersStub = stub(
      db,
      'findCharacters',
      () =>
        [
          [{ id: 'anilist:1', rating: 3 }, { id: 'user_id' }],
          [{ id: 'anilist:2', rating: 3 }, { id: 'another_user_id' }],
        ] as any,
    );

    const listStub = stub(packs, 'all', () => Promise.resolve([]));

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.likeslist({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        filter: true,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'likes=user_id=1=0=prev',
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
                  custom_id: 'likes=user_id=1=0=next',
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
                  name: 'title 2',
                  value:
                    '3<:smolstar:1107503653956374638> <@another_user_id> character 2',
                },
                {
                  inline: false,
                  name: 'title 3',
                  value: '1<:smolstar:1107503653956374638> character 3',
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      findCharactersStub.restore();
    }
  });

  await test.step('with media', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: {
              id: '1',
              type: MediaType.Anime,
              title: {
                english: 'title 1',
              },
            },
          }],
        },
      },
      {
        id: '2',
        name: {
          full: 'character 2',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: {
              id: '2',
              type: MediaType.Anime,
              title: {
                english: 'title 2',
              },
            },
          }],
        },
      },
    ];

    const media: AniListMedia[] = [
      {
        id: '3',
        title: {
          english: 'all 1',
        },
        type: MediaType.Anime,
      },
      {
        id: '4',
        title: {
          english: 'all 2',
        },
        type: MediaType.Manga,
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  media,
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => ({
        likes: [
          { mediaId: 'anilist:3' },
          { characterId: 'anilist:1' },
          { mediaId: 'anilist:4' },
          { characterId: 'anilist:2' },
        ],
      } as any),
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const findCharactersStub = stub(
      db,
      'findCharacters',
      () => [] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.likeslist({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[2].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[2].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[2].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'likes=user_id=0=0=prev',
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
                  custom_id: 'likes=user_id=0=0=next',
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
                  name: 'title 1',
                  value: '1<:smolstar:1107503653956374638> character 1',
                },
                {
                  inline: false,
                  name: 'title 2',
                  value: '1<:smolstar:1107503653956374638> character 2',
                },
                {
                  inline: false,
                  name: 'all 1',
                  value: '<:all:1107511909999181824>',
                },
                {
                  inline: false,
                  name: 'all 2',
                  value: '<:all:1107511909999181824>',
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      findCharactersStub.restore();
    }
  });

  await test.step('disabled character', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: {
              id: '1',
              type: MediaType.Anime,
              title: {
                english: 'title 1',
              },
            },
          }],
        },
      },
      {
        id: '2',
        name: {
          full: 'character 2',
        },
        media: {
          edges: [{
            characterRole: CharacterRole.Main,
            node: {
              id: '2',
              type: MediaType.Anime,
              title: {
                english: 'title 2',
              },
            },
          }],
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => ({
        likes: [
          { characterId: 'anilist:1' },
          { characterId: 'anilist:2' },
        ],
      } as any),
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const findCharactersStub = stub(
      db,
      'findCharacters',
      () => [] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(
      packs,
      'isDisabled',
      returnsNext([
        true,
        false,
        false,
        false,
      ]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.likeslist({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'likes=user_id=0=0=prev',
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
                  custom_id: 'likes=user_id=0=0=next',
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
                  name: 'title 2',
                  value: '1<:smolstar:1107503653956374638> character 2',
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      findCharactersStub.restore();
    }
  });

  await test.step('no likes (Self)', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        undefined,
      ] as any),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => ({
        likes: [],
      } as any),
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const findCharactersStub = stub(
      db,
      'findCharacters',
      () => [] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.likeslist({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: "You don't have any likes",
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      findCharactersStub.restore();
    }
  });

  await test.step('no likes (Dave)', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        undefined,
      ] as any),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => ({
        likes: [],
      } as any),
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const findCharactersStub = stub(
      db,
      'findCharacters',
      () => [] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.likeslist({
        index: 0,
        userId: 'another_user_id',
        guildId: 'guild_id',
        token: 'test_token',
        nick: true,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: "<@another_user_id> doesn't have any likes",
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      findCharactersStub.restore();
    }
  });
});

Deno.test('/logs', async (test) => {
  await test.step('normal', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
      },
      {
        id: '2',
        name: {
          full: 'character 2',
        },
      },
      {
        id: '3',
        name: {
          full: 'character 3',
        },
      },
      {
        id: '4',
        name: {
          full: 'character 4',
        },
      },
      {
        id: '5',
        name: {
          full: 'character 5',
        },
      },
      {
        id: '6',
        name: {
          full: 'character 6',
        },
      },
      {
        id: '7',
        name: {
          full: 'character 7',
        },
      },
      {
        id: '8',
        name: {
          full: 'character 8',
        },
      },
      {
        id: '9',
        name: {
          full: 'character 9',
        },
      },
      {
        id: '10',
        name: {
          full: 'character 10',
        },
      },
      {
        id: '11',
        name: {
          full: 'character 11',
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const getUserCharactersStub = stub(
      db,
      'getUserCharacters',
      () =>
        [
          { value: { id: 'anilist:1', rating: 4 } },
          { value: { id: 'anilist:2', rating: 4 } },
          { value: { id: 'anilist:3', rating: 4 } },
          { value: { id: 'anilist:4', rating: 4 } },
          { value: { id: 'anilist:5', rating: 4 } },
          { value: { id: 'anilist:6', rating: 4 } },
          { value: { id: 'anilist:7', rating: 4 } },
          { value: { id: 'anilist:8', rating: 4 } },
          { value: { id: 'anilist:9', rating: 4 } },
          { value: { id: 'anilist:10', rating: 4 } },
          { value: { id: 'anilist:11', rating: 4 } },
        ] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.logs({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: [
                '4<:smolstar:1107503653956374638> character 11',
                '4<:smolstar:1107503653956374638> character 10',
                '4<:smolstar:1107503653956374638> character 9',
                '4<:smolstar:1107503653956374638> character 8',
                '4<:smolstar:1107503653956374638> character 7',
                '4<:smolstar:1107503653956374638> character 6',
                '4<:smolstar:1107503653956374638> character 5',
                '4<:smolstar:1107503653956374638> character 4',
                '4<:smolstar:1107503653956374638> character 3',
                '4<:smolstar:1107503653956374638> character 2',
              ].join('\n'),
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      getUserCharactersStub.restore();
    }
  });

  await test.step('with nicknames', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'character 1',
        },
      },
      {
        id: '2',
        name: {
          full: 'character 2',
        },
      },
      {
        id: '3',
        name: {
          full: 'character 3',
        },
      },
      {
        id: '4',
        name: {
          full: 'character 4',
        },
      },
      {
        id: '5',
        name: {
          full: 'character 5',
        },
      },
      {
        id: '6',
        name: {
          full: 'character 6',
        },
      },
      {
        id: '7',
        name: {
          full: 'character 7',
        },
      },
      {
        id: '8',
        name: {
          full: 'character 8',
        },
      },
      {
        id: '9',
        name: {
          full: 'character 9',
        },
      },
      {
        id: '10',
        name: {
          full: 'character 10',
        },
      },
      {
        id: '11',
        name: {
          full: 'character 11',
        },
      },
    ];

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                Page: {
                  characters,
                },
              },
            }))),
        } as any,
        undefined,
      ]),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const getUserCharactersStub = stub(
      db,
      'getUserCharacters',
      () =>
        [
          { value: { id: 'anilist:1', nickname: 'nickname 1', rating: 4 } },
          { value: { id: 'anilist:2', nickname: 'nickname 2', rating: 4 } },
          { value: { id: 'anilist:3', nickname: 'nickname 3', rating: 4 } },
          { value: { id: 'anilist:4', nickname: 'nickname 4', rating: 4 } },
          { value: { id: 'anilist:5', nickname: 'nickname 5', rating: 4 } },
          { value: { id: 'anilist:6', nickname: 'nickname 6', rating: 4 } },
          { value: { id: 'anilist:7', nickname: 'nickname 7', rating: 4 } },
          { value: { id: 'anilist:8', nickname: 'nickname 8', rating: 4 } },
          { value: { id: 'anilist:9', nickname: 'nickname 9', rating: 4 } },
          { value: { id: 'anilist:10', nickname: 'nickname 10', rating: 4 } },
          { value: { id: 'anilist:11', nickname: 'nickname 11', rating: 4 } },
        ] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.logs({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: [
                '4<:smolstar:1107503653956374638> nickname 11',
                '4<:smolstar:1107503653956374638> nickname 10',
                '4<:smolstar:1107503653956374638> nickname 9',
                '4<:smolstar:1107503653956374638> nickname 8',
                '4<:smolstar:1107503653956374638> nickname 7',
                '4<:smolstar:1107503653956374638> nickname 6',
                '4<:smolstar:1107503653956374638> nickname 5',
                '4<:smolstar:1107503653956374638> nickname 4',
                '4<:smolstar:1107503653956374638> nickname 3',
                '4<:smolstar:1107503653956374638> nickname 2',
              ].join('\n'),
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      getUserCharactersStub.restore();
    }
  });

  await test.step('no logs (Self)', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        undefined,
      ] as any),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const getUserCharactersStub = stub(
      db,
      'getUserCharacters',
      () => [] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.logs({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: "You don't have any characters",
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      getUserCharactersStub.restore();
    }
  });

  await test.step('no logs (Dave)', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        undefined,
      ] as any),
    );

    const getUserStub = stub(
      db,
      'getUser',
      () => 'user' as any,
    );

    const getGuildStub = stub(
      db,
      'getGuild',
      () => 'guild' as any,
    );

    const getInstanceStub = stub(
      db,
      'getInstance',
      () => 'instance' as any,
    );

    const getInventoryStub = stub(
      db,
      'getInventory',
      () => ({ inventory: 'inventory' }) as any,
    );

    const getUserCharactersStub = stub(
      db,
      'getUserCharacters',
      () => [] as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = user.logs({
        userId: 'another_user_id',
        guildId: 'guild_id',
        token: 'test_token',
        nick: true,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[0].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[0].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: "<@another_user_id> doesn't have any characters",
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      timeStub.restore();
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();

      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      getUserCharactersStub.restore();
    }
  });
});
