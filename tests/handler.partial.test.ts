/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unsafe-optional-chaining */
import { describe, it, expect, afterEach, vi } from 'vitest';

import * as discord from '~/src/discord.ts';

import utils from '~/src/utils.ts';
import config from '~/src/config.ts';

import { handler } from '~/src/interactions.ts';

import packs from '~/src/packs.ts';

config.global = true;

describe('media suggestions', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('search', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

      data: {
        name: 'search',
        options: [
          {
            name: 'title',
            value: 'title',
            focused: true,
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi.spyOn(packs, '_searchManyMedia').mockResolvedValue([
      {
        id: 'packId:id',
        title: ['english title'],
        popularity: 1,
      },
    ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'title',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english title',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('anime', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

      data: {
        name: 'anime',
        options: [
          {
            name: 'title',
            value: 'title',
            focused: true,
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi.spyOn(packs, '_searchManyMedia').mockResolvedValue([
      {
        id: 'packId:id',
        title: ['english title'],
        popularity: 1,
      },
    ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'title',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english title',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('manga', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

      data: {
        name: 'manga',
        options: [
          {
            name: 'title',
            value: 'title',
            focused: true,
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi.spyOn(packs, '_searchManyMedia').mockResolvedValue([
      {
        id: 'packId:id',
        title: ['english title'],
        popularity: 1,
      },
    ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'title',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english title',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('media', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

      data: {
        name: 'media',
        options: [
          {
            name: 'title',
            value: 'title',
            focused: true,
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi.spyOn(packs, '_searchManyMedia').mockResolvedValue([
      {
        id: 'packId:id',
        title: ['english title'],
        popularity: 1,
      },
    ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'title',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english title',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('series', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

      data: {
        name: 'series',
        options: [
          {
            name: 'title',
            value: 'title',
            focused: true,
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi.spyOn(packs, '_searchManyMedia').mockResolvedValue([
      {
        id: 'packId:id',
        title: ['english title'],
        popularity: 1,
      },
    ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'title',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english title',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('found', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

      data: {
        name: 'found',
        options: [
          {
            name: 'title',
            value: 'title',
            focused: true,
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi.spyOn(packs, '_searchManyMedia').mockResolvedValue([
      {
        id: 'packId:id',
        title: ['english title'],
        popularity: 1,
      },
    ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'title',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english title',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('owned', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

      data: {
        name: 'owned',
        options: [
          {
            name: 'title',
            value: 'title',
            focused: true,
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi.spyOn(packs, '_searchManyMedia').mockResolvedValue([
      {
        id: 'packId:id',
        title: ['english title'],
        popularity: 1,
      },
    ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'title',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english title',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('likeall', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

      data: {
        name: 'likeall',
        options: [
          {
            name: 'title',
            value: 'title',
            focused: true,
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi.spyOn(packs, '_searchManyMedia').mockResolvedValue([
      {
        id: 'packId:id',
        title: ['english title'],
        popularity: 1,
      },
    ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'title',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english title',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('unlikeall', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

      data: {
        name: 'unlikeall',
        options: [
          {
            name: 'title',
            value: 'title',
            focused: true,
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi.spyOn(packs, '_searchManyMedia').mockResolvedValue([
      {
        id: 'packId:id',
        title: ['english title'],
        popularity: 1,
      },
    ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'title',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english title',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('collection media', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

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
                focused: true,
              },
            ],
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi.spyOn(packs, '_searchManyMedia').mockResolvedValue([
      {
        id: 'packId:id',
        title: ['english title'],
        popularity: 1,
      },
    ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'title',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english title',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('coll media', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

      data: {
        name: 'coll',
        options: [
          {
            type: 1,
            name: 'media',
            options: [
              {
                name: 'title',
                value: 'title',
                focused: true,
              },
            ],
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi.spyOn(packs, '_searchManyMedia').mockResolvedValue([
      {
        id: 'packId:id',
        title: ['english title'],
        popularity: 1,
      },
    ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'title',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english title',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('mm media', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

      data: {
        name: 'mm',
        options: [
          {
            type: 1,
            name: 'media',
            options: [
              {
                name: 'title',
                value: 'title',
                focused: true,
              },
            ],
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi.spyOn(packs, '_searchManyMedia').mockResolvedValue([
      {
        id: 'packId:id',
        title: ['english title'],
        popularity: 1,
      },
    ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'title',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english title',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('no media format', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',
      data: {
        name: 'search',
        options: [
          {
            name: 'title',
            value: 'title',
            focused: true,
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi.spyOn(packs, '_searchManyMedia').mockResolvedValue([
      {
        id: 'packId:id',
        title: ['english title'],
        popularity: 1,
      },
    ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'title',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english title',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });
});

describe('character suggestions', () => {
  it('character', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',
      data: {
        name: 'character',
        options: [
          {
            name: 'name',
            value: 'name',
            focused: true,
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi
      .spyOn(packs, '_searchManyCharacters')
      .mockResolvedValue([
        {
          id: 'packId:id',
          name: ['english name'],
          mediaTitle: ['anime title'],
          popularity: 1,
        },
      ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'name',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english name (anime title)',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('trade (take parameter)', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

      data: {
        name: 'trade',
        options: [
          {
            name: 'give',
            value: 'give',
            focused: true,
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi
      .spyOn(packs, '_searchManyCharacters')
      .mockResolvedValue([
        {
          id: 'packId:id',
          name: ['english name'],
          mediaTitle: ['anime title'],
          popularity: 1,
        },
      ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'give',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english name (anime title)',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('trade (give parameter)', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

      data: {
        name: 'trade',
        options: [
          {
            name: 'give',
            value: 'give',
          },
          {
            name: 'take',
            value: 'take',
            focused: true,
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi
      .spyOn(packs, '_searchManyCharacters')
      .mockResolvedValue([
        {
          id: 'packId:id',
          name: ['english name'],
          mediaTitle: ['anime title'],
          popularity: 1,
        },
      ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'take',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english name (anime title)',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('offer', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

      data: {
        name: 'offer',
        options: [
          {
            name: 'give',
            value: 'give',
            focused: true,
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi
      .spyOn(packs, '_searchManyCharacters')
      .mockResolvedValue([
        {
          id: 'packId:id',
          name: ['english name'],
          mediaTitle: ['anime title'],
          popularity: 1,
        },
      ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'give',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english name (anime title)',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('give', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

      data: {
        name: 'give',
        options: [
          {
            name: 'give',
            value: 'give',
            focused: true,
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi
      .spyOn(packs, '_searchManyCharacters')
      .mockResolvedValue([
        {
          id: 'packId:id',
          name: ['english name'],
          mediaTitle: ['anime title'],
          popularity: 1,
        },
      ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'give',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english name (anime title)',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('gift', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

      data: {
        name: 'gift',
        options: [
          {
            name: 'give',
            value: 'give',
            focused: true,
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi
      .spyOn(packs, '_searchManyCharacters')
      .mockResolvedValue([
        {
          id: 'packId:id',
          name: ['english name'],
          mediaTitle: ['anime title'],
          popularity: 1,
        },
      ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'give',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english name (anime title)',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('steal', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

      data: {
        name: 'steal',
        options: [
          {
            name: 'name',
            value: 'name',
            focused: true,
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi
      .spyOn(packs, '_searchManyCharacters')
      .mockResolvedValue([
        {
          id: 'packId:id',
          name: ['english name'],
          mediaTitle: ['anime title'],
          popularity: 1,
        },
      ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'name',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english name (anime title)',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('like', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

      data: {
        name: 'like',
        options: [
          {
            name: 'name',
            value: 'name',
            focused: true,
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi
      .spyOn(packs, '_searchManyCharacters')
      .mockResolvedValue([
        {
          id: 'packId:id',
          name: ['english name'],
          mediaTitle: ['anime title'],
          popularity: 1,
        },
      ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'name',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english name (anime title)',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('unlike', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

      data: {
        name: 'unlike',
        options: [
          {
            name: 'name',
            value: 'name',
            focused: true,
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi
      .spyOn(packs, '_searchManyCharacters')
      .mockResolvedValue([
        {
          id: 'packId:id',
          name: ['english name'],
          mediaTitle: ['anime title'],
          popularity: 1,
        },
      ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'name',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english name (anime title)',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('character', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',
      data: {
        name: 'stats',
        options: [
          {
            name: 'name',
            value: 'name',
            focused: true,
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi
      .spyOn(packs, '_searchManyCharacters')
      .mockResolvedValue([
        {
          id: 'packId:id',
          name: ['english name'],
          mediaTitle: ['anime title'],
          popularity: 1,
        },
      ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'name',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english name (anime title)',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('no media relation', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',
      data: {
        name: 'character',
        options: [
          {
            name: 'name',
            value: 'name',
            focused: true,
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi
      .spyOn(packs, '_searchManyCharacters')
      .mockResolvedValue([
        {
          id: 'packId:id',
          name: ['english name'],
          popularity: 1,
        },
      ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'name',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english name',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('skills acquire', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',
      data: {
        name: 'skills',
        options: [
          {
            type: 1,
            name: 'acquire',
            options: [
              {
                name: 'character',
                value: 'name',
                focused: true,
              },
            ],
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi
      .spyOn(packs, '_searchManyCharacters')
      .mockResolvedValue([
        {
          id: 'packId:id',
          name: ['english name'],
          mediaTitle: ['anime title'],
          popularity: 1,
        },
      ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'name',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english name (anime title)',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('skills upgrade', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',
      data: {
        name: 'skills',
        options: [
          {
            type: 1,
            name: 'upgrade',
            options: [
              {
                name: 'character',
                value: 'name',
                focused: true,
              },
            ],
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi
      .spyOn(packs, '_searchManyCharacters')
      .mockResolvedValue([
        {
          id: 'packId:id',
          name: ['english name'],
          mediaTitle: ['anime title'],
          popularity: 1,
        },
      ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'name',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english name (anime title)',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });
});

describe('party assign character suggestions', () => {
  it('party assign', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
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
                focused: true,
              },
            ],
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi
      .spyOn(packs, '_searchManyCharacters')
      .mockResolvedValue([
        {
          id: 'packId:id',
          name: ['english name'],
          mediaTitle: ['anime title'],
          popularity: 1,
        },
      ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'name',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english name (anime title)',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('team assign', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'team',
        options: [
          {
            type: 1,
            name: 'assign',
            options: [
              {
                name: 'name',
                value: 'name',
                focused: true,
              },
            ],
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi
      .spyOn(packs, '_searchManyCharacters')
      .mockResolvedValue([
        {
          id: 'packId:id',
          name: ['english name'],
          mediaTitle: ['anime title'],
          popularity: 1,
        },
      ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'name',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english name (anime title)',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('p assign', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

      member: {
        user: {
          id: 'user_id',
        },
      },
      data: {
        name: 'p',
        options: [
          {
            type: 1,
            name: 'assign',
            options: [
              {
                name: 'name',
                value: 'name',
                focused: true,
              },
            ],
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const searchStub = vi
      .spyOn(packs, '_searchManyCharacters')
      .mockResolvedValue([
        {
          id: 'packId:id',
          name: ['english name'],
          mediaTitle: ['anime title'],
          popularity: 1,
        },
      ] as any);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(searchStub).toHaveBeenCalledWith({
        search: 'name',
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
        type: 8,
        data: {
          choices: [
            {
              name: 'english name (anime title)',
              value: 'id=packId:id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });
});

describe('community packs', () => {
  it('uninstall', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

      data: {
        name: 'packs',
        options: [
          {
            type: 1,
            name: 'uninstall',
            options: [
              {
                name: 'id',
                value: 'id',
                focused: true,
              },
            ],
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const listStub = vi.spyOn(packs, 'all').mockResolvedValue([
      {
        manifest: {
          id: 'id',
          title: 'title',
        },
      } as any,
    ]);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(listStub).toHaveBeenCalledWith({
        guildId: 'guild_id',
        filter: true,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
        type: 8,
        data: {
          choices: [
            {
              name: 'title',
              value: 'id',
            },
          ],
        },
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('sort by title', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

      data: {
        name: 'packs',
        options: [
          {
            type: 1,
            name: 'uninstall',
            options: [
              {
                name: 'id',
                value: 'titl',
                focused: true,
              },
            ],
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const listStub = vi.spyOn(packs, 'all').mockResolvedValue([
      {
        manifest: {
          id: 'id535245',
          title: 'title',
        },
      } as any,
      {
        manifest: {
          id: 'id998943894',
          title: 'name',
        },
      } as any,
      {
        manifest: {
          id: 'id424535',
          title: 'alias',
        },
      } as any,
    ]);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(listStub).toHaveBeenCalledWith({
        guildId: 'guild_id',
        filter: true,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
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
      });
    } finally {
      delete config.publicKey;
    }
  });

  it('sort by id', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',

      data: {
        name: 'packs',
        options: [
          {
            type: 1,
            name: 'uninstall',
            options: [
              {
                name: 'id',
                value: 'titl',
                focused: true,
              },
            ],
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
    );

    const listStub = vi.spyOn(packs, 'all').mockResolvedValue([
      {
        manifest: { id: 'name' },
      } as any,
      {
        manifest: { id: 'title' },
      } as any,
      {
        manifest: { id: 'alias' },
      } as any,
    ]);

    config.publicKey = 'publicKey';

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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
        body,
        signature: 'ed25519',
        timestamp: 'timestamp',
        publicKey: 'publicKey',
      });

      expect(listStub).toHaveBeenCalledWith({
        guildId: 'guild_id',
        filter: true,
      });

      expect(response?.ok).toBe(true);
      expect(response?.redirected).toBe(false);

      expect(response?.status).toBe(200);
      expect(response?.statusText).toBe('OK');

      const json = JSON.parse(
        (await response?.formData()).get('payload_json')!.toString()
      );

      expect(json).toEqual({
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
      });
    } finally {
      delete config.publicKey;
    }
  });
});

describe('skills', () => {
  it('acquire', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',
      data: {
        name: 'skills',
        options: [
          {
            type: 1,
            name: 'acquire',
            options: [
              {
                name: 'skill',
                value: 'crit',
                focused: true,
              },
            ],
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
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

      expect(json).toMatchSnapshot();
    } finally {
      delete config.publicKey;
    }
  });

  it('upgrade', async () => {
    const body = JSON.stringify({
      id: 'id',
      token: 'token',
      type: discord.InteractionType.Partial,
      guild_id: 'guild_id',
      data: {
        name: 'skills',
        options: [
          {
            type: 1,
            name: 'upgrade',
            options: [
              {
                name: 'skill',
                value: 'crit',
                focused: true,
              },
            ],
          },
        ],
      },
    });

    const validateStub = vi
      .spyOn(utils, 'validateRequest')
      .mockReturnValue({} as any);

    const signatureStub = vi.spyOn(utils, 'verifySignature').mockImplementation(
      ({ body }) =>
        ({
          valid: true,
          body,
        }) as any
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

      expect(validateStub).toHaveBeenCalledWith(request, {
        POST: {
          headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
        },
      });

      expect(signatureStub).toHaveBeenCalledWith({
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

      expect(json).toMatchSnapshot();
    } finally {
      delete config.publicKey;
    }
  });
});
