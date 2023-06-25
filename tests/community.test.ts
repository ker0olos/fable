// deno-lint-ignore-file no-explicit-any

import { assertEquals } from '$std/testing/asserts.ts';

import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from '$std/testing/mock.ts';

import config from '../src/config.ts';

import community from '../src/community.ts';

import type { DisaggregatedCharacter, Pack } from '../src/types.ts';
import packs from '../src/packs.ts';

Deno.test('/publish', async (test) => {
  await test.step('normal', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              id: 'user_id',
            })),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                publishPack: {
                  ok: true,
                },
              },
            }))),
        } as any,
      ]),
    );

    config.faunaSecret = 'fauna_secret';

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        body: JSON.stringify({
          accessToken: 'token',
          manifest: {
            id: 'pack_id',
          },
        }),
      });

      const response = await community.publish(request);

      assertSpyCalls(fetchStub, 2);

      assertSpyCall(fetchStub, 0, {
        args: ['https://discord.com/api/users/@me', {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            'authorization': `Bearer token`,
          },
        }],
      });

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://graphql.us.fauna.com/graphql',
      );

      assertEquals(
        fetchStub.calls[1].args[1]?.headers?.entries,
        new Headers({
          accept: 'application/json',
          authorization: 'Bearer fauna_secret',
          'content-type': 'application/json',
        }).entries,
      );

      assertEquals(
        JSON.parse(fetchStub.calls[1].args[1]?.body as string).variables,
        {
          manifest: {
            id: 'pack_id',
          },
          userId: 'user_id',
        },
      );

      assertEquals(response.ok, true);
      assertEquals(response.status, 200);
      assertEquals(response.statusText, 'OK');
    } finally {
      delete config.faunaSecret;

      fetchStub.restore();
    }
  });

  await test.step('get method', async () => {
    const request = new Request('http://localhost:8000', {
      method: 'GET',
    });

    const response = await community.publish(request);

    assertEquals(response.ok, false);
    assertEquals(response.status, 405);
    assertEquals(response.statusText, 'Method Not Allowed');
  });

  await test.step('missing access token', async () => {
    const request = new Request('http://localhost:8000', {
      method: 'POST',
      body: JSON.stringify({
        manifest: {
          id: 'pack_id',
        },
      }),
    });

    const response = await community.publish(request);

    assertEquals(response.ok, false);
    assertEquals(response.status, 400);
    assertEquals(response.statusText, 'Bad Request');

    assertEquals(await response.json(), {
      error: 'field \'accessToken\' is not available in the body',
    });
  });

  await test.step('missing manifest', async () => {
    const request = new Request('http://localhost:8000', {
      method: 'POST',
      body: JSON.stringify({
        accessToken: 'token',
      }),
    });

    const response = await community.publish(request);

    assertEquals(response.ok, false);
    assertEquals(response.status, 400);
    assertEquals(response.statusText, 'Bad Request');

    assertEquals(await response.json(), {
      error: 'field \'manifest\' is not available in the body',
    });
  });

  await test.step('invalid access token', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: false,
          status: 403,
          statusText: 'Unauthorized',
          json: (() =>
            Promise.resolve({
              error: 'invalid access token',
            })),
        } as any,
      ]),
    );

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        body: JSON.stringify({
          accessToken: 'token',
          manifest: {
            id: 'pack_id',
          },
        }),
      });

      const response = await community.publish(request);

      assertSpyCalls(fetchStub, 1);

      assertSpyCall(fetchStub, 0, {
        args: ['https://discord.com/api/users/@me', {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            'authorization': `Bearer token`,
          },
        }],
      });

      assertEquals(response.ok, false);
      assertEquals(response.status, 403);
      assertEquals(response.statusText, 'Unauthorized');

      assertEquals(await response.json(), {
        error: 'invalid access token',
      });
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('invalid manifest', async () => {
    const request = new Request('http://localhost:8000', {
      method: 'POST',
      body: JSON.stringify({
        accessToken: 'token',
        manifest: {},
      }),
    });

    const response = await community.publish(request);

    assertEquals(response.ok, false);
    assertEquals(response.status, 400);
    assertEquals(response.statusText, 'Bad Request');

    assertEquals(await response.json(), {
      errors: [
        {
          instancePath: '',
          keyword: 'required',
          message: 'must have required property \'id\'',
          params: {
            missingProperty: 'id',
          },
          schemaPath: '#/required',
        },
      ],
    });
  });

  await test.step('permission denied', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              id: 'user_id',
            })),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                publishPack: {
                  ok: false,
                  error: 'PERMISSION_DENIED',
                },
              },
            }))),
        } as any,
      ]),
    );

    config.faunaSecret = 'fauna_secret';

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        body: JSON.stringify({
          accessToken: 'token',
          manifest: {
            id: 'pack_id',
          },
        }),
      });

      const response = await community.publish(request);

      assertSpyCalls(fetchStub, 2);

      assertSpyCall(fetchStub, 0, {
        args: ['https://discord.com/api/users/@me', {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            'authorization': `Bearer token`,
          },
        }],
      });

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://graphql.us.fauna.com/graphql',
      );

      assertEquals(
        fetchStub.calls[1].args[1]?.headers?.entries,
        new Headers({
          accept: 'application/json',
          authorization: 'Bearer fauna_secret',
          'content-type': 'application/json',
        }).entries,
      );

      assertEquals(
        JSON.parse(fetchStub.calls[1].args[1]?.body as string).variables,
        {
          manifest: {
            id: 'pack_id',
          },
          userId: 'user_id',
        },
      );

      assertEquals(response.ok, false);
      assertEquals(response.status, 403);
      assertEquals(response.statusText, 'Forbidden');

      assertEquals(await response.json(), {
        error: 'No permission to edit this pack',
      });
    } finally {
      delete config.faunaSecret;

      fetchStub.restore();
    }
  });

  await test.step('unknown server error', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      returnsNext([
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              id: 'user_id',
            })),
        } as any,
        {
          ok: true,
          text: (() =>
            Promise.resolve(JSON.stringify({
              data: {
                publishPack: {
                  ok: false,
                },
              },
            }))),
        } as any,
      ]),
    );

    config.faunaSecret = 'fauna_secret';

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        body: JSON.stringify({
          accessToken: 'token',
          manifest: {
            id: 'pack_id',
          },
        }),
      });

      const response = await community.publish(request);

      assertSpyCalls(fetchStub, 2);

      assertSpyCall(fetchStub, 0, {
        args: ['https://discord.com/api/users/@me', {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            'authorization': `Bearer token`,
          },
        }],
      });

      assertEquals(
        fetchStub.calls[1].args[0],
        'https://graphql.us.fauna.com/graphql',
      );

      assertEquals(
        fetchStub.calls[1].args[1]?.headers?.entries,
        new Headers({
          accept: 'application/json',
          authorization: 'Bearer fauna_secret',
          'content-type': 'application/json',
        }).entries,
      );

      assertEquals(
        JSON.parse(fetchStub.calls[1].args[1]?.body as string).variables,
        {
          manifest: {
            id: 'pack_id',
          },
          userId: 'user_id',
        },
      );

      assertEquals(response.ok, false);
      assertEquals(response.status, 501);
      assertEquals(response.statusText, 'Internal Server Error');

      assertEquals(await response.json(), {
        error: 'Internal Server Error',
      });
    } finally {
      delete config.faunaSecret;

      fetchStub.restore();
    }
  });
});

Deno.test('/:userId', async (test) => {
  await test.step('normal', async () => {
    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              getPacksByUserId: [{
                manifest: { id: 'pack_id' },
              }],
            },
          }))),
      } as any),
    );

    config.faunaSecret = 'fauna_secret';

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
      });

      const response = await community.query(request, {}, {
        userId: 'user_id',
      });

      assertSpyCalls(fetchStub, 1);

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
        },
      );

      assertEquals(response.ok, true);
      assertEquals(response.status, 200);
      assertEquals(response.statusText, 'OK');

      assertEquals(await response.json(), {
        data: [
          {
            manifest: {
              id: 'pack_id',
            },
          },
        ],
      });
    } finally {
      delete config.faunaSecret;

      fetchStub.restore();
    }
  });

  await test.step('post method', async () => {
    const request = new Request('http://localhost:8000', {
      method: 'POST',
    });

    const response = await community.query(request, {}, {
      userId: 'user_id',
    });

    assertEquals(response.ok, false);
    assertEquals(response.status, 405);
    assertEquals(response.statusText, 'Method Not Allowed');
  });

  await test.step('invalid user_id', async () => {
    const request = new Request('http://localhost:8000', {
      method: 'GET',
    });

    const response = await community.query(request, {}, {
      userId: undefined as any,
    });

    assertEquals(response.ok, false);
    assertEquals(response.status, 400);
    assertEquals(response.statusText, 'Bad Request');

    assertEquals(await response.json(), {
      error: 'invalid user id',
    });
  });
});

Deno.test('/gallery', async (test) => {
  await test.step('normal', async () => {
    const character: DisaggregatedCharacter = {
      id: '1',
      description: 'long description',
      name: {
        english: 'full name',
      },
      images: [{
        url: 'image_url',
      }],
      popularity: 1_000_000,
      age: '420',
      gender: 'male',
    };

    const manifest: Pack = {
      servers: 2000,
      manifest: {
        id: 'pack-id',
        characters: {
          new: [character, character, character],
        },
      },
    };

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              getMostInstalledPacks: [manifest],
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await community.getMostInstalledPacks({
        guildId: 'guild_id',
        index: 0,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: '_',
                  disabled: true,
                  label: '1',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'install=pack-id',
                  label: 'Install',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
          embeds: [
            {
              description: '**pack-id**\nin 2K servers\n\n',
              title: '1.',
              type: 'rich',
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'full name',
                  value: 'long description',
                },
              ],
              footer: {
                text: 'Male, 420',
              },
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
            },
            {
              type: 'rich',
              fields: [
                {
                  name: 'full name',
                  value: 'long description',
                },
              ],
              footer: {
                text: 'Male, 420',
              },
              thumbnail: {
                url: 'http://localhost:8000/external/image_url?size=thumbnail',
              },
            },
          ],
        },
      });
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('installed', async () => {
    const manifest: Pack = {
      servers: 2000,
      manifest: {
        id: 'pack-id',
      },
    };

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              getMostInstalledPacks: [manifest],
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([{ ref: manifest }]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await community.getMostInstalledPacks({
        guildId: 'guild_id',
        index: 0,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: '_',
                  disabled: true,
                  label: '1',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: '_installed',
                  disabled: true,
                  label: 'Installed',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
          embeds: [
            {
              description: '**pack-id**\nin 2K servers\n\n',
              title: '1.',
              type: 'rich',
            },
          ],
        },
      });
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
    }
  });

  await test.step('filter', async () => {
    const manifest: Pack = {
      servers: 2000,
      manifest: {
        id: 'pack-id',
        private: true,
      },
    };

    const manifest2: Pack = {
      servers: 1,
      manifest: {
        id: 'pack-id2',
      },
    };

    const fetchStub = stub(
      globalThis,
      'fetch',
      () => ({
        ok: true,
        text: (() =>
          Promise.resolve(JSON.stringify({
            data: {
              getMostInstalledPacks: [manifest, manifest2],
            },
          }))),
      } as any),
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await community.getMostInstalledPacks({
        guildId: 'guild_id',
        index: 0,
      });

      assertEquals(message.json(), {
        type: 4,
        data: {
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: '_',
                  disabled: true,
                  label: '1',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'install=pack-id2',
                  label: 'Install',
                  style: 2,
                  type: 2,
                },
              ],
            },
          ],
          embeds: [
            {
              description: '**pack-id2**\nin 1 servers\n\n',
              title: '1.',
              type: 'rich',
            },
          ],
        },
      });
    } finally {
      delete config.appId;
      delete config.origin;

      fetchStub.restore();
      listStub.restore();
    }
  });
});
