// deno-lint-ignore-file no-explicit-any

import {
  assertEquals,
  assertRejects,
} from 'https://deno.land/std@0.179.0/testing/asserts.ts';

import {
  returnsNext,
  stub,
} from 'https://deno.land/std@0.179.0/testing/mock.ts';

import packs from '../src/packs.ts';

import trade from '../src/trade.ts';

import { AniListCharacter } from '../packs/anilist/types.ts';
import { CharacterRole, MediaType } from '../src/types.ts';
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
