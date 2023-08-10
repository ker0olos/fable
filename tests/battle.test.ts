// deno-lint-ignore-file no-explicit-any

import {
  assertEquals,
  assertRejects,
  assertThrows,
} from '$std/testing/asserts.ts';

import { FakeTime } from '$std/testing/time.ts';

import { assertSpyCalls, returnsNext, stub } from '$std/testing/mock.ts';

import utils from '../src/utils.ts';

import packs from '../src/packs.ts';
import user from '../src/user.ts';
import battle from '../src/battle.ts';

import config from '../src/config.ts';

import { NonFetalError } from '../src/errors.ts';

Deno.test('update stats', async (test) => {
  await test.step('reset', async () => {
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () =>
        Promise.resolve({
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                setCharacterStats: {
                  ok: true,
                },
              },
            }))),
        } as any),
    );

    const userStub = stub(
      user,
      'findCharacter',
      () =>
        Promise.resolve({
          id: 'id:1',
          user: { id: 'user_id' },
          mediaId: 'media_id',
          rating: 4,
          combat: {
            stats: {
              unclaimed: 1,
              strength: 2,
              stamina: 3,
              agility: 4,
            },
          },
        }),
    );

    const battleStub = stub(battle, 'stats', () => undefined as any);

    config.faunaSecret = 'fauna_secret';

    try {
      await battle.updateStats({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        characterId: 'character_id',
        type: 'reset',
      });

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://graphql.us.fauna.com/graphql',
      );

      assertEquals(
        fetchStub.calls[0].args[1]?.headers?.entries,
        new Headers({
          accept: 'application/json',
          authorization: 'Bearer fauna_secret',
          'content-type': 'application/json',
        }).entries,
      );

      assertEquals(
        JSON.parse(fetchStub.calls[0].args[1]?.body as string).variables,
        {
          userId: 'user_id',
          guildId: 'guild_id',
          characterId: 'character_id',
          unclaimed: 10,
          strength: 0,
          stamina: 0,
          agility: 0,
        },
      );
    } finally {
      delete config.faunaSecret;

      fetchStub.restore();
      userStub.restore();
      battleStub.restore();
    }
  });

  await test.step('strength', async () => {
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () =>
        Promise.resolve({
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                setCharacterStats: {
                  ok: true,
                },
              },
            }))),
        } as any),
    );

    const userStub = stub(
      user,
      'findCharacter',
      () =>
        Promise.resolve({
          id: 'id:1',
          user: { id: 'user_id' },
          mediaId: 'media_id',
          rating: 4,
          combat: {
            stats: {
              unclaimed: 1,
              strength: 2,
              stamina: 3,
              agility: 4,
            },
          },
        }),
    );

    const battleStub = stub(battle, 'stats', () => undefined as any);

    config.faunaSecret = 'fauna_secret';

    try {
      await battle.updateStats({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        characterId: 'character_id',
        type: 'str',
      });

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://graphql.us.fauna.com/graphql',
      );

      assertEquals(
        fetchStub.calls[0].args[1]?.headers?.entries,
        new Headers({
          accept: 'application/json',
          authorization: 'Bearer fauna_secret',
          'content-type': 'application/json',
        }).entries,
      );

      assertEquals(
        JSON.parse(fetchStub.calls[0].args[1]?.body as string).variables,
        {
          userId: 'user_id',
          guildId: 'guild_id',
          characterId: 'character_id',
          unclaimed: 0,
          strength: 3,
          stamina: 3,
          agility: 4,
        },
      );
    } finally {
      delete config.faunaSecret;

      fetchStub.restore();
      userStub.restore();
      battleStub.restore();
    }
  });

  await test.step('stamina', async () => {
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () =>
        Promise.resolve({
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                setCharacterStats: {
                  ok: true,
                },
              },
            }))),
        } as any),
    );

    const userStub = stub(
      user,
      'findCharacter',
      () =>
        Promise.resolve({
          id: 'id:1',
          user: { id: 'user_id' },
          mediaId: 'media_id',
          rating: 4,
          combat: {
            stats: {
              unclaimed: 1,
              strength: 2,
              stamina: 3,
              agility: 4,
            },
          },
        }),
    );

    const battleStub = stub(battle, 'stats', () => undefined as any);

    config.faunaSecret = 'fauna_secret';

    try {
      await battle.updateStats({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        characterId: 'character_id',
        type: 'sta',
      });

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://graphql.us.fauna.com/graphql',
      );

      assertEquals(
        fetchStub.calls[0].args[1]?.headers?.entries,
        new Headers({
          accept: 'application/json',
          authorization: 'Bearer fauna_secret',
          'content-type': 'application/json',
        }).entries,
      );

      assertEquals(
        JSON.parse(fetchStub.calls[0].args[1]?.body as string).variables,
        {
          userId: 'user_id',
          guildId: 'guild_id',
          characterId: 'character_id',
          unclaimed: 0,
          strength: 2,
          stamina: 4,
          agility: 4,
        },
      );
    } finally {
      delete config.faunaSecret;

      fetchStub.restore();
      userStub.restore();
      battleStub.restore();
    }
  });

  await test.step('agility', async () => {
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () =>
        Promise.resolve({
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                setCharacterStats: {
                  ok: true,
                },
              },
            }))),
        } as any),
    );

    const userStub = stub(
      user,
      'findCharacter',
      () =>
        Promise.resolve({
          id: 'id:1',
          user: { id: 'user_id' },
          mediaId: 'media_id',
          rating: 4,
          combat: {
            stats: {
              unclaimed: 1,
              strength: 2,
              stamina: 3,
              agility: 4,
            },
          },
        }),
    );

    const battleStub = stub(battle, 'stats', () => undefined as any);

    config.faunaSecret = 'fauna_secret';

    try {
      await battle.updateStats({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        characterId: 'character_id',
        type: 'agi',
      });

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://graphql.us.fauna.com/graphql',
      );

      assertEquals(
        fetchStub.calls[0].args[1]?.headers?.entries,
        new Headers({
          accept: 'application/json',
          authorization: 'Bearer fauna_secret',
          'content-type': 'application/json',
        }).entries,
      );

      assertEquals(
        JSON.parse(fetchStub.calls[0].args[1]?.body as string).variables,
        {
          userId: 'user_id',
          guildId: 'guild_id',
          characterId: 'character_id',
          unclaimed: 0,
          strength: 2,
          stamina: 3,
          agility: 5,
        },
      );
    } finally {
      delete config.faunaSecret;

      fetchStub.restore();
      userStub.restore();
      battleStub.restore();
    }
  });

  await test.step('distribution', async () => {
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () =>
        Promise.resolve({
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                setCharacterStats: {
                  ok: true,
                },
              },
            }))),
        } as any),
    );

    const userStub = stub(
      user,
      'findCharacter',
      () =>
        Promise.resolve({
          id: 'id:1',
          user: { id: 'user_id' },
          mediaId: 'media_id',
          rating: 4,
          combat: {
            stats: {
              unclaimed: 1,
              strength: 2,
              stamina: 3,
              agility: 4,
            },
          },
        }),
    );

    const battleStub = stub(battle, 'stats', () => undefined as any);

    config.faunaSecret = 'fauna_secret';

    try {
      await battle.updateStats({
        token: 'test_token',
        userId: 'user_id',
        guildId: 'guild_id',
        characterId: 'character_id',
        distribution: '2-2-2',
        type: 'reset',
      });

      assertEquals(
        fetchStub.calls[0].args[0],
        'https://graphql.us.fauna.com/graphql',
      );

      assertEquals(
        fetchStub.calls[0].args[1]?.headers?.entries,
        new Headers({
          accept: 'application/json',
          authorization: 'Bearer fauna_secret',
          'content-type': 'application/json',
        }).entries,
      );

      assertEquals(
        JSON.parse(fetchStub.calls[0].args[1]?.body as string).variables,
        {
          userId: 'user_id',
          guildId: 'guild_id',
          characterId: 'character_id',
          unclaimed: 4,
          strength: 2,
          stamina: 2,
          agility: 2,
        },
      );
    } finally {
      delete config.faunaSecret;

      fetchStub.restore();
      userStub.restore();
      battleStub.restore();
    }
  });

  await test.step('distribution with not enough points', async () => {
    const userStub = stub(
      user,
      'findCharacter',
      () =>
        Promise.resolve({
          id: 'id:1',
          user: { id: 'user_id' },
          mediaId: 'media_id',
          rating: 4,
          combat: {
            stats: {
              unclaimed: 1,
              strength: 2,
              stamina: 3,
              agility: 4,
            },
          },
        }),
    );

    const battleStub = stub(battle, 'stats', () => undefined as any);

    config.faunaSecret = 'fauna_secret';

    try {
      await assertRejects(
        () =>
          battle.updateStats({
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
      userStub.restore();
      battleStub.restore();
    }
  });

  await test.step('incorrect distribution format', async () => {
    const userStub = stub(
      user,
      'findCharacter',
      () =>
        Promise.resolve({
          id: 'id:1',
          user: { id: 'user_id' },
          mediaId: 'media_id',
          rating: 4,
          combat: {
            stats: {
              unclaimed: 1,
              strength: 2,
              stamina: 3,
              agility: 4,
            },
          },
        }),
    );

    const battleStub = stub(battle, 'stats', () => undefined as any);

    config.faunaSecret = 'fauna_secret';

    try {
      await assertRejects(
        () =>
          battle.updateStats({
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
      userStub.restore();
      battleStub.restore();
    }
  });

  await test.step('not owned', async () => {
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      () =>
        Promise.resolve({
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                setCharacterStats: {
                  ok: false,
                  error: 'CHARACTER_NOT_OWNED',
                },
              },
            }))),
        } as any),
    );

    const userStub = stub(
      user,
      'findCharacter',
      () =>
        Promise.resolve({
          id: 'id:1',
          user: { id: 'another_user_id' },
          mediaId: 'media_id',
          rating: 4,
          combat: {
            stats: {
              unclaimed: 1,
              strength: 2,
              stamina: 3,
              agility: 4,
            },
          },
        }),
    );

    const battleStub = stub(battle, 'stats', () => undefined as any);

    try {
      await assertRejects(
        () =>
          battle.updateStats({
            token: 'test_token',
            userId: 'user_id',
            guildId: 'guild_id',
            characterId: 'character_id',
            type: 'reset',
          }),
        NonFetalError,
        'Some of those characters changed hands',
      );
    } finally {
      fetchStub.restore();
      userStub.restore();
      battleStub.restore();
    }
  });

  await test.step('not enough unclaimed', async () => {
    const userStub = stub(
      user,
      'findCharacter',
      () =>
        Promise.resolve({
          id: 'id:1',
          user: { id: 'user_id' },
          mediaId: 'media_id',
          rating: 4,
          combat: {
            stats: {
              unclaimed: 0,
              strength: 1,
              stamina: 1,
              agility: 1,
            },
          },
        }),
    );

    const battleStub = stub(battle, 'stats', () => undefined as any);

    try {
      await assertRejects(
        () =>
          battle.updateStats({
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
      userStub.restore();
      battleStub.restore();
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

    const userStub = stub(
      user,
      'findCharacter',
      () =>
        Promise.resolve({
          id: 'id:1',
          user: { id: 'user_id' },
          mediaId: 'media_id',
          rating: 4,
          combat: {
            stats: {
              unclaimed: 0,
              strength: 2,
              stamina: 3,
              agility: 4,
            },
          },
        }),
    );

    config.combat = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = battle.stats({
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
                  value: '\u200B',
                },
                {
                  name: 'Stats',
                  value: 'Unclaimed: 0\nStrength: 2\nStamina: 3\nAgility: 4',
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
      userStub.restore();
      fetchStub.restore();
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

    const userStub = stub(
      user,
      'findCharacter',
      () =>
        Promise.resolve({
          id: 'id:1',
          user: { id: 'user_id' },
          mediaId: 'media_id',
          rating: 4,
        }),
    );

    config.combat = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = battle.stats({
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
                  value: '\u200B',
                },
                {
                  name: 'Stats',
                  value: 'Unclaimed: 12\nStrength: 0\nStamina: 0\nAgility: 0',
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
      userStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('not found', async () => {
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

    const userStub = stub(
      user,
      'findCharacter',
      () => Promise.resolve(undefined),
    );

    config.combat = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = battle.stats({
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
      userStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('maintenance', () => {
    config.combat = false;

    try {
      assertThrows(
        () =>
          battle.stats({
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
