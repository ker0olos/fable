// deno-lint-ignore-file no-explicit-any

import { assertEquals } from 'https://deno.land/std@0.177.0/testing/asserts.ts';

import {
  assertSpyCall,
  stub,
} from 'https://deno.land/std@0.177.0/testing/mock.ts';

import utils from '../src/utils.ts';
import config from '../src/config.ts';

import { handler } from '../src/interactions.ts';

import * as discord from '../src/discord.ts';

// TODO add more test cases

Deno.test('unimplemented', async () => {
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

    assertEquals(response?.ok, true);
    assertEquals(response?.redirected, false);

    assertEquals(response?.status, 200);
    assertEquals(response?.statusText, 'OK');

    const form = new FormData();

    form.append(
      'payload_json',
      JSON.stringify({
        type: 4,
        data: {
          embeds: [],
          attachments: [],
          components: [],
          content: 'Unimplemented',
        },
      }),
    );

    assertEquals(await response?.formData(), form);
  } finally {
    delete config.publicKey;

    validateStub.restore();
    signatureStub.restore();
  }
});

Deno.test('ping request', async () => {
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

Deno.test('invalid request', async () => {
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
        body: 'body',
        signature: 'ed25519',
        timestamp: 'timestamp',
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
