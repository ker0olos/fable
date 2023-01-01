import {
  captureException,
  init,
} from 'https://raw.githubusercontent.com/timfish/sentry-deno/fb3c482d4e7ad6c4cf4e7ec657be28768f0e729f/src/mod.ts';

import {
  json,
  serve,
  validateRequest,
} from 'https://deno.land/x/sift@0.6.0/mod.ts';

import { verifySignature } from './utils.ts';

import * as discord from './discord.ts';

import * as search from './search.ts';

import * as extra from './extra.ts';
import * as gacha from './gacha.ts';

import { dsn, publicKey, setCanary } from './config.ts';

import { nextEpisode } from '../repos/anilist/commands.ts';

async function handler(
  request: Request,
  canary = false,
): Promise<Response> {
  setCanary(canary);

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

  const { valid, body } = await verifySignature(
    request,
    publicKey,
  );

  if (!valid) {
    return json(
      { error: 'Invalid request' },
      { status: 401 },
    );
  }

  const {
    name,
    type,
    token,
    member,
    options,
    customType,
    customValues,
  } = new discord.Interaction<string | number | boolean>(body);

  if (type === discord.InteractionType.Ping) {
    return discord.Message.pong();
  }

  // console.log(name, type, JSON.stringify(options), customType, customValues);

  // TODO most of this should be managed by the some kind of repo management system

  try {
    switch (type) {
      case discord.InteractionType.Command:
        switch (name) {
          case 'anime':
          case 'manga':
            return (await search.media({
              search: options!['query'] as string,
            }, name)).send();
          case 'debug':
          case 'character':
            return (await search.character({
              debug: name === 'debug',
              search: options!['query'] as string,
            })).send();
          case 'songs':
          case 'themes':
            return (await search.themes({
              search: options!['query'] as string,
            })).send();
          case 'next_episode':
            return (await nextEpisode({
              search: options!['title'] as string,
            }))
              .send();
          case 'dice':
            return extra.diceRoll({
              user: member!.user,
              amount: options!['amount'] as number,
            }).send();
          case 'w':
          case 'roll':
          case 'pull':
          case 'gacha':
            return gacha.start({ token }).send();
          case 'force_pull':
            return gacha.start({ token, id: options!['id'] as string }).send();
          default:
            break;
        }
        break;
      case discord.InteractionType.Component:
        switch (customType) {
          case 'media':
            return (await search.media({
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
      extra: {
        ...new discord.Interaction<string>(body),
      },
    });

    return discord.Message.internal(refId).send();
  }

  return discord.Message.content(`Unimplemented`);
}

init({
  dsn,
});

serve({
  '/': (r) => handler(r),
  '/canary': (r) => handler(r, true),
});
