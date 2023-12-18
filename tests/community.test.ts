// deno-lint-ignore-file no-explicit-any

import { assertEquals } from '$std/assert/mod.ts';

import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from '$std/testing/mock.ts';

import config from '../src/config.ts';

import utils from '../src/utils.ts';
import packs from '../src/packs.ts';
import community from '../src/community.ts';

import db from '../db/mod.ts';

import type { DisaggregatedCharacter } from '../src/types.ts';

Deno.test('/', async (test) => {
  await test.step('normal', async () => {
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              id: 'user_id',
            })),
        } as any,
      ]),
    );

    const getPacksByUserIdStub = stub(
      db,
      'getPacksByUserId',
      () => [] as any,
    );

    try {
      const request = new Request('http://localhost:8000', {
        method: 'GET',
        headers: { 'authorization': 'Bearer token' },
      });

      const response = await community.query(request);

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
        getPacksByUserIdStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(response.ok, true);
      assertEquals(response.status, 200);
      assertEquals(response.statusText, 'OK');
    } finally {
      fetchStub.restore();
      getPacksByUserIdStub.restore();
    }
  });

  await test.step('invalid access token', async () => {
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
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
        method: 'GET',
        headers: { 'authorization': 'Bearer token' },
      });

      const response = await community.query(request);

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
});

Deno.test('/publish', async (test) => {
  await test.step('normal', async () => {
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              id: 'user_id',
            })),
        } as any,
      ]),
    );

    const publishPackStub = stub(
      db,
      'publishPack',
      () => [] as any,
    );

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        headers: { 'authorization': 'Bearer token' },
        body: JSON.stringify({ manifest: { id: 'pack_id' } }),
      });

      const response = await community.publish(request);

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
        publishPackStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(publishPackStub.calls[0].args[1], { id: 'pack_id' });

      assertEquals(response.ok, true);
      assertEquals(response.status, 200);
      assertEquals(response.statusText, 'OK');
    } finally {
      fetchStub.restore();
      publishPackStub.restore();
    }
  });

  await test.step('invalid access token', async () => {
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
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
        headers: { 'authorization': 'Bearer token' },
        body: JSON.stringify({
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
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              id: 'user_id',
            })),
        } as any,
      ]),
    );

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        headers: { 'authorization': 'Bearer token' },
        body: JSON.stringify({
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
            message: "must have required property 'id'",
            params: {
              missingProperty: 'id',
            },
            schemaPath: '#/required',
          },
        ],
      });
    } finally {
      fetchStub.restore();
    }
  });

  await test.step('permission denied', async () => {
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              id: 'user_id',
            })),
        } as any,
      ]),
    );

    const publishPackStub = stub(
      db,
      'publishPack',
      () => {
        throw new Error('PERMISSION_DENIED');
      },
    );

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        headers: { 'authorization': 'Bearer token' },
        body: JSON.stringify({
          manifest: {
            id: 'pack_id',
          },
        }),
      });

      const response = await community.publish(request);

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
        publishPackStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(publishPackStub.calls[0].args[1], { id: 'pack_id' });

      assertEquals(response.ok, false);
      assertEquals(response.status, 403);
      assertEquals(response.statusText, 'Forbidden');

      assertEquals(await response.json(), {
        error: 'No permission to edit this pack',
      });
    } finally {
      fetchStub.restore();
      publishPackStub.restore();
    }
  });

  await test.step('unknown server error', async () => {
    const fetchStub = stub(
      utils,
      'fetchWithRetry',
      returnsNext([
        {
          ok: true,
          json: (() =>
            Promise.resolve({
              id: 'user_id',
            })),
        } as any,
      ]),
    );

    const publishPackStub = stub(
      db,
      'publishPack',
      () => {
        throw new Error();
      },
    );

    try {
      const request = new Request('http://localhost:8000', {
        method: 'POST',
        headers: { 'authorization': 'Bearer token' },
        body: JSON.stringify({ manifest: { id: 'pack_id' } }),
      });

      const response = await community.publish(request);

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
        publishPackStub.calls[0].args[0],
        'user_id',
      );

      assertEquals(publishPackStub.calls[0].args[1], { id: 'pack_id' });

      assertEquals(response.ok, false);
      assertEquals(response.status, 501);
      assertEquals(response.statusText, 'Internal Server Error');

      assertEquals(await response.json(), {
        error: 'Internal Server Error',
      });
    } finally {
      fetchStub.restore();
      publishPackStub.restore();
    }
  });
});

Deno.test('/popular', async (test) => {
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

    const manifest = {
      servers: 2000,
      manifest: {
        id: 'pack-id',
        characters: {
          new: [character, character, character],
        },
      },
    };

    const popularPacksStub = stub(
      db,
      'popularPacks',
      () => Promise.resolve([manifest]) as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([]),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await community.popularPacks({
        userId: 'user_id',
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

      popularPacksStub.restore();
      listStub.restore();
    }
  });

  await test.step('installed', async () => {
    const manifest = {
      servers: 2000,
      manifest: {
        id: 'pack-id',
      },
    };

    const popularPacksStub = stub(
      db,
      'popularPacks',
      () => Promise.resolve([manifest]) as any,
    );

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([{ manifest: manifest.manifest }] as any),
    );

    config.appId = 'app_id';
    config.origin = 'http://localhost:8000';

    try {
      const message = await community.popularPacks({
        userId: 'user_id',
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

      popularPacksStub.restore();
      listStub.restore();
    }
  });
});
