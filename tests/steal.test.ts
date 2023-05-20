// deno-lint-ignore-file no-explicit-any

import {
  assertEquals,
  assertRejects,
} from 'https://deno.land/std@0.186.0/testing/asserts.ts';

import { FakeTime } from 'https://deno.land/std@0.186.0/testing/time.ts';

import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from 'https://deno.land/std@0.186.0/testing/mock.ts';

import user from '../src/user.ts';
import packs from '../src/packs.ts';
import utils from '../src/utils.ts';

import steal from '../src/steal.ts';

import config from '../src/config.ts';

import { Character, CharacterRole, MediaType } from '../src/types.ts';

import { NonFetalError } from '../src/errors.ts';

Deno.test('chances', async (test) => {
  await test.step('5*', async (test) => {
    const rating = 5;

    await test.step('no inactive time', () => {
      const chance = steal.getChances({
        id: '',
        mediaId: '',
        rating,
        user: {},
        inventory: {
          lastPull: undefined,
        },
      });

      assertEquals(1, chance);
    });

    await test.step('1 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 1);

      const chance = steal.getChances({
        id: '',
        mediaId: '',
        rating,
        user: {},
        inventory: {
          lastPull: date.toISOString(),
        },
      });

      assertEquals(6, chance);
    });

    await test.step('7 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 7);

      const chance = steal.getChances({
        id: '',
        mediaId: '',
        rating,
        user: {},
        inventory: {
          lastPull: date.toISOString(),
        },
      });

      assertEquals(26, chance);
    });

    await test.step('14 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 14);

      const chance = steal.getChances({
        id: '',
        mediaId: '',
        rating,
        user: {},
        inventory: {
          lastPull: date.toISOString(),
        },
      });

      assertEquals(51, chance);
    });
  });

  await test.step('4*', async (test) => {
    const rating = 4;

    await test.step('no inactive time', () => {
      const chance = steal.getChances({
        id: '',
        mediaId: '',
        rating,
        user: {},
        inventory: {
          lastPull: undefined,
        },
      });

      assertEquals(4, chance);
    });

    await test.step('1 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 1);

      const chance = steal.getChances({
        id: '',
        mediaId: '',
        rating,
        user: {},
        inventory: {
          lastPull: date.toISOString(),
        },
      });

      assertEquals(9, chance);
    });

    await test.step('7 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 7);

      const chance = steal.getChances({
        id: '',
        mediaId: '',
        rating,
        user: {},
        inventory: {
          lastPull: date.toISOString(),
        },
      });

      assertEquals(29, chance);
    });

    await test.step('14 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 14);

      const chance = steal.getChances({
        id: '',
        mediaId: '',
        rating,
        user: {},
        inventory: {
          lastPull: date.toISOString(),
        },
      });

      assertEquals(54, chance);
    });
  });

  await test.step('3*', async (test) => {
    const rating = 3;

    await test.step('no inactive time', () => {
      const chance = steal.getChances({
        id: '',
        mediaId: '',
        rating,
        user: {},
        inventory: {
          lastPull: undefined,
        },
      });

      assertEquals(14, chance);
    });

    await test.step('1 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 1);

      const chance = steal.getChances({
        id: '',
        mediaId: '',
        rating,
        user: {},
        inventory: {
          lastPull: date.toISOString(),
        },
      });

      assertEquals(19, chance);
    });

    await test.step('7 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 7);

      const chance = steal.getChances({
        id: '',
        mediaId: '',
        rating,
        user: {},
        inventory: {
          lastPull: date.toISOString(),
        },
      });

      assertEquals(39, chance);
    });

    await test.step('14 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 14);

      const chance = steal.getChances({
        id: '',
        mediaId: '',
        rating,
        user: {},
        inventory: {
          lastPull: date.toISOString(),
        },
      });

      assertEquals(64, chance);
    });
  });

  await test.step('2*', async (test) => {
    const rating = 2;

    await test.step('no inactive time', () => {
      const chance = steal.getChances({
        id: '',
        mediaId: '',
        rating,
        user: {},
        inventory: {
          lastPull: undefined,
        },
      });

      assertEquals(24, chance);
    });

    await test.step('1 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 1);

      const chance = steal.getChances({
        id: '',
        mediaId: '',
        rating,
        user: {},
        inventory: {
          lastPull: date.toISOString(),
        },
      });

      assertEquals(29, chance);
    });

    await test.step('7 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 7);

      const chance = steal.getChances({
        id: '',
        mediaId: '',
        rating,
        user: {},
        inventory: {
          lastPull: date.toISOString(),
        },
      });

      assertEquals(49, chance);
    });

    await test.step('14 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 14);

      const chance = steal.getChances({
        id: '',
        mediaId: '',
        rating,
        user: {},
        inventory: {
          lastPull: date.toISOString(),
        },
      });

      assertEquals(74, chance);
    });
  });

  await test.step('1*', async (test) => {
    const rating = 1;

    await test.step('no inactive time', () => {
      const chance = steal.getChances({
        id: '',
        mediaId: '',
        rating,
        user: {},
        inventory: {
          lastPull: undefined,
        },
      });

      assertEquals(49, chance);
    });

    await test.step('1 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 1);

      const chance = steal.getChances({
        id: '',
        mediaId: '',
        rating,
        user: {},
        inventory: {
          lastPull: date.toISOString(),
        },
      });

      assertEquals(54, chance);
    });

    await test.step('7 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 7);

      const chance = steal.getChances({
        id: '',
        mediaId: '',
        rating,
        user: {},
        inventory: {
          lastPull: date.toISOString(),
        },
      });

      assertEquals(74, chance);
    });

    await test.step('14 inactive day', () => {
      const date = new Date();

      date.setDate(date.getDate() - 14);

      const chance = steal.getChances({
        id: '',
        mediaId: '',
        rating,
        user: {},
        inventory: {
          lastPull: date.toISOString(),
        },
      });

      assertEquals(99, chance);
    });
  });
});

Deno.test('attempt', async (test) => {
  await test.step('success', async () => {
    const character: Character = {
      id: '1',
      packId: 'id',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [{
        url: 'image_url',
      }],
      media: {
        edges: [{
          role: CharacterRole.Main,
          node: {
            id: 'media',
            packId: 'id',
            type: MediaType.Anime,
            title: {
              english: 'media title',
            },
          },
        }],
      },
    };

    const timeStub = new FakeTime();

    const sleepStub = stub(utils, 'sleep', () => Promise.resolve());

    const rngStub = stub(utils, 'rng', () => ({
      value: true,
      chance: 100,
    }));

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                stealCharacter: {
                  ok: true,
                  character: {
                    rating: 2,
                  },
                },
              },
            }))),
        } as any,
        undefined,
        undefined,
        undefined,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const packsStub = stub(
      packs,
      'characters',
      () => Promise.resolve([character]),
    );

    const userStub = stub(
      user,
      'findCharacter',
      () =>
        Promise.resolve({
          id: 'id:1',
          mediaId: 'id:2',
          rating: 2,
          user: {
            id: 'another_user_id',
          },
        }),
    );

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = steal.attempt({
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        token: 'test_token',
        characterId: 'character_id',
        pre: 0,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/steal.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(rngStub, 1);

      assertSpyCall(sleepStub, 0, {
        args: [8],
      });

      assertSpyCalls(fetchStub, 3);

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
              description: '**You Succeed!**',
            },
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
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
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
            },
          ],
        },
      );

      assertEquals(
        fetchStub.calls[2].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token',
      );

      assertEquals(fetchStub.calls[2].args[1]?.method, 'POST');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[2].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          content: '<@another_user_id>',
          components: [],
          attachments: [],
          embeds: [
            {
              type: 'rich',
              description: '**full name** was stolen from you!',
            },
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
              fields: [
                {
                  name: 'media title',
                  value: '**full name**',
                },
                {
                  name: '\u200B',
                  value: '<:remove:1099004424111792158>',
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
      delete config.stealing;
      delete config.appId;
      delete config.origin;

      rngStub.restore();
      sleepStub.restore();
      fetchStub.restore();
      listStub.restore();
      packsStub.restore();
      userStub.restore();
      timeStub.restore();
    }
  });

  await test.step('fail', async () => {
    const character: Character = {
      id: '1',
      packId: 'id',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [{
        url: 'image_url',
      }],
      media: {
        edges: [{
          role: CharacterRole.Main,
          node: {
            id: 'media',
            packId: 'id',
            type: MediaType.Anime,
            title: {
              english: 'media title',
            },
          },
        }],
      },
    };

    const timeStub = new FakeTime('2011/1/25 00:00 UTC');

    const sleepStub = stub(utils, 'sleep', () => Promise.resolve());

    const rngStub = stub(utils, 'rng', () => ({
      value: false,
      chance: 100,
    }));

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                failSteal: {
                  ok: true,
                  inventory: {
                    stealTimestamp: Date.now() + 1000,
                  },
                },
              },
            }))),
        } as any,
        undefined,
        undefined,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const packsStub = stub(
      packs,
      'characters',
      () => Promise.resolve([character]),
    );

    const userStub = stub(
      user,
      'findCharacter',
      () =>
        Promise.resolve({
          id: 'id:1',
          mediaId: 'id:2',
          rating: 2,
          user: {
            id: 'user_id',
          },
        }),
    );

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = steal.attempt({
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        token: 'test_token',
        characterId: 'character_id',
        pre: 0,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/steal.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(rngStub, 1);

      assertSpyCall(sleepStub, 0, {
        args: [8],
      });

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
              description: '**You Failed!**',
            },
            {
              type: 'rich',
              description: 'You can try again <t:1295913601:R>',
            },
          ],
        },
      );
    } finally {
      delete config.stealing;
      delete config.appId;
      delete config.origin;

      rngStub.restore();
      sleepStub.restore();
      fetchStub.restore();
      listStub.restore();
      packsStub.restore();
      userStub.restore();
      timeStub.restore();
    }
  });

  await test.step('on cooldown', async () => {
    const character: Character = {
      id: '1',
      packId: 'id',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [{
        url: 'image_url',
      }],
      media: {
        edges: [{
          role: CharacterRole.Main,
          node: {
            id: 'media',
            packId: 'id',
            type: MediaType.Anime,
            title: {
              english: 'media title',
            },
          },
        }],
      },
    };

    const timeStub = new FakeTime('2011/1/25 00:00 UTC');

    const sleepStub = stub(utils, 'sleep', () => Promise.resolve());

    const rngStub = stub(utils, 'rng', () => ({
      value: true,
      chance: 100,
    }));

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                stealCharacter: {
                  ok: false,
                  error: 'ON_COOLDOWN',
                  inventory: {
                    stealTimestamp: timeStub.now + 1000,
                  },
                },
              },
            }))),
        } as any,
        undefined,
        undefined,
        undefined,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const packsStub = stub(
      packs,
      'characters',
      () => Promise.resolve([character]),
    );

    const userStub = stub(
      user,
      'findCharacter',
      () =>
        Promise.resolve({
          id: 'id:1',
          mediaId: 'id:2',
          rating: 2,
          user: {
            id: 'another_user_id',
          },
        }),
    );

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = steal.attempt({
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        token: 'test_token',
        characterId: 'character_id',
        pre: 0,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/steal.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(rngStub, 1);

      assertSpyCall(sleepStub, 0, {
        args: [8],
      });

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
          embeds: [{
            type: 'rich',
            description: 'Steal is on cooldown, try again <t:1295913601:R>',
          }],
        },
      );
    } finally {
      delete config.stealing;
      delete config.appId;
      delete config.origin;

      rngStub.restore();
      sleepStub.restore();
      fetchStub.restore();
      listStub.restore();
      packsStub.restore();
      userStub.restore();
      timeStub.restore();
    }
  });

  await test.step('chances lowered', async () => {
    const character: Character = {
      id: '1',
      packId: 'id',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [{
        url: 'image_url',
      }],
      media: {
        edges: [{
          role: CharacterRole.Main,
          node: {
            id: 'media',
            packId: 'id',
            type: MediaType.Anime,
            title: {
              english: 'media title',
            },
          },
        }],
      },
    };

    const timeStub = new FakeTime();

    const rngStub = stub(utils, 'rng', () => ({
      value: true,
      chance: 0,
    }));

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                stealCharacter: {
                  ok: true,
                  character: {
                    rating: 2,
                  },
                },
              },
            }))),
        } as any,
        undefined,
        undefined,
        undefined,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const packsStub = stub(
      packs,
      'characters',
      () => Promise.resolve([character]),
    );

    const userStub = stub(
      user,
      'findCharacter',
      () =>
        Promise.resolve({
          id: 'id:1',
          mediaId: 'id:2',
          rating: 2,
          user: {
            id: 'another_user_id',
          },
        }),
    );

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = steal.attempt({
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        token: 'test_token',
        characterId: 'character_id',
        pre: 100,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/steal.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(rngStub, 0);

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
          components: [],
          attachments: [],
          embeds: [
            {
              type: 'rich',
              description:
                'Something happened and affected your chances of stealing **full name**, try again to get up-to-date data!',
            },
          ],
        },
      );
    } finally {
      delete config.stealing;
      delete config.appId;
      delete config.origin;

      rngStub.restore();
      fetchStub.restore();
      listStub.restore();
      packsStub.restore();
      userStub.restore();
      timeStub.restore();
    }
  });

  await test.step('in party', async () => {
    const character: Character = {
      id: '1',
      packId: 'id',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [{
        url: 'image_url',
      }],
      media: {
        edges: [{
          role: CharacterRole.Main,
          node: {
            id: 'media',
            packId: 'id',
            type: MediaType.Anime,
            title: {
              english: 'media title',
            },
          },
        }],
      },
    };

    const timeStub = new FakeTime();

    const rngStub = stub(utils, 'rng', () => ({
      value: true,
      chance: 100,
    }));

    const sleepStub = stub(utils, 'sleep', () => Promise.resolve());

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                stealCharacter: {
                  ok: false,
                  error: 'CHARACTER_IN_PARTY',
                },
              },
            }))),
        } as any,
        undefined,
        undefined,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const packsStub = stub(
      packs,
      'characters',
      () => Promise.resolve([character]),
    );

    const userStub = stub(
      user,
      'findCharacter',
      () =>
        Promise.resolve({
          id: 'id:1',
          mediaId: 'id:2',
          rating: 2,
          user: {
            id: 'user_id',
          },
        }),
    );

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = steal.attempt({
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        token: 'test_token',
        characterId: 'character_id',
        pre: 0,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/steal.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCall(sleepStub, 0, {
        args: [8],
      });

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
          embeds: [{
            type: 'rich',
            description: 'Character is currently in a party',
          }],
        },
      );
    } finally {
      delete config.stealing;
      delete config.appId;
      delete config.origin;

      rngStub.restore();
      sleepStub.restore();
      fetchStub.restore();
      listStub.restore();
      packsStub.restore();
      userStub.restore();
      timeStub.restore();
    }
  });

  await test.step('not found', async () => {
    const character: Character = {
      id: '1',
      packId: 'id',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [{
        url: 'image_url',
      }],
      media: {
        edges: [{
          role: CharacterRole.Main,
          node: {
            id: 'media',
            packId: 'id',
            type: MediaType.Anime,
            title: {
              english: 'media title',
            },
          },
        }],
      },
    };

    const timeStub = new FakeTime();

    const rngStub = stub(utils, 'rng', () => ({
      value: true,
      chance: 100,
    }));

    const sleepStub = stub(utils, 'sleep', () => Promise.resolve());

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                stealCharacter: {
                  ok: false,
                  error: 'CHARACTER_NOT_FOUND',
                },
              },
            }))),
        } as any,
        undefined,
        undefined,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const packsStub = stub(
      packs,
      'characters',
      () => Promise.resolve([character]),
    );

    const userStub = stub(
      user,
      'findCharacter',
      () =>
        Promise.resolve({
          id: 'id:1',
          mediaId: 'id:2',
          rating: 2,
          user: {
            id: 'user_id',
          },
        }),
    );

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = steal.attempt({
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        token: 'test_token',
        characterId: 'character_id',
        pre: 0,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/steal.gif',
            },
          }],
        },
      });

      await timeStub.tickAsync(8000);

      assertSpyCall(sleepStub, 0, {
        args: [8],
      });

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
          embeds: [{
            type: 'rich',
            description: 'Some of those characters were disabled or removed',
          }],
        },
      );
    } finally {
      delete config.stealing;
      delete config.appId;
      delete config.origin;

      rngStub.restore();
      sleepStub.restore();
      fetchStub.restore();
      listStub.restore();
      packsStub.restore();
      userStub.restore();
      timeStub.restore();
    }
  });

  await test.step('not owned', async () => {
    const character: Character = {
      id: '1',
      packId: 'id',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [{
        url: 'image_url',
      }],
      media: {
        edges: [{
          role: CharacterRole.Main,
          node: {
            id: 'media',
            packId: 'id',
            type: MediaType.Anime,
            title: {
              english: 'media title',
            },
          },
        }],
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                stealCharacter: {
                  ok: true,
                  character: {
                    rating: 2,
                  },
                },
              },
            }))),
        } as any,
        undefined,
        undefined,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const packsStub = stub(
      packs,
      'characters',
      () => Promise.resolve([character]),
    );

    const userStub = stub(
      user,
      'findCharacter',
      () => Promise.resolve(undefined),
    );

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = steal.attempt({
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        token: 'test_token',
        characterId: 'character_id',
        pre: 0,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            image: {
              url: 'http://localhost:8000/assets/steal.gif',
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
          components: [],
          attachments: [],
          embeds: [
            {
              description: '**full name** has not been found by anyone',
              type: 'rich',
            },
          ],
        },
      );
    } finally {
      delete config.stealing;
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      packsStub.restore();
      userStub.restore();
      timeStub.restore();
    }
  });
});

Deno.test('/steal', async (test) => {
  await test.step('normal', async () => {
    const character: Character = {
      id: '1',
      packId: 'id',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [{
        url: 'image_url',
      }],
      media: {
        edges: [{
          role: CharacterRole.Main,
          node: {
            id: 'media',
            packId: 'id',
            type: MediaType.Anime,
            title: {
              english: 'media title',
            },
          },
        }],
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                getUserInventory: {
                  stealTimestamp: undefined,
                },
              },
            }))),
        } as any,
        undefined,
        undefined,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const packsStub = stub(
      packs,
      'characters',
      () => Promise.resolve([character]),
    );

    const userStub = stub(
      user,
      'findCharacter',
      () =>
        Promise.resolve({
          id: 'id:1',
          mediaId: 'id:2',
          rating: 2,
          user: {
            id: 'another_user_id',
          },
        }),
    );

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await steal.pre({
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        token: 'test_token',
        id: 'character_id',
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
              description:
                '<@another_user_id>\n\n<:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
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
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
            },
            {
              type: 'rich',
              description: 'Your chance to succeed is: **24%**',
            },
          ],
          components: [{
            components: [
              {
                custom_id: 'steal=user_id=id:1=24',
                label: 'Attempt',
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
            type: 1,
          }],
          attachments: [],
        },
      );
    } finally {
      delete config.stealing;
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      packsStub.restore();
      userStub.restore();
      timeStub.restore();
    }
  });

  await test.step('on cooldown', async () => {
    const timeStub = new FakeTime('2011/1/25 00:00 UTC');

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                getUserInventory: {
                  stealTimestamp: timeStub.now + 1000,
                },
              },
            }))),
        } as any,
      ]),
    );

    config.stealing = true;

    try {
      await assertRejects(
        () =>
          steal.pre({
            userId: 'user_id',
            guildId: 'guild_id',
            channelId: 'channel_id',
            token: 'test_token',
            id: 'character_id',
          }),
        NonFetalError,
        'Steal is on cooldown, try again <t:1295913601:R>',
      );
    } finally {
      delete config.stealing;

      timeStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('stealing from party', async () => {
    const character: Character = {
      id: '1',
      packId: 'id',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [{
        url: 'image_url',
      }],
      media: {
        edges: [{
          role: CharacterRole.Main,
          node: {
            id: 'media',
            packId: 'id',
            type: MediaType.Anime,
            title: {
              english: 'media title',
            },
          },
        }],
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                getUserInventory: {
                  stealTimestamp: undefined,
                },
              },
            }))),
        } as any,
        undefined,
        undefined,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const packsStub = stub(
      packs,
      'characters',
      () => Promise.resolve([character]),
    );

    const userStub = stub(
      user,
      'findCharacter',
      () =>
        Promise.resolve({
          id: 'id:1',
          mediaId: 'id:2',
          rating: 2,
          user: {
            id: 'another_user_id',
          },
          inventory: {
            party: {
              member2: {
                id: 'id:1',
                mediaId: 'id:2',
                rating: 2,
                user: {
                  id: 'another_user_id',
                },
              },
            },
          },
        }),
    );

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await steal.pre({
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        token: 'test_token',
        id: 'character_id',
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
              description:
                'As part of <@another_user_id>\'s party, **full name** cannot be stolen',
            },
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
              fields: [
                {
                  name: 'media title',
                  value: '**full name**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
            },
          ],
          allowed_mentions: {
            parse: [],
          },
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.stealing;
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      packsStub.restore();
      userStub.restore();
      timeStub.restore();
    }
  });

  await test.step('stealing from yourself', async () => {
    const character: Character = {
      id: '1',
      packId: 'id',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [{
        url: 'image_url',
      }],
      media: {
        edges: [{
          role: CharacterRole.Main,
          node: {
            id: 'media',
            packId: 'id',
            type: MediaType.Anime,
            title: {
              english: 'media title',
            },
          },
        }],
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                getUserInventory: {
                  stealTimestamp: undefined,
                },
              },
            }))),
        } as any,
        undefined,
        undefined,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const packsStub = stub(
      packs,
      'characters',
      () => Promise.resolve([character]),
    );

    const userStub = stub(
      user,
      'findCharacter',
      () =>
        Promise.resolve({
          id: 'id:1',
          mediaId: 'id:2',
          rating: 1,
          user: {
            id: 'user_id',
          },
        }),
    );

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await steal.pre({
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        token: 'test_token',
        id: 'character_id',
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
          embeds: [{
            type: 'rich',
            description: 'You can\'t steal from yourself!',
          }],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.stealing;
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      packsStub.restore();
      userStub.restore();
      timeStub.restore();
    }
  });

  await test.step('not found', async () => {
    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                getUserInventory: {
                  stealTimestamp: undefined,
                },
              },
            }))),
        } as any,
        undefined,
        undefined,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const packsStub = stub(
      packs,
      'characters',
      () => Promise.resolve([]),
    );

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await steal.pre({
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        token: 'test_token',
        id: 'character_id',
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
          embeds: [{
            type: 'rich',
            description: 'Found _nothing_ matching that query!',
          }],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.stealing;
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      packsStub.restore();
      timeStub.restore();
    }
  });

  await test.step('not owned', async () => {
    const character: Character = {
      id: '1',
      packId: 'id',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [{
        url: 'image_url',
      }],
      media: {
        edges: [{
          role: CharacterRole.Main,
          node: {
            id: 'media',
            packId: 'id',
            type: MediaType.Anime,
            title: {
              english: 'media title',
            },
          },
        }],
      },
    };

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                getUserInventory: {
                  stealTimestamp: undefined,
                },
              },
            }))),
        } as any,
        undefined,
        undefined,
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const packsStub = stub(
      packs,
      'characters',
      () => Promise.resolve([character]),
    );

    const userStub = stub(
      user,
      'findCharacter',
      () => Promise.resolve(undefined),
    );

    config.stealing = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await steal.pre({
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        token: 'test_token',
        id: 'character_id',
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
              description: '**full name** has not been found by anyone',
            },
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
              fields: [
                {
                  name: 'media title',
                  value: '**full name**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
            },
          ],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.stealing;
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      packsStub.restore();
      userStub.restore();
      timeStub.restore();
    }
  });

  await test.step('under maintenance', async () => {
    config.stealing = false;

    try {
      await assertRejects(
        () =>
          steal.pre({
            userId: 'user_id',
            guildId: 'guild_id',
            channelId: 'channel_id',
            token: 'test_token',
            id: 'character_id',
          }),
        NonFetalError,
        'Stealing is under maintenance, try again later!',
      );
    } finally {
      delete config.stealing;
    }
  });
});
