// deno-lint-ignore-file no-explicit-any

import { assertEquals, assertRejects } from '$std/testing/asserts.ts';

import { FakeTime } from '$std/testing/time.ts';

import { assertSpyCalls, returnsNext, stub } from '$std/testing/mock.ts';

import packs from '../src/packs.ts';
import party from '../src/party.ts';

import config from '../src/config.ts';

import { MediaType } from '../src/types.ts';

import { AniListCharacter, AniListMedia } from '../packs/anilist/types.ts';

Deno.test('/party view', async (test) => {
  await test.step('normal', async () => {
    const media: AniListMedia[] = [
      {
        id: '0',
        type: MediaType.Anime,
        title: {
          english: 'title',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
      {
        id: '2',
        name: {
          full: 'name 2',
        },
      },
      {
        id: '3',
        name: {
          full: 'name 3',
        },
      },
      {
        id: '4',
        name: {
          full: 'name 4',
        },
      },
      {
        id: '5',
        name: {
          full: 'name 5',
        },
      },
    ];

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
                  party: {
                    member1: {
                      id: 'anilist:1',
                      mediaId: 'anilist:0',
                      rating: 1,
                    },
                    member2: {
                      id: 'anilist:2',
                      mediaId: 'anilist:0',
                      rating: 2,
                    },
                    member3: {
                      id: 'anilist:3',
                      mediaId: 'anilist:0',
                      rating: 3,
                    },
                    member4: {
                      id: 'anilist:4',
                      mediaId: 'anilist:0',
                      rating: 4,
                    },
                    member5: {
                      id: 'anilist:5',
                      mediaId: 'anilist:0',
                      rating: 5,
                    },
                  },
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

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = party.view({
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
              url: 'http://localhost:8000/assets/spinner3.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 4);

      assertEquals(
        fetchStub.calls[3].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[3].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[3].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 1**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 2**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 3**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 4**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 5**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098>',
            },
          ],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      listStub.restore();
      fetchStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('custom', async () => {
    const media: AniListMedia[] = [
      {
        id: '0',
        type: MediaType.Anime,
        title: {
          english: 'title',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
      {
        id: '2',
        name: {
          full: 'name 2',
        },
      },
      {
        id: '3',
        name: {
          full: 'name 3',
        },
      },
      {
        id: '4',
        name: {
          full: 'name 4',
        },
      },
      {
        id: '5',
        name: {
          full: 'name 5',
        },
      },
    ];

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
                  party: {
                    member1: {
                      id: 'anilist:1',
                      mediaId: 'anilist:0',
                      rating: 1,
                      nickname: 'nickname 1',
                      image: 'image 1',
                    },
                    member2: {
                      id: 'anilist:2',
                      mediaId: 'anilist:0',
                      rating: 2,
                      nickname: 'nickname 2',
                      image: 'image 2',
                    },
                    member3: {
                      id: 'anilist:3',
                      mediaId: 'anilist:0',
                      rating: 3,
                      nickname: 'nickname 3',
                      image: 'image 3',
                    },
                    member4: {
                      id: 'anilist:4',
                      mediaId: 'anilist:0',
                      rating: 4,
                      nickname: 'nickname 4',
                      image: 'image 4',
                    },
                    member5: {
                      id: 'anilist:5',
                      mediaId: 'anilist:0',
                      rating: 5,
                      nickname: 'nickname 5',
                      image: 'image 5',
                    },
                  },
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

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = party.view({
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
              url: 'http://localhost:8000/assets/spinner3.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 4);

      assertEquals(
        fetchStub.calls[3].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[3].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[3].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**nickname 1**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/image%201?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**nickname 2**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/image%202?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**nickname 3**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/image%203?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**nickname 4**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/image%204?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**nickname 5**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/image%205?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098>',
            },
          ],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      listStub.restore();
      fetchStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('unassigned members', async () => {
    const media: AniListMedia[] = [
      {
        id: '0',
        type: MediaType.Anime,
        title: {
          english: 'title',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
      {
        id: '2',
        name: {
          full: 'name 2',
        },
      },
      {
        id: '3',
        name: {
          full: 'name 3',
        },
      },
      {
        id: '4',
        name: {
          full: 'name 4',
        },
      },
      {
        id: '5',
        name: {
          full: 'name 5',
        },
      },
    ];

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
                  party: {
                    member1: {
                      id: 'anilist:1',
                      mediaId: 'anilist:0',
                      rating: 1,
                    },
                    member2: {
                      id: 'anilist:2',
                      mediaId: 'anilist:0',
                      rating: 2,
                    },
                    member5: {
                      id: 'anilist:5',
                      mediaId: 'anilist:0',
                      rating: 5,
                    },
                  },
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

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = party.view({
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
              url: 'http://localhost:8000/assets/spinner3.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 4);

      assertEquals(
        fetchStub.calls[3].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[3].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[3].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 1**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 2**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 'rich',
              description: 'Unassigned',
            },
            {
              type: 'rich',
              description: 'Unassigned',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 5**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098>',
            },
          ],
          components: [],
          attachments: [],
        },
      );
    } finally {
      delete config.appId;
      delete config.origin;

      listStub.restore();
      fetchStub.restore();
      isDisabledStub.restore();
      timeStub.restore();
    }
  });

  await test.step('disabled characters', async () => {
    const media: AniListMedia[] = [
      {
        id: '0',
        type: MediaType.Anime,
        title: {
          english: 'title',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
      {
        id: '2',
        name: {
          full: 'name 2',
        },
      },
      {
        id: '3',
        name: {
          full: 'name 3',
        },
      },
      {
        id: '4',
        name: {
          full: 'name 4',
        },
      },
      {
        id: '5',
        name: {
          full: 'name 5',
        },
      },
    ];

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
                  party: {
                    member1: {
                      id: 'anilist:1',
                      mediaId: 'anilist:0',
                      rating: 1,
                    },
                    member2: {
                      id: 'anilist:2',
                      mediaId: 'anilist:0',
                      rating: 2,
                    },
                    member3: {
                      id: 'anilist:3',
                      mediaId: 'anilist:0',
                      rating: 3,
                    },
                    member4: {
                      id: 'anilist:4',
                      mediaId: 'anilist:0',
                      rating: 4,
                    },
                    member5: {
                      id: 'anilist:5',
                      mediaId: 'anilist:0',
                      rating: 5,
                    },
                  },
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
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
      ]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';
    try {
      const message = party.view({
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
              url: 'http://localhost:8000/assets/spinner3.gif',
            },
          }],
        },
      });

      await timeStub.runMicrotasks();

      assertSpyCalls(fetchStub, 4);

      assertEquals(
        fetchStub.calls[3].args[0],
        'https://discord.com/api/v10/webhooks/app_id/test_token/messages/@original',
      );

      assertEquals(fetchStub.calls[3].args[1]?.method, 'PATCH');

      assertEquals(
        JSON.parse(
          (fetchStub.calls[3].args[1]?.body as FormData)?.get(
            'payload_json',
          ) as any,
        ),
        {
          embeds: [
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 1**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 2**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 3**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 'rich',
              description: 'This character was removed or disabled',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 5**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098>',
            },
          ],
          components: [],
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
    }
  });
});

Deno.test('/party assign', async (test) => {
  await test.step('normal', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
    ];

    const fetchStub = stub(
      globalThis,
      'fetch',
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
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                setCharacterToParty: {
                  ok: true,
                  character: {
                    id: 'anilist:1',
                    mediaId: 'anilist:0',
                    rating: 2,
                  },
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
      const message = await party.assign({
        spot: 1,
        userId: 'user_id',
        guildId: 'guild_id',

        id: 'anilist:1',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              description: 'Assigned',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'name 1',
                  value: '\u200B',
                },
              ],
              thumbnail: {
                url: 'undefined/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
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
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('custom', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
    ];

    const fetchStub = stub(
      globalThis,
      'fetch',
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
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                setCharacterToParty: {
                  ok: true,
                  character: {
                    id: 'anilist:1',
                    mediaId: 'anilist:0',
                    rating: 2,
                    nickname: 'nickname',
                    image: 'image',
                  },
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await party.assign({
        spot: 1,
        userId: 'user_id',
        guildId: 'guild_id',

        id: 'anilist:1',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              description: 'Assigned',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'nickname',
                  value: '\u200B',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/image?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
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
      });
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
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

    const fetchStub = stub(
      globalThis,
      'fetch',
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
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                setCharacterToParty: {
                  ok: false,
                  error: 'CHARACTER_NOT_FOUND',
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
      const message = await party.assign({
        spot: 1,
        userId: 'user_id',
        guildId: 'guild_id',

        id: 'anilist:1',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          flags: 64,
          embeds: [
            {
              type: 'rich',
              description: 'name 1 hasn\'t been found by anyone yet.',
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
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
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

    const fetchStub = stub(
      globalThis,
      'fetch',
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
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                setCharacterToParty: {
                  ok: false,
                  error: 'CHARACTER_NOT_OWNED',
                  character: {
                    id: 'anilist:1',
                    mediaId: 'anilist:0',
                    rating: 2,
                    user: {
                      id: 'user_2',
                    },
                  },
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
      const message = await party.assign({
        spot: 1,
        userId: 'user_id',
        guildId: 'guild_id',

        id: 'anilist:1',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          flags: 64,
          embeds: [
            {
              type: 'rich',
              description:
                'name 1 is owned by <@user_2> and cannot be assigned to your party.',
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
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });
});

Deno.test('/party swap', async (test) => {
  await test.step('normal', async () => {
    const media: AniListMedia[] = [
      {
        id: '0',
        type: MediaType.Anime,
        title: {
          english: 'title',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
      {
        id: '2',
        name: {
          full: 'name 2',
        },
      },
      {
        id: '3',
        name: {
          full: 'name 3',
        },
      },
      {
        id: '4',
        name: {
          full: 'name 4',
        },
      },
      {
        id: '5',
        name: {
          full: 'name 5',
        },
      },
    ];

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                swapCharactersInParty: {
                  ok: true,
                  inventory: {
                    party: {
                      member1: {
                        id: 'anilist:1',
                        mediaId: 'anilist:0',
                        rating: 1,
                      },
                      member2: {
                        id: 'anilist:2',
                        mediaId: 'anilist:0',
                        rating: 2,
                      },
                      member3: {
                        id: 'anilist:3',
                        mediaId: 'anilist:0',
                        rating: 3,
                      },
                      member4: {
                        id: 'anilist:4',
                        mediaId: 'anilist:0',
                        rating: 4,
                      },
                      member5: {
                        id: 'anilist:5',
                        mediaId: 'anilist:0',
                        rating: 5,
                      },
                    },
                  },
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
      ]),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    const isDisabledStub = stub(packs, 'isDisabled', () => false);

    try {
      const message = await party.swap({
        a: 1,
        b: 2,
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 1**',
                },
              ],
              thumbnail: {
                url: 'undefined/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 2**',
                },
              ],
              thumbnail: {
                url: 'undefined/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 3**',
                },
              ],
              thumbnail: {
                url: 'undefined/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 4**',
                },
              ],
              thumbnail: {
                url: 'undefined/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**name 5**',
                },
              ],
              thumbnail: {
                url: 'undefined/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098>',
            },
          ],
          components: [],
          attachments: [],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('custom', async () => {
    const media: AniListMedia[] = [
      {
        id: '0',
        type: MediaType.Anime,
        title: {
          english: 'title',
        },
      },
    ];

    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
      {
        id: '2',
        name: {
          full: 'name 2',
        },
      },
      {
        id: '3',
        name: {
          full: 'name 3',
        },
      },
      {
        id: '4',
        name: {
          full: 'name 4',
        },
      },
      {
        id: '5',
        name: {
          full: 'name 5',
        },
      },
    ];

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                swapCharactersInParty: {
                  ok: true,
                  inventory: {
                    party: {
                      member1: {
                        id: 'anilist:1',
                        mediaId: 'anilist:0',
                        rating: 1,
                        nickname: 'nickname 1',
                        image: 'image 1',
                      },
                      member2: {
                        id: 'anilist:2',
                        mediaId: 'anilist:0',
                        rating: 2,
                        nickname: 'nickname 2',
                        image: 'image 2',
                      },
                      member3: {
                        id: 'anilist:3',
                        mediaId: 'anilist:0',
                        rating: 3,
                        nickname: 'nickname 3',
                        image: 'image 3',
                      },
                      member4: {
                        id: 'anilist:4',
                        mediaId: 'anilist:0',
                        rating: 4,
                        nickname: 'nickname 4',
                        image: 'image 4',
                      },
                      member5: {
                        id: 'anilist:5',
                        mediaId: 'anilist:0',
                        rating: 5,
                        nickname: 'nickname 5',
                        image: 'image 5',
                      },
                    },
                  },
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
      const message = await party.swap({
        a: 1,
        b: 2,
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**nickname 1**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/image%201?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**nickname 2**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/image%202?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**nickname 3**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/image%203?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**nickname 4**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/image%204?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906>',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'title',
                  value: '**nickname 5**',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/image%205?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098><:star:1061016362832642098>',
            },
          ],
          components: [],
          attachments: [],
        },
      });
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('unknown error', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                swapCharactersInParty: {
                  ok: false,
                  error: 'UNKNOWN_ERROR',
                },
              },
            }))),
          //
        } as any,
      ]),
    );

    try {
      await assertRejects(
        async () =>
          await party.swap({
            a: 1,
            b: 2,
            userId: 'user_id',
            guildId: 'guild_id',
          }),
        Error,
        'UNKNOWN_ERROR',
      );
    } finally {
      fetchStub.restore();
    }
  });
});

Deno.test('/party remove', async (test) => {
  await test.step('normal', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
    ];

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                removeCharacterFromParty: {
                  ok: true,
                  character: {
                    id: 'anilist:1',
                    mediaId: 'anilist:0',
                    rating: 2,
                  },
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
                  characters,
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
      const message = await party.remove({
        spot: 1,
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              description: 'Removed',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'name 1',
                  value: '\u200B',
                },
              ],
              thumbnail: {
                url: 'undefined/external/?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
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
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('custom', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
    ];

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                removeCharacterFromParty: {
                  ok: true,
                  character: {
                    id: 'anilist:1',
                    mediaId: 'anilist:0',
                    rating: 2,
                    nickname: 'nickname',
                    image: 'image',
                  },
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
                  characters,
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

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await party.remove({
        spot: 1,
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              description: 'Removed',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'nickname',
                  value: '\u200B',
                },
              ],
              thumbnail: {
                url: 'http://localhost:8000/external/image?size=thumbnail',
              },
              description:
                '<:star:1061016362832642098><:star:1061016362832642098><:no_star:1109377526662434906><:no_star:1109377526662434906><:no_star:1109377526662434906>',
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
      });
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('disabled character', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
    ];

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                removeCharacterFromParty: {
                  ok: true,
                  character: {
                    id: 'anilist:1',
                    mediaId: 'anilist:0',
                    rating: 2,
                  },
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
                  characters,
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

    const isDisabledStub = stub(
      packs,
      'isDisabled',
      returnsNext([true]),
    );

    try {
      const message = await party.remove({
        spot: 2,
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              description: 'Removed #2',
            },
            {
              type: 'rich',
              description: 'This character was removed or disabled',
            },
          ],
          components: [],
          attachments: [],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('empty spot', async () => {
    const characters: AniListCharacter[] = [
      {
        id: '1',
        name: {
          full: 'name 1',
        },
      },
    ];

    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                removeCharacterFromParty: {
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
                  characters,
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
      const message = await party.remove({
        spot: 1,
        userId: 'user_id',
        guildId: 'guild_id',
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              description:
                'There was no character assigned to this spot of the party',
            },
          ],
          components: [],
          attachments: [],
        },
      });
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });

  await test.step('unknown error', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                removeCharacterFromParty: {
                  ok: false,
                  error: 'UNKNOWN_ERROR',
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
          await party.remove({
            spot: 1,
            userId: 'user_id',
            guildId: 'guild_id',
          }),
        Error,
        'UNKNOWN_ERROR',
      );
    } finally {
      fetchStub.restore();
      listStub.restore();
      isDisabledStub.restore();
    }
  });
});
