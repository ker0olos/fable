// deno-lint-ignore-file no-explicit-any

import { assertEquals } from 'https://deno.land/std@0.178.0/testing/asserts.ts';

import {
  assertSpyCall,
  stub,
} from 'https://deno.land/std@0.178.0/testing/mock.ts';

import * as discord from '../src/discord.ts';

import utils from '../src/utils.ts';
import config from '../src/config.ts';

import { handler } from '../src/interactions.ts';

import user from '../src/user.ts';
import packs from '../src/packs.ts';

import { PackType } from '../src/types.ts';

Deno.test('media suggestions', async (test) => {
  await test.step('search', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        name: 'search',
        options: [{
          name: 'title',
          value: 'title',
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const searchStub = stub(packs, 'searchMany', () =>
      Promise.resolve([{
        id: 'id',
        packId: 'packId',
        title: {
          english: 'english title',
        },
      }] as any));

    config.publicKey = 'publicKey';

    try {
      const request = new Request('http://localhost:8000', {
        body,
        method: 'POST',
        headers: {
          'X-Signature-Ed25519': 'ed25519',
          'X-Signature-Timestamp': 'timestamp',
        },
      });

      const response = await handler(request);

      assertSpyCall(validateStub, 0, {
        args: [request, {
          POST: {
            headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
          },
        }],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(searchStub, 0, {
        args: [{ key: 'media', search: 'title', guildId: 'guild_id' }],
      });

      assertEquals(response?.ok, true);
      assertEquals(response?.redirected, false);

      assertEquals(response?.status, 200);
      assertEquals(response?.statusText, 'OK');

      const form = new FormData();

      form.append(
        'payload_json',
        JSON.stringify({
          type: 8,
          data: {
            choices: [{
              name: 'english title',
              value: 'id=packId:id',
            }],
          },
        }),
      );

      assertEquals(await response?.formData(), form);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('anime', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        name: 'anime',
        options: [{
          name: 'title',
          value: 'title',
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const searchStub = stub(packs, 'searchMany', () =>
      Promise.resolve([{
        id: 'id',
        packId: 'packId',
        title: {
          english: 'english title',
        },
      }] as any));

    config.publicKey = 'publicKey';

    try {
      const request = new Request('http://localhost:8000', {
        body,
        method: 'POST',
        headers: {
          'X-Signature-Ed25519': 'ed25519',
          'X-Signature-Timestamp': 'timestamp',
        },
      });

      const response = await handler(request);

      assertSpyCall(validateStub, 0, {
        args: [request, {
          POST: {
            headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
          },
        }],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(searchStub, 0, {
        args: [{ key: 'media', search: 'title', guildId: 'guild_id' }],
      });

      assertEquals(response?.ok, true);
      assertEquals(response?.redirected, false);

      assertEquals(response?.status, 200);
      assertEquals(response?.statusText, 'OK');

      const form = new FormData();

      form.append(
        'payload_json',
        JSON.stringify({
          type: 8,
          data: {
            choices: [{
              name: 'english title',
              value: 'id=packId:id',
            }],
          },
        }),
      );

      assertEquals(await response?.formData(), form);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('manga', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        name: 'manga',
        options: [{
          name: 'title',
          value: 'title',
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const searchStub = stub(packs, 'searchMany', () =>
      Promise.resolve([{
        id: 'id',
        packId: 'packId',
        title: {
          english: 'english title',
        },
      }] as any));

    config.publicKey = 'publicKey';

    try {
      const request = new Request('http://localhost:8000', {
        body,
        method: 'POST',
        headers: {
          'X-Signature-Ed25519': 'ed25519',
          'X-Signature-Timestamp': 'timestamp',
        },
      });

      const response = await handler(request);

      assertSpyCall(validateStub, 0, {
        args: [request, {
          POST: {
            headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
          },
        }],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(searchStub, 0, {
        args: [{ key: 'media', search: 'title', guildId: 'guild_id' }],
      });

      assertEquals(response?.ok, true);
      assertEquals(response?.redirected, false);

      assertEquals(response?.status, 200);
      assertEquals(response?.statusText, 'OK');

      const form = new FormData();

      form.append(
        'payload_json',
        JSON.stringify({
          type: 8,
          data: {
            choices: [{
              name: 'english title',
              value: 'id=packId:id',
            }],
          },
        }),
      );

      assertEquals(await response?.formData(), form);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('collection media', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        name: 'collection',
        options: [{
          type: 1,
          name: 'media',
          options: [{
            name: 'title',
            value: 'title',
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const searchStub = stub(packs, 'searchMany', () =>
      Promise.resolve([{
        id: 'id',
        packId: 'packId',
        title: {
          english: 'english title',
        },
      }] as any));

    config.publicKey = 'publicKey';

    try {
      const request = new Request('http://localhost:8000', {
        body,
        method: 'POST',
        headers: {
          'X-Signature-Ed25519': 'ed25519',
          'X-Signature-Timestamp': 'timestamp',
        },
      });

      const response = await handler(request);

      assertSpyCall(validateStub, 0, {
        args: [request, {
          POST: {
            headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
          },
        }],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(searchStub, 0, {
        args: [{ key: 'media', search: 'title', guildId: 'guild_id' }],
      });

      assertEquals(response?.ok, true);
      assertEquals(response?.redirected, false);

      assertEquals(response?.status, 200);
      assertEquals(response?.statusText, 'OK');

      const form = new FormData();

      form.append(
        'payload_json',
        JSON.stringify({
          type: 8,
          data: {
            choices: [{
              name: 'english title',
              value: 'id=packId:id',
            }],
          },
        }),
      );

      assertEquals(await response?.formData(), form);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('coll media', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        name: 'coll',
        options: [{
          type: 1,
          name: 'media',
          options: [{
            name: 'title',
            value: 'title',
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const searchStub = stub(packs, 'searchMany', () =>
      Promise.resolve([{
        id: 'id',
        packId: 'packId',
        title: {
          english: 'english title',
        },
      }] as any));

    config.publicKey = 'publicKey';

    try {
      const request = new Request('http://localhost:8000', {
        body,
        method: 'POST',
        headers: {
          'X-Signature-Ed25519': 'ed25519',
          'X-Signature-Timestamp': 'timestamp',
        },
      });

      const response = await handler(request);

      assertSpyCall(validateStub, 0, {
        args: [request, {
          POST: {
            headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
          },
        }],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(searchStub, 0, {
        args: [{ key: 'media', search: 'title', guildId: 'guild_id' }],
      });

      assertEquals(response?.ok, true);
      assertEquals(response?.redirected, false);

      assertEquals(response?.status, 200);
      assertEquals(response?.statusText, 'OK');

      const form = new FormData();

      form.append(
        'payload_json',
        JSON.stringify({
          type: 8,
          data: {
            choices: [{
              name: 'english title',
              value: 'id=packId:id',
            }],
          },
        }),
      );

      assertEquals(await response?.formData(), form);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('mm media', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        name: 'mm',
        options: [{
          type: 1,
          name: 'media',
          options: [{
            name: 'title',
            value: 'title',
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const searchStub = stub(packs, 'searchMany', () =>
      Promise.resolve([{
        id: 'id',
        packId: 'packId',
        title: {
          english: 'english title',
        },
      }] as any));

    config.publicKey = 'publicKey';

    try {
      const request = new Request('http://localhost:8000', {
        body,
        method: 'POST',
        headers: {
          'X-Signature-Ed25519': 'ed25519',
          'X-Signature-Timestamp': 'timestamp',
        },
      });

      const response = await handler(request);

      assertSpyCall(validateStub, 0, {
        args: [request, {
          POST: {
            headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
          },
        }],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(searchStub, 0, {
        args: [{ key: 'media', search: 'title', guildId: 'guild_id' }],
      });

      assertEquals(response?.ok, true);
      assertEquals(response?.redirected, false);

      assertEquals(response?.status, 200);
      assertEquals(response?.statusText, 'OK');

      const form = new FormData();

      form.append(
        'payload_json',
        JSON.stringify({
          type: 8,
          data: {
            choices: [{
              name: 'english title',
              value: 'id=packId:id',
            }],
          },
        }),
      );

      assertEquals(await response?.formData(), form);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('character suggestions', async (test) => {
  await test.step('character', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        name: 'character',
        options: [{
          name: 'name',
          value: 'name',
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const searchStub = stub(packs, 'searchMany', () =>
      Promise.resolve([{
        id: 'id',
        packId: 'packId',
        name: {
          english: 'english name',
        },
      }] as any));

    config.publicKey = 'publicKey';

    try {
      const request = new Request('http://localhost:8000', {
        body,
        method: 'POST',
        headers: {
          'X-Signature-Ed25519': 'ed25519',
          'X-Signature-Timestamp': 'timestamp',
        },
      });

      const response = await handler(request);

      assertSpyCall(validateStub, 0, {
        args: [request, {
          POST: {
            headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
          },
        }],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(searchStub, 0, {
        args: [{ key: 'characters', search: 'name', guildId: 'guild_id' }],
      });

      assertEquals(response?.ok, true);
      assertEquals(response?.redirected, false);

      assertEquals(response?.status, 200);
      assertEquals(response?.statusText, 'OK');

      const form = new FormData();

      form.append(
        'payload_json',
        JSON.stringify({
          type: 8,
          data: {
            choices: [{
              name: 'english name',
              value: 'id=packId:id',
            }],
          },
        }),
      );

      assertEquals(await response?.formData(), form);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('char', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        name: 'char',
        options: [{
          name: 'name',
          value: 'name',
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const searchStub = stub(packs, 'searchMany', () =>
      Promise.resolve([{
        id: 'id',
        packId: 'packId',
        name: {
          english: 'english name',
        },
      }] as any));

    config.publicKey = 'publicKey';

    try {
      const request = new Request('http://localhost:8000', {
        body,
        method: 'POST',
        headers: {
          'X-Signature-Ed25519': 'ed25519',
          'X-Signature-Timestamp': 'timestamp',
        },
      });

      const response = await handler(request);

      assertSpyCall(validateStub, 0, {
        args: [request, {
          POST: {
            headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
          },
        }],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(searchStub, 0, {
        args: [{ key: 'characters', search: 'name', guildId: 'guild_id' }],
      });

      assertEquals(response?.ok, true);
      assertEquals(response?.redirected, false);

      assertEquals(response?.status, 200);
      assertEquals(response?.statusText, 'OK');

      const form = new FormData();

      form.append(
        'payload_json',
        JSON.stringify({
          type: 8,
          data: {
            choices: [{
              name: 'english name',
              value: 'id=packId:id',
            }],
          },
        }),
      );

      assertEquals(await response?.formData(), form);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('im', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        name: 'im',
        options: [{
          name: 'name',
          value: 'name',
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const searchStub = stub(packs, 'searchMany', () =>
      Promise.resolve([{
        id: 'id',
        packId: 'packId',
        name: {
          english: 'english name',
        },
      }] as any));

    config.publicKey = 'publicKey';

    try {
      const request = new Request('http://localhost:8000', {
        body,
        method: 'POST',
        headers: {
          'X-Signature-Ed25519': 'ed25519',
          'X-Signature-Timestamp': 'timestamp',
        },
      });

      const response = await handler(request);

      assertSpyCall(validateStub, 0, {
        args: [request, {
          POST: {
            headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
          },
        }],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(searchStub, 0, {
        args: [{ key: 'characters', search: 'name', guildId: 'guild_id' }],
      });

      assertEquals(response?.ok, true);
      assertEquals(response?.redirected, false);

      assertEquals(response?.status, 200);
      assertEquals(response?.statusText, 'OK');

      const form = new FormData();

      form.append(
        'payload_json',
        JSON.stringify({
          type: 8,
          data: {
            choices: [{
              name: 'english name',
              value: 'id=packId:id',
            }],
          },
        }),
      );

      assertEquals(await response?.formData(), form);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('party assign character suggestions', async (test) => {
  await test.step('party assign', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'party',
        options: [{
          type: 1,
          name: 'assign',
          options: [{
            name: 'name',
            value: 'name',
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const searchStub = stub(packs, 'searchMany', () =>
      Promise.resolve([{
        id: 'id',
        packId: 'packId',
        name: {
          english: 'english name',
        },
      }] as any));

    const usersStub = stub(
      user,
      'allCharacters',
      () => Promise.resolve([{ id: 'packId:id' }] as any),
    );

    config.publicKey = 'publicKey';

    try {
      const request = new Request('http://localhost:8000', {
        body,
        method: 'POST',
        headers: {
          'X-Signature-Ed25519': 'ed25519',
          'X-Signature-Timestamp': 'timestamp',
        },
      });

      const response = await handler(request);

      assertSpyCall(validateStub, 0, {
        args: [request, {
          POST: {
            headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
          },
        }],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(searchStub, 0, {
        args: [{
          key: 'characters',
          search: 'name',
          guildId: 'guild_id',
          threshold: 35,
        }],
      });

      assertEquals(response?.ok, true);
      assertEquals(response?.redirected, false);

      assertEquals(response?.status, 200);
      assertEquals(response?.statusText, 'OK');

      const form = new FormData();

      form.append(
        'payload_json',
        JSON.stringify({
          type: 8,
          data: {
            choices: [{
              name: 'english name',
              value: 'id=packId:id',
            }],
          },
        }),
      );

      assertEquals(await response?.formData(), form);
    } finally {
      delete config.publicKey;

      usersStub.restore();
      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('team assign', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'team',
        options: [{
          type: 1,
          name: 'assign',
          options: [{
            name: 'name',
            value: 'name',
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const searchStub = stub(packs, 'searchMany', () =>
      Promise.resolve([{
        id: 'id',
        packId: 'packId',
        name: {
          english: 'english name',
        },
      }] as any));

    const usersStub = stub(
      user,
      'allCharacters',
      () => Promise.resolve([{ id: 'packId:id' }] as any),
    );

    config.publicKey = 'publicKey';

    try {
      const request = new Request('http://localhost:8000', {
        body,
        method: 'POST',
        headers: {
          'X-Signature-Ed25519': 'ed25519',
          'X-Signature-Timestamp': 'timestamp',
        },
      });

      const response = await handler(request);

      assertSpyCall(validateStub, 0, {
        args: [request, {
          POST: {
            headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
          },
        }],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(searchStub, 0, {
        args: [{
          key: 'characters',
          search: 'name',
          guildId: 'guild_id',
          threshold: 35,
        }],
      });

      assertEquals(response?.ok, true);
      assertEquals(response?.redirected, false);

      assertEquals(response?.status, 200);
      assertEquals(response?.statusText, 'OK');

      const form = new FormData();

      form.append(
        'payload_json',
        JSON.stringify({
          type: 8,
          data: {
            choices: [{
              name: 'english name',
              value: 'id=packId:id',
            }],
          },
        }),
      );

      assertEquals(await response?.formData(), form);
    } finally {
      delete config.publicKey;

      usersStub.restore();
      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('p assign', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'p',
        options: [{
          type: 1,
          name: 'assign',
          options: [{
            name: 'name',
            value: 'name',
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const searchStub = stub(packs, 'searchMany', () =>
      Promise.resolve([{
        id: 'id',
        packId: 'packId',
        name: {
          english: 'english name',
        },
      }] as any));

    const usersStub = stub(
      user,
      'allCharacters',
      () => Promise.resolve([{ id: 'packId:id' }] as any),
    );

    config.publicKey = 'publicKey';

    try {
      const request = new Request('http://localhost:8000', {
        body,
        method: 'POST',
        headers: {
          'X-Signature-Ed25519': 'ed25519',
          'X-Signature-Timestamp': 'timestamp',
        },
      });

      const response = await handler(request);

      assertSpyCall(validateStub, 0, {
        args: [request, {
          POST: {
            headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
          },
        }],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(searchStub, 0, {
        args: [{
          key: 'characters',
          search: 'name',
          guildId: 'guild_id',
          threshold: 35,
        }],
      });

      assertEquals(response?.ok, true);
      assertEquals(response?.redirected, false);

      assertEquals(response?.status, 200);
      assertEquals(response?.statusText, 'OK');

      const form = new FormData();

      form.append(
        'payload_json',
        JSON.stringify({
          type: 8,
          data: {
            choices: [{
              name: 'english name',
              value: 'id=packId:id',
            }],
          },
        }),
      );

      assertEquals(await response?.formData(), form);
    } finally {
      delete config.publicKey;

      usersStub.restore();
      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('packs', async (test) => {
  await test.step('uninstall', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        name: 'packs',
        options: [{
          type: 1,
          name: 'uninstall',
          options: [{
            name: 'id',
            value: 'id',
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const listStub = stub(
      packs,
      'all',
      () =>
        Promise.resolve([
          {
            type: PackType.Community,
            manifest: {
              id: 'id',
              title: 'title',
            },
          },
        ]),
    );

    config.publicKey = 'publicKey';

    try {
      const request = new Request('http://localhost:8000', {
        body,
        method: 'POST',
        headers: {
          'X-Signature-Ed25519': 'ed25519',
          'X-Signature-Timestamp': 'timestamp',
        },
      });

      const response = await handler(request);

      assertSpyCall(validateStub, 0, {
        args: [request, {
          POST: {
            headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
          },
        }],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(listStub, 0, {
        args: [{
          guildId: 'guild_id',
          type: PackType.Community,
        }],
      });

      assertEquals(response?.ok, true);
      assertEquals(response?.redirected, false);

      assertEquals(response?.status, 200);
      assertEquals(response?.statusText, 'OK');

      const form = new FormData();

      form.append(
        'payload_json',
        JSON.stringify({
          type: 8,
          data: {
            choices: [{
              name: 'title',
              value: 'id',
            }],
          },
        }),
      );

      assertEquals(await response?.formData(), form);
    } finally {
      delete config.publicKey;

      listStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('sort by title', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        name: 'packs',
        options: [{
          type: 1,
          name: 'uninstall',
          options: [{
            name: 'id',
            value: 'titl',
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const listStub = stub(
      packs,
      'all',
      () =>
        Promise.resolve([
          {
            type: PackType.Community,
            manifest: {
              id: 'id535245',
              title: 'title',
            },
          },
          {
            type: PackType.Community,
            manifest: {
              id: 'id998943894',
              title: 'name',
            },
          },
          {
            type: PackType.Community,
            manifest: {
              id: 'id424535',
              title: 'alias',
            },
          },
        ]),
    );

    config.publicKey = 'publicKey';

    try {
      const request = new Request('http://localhost:8000', {
        body,
        method: 'POST',
        headers: {
          'X-Signature-Ed25519': 'ed25519',
          'X-Signature-Timestamp': 'timestamp',
        },
      });

      const response = await handler(request);

      assertSpyCall(validateStub, 0, {
        args: [request, {
          POST: {
            headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
          },
        }],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(listStub, 0, {
        args: [{
          guildId: 'guild_id',
          type: PackType.Community,
        }],
      });

      assertEquals(response?.ok, true);
      assertEquals(response?.redirected, false);

      assertEquals(response?.status, 200);
      assertEquals(response?.statusText, 'OK');

      const form = new FormData();

      form.append(
        'payload_json',
        JSON.stringify({
          type: 8,
          data: {
            choices: [
              {
                name: 'title',
                value: 'id535245',
              },
              {
                name: 'alias',
                value: 'id424535',
              },
              {
                name: 'name',
                value: 'id998943894',
              },
            ],
          },
        }),
      );

      assertEquals(await response?.formData(), form);
    } finally {
      delete config.publicKey;

      listStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('sort by id', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        name: 'packs',
        options: [{
          type: 1,
          name: 'uninstall',
          options: [{
            name: 'id',
            value: 'titl',
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const listStub = stub(
      packs,
      'all',
      () =>
        Promise.resolve([
          {
            type: PackType.Community,
            manifest: {
              id: 'name',
            },
          },
          {
            type: PackType.Community,
            manifest: {
              id: 'title',
            },
          },
          {
            type: PackType.Community,
            manifest: {
              id: 'alias',
            },
          },
        ]),
    );

    config.publicKey = 'publicKey';

    try {
      const request = new Request('http://localhost:8000', {
        body,
        method: 'POST',
        headers: {
          'X-Signature-Ed25519': 'ed25519',
          'X-Signature-Timestamp': 'timestamp',
        },
      });

      const response = await handler(request);

      assertSpyCall(validateStub, 0, {
        args: [request, {
          POST: {
            headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
          },
        }],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(listStub, 0, {
        args: [{
          guildId: 'guild_id',
          type: PackType.Community,
        }],
      });

      assertEquals(response?.ok, true);
      assertEquals(response?.redirected, false);

      assertEquals(response?.status, 200);
      assertEquals(response?.statusText, 'OK');

      const form = new FormData();

      form.append(
        'payload_json',
        JSON.stringify({
          type: 8,
          data: {
            choices: [
              {
                name: 'title',
                value: 'title',
              },
              {
                name: 'alias',
                value: 'alias',
              },
              {
                name: 'name',
                value: 'name',
              },
            ],
          },
        }),
      );

      assertEquals(await response?.formData(), form);
    } finally {
      delete config.publicKey;

      listStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});
