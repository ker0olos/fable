// deno-lint-ignore-file no-explicit-any

import { assertEquals } from '$std/assert/mod.ts';

import { assertSpyCall, spy, stub } from '$std/testing/mock.ts';

import * as discord from '~/src/discord.ts';

import utils from '~/src/utils.ts';
import config from '~/src/config.ts';

import { handler } from '~/src/interactions.ts';

import search from '~/src/search.ts';
import party from '~/src/party.ts';
import gacha from '~/src/gacha.ts';
import user from '~/src/user.ts';
import packs from '~/src/packs.ts';
import trade from '~/src/trade.ts';
import steal from '~/src/steal.ts';
import shop from '~/src/shop.ts';
import stats from '~/src/stats.ts';
import battle from '~/src/battle.ts';
import tower from '~/src/tower.ts';
import help from '~/src/help.ts';
import skills from '~/src/skills.ts';

import merge from '~/src/merge.ts';

import { NonFetalError, NoPermissionError } from '~/src/errors.ts';

import type { Manifest } from '~/src/types.ts';

config.global = true;

Deno.test('search command handlers', async (test) => {
  await test.step('search', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

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
          token: 'token',
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
          token: 'token',
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
          token: 'token',
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
          token: 'token',
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

  await test.step('series', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      data: {
        name: 'series',
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
          token: 'token',
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
          token: 'token',
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
          token: 'token',
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
          token: 'token',
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
          token: 'token',
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
          token: 'token',
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
          token: 'token',
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
          options: [{
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
          token: 'token',
          userId: 'another_user_id',
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

  await test.step('party default', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'party',
        options: [{
          name: 'user',
          value: 'another_user_id',
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
          token: 'token',
          userId: 'another_user_id',
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
          token: 'token',
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
          token: 'token',
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
          token: 'token',
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
          token: 'token',
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
          token: 'token',
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
          }, {
            name: 'user',
            value: 'user_id',
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const userStub = stub(user, 'list', () => ({
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

      assertSpyCall(userStub, 0, {
        args: [{
          token: 'token',
          rating: 5,
          userId: 'user_id',
          guildId: 'guild_id',
          nick: false,
          index: 0,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      userStub.restore();
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

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'collection',
        options: [
          {
            type: 1,
            name: 'stars',
            options: [
              {
                name: 'user',
                value: 'another_user_id',
              },
              {
                name: 'rating',
                value: 5,
              },
            ],
          },
        ],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const userStub = stub(user, 'list', () => ({
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

      assertSpyCall(userStub, 0, {
        args: [{
          token: 'token',
          rating: 5,
          userId: 'another_user_id',
          guildId: 'guild_id',
          nick: true,
          index: 0,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      userStub.restore();
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
          options: [
            {
              name: 'user',
              value: 'user_id',
            },
            {
              name: 'title',
              value: 'title',
            },
          ],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const userStub = stub(user, 'list', () => ({
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

      assertSpyCall(userStub, 0, {
        args: [{
          token: 'token',
          search: 'title',
          userId: 'user_id',
          guildId: 'guild_id',
          nick: false,
          id: undefined,
          index: 0,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      userStub.restore();
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
          options: [
            {
              name: 'user',
              value: 'user_id',
            },
            {
              name: 'title',
              value: 'id=media_id',
            },
          ],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const userStub = stub(user, 'list', () => ({
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

      assertSpyCall(userStub, 0, {
        args: [{
          token: 'token',
          search: 'id=media_id',
          userId: 'user_id',
          guildId: 'guild_id',
          nick: false,
          id: 'media_id',
          index: 0,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      userStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('collection media (another user)', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

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

    const userStub = stub(user, 'list', () => ({
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

      assertSpyCall(userStub, 0, {
        args: [{
          token: 'token',
          search: 'title',
          userId: 'another_user_id',
          guildId: 'guild_id',
          nick: true,
          id: undefined,
          index: 0,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      userStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('collection sum', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'collection',
        options: [{
          type: 1,
          name: 'sum',
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const userStub = stub(user, 'sum', () => ({
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

      assertSpyCall(userStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          nick: false,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      userStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('collection sum (another user)', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'collection',
        options: [{
          type: 1,
          name: 'sum',
          options: [{
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

    const userStub = stub(user, 'sum', () => ({
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

      assertSpyCall(userStub, 0, {
        args: [{
          token: 'token',
          userId: 'another_user_id',
          guildId: 'guild_id',
          nick: true,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      userStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('likeslist command handlers', async (test) => {
  await test.step('normal', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'likeslist',
        options: [
          {
            name: 'user',
            value: 'user_id',
          },
        ],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const userStub = stub(user, 'likeslist', () => ({
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

      assertSpyCall(userStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          nick: false,
          filter: undefined,
          index: 0,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      userStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('another user', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'likeslist',
        options: [
          {
            name: 'user',
            value: 'another_user_id',
          },
        ],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const userStub = stub(user, 'likeslist', () => ({
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

      assertSpyCall(userStub, 0, {
        args: [{
          token: 'token',
          userId: 'another_user_id',
          guildId: 'guild_id',
          nick: true,
          filter: undefined,
          index: 0,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      userStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('logs command handlers', async (test) => {
  await test.step('normal', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'logs',
        options: [
          {
            name: 'user',
            value: 'user_id',
          },
        ],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const userStub = stub(user, 'logs', () => ({
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

      assertSpyCall(userStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          nick: false,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      userStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('another user', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'logs',
        options: [
          {
            name: 'user',
            value: 'another_user_id',
          },
        ],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const userStub = stub(user, 'logs', () => ({
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

      assertSpyCall(userStub, 0, {
        args: [{
          token: 'token',
          userId: 'another_user_id',
          guildId: 'guild_id',
          nick: true,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      userStub.restore();
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
      member: {
        user: {
          id: 'user_id',
        },
      },
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
          index: 0,
          token: 'token',
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

  await test.step('owned', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
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
          index: 0,
          token: 'token',
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

  await test.step('id prefix', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
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
          index: 0,
          token: 'token',
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

Deno.test('now command handlers', async (test) => {
  await test.step('now', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

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

  await test.step('tu', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

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

    const setFlagsSpy = spy(() => undefined);

    const tradeStub = stub(trade, 'pre', () => ({
      setFlags: setFlagsSpy,
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

    const setFlagsSpy = spy(() => undefined);

    const tradeStub = stub(trade, 'pre', () => ({
      setFlags: setFlagsSpy,
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

      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('steal command handlers', async (test) => {
  await test.step('normal', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'steal',
        options: [{
          name: 'name',
          value: 'character',
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

    const stealStub = stub(steal, 'pre', () =>
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

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(setFlagsSpy, 0, {
        args: [64],
      });

      assertSpyCall(stealStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          search: 'character',
          id: undefined,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      stealStub.restore();
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

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'steal',
        options: [{
          name: 'name',
          value: 'id=character_id',
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

    const stealStub = stub(steal, 'pre', () =>
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

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(setFlagsSpy, 0, {
        args: [64],
      });

      assertSpyCall(stealStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          search: 'id=character_id',
          id: 'character_id',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      stealStub.restore();
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
          guarantee: undefined,
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
          guarantee: undefined,
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

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'pull',
        options: [{
          name: 'stars',
          value: 4,
        }],
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
          guarantee: 4,
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

  await test.step('guaranteed', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'guaranteed',
        options: [{
          name: 'stars',
          value: 4,
        }],
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
          guarantee: 4,
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
          guarantee: undefined,
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

  await test.step('disabled', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

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
            description: 'Gacha is under maintenance, try again later!',
          }],
          attachments: [],
          components: [],
          flags: 64,
        },
      });
    } finally {
      delete config.trading;
      delete config.publicKey;

      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('buy command handlers', async (test) => {
  await test.step('buy normal', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'buy',
        options: [{
          type: 1,
          name: 'normal',
          options: [{
            name: 'amount',
            value: 4,
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const shopStub = stub(shop, 'normal', () => ({
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

      assertSpyCall(shopStub, 0, {
        args: [{
          userId: 'user_id',
          amount: 4,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      shopStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('shop normal', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'shop',
        options: [{
          type: 1,
          name: 'normal',
          options: [{
            name: 'amount',
            value: 4,
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const shopStub = stub(shop, 'normal', () => ({
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

      assertSpyCall(shopStub, 0, {
        args: [{
          userId: 'user_id',
          amount: 4,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      shopStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('buy guaranteed', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'buy',
        options: [{
          type: 1,
          name: 'guaranteed',
          options: [{
            name: 'stars',
            value: 4,
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const shopStub = stub(shop, 'guaranteed', () => ({
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

      assertSpyCall(shopStub, 0, {
        args: [{
          userId: 'user_id',
          stars: 4,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      shopStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('shop guaranteed', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'shop',
        options: [{
          type: 1,
          name: 'guaranteed',
          options: [{
            name: 'stars',
            value: 4,
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const shopStub = stub(shop, 'guaranteed', () => ({
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

      assertSpyCall(shopStub, 0, {
        args: [{
          userId: 'user_id',
          stars: 4,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      shopStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('shop sweeps', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'shop',
        options: [{
          type: 1,
          name: 'sweeps',
          options: [{
            name: 'amount',
            value: 2,
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const shopStub = stub(shop, 'sweeps', () => ({
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

      assertSpyCall(shopStub, 0, {
        args: [{
          userId: 'user_id',
          amount: 2,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      shopStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('buy guaranteed', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'buy',
        options: [{
          type: 1,
          name: 'sweeps',
          options: [{
            name: 'amount',
            value: 2,
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const shopStub = stub(shop, 'sweeps', () => ({
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

      assertSpyCall(shopStub, 0, {
        args: [{
          userId: 'user_id',
          amount: 2,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      shopStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('like command handlers', async (test) => {
  await test.step('like', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'like',
        options: [{
          name: 'name',
          value: 'character',
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const shopStub = stub(user, 'like', () => ({
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

      assertSpyCall(shopStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          search: 'character',
          id: undefined,
          undo: false,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      shopStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('like (id prefix)', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'like',
        options: [{
          name: 'name',
          value: 'id=character_id',
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const shopStub = stub(user, 'like', () => ({
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

      assertSpyCall(shopStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          search: 'id=character_id',
          id: 'character_id',
          undo: false,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      shopStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('protect', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'protect',
        options: [{
          name: 'name',
          value: 'character',
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const shopStub = stub(user, 'like', () => ({
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

      assertSpyCall(shopStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          search: 'character',
          id: undefined,
          undo: false,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      shopStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('wish', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'wish',
        options: [{
          name: 'name',
          value: 'character',
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const shopStub = stub(user, 'like', () => ({
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

      assertSpyCall(shopStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          search: 'character',
          id: undefined,
          undo: false,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      shopStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('unlike', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'unlike',
        options: [{
          name: 'name',
          value: 'character',
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const shopStub = stub(user, 'like', () => ({
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

      assertSpyCall(shopStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          search: 'character',
          id: undefined,
          undo: true,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      shopStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('unlike (id prefix)', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'unlike',
        options: [{
          name: 'name',
          value: 'id=character_id',
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const shopStub = stub(user, 'like', () => ({
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

      assertSpyCall(shopStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          search: 'id=character_id',
          id: 'character_id',
          undo: true,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      shopStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('likeall command handlers', async (test) => {
  await test.step('likeall', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'likeall',
        options: [{
          name: 'title',
          value: 'media',
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const shopStub = stub(user, 'likeall', () => ({
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

      assertSpyCall(shopStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          search: 'media',
          id: undefined,
          undo: false,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      shopStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('likeall (id prefix)', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'likeall',
        options: [{
          name: 'title',
          value: 'id=media_id',
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const shopStub = stub(user, 'likeall', () => ({
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

      assertSpyCall(shopStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          search: 'id=media_id',
          id: 'media_id',
          undo: false,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      shopStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('unlikeall', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'unlikeall',
        options: [{
          name: 'title',
          value: 'media',
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const shopStub = stub(user, 'likeall', () => ({
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

      assertSpyCall(shopStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          search: 'media',
          id: undefined,
          undo: true,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      shopStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('unlike (id prefix)', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'unlike',
        options: [{
          name: 'name',
          value: 'id=character_id',
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const shopStub = stub(user, 'like', () => ({
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

      assertSpyCall(shopStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          search: 'id=character_id',
          id: 'character_id',
          undo: true,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      shopStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('help command handlers', async (test) => {
  await test.step('help', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

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

Deno.test('nick command handlers', async (test) => {
  await test.step('nick', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'nick',
        options: [
          {
            name: 'character',
            value: 'name',
          },
          {
            name: 'new_nick',
            value: 'New Nickname',
          },
        ],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const customStub = stub(user, 'nick', () => ({
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

      assertSpyCall(customStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          nick: 'New Nickname',
          search: 'name',
          id: undefined,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      customStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('nick with character id', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'nick',
        options: [
          {
            name: 'character',
            value: 'id=character_id',
          },
          {
            name: 'new_nick',
            value: 'New Nickname',
          },
        ],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const customStub = stub(user, 'nick', () => ({
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

      assertSpyCall(customStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          nick: 'New Nickname',
          search: 'id=character_id',
          id: 'character_id',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      customStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('image command handlers', async (test) => {
  await test.step('image', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'image',
        options: [
          {
            name: 'character',
            value: 'name',
          },
          {
            name: 'new_image',
            value: 'https://image_url.png',
          },
        ],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const customStub = stub(user, 'image', () => ({
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

      assertSpyCall(customStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          image: 'https://image_url.png',
          search: 'name',
          id: undefined,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      customStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('image with character id', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'image',
        options: [
          {
            name: 'character',
            value: 'id=character_id',
          },
          {
            name: 'new_image',
            value: 'https://image_url.png',
          },
        ],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const customStub = stub(user, 'image', () => ({
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

      assertSpyCall(customStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          image: 'https://image_url.png',
          search: 'id=character_id',
          id: 'character_id',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      customStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('custom', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'custom',
        options: [
          {
            name: 'character',
            value: 'name',
          },
          {
            name: 'new_image',
            value: 'https://image_url.png',
          },
        ],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const customStub = stub(user, 'image', () => ({
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

      assertSpyCall(customStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          image: 'https://image_url.png',
          search: 'name',
          id: undefined,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      customStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('merge/automerge command handlers', async (test) => {
  await test.step('merge', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'merge',
        options: [
          {
            name: 'target',
            value: 4,
          },
        ],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const synthesisStub = stub(merge, 'synthesize', () => ({
      send: () => true,
    } as any));

    config.synthesis = true;
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

      assertSpyCall(synthesisStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          mode: 'target',
          target: 4,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.trading;
      delete config.publicKey;

      synthesisStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('synthesize', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'synthesize',
        options: [
          {
            name: 'target',
            value: 5,
          },
        ],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const synthesisStub = stub(merge, 'synthesize', () => ({
      send: () => true,
    } as any));

    config.synthesis = true;
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

      assertSpyCall(synthesisStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          mode: 'target',
          target: 5,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.trading;
      delete config.publicKey;

      synthesisStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('automerge min', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'automerge',
        options: [
          {
            type: 1,
            name: 'min',
          },
        ],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const synthesisStub = stub(merge, 'synthesize', () => ({
      send: () => true,
    } as any));

    config.synthesis = true;
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

      assertSpyCall(synthesisStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          mode: 'min',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.trading;
      delete config.publicKey;

      synthesisStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('automerge min', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'automerge',
        options: [
          {
            type: 1,
            name: 'max',
          },
        ],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const synthesisStub = stub(merge, 'synthesize', () => ({
      send: () => true,
    } as any));

    config.synthesis = true;
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

      assertSpyCall(synthesisStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          mode: 'max',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.trading;
      delete config.publicKey;

      synthesisStub.restore();
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
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'merge',
        options: [
          {
            name: 'target',
            value: 4,
          },
        ],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    config.synthesis = false;
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
            description: 'Merging is under maintenance, try again later!',
          }],
          attachments: [],
          components: [],
          flags: 64,
        },
      });
    } finally {
      delete config.trading;
      delete config.publicKey;

      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('installed packs', async () => {
  const body = JSON.stringify({
    id: 'id',
    token: 'token',
    type: discord.InteractionType.Command,
    guild_id: 'guild_id',
    member: {
      user: {
        id: 'user_id',
      },
    },
    data: {
      name: 'installed',
      options: [
        {
          type: 1,
          name: 'packs',
        },
      ],
    },
  });

  const validateStub = stub(utils, 'validateRequest', () => ({} as any));

  const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
    valid: true,
    body,
  } as any));

  const packsStub = stub(packs, 'pages', () =>
    ({
      send: () => true,
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
        userId: 'user_id',
        guildId: 'guild_id',
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

Deno.test('community packs command handlers', async (test) => {
  await test.step('test', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'packs',
        options: [
          {
            type: 1,
            name: 'installed',
          },
        ],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const packsStub = stub(packs, 'pages', () =>
      ({
        send: () => true,
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
          userId: 'user_id',
          guildId: 'guild_id',
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
            name: 'id',
            value: 'pack_id',
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const packsStub = stub(packs, 'install', () =>
      ({
        send: () => true,
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
          userId: 'user_id',
          id: 'pack_id',
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

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'packs',
        options: [{
          type: 1,
          name: `uninstall`,
          options: [{
            name: 'id',
            value: 'pack_id',
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
      id: 'pack_id',
    };

    const listStub = stub(
      packs,
      'all',
      () => Promise.resolve([{ manifest } as any]),
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
          embeds: [
            {
              type: 'rich',
              title: 'pack_id',
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
              custom_id: 'uninstall=pack_id=user_id',
              label: 'Confirm',
              style: 2,
              type: 2,
            }, {
              custom_id: 'cancel=user_id',
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

      data: {
        name: 'packs',
        options: [{
          type: 1,
          name: `uninstall`,
          options: [{
            name: 'id',
            value: 'pack_id',
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

  await test.step('packs disable builtins', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'packs',
        options: [{
          type: 2,
          name: `disable`,
          options: [{
            type: 1,
            name: `builtins`,
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const packsStub = stub(packs, 'disableBuiltins', () =>
      ({
        send: () => true,
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
          userId: 'user_id',
          guildId: 'guild_id',
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
});

Deno.test('stats', async (test) => {
  await test.step('normal', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'stats',
        options: [{
          name: `name`,
          value: 'character',
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const statsStub = stub(stats, 'view', () =>
      ({
        send: () => true,
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

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(statsStub, 0, {
        args: [{
          token: 'token',
          guildId: 'guild_id',
          userId: 'user_id',
          character: 'character',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      statsStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('battle', async (test) => {
  await test.step('battle tower', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'battle',
        options: [{
          type: 1,
          name: `tower`,
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const battleStub = stub(tower, 'view', () =>
      ({
        send: () => true,
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

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(battleStub, 0, {
        args: [{
          token: 'token',
          guildId: 'guild_id',
          userId: 'user_id',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      battleStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('bt tower', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'bt',
        options: [{
          type: 1,
          name: `tower`,
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const battleStub = stub(tower, 'view', () =>
      ({
        send: () => true,
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

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(battleStub, 0, {
        args: [{
          token: 'token',
          guildId: 'guild_id',
          userId: 'user_id',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      battleStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('battle tower', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'battle',
        options: [{
          type: 1,
          name: `challenge`,
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const battleStub = stub(battle, 'challengeTower', () =>
      ({
        send: () => true,
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

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(battleStub, 0, {
        args: [{
          token: 'token',
          guildId: 'guild_id',
          user: { id: 'user_id' } as any,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      battleStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('bt challenge', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'bt',
        options: [{
          type: 1,
          name: `challenge`,
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const battleStub = stub(battle, 'challengeTower', () =>
      ({
        send: () => true,
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

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(battleStub, 0, {
        args: [{
          token: 'token',
          guildId: 'guild_id',
          user: { id: 'user_id' } as any,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      battleStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('skills', async (test) => {
  await test.step('showall', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'skills',
        options: [{
          type: 1,
          name: `showall`,
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const skillsStub = stub(skills, 'all', () =>
      ({
        send: () => true,
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

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(skillsStub, 0, {
        args: [0, undefined],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      skillsStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('acquire', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'skills',
        options: [{
          type: 1,
          name: `acquire`,
          options: [{
            name: `character`,
            value: `characterName`,
          }, {
            name: `skill`,
            value: `crit`,
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const skillsStub = stub(skills, 'preAcquire', () =>
      ({
        send: () => true,
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

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(skillsStub, 0, {
        args: [{
          token: 'token',
          skillKey: 'crit',
          character: 'characterName',
          userId: 'user_id',
          guildId: 'guild_id',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      skillsStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('upgrade', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'skills',
        options: [{
          type: 1,
          name: `upgrade`,
          options: [{
            name: `character`,
            value: `characterName`,
          }, {
            name: `skill`,
            value: `crit`,
          }],
        }],
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const skillsStub = stub(skills, 'preAcquire', () =>
      ({
        send: () => true,
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

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(skillsStub, 0, {
        args: [{
          token: 'token',
          skillKey: 'crit',
          character: 'characterName',
          userId: 'user_id',
          guildId: 'guild_id',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      skillsStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('sweep', async (test) => {
  await test.step('normal', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'sweep',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const skillsStub = stub(tower, 'sweep', () =>
      ({
        send: () => true,
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

      assertSpyCall(signatureStub, 0, {
        args: [{
          body,
          signature: 'ed25519',
          timestamp: 'timestamp',
          publicKey: 'publicKey',
        }],
      });

      assertSpyCall(skillsStub, 0, {
        args: [{
          token: 'token',
          guildId: 'guild_id',
          userId: 'user_id',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      skillsStub.restore();
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
          signature: null,
          timestamp: null,
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
        flags: 64,
        embeds: [],
        attachments: [],
        components: [],
        content: 'Unimplemented or removed.',
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
          description:
            "You don't have permission to complete this interaction!",
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
