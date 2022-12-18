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
    name,
    type,
    options,
    targetId,
    channelId,
    customType,
    customValues,
  } = new discord.Interaction<string>(body);

  if (type === discord.InteractionType.Ping) {
    return discord.Message.pong();
  }

  console.log(name, type, options, customType, customValues);

  try {
    switch (type) {
      case discord.InteractionType.Command:
        switch (name) {
          case 'native':
          case 'english':
          case 'romaji':
            return (await translate({
              lang: name,
              search: options!['title'].value,
            })).send();
          case 'search':
            return (await search({
              search: options!['query'].value,
            })).send();
          case 'songs':
            return (await songs({
              search: options!['query'].value,
            })).send();
          case 'add_sauce': {
            const modal = new discord.Message()
              .setId(`sauce:${channelId}:${targetId}`)
              .setTitle('Add Sauce');

            const component = new discord.Component()
              .setId('title')
              .setLabel('Title')
              .setStyle(discord.TextInputStyle.Short)
              .setPlaceholder('The title of an anime/manga');

            modal.addComponents([component]);

            return modal.send();
          }
          case 'next_episode':
            return (await nextEpisode({ search: options!['anime'].value }))
              .send();
          case 'gacha':
            return gacha.start().send();
          default:
            break;
        }
        break;
      case discord.InteractionType.Component:
      case discord.InteractionType.Modal:
        switch (customType) {
          case 'id':
            return (await search({
              id: parseInt(customValues![0]),
            })).setType(discord.MessageType.Update).send();
          case 'sauce': {
            // const response = new discord.Message().setContent('Hello, world!').reply(
            //   customValues![0],
            //   customValues![1],
            // );

            // const response = await search({
            //   search: options!['title'].value,
            // })
            //   .then((msg) =>
            //     msg.reply(customValues![0], customValues![1])
            //   );

            // if (response.status !== 200) {
            //   throw new Error(response.statusText);
            // }

            break;
          }
          default:
            break;
        }
        break;
      default:
        break;
    }
  } catch (err) {
    if (err?.response?.status === 404 || err?.message === '404') {
      return discord.Message.error('Found nothing matching that name!');
    }

    captureException(err, {
      extra: {
        ...new discord.Interaction<string>(body),
      },
    });

    return discord.Message.error(
      'An Internal Error occurred and was reported. Sorry for the inconvenience!',
    );
  }

  return discord.Message.error(`Unimplemented`);
}

init({
  dsn: Deno.env.get('SENTRY_DNS'),
});

serve(handler);
