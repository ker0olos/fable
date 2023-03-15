// deno-lint-ignore-file no-explicit-any

import { assertEquals } from 'https://deno.land/std@0.179.0/testing/asserts.ts';

import {
  assertSpyCall,
  spy,
  stub,
} from 'https://deno.land/std@0.179.0/testing/mock.ts';

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
        id: 'media_id',
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

Deno.test('character components', async () => {
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
        userId: 'user_id',
        guildId: 'guild_id',
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

Deno.test('party assign components', async () => {
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
      custom_id: 'passign=character_id',
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

  const partyStub = stub(party, 'assign', () =>
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

    assertSpyCall(partyStub, 0, {
      args: [{
        userId: 'user_id',
        guildId: 'guild_id',
        id: 'character_id',
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
          stars: 5,
          userId: 'user_id',
          guildId: 'guild_id',
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
          stars: 5,
          userId: 'user_id',
          guildId: 'guild_id',
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
          id: 'media_id',
          userId: 'user_id',
          guildId: 'guild_id',
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
          id: 'media_id',
          userId: 'user_id',
          guildId: 'guild_id',
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
        custom_id: 'gacha',
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

    const gachaStub = stub(gacha, 'start', () =>
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

      assertSpyCall(gachaStub, 0, {
        args: [{
          token: 'token',
          quiet: false,
          userId: 'user_id',
          guildId: 'guild_id',
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

  await test.step('normal update', async () => {
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
        custom_id: 'gacha=1',
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

    const gachaStub = stub(gacha, 'start', () =>
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

      assertSpyCall(gachaStub, 0, {
        args: [{
          token: 'token',
          quiet: false,
          userId: 'user_id',
          guildId: 'guild_id',
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
        custom_id: 'pull',
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

    const gachaStub = stub(gacha, 'start', () =>
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

      assertSpyCall(gachaStub, 0, {
        args: [{
          token: 'token',
          quiet: true,
          userId: 'user_id',
          guildId: 'guild_id',
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
        custom_id: 'now',
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

    const userStub = stub(user, 'now', () =>
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
      custom_id: 'help==1',
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

    const packsStub = stub(packs, 'uninstall', () =>
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

      assertSpyCall(packsStub, 0, {
        args: [{
          guildId: 'guild_id',
          manifestId: 'manifest_id',
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

Deno.test('cancel dialog', async () => {
  const body = JSON.stringify({
    id: 'id',
    token: 'token',
    type: discord.InteractionType.Component,
    guild_id: 'guild_id',
    channel_id: 'channel_id',
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
