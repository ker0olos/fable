import {
  captureException,
  init,
} from 'https://raw.githubusercontent.com/timfish/sentry-deno/fb3c482d4e7ad6c4cf4e7ec657be28768f0e729f/src/mod.ts';

import { json, serve, validateRequest, verifySignature } from '../net.ts';

import * as discord from '../discord.ts';

import { translate } from './translate.ts';
import { nextEpisode } from './schedule.ts';
import { search, songs } from './search.ts';

import * as gacha from './gacha.ts';

const APP_PUBLIC_KEY =
  '90e9e47e0f67aa24cb058b592ae359c54c42709919e2f0bb73ef388e6c9a1152';

async function handler(request: Request): Promise<Response> {
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
    APP_PUBLIC_KEY,
  );

  if (!valid) {
    return json(
      { error: 'Invalid request' },
      { status: 401 },
    );
  }

  const {
    type = 0,
    token = '',
    // message = { embeds: [] },
    data = { options: [] },
    // member = { user: { id: '' } },
  } = JSON.parse(body);

  if (type === 1) {
    return discord.Message.pong();
  }

  // console.log(type, data);

  try {
    if (type === 2) {
      //
      // SLASH COMMANDS
      //

      switch (data.name) {
        case 'native':
        case 'english':
        case 'romaji':
          return await translate({
            search: data.options[0].value,
            lang: data.name,
          });
        case 'search':
          return await search({
            search: data.options[0].value,
          });
        case 'songs':
          return await songs({
            search: data.options[0].value,
          });
        case 'next_episode':
          return await nextEpisode({ search: data.options[0].value });
        case 'gacha': {
          // TODO
          return gacha.spinner();
        }
        default:
          break;
      }
    } else if (type === 3) {
      //
      // COMPONENTS
      //

      const [type, id] = data.custom_id.split(':');

      switch (type) {
        case 'id':
          return await search({
            id: parseInt(id),
          }, discord.MESSAGE_TYPE.UPDATE);
        default:
          break;
      }
    }
  } catch (err) {
    if (err?.response?.status === 404 || err?.message === '404') {
      return discord.Message.error('Found nothing matching that name!');
    }
    captureException(err);
    return discord.Message.error(
      'An Internal Error occurred and was reported. Sorry for the inconvenience',
    );
  }

  return discord.Message.error('bad request');
}

init({
  dsn: Deno.env.get('SENTRY_DNS'),
});

serve(handler);
