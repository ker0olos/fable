// deno-lint-ignore-file no-explicit-any

import {
  assertEquals,
  assertRejects,
} from 'https://deno.land/std@0.183.0/testing/asserts.ts';

import { FakeTime } from 'https://deno.land/std@0.183.0/testing/time.ts';

import {
  assertSpyCalls,
  returnsNext,
  stub,
} from 'https://deno.land/std@0.183.0/testing/mock.ts';

import packs from '../src/packs.ts';
import trade from '../src/trade.ts';

import config from '../src/config.ts';

import { Character, CharacterRole, MediaType } from '../src/types.ts';

import { AniListCharacter } from '../packs/anilist/types.ts';

import { NonFetalCancelableError } from '../src/errors.ts';

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
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      const [newMessage, updateMessage] = await trade.give({
        userId: 'user_id',
        targetId: 'target_id',
        guildId: 'guild_id',
        giveCharactersIds: ['anilist:1', 'anilist:1'],
      });

      assertEquals(newMessage.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description: 'Gift sent to <@target_id>!',
            },
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
              fields: [
                {
                  name: 'media',
                  value: '**title**',
                },
                {
                  name: '\u200B',
                  value: '<:add:1085034731810332743>',
                },
              ],
              thumbnail: {
                url: 'undefined/external/?size=thumbnail',
              },
            },
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
              fields: [
                {
                  name: 'media',
                  value: '**title**',
                },
                {
                  name: '\u200B',
                  value: '<:add:1085034731810332743>',
                },
              ],
              thumbnail: {
                url: 'undefined/external/?size=thumbnail',
              },
            },
          ],
        },
      });

      assertEquals(updateMessage.json(), {
        type: 4,
        data: {
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
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
              fields: [
                {
                  name: 'media',
                  value: '**title**',
                },
                {
                  name: '\u200B',
                  value: '<:add:1085034731810332743>',
                },
              ],
              thumbnail: {
                url: 'undefined/external/?size=thumbnail',
              },
            },
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
              fields: [
                {
                  name: 'media',
                  value: '**title**',
                },
                {
                  name: '\u200B',
                  value: '<:add:1085034731810332743>',
                },
              ],
              thumbnail: {
                url: 'undefined/external/?size=thumbnail',
              },
            },
          ],
        },
      });
    } finally {
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
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      await assertRejects(
        async () =>
          await trade.give({
            userId: 'user_id',
            targetId: 'target_id',
            guildId: 'guild_id',
            giveCharactersIds: ['anilist:1', 'anilist:1'],
          }),
        NonFetalCancelableError,
        'Some of those characters were disabled or removed',
      );
    } finally {
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
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      await assertRejects(
        async () =>
          await trade.give({
            userId: 'user_id',
            targetId: 'target_id',
            guildId: 'guild_id',
            giveCharactersIds: ['anilist:1', 'anilist:1'],
          }),
        NonFetalCancelableError,
        'Some of those characters changed hands',
      );
    } finally {
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
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      await assertRejects(
        async () =>
          await trade.give({
            userId: 'user_id',
            targetId: 'target_id',
            guildId: 'guild_id',
            giveCharactersIds: ['anilist:1', 'anilist:1'],
          }),
        NonFetalCancelableError,
        'Some of those characters are currently in your party',
      );
    } finally {
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
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      const [newMessage, updateMessage] = await trade.accepted({
        userId: 'user_id',
        targetId: 'target_id',
        guildId: 'guild_id',
        giveCharactersIds: ['anilist:1', 'anilist:1'],
        takeCharactersIds: ['anilist:2', 'anilist:2'],
      });

      assertEquals(newMessage.json(), {
        type: 4,
        data: {
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
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
              fields: [
                {
                  name: 'media 2',
                  value: '**title 2**',
                },
                {
                  name: '\u200B',
                  value: '<:add:1085034731810332743>',
                },
              ],
              thumbnail: {
                url: 'undefined/external/?size=thumbnail',
              },
            },
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
              fields: [
                {
                  name: 'media 2',
                  value: '**title 2**',
                },
                {
                  name: '\u200B',
                  value: '<:add:1085034731810332743>',
                },
              ],
              thumbnail: {
                url: 'undefined/external/?size=thumbnail',
              },
            },
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
              fields: [
                {
                  name: 'media',
                  value: '**title**',
                },
                {
                  name: '\u200B',
                  value: '<:remove:1085033678180208641>',
                },
              ],
              thumbnail: {
                url: 'undefined/external/?size=thumbnail',
              },
            },
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
              fields: [
                {
                  name: 'media',
                  value: '**title**',
                },
                {
                  name: '\u200B',
                  value: '<:remove:1085033678180208641>',
                },
              ],
              thumbnail: {
                url: 'undefined/external/?size=thumbnail',
              },
            },
          ],
        },
      });

      assertEquals(updateMessage.json(), {
        type: 4,
        data: {
          content: '<@user_id> your offer was accepted!',
          attachments: [],
          components: [],
          embeds: [],
        },
      });
    } finally {
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
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      await assertRejects(
        async () =>
          await trade.accepted({
            userId: 'user_id',
            targetId: 'target_id',
            guildId: 'guild_id',
            giveCharactersIds: ['anilist:1', 'anilist:1'],
            takeCharactersIds: ['anilist:2', 'anilist:2'],
          }),
        NonFetalCancelableError,
        'Some of those characters were disabled or removed',
      );
    } finally {
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
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      await assertRejects(
        async () =>
          await trade.accepted({
            userId: 'user_id',
            targetId: 'target_id',
            guildId: 'guild_id',
            giveCharactersIds: ['anilist:1', 'anilist:1'],
            takeCharactersIds: ['anilist:2', 'anilist:2'],
          }),
        NonFetalCancelableError,
        'Some of those characters changed hands',
      );
    } finally {
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
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      await assertRejects(
        async () =>
          await trade.accepted({
            userId: 'user_id',
            targetId: 'target_id',
            guildId: 'guild_id',
            giveCharactersIds: ['anilist:1', 'anilist:1'],
            takeCharactersIds: ['anilist:2', 'anilist:2'],
          }),
        NonFetalCancelableError,
        'Some of those characters are currently in parties',
      );
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
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

    const tradeStub = stub(
      trade,
      'verifyCharacters',
      returnsNext([
        Promise.resolve({ ok: true }),
        Promise.resolve({ ok: true }),
      ]),
    );

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.pre({
        userId: 'user_id',
        guildId: 'guild_id',
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

      await timeStub.tickAsync(0);

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
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
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
                  value: '<:remove:1085033678180208641>',
                },
              ],
            },
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
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
                  value: '<:add:1085034731810332743>',
                },
              ],
            },
            {
              type: 'rich',
              description:
                '<@user_id> is offering that you lose **full name** <:remove:1085033678180208641> and get **full name** <:add:1085034731810332743>',
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
      tradeStub.restore();
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

    const tradeStub = stub(
      trade,
      'verifyCharacters',
      returnsNext([
        Promise.resolve({ ok: true }),
        Promise.resolve({ ok: true }),
      ]),
    );

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.pre({
        userId: 'user_id',
        guildId: 'guild_id',
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

      await timeStub.tickAsync(0);

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
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
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
                  value: '<:remove:1085033678180208641>',
                },
              ],
            },
            {
              type: 'rich',
              description:
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
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
                  value: '<:add:1085034731810332743>',
                },
              ],
            },
            {
              type: 'rich',
              description:
                '<@user_id> is offering that you lose **full name** <:remove:1085033678180208641> and get **full name** <:add:1085034731810332743>',
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
      tradeStub.restore();
      fetchStub.restore();
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

    const tradeStub = stub(
      trade,
      'verifyCharacters',
      returnsNext([
        Promise.resolve({
          ok: true,
        }),
        Promise.resolve({
          ok: false,
          // deno-lint-ignore prefer-as-const
          message: 'NOT_FOUND' as 'NOT_FOUND',
          errors: ['id:1'],
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

      await timeStub.tickAsync(0);

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
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
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
              description:
                '_Those characters haven\'t been found by anyone yet_',
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
      tradeStub.restore();
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

    const tradeStub = stub(
      trade,
      'verifyCharacters',
      returnsNext([
        Promise.resolve({
          ok: true,
        }),
        Promise.resolve({
          ok: false,
          // deno-lint-ignore prefer-as-const
          message: 'NOT_OWNED' as 'NOT_OWNED',
          errors: ['id:1'],
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

      await timeStub.tickAsync(0);

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
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
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
              description: '<@another_user_id> doesn\'t those characters**',
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
      tradeStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('trading with yourself', () => {
    const message = trade.pre({
      userId: 'user_id',
      guildId: 'guild_id',
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
          description: 'You can\'t trade with yourself.',
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

      await timeStub.tickAsync(0);

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
});

Deno.test('/give', async (test) => {
  await test.step('normal', async () => {
    const character: Character = {
      id: '1',
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

    const tradeStub = stub(
      trade,
      'verifyCharacters',
      returnsNext([
        Promise.resolve({ ok: true }),
      ]),
    );

    config.trading = true;
    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = trade.pre({
        userId: 'user_id',
        guildId: 'guild_id',
        token: 'test_token',
        targetId: 'another_user_id',
        give: ['give_character_id'],
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

      await timeStub.tickAsync(0);

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
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
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
                  value: '<:remove:1085033678180208641>',
                },
              ],
            },
            {
              type: 'rich',
              description:
                'Are you sure you want to give **full name** <:remove:1085033678180208641> to <@another_user_id> for free?',
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'give=user_id=another_user_id=undefined:1',
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
      tradeStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('not found', async () => {
    const character: Character = {
      id: '1',
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

    const tradeStub = stub(
      trade,
      'verifyCharacters',
      returnsNext([
        Promise.resolve({
          ok: false,
          // deno-lint-ignore prefer-as-const
          message: 'NOT_FOUND' as 'NOT_FOUND',
          errors: ['undefined:1'],
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
        token: 'test_token',
        targetId: 'another_user_id',
        give: ['give_character_id'],
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

      await timeStub.tickAsync(0);

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
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
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
              description:
                '_Those characters haven\'t been found by anyone yet_',
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
      tradeStub.restore();
      fetchStub.restore();
    }
  });

  await test.step('not owned', async () => {
    const character: Character = {
      id: '1',
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

    const tradeStub = stub(
      trade,
      'verifyCharacters',
      returnsNext([
        Promise.resolve({
          ok: false,
          // deno-lint-ignore prefer-as-const
          message: 'NOT_OWNED' as 'NOT_OWNED',
          errors: ['undefined:1'],
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
        token: 'test_token',
        targetId: 'another_user_id',
        give: ['give_character_id'],
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

      await timeStub.tickAsync(0);

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
                '<:star:1061016362832642098><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466><:no_star:1061016360190222466>',
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
              description: 'You don\'t have the those characters',
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
      tradeStub.restore();
      fetchStub.restore();
    }
  });
});
