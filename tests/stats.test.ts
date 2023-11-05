// deno-lint-ignore-file no-explicit-any

import { assertEquals, assertRejects, assertThrows } from '$std/assert/mod.ts';

import { FakeTime } from '$std/testing/time.ts';

import {
  assertSpyCallArgs,
  assertSpyCalls,
  returnsNext,
  stub,
} from '$std/testing/mock.ts';

import utils from '../src/utils.ts';

import packs from '../src/packs.ts';
import stats, { newUnclaimed } from '../src/stats.ts';

import config from '../src/config.ts';

import db from '../db/mod.ts';

import { NonFetalError } from '../src/errors.ts';

Deno.test('test new unclaimed stats', () => {
  assertEquals(newUnclaimed(1), 3);
  assertEquals(newUnclaimed(2), 6);
  assertEquals(newUnclaimed(3), 9);
  assertEquals(newUnclaimed(4), 12);
  assertEquals(newUnclaimed(5), 15);
});

Deno.test('update stats', async (test) => {
  await test.step('reset', async () => {
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

    const findCharactersStub = stub(
      db,
      'findCharacters',
      () =>
        [[{
          id: 'id:1',
          rating: 4,
          combat: {
            stats: {
              unclaimed: 1,
              strength: 2,
              stamina: 3,
              agility: 4,
            },
          },
        }]] as any,
    );

    const assignStatsStub = stub(
      db,
      'assignStats',
      () => '_' as any,
    );

    const statsStub = stub(stats, 'view', () => undefined as any);

    try {
      await stats.update({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        characterId: 'character_id',
        type: 'reset',
      });

      assertSpyCallArgs(assignStatsStub, 0, [
        'inventory',
        'character_id',
        10,
        0,
        0,
        0,
      ]);
    } finally {
      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      findCharactersStub.restore();
      assignStatsStub.restore();
      statsStub.restore();
    }
  });

  await test.step('strength', async () => {
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

    const findCharactersStub = stub(
      db,
      'findCharacters',
      () =>
        [[{
          id: 'id:1',
          rating: 4,
          combat: {
            stats: {
              unclaimed: 1,
              strength: 2,
              stamina: 3,
              agility: 4,
            },
          },
        }]] as any,
    );

    const assignStatsStub = stub(
      db,
      'assignStats',
      () => '_' as any,
    );

    const statsStub = stub(stats, 'view', () => undefined as any);

    try {
      await stats.update({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        characterId: 'character_id',
        type: 'str',
      });

      assertSpyCallArgs(assignStatsStub, 0, [
        'inventory',
        'character_id',
        0,
        3,
        3,
        4,
      ]);
    } finally {
      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      findCharactersStub.restore();
      assignStatsStub.restore();
      statsStub.restore();
    }
  });

  await test.step('stamina', async () => {
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

    const findCharactersStub = stub(
      db,
      'findCharacters',
      () =>
        [[{
          id: 'id:1',
          rating: 4,
          combat: {
            stats: {
              unclaimed: 1,
              strength: 2,
              stamina: 3,
              agility: 4,
            },
          },
        }]] as any,
    );

    const assignStatsStub = stub(
      db,
      'assignStats',
      () => '_' as any,
    );

    const statsStub = stub(stats, 'view', () => undefined as any);

    try {
      await stats.update({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        characterId: 'character_id',
        type: 'sta',
      });

      assertSpyCallArgs(assignStatsStub, 0, [
        'inventory',
        'character_id',
        0,
        2,
        4,
        4,
      ]);
    } finally {
      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      findCharactersStub.restore();
      assignStatsStub.restore();
      statsStub.restore();
    }
  });

  await test.step('agility', async () => {
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

    const findCharactersStub = stub(
      db,
      'findCharacters',
      () =>
        [[{
          id: 'id:1',
          rating: 4,
          combat: {
            stats: {
              unclaimed: 1,
              strength: 2,
              stamina: 3,
              agility: 4,
            },
          },
        }]] as any,
    );

    const assignStatsStub = stub(
      db,
      'assignStats',
      () => '_' as any,
    );

    const statsStub = stub(stats, 'view', () => undefined as any);

    try {
      await stats.update({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        characterId: 'character_id',
        type: 'agi',
      });

      assertSpyCallArgs(assignStatsStub, 0, [
        'inventory',
        'character_id',
        0,
        2,
        3,
        5,
      ]);
    } finally {
      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      findCharactersStub.restore();
      assignStatsStub.restore();
      statsStub.restore();
    }
  });

  await test.step('distribution', async () => {
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

    const findCharactersStub = stub(
      db,
      'findCharacters',
      () =>
        [[{
          id: 'id:1',
          rating: 4,
          combat: {
            stats: {
              unclaimed: 1,
              strength: 2,
              stamina: 3,
              agility: 4,
            },
          },
        }]] as any,
    );

    const assignStatsStub = stub(
      db,
      'assignStats',
      () => '_' as any,
    );

    const statsStub = stub(stats, 'view', () => undefined as any);

    try {
      await stats.update({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        characterId: 'character_id',
        distribution: '2-2-2',
        type: 'reset',
      });

      assertSpyCallArgs(assignStatsStub, 0, [
        'inventory',
        'character_id',
        4,
        2,
        2,
        2,
      ]);
    } finally {
      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      findCharactersStub.restore();
      assignStatsStub.restore();
      statsStub.restore();
    }
  });

  await test.step('distribution', async () => {
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

    const findCharactersStub = stub(
      db,
      'findCharacters',
      () =>
        [[{
          id: 'id:1',
          rating: 4,
          combat: {
            stats: {
              unclaimed: 15,
              strength: 0,
              stamina: 0,
              agility: 0,
            },
          },
        }]] as any,
    );

    const assignStatsStub = stub(
      db,
      'assignStats',
      () => '_' as any,
    );

    const statsStub = stub(stats, 'view', () => undefined as any);

    try {
      await stats.update({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        characterId: 'character_id',
        distribution: '0-10-5',
        type: 'reset',
      });

      assertSpyCallArgs(assignStatsStub, 0, [
        'inventory',
        'character_id',
        0,
        0,
        10,
        5,
      ]);
    } finally {
      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      findCharactersStub.restore();
      assignStatsStub.restore();
      statsStub.restore();
    }
  });

  await test.step('distribution with not enough points', async () => {
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

    const findCharactersStub = stub(
      db,
      'findCharacters',
      () =>
        [[{
          id: 'id:1',
          rating: 4,
          combat: {
            stats: {
              unclaimed: 1,
              strength: 2,
              stamina: 3,
              agility: 4,
            },
          },
        }]] as any,
    );

    const statsStub = stub(stats, 'view', () => undefined as any);

    try {
      await assertRejects(
        () =>
          stats.update({
            token: 'test_token',
            userId: 'user_id',
            guildId: 'guild_id',
            characterId: 'character_id',
            type: 'reset',
            distribution: '9-9-9',
          }),
        NonFetalError,
        'Character doesn\'t have enough unclaimed points left',
      );
    } finally {
      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      findCharactersStub.restore();
      statsStub.restore();
    }
  });

  await test.step('incorrect distribution format', async () => {
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

    const findCharactersStub = stub(
      db,
      'findCharacters',
      () =>
        [[{
          id: 'id:1',
          rating: 4,
          combat: {
            stats: {
              unclaimed: 1,
              strength: 2,
              stamina: 3,
              agility: 4,
            },
          },
        }]] as any,
    );

    const statsStub = stub(stats, 'view', () => undefined as any);

    try {
      await assertRejects(
        () =>
          stats.update({
            token: 'test_token',
            userId: 'user_id',
            guildId: 'guild_id',
            characterId: 'character_id',
            type: 'reset',
            distribution: 'a-b-c',
          }),
        NonFetalError,
        'Incorrect distribution format!\n\n**Correct:** STR-STA-AGI\n**Example:** 1-2-3',
      );
    } finally {
      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      findCharactersStub.restore();
      statsStub.restore();
    }
  });

  await test.step('not owned', async () => {
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

    const findCharactersStub = stub(
      db,
      'findCharacters',
      () =>
        [[{
          id: 'id:1',
          rating: 4,
          combat: {
            stats: {
              unclaimed: 1,
              strength: 2,
              stamina: 3,
              agility: 4,
            },
          },
        }]] as any,
    );

    const assignStatsStub = stub(
      db,
      'assignStats',
      () => {
        throw new Error('CHARACTER_NOT_OWNED');
      },
    );

    const statsStub = stub(stats, 'view', () => undefined as any);

    try {
      await assertRejects(
        () =>
          stats.update({
            token: 'test_token',
            userId: 'user_id',
            guildId: 'guild_id',
            characterId: 'character_id',
            type: 'reset',
          }),
        NonFetalError,
        'You don\'t have permission to complete this interaction!',
      );
    } finally {
      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      findCharactersStub.restore();
      assignStatsStub.restore();
      statsStub.restore();
    }
  });

  await test.step('not enough unclaimed', async () => {
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

    const findCharactersStub = stub(
      db,
      'findCharacters',
      () =>
        [[{
          id: 'id:1',
          rating: 4,
          combat: {
            stats: {
              unclaimed: 0,
              strength: 0,
              stamina: 0,
              agility: 0,
            },
          },
        }]] as any,
    );

    const statsStub = stub(stats, 'view', () => undefined as any);

    try {
      await assertRejects(
        () =>
          stats.update({
            token: 'test_token',
            userId: 'user_id',
            guildId: 'guild_id',
            characterId: 'character_id',
            type: 'str',
          }),
        NonFetalError,
        'Character doesn\'t have enough unclaimed points left',
      );
    } finally {
      getUserStub.restore();
      getGuildStub.restore();
      getInstanceStub.restore();
      getInventoryStub.restore();
      findCharactersStub.restore();
      statsStub.restore();
    }
  });
});

Deno.test('/stats', async (test) => {
  await test.step('normal', async () => {
    const characterStub = stub(
      packs,
      'characters',
      returnsNext([
        Promise.resolve([{
          id: '1',
          packId: 'id',
          name: {
            english: 'full name',
          },
          images: [{
            url: 'image_url',
          }],
        }]),
      ]),
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    const aggregateStub = stub(
      packs,
      'aggregate',
      ({ character }) => Promise.resolve(character),
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
        [[{
          id: 'id:1',
          rating: 4,
          combat: {
            level: 2,
            exp: 10,
            skillPoints: 6,
            stats: {
              unclaimed: 0,
              strength: 2,
              stamina: 3,
              agility: 4,
            },
          },
        }, { id: 'user_id' }]] as any,
    );

    config.combat = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = stats.view({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        character: 'character_id',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner3.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 1);

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
          embeds: [
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906>',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name',
                  value: 'Level 2\n10/20',
                },
                {
                  name: 'Stats',
                  value:
                    'Skill Points: 6\nStat Points: 0\nStrength: 2\nStamina: 3\nAgility: 4',
                },
              ],
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'stats=str=user_id=id:1',
                  disabled: true,
                  label: '+1 STR',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'stats=sta=user_id=id:1',
                  disabled: true,
                  label: '+1 STA',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'stats=agi=user_id=id:1',
                  disabled: true,
                  label: '+1 AGI',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'stats=reset=user_id=id:1',
                  label: 'Reset',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.combat;

      timeStub.restore();
      characterStub.restore();
      aggregateStub.restore();
      fetchStub.restore();

      getGuildStub.restore();
      getInstanceStub.restore();
      findCharactersStub.restore();
    }
  });

  await test.step('skills', async () => {
    const characterStub = stub(
      packs,
      'characters',
      returnsNext([
        Promise.resolve([{
          id: '1',
          packId: 'id',
          name: {
            english: 'full name',
          },
          images: [{
            url: 'image_url',
          }],
        }]),
      ]),
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    const aggregateStub = stub(
      packs,
      'aggregate',
      ({ character }) => Promise.resolve(character),
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
        [[{
          id: 'id:1',
          rating: 4,
          combat: {
            level: 2,
            exp: 10,
            skillPoints: 6,
            skills: {
              'crit': 2,
            },
            stats: {
              unclaimed: 0,
              strength: 2,
              stamina: 3,
              agility: 4,
            },
          },
        }, { id: 'user_id' }]] as any,
    );

    config.combat = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = stats.view({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        character: 'character_id',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner3.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 1);

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
          embeds: [
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906>',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name',
                  value: 'Level 2\n10/20',
                },
                {
                  name: 'Skills',
                  value: 'Critical Hit (LVL 2)',
                },
                {
                  name: 'Stats',
                  value:
                    'Skill Points: 6\nStat Points: 0\nStrength: 2\nStamina: 3\nAgility: 4',
                },
              ],
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'stats=str=user_id=id:1',
                  disabled: true,
                  label: '+1 STR',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'stats=sta=user_id=id:1',
                  disabled: true,
                  label: '+1 STA',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'stats=agi=user_id=id:1',
                  disabled: true,
                  label: '+1 AGI',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'stats=reset=user_id=id:1',
                  label: 'Reset',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.combat;

      timeStub.restore();
      characterStub.restore();
      aggregateStub.restore();
      fetchStub.restore();

      getGuildStub.restore();
      getInstanceStub.restore();
      findCharactersStub.restore();
    }
  });

  await test.step('empty', async () => {
    const characterStub = stub(
      packs,
      'characters',
      returnsNext([
        Promise.resolve([{
          id: '1',
          packId: 'id',
          name: {
            english: 'full name',
          },
          images: [{
            url: 'image_url',
          }],
        }]),
      ]),
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    const aggregateStub = stub(
      packs,
      'aggregate',
      ({ character }) => Promise.resolve(character),
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
        [[{
          id: 'id:1',
          rating: 4,
        }, { id: 'user_id' }]] as any,
    );

    config.combat = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = stats.view({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        character: 'character_id',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner3.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 1);

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
          embeds: [
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906>',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name',
                  value: 'Level 1\n0/10',
                },
                {
                  name: 'Stats',
                  value:
                    'Skill Points: 0\nStat Points: 12\nStrength: 0\nStamina: 0\nAgility: 0',
                },
              ],
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'stats=str=user_id=id:1',
                  disabled: false,
                  label: '+1 STR',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'stats=sta=user_id=id:1',
                  disabled: false,
                  label: '+1 STA',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'stats=agi=user_id=id:1',
                  disabled: false,
                  label: '+1 AGI',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'stats=reset=user_id=id:1',
                  label: 'Reset',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.combat;

      timeStub.restore();
      characterStub.restore();
      aggregateStub.restore();
      fetchStub.restore();

      getGuildStub.restore();
      getInstanceStub.restore();
      findCharactersStub.restore();
    }
  });

  await test.step('not fit for combat (not owned)', async () => {
    const characterStub = stub(
      packs,
      'characters',
      returnsNext([
        Promise.resolve([{
          id: '1',
          packId: 'id',
          name: {
            english: 'full name',
          },
          images: [{
            url: 'image_url',
          }],
        }]),
      ]),
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    const aggregateStub = stub(
      packs,
      'aggregate',
      ({ character }) => Promise.resolve(character),
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

    config.combat = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = stats.view({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        character: 'character_id',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner3.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 1);

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
              description:
                '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name',
                  value: '\u200B',
                },
              ],
              footer: {
                text: 'Character is yet to be found and isn\'t combat ready',
              },
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.combat;

      timeStub.restore();
      characterStub.restore();
      aggregateStub.restore();
      fetchStub.restore();

      getGuildStub.restore();
      getInstanceStub.restore();
      findCharactersStub.restore();
    }
  });

  await test.step('not owned by you (when distribution is defined)', async () => {
    const characterStub = stub(
      packs,
      'characters',
      returnsNext([
        Promise.resolve([{
          id: '1',
          packId: 'id',
          name: {
            english: 'full name',
          },
          images: [{
            url: 'image_url',
          }],
        }]),
      ]),
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () => undefined as any,
    );

    const aggregateStub = stub(
      packs,
      'aggregate',
      ({ character }) => Promise.resolve(character),
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
      () => [[{ rating: 1 }, { id: 'another_user_id' }]] as any,
    );

    config.combat = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = stats.view({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        character: 'character_id',
        distribution: '1-2-3',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/spinner3.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 1);

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
              description: 'full name is not owned by you',
            },
            {
              type: 'rich',
              description:
                '<@another_user_id>\n\n<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name',
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
      delete config.combat;

      timeStub.restore();
      characterStub.restore();
      aggregateStub.restore();
      fetchStub.restore();

      getGuildStub.restore();
      getInstanceStub.restore();
      findCharactersStub.restore();
    }
  });

  await test.step('maintenance', () => {
    config.combat = false;

    try {
      assertThrows(
        () =>
          stats.view({
            userId: 'user_id',
            guildId: 'guild_id',
            token: 'test_token',
            character: 'character_id',
          }),
        NonFetalError,
        'Combat is under maintenance, try again later!',
      );
    } finally {
      delete config.combat;
    }
  });
});
