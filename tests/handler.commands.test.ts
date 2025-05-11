/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, vi, afterEach } from 'vitest';

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
import help from '~/src/help.ts';
import merge from '~/src/merge.ts';
import reward from '~/src/reward.ts';
import serverOptions from '~/src/serverOptions.ts';

import type { Manifest } from '~/src/types.ts';

config.global = true;

describe('search command handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('search', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      data: {
        name: 'search',
        options: [
          {
            name: 'title',
            value: 'title',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const searchSpy = vi
      .spyOn(search, 'media')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchSpy).toHaveBeenCalledWith({
        token: 'token',
        guildId: 'guild_id',
        search: 'title',
        id: undefined,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    {
                      media: {
                        url: 'http://localhost:8000/spinner.gif',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('anime', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      data: {
        name: 'anime',
        options: [
          {
            name: 'title',
            value: 'title',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const searchSpy = vi
      .spyOn(search, 'media')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchSpy).toHaveBeenCalledWith({
        token: 'token',
        guildId: 'guild_id',
        search: 'title',
        id: undefined,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    {
                      media: {
                        url: 'http://localhost:8000/spinner.gif',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('manga', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      data: {
        name: 'manga',
        options: [
          {
            name: 'title',
            value: 'title',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const searchSpy = vi
      .spyOn(search, 'media')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchSpy).toHaveBeenCalledWith({
        token: 'token',
        guildId: 'guild_id',
        search: 'title',
        id: undefined,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    {
                      media: {
                        url: 'http://localhost:8000/spinner.gif',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('media', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      data: {
        name: 'media',
        options: [
          {
            name: 'title',
            value: 'title',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const searchSpy = vi
      .spyOn(search, 'media')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchSpy).toHaveBeenCalledWith({
        token: 'token',
        guildId: 'guild_id',
        search: 'title',
        id: undefined,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    {
                      media: {
                        url: 'http://localhost:8000/spinner.gif',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('series', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      data: {
        name: 'series',
        options: [
          {
            name: 'title',
            value: 'title',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const searchSpy = vi
      .spyOn(search, 'media')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchSpy).toHaveBeenCalledWith({
        token: 'token',
        guildId: 'guild_id',
        search: 'title',
        id: undefined,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    {
                      media: {
                        url: 'http://localhost:8000/spinner.gif',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('id prefix', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      data: {
        name: 'search',
        options: [
          {
            name: 'title',
            value: 'id=uuid',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const searchSpy = vi
      .spyOn(search, 'media')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchSpy).toHaveBeenCalledWith({
        token: 'token',
        guildId: 'guild_id',
        search: 'id=uuid',
        id: 'uuid',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    {
                      media: {
                        url: 'http://localhost:8000/spinner.gif',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('characters', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const searchSpy = vi
      .spyOn(search, 'mediaCharacters')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchSpy).toHaveBeenCalledWith({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        search: 'title',
        id: undefined,
        token: 'token',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    {
                      media: {
                        url: 'http://localhost:8000/spinner.gif',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('characters with id prefix', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const searchSpy = vi
      .spyOn(search, 'mediaCharacters')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchSpy).toHaveBeenCalledWith({
        index: 0,
        userId: 'user_id',
        guildId: 'guild_id',
        search: 'id=uuid',
        id: 'uuid',
        token: 'token',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    {
                      media: {
                        url: 'http://localhost:8000/spinner.gif',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });
});

describe('character command handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('character', async () => {
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
        options: [
          {
            name: 'name',
            value: 'name',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const searchSpy = vi
      .spyOn(search, 'character')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchSpy).toHaveBeenCalledWith({
        token: 'token',
        guildId: 'guild_id',
        userId: 'user_id',
        search: 'name',
        id: undefined,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    {
                      media: {
                        url: 'http://localhost:8000/spinner.gif',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('id prefix', async () => {
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
        options: [
          {
            name: 'name',
            value: 'id=uuid',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const searchSpy = vi
      .spyOn(search, 'character')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchSpy).toHaveBeenCalledWith({
        token: 'token',
        guildId: 'guild_id',
        userId: 'user_id',
        search: 'id=uuid',
        id: 'uuid',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    {
                      media: {
                        url: 'http://localhost:8000/spinner.gif',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });
});

describe('party command handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('party view', async () => {
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
        options: [
          {
            type: 1,
            name: 'view',
            options: [
              {
                name: 'user',
                value: 'another_user_id',
              },
            ],
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const partySpy = vi
      .spyOn(party, 'view')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(partySpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'another_user_id',
        guildId: 'guild_id',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner3.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('party default', async () => {
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
        options: [
          {
            name: 'user',
            value: 'another_user_id',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const partySpy = vi
      .spyOn(party, 'view')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(partySpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'another_user_id',
        guildId: 'guild_id',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner3.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('party assign', async () => {
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
        options: [
          {
            type: 1,
            name: 'assign',
            options: [
              {
                name: 'name',
                value: 'name',
              },
            ],
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const partySpy = vi
      .spyOn(party, 'assign')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(partySpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        search: 'name',
        spot: undefined,
        id: undefined,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner3.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('party assign with spot', async () => {
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
        options: [
          {
            type: 1,
            name: 'assign',
            options: [
              {
                name: 'name',
                value: 'name',
              },
              {
                name: 'spot',
                value: 5,
              },
            ],
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const partySpy = vi
      .spyOn(party, 'assign')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(partySpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        search: 'name',
        spot: 5,
        id: undefined,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner3.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('party assign (id prefix)', async () => {
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
        options: [
          {
            type: 1,
            name: 'assign',
            options: [
              {
                name: 'name',
                value: 'id=uuid',
              },
            ],
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const partySpy = vi
      .spyOn(party, 'assign')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(partySpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        search: 'id=uuid',
        spot: undefined,
        id: 'uuid',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner3.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('party swap', async () => {
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
        options: [
          {
            type: 1,
            name: 'swap',
            options: [
              {
                name: 'a',
                value: 5,
              },
              {
                name: 'b',
                value: 1,
              },
            ],
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const partySpy = vi
      .spyOn(party, 'swap')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(partySpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        a: 5,
        b: 1,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner3.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('party remove', async () => {
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
        options: [
          {
            type: 1,
            name: 'remove',
            options: [
              {
                name: 'spot',
                value: 5,
              },
            ],
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const partySpy = vi
      .spyOn(party, 'remove')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(partySpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        spot: 5,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner3.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('party clear', async () => {
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
        options: [
          {
            type: 1,
            name: 'clear',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const partySpy = vi
      .spyOn(party, 'clear')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(partySpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner3.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });
});

describe('collection command handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('collection stars', async () => {
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
                name: 'rating',
                value: 5,
              },
              {
                name: 'user',
                value: 'user_id',
              },
            ],
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const userSpy = vi
      .spyOn(user, 'list')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(userSpy).toHaveBeenCalledWith({
        token: 'token',
        rating: 5,
        userId: 'user_id',
        guildId: 'guild_id',
        nick: false,
        search: undefined,
        id: undefined,
        index: 0,
        picture: undefined,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('coll stars', async () => {
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
        name: 'coll',
        options: [
          {
            type: 1,
            name: 'stars',
            options: [
              {
                name: 'rating',
                value: 5,
              },
              {
                name: 'user',
                value: 'user_id',
              },
            ],
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const userSpy = vi
      .spyOn(user, 'list')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(userSpy).toHaveBeenCalledWith({
        token: 'token',
        rating: 5,
        userId: 'user_id',
        guildId: 'guild_id',
        nick: false,
        search: undefined,
        id: undefined,
        index: 0,
        picture: undefined,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('mm stars', async () => {
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
        name: 'mm',
        options: [
          {
            type: 1,
            name: 'stars',
            options: [
              {
                name: 'rating',
                value: 5,
              },
              {
                name: 'user',
                value: 'user_id',
              },
            ],
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const userSpy = vi
      .spyOn(user, 'list')
      .mockReturnValue({ send: () => true } as never);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(userSpy).toHaveBeenCalledWith({
        token: 'token',
        rating: 5,
        userId: 'user_id',
        guildId: 'guild_id',
        nick: false,
        search: undefined,
        id: undefined,
        index: 0,
        picture: undefined,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('collection stars (another user)', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const userSpy = vi
      .spyOn(user, 'list')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(userSpy).toHaveBeenCalledWith({
        token: 'token',
        rating: 5,
        userId: 'another_user_id',
        guildId: 'guild_id',
        nick: true,
        search: undefined,
        id: undefined,
        index: 0,
        picture: undefined,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('collection stars (picture view)', async () => {
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
                name: 'rating',
                value: 5,
              },
              {
                name: 'user',
                value: 'user_id',
              },
              {
                name: 'picture',
                value: true,
              },
            ],
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const userSpy = vi
      .spyOn(user, 'list')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(userSpy).toHaveBeenCalledWith({
        token: 'token',
        rating: 5,
        userId: 'user_id',
        guildId: 'guild_id',
        nick: false,
        search: undefined,
        id: undefined,
        index: 0,
        picture: true,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('collection media', async () => {
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
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const userSpy = vi
      .spyOn(user, 'list')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(userSpy).toHaveBeenCalledWith({
        token: 'token',
        search: 'title',
        userId: 'user_id',
        guildId: 'guild_id',
        nick: false,
        id: undefined,
        rating: undefined,
        index: 0,
        picture: undefined,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('collection media (id prefix)', async () => {
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
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const userSpy = vi
      .spyOn(user, 'list')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(userSpy).toHaveBeenCalledWith({
        token: 'token',
        search: 'id=media_id',
        userId: 'user_id',
        guildId: 'guild_id',
        nick: false,
        id: 'media_id',
        rating: undefined,
        index: 0,
        picture: undefined,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('collection media (another user)', async () => {
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
            name: 'media',
            options: [
              {
                name: 'title',
                value: 'title',
              },
              {
                name: 'user',
                value: 'another_user_id',
              },
            ],
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const userSpy = vi
      .spyOn(user, 'list')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(userSpy).toHaveBeenCalledWith({
        token: 'token',
        search: 'title',
        userId: 'another_user_id',
        guildId: 'guild_id',
        nick: true,
        id: undefined,
        rating: undefined,
        index: 0,
        picture: undefined,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('collection media (picture view)', async () => {
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
              {
                name: 'picture',
                value: true,
              },
            ],
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const userSpy = vi
      .spyOn(user, 'list')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(userSpy).toHaveBeenCalledWith({
        token: 'token',
        search: 'title',
        userId: 'user_id',
        guildId: 'guild_id',
        nick: false,
        id: undefined,
        rating: undefined,
        index: 0,
        picture: true,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('collection sum', async () => {
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
            name: 'sum',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const userSpy = vi
      .spyOn(user, 'sum')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(userSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner3.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('collection sum (another user)', async () => {
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
            name: 'sum',
            options: [
              {
                name: 'user',
                value: 'another_user_id',
              },
            ],
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const userSpy = vi
      .spyOn(user, 'sum')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(userSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'another_user_id',
        guildId: 'guild_id',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner3.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('collection show', async () => {
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
            name: 'show',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const userSpy = vi
      .spyOn(user, 'showcase')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(userSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        index: 0,
        nick: false,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner3.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('collection show (another user)', async () => {
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
            name: 'show',
            options: [
              {
                name: 'user',
                value: 'another_user_id',
              },
            ],
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const userSpy = vi
      .spyOn(user, 'showcase')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(userSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'another_user_id',
        guildId: 'guild_id',
        index: 0,
        nick: true,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner3.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });
});

describe('likeslist command handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('normal', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const userSpy = vi
      .spyOn(user, 'likeslist')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(userSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        nick: false,
        filter: undefined,
        ownedBy: undefined,
        index: 0,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('another user', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const userSpy = vi
      .spyOn(user, 'likeslist')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(userSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'another_user_id',
        guildId: 'guild_id',
        nick: true,
        filter: undefined,
        ownedBy: undefined,
        index: 0,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('filter owned', async () => {
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
          {
            name: 'filter-owned',
            value: true,
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const userSpy = vi
      .spyOn(user, 'likeslist')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(userSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        nick: false,
        filter: true,
        ownedBy: undefined,
        index: 0,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('show owned by', async () => {
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
          {
            name: 'filter-owned',
            value: true,
          },
          {
            name: 'owned-by',
            value: 'another-user-id',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const userSpy = vi
      .spyOn(user, 'likeslist')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(userSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        nick: false,
        filter: true,
        ownedBy: 'another-user-id',
        index: 0,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });
});

describe('logs command handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('logs', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const userSpy = vi
      .spyOn(user, 'logs')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(userSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        nick: false,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('history', async () => {
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
        name: 'history',
        options: [
          {
            name: 'user',
            value: 'user_id',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const userSpy = vi
      .spyOn(user, 'logs')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(userSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        nick: false,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('another user', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const userSpy = vi
      .spyOn(user, 'logs')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(userSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'another_user_id',
        guildId: 'guild_id',
        nick: true,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });
});

describe('found command handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('normal', async () => {
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
        options: [
          {
            name: 'title',
            value: 'title',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const searchSpy = vi
      .spyOn(search, 'mediaFound')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchSpy).toHaveBeenCalledWith({
        index: 0,
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        search: 'title',
        id: undefined,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('owned', async () => {
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
        options: [
          {
            name: 'title',
            value: 'title',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const searchSpy = vi
      .spyOn(search, 'mediaFound')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchSpy).toHaveBeenCalledWith({
        index: 0,
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        search: 'title',
        id: undefined,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('id prefix', async () => {
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
        options: [
          {
            name: 'title',
            value: 'id=uuid',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const searchSpy = vi
      .spyOn(search, 'mediaFound')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchSpy).toHaveBeenCalledWith({
        index: 0,
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        search: 'id=uuid',
        id: 'uuid',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });
});

describe('now command handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('now', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const searchSpy = vi
      .spyOn(user, 'now')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {};

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchSpy).toHaveBeenCalledWith({
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(response).toBe(true);
    } finally {
      delete config.publicKey;
    }
  });

  test('tu', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const searchSpy = vi
      .spyOn(user, 'now')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {};

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchSpy).toHaveBeenCalledWith({
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(response).toBe(true);
    } finally {
      delete config.publicKey;
    }
  });
});

describe('trade command handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('trade', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const tradeSpy = vi
      .spyOn(trade, 'pre')
      .mockReturnValue({ send: () => true } as any);

    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };
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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(tradeSpy).toHaveBeenCalledWith({
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
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner3.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.trading;
      delete config.publicKey;
    }
  });

  test('with yourself', async () => {
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
            value: 'user_id',
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });

    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };
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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 64,
          embeds: [
            {
              type: 'rich',
              description: "You can't trade with yourself!",
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.trading;
      delete config.publicKey;
    }
  });

  test('offer', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const tradeSpy = vi
      .spyOn(trade, 'pre')
      .mockReturnValue({ send: () => true } as any);

    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };
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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(tradeSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        targetId: 'another_user_id',
        give: ['give_character_id_3'],
        take: ['take_character_id_3'],
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner3.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.trading;
      delete config.publicKey;
    }
  });

  test('disabled', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });

    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };
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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          content: '',
          embeds: [
            {
              type: 'rich',
              description: 'Trading is under maintenance, try again later!',
            },
          ],
          attachments: [],
          components: [],
          flags: 64,
        },
      });
    } finally {
      delete config.trading;
      delete config.publicKey;
    }
  });
});

describe('give command handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('give', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const tradeSpy = vi
      .spyOn(trade, 'pre')
      .mockReturnValue({ setFlags: () => undefined, send: () => true } as any);

    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };
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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(tradeSpy).toHaveBeenCalledWith({
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
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 64,
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner3.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.trading;
      delete config.publicKey;
    }
  });

  test('give yourself', async () => {
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
            value: 'user_id',
          },
          {
            name: 'give',
            value: 'give_character_id',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });

    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };
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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 64,
          embeds: [
            {
              type: 'rich',
              description: "You can't gift yourself!",
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.trading;
      delete config.publicKey;
    }
  });

  test('gift', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const tradeSpy = vi
      .spyOn(trade, 'pre')
      .mockReturnValue({ setFlags: () => undefined, send: () => true } as any);

    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };
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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(tradeSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        targetId: 'another_user_id',
        give: ['give_character_id_3'],
        take: [],
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 64,
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner3.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.trading;
      delete config.publicKey;
    }
  });

  test('disabled', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });

    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };
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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          content: '',
          embeds: [
            {
              type: 'rich',
              description: 'Trading is under maintenance, try again later!',
            },
          ],
          attachments: [],
          components: [],
          flags: 64,
        },
      });
    } finally {
      delete config.trading;
      delete config.publicKey;
    }
  });
});

describe('steal command handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('normal', async () => {
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
        options: [
          {
            name: 'name',
            value: 'character',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const stealSpy = vi
      .spyOn(steal, 'pre')
      .mockReturnValue({ setFlags: { send: () => true } } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(stealSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        search: 'character',
        id: undefined,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 64,
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner3.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('id prefix', async () => {
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
        options: [
          {
            name: 'name',
            value: 'id=character_id',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const stealSpy = vi
      .spyOn(steal, 'pre')
      .mockReturnValue({ setFlags: { send: () => true } } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(stealSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        search: 'id=character_id',
        id: 'character_id',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 64,
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner3.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });
});

describe('gacha command handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('gacha', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    vi.spyOn(gacha, 'start').mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    { media: { url: 'http://localhost:8000/spinner.gif' } },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('w', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    vi.spyOn(gacha, 'start').mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    { media: { url: 'http://localhost:8000/spinner.gif' } },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('pull', async () => {
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
        options: [
          {
            name: 'stars',
            value: 4,
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    vi.spyOn(gacha, 'start').mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    { media: { url: 'http://localhost:8000/spinner.gif' } },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('guaranteed', async () => {
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
        options: [
          {
            name: 'stars',
            value: 4,
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    vi.spyOn(gacha, 'start').mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    { media: { url: 'http://localhost:8000/spinner.gif' } },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('q', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    vi.spyOn(gacha, 'start').mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    { media: { url: 'http://localhost:8000/spinner.gif' } },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('disabled', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });

    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };
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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          content: '',
          embeds: [
            {
              type: 'rich',
              description: 'Gacha is under maintenance, try again later!',
            },
          ],
          attachments: [],
          components: [],
          flags: 64,
        },
      });
    } finally {
      delete config.trading;
      delete config.publicKey;
    }
  });
});

describe('buy command handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('buy normal', async () => {
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
        options: [
          {
            type: 1,
            name: 'normal',
            options: [
              {
                name: 'amount',
                value: 4,
              },
            ],
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    vi.spyOn(utils, 'verifySignature').mockReturnValue({ valid: true, body });
    vi.spyOn(shop, 'normal').mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('shop normal', async () => {
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
        options: [
          {
            type: 1,
            name: 'normal',
            options: [
              {
                name: 'amount',
                value: 4,
              },
            ],
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    vi.spyOn(utils, 'verifySignature').mockReturnValue({ valid: true, body });
    vi.spyOn(shop, 'normal').mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('buy guaranteed', async () => {
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
        options: [
          {
            type: 1,
            name: 'guaranteed',
            options: [
              {
                name: 'stars',
                value: 4,
              },
            ],
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    vi.spyOn(utils, 'verifySignature').mockReturnValue({ valid: true, body });
    vi.spyOn(shop, 'guaranteed').mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('shop guaranteed', async () => {
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
        options: [
          {
            type: 1,
            name: 'guaranteed',
            options: [
              {
                name: 'stars',
                value: 4,
              },
            ],
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    vi.spyOn(utils, 'verifySignature').mockReturnValue({ valid: true, body });
    vi.spyOn(shop, 'guaranteed').mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });
});

describe('reward command handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('reward pulls', async () => {
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
        name: 'reward',
        options: [
          {
            type: 1,
            name: 'pulls',
            options: [
              {
                name: 'user',
                value: 'another_user_id',
              },
              {
                name: 'amount',
                value: 4,
              },
            ],
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const rewardSpy = vi
      .spyOn(reward, 'pulls')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {};

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(rewardSpy).toHaveBeenCalledWith({
        userId: 'user_id',
        targetId: 'another_user_id',
        amount: 4,
      });

      expect(response).toBe(true);
    } finally {
      delete config.publicKey;
    }
  });
});

describe('like command handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('like', async () => {
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
        options: [
          {
            name: 'name',
            value: 'character',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const shopSpy = vi
      .spyOn(user, 'like')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(shopSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        search: 'character',
        id: undefined,
        undo: false,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    {
                      media: {
                        url: 'http://localhost:8000/spinner.gif',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('like (id prefix)', async () => {
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
        options: [
          {
            name: 'name',
            value: 'id=character_id',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const shopSpy = vi
      .spyOn(user, 'like')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(shopSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        search: 'id=character_id',
        id: 'character_id',
        undo: false,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    {
                      media: {
                        url: 'http://localhost:8000/spinner.gif',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('protect', async () => {
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
        options: [
          {
            name: 'name',
            value: 'character',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const shopSpy = vi
      .spyOn(user, 'like')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(shopSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        search: 'character',
        id: undefined,
        undo: false,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    {
                      media: {
                        url: 'http://localhost:8000/spinner.gif',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('wish', async () => {
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
        options: [
          {
            name: 'name',
            value: 'character',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const shopSpy = vi
      .spyOn(user, 'like')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(shopSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        search: 'character',
        id: undefined,
        undo: false,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    {
                      media: {
                        url: 'http://localhost:8000/spinner.gif',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('unlike', async () => {
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
        options: [
          {
            name: 'name',
            value: 'character',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const shopSpy = vi
      .spyOn(user, 'like')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(shopSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        search: 'character',
        id: undefined,
        undo: true,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    {
                      media: {
                        url: 'http://localhost:8000/spinner.gif',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('unlike (id prefix)', async () => {
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
        options: [
          {
            name: 'name',
            value: 'id=character_id',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const shopSpy = vi
      .spyOn(user, 'like')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(shopSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        search: 'id=character_id',
        id: 'character_id',
        undo: true,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    {
                      media: {
                        url: 'http://localhost:8000/spinner.gif',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });
});

describe('likeall command handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('likeall', async () => {
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
        options: [
          {
            name: 'title',
            value: 'media',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const shopSpy = vi
      .spyOn(user, 'likeall')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(shopSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        search: 'media',
        id: undefined,
        undo: false,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    {
                      media: {
                        url: 'http://localhost:8000/spinner.gif',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('likeall (id prefix)', async () => {
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
        options: [
          {
            name: 'title',
            value: 'id=media_id',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const shopSpy = vi
      .spyOn(user, 'likeall')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(shopSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        search: 'id=media_id',
        id: 'media_id',
        undo: false,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    {
                      media: {
                        url: 'http://localhost:8000/spinner.gif',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('unlikeall', async () => {
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
        options: [
          {
            name: 'title',
            value: 'media',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const shopSpy = vi
      .spyOn(user, 'likeall')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(shopSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        search: 'media',
        id: undefined,
        undo: true,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    {
                      media: {
                        url: 'http://localhost:8000/spinner.gif',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('unlike (id prefix)', async () => {
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
        options: [
          {
            name: 'name',
            value: 'id=character_id',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const shopSpy = vi
      .spyOn(user, 'like')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(shopSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        search: 'id=character_id',
        id: 'character_id',
        undo: true,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          flags: 32768,
          attachments: [],
          components: [
            {
              type: 17,
              components: [
                {
                  type: 12,
                  items: [
                    {
                      media: {
                        url: 'http://localhost:8000/spinner.gif',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });
});

describe('help command handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('help', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const helpSpy = vi
      .spyOn(help, 'pages')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {};

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(helpSpy).toHaveBeenCalledWith({
        userId: 'user_id',
        index: 0,
      });

      expect(response).toBe(true);
    } finally {
      delete config.publicKey;
    }
  });

  test('start', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const helpSpy = vi
      .spyOn(help, 'pages')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {};

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(helpSpy).toHaveBeenCalledWith({
        userId: 'user_id',
        index: 0,
      });

      expect(response).toBe(true);
    } finally {
      delete config.publicKey;
    }
  });

  test('guide', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const helpSpy = vi
      .spyOn(help, 'pages')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {};

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(helpSpy).toHaveBeenCalledWith({
        userId: 'user_id',
        index: 0,
      });

      expect(response).toBe(true);
    } finally {
      delete config.publicKey;
    }
  });

  test('tuto', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const helpSpy = vi
      .spyOn(help, 'pages')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {};

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(helpSpy).toHaveBeenCalledWith({
        userId: 'user_id',
        index: 0,
      });

      expect(response).toBe(true);
    } finally {
      delete config.publicKey;
    }
  });

  test('help with a specified page index', async () => {
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
        options: [
          {
            name: 'page',
            value: 3,
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const helpSpy = vi
      .spyOn(help, 'pages')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {};

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(helpSpy).toHaveBeenCalledWith({
        userId: 'user_id',
        index: 3,
      });

      expect(response).toBe(true);
    } finally {
      delete config.publicKey;
    }
  });
});

describe('nick command handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('nick', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const customSpy = vi
      .spyOn(user, 'nick')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(customSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        nick: 'New Nickname',
        search: 'name',
        id: undefined,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('nick with character id', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const customSpy = vi
      .spyOn(user, 'nick')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(customSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        nick: 'New Nickname',
        search: 'id=character_id',
        id: 'character_id',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });
});

describe('image command handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('image', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const customSpy = vi
      .spyOn(user, 'image')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(customSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        image: 'https://image_url.png',
        search: 'name',
        id: undefined,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('image with character id', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const customSpy = vi
      .spyOn(user, 'image')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(customSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        image: 'https://image_url.png',
        search: 'id=character_id',
        id: 'character_id',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('custom', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const customSpy = vi
      .spyOn(user, 'image')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(customSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        image: 'https://image_url.png',
        search: 'name',
        id: undefined,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });
});

describe('merge/automerge command handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('merge', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const synthesisSpy = vi
      .spyOn(merge, 'synthesize')
      .mockReturnValue({ send: () => true } as any);

    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };
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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(synthesisSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        mode: 'target',
        target: 4,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner3.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.trading;
      delete config.publicKey;
    }
  });

  test('synthesize', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const synthesisSpy = vi
      .spyOn(merge, 'synthesize')
      .mockReturnValue({ send: () => true } as any);

    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };
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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(synthesisSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        mode: 'target',
        target: 5,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner3.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.trading;
      delete config.publicKey;
    }
  });

  test('automerge min', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const synthesisSpy = vi
      .spyOn(merge, 'synthesize')
      .mockReturnValue({ send: () => true } as any);

    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };
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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(synthesisSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        mode: 'min',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner3.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.trading;
      delete config.publicKey;
    }
  });

  test('automerge min', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const synthesisSpy = vi
      .spyOn(merge, 'synthesize')
      .mockReturnValue({ send: () => true } as any);

    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };
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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(synthesisSpy).toHaveBeenCalledWith({
        token: 'token',
        userId: 'user_id',
        guildId: 'guild_id',
        mode: 'max',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              image: {
                url: 'http://localhost:8000/spinner3.gif',
              },
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.trading;
      delete config.publicKey;
    }
  });

  test('disabled', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });

    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };
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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          content: '',
          embeds: [
            {
              type: 'rich',
              description: 'Merging is under maintenance, try again later!',
            },
          ],
          attachments: [],
          components: [],
          flags: 64,
        },
      });
    } finally {
      delete config.trading;
      delete config.publicKey;
    }
  });
});

describe('installed packs', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('installed', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const packsSpy = vi
      .spyOn(packs, 'pages')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {};

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(packsSpy).toHaveBeenCalledWith({
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(response).toBe(true);
    } finally {
      delete config.publicKey;
    }
  });
});

describe('community packs command handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('packs installed', async () => {
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

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const packsSpy = vi
      .spyOn(packs, 'pages')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {};

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(packsSpy).toHaveBeenCalledWith({
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(response).toBe(true);
    } finally {
      delete config.publicKey;
    }
  });

  test('packs install', async () => {
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
            name: `install`,
            options: [
              {
                name: 'id',
                value: 'pack_id',
              },
            ],
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const packsSpy = vi
      .spyOn(packs, 'install')
      .mockReturnValue({ send: () => true } as any);
    const ctxStub = {};

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(packsSpy).toHaveBeenCalledWith({
        guildId: 'guild_id',
        userId: 'user_id',
        id: 'pack_id',
      });

      expect(response).toBe(true);
    } finally {
      delete config.publicKey;
    }
  });

  test('packs uninstall', async () => {
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
            name: `uninstall`,
            options: [
              {
                name: 'id',
                value: 'pack_id',
              },
            ],
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });

    const manifest: Manifest = {
      id: 'pack_id',
    };

    vi.spyOn(packs, 'all').mockReturnValue(
      Promise.resolve([{ manifest } as any])
    );
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              title: 'pack_id',
            },
            {
              type: 'rich',
              description: `**Are you sure you want to uninstall this pack?**\n\nUninstalling a pack will disable any characters your server members have from the pack, which may be met with negative reactions.`,
            },
          ],
          attachments: [],
          components: [
            {
              type: 1,
              components: [
                {
                  custom_id: 'uninstall=pack_id=user_id',
                  label: 'Confirm',
                  style: 2,
                  type: 2,
                },
                {
                  custom_id: 'cancel=user_id',
                  label: 'Cancel',
                  style: 4,
                  type: 2,
                },
              ],
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  test('packs uninstall (not found)', async () => {
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
            name: `uninstall`,
            options: [
              {
                name: 'id',
                value: 'pack_id',
              },
            ],
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });

    vi.spyOn(packs, 'all').mockReturnValue(Promise.resolve([]));
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
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
      });
    } finally {
      delete config.publicKey;
    }
  });
});

describe('server options command handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('normal', async () => {
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
        name: 'server',
        options: [
          {
            type: 1,
            name: 'options',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const packsSpy = vi.spyOn(serverOptions, 'view').mockReturnValue({
      setFlags: () => ({
        send: () => true,
      }),
    } as any);

    const ctxStub = {};

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(packsSpy).toHaveBeenCalledWith({
        userId: 'user_id',
        guildId: 'guild_id',
      });

      expect(response).toBe(true);
    } finally {
      delete config.publicKey;
    }
  });
});

describe('invalid request', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('invalid', async () => {
    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockImplementation(({ body }) => ({ valid: false, body }));
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

    config.publicKey = 'publicKey';

    try {
      const request = new Request('http://localhost:8000', {
        body: 'body',
        method: 'POST',
        headers: {},
      });

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body: 'body',
        signature: null,
        timestamp: null,
        publicKey: 'publicKey',
      });

      expect(response?.ok).toBe(false);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(401);
      expect(response?.statusText).toBe('Unauthorized');

      expect(response?.headers.get('content-type')).toBe(
        'application/json; charset=utf-8'
      );
    } finally {
      delete config.publicKey;
    }
  });
});

describe('unimplemented interaction', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('unimplemented', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      data: {
        name: 'name',
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
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
    }
  });
});

describe('ping interaction', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('ping', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Ping,
      guild_id: 'guild_id',
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });
    const ctxStub = {
      waitUntil: vi.fn(() => Promise.resolve()),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      expect(response?.headers.get('content-type')).toBe(
        'application/json; charset=utf-8'
      );

      expect(await response?.json()).toEqual({
        type: 1,
      });
    } finally {
      delete config.publicKey;
    }
  });
});

describe('internal error', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('internal', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Command,
      guild_id: 'guild_id',
      data: {
        name: 'search',
        options: [
          {
            name: 'title',
            value: 'title',
          },
        ],
      },
    });

    const validateSpy = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);
    const signatureSpy = vi
      .spyOn(utils, 'verifySignature')
      .mockReturnValue({ valid: true, body });

    vi.spyOn(search, 'media').mockReturnValue({} as any);

    vi.spyOn(utils, 'captureException').mockReturnValue('error_id');

    const ctxStub = {
      waitUntil: vi.fn(() => {
        throw new Error('error');
      }),
    };

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

      const response = await handler(request, ctxStub as any);

      expect(validateSpy).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureSpy).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 4,
        data: {
          embeds: [
            {
              type: 'rich',
              description:
                'An Internal Error occurred and was reported.\n```ref_id: error_id```',
            },
          ],
          attachments: [],
          components: [],
        },
      });
    } finally {
      delete config.sentry;
      delete config.publicKey;
    }
  });
});
