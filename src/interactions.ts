import {
  captureException,
  init as initSentry,
} from 'https://raw.githubusercontent.com/timfish/sentry-deno/fb3c482d4e7ad6c4cf4e7ec657be28768f0e729f/src/mod.ts';

import {
  Handler,
  json,
  serve,
  serveStatic,
  validateRequest,
} from 'https://deno.land/x/sift@0.6.0/mod.ts';

import * as discord from './discord.ts';

import * as search from './search.ts';

import packs from './packs.ts';
import utils from './utils.ts';
import gacha from './gacha.ts';

import config, { init } from './config.ts';

import { ManifestType, MediaType } from './types.ts';

const handler: Handler = async (r: Request) => {
  init({ baseUrl: r.url });

  initSentry({ dsn: config.sentry });

  const { error } = await validateRequest(r, {
    POST: {
      headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
    },
  });

  if (error) {
    return json(
      { error: error.message },
      { status: error.status },
    );
  }

  const { valid, body } = await utils.verifySignature(r, config.publicKey!);

  if (!valid) {
    return json(
      { error: 'Invalid request' },
      { status: 401 },
    );
  }

  const interaction = new discord.Interaction<string | number | boolean>(body);

  const {
    name,
    type,
    token,
    options,
    subcommand,
    customType,
    customValues,
  } = interaction;

  if (type === discord.InteractionType.Ping) {
    return discord.Message.pong();
  }

  try {
    switch (type) {
      case discord.InteractionType.Command:
        switch (name) {
          case 'search':
          case 'anime':
          case 'manga':
            return (await search.media({
              debug: Boolean(options!['debug']),
              search: options!['query'] as string,
              type: Object.values(MediaType).includes(
                  name.toUpperCase() as MediaType,
                )
                ? name.toUpperCase() as MediaType
                : undefined,
            })).send();
          case 'debug':
          case 'character':
            return (await search.character({
              debug: name === 'debug' || Boolean(options!['debug']),
              search: options!['query'] as string,
            })).send();
          case 'music':
          case 'songs':
          case 'themes':
            return (await search.music({
              search: options!['query'] as string,
            })).send();
          case 'w':
          case 'roll':
          case 'pull':
          case 'gacha':
            return gacha.start({ token }).send();
          case 'force_pull':
            return gacha.start({ token, id: options!['id'] as string }).send();
          case 'packs_builtin':
          case 'packs_manual': {
            const list = packs.list(subcommand! as ManifestType);

            return packs.embed({
              manifest: list[0],
              total: list.length,
            }).send();
          }
          default: {
            // non-standard commands (handled by individual packs)
            const message = await packs.commands(name!, interaction);

            if (message) {
              return message.send();
            }

            break;
          }
        }
        break;
      case discord.InteractionType.Component:
        switch (customType) {
          case 'media': {
            const message = await search.media({
              id: customValues![0],
            });
            return message.setType(discord.MessageType.Update).send();
          }
          case 'builtin':
          case 'manual': {
            const list = packs.list(customType as ManifestType);

            const index = parseInt(customValues![0]);

            return packs.embed({
              index,
              total: list.length,
              manifest: list[index],
            }).setType(discord.MessageType.Update).send();
          }
          default:
            break;
        }
        break;
      default:
        break;
    }
  } catch (err) {
    if (
      err?.response?.status === 404 || err?.message === '404' ||
      err?.message?.toLowerCase?.() === 'not found'
    ) {
      return discord.Message.content(
        'Found _nothing_ matching that query!',
      );
    }

    if (!config.sentry) {
      throw err;
    }

    const refId = captureException(err, {
      extra: { ...interaction },
    });

    return discord.Message.internal(refId).send();
  }

  return discord.Message.content(`Unimplemented!`);
};

const proxyImage = (): Handler => {
  return async (r: Request): Promise<Response> => {
    const request = new URL(r.url);

    try {
      const url = request.searchParams.get('url');

      const image = url ? await fetch(url) : undefined;

      if (
        image?.status === 200 &&
        image.headers.get('content-type')?.startsWith('image/')
      ) {
        const response = new Response(image.body);

        response.headers.set(
          'content-type',
          image.headers.get('content-type')!,
        );

        return response;
      }

      throw new Error();
    } catch {
      return Response.redirect(`${request.origin}/file/large.jpg`);
    }
  };
};

serve({
  '/': handler,
  '/dev': handler,
  '/image': proxyImage(),
  '/schema': serveStatic('../json/index.json', { baseUrl: import.meta.url }),
  '/file/:filename+': serveStatic('../assets/public', {
    baseUrl: import.meta.url,
  }),
});
