// deno-lint-ignore-file no-explicit-any

import { assertEquals, assertThrows } from '$std/testing/asserts.ts';

import { FakeTime } from '$std/testing/time.ts';

import { assertSpyCalls, returnsNext, stub } from '$std/testing/mock.ts';

import packs from '../src/packs.ts';
import user from '../src/user.ts';
import trade from '../src/trade.ts';

import config from '../src/config.ts';

import { Character, CharacterRole, MediaType } from '../src/types.ts';

import { AniListCharacter } from '../packs/anilist/types.ts';

import { NonFetalError } from '../src/errors.ts';

Deno.test('give', async (test) => {
  await test.step('normal', async () => {
    const character: AniListCharacter = {
      id: '1',
      description: 'description',
      name: {
        full: 'title',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: {
            id: '2',
            type: MediaType.Anime,
            title: {
              english: 'media',
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
                giveCharacters: {
                  ok: true,
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
                  characters: [character],
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

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.give({
        token: 'test_token',
        userId: 'user_id',
        targetId: 'target_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        giveCharactersIds: ['anilist:1', 'anilist:1'],
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

      assertSpyCalls(fetchStub, 4);

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
          components: [],
          embeds: [
            {
              type: 'rich',
              description: 'Gift sent to <@target_id>!',
            },
          ],
        },
      );

      assertEquals(
        fetchStub.calls[3].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token',
      );

      assertEquals(fetchStub.calls[3].args[1]?.method, 'POST');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[3].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          content: '<@target_id>',
          attachments: [],
          components: [],
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
                url: 'http://localhost:8000/external/?size=thumbnail',
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
                  value: '<:add:1099004747123523644>',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
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
    }
  });

  await test.step('not found', async () => {
    const character: AniListCharacter = {
      id: '1',
      description: 'description',
      name: {
        full: 'title',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: {
            id: '2',
            type: MediaType.Anime,
            title: {
              english: 'media',
            },
          },
        }],
      },
    };

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                giveCharacters: {
                  ok: false,
                  error: 'CHARACTER_NOT_FOUND',
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
                  characters: [character],
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

    const timeStub = new FakeTime();

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.give({
        token: 'test_token',
        userId: 'user_id',
        targetId: 'target_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        giveCharactersIds: ['anilist:1', 'anilist:1'],
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

      assertSpyCalls(fetchStub, 3);

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
          components: [],
          embeds: [
            {
              type: 'rich',
              description: 'Some of those characters were disabled or removed',
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

  await test.step('not owned', async () => {
    const character: AniListCharacter = {
      id: '1',
      description: 'description',
      name: {
        full: 'title',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: {
            id: '2',
            type: MediaType.Anime,
            title: {
              english: 'media',
            },
          },
        }],
      },
    };

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                giveCharacters: {
                  ok: false,
                  error: 'CHARACTER_NOT_OWNED',
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
                  characters: [character],
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

    const timeStub = new FakeTime();

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.give({
        token: 'test_token',
        userId: 'user_id',
        targetId: 'target_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        giveCharactersIds: ['anilist:1', 'anilist:1'],
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

      assertSpyCalls(fetchStub, 3);

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
          components: [],
          embeds: [
            {
              type: 'rich',
              description: 'Some of those characters changed hands',
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

  await test.step('in party', async () => {
    const character: AniListCharacter = {
      id: '1',
      description: 'description',
      name: {
        full: 'title',
      },
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: {
            id: '2',
            type: MediaType.Anime,
            title: {
              english: 'media',
            },
          },
        }],
      },
    };

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                giveCharacters: {
                  ok: false,
                  error: 'CHARACTER_IN_PARTY',
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
                  characters: [character],
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

    const timeStub = new FakeTime();

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.give({
        token: 'test_token',
        userId: 'user_id',
        targetId: 'target_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        giveCharactersIds: ['anilist:1', 'anilist:1'],
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

      assertSpyCalls(fetchStub, 3);

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
          components: [],
          embeds: [
            {
              type: 'rich',
              description:
                'Some of those characters are currently in your party',
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

Deno.test('trade', async (test) => {
  await test.step('normal', async () => {
    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'title',
      },
      description: 'description',
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: {
            id: '2',
            type: MediaType.Anime,
            title: {
              english: 'media',
            },
          },
        }],
      },
    };

    const character2: AniListCharacter = {
      id: '2',
      name: {
        full: 'title 2',
      },
      description: 'description 2',
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: {
            id: '3',
            type: MediaType.Anime,
            title: {
              english: 'media 2',
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
                tradeCharacters: {
                  ok: true,
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
                  characters: [character, character2],
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

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.accepted({
        token: 'test_token',
        userId: 'user_id',
        targetId: 'target_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        giveCharactersIds: ['anilist:1', 'anilist:1'],
        takeCharactersIds: ['anilist:2', 'anilist:2'],
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

      assertSpyCalls(fetchStub, 4);

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
          content: '<@user_id>',
          attachments: [],
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
                url: 'http://localhost:8000/external/?size=thumbnail',
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
                url: 'http://localhost:8000/external/?size=thumbnail',
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
                url: 'http://localhost:8000/external/?size=thumbnail',
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
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
            },
          ],
        },
      );

      assertEquals(
        fetchStub.calls[3].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token',
      );

      assertEquals(fetchStub.calls[3].args[1]?.method, 'POST');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[3].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          content: '<@user_id> your offer was accepted!',
          attachments: [],
          components: [],
          embeds: [],
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

  await test.step('not found', async () => {
    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'title',
      },
      description: 'description',
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: {
            id: '2',
            type: MediaType.Anime,
            title: {
              english: 'media',
            },
          },
        }],
      },
    };

    const character2: AniListCharacter = {
      id: '2',
      name: {
        full: 'title 2',
      },
      description: 'description 2',
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: {
            id: '3',
            type: MediaType.Anime,
            title: {
              english: 'media 2',
            },
          },
        }],
      },
    };

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                tradeCharacters: {
                  ok: false,
                  error: 'CHARACTER_NOT_FOUND',
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
                  characters: [character, character2],
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

    const timeStub = new FakeTime();

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.accepted({
        token: 'test_token',
        userId: 'user_id',
        targetId: 'target_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        giveCharactersIds: ['anilist:1', 'anilist:1'],
        takeCharactersIds: ['anilist:2', 'anilist:2'],
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

      assertSpyCalls(fetchStub, 3);

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
          components: [],
          embeds: [
            {
              type: 'rich',
              description: 'Some of those characters were disabled or removed',
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

  await test.step('not owned', async () => {
    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'title',
      },
      description: 'description',
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: {
            id: '2',
            type: MediaType.Anime,
            title: {
              english: 'media',
            },
          },
        }],
      },
    };

    const character2: AniListCharacter = {
      id: '2',
      name: {
        full: 'title 2',
      },
      description: 'description 2',
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: {
            id: '3',
            type: MediaType.Anime,
            title: {
              english: 'media 2',
            },
          },
        }],
      },
    };

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                tradeCharacters: {
                  ok: false,
                  error: 'CHARACTER_NOT_OWNED',
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
                  characters: [character, character2],
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

    const timeStub = new FakeTime();

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.accepted({
        token: 'test_token',
        userId: 'user_id',
        targetId: 'target_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        giveCharactersIds: ['anilist:1', 'anilist:1'],
        takeCharactersIds: ['anilist:2', 'anilist:2'],
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

      assertSpyCalls(fetchStub, 3);

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
          components: [],
          embeds: [
            {
              type: 'rich',
              description: 'Some of those characters changed hands',
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

  await test.step('in party', async () => {
    const character: AniListCharacter = {
      id: '1',
      name: {
        full: 'title',
      },
      description: 'description',
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: {
            id: '2',
            type: MediaType.Anime,
            title: {
              english: 'media',
            },
          },
        }],
      },
    };

    const character2: AniListCharacter = {
      id: '2',
      name: {
        full: 'title 2',
      },
      description: 'description 2',
      media: {
        edges: [{
          characterRole: CharacterRole.Main,
          node: {
            id: '3',
            type: MediaType.Anime,
            title: {
              english: 'media 2',
            },
          },
        }],
      },
    };

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                tradeCharacters: {
                  ok: false,
                  error: 'CHARACTER_IN_PARTY',
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
                  characters: [character, character2],
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

    const timeStub = new FakeTime();

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.accepted({
        token: 'test_token',
        userId: 'user_id',
        targetId: 'target_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        giveCharactersIds: ['anilist:1', 'anilist:1'],
        takeCharactersIds: ['anilist:2', 'anilist:2'],
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

      assertSpyCalls(fetchStub, 3);

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
          components: [],
          embeds: [
            {
              type: 'rich',
              description: 'Some of those characters are currently in parties',
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

Deno.test('/give', async (test) => {
  await test.step('normal', async () => {
    const characterStub = stub(
      packs,
      'characters',
      returnsNext([
        Promise.resolve([{
          id: '1',
          packId: 'id',
          description: 'long description',
          name: {
            english: 'full name',
          },
          images: [{
            url: 'image_url',
          }],
        }]),
        Promise.resolve([{
          id: '2',
          packId: 'id',
          description: 'long description 2',
          name: {
            english: 'full name 2',
          },
          images: [{
            url: 'image_url2',
          }],
        }]),
      ]),
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const aggregateStub = stub(
      packs,
      'aggregate',
      ({ character }) => Promise.resolve(character),
    );

    const userStub = stub(
      user,
      'getUserCharacters',
      () =>
        Promise.resolve({
          characters: [
            {
              id: 'id:1',
              user: { id: 'user_id' },
              mediaId: 'media_id',
              rating: 2,
            },
            {
              id: 'id:2',
              user: { id: 'user_id' },
              mediaId: 'media_id',
              rating: 2,
            },
          ],
          likes: [],
          party: {},
        }),
    );

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.pre({
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        token: 'test_token',
        targetId: 'another_user_id',
        give: ['give_character_id', 'give_character_id2'],
        take: [],
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
                '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name\n\u200B',
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
                url: 'http://localhost:8000/external/image_url2?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name 2\n\u200B',
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
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.trading;

      timeStub.restore();
      characterStub.restore();
      aggregateStub.restore();
      userStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('gifting yourself', () => {
    const message = trade.pre({
      userId: 'user_id',
      guildId: 'guild_id',
      channelId: 'channel_id',
      token: 'test_token',
      targetId: 'user_id',
      give: ['give_character_id'],
      take: [],
    });

    assertEquals(message.json(), {
      type: 4,
      data: {
        flags: 64,
        attachments: [],
        components: [],
        embeds: [{
          type: 'rich',
          description: 'You can\'t gift yourself!',
        }],
      },
    });
  });

  await test.step('not owned', async () => {
    const characterStub = stub(
      packs,
      'characters',
      returnsNext([
        Promise.resolve([{
          id: '1',
          packId: 'id',
          description: 'long description',
          name: {
            english: 'full name',
          },
          images: [{
            url: 'image_url',
          }],
        }]),
        Promise.resolve([{
          id: '2',
          packId: 'id',
          description: 'long description 2',
          name: {
            english: 'full name 2',
          },
          images: [{
            url: 'image_url2',
          }],
        }]),
      ]),
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const aggregateStub = stub(
      packs,
      'aggregate',
      ({ character }) => Promise.resolve(character),
    );

    const userStub = stub(
      user,
      'getUserCharacters',
      () =>
        Promise.resolve({
          characters: [],
          likes: [],
          party: {},
        }),
    );

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.pre({
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        token: 'test_token',
        targetId: 'another_user_id',
        give: ['give_character_id', 'give_character_id2'],
        take: [],
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
              description: 'You don\'t have full name',
            },
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name\n\u200B',
                  value: '\u200B',
                },
              ],
            },
            {
              type: 'rich',
              description: 'You don\'t have full name 2',
            },
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url2?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name 2\n\u200B',
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
      delete config.trading;

      timeStub.restore();
      characterStub.restore();
      aggregateStub.restore();
      userStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('in party', async () => {
    const characterStub = stub(
      packs,
      'characters',
      returnsNext([
        Promise.resolve([{
          id: '1',
          packId: 'id',
          description: 'long description',
          name: {
            english: 'full name',
          },
          images: [{
            url: 'image_url',
          }],
        }]),
        Promise.resolve([{
          id: '2',
          packId: 'id',
          description: 'long description 2',
          name: {
            english: 'full name 2',
          },
          images: [{
            url: 'image_url2',
          }],
        }]),
      ]),
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const aggregateStub = stub(
      packs,
      'aggregate',
      ({ character }) => Promise.resolve(character),
    );

    const userStub = stub(
      user,
      'getUserCharacters',
      () =>
        Promise.resolve({
          characters: [],
          likes: [],
          party: {
            member1: {
              id: 'id:1',
              mediaId: 'media_id',
              user: { id: 'user_id' },
              rating: 1,
            },
            member5: {
              id: 'id:2',
              mediaId: 'media_id',
              user: { id: 'user_id' },
              rating: 1,
            },
          },
        }),
    );

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.pre({
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        token: 'test_token',
        targetId: 'another_user_id',
        give: ['give_character_id', 'give_character_id2'],
        take: [],
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
              description: 'full name is in your party and can\'t be traded',
            },
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name\n\u200B',
                  value: '\u200B',
                },
              ],
            },
            {
              type: 'rich',
              description: 'full name 2 is in your party and can\'t be traded',
            },
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url2?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name 2\n\u200B',
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
      delete config.trading;

      timeStub.restore();
      characterStub.restore();
      aggregateStub.restore();
      userStub.restore();
      fetchStub.restore();
    }
  });
});

Deno.test('/trade', async (test) => {
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
    };

    const characterStub = stub(
      packs,
      'characters',
      () => Promise.resolve([character]),
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const aggregateStub = stub(
      packs,
      'aggregate',
      ({ character }) => Promise.resolve(character),
    );

    const userStub = stub(
      user,
      'getUserCharacters',
      returnsNext([
        Promise.resolve({
          characters: [{
            id: 'id:1',
            user: { id: 'user_id' },
            mediaId: 'media_id',
            rating: 2,
          }],
          likes: [],
          party: {},
        }),
        Promise.resolve({
          characters: [{
            id: 'id:1',
            user: { id: 'another_user_id' },
            mediaId: 'media_id',
            rating: 2,
          }],
          likes: [],
          party: {},
        }),
      ]),
    );

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.pre({
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        token: 'test_token',
        targetId: 'another_user_id',
        give: ['pack-id:give_character_id'],
        take: ['pack-id:take_character_id'],
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
          content: '<@another_user_id>',
          attachments: [],
          embeds: [
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name\n\u200B',
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
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name\n\u200B',
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
        },
      );

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'POST');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          content: '<@another_user_id> you received an offer!',
          attachments: [],
          components: [],
          embeds: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.trading;

      timeStub.restore();
      characterStub.restore();
      aggregateStub.restore();
      userStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('liked', async () => {
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
    };

    const characterStub = stub(
      packs,
      'characters',
      () => Promise.resolve([character]),
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const aggregateStub = stub(
      packs,
      'aggregate',
      ({ character }) => Promise.resolve(character),
    );

    const userStub = stub(
      user,
      'getUserCharacters',
      returnsNext([
        Promise.resolve({
          characters: [{
            id: 'id:1',
            user: { id: 'user_id' },
            mediaId: 'media_id',
            rating: 1,
          }],
          likes: [],
          party: {},
        }),
        Promise.resolve({
          characters: [{
            id: 'id:1',
            user: { id: 'another_user_id' },
            mediaId: 'media_id',
            rating: 1,
          }],
          likes: [{ characterId: 'id:1' }],
          party: {},
        }),
      ]),
    );

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.pre({
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        token: 'test_token',
        targetId: 'another_user_id',
        give: ['pack-id:give_character_id'],
        take: ['pack-id:take_character_id'],
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
          content: '<@another_user_id>',
          attachments: [],
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
                  name: 'full name\n\u200B',
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
                '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name\n\u200B',
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
        },
      );

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'POST');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          content: '<@another_user_id> you received an offer!',
          attachments: [],
          components: [],
          embeds: [{
            type: 'rich',
            description: 'Some of those characters are in your likeslist!',
          }],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.trading;

      timeStub.restore();
      characterStub.restore();
      aggregateStub.restore();
      userStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('repeated characters', async () => {
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
    };

    const characterStub = stub(
      packs,
      'characters',
      () => Promise.resolve([character]),
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const aggregateStub = stub(
      packs,
      'aggregate',
      ({ character }) => Promise.resolve(character),
    );

    const userStub = stub(
      user,
      'getUserCharacters',
      returnsNext([
        Promise.resolve({
          characters: [{
            id: 'id:1',
            user: { id: 'user_id' },
            mediaId: 'media_id',
            rating: 1,
          }],
          likes: [],
          party: {},
        }),
        Promise.resolve({
          characters: [{
            id: 'id:1',
            user: { id: 'another_user_id' },
            mediaId: 'media_id',
            rating: 1,
          }],
          likes: [],
          party: {},
        }),
      ]),
    );

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.pre({
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        token: 'test_token',
        targetId: 'another_user_id',
        give: ['give_character_id', 'give_character_id'],
        take: ['take_character_id', 'take_character_id'],
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
          content: '<@another_user_id>',
          attachments: [],
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
                  name: 'full name\n\u200B',
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
                '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name\n\u200B',
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
        },
      );

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token',
      );

      assertEquals(fetchStub.calls[1].args[1]?.method, 'POST');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[1].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          content: '<@another_user_id> you received an offer!',
          attachments: [],
          components: [],
          embeds: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.trading;

      timeStub.restore();
      characterStub.restore();
      aggregateStub.restore();
      userStub.restore();
      fetchStub.restore();
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
    };

    const characterStub = stub(
      packs,
      'characters',
      () => Promise.resolve([character]),
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const aggregateStub = stub(
      packs,
      'aggregate',
      ({ character }) => Promise.resolve(character),
    );

    const userStub = stub(
      user,
      'getUserCharacters',
      returnsNext([
        Promise.resolve({
          characters: [{
            id: 'id:1',
            user: { id: 'user_id' },
            mediaId: 'media_id',
            rating: 1,
          }],
          likes: [],
          party: {},
        }),
        Promise.resolve({
          characters: [],
          likes: [],
          party: {},
        }),
      ]),
    );

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.pre({
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        token: 'test_token',
        targetId: 'another_user_id',
        give: ['give_character_id'],
        take: ['take_character_id'],
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
              description: '<@another_user_id> doesn\'t have full name',
            },
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name\n\u200B',
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
      delete config.trading;

      timeStub.restore();
      characterStub.restore();
      aggregateStub.restore();
      userStub.restore();
      fetchStub.restore();
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
    };

    const characterStub = stub(
      packs,
      'characters',
      () => Promise.resolve([character]),
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    const aggregateStub = stub(
      packs,
      'aggregate',
      ({ character }) => Promise.resolve(character),
    );

    const userStub = stub(
      user,
      'getUserCharacters',
      returnsNext([
        Promise.resolve({
          characters: [{
            id: 'id:1',
            user: { id: 'user_id' },
            mediaId: 'media_id',
            rating: 1,
          }],
          likes: [],
          party: {},
        }),
        Promise.resolve({
          characters: [{
            id: 'id:1',
            user: { id: 'another_user_id' },
            mediaId: 'media_id',
            rating: 1,
          }],
          likes: [],
          party: {
            member1: {
              id: 'id:1',
              mediaId: 'media_id',
              user: { id: 'another_user_id' },
              rating: 1,
            },
          },
        }),
      ]),
    );

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.pre({
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        token: 'test_token',
        targetId: 'another_user_id',
        give: ['pack-id:give_character_id'],
        take: ['pack-id:take_character_id'],
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
                'full name is in <@another_user_id>\'s party and can\'t be traded',
            },
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
              fields: [
                {
                  name: 'full name\n\u200B',
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
      delete config.trading;

      timeStub.restore();
      characterStub.restore();
      aggregateStub.restore();
      userStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('trading with yourself', () => {
    const message = trade.pre({
      userId: 'user_id',
      guildId: 'guild_id',
      channelId: 'channel_id',
      token: 'test_token',
      targetId: 'user_id',
      give: ['give_character_id'],
      take: ['take_character_id'],
    });

    assertEquals(message.json(), {
      type: 4,
      data: {
        flags: 64,
        attachments: [],
        components: [],
        embeds: [{
          type: 'rich',
          description: 'You can\'t trade with yourself!',
        }],
      },
    });
  });

  await test.step('disabled', async () => {
    const characterStub = stub(
      packs,
      'characters',
      () => Promise.resolve([]),
    );

    const timeStub = new FakeTime();

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => undefined as any,
    );

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.pre({
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        token: 'test_token',
        targetId: 'another_user_id',
        give: ['give_character_id'],
        take: ['take_character_id'],
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
                'Some of those character do not exist or are disabled',
            },
          ],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;
      delete config.trading;

      timeStub.restore();
      characterStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('under maintenance', () => {
    config.trading = false;

    try {
      assertThrows(
        () =>
          trade.pre({
            userId: 'user_id',
            guildId: 'guild_id',
            channelId: 'channel_id',
            token: 'test_token',
            targetId: 'another_user_id',
            give: ['character_id'],
            take: [],
          }),
        NonFetalError,
        'Trading is under maintenance, try again later!',
      );
    } finally {
      delete config.trading;
    }
  });
});
