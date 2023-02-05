import {
  captureException,
  init as initSentry,
} from 'https://raw.githubusercontent.com/timfish/sentry-deno/fb3c482d4e7ad6c4cf4e7ec657be28768f0e729f/src/mod.ts';

import {
  json,
  serve,
  serveStatic,
  validateRequest,
} from 'https://deno.land/x/sift@0.6.0/mod.ts';

import * as discord from './discord.ts';

import * as search from './search.ts';
import * as user from './user.ts';

import packs from './packs.ts';
import utils from './utils.ts';
import gacha from './gacha.ts';

import config, { initConfig } from './config.ts';

import { Character, ManifestType, Media } from './types.ts';

await initConfig();

const idPrefix = 'id=';

const handler = async (r: Request) => {
  const { origin } = new URL(r.url);

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

  const signature = r.headers.get('X-Signature-Ed25519') || undefined;
  const timestamp = r.headers.get('X-Signature-Timestamp') || undefined;

  const { valid, body } = utils.verifySignature({
    publicKey: config.publicKey,
    body: await r.text(),
    signature,
    timestamp,
  });

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
    guildId,
    channelId,
    member,
    options,
    subcommand,
    customType,
    customValues,
  } = interaction;

  if (type === discord.InteractionType.Ping) {
    return discord.Message.pong();
  }

  config.origin = origin;

  try {
    switch (type) {
      case discord.InteractionType.Partial: {
        switch (name) {
          case 'search':
          case 'anime':
          case 'manga':
          case 'media':
          case 'music':
          case 'songs':
          case 'themes': {
            const query = options['query'] as string;

            const message = new discord.Message(
              discord.MessageType.Suggestions,
            );

            const results = await packs.searchMany<Media>(
              'media',
              query,
            );

            results?.forEach((media) => {
              message.addSuggestions({
                name: `${packs.aliasToArray(media.title)[0]}`,
                value: `${idPrefix}${media.packId}:${media.id}`,
              });
            });

            return message.send();
          }
          case 'character': {
            const query = options['query'] as string;

            const message = new discord.Message(
              discord.MessageType.Suggestions,
            );

            const results = await packs.searchMany<Character>(
              'characters',
              query,
            );

            results?.forEach((character) => {
              message.addSuggestions({
                name: `${packs.aliasToArray(character.name)[0]}`,
                value: `${idPrefix}${character.packId}:${character.id}`,
              });
            });

            return message.send();
          }
        }
        break;
      }
      case discord.InteractionType.Command:
        switch (name) {
          case 'search':
          case 'anime':
          case 'manga':
          case 'media': {
            const query = options['query'] as string;

            return (await search.media({
              debug: Boolean(options['debug']),
              id: query.startsWith(idPrefix)
                ? query.substring(idPrefix.length)
                : undefined,
              search: query,
            })).send();
          }
          case 'character': {
            const query = options['query'] as string;

            return (await search.character({
              debug: Boolean(options['debug']),
              id: query.startsWith(idPrefix)
                ? query.substring(idPrefix.length)
                : undefined,
              search: query,
            })).send();
          }
          case 'music':
          case 'songs':
          case 'themes': {
            const query = options['query'] as string;

            return (await search.music({
              id: query.startsWith(idPrefix)
                ? query.substring(idPrefix.length)
                : undefined,
              search: query,
            })).send();
          }
          case 'tu':
          case 'cl':
          case 'now':
          case 'checklist': {
            return (await user.now({
              userId: member.user.id,
              guildId,
              channelId,
            })).send();
          }
          case 'w':
          case 'roll':
          case 'pull':
          case 'gacha':
            return gacha.start({
              token,
              userId: member.user.id,
              guildId,
              channelId,
            }).send();
          case 'force_pull':
            return gacha.start({ token, id: options['id'] as string }).send();
          case 'packs_builtin':
          case 'packs_manual': {
            // deno-lint-ignore no-non-null-assertion
            const list = packs.list(subcommand! as ManifestType);

            return packs.embed({
              manifest: list[0],
              total: list.length,
            }).send();
          }
          default: {
            // non-standard commands (handled by individual packs)
            // deno-lint-ignore no-non-null-assertion
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
            // deno-lint-ignore no-non-null-assertion
            const id = customValues![0];

            return (await search.media({ id })).setType(
              discord.MessageType.Update,
            ).send();
          }
          case 'characters': {
            // deno-lint-ignore no-non-null-assertion
            const mediaId = customValues![0];

            // deno-lint-ignore no-non-null-assertion
            const page = parseInt(customValues![1]);

            return (await search.mediaCharacters({ mediaId, page })).setType(
              discord.MessageType.Update,
            ).send();
          }
          case 'gacha': {
            // deno-lint-ignore no-non-null-assertion
            const userId = customValues![0];

            if (userId === member.user.id) {
              return gacha.start({
                token,
                userId: member.user.id,
                guildId,
                channelId,
                messageType: discord.MessageType.Update,
              }).send();
            } else {
              return new discord.Message()
                .setContent('Forbidden')
                .setFlags(discord.MessageFlags.Ephemeral)
                .send();
            }
          }
          case 'builtin':
          case 'manual': {
            const list = packs.list(customType as ManifestType);

            // deno-lint-ignore no-non-null-assertion
            const page = parseInt(customValues![0]);

            return packs.embed({
              page,
              total: list.length,
              manifest: list[page],
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
      return new discord.Message().setFlags(discord.MessageFlags.Ephemeral)
        .addEmbed(
          new discord.Embed().setDescription(
            'Found _nothing_ matching that query!',
          ),
        ).send();
    }

    if (!config.sentry) {
      throw err;
    }

    const refId = captureException(err, {
      extra: { ...interaction },
    });

    return discord.Message.internal(refId).send();
  }

  return new discord.Message().setContent(`Unimplemented!`).send();
};

function cache(
  age: number,
  type?: string,
): (req: Request, res: Response) => Response {
  return (_: Request, response: Response): Response => {
    if (type) {
      response.headers.set('Content-Type', type);
    }
    response.headers.set('Cache-Control', `public, max-age=${age}`);
    return response;
  };
}

serve({
  '/': handler,
  '/i/:text': utils.text,
  '/external/*': utils.proxy,
  '/assets/:filename+': serveStatic('../assets/public', {
    baseUrl: import.meta.url,
    intervene: cache(604800),
  }),
  '/:filename+': serveStatic('../json', {
    baseUrl: import.meta.url,
    intervene: cache(86400, 'application/schema+json'),
  }),
});
