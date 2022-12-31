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

import { nextEpisode } from './schedule.ts';

import * as search from './search.ts';

import * as dice from './dice.ts';
import * as gacha from './gacha.ts';

import { dsn, publicKey, setCanary } from './vars.ts';

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
  } = new discord.Interaction<string | number>(body);

  if (type === discord.InteractionType.Ping) {
    return discord.Message.pong();
  }

  console.log(name, type, JSON.stringify(options), customType, customValues);

  try {
    switch (type) {
      case discord.InteractionType.Command:
        switch (name) {
          case 'anime':
          case 'manga':
            return (await search.media({
              search: options!['query'].value as string,
            }, name)).send();
          case 'character':
            return (await search.character({
              search: options!['query'].value as string,
            })).send();
          case 'songs':
          case 'themes':
            return (await search.themes({
              search: options!['query'].value as string,
            })).send();
          case 'next_episode':
            return (await nextEpisode({
              search: options!['title'].value as string,
            }))
              .send();
          case 'dice':
            return dice.roll({
              user: member!.user,
              amount: options!['amount'].value as number,
            }).send();
          case 'w':
          case 'roll':
          case 'pull':
          case 'gacha':
            return gacha.start({ token }).send();
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
      return discord.Message.error('Found __nothing__ matching that name!');
    }

    captureException(err, {
      extra: {
        ...new discord.Interaction<string>(body),
      },
    });

    return discord.Message.error(
      '**Sorry!** An Internal Error occurred and was reported.',
    );
  }

  return discord.Message.error(`Unimplemented`);
}

init({
  dsn,
});

serve({
  '/': (r) => handler(r),
  '/canary': (r) => handler(r, true),
});
