// deno-lint-ignore-file no-explicit-any

import { assertEquals } from 'https://deno.land/std@0.179.0/testing/asserts.ts';

import {
  assertSpyCall,
  assertSpyCallArg,
  spy,
  stub,
} from 'https://deno.land/std@0.179.0/testing/mock.ts';

import * as discord from '../src/discord.ts';

import utils from '../src/utils.ts';
import config from '../src/config.ts';

import { handler } from '../src/interactions.ts';

import search from '../src/search.ts';
import party from '../src/party.ts';
import gacha from '../src/gacha.ts';
import user from '../src/user.ts';
import packs from '../src/packs.ts';
import help from '../src/help.ts';
import trade from '../src/trade.ts';

import { NonFetalError, NoPermissionError } from '../src/errors.ts';

import { Manifest, PackType } from '../src/types.ts';

Deno.test('search command handlers', async (test) => {
  await test.step('search', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
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

    const searchStub = stub(search, 'media', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
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
          guildId: 'guild_id',
          search: 'title',
          debug: false,
          id: undefined,
        }],
      });

      assertEquals(response, true as any);
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
      type: discord.InteractionType.Command,
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

    const searchStub = stub(search, 'media', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
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
          guildId: 'guild_id',
          search: 'title',
          debug: false,
          id: undefined,
        }],
      });

      assertEquals(response, true as any);
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
      type: discord.InteractionType.Command,
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

    const searchStub = stub(search, 'media', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
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
          guildId: 'guild_id',
          search: 'title',
          debug: false,
          id: undefined,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('media', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        name: 'media',
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

    const searchStub = stub(search, 'media', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
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
          guildId: 'guild_id',
          search: 'title',
          debug: false,
          id: undefined,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('debug', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        name: 'search',
        options: [{
          name: 'title',
          value: 'title',
        }, {
          name: 'debug',
          value: true,
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const searchStub = stub(search, 'media', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
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
          guildId: 'guild_id',
          search: 'title',
          debug: true,
          id: undefined,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('id prefix', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        name: 'search',
        options: [{
          name: 'title',
          value: 'id=uuid',
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const searchStub = stub(search, 'media', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
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
          guildId: 'guild_id',
          search: 'id=uuid',
          debug: false,
          id: 'uuid',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('characters', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'media',
        options: [
          {
            name: 'title',
            value: 'title',
          },
          {
            name: 'characters',
            value: true,
          },
        ],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const searchStub = stub(search, 'mediaCharacters', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
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
          index: 0,
          userId: 'user_id',
          guildId: 'guild_id',
          search: 'title',
          id: undefined,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('characters with id prefix', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'media',
        options: [
          {
            name: 'title',
            value: 'id=uuid',
          },
          {
            name: 'characters',
            value: true,
          },
        ],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const searchStub = stub(search, 'mediaCharacters', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
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
          index: 0,
          userId: 'user_id',
          guildId: 'guild_id',
          search: 'id=uuid',
          id: 'uuid',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('character command handlers', async (test) => {
  await test.step('character', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
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

    const searchStub = stub(search, 'character', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
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
          userId: 'user_id',
          guildId: 'guild_id',
          search: 'name',
          debug: false,
          id: undefined,
        }],
      });

      assertEquals(response, true as any);
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
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
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

    const searchStub = stub(search, 'character', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
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
          userId: 'user_id',
          guildId: 'guild_id',
          search: 'name',
          debug: false,
          id: undefined,
        }],
      });

      assertEquals(response, true as any);
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
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
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

    const searchStub = stub(search, 'character', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
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
          userId: 'user_id',
          guildId: 'guild_id',
          search: 'name',
          debug: false,
          id: undefined,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('debug', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'character',
        options: [{
          name: 'name',
          value: 'name',
        }, {
          name: 'debug',
          value: true,
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const searchStub = stub(search, 'character', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
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
          userId: 'user_id',
          guildId: 'guild_id',
          search: 'name',
          debug: true,
          id: undefined,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('id prefix', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'character',
        options: [{
          name: 'name',
          value: 'id=uuid',
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const searchStub = stub(search, 'character', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
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
          userId: 'user_id',
          guildId: 'guild_id',
          search: 'id=uuid',
          debug: false,
          id: 'uuid',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('party command handlers', async (test) => {
  await test.step('party view', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
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
          name: 'view',
          options: [],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const partyStub = stub(party, 'view', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(partyStub, 0, {
        args: [{
          userId: 'user_id',
          guildId: 'guild_id',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      partyStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('party assign', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
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

    const partyStub = stub(party, 'assign', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(partyStub, 0, {
        args: [{
          userId: 'user_id',
          guildId: 'guild_id',
          search: 'name',
          spot: undefined,
          id: undefined,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      partyStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('party assign with spot', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
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
          }, {
            name: 'spot',
            value: 5,
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const partyStub = stub(party, 'assign', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(partyStub, 0, {
        args: [{
          userId: 'user_id',
          guildId: 'guild_id',
          search: 'name',
          spot: 5,
          id: undefined,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      partyStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('party assign (id prefix)', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
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
            value: 'id=uuid',
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const partyStub = stub(party, 'assign', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(partyStub, 0, {
        args: [{
          userId: 'user_id',
          guildId: 'guild_id',
          search: 'id=uuid',
          spot: undefined,
          id: 'uuid',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      partyStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('party swap', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
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
          name: 'swap',
          options: [{
            name: 'a',
            value: 5,
          }, {
            name: 'b',
            value: 1,
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const partyStub = stub(party, 'swap', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(partyStub, 0, {
        args: [{
          userId: 'user_id',
          guildId: 'guild_id',
          a: 5,
          b: 1,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      partyStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('party remove', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
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
          name: 'remove',
          options: [{
            name: 'spot',
            value: 5,
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const partyStub = stub(party, 'remove', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(partyStub, 0, {
        args: [{
          userId: 'user_id',
          guildId: 'guild_id',
          spot: 5,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      partyStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('collection command handlers', async (test) => {
  await test.step('collection stars', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'collection',
        options: [{
          type: 1,
          name: 'stars',
          options: [{
            name: 'rating',
            value: 5,
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const partyStub = stub(user, 'stars', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(partyStub, 0, {
        args: [{
          stars: 5,
          userId: 'user_id',
          guildId: 'guild_id',
          nick: undefined,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      partyStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('collection stars (user)', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'collection',
        resolved: {
          members: {
            'another_user_id': {
              nick: 'nickname',
            },
          },
        },
        options: [{
          type: 1,
          name: 'stars',
          options: [{
            name: 'rating',
            value: 5,
          }, {
            name: 'user',
            value: 'another_user_id',
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const partyStub = stub(user, 'stars', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(partyStub, 0, {
        args: [{
          stars: 5,
          userId: 'another_user_id',
          guildId: 'guild_id',
          nick: 'nickname',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      partyStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('collection stars (user) (no nickname)', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'collection',
        resolved: {
          members: {
            'another_user_id': {},
          },
          users: {
            'another_user_id': {
              username: 'username',
            },
          },
        },
        options: [{
          type: 1,
          name: 'stars',
          options: [{
            name: 'rating',
            value: 5,
          }, {
            name: 'user',
            value: 'another_user_id',
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const partyStub = stub(user, 'stars', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(partyStub, 0, {
        args: [{
          stars: 5,
          userId: 'another_user_id',
          guildId: 'guild_id',
          nick: 'username',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      partyStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('collection media', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
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

    const partyStub = stub(user, 'media', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(partyStub, 0, {
        args: [{
          search: 'title',
          userId: 'user_id',
          guildId: 'guild_id',
          nick: undefined,
          id: undefined,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      partyStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('collection stars with specific user', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'collection',
        resolved: {
          members: {
            'another_user_id': {
              nick: 'nickname',
            },
          },
        },
        options: [{
          type: 1,
          name: 'media',
          options: [{
            name: 'title',
            value: 'title',
          }, {
            name: 'user',
            value: 'another_user_id',
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const partyStub = stub(user, 'media', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(partyStub, 0, {
        args: [{
          search: 'title',
          userId: 'another_user_id',
          guildId: 'guild_id',
          nick: 'nickname',
          id: undefined,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      partyStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('collection stars with (user) (no nickname)', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'collection',
        resolved: {
          members: {
            'another_user_id': {},
          },
          users: {
            'another_user_id': {
              username: 'username',
            },
          },
        },
        options: [{
          type: 1,
          name: 'media',
          options: [{
            name: 'title',
            value: 'title',
          }, {
            name: 'user',
            value: 'another_user_id',
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const partyStub = stub(user, 'media', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(partyStub, 0, {
        args: [{
          search: 'title',
          userId: 'another_user_id',
          guildId: 'guild_id',
          nick: 'username',
          id: undefined,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      partyStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('collection media (id prefix)', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'collection',
        options: [{
          type: 1,
          name: 'media',
          options: [{
            name: 'title',
            value: 'id=uuid',
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const partyStub = stub(user, 'media', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(partyStub, 0, {
        args: [{
          search: 'id=uuid',
          userId: 'user_id',
          guildId: 'guild_id',
          id: 'uuid',
          nick: undefined,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      partyStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('found command handlers', async (test) => {
  await test.step('normal', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        name: 'found',
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

    const searchStub = stub(search, 'mediaFound', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
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
          guildId: 'guild_id',
          search: 'title',
          id: undefined,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('obtained', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        name: 'obtained',
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

    const searchStub = stub(search, 'mediaFound', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
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
          guildId: 'guild_id',
          search: 'title',
          id: undefined,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('owned', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        name: 'owned',
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

    const searchStub = stub(search, 'mediaFound', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
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
          guildId: 'guild_id',
          search: 'title',
          id: undefined,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('id prefix', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        name: 'found',
        options: [{
          name: 'title',
          value: 'id=uuid',
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const searchStub = stub(search, 'mediaFound', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
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
          guildId: 'guild_id',
          search: 'id=uuid',
          id: 'uuid',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('now command handlers', async (test) => {
  await test.step('now', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'now',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const searchStub = stub(user, 'now', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
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
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('vote', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'vote',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const searchStub = stub(user, 'now', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
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
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('daily', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'daily',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const searchStub = stub(user, 'now', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
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
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('tu', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'tu',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const searchStub = stub(user, 'now', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
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
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      searchStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('trade command handlers', async (test) => {
  await test.step('trade', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'trade',
        options: [
          {
            name: 'user',
            value: 'another_user_id',
          },
          {
            name: 'give',
            value: 'give_character_id',
          },
          {
            name: 'give2',
            value: 'give_character_id_2',
          },
          {
            name: 'give3',
            value: 'give_character_id_3',
          },
          {
            name: 'take',
            value: 'take_character_id',
          },
          {
            name: 'take2',
            value: 'take_character_id_2',
          },
          {
            name: 'take3',
            value: 'take_character_id_3',
          },
        ],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const tradeStub = stub(trade, 'pre', () => ({
      send: () => true,
    } as any));

    config.trading = true;
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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(tradeStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          targetId: 'another_user_id',
          give: [
            'give_character_id',
            'give_character_id_2',
            'give_character_id_3',
          ],
          take: [
            'take_character_id',
            'take_character_id_2',
            'take_character_id_3',
          ],
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.trading;
      delete config.publicKey;

      tradeStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('offer', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'offer',
        options: [
          {
            name: 'user',
            value: 'another_user_id',
          },
          {
            name: 'give3',
            value: 'give_character_id_3',
          },
          {
            name: 'take3',
            value: 'take_character_id_3',
          },
        ],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const tradeStub = stub(trade, 'pre', () => ({
      send: () => true,
    } as any));

    config.trading = true;
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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(tradeStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          targetId: 'another_user_id',
          give: ['give_character_id_3'],
          take: ['take_character_id_3'],
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.trading;
      delete config.publicKey;

      tradeStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('disabled', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'trade',
        options: [
          {
            name: 'user',
            value: 'another_user_id',
          },
          {
            name: 'give',
            value: 'give_character_id',
          },
          {
            name: 'take',
            value: 'take_character_id',
          },
        ],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const tradeStub = stub(trade, 'pre', () => ({
      send: () => true,
    } as any));

    config.trading = false;
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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertEquals(response?.ok, true);
      assertEquals(response?.redirected, false);

      assertEquals(response?.status, 200);
      assertEquals(response?.statusText, 'OK');

      const json = JSON.parse(
        // deno-lint-ignore no-non-null-assertion
        (await response?.formData()).get('payload_json')!.toString(),
      );

      assertEquals(json, {
        type: 4,
        data: {
          content: '',
          embeds: [{
            type: 'rich',
            description: 'Trading is under maintenance, try again later!',
          }],
          attachments: [],
          components: [],
          flags: 64,
        },
      });
    } finally {
      delete config.trading;
      delete config.publicKey;

      tradeStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('give command handlers', async (test) => {
  await test.step('give', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'give',
        options: [
          {
            name: 'user',
            value: 'another_user_id',
          },
          {
            name: 'give',
            value: 'give_character_id',
          },
          {
            name: 'give2',
            value: 'give_character_id_2',
          },
          {
            name: 'give3',
            value: 'give_character_id_3',
          },
        ],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const tradeStub = stub(trade, 'pre', () => ({
      send: () => true,
    } as any));

    config.trading = true;
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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(tradeStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          targetId: 'another_user_id',
          give: [
            'give_character_id',
            'give_character_id_2',
            'give_character_id_3',
          ],
          take: [],
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.trading;
      delete config.publicKey;

      tradeStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('gift', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'gift',
        options: [
          {
            name: 'user',
            value: 'another_user_id',
          },
          {
            name: 'give3',
            value: 'give_character_id_3',
          },
        ],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const tradeStub = stub(trade, 'pre', () => ({
      send: () => true,
    } as any));

    config.trading = true;
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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(tradeStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          targetId: 'another_user_id',
          give: ['give_character_id_3'],
          take: [],
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.trading;
      delete config.publicKey;

      tradeStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('disabled', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'give',
        options: [
          {
            name: 'user',
            value: 'another_user_id',
          },
          {
            name: 'give',
            value: 'give_character_id',
          },
        ],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const tradeStub = stub(trade, 'pre', () => ({
      send: () => true,
    } as any));

    config.trading = false;
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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertEquals(response?.ok, true);
      assertEquals(response?.redirected, false);

      assertEquals(response?.status, 200);
      assertEquals(response?.statusText, 'OK');

      const json = JSON.parse(
        // deno-lint-ignore no-non-null-assertion
        (await response?.formData()).get('payload_json')!.toString(),
      );

      assertEquals(json, {
        type: 4,
        data: {
          content: '',
          embeds: [{
            type: 'rich',
            description: 'Trading is under maintenance, try again later!',
          }],
          attachments: [],
          components: [],
          flags: 64,
        },
      });
    } finally {
      delete config.trading;
      delete config.publicKey;

      tradeStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('gacha command handlers', async (test) => {
  await test.step('gacha', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'gacha',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const gachaStub = stub(gacha, 'start', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(gachaStub, 0, {
        args: [{
          quiet: false,
          userId: 'user_id',
          guildId: 'guild_id',
          token: 'token',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      gachaStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('w', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'w',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const gachaStub = stub(gacha, 'start', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(gachaStub, 0, {
        args: [{
          quiet: false,
          userId: 'user_id',
          guildId: 'guild_id',
          token: 'token',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      gachaStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('pull', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'pull',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const gachaStub = stub(gacha, 'start', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(gachaStub, 0, {
        args: [{
          quiet: true,
          userId: 'user_id',
          guildId: 'guild_id',
          token: 'token',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      gachaStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('q', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'q',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const gachaStub = stub(gacha, 'start', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(gachaStub, 0, {
        args: [{
          quiet: true,
          userId: 'user_id',
          guildId: 'guild_id',
          token: 'token',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      gachaStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('anilist command handlers', async () => {
  const body = JSON.stringify({
    id: 'id',
    token: 'token',
    type: discord.InteractionType.Command,
    guild_id: 'guild_id',
    channel_id: 'channel_id',
    data: {
      name: 'anilist',
      options: [{
        type: 1,
        name: 'subcommand',
        value: 'subcommand',
      }],
    },
  });

  const validateStub = stub(utils, 'validateRequest', () => ({} as any));

  const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
    valid: true,
    body,
  } as any));

  const anilistStub = stub(packs, 'anilist', () => ({
    send: () => true,
  } as any));

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
      args: [
        request,
        {
          POST: {
            headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
          },
        },
      ],
    });

    assertSpyCall(signatureStub, 0, {
      args: [{
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      }],
    });

    assertSpyCallArg(anilistStub, 0, 0, 'subcommand');

    assertEquals(response, true as any);
  } finally {
    delete config.publicKey;

    anilistStub.restore();
    validateStub.restore();
    signatureStub.restore();
  }
});

Deno.test('help command handlers', async (test) => {
  await test.step('help', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'help',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const helpStub = stub(help, 'pages', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(helpStub, 0, {
        args: [{
          userId: 'user_id',
          index: 0,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      helpStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('start', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'start',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const helpStub = stub(help, 'pages', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(helpStub, 0, {
        args: [{
          userId: 'user_id',
          index: 0,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      helpStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('guide', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'guide',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const helpStub = stub(help, 'pages', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(helpStub, 0, {
        args: [{
          userId: 'user_id',
          index: 0,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      helpStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('tuto', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'tuto',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const helpStub = stub(help, 'pages', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(helpStub, 0, {
        args: [{
          userId: 'user_id',
          index: 0,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      helpStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('help with a specified page index', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'help',
        options: [{
          name: 'page',
          value: 3,
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const helpStub = stub(help, 'pages', () => ({
      send: () => true,
    } as any));

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(helpStub, 0, {
        args: [{
          userId: 'user_id',
          index: 3,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      helpStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('packs command handlers', async (test) => {
  await test.step('packs builtin', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        name: 'packs',
        options: [{
          type: 1,
          name: 'builtin',
          options: [],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setFlagsSpy = spy(() => ({
      send: () => true,
    }));

    const packsStub = stub(packs, 'pages', () =>
      ({
        setFlags: setFlagsSpy,
      }) as any);

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(setFlagsSpy, 0, {
        args: [64],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(packsStub, 0, {
        args: [{
          guildId: 'guild_id',
          type: PackType.Builtin,
          index: 0,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      packsStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('packs community', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        name: 'packs',
        options: [{
          type: 1,
          name: `community`,
          options: [],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setFlagsSpy = spy(() => ({
      send: () => true,
    }));

    const packsStub = stub(packs, 'pages', () =>
      ({
        setFlags: setFlagsSpy,
      }) as any);

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(setFlagsSpy, 0, {
        args: [64],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(packsStub, 0, {
        args: [{
          guildId: 'guild_id',
          type: PackType.Community,
          index: 0,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      packsStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('packs validate', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'packs',
        options: [{
          type: 1,
          name: `validate`,
          options: [{
            name: 'github',
            value: 'github',
          }, {
            name: 'ref',
            value: 'ref',
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setFlagsSpy = spy(() => ({
      send: () => true,
    }));

    const packsStub = stub(packs, 'install', () =>
      ({
        setFlags: setFlagsSpy,
      }) as any);

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(setFlagsSpy, 0, {
        args: [64],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(packsStub, 0, {
        args: [{
          shallow: true,
          userId: 'user_id',
          guildId: 'guild_id',
          token: 'token',
          url: 'github',
          ref: 'ref',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      packsStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('packs install', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'packs',
        options: [{
          type: 1,
          name: `install`,
          options: [{
            name: 'github',
            value: 'github',
          }, {
            name: 'ref',
            value: 'ref',
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setFlagsSpy = spy(() => ({
      send: () => true,
    }));

    const packsStub = stub(packs, 'install', () =>
      ({
        setFlags: setFlagsSpy,
      }) as any);

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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(setFlagsSpy, 0, {
        args: [64],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(packsStub, 0, {
        args: [{
          shallow: false,
          userId: 'user_id',
          guildId: 'guild_id',
          token: 'token',
          url: 'github',
          ref: 'ref',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      packsStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('packs uninstall', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        name: 'packs',
        options: [{
          type: 1,
          name: `uninstall`,
          options: [{
            name: 'id',
            value: 'manifest_id',
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const manifest: Manifest = {
      id: 'manifest_id',
    };

    const listStub = stub(
      packs,
      'all',
      () =>
        Promise.resolve([
          { manifest, type: PackType.Community },
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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertEquals(response?.ok, true);
      assertEquals(response?.redirected, false);

      assertEquals(response?.status, 200);
      assertEquals(response?.statusText, 'OK');

      const json = JSON.parse(
        // deno-lint-ignore no-non-null-assertion
        (await response?.formData()).get('payload_json')!.toString(),
      );

      assertEquals({
        type: 4,
        data: {
          flags: 64,
          embeds: [
            {
              type: 'rich',
              title: 'manifest_id',
            },
            {
              type: 'rich',
              description:
                `**Are you sure you want to uninstall this pack?**\n\nUninstalling a pack will disable any characters your server members have from the pack, which may be met with negative reactions.`,
            },
          ],
          attachments: [],
          components: [{
            type: 1,
            components: [{
              custom_id: 'uninstall=manifest_id',
              label: 'Confirm',
              style: 2,
              type: 2,
            }, {
              custom_id: 'cancel',
              label: 'Cancel',
              style: 4,
              type: 2,
            }],
          }],
        },
      }, json);
    } finally {
      delete config.publicKey;

      listStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('packs uninstall (not found)', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        name: 'packs',
        options: [{
          type: 1,
          name: `uninstall`,
          options: [{
            name: 'id',
            value: 'manifest_id',
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
      () => Promise.resolve([]),
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
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertEquals(response?.ok, true);
      assertEquals(response?.redirected, false);

      assertEquals(response?.status, 200);
      assertEquals(response?.statusText, 'OK');

      const json = JSON.parse(
        // deno-lint-ignore no-non-null-assertion
        (await response?.formData()).get('payload_json')!.toString(),
      );

      assertEquals({
        type: 4,
        data: {
          flags: 64,
          content: '',
          embeds: [
            {
              type: 'rich',
              description: 'Found _nothing_ matching that query!',
            },
          ],
          attachments: [],
          components: [],
        },
      }, json);
    } finally {
      delete config.publicKey;

      listStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('invalid request', async (test) => {
  await test.step('invalid', async () => {
    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: false,
      body,
    } as any));

    config.publicKey = 'publicKey';

    try {
      const request = new Request('http://localhost:8000', {
        body: 'body',
        method: 'POST',
        headers: {},
      });

      const response = await handler(request);

      assertSpyCall(validateStub, 0, {
        args: [
          request,
          {
            POST: {
              headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
            },
          },
        ],
      });

      assertSpyCall(signatureStub, 0, {
        args: [{
          body: 'body',
          signature: undefined,
          timestamp: undefined,
          publicKey: 'publicKey',
        }],
      });

      assertEquals(response?.ok, false);
      assertEquals(response?.redirected, false);

      assertEquals(response?.status, 401);
      assertEquals(response?.statusText, 'Unauthorized');

      assertEquals(
        response?.headers.get('content-type'),
        'application/json; charset=utf-8',
      );
    } finally {
      delete config.publicKey;

      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('unimplemented interaction', async () => {
  const body = JSON.stringify({
    id: 'id',
    token: 'token',
    type: discord.InteractionType.Command,
    guild_id: 'guild_id',
    channel_id: 'channel_id',
    data: {
      name: 'name',
    },
  });

  const validateStub = stub(utils, 'validateRequest', () => ({} as any));

  const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
    valid: true,
    body,
  } as any));

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
      args: [
        request,
        {
          POST: {
            headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
          },
        },
      ],
    });

    assertSpyCall(signatureStub, 0, {
      args: [{
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      }],
    });

    assertEquals(response?.ok, true);
    assertEquals(response?.redirected, false);

    assertEquals(response?.status, 200);
    assertEquals(response?.statusText, 'OK');

    const json = JSON.parse(
      // deno-lint-ignore no-non-null-assertion
      (await response?.formData()).get('payload_json')!.toString(),
    );

    assertEquals(json, {
      type: 4,
      data: {
        embeds: [],
        attachments: [],
        components: [],
        content: 'Unimplemented',
      },
    });
  } finally {
    delete config.publicKey;

    validateStub.restore();
    signatureStub.restore();
  }
});

Deno.test('ping interaction', async () => {
  const body = JSON.stringify({
    id: 'id',
    token: 'token',
    type: discord.InteractionType.Ping,
    guild_id: 'guild_id',
    channel_id: 'channel_id',
  });

  const validateStub = stub(utils, 'validateRequest', () => ({} as any));

  const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
    valid: true,
    body,
  } as any));

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
      args: [
        request,
        {
          POST: {
            headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
          },
        },
      ],
    });

    assertSpyCall(signatureStub, 0, {
      args: [{
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      }],
    });

    assertEquals(response?.ok, true);
    assertEquals(response?.redirected, false);

    assertEquals(response?.status, 200);
    assertEquals(response?.statusText, 'OK');

    assertEquals(
      response?.headers.get('content-type'),
      'application/json; charset=utf-8',
    );

    assertEquals(await response?.json(), {
      type: 1,
    });
  } finally {
    delete config.publicKey;

    validateStub.restore();
    signatureStub.restore();
  }
});

Deno.test('not found error', async () => {
  const body = JSON.stringify({
    id: 'id',
    token: 'token',
    type: discord.InteractionType.Command,
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

  const searchStub = stub(search, 'media', () => ({
    send: () => {
      throw new Error('404');
    },
  } as any));

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
      args: [
        request,
        {
          POST: {
            headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
          },
        },
      ],
    });

    assertSpyCall(signatureStub, 0, {
      args: [{
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      }],
    });

    assertEquals(response?.ok, true);
    assertEquals(response?.redirected, false);

    assertEquals(response?.status, 200);
    assertEquals(response?.statusText, 'OK');

    const json = JSON.parse(
      // deno-lint-ignore no-non-null-assertion
      (await response?.formData()).get('payload_json')!.toString(),
    );

    assertEquals(json, {
      type: 4,
      data: {
        content: '',
        embeds: [{
          type: 'rich',
          description: 'Found _nothing_ matching that query!',
        }],
        attachments: [],
        components: [],
        flags: 64,
      },
    });
  } finally {
    delete config.publicKey;

    searchStub.restore();
    validateStub.restore();
    signatureStub.restore();
  }
});

Deno.test('not fetal error', async () => {
  const body = JSON.stringify({
    id: 'id',
    token: 'token',
    type: discord.InteractionType.Command,
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

  const searchStub = stub(search, 'media', () => ({
    send: () => {
      throw new NonFetalError('not_fetal');
    },
  } as any));

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
      args: [
        request,
        {
          POST: {
            headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
          },
        },
      ],
    });

    assertSpyCall(signatureStub, 0, {
      args: [{
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      }],
    });

    assertEquals(response?.ok, true);
    assertEquals(response?.redirected, false);

    assertEquals(response?.status, 200);
    assertEquals(response?.statusText, 'OK');

    const json = JSON.parse(
      // deno-lint-ignore no-non-null-assertion
      (await response?.formData()).get('payload_json')!.toString(),
    );

    assertEquals(json, {
      type: 4,
      data: {
        content: '',
        embeds: [{
          type: 'rich',
          description: 'not_fetal',
        }],
        attachments: [],
        components: [],
        flags: 64,
      },
    });
  } finally {
    delete config.publicKey;

    searchStub.restore();
    validateStub.restore();
    signatureStub.restore();
  }
});

Deno.test('no permission error', async () => {
  const body = JSON.stringify({
    id: 'id',
    token: 'token',
    type: discord.InteractionType.Command,
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

  const searchStub = stub(search, 'media', () => ({
    send: () => {
      throw new NoPermissionError();
    },
  } as any));

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
      args: [
        request,
        {
          POST: {
            headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
          },
        },
      ],
    });

    assertSpyCall(signatureStub, 0, {
      args: [{
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      }],
    });

    assertEquals(response?.ok, true);
    assertEquals(response?.redirected, false);

    assertEquals(response?.status, 200);
    assertEquals(response?.statusText, 'OK');

    const json = JSON.parse(
      // deno-lint-ignore no-non-null-assertion
      (await response?.formData()).get('payload_json')!.toString(),
    );

    assertEquals(json, {
      type: 4,
      data: {
        content: '',
        embeds: [{
          type: 'rich',
          description: 'You don\'t permission to complete this interaction!',
        }],
        attachments: [],
        components: [],
        flags: 64,
      },
    });
  } finally {
    delete config.publicKey;

    searchStub.restore();
    validateStub.restore();
    signatureStub.restore();
  }
});

Deno.test('internal error', async () => {
  const body = JSON.stringify({
    id: 'id',
    token: 'token',
    type: discord.InteractionType.Command,
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

  const searchStub = stub(search, 'media', () => ({
    send: () => {
      throw new Error();
    },
  } as any));

  const captureStub = stub(utils, 'captureException', () => 'error_id');

  config.sentry = '_';
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
      args: [
        request,
        {
          POST: {
            headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
          },
        },
      ],
    });

    assertSpyCall(signatureStub, 0, {
      args: [{
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      }],
    });

    assertEquals(response?.ok, true);
    assertEquals(response?.redirected, false);

    assertEquals(response?.status, 200);
    assertEquals(response?.statusText, 'OK');

    const json = JSON.parse(
      // deno-lint-ignore no-non-null-assertion
      (await response?.formData()).get('payload_json')!.toString(),
    );

    assertEquals(json, {
      type: 4,
      data: {
        embeds: [{
          type: 'rich',
          description:
            'An Internal Error occurred and was reported.\n```ref_id: error_id```',
        }],
        attachments: [],
        components: [],
      },
    });
  } finally {
    delete config.sentry;
    delete config.publicKey;

    searchStub.restore();
    captureStub.restore();
    validateStub.restore();
    signatureStub.restore();
  }
});
