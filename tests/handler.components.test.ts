// deno-lint-ignore-file no-explicit-any

import { assertEquals } from 'https://deno.land/std@0.183.0/testing/asserts.ts';

import {
  assertSpyCall,
  spy,
  stub,
} from 'https://deno.land/std@0.183.0/testing/mock.ts';

import * as discord from '../src/discord.ts';

import utils from '../src/utils.ts';
import config from '../src/config.ts';

import { handler } from '../src/interactions.ts';

import user from '../src/user.ts';
import packs from '../src/packs.ts';
import search from '../src/search.ts';
import party from '../src/party.ts';
import gacha from '../src/gacha.ts';
import help from '../src/help.ts';
import trade from '../src/trade.ts';
import shop from '../src/shop.ts';

import synthesis from '../src/synthesis.ts';

import { PackType } from '../src/types.ts';

Deno.test('media components', async () => {
  const body = JSON.stringify({
    id: 'id',
    token: 'token',
    type: discord.InteractionType.Component,
    guild_id: 'guild_id',
    channel_id: 'channel_id',
    data: {
      custom_id: 'media=media_id',
    },
  });

  const validateStub = stub(utils, 'validateRequest', () => ({} as any));

  const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
    valid: true,
    body,
  } as any));

  const setTypeSpy = spy(() => ({
    send: () => true,
  }));

  const searchStub = stub(search, 'media', () =>
    ({
      setType: setTypeSpy,
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

    assertSpyCall(setTypeSpy, 0, {
      args: [discord.MessageType.Update],
    });

    assertSpyCall(searchStub, 0, {
      args: [{
        token: 'token',
        id: 'media_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
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

Deno.test('character components', async (test) => {
  await test.step('normal', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'character=character_id',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setTypeSpy = spy(() => ({
      send: () => true,
    }));

    const searchStub = stub(search, 'character', () =>
      ({
        setType: setTypeSpy,
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

      assertSpyCall(setTypeSpy, 0, {
        args: [discord.MessageType.Update],
      });

      assertSpyCall(searchStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          channelId: 'channel_id',
          id: 'character_id',
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

  await test.step('new message', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'character=character_id=1',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setTypeSpy = spy(() => ({
      send: () => true,
    }));

    const searchStub = stub(search, 'character', () =>
      ({
        setType: setTypeSpy,
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

      assertSpyCall(setTypeSpy, 0, {
        args: [discord.MessageType.New],
      });

      assertSpyCall(searchStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          channelId: 'channel_id',
          id: 'character_id',
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

Deno.test('media characters components', async () => {
  const body = JSON.stringify({
    id: 'id',
    token: 'token',
    type: discord.InteractionType.Component,
    guild_id: 'guild_id',
    channel_id: 'channel_id',
    member: {
      user: {
        id: 'user_id',
      },
    },
    data: {
      custom_id: 'mcharacters=media_id=1',
    },
  });

  const validateStub = stub(utils, 'validateRequest', () => ({} as any));

  const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
    valid: true,
    body,
  } as any));

  const setTypeSpy = spy(() => ({
    send: () => true,
  }));

  const searchStub = stub(search, 'mediaCharacters', () =>
    ({
      setType: setTypeSpy,
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

    assertSpyCall(setTypeSpy, 0, {
      args: [discord.MessageType.Update],
    });

    assertSpyCall(searchStub, 0, {
      args: [{
        id: 'media_id',
        userId: 'user_id',
        guildId: 'guild_id',
        channelId: 'channel_id',
        index: 1,
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

Deno.test('collection stars components', async (test) => {
  await test.step('prev', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'cstars=5=user_id=anchor=prev',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setTypeSpy = spy(() => ({
      send: () => true,
    }));

    const userStub = stub(user, 'stars', () =>
      ({
        setType: setTypeSpy,
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

      assertSpyCall(setTypeSpy, 0, {
        args: [discord.MessageType.Update],
      });

      assertSpyCall(userStub, 0, {
        args: [{
          token: 'token',
          stars: 5,
          userId: 'user_id',
          guildId: 'guild_id',
          channelId: 'channel_id',
          before: 'anchor',
          after: undefined,
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

  await test.step('next', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'cstars=5=user_id=anchor=next',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setTypeSpy = spy(() => ({
      send: () => true,
    }));

    const userStub = stub(user, 'stars', () =>
      ({
        setType: setTypeSpy,
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

      assertSpyCall(setTypeSpy, 0, {
        args: [discord.MessageType.Update],
      });

      assertSpyCall(userStub, 0, {
        args: [{
          token: 'token',
          stars: 5,
          userId: 'user_id',
          guildId: 'guild_id',
          channelId: 'channel_id',
          after: 'anchor',
          before: undefined,
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

Deno.test('collection media components', async (test) => {
  await test.step('prev', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'cmedia=media_id=user_id=anchor=prev',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setTypeSpy = spy(() => ({
      send: () => true,
    }));

    const userStub = stub(user, 'media', () =>
      ({
        setType: setTypeSpy,
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

      assertSpyCall(setTypeSpy, 0, {
        args: [discord.MessageType.Update],
      });

      assertSpyCall(userStub, 0, {
        args: [{
          token: 'token',
          id: 'media_id',
          userId: 'user_id',
          guildId: 'guild_id',
          channelId: 'channel_id',
          before: 'anchor',
          after: undefined,
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

  await test.step('next', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'cmedia=media_id=user_id=anchor=next',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setTypeSpy = spy(() => ({
      send: () => true,
    }));

    const userStub = stub(user, 'media', () =>
      ({
        setType: setTypeSpy,
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

      assertSpyCall(setTypeSpy, 0, {
        args: [discord.MessageType.Update],
      });

      assertSpyCall(userStub, 0, {
        args: [{
          token: 'token',
          id: 'media_id',
          userId: 'user_id',
          guildId: 'guild_id',
          channelId: 'channel_id',
          before: undefined,
          after: 'anchor',
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

Deno.test('collection list components', async (test) => {
  await test.step('normal', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'clist=user_id==1',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setTypeSpy = spy(() => ({
      send: () => true,
    }));

    const userStub = stub(user, 'list', () =>
      ({
        setType: setTypeSpy,
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

      assertSpyCall(setTypeSpy, 0, {
        args: [discord.MessageType.Update],
      });

      assertSpyCall(userStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          filter: NaN,
          index: 1,
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

  await test.step('filtered', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'clist=user_id=5=1',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setTypeSpy = spy(() => ({
      send: () => true,
    }));

    const userStub = stub(user, 'list', () =>
      ({
        setType: setTypeSpy,
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

      assertSpyCall(setTypeSpy, 0, {
        args: [discord.MessageType.Update],
      });

      assertSpyCall(userStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          filter: 5,
          index: 1,
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

Deno.test('like components', async (test) => {
  await test.step('normal', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'like=character_id',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setTypeSpy = spy(() => ({
      send: () => true,
    }));

    const userStub = stub(user, 'like', () =>
      ({
        setType: setTypeSpy,
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

      assertSpyCall(setTypeSpy, 0, {
        args: [discord.MessageType.Update],
      });

      assertSpyCall(userStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          channelId: 'channel_id',
          id: 'character_id',
          undo: false,
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

  await test.step('new message', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'like=character_id=1',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setTypeSpy = spy(() => ({
      send: () => true,
    }));

    const userStub = stub(user, 'like', () =>
      ({
        setType: setTypeSpy,
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

      assertSpyCall(setTypeSpy, 0, {
        args: [discord.MessageType.New],
      });

      assertSpyCall(userStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          channelId: 'channel_id',
          id: 'character_id',
          undo: false,
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

Deno.test('likeslist components', async (test) => {
  await test.step('normal', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'likes=user_id=1',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setTypeSpy = spy(() => ({
      send: () => true,
    }));

    const userStub = stub(user, 'likeslist', () =>
      ({
        setType: setTypeSpy,
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

      assertSpyCall(setTypeSpy, 0, {
        args: [discord.MessageType.Update],
      });

      assertSpyCall(userStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          index: 1,
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

Deno.test('found components', async (test) => {
  await test.step('prev', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',

      data: {
        custom_id: 'found=media_id==anchor=prev',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setTypeSpy = spy(() => ({
      send: () => true,
    }));

    const searchStub = stub(search, 'mediaFound', () =>
      ({
        setType: setTypeSpy,
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

      assertSpyCall(setTypeSpy, 0, {
        args: [discord.MessageType.Update],
      });

      assertSpyCall(searchStub, 0, {
        args: [{
          id: 'media_id',
          guildId: 'guild_id',
          channelId: 'channel_id',
          before: 'anchor',
          after: undefined,
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

  await test.step('next', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',

      data: {
        custom_id: 'found=media_id==anchor=next',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setTypeSpy = spy(() => ({
      send: () => true,
    }));

    const searchStub = stub(search, 'mediaFound', () =>
      ({
        setType: setTypeSpy,
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

      assertSpyCall(setTypeSpy, 0, {
        args: [discord.MessageType.Update],
      });

      assertSpyCall(searchStub, 0, {
        args: [{
          id: 'media_id',
          guildId: 'guild_id',
          channelId: 'channel_id',
          before: undefined,
          after: 'anchor',
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

Deno.test('gacha components', async (test) => {
  await test.step('normal', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'gacha=user_id',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const gachaStub = stub(gacha, 'start', () =>
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

      assertSpyCall(gachaStub, 0, {
        args: [{
          token: 'token',
          quiet: false,
          mention: true,
          guarantee: undefined,
          userId: 'user_id',
          guildId: 'guild_id',
          channelId: 'channel_id',
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
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'pull=user_id=4',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const gachaStub = stub(gacha, 'start', () =>
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

      assertSpyCall(gachaStub, 0, {
        args: [{
          token: 'token',
          guarantee: 4,
          quiet: false,
          mention: true,
          userId: 'user_id',
          guildId: 'guild_id',
          channelId: 'channel_id',
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

  await test.step('quiet', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'q=user_id',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const gachaStub = stub(gacha, 'start', () =>
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

      assertSpyCall(gachaStub, 0, {
        args: [{
          token: 'token',
          quiet: true,
          mention: true,
          guarantee: undefined,
          userId: 'user_id',
          guildId: 'guild_id',
          channelId: 'channel_id',
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

Deno.test('buy components', async (test) => {
  await test.step('random', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'buy=random=user_id=3',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setTypeSpy = spy(() => ({
      send: () => true,
    }));

    const shopStub = stub(shop, 'confirmRandom', () =>
      ({
        setType: setTypeSpy,
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

      assertSpyCall(setTypeSpy, 0, {
        args: [discord.MessageType.Update],
      });

      assertSpyCall(shopStub, 0, {
        args: [{
          userId: 'user_id',
          guildId: 'guild_id',
          amount: 3,
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

  await test.step('guaranteed', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'buy=guaranteed=user_id=5',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setTypeSpy = spy(() => ({
      send: () => true,
    }));

    const shopStub = stub(shop, 'confirmGuaranteed', () =>
      ({
        setType: setTypeSpy,
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

      assertSpyCall(setTypeSpy, 0, {
        args: [discord.MessageType.Update],
      });

      assertSpyCall(shopStub, 0, {
        args: [{
          userId: 'user_id',
          stars: 5,
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

  await test.step('bguaranteed', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'buy=bguaranteed=user_id=5',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setTypeSpy = spy(() => ({
      send: () => true,
    }));

    const shopStub = stub(shop, 'guaranteed', () =>
      ({
        setType: setTypeSpy,
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

      assertSpyCall(setTypeSpy, 0, {
        args: [discord.MessageType.Update],
      });

      assertSpyCall(shopStub, 0, {
        args: [{
          userId: 'user_id',
          stars: 5,
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

  await test.step('random no permission', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'buy=random=another_user_id=3',
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

      const json = JSON.parse(
        // deno-lint-ignore no-non-null-assertion
        (await response?.formData()).get('payload_json')!.toString(),
      );

      assertEquals({
        type: 4,
        data: {
          flags: 64,
          content: '',
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description:
                'You don\'t permission to complete this interaction!',
            },
          ],
        },
      }, json);
    } finally {
      delete config.publicKey;

      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('guaranteed no permission', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'buy=guaranteed=another_user_id=5',
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

      const json = JSON.parse(
        // deno-lint-ignore no-non-null-assertion
        (await response?.formData()).get('payload_json')!.toString(),
      );

      assertEquals({
        type: 4,
        data: {
          flags: 64,
          content: '',
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description:
                'You don\'t permission to complete this interaction!',
            },
          ],
        },
      }, json);
    } finally {
      delete config.publicKey;

      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('now components', async (test) => {
  await test.step('normal', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'now=user_id',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const userStub = stub(user, 'now', () =>
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

      assertSpyCall(userStub, 0, {
        args: [{
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          mention: true,
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

Deno.test('help components', async () => {
  const body = JSON.stringify({
    id: 'id',
    token: 'token',
    type: discord.InteractionType.Component,
    guild_id: 'guild_id',
    channel_id: 'channel_id',
    member: {
      user: {
        id: 'user_id',
      },
    },
    data: {
      custom_id: 'help=1',
    },
  });

  const validateStub = stub(utils, 'validateRequest', () => ({} as any));

  const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
    valid: true,
    body,
  } as any));

  const setTypeSpy = spy(() => ({
    send: () => true,
  }));

  const helpStub = stub(help, 'pages', () =>
    ({
      setType: setTypeSpy,
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

    assertSpyCall(setTypeSpy, 0, {
      args: [discord.MessageType.Update],
    });

    assertSpyCall(helpStub, 0, {
      args: [{
        userId: 'user_id',
        index: 1,
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

Deno.test('give components', async (test) => {
  await test.step('normal', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id:
          'give=user_id=target_id=character_id&character_id2&character_id3',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setTypeSpy = spy(() => ({
      send: () => true,
    }));

    const followupStub = spy(() => undefined);

    const tradeStub = stub(trade, 'give', () =>
      [{
        setType: setTypeSpy,
      }, {
        followup: followupStub,
      }] as any);

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

      assertSpyCall(setTypeSpy, 0, {
        args: [discord.MessageType.Update],
      });

      assertSpyCall(followupStub, 0, {
        args: ['token'],
      });

      assertSpyCall(tradeStub, 0, {
        args: [{
          userId: 'user_id',
          targetId: 'target_id',
          giveCharactersIds: ['character_id', 'character_id2', 'character_id3'],
          guildId: 'guild_id',
          channelId: 'channel_id',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      tradeStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('no permission', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'give=another_user_id=target_id=character_id',
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

      const json = JSON.parse(
        // deno-lint-ignore no-non-null-assertion
        (await response?.formData()).get('payload_json')!.toString(),
      );

      assertEquals({
        type: 4,
        data: {
          flags: 64,
          content: '',
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description:
                'You don\'t permission to complete this interaction!',
            },
          ],
        },
      }, json);
    } finally {
      delete config.publicKey;

      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('trade components', async (test) => {
  await test.step('normal', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'target_id',
        },
      },
      data: {
        custom_id:
          'trade=user_id=target_id=given_character_id&given_character_id2&given_character_id3=taken_character_id&taken_character_id2&taken_character_id3',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setTypeSpy = spy(() => ({
      send: () => true,
    }));

    const followupStub = spy(() => undefined);

    const tradeStub = stub(trade, 'accepted', () =>
      [{
        setType: setTypeSpy,
      }, {
        followup: followupStub,
      }] as any);

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

      assertSpyCall(setTypeSpy, 0, {
        args: [discord.MessageType.Update],
      });

      assertSpyCall(followupStub, 0, {
        args: ['token'],
      });

      assertSpyCall(tradeStub, 0, {
        args: [{
          userId: 'user_id',
          targetId: 'target_id',
          giveCharactersIds: [
            'given_character_id',
            'given_character_id2',
            'given_character_id3',
          ],
          takeCharactersIds: [
            'taken_character_id',
            'taken_character_id2',
            'taken_character_id3',
          ],
          guildId: 'guild_id',
          channelId: 'channel_id',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      tradeStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('no permission', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id:
          'trade=user_id=target_id=given_character_id=taken_character_id',
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

      const json = JSON.parse(
        // deno-lint-ignore no-non-null-assertion
        (await response?.formData()).get('payload_json')!.toString(),
      );

      assertEquals({
        type: 4,
        data: {
          flags: 64,
          content: '',
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description:
                'You don\'t permission to complete this interaction!',
            },
          ],
        },
      }, json);
    } finally {
      delete config.publicKey;

      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('synthesis components', async (test) => {
  await test.step('normal', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'test_token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'synthesis=user_id=5',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setTypeSpy = spy(() => ({
      send: () => true,
    }));

    const synthesisStub = stub(synthesis, 'confirmed', () =>
      ({
        setType: setTypeSpy,
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

      assertSpyCall(setTypeSpy, 0, {
        args: [discord.MessageType.Update],
      });

      assertSpyCall(synthesisStub, 0, {
        args: [{
          token: 'test_token',
          userId: 'user_id',
          guildId: 'guild_id',
          channelId: 'channel_id',
          target: 5,
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      synthesisStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('no permission', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'synthesis=another_user_id=5',
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

      const json = JSON.parse(
        // deno-lint-ignore no-non-null-assertion
        (await response?.formData()).get('payload_json')!.toString(),
      );

      assertEquals({
        type: 4,
        data: {
          flags: 64,
          content: '',
          attachments: [],
          components: [],
          embeds: [
            {
              type: 'rich',
              description:
                'You don\'t permission to complete this interaction!',
            },
          ],
        },
      }, json);
    } finally {
      delete config.publicKey;

      validateStub.restore();
      signatureStub.restore();
    }
  });
});

Deno.test('packs pages', async (test) => {
  await test.step('builtin', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        custom_id: 'builtin==0',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setTypeSpy = spy(() => ({
      send: () => true,
    }));

    const packsStub = stub(packs, 'pages', () =>
      ({
        setType: setTypeSpy,
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

      assertSpyCall(setTypeSpy, 0, {
        args: [discord.MessageType.Update],
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

  await test.step('community', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        custom_id: 'community==1',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setTypeSpy = spy(() => ({
      send: () => true,
    }));

    const packsStub = stub(packs, 'pages', () =>
      ({
        setType: setTypeSpy,
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

      assertSpyCall(setTypeSpy, 0, {
        args: [discord.MessageType.Update],
      });

      assertSpyCall(packsStub, 0, {
        args: [{
          guildId: 'guild_id',
          type: PackType.Community,
          index: 1,
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

Deno.test('packs uninstall', async (test) => {
  await test.step('normal', async () => {
    const pack = {
      id: 1,
      type: PackType.Community,
      manifest: { id: 'manifest_id' },
    };

    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        custom_id: 'uninstall=manifest_id',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const setTypeSpy = spy(() => ({
      send: () => true,
    }));

    const setFlagsSpy = spy(() => ({
      setType: setTypeSpy,
    }));

    const listStub = stub(packs, 'all', () => Promise.resolve([pack]));

    const packsStub = stub(packs, 'uninstall', () =>
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

      assertSpyCall(setFlagsSpy, 0, {
        args: [64],
      });

      assertSpyCall(setTypeSpy, 0, {
        args: [7],
      });

      assertSpyCall(packsStub, 0, {
        args: [{
          guildId: 'guild_id',
          manifestId: 'manifest_id',
        }],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      listStub.restore();
      packsStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('dialog', async () => {
    const pack = {
      id: 1,
      type: PackType.Community,
      manifest: { id: 'manifest_id' },
    };

    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        custom_id: 'puninstall=manifest_id',
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

    const listStub = stub(packs, 'all', () => Promise.resolve([pack]));

    const packsStub = stub(packs, 'uninstallDialog', () =>
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

      assertSpyCall(setFlagsSpy, 0, {
        args: [64],
      });

      assertSpyCall(packsStub, 0, {
        args: [pack],
      });

      assertEquals(response, true as any);
    } finally {
      delete config.publicKey;

      listStub.restore();
      packsStub.restore();
      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('not found', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      data: {
        custom_id: 'puninstall=manifest_id',
      },
    });

    const validateStub = stub(utils, 'validateRequest', () => ({} as any));

    const signatureStub = stub(utils, 'verifySignature', ({ body }) => ({
      valid: true,
      body,
    } as any));

    const listStub = stub(packs, 'all', () => Promise.resolve([]));

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
              description: 'Found _nothing_ matching that query!',
            },
          ],
          content: '',
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

Deno.test('cancel dialog', async (test) => {
  await test.step('canceled', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'cancel',
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

      const json = JSON.parse(
        // deno-lint-ignore no-non-null-assertion
        (await response?.formData()).get('payload_json')!.toString(),
      );

      assertEquals({
        type: 7,
        data: {
          embeds: [
            {
              type: 'rich',
              description: 'Cancelled',
            },
          ],
          content: '',
          attachments: [],
          components: [],
        },
      }, json);
    } finally {
      delete config.publicKey;

      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('declined', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'target_id',
        },
      },
      data: {
        custom_id: 'cancel=user_id=target_id',
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

      const json = JSON.parse(
        // deno-lint-ignore no-non-null-assertion
        (await response?.formData()).get('payload_json')!.toString(),
      );

      assertEquals({
        type: 7,
        data: {
          embeds: [
            {
              type: 'rich',
              description: 'Declined',
            },
          ],
          content: '',
          attachments: [],
          components: [],
        },
      }, json);
    } finally {
      delete config.publicKey;

      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('no permission 1', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'cancel=another_user_id',
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
              description:
                'You don\'t permission to complete this interaction!',
            },
          ],
          attachments: [],
          components: [],
        },
      }, json);
    } finally {
      delete config.publicKey;

      validateStub.restore();
      signatureStub.restore();
    }
  });

  await test.step('no permission 2', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Component,
      guild_id: 'guild_id',
      channel_id: 'channel_id',
      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        custom_id: 'cancel=another_user_id=target_id',
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
              description:
                'You don\'t permission to complete this interaction!',
            },
          ],
          attachments: [],
          components: [],
        },
      }, json);
    } finally {
      delete config.publicKey;

      validateStub.restore();
      signatureStub.restore();
    }
  });
});
