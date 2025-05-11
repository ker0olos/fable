/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest';

import { vi } from 'vitest';

import * as discord from '~/src/discord.ts';

import utils from '~/src/utils.ts';
import config from '~/src/config.ts';

import { handler } from '~/src/interactions.ts';

import user from '~/src/user.ts';
import packs from '~/src/packs.ts';
import search from '~/src/search.ts';
import gacha from '~/src/gacha.ts';
import help from '~/src/help.ts';
import trade from '~/src/trade.ts';
import shop from '~/src/shop.ts';
import merge from '~/src/merge.ts';
import steal from '~/src/steal.ts';
import party from '~/src/party.ts';
import serverOptions from '~/src/serverOptions.ts';
import reward from '~/src/reward.ts';

config.global = true;

describe('Components Handler', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('media components', () => {
    it('should handle media components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        data: {
          custom_id: 'media=media_id',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const searchStub = vi
        .spyOn(search, 'media')
        .mockImplementation(() => ({ setType: () => true }) as any);

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
          token: 'token',
          id: 'media_id',
          guildId: 'guild_id',
        });

        expect(response?.status).toBe(200);
        expect(response?.statusText).toBe('OK');

        const json = JSON.parse(
          (await response?.formData()).get('payload_json')!.toString()
        );

        expect(json).toEqual({
          type: 7,
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

  describe('character components', () => {
    it('should handle character components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'character=character_id',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const searchStub = vi.spyOn(search, 'character').mockImplementation(
        () =>
          ({
            setType: () => true,
          }) as any
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
          token: 'token',
          guildId: 'guild_id',
          userId: 'user_id',
          id: 'character_id',
        });
        expect(response?.status).toBe(200);
        expect(response?.statusText).toBe('OK');

        const json = JSON.parse(
          (await response?.formData()).get('payload_json')!.toString()
        );

        expect(json).toEqual({
          type: 7,
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

    it('should handle new message character components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'character=character_id=1',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const searchStub = vi
        .spyOn(search, 'character')
        .mockImplementation(() => ({ setType: () => true }) as any);

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
          token: 'token',
          guildId: 'guild_id',
          userId: 'user_id',
          id: 'character_id',
        });

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

  describe('media characters components', () => {
    it('should handle media characters components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'mcharacters=media_id=1',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const searchStub = vi.spyOn(search, 'mediaCharacters').mockImplementation(
        () =>
          ({
            setType: () => true,
          }) as any
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
          id: 'media_id',
          userId: 'user_id',
          guildId: 'guild_id',
          index: 1,
          token: 'token',
        });

        expect(response?.status).toBe(200);
        expect(response?.statusText).toBe('OK');

        const json = JSON.parse(
          (await response?.formData()).get('payload_json')!.toString()
        );

        expect(json).toEqual({
          type: 7,
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

  describe('collection list components', () => {
    it('should handle stars collection list components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'list=user_id==5==0',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const userStub = vi.spyOn(user, 'list').mockImplementation(
        () =>
          ({
            setType: () => true,
          }) as any
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

        expect(userStub).toHaveBeenCalledWith({
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          rating: 5,
          id: undefined,
          index: 0,
          picture: false,
        });

        expect(response?.status).toBe(200);
        expect(response?.statusText).toBe('OK');

        const json = JSON.parse(
          (await response?.formData()).get('payload_json')!.toString()
        );

        expect(json).toEqual({
          type: 7,
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

    it('should handle stars (picture view) collection list components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'list=user_id==5=1=0',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const userStub = vi.spyOn(user, 'list').mockImplementation(
        () =>
          ({
            setType: () => true,
          }) as any
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

        expect(userStub).toHaveBeenCalledWith({
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          rating: 5,
          id: undefined,
          index: 0,
          picture: true,
        });

        expect(response?.status).toBe(200);
        expect(response?.statusText).toBe('OK');

        const json = JSON.parse(
          (await response?.formData()).get('payload_json')!.toString()
        );

        expect(json).toEqual({
          type: 7,
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

    it('should handle media collection list components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'list=user_id=media_id===0',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const userStub = vi.spyOn(user, 'list').mockImplementation(
        () =>
          ({
            setType: () => true,
          }) as any
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

        expect(userStub).toHaveBeenCalledWith({
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          rating: NaN,
          id: 'media_id',
          index: 0,
          picture: false,
        });

        expect(response?.status).toBe(200);
        expect(response?.statusText).toBe('OK');

        const json = JSON.parse(
          (await response?.formData()).get('payload_json')!.toString()
        );

        expect(json).toEqual({
          type: 7,
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

    it('should handle media (picture view) collection list components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'list=user_id=media_id==1=0',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const setTypeSpy = vi.fn(() => ({
        send: () => true,
      }));

      const userStub = vi.spyOn(user, 'list').mockImplementation(
        () =>
          ({
            setType: setTypeSpy,
          }) as any
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

        expect(userStub).toHaveBeenCalledWith({
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          rating: NaN,
          id: 'media_id',
          index: 0,
          picture: true,
        });

        expect(response?.status).toBe(200);
        expect(response?.statusText).toBe('OK');

        const json = JSON.parse(
          (await response?.formData()).get('payload_json')!.toString()
        );

        expect(json).toEqual({
          type: 7,
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

  describe('collection showcase components', () => {
    it('should handle collection showcase components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'showcase=user_id=5',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const setTypeSpy = vi.fn(() => ({
        send: () => true,
      }));

      const userStub = vi.spyOn(user, 'showcase').mockImplementation(
        () =>
          ({
            setType: setTypeSpy,
          }) as any
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

        expect(userStub).toHaveBeenCalledWith({
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          index: 5,
        });

        expect(response?.status).toBe(200);
        expect(response?.statusText).toBe('OK');

        const json = JSON.parse(
          (await response?.formData()).get('payload_json')!.toString()
        );

        expect(json).toEqual({
          type: 7,
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

  describe('like components', () => {
    it('should handle like components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'like=character_id',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const userStub = vi.spyOn(user, 'like').mockImplementation(
        () =>
          ({
            send: () => true,
          }) as any
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

        expect(userStub).toHaveBeenCalledWith({
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          id: 'character_id',
          mention: true,
          undo: false,
        });

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

    it('should handle new message like components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'like=character_id',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const userStub = vi.spyOn(user, 'like').mockImplementation(
        () =>
          ({
            send: () => true,
          }) as any
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

        expect(userStub).toHaveBeenCalledWith({
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          id: 'character_id',
          mention: true,
          undo: false,
        });

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

  describe('likeslist components', () => {
    it('should handle normal likeslist components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'likes=user_id=0==1',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const setTypeSpy = vi.fn(() => ({
        send: () => true,
      }));

      const userStub = vi.spyOn(user, 'likeslist').mockImplementation(
        () =>
          ({
            setType: setTypeSpy,
          }) as any
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

        expect(userStub).toHaveBeenCalledWith({
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          filter: false,
          ownedBy: '',
          index: 1,
        });

        expect(response?.status).toBe(200);
        expect(response?.statusText).toBe('OK');

        const json = JSON.parse(
          (await response?.formData()).get('payload_json')!.toString()
        );

        expect(json).toEqual({
          type: 7,
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

    it('should handle filter likeslist components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'likes=user_id=1==0',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const setTypeSpy = vi.fn(() => ({
        send: () => true,
      }));

      const userStub = vi.spyOn(user, 'likeslist').mockImplementation(
        () =>
          ({
            setType: setTypeSpy,
          }) as any
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

        expect(userStub).toHaveBeenCalledWith({
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          filter: true,
          ownedBy: '',
          index: 0,
        });

        expect(response?.status).toBe(200);
        expect(response?.statusText).toBe('OK');

        const json = JSON.parse(
          (await response?.formData()).get('payload_json')!.toString()
        );

        expect(json).toEqual({
          type: 7,
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

    it('should handle owned by likeslist components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'likes=user_id=1=another_user_id=0',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const setTypeSpy = vi.fn(() => ({
        send: () => true,
      }));

      const userStub = vi.spyOn(user, 'likeslist').mockImplementation(
        () =>
          ({
            setType: setTypeSpy,
          }) as any
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

        expect(userStub).toHaveBeenCalledWith({
          token: 'token',
          userId: 'user_id',
          guildId: 'guild_id',
          filter: true,
          ownedBy: 'another_user_id',
          index: 0,
        });

        expect(response?.status).toBe(200);
        expect(response?.statusText).toBe('OK');

        const json = JSON.parse(
          (await response?.formData()).get('payload_json')!.toString()
        );

        expect(json).toEqual({
          type: 7,
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

  describe('found components', () => {
    it('should handle prev found components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'found=media_id=1=prev',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const setTypeSpy = vi.fn(() => ({
        send: () => true,
      }));

      const searchStub = vi.spyOn(search, 'mediaFound').mockImplementation(
        () =>
          ({
            setType: setTypeSpy,
          }) as any
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
          index: 1,
          token: 'token',
          id: 'media_id',
          userId: 'user_id',
          guildId: 'guild_id',
        });

        expect(response?.status).toBe(200);
        expect(response?.statusText).toBe('OK');

        const json = JSON.parse(
          (await response?.formData()).get('payload_json')!.toString()
        );

        expect(json).toEqual({
          type: 7,
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

    it('should handle next found components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'found=media_id=1=prev',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const setTypeSpy = vi.fn(() => ({
        send: () => true,
      }));

      const searchStub = vi.spyOn(search, 'mediaFound').mockImplementation(
        () =>
          ({
            setType: setTypeSpy,
          }) as any
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
          index: 1,
          token: 'token',
          id: 'media_id',
          userId: 'user_id',
          guildId: 'guild_id',
        });

        expect(response?.status).toBe(200);
        expect(response?.statusText).toBe('OK');

        const json = JSON.parse(
          (await response?.formData()).get('payload_json')!.toString()
        );

        expect(json).toEqual({
          type: 7,
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

  describe('gacha components', () => {
    it('should handle gacha components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'gacha=user_id',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const gachaStub = vi.spyOn(gacha, 'start').mockImplementation(
        () =>
          ({
            send: () => true,
          }) as any
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

        expect(gachaStub).toHaveBeenCalledWith({
          token: 'token',
          quiet: false,
          mention: true,
          guarantee: undefined,
          userId: 'user_id',
          guildId: 'guild_id',
        });

        expect(response?.status).toBe(200);
        expect(response?.statusText).toBe('OK');

        const json = JSON.parse(
          (await response?.formData()).get('payload_json')!.toString()
        );

        expect(json).toEqual({
          type: 4,
          data: {
            flags: 32768,
            allowed_mentions: { parse: [] },
            attachments: [],
            components: [
              {
                type: 10,
                content: '<@user_id>',
              },
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

    it('should handle pull gacha components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'pull=user_id=4',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const gachaStub = vi.spyOn(gacha, 'start').mockImplementation(
        () =>
          ({
            send: () => true,
          }) as any
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

        expect(gachaStub).toHaveBeenCalledWith({
          token: 'token',
          guarantee: 4,
          quiet: false,
          mention: true,
          userId: 'user_id',
          guildId: 'guild_id',
        });

        expect(response?.status).toBe(200);
        expect(response?.statusText).toBe('OK');

        const json = JSON.parse(
          (await response?.formData()).get('payload_json')!.toString()
        );

        expect(json).toEqual({
          type: 4,
          data: {
            flags: 32768,
            allowed_mentions: { parse: [] },
            attachments: [],
            components: [
              {
                type: 10,
                content: '<@user_id>',
              },
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

    it('should handle quiet gacha components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'q=user_id',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const gachaStub = vi.spyOn(gacha, 'start').mockImplementation(
        () =>
          ({
            send: () => true,
          }) as any
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

        expect(gachaStub).toHaveBeenCalledWith({
          token: 'token',
          quiet: true,
          mention: true,
          guarantee: undefined,
          userId: 'user_id',
          guildId: 'guild_id',
        });

        expect(response?.status).toBe(200);
        expect(response?.statusText).toBe('OK');

        const json = JSON.parse(
          (await response?.formData()).get('payload_json')!.toString()
        );

        expect(json).toEqual({
          type: 4,
          data: {
            flags: 32768,
            allowed_mentions: { parse: [] },
            attachments: [],
            components: [
              {
                type: 10,
                content: '<@user_id>',
              },
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

  describe('buy components', () => {
    it('should handle normal buy components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'buy=normal=user_id=3',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const setTypeSpy = vi.fn(() => ({
        send: () => true,
      }));

      const shopStub = vi.spyOn(shop, 'confirmNormal').mockImplementation(
        () =>
          ({
            setType: setTypeSpy,
          }) as any
      );
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

        expect(shopStub).toHaveBeenCalledWith({
          userId: 'user_id',
          guildId: 'guild_id',
          amount: 3,
        });

        expect(response).toBe(true);
      } finally {
        delete config.publicKey;
      }
    });

    it('should handle guaranteed buy components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'buy=guaranteed=user_id=5',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const setTypeSpy = vi.fn(() => ({
        send: () => true,
      }));

      const shopStub = vi.spyOn(shop, 'confirmGuaranteed').mockImplementation(
        () =>
          ({
            setType: setTypeSpy,
          }) as any
      );
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

        expect(shopStub).toHaveBeenCalledWith({
          userId: 'user_id',
          stars: 5,
        });

        expect(response).toBe(true);
      } finally {
        delete config.publicKey;
      }
    });

    it('should handle bguaranteed buy components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'buy=bguaranteed=user_id=5',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const setTypeSpy = vi.fn(() => ({
        send: () => true,
      }));

      const shopStub = vi.spyOn(shop, 'guaranteed').mockImplementation(
        () =>
          ({
            setType: setTypeSpy,
          }) as any
      );
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

        expect(shopStub).toHaveBeenCalledWith({
          userId: 'user_id',
          stars: 5,
        });

        expect(response).toBe(true);
      } finally {
        delete config.publicKey;
      }
    });

    it('should handle normal buy components with no permission', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'buy=normal=another_user_id=3',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
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

        expect(json).toEqual({
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
                  "You don't have permission to complete this interaction!",
              },
            ],
          },
        });
      } finally {
        delete config.publicKey;
      }
    });

    it('should handle guaranteed buy components with no permission', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'buy=guaranteed=another_user_id=5',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
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

        expect(json).toEqual({
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
                  "You don't have permission to complete this interaction!",
              },
            ],
          },
        });
      } finally {
        delete config.publicKey;
      }
    });
  });

  describe('reward components', () => {
    it('should handle pulls reward components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'reward=pulls=user_id=another_user_id=3',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const setTypeSpy = vi.fn(() => ({
        send: () => true,
      }));

      const rewardStub = vi.spyOn(reward, 'confirmPulls').mockImplementation(
        () =>
          ({
            setType: setTypeSpy,
          }) as any
      );
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

        expect(setTypeSpy).toHaveBeenCalledWith(discord.MessageType.Defer);

        expect(rewardStub).toHaveBeenCalledWith({
          userId: 'user_id',
          targetId: 'another_user_id',
          guildId: 'guild_id',
          token: 'token',
          amount: 3,
        });

        expect(response).toBe(true);
      } finally {
        delete config.publicKey;
      }
    });

    it('should handle pulls reward components with no permission', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'reward=pulls=another_user_id=another_user_id=3',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
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

        expect(json).toEqual({
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
                  "You don't have permission to complete this interaction!",
              },
            ],
          },
        });
      } finally {
        delete config.publicKey;
      }
    });
  });

  describe('now components', () => {
    it('should handle now components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'now=user_id',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const userStub = vi.spyOn(user, 'now').mockImplementation(
        () =>
          ({
            send: () => true,
          }) as any
      );
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

        expect(userStub).toHaveBeenCalledWith({
          userId: 'user_id',
          guildId: 'guild_id',
          mention: true,
        });

        expect(response).toBe(true);
      } finally {
        delete config.publicKey;
      }
    });
  });

  describe('help components', () => {
    it('should handle help components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'help==1',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const setTypeSpy = vi.fn(() => ({
        send: () => true,
      }));

      const helpStub = vi.spyOn(help, 'pages').mockImplementation(
        () =>
          ({
            setType: setTypeSpy,
          }) as any
      );
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

        expect(helpStub).toHaveBeenCalledWith({
          userId: 'user_id',
          index: 1,
        });

        expect(response).toBe(true);
      } finally {
        delete config.publicKey;
      }
    });
  });

  describe('give components', () => {
    it('should handle give components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
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

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const setTypeSpy = vi.fn(() => ({
        send: () => true,
      }));

      const tradeStub = vi.spyOn(trade, 'give').mockImplementation(
        () =>
          ({
            setType: setTypeSpy,
          }) as any
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

        expect(tradeStub).toHaveBeenCalledWith({
          token: 'token',
          userId: 'user_id',
          targetId: 'target_id',
          giveCharactersIds: ['character_id', 'character_id2', 'character_id3'],
          guildId: 'guild_id',
        });

        expect(response?.status).toBe(200);
        expect(response?.statusText).toBe('OK');

        const json = JSON.parse(
          (await response?.formData()).get('payload_json')!.toString()
        );

        expect(json).toEqual({
          type: 7,
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

    it('should handle give components with no permission', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'give=another_user_id=target_id=character_id',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
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

        expect(json).toEqual({
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
                  "You don't have permission to complete this interaction!",
              },
            ],
          },
        });
      } finally {
        delete config.publicKey;
      }
    });
  });

  describe('trade components', () => {
    it('should handle trade components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
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

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const setTypeSpy = vi.fn(() => ({
        send: () => true,
      }));

      const tradeStub = vi.spyOn(trade, 'accepted').mockImplementation(
        () =>
          ({
            setType: setTypeSpy,
          }) as any
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

        expect(tradeStub).toHaveBeenCalledWith({
          token: 'token',
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
        });

        expect(response?.status).toBe(200);
        expect(response?.statusText).toBe('OK');

        const json = JSON.parse(
          (await response?.formData()).get('payload_json')!.toString()
        );

        expect(json).toEqual({
          type: 7,
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

    it('should handle trade components with no permission', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
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

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
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

        expect(json).toEqual({
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
                  "You don't have permission to complete this interaction!",
              },
            ],
          },
        });
      } finally {
        delete config.publicKey;
      }
    });
  });

  describe('synthesis components', () => {
    it('should handle synthesis components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'test_token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'synthesis=user_id=5',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const setTypeSpy = vi.fn(() => ({
        send: () => true,
      }));

      const synthesisStub = vi.spyOn(merge, 'confirmed').mockImplementation(
        () =>
          ({
            setType: setTypeSpy,
          }) as any
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

        expect(synthesisStub).toHaveBeenCalledWith({
          token: 'test_token',
          userId: 'user_id',
          guildId: 'guild_id',
          target: 5,
        });

        expect(response?.status).toBe(200);
        expect(response?.statusText).toBe('OK');

        const json = JSON.parse(
          (await response?.formData()).get('payload_json')!.toString()
        );

        expect(json).toEqual({
          type: 7,
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

    it('should handle synthesis components with no permission', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'synthesis=another_user_id=5',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
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

        expect(json).toEqual({
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
                  "You don't have permission to complete this interaction!",
              },
            ],
          },
        });
      } finally {
        delete config.publicKey;
      }
    });
  });

  describe('steal components', () => {
    it('should handle steal components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'steal=another_user_id=character_id=40',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const setTypeSpy = vi.fn(() => ({
        send: () => true,
      }));

      const tradeStub = vi.spyOn(steal, 'attempt').mockImplementation(
        () =>
          ({
            setType: setTypeSpy,
          }) as any
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

        expect(tradeStub).toHaveBeenCalledWith({
          token: 'token',
          userId: 'user_id',
          targetUserId: 'another_user_id',
          characterId: 'character_id',
          guildId: 'guild_id',
          pre: 40,
        });

        expect(response?.status).toBe(200);
        expect(response?.statusText).toBe('OK');

        const json = JSON.parse(
          (await response?.formData()).get('payload_json')!.toString()
        );

        expect(json).toEqual({
          type: 7,
          data: {
            embeds: [
              {
                type: 'rich',
                image: {
                  url: 'http://localhost:8000/steal2.gif',
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

  describe('community packs install', () => {
    it('should handle community packs install', async () => {
      const pack = {
        id: 'pack_id',
      };

      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'install=pack_id=user_id',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      vi.spyOn(packs, 'all').mockResolvedValue([pack as any]);

      const packsStub = vi.spyOn(packs, 'install').mockImplementation(
        () =>
          ({
            send: () => true,
          }) as any
      );
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

        expect(packsStub).toHaveBeenCalledWith({
          userId: 'user_id',
          guildId: 'guild_id',
          id: 'pack_id',
        });

        expect(response).toBe(true);
      } finally {
        delete config.publicKey;
      }
    });
  });

  describe('community packs uninstall', () => {
    it('should handle community packs uninstall', async () => {
      const pack = {
        id: 'pack_id',
      };

      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'uninstall=pack_id=user_id',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const setTypeSpy = vi.fn(() => ({
        send: () => true,
      }));

      vi.spyOn(packs, 'all').mockResolvedValue([pack as any]);

      const packsStub = vi.spyOn(packs, 'uninstall').mockImplementation(
        () =>
          ({
            setType: setTypeSpy,
          }) as any
      );
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

        expect(packsStub).toHaveBeenCalledWith({
          userId: 'user_id',
          guildId: 'guild_id',
          id: 'pack_id',
        });

        expect(response).toBe(true);
      } finally {
        delete config.publicKey;
      }
    });

    it('should handle community packs uninstall with no permission', async () => {
      const pack = {
        id: 'pack_id',
      };

      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'uninstall=pack_id=another_user_id',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      vi.spyOn(packs, 'all').mockResolvedValue([pack as any]);
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

        expect(json).toEqual({
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
                  "You don't have permission to complete this interaction!",
              },
            ],
          },
        });
      } finally {
        delete config.publicKey;
      }
    });
  });

  describe('server options', () => {
    it('should handle dupes server options', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'options=dupes',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const setTypeSpy = vi.fn(() => ({
        send: () => true,
      }));

      const invertDupesStub = vi
        .spyOn(serverOptions, 'invertDupes')
        .mockImplementation(
          () =>
            ({
              setType: setTypeSpy,
            }) as any
        );
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

        expect(invertDupesStub).toHaveBeenCalledWith({
          userId: 'user_id',
          guildId: 'guild_id',
        });

        expect(response).toBe(true);
      } finally {
        delete config.publicKey;
      }
    });
  });

  describe('passign components', () => {
    it('should handle passign components', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'passign=user_id=character_id',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
        );

      const setTypeSpy = vi.fn(() => ({
        send: () => true,
      }));

      const partyStub = vi.spyOn(party, 'assign').mockImplementation(
        () =>
          ({
            setType: setTypeSpy,
          }) as any
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

        await handler(request, ctxStub as any);

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

        expect(partyStub).toHaveBeenCalledWith({
          token: 'token',
          id: 'character_id',
          guildId: 'guild_id',
          userId: 'user_id',
        });
      } finally {
        delete config.publicKey;
      }
    });

    it('should handle passign components with no permission', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'passign=another_user_id=character_id',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
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

        expect(json).toEqual({
          type: 4,
          data: {
            flags: 64,
            content: '',
            embeds: [
              {
                type: 'rich',
                description:
                  "You don't have permission to complete this interaction!",
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

  describe('cancel dialog', () => {
    it('should handle canceled dialog', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'cancel',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
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

        expect(json).toEqual({
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
        });
      } finally {
        delete config.publicKey;
      }
    });

    it('should handle declined dialog', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'target_id',
          },
        },
        data: {
          custom_id: 'cancel=user_id=target_id',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
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

        expect(json).toEqual({
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
        });
      } finally {
        delete config.publicKey;
      }
    });

    it('should handle cancel dialog with no permission 1', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'cancel=another_user_id',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
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

        expect(json).toEqual({
          type: 4,
          data: {
            flags: 64,
            content: '',
            embeds: [
              {
                type: 'rich',
                description:
                  "You don't have permission to complete this interaction!",
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

    it('should handle cancel dialog with no permission 2', async () => {
      const body = JSON.stringify({
        id: 'id',
        token: 'token',
        type: discord.InteractionType.Component,
        guild_id: 'guild_id',
        member: {
          user: {
            id: 'user_id',
          },
        },
        data: {
          custom_id: 'cancel=another_user_id=target_id',
        },
      });

      const validateStub = vi
        .spyOn(utils, 'validateRequest')
        .mockReturnValue({} as any);

      const signatureStub = vi
        .spyOn(utils, 'verifySignature')
        .mockImplementation(
          ({ body }) =>
            ({
              valid: true,
              body,
            }) as any
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

        expect(json).toEqual({
          type: 4,
          data: {
            flags: 64,
            content: '',
            embeds: [
              {
                type: 'rich',
                description:
                  "You don't have permission to complete this interaction!",
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
});
