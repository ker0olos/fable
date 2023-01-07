import {
  captureException,
  init as initSentry,
} from 'https://raw.githubusercontent.com/timfish/sentry-deno/fb3c482d4e7ad6c4cf4e7ec657be28768f0e729f/src/mod.ts';

import {
  json,
  serve,
  validateRequest,
} from 'https://deno.land/x/sift@0.6.0/mod.ts';

import * as discord from './discord.ts';

import * as search from './search.ts';

import packs from './packs.ts';
import utils from './utils.ts';
import gacha from './gacha.ts';

import config, { init } from './config.ts';

async function handler(
  request: Request,
  dev = false,
): Promise<Response> {
  init({ dev });

  initSentry({ dsn: config.sentry });

  const { error } = await validateRequest(request, {
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

  const { valid, body } = await utils.verifySignature(
    request,
    config.publicKey!,
  );

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
    customType,
    customValues,
  } = interaction;

  if (type === discord.InteractionType.Ping) {
    return discord.Message.pong();
  }

  // console.log(name, type, JSON.stringify(options), customType, customValues);

  try {
    switch (type) {
      case discord.InteractionType.Command:
        switch (name) {
          case 'anime':
          case 'manga':
            return (await search.media({
              debug: Boolean(options!['debug']),
              search: options!['query'] as string,
            }, name)).send();
          case 'debug':
          case 'character':
            return (await search.character({
              debug: name === 'debug' || Boolean(options!['debug']),
              search: options!['query'] as string,
            })).send();
          case 'themes':
          case 'music':
          case 'songs':
            return (await search.themes({
              search: options!['query'] as string,
            })).send();
          case 'w':
          case 'roll':
          case 'pull':
          case 'gacha':
            return gacha.start({ token }).send();
          case 'force_pull':
            return gacha.start({ token, id: options!['id'] as string }).send();
          case 'packs': {
            const message = new discord.Message();

            // TODO LOW build a pagination system into discord.ts
            // and use it to page through the different packs
            // (see https://github.com/ker0olos/fable/issues/14)
            for (const manifest of packs.builtin()) {
              const embed = new discord.Embed()
                .setAuthor({ name: 'Fable' })
                .setUrl(manifest.url)
                .setDescription(manifest.description)
                .setThumbnail({ url: manifest.icon_url })
                .setTitle(manifest.title);

              message.addEmbed(embed);
            }

            return message.send();
          }
          default: {
            // Non-standard (extra) commands are handled by individual packs
            const message = await packs.commands(name!, interaction);

            if (message) {
              return message.send();
            } else {
              break;
            }
          }
        }
        break;
      case discord.InteractionType.Component:
        // TODO BACKLOG packs components
        // (see https://github.com/ker0olos/fable/issues/13)
        switch (customType) {
          case 'media':
            return (await search.media({
              debug: false,
              id: parseInt(customValues![0]),
            })).setType(discord.MessageType.Update).send();
          default:
            break;
        }
        break;
      default:
        break;
    }
  } catch (err) {
    if (err?.response?.status === 404 || err?.message === '404') {
      return discord.Message.content(
        'Found _nothing_ matching that query!',
      );
    }

    const refId = captureException(err, {
      extra: { ...interaction },
    });

    return discord.Message.internal(refId).send();
  }

  return discord.Message.content(`Unimplemented`);
}

serve({
  '/': (_) => handler(_),
  '/dev': (_) => handler(_, true),
});
