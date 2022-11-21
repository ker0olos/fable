import { serve } from 'https://deno.land/std@0.130.0/http/server.ts';

import {
  json,
  validateRequest,
  verifySignature,
} from 'https://raw.githubusercontent.com/ker0olos/bots/main/index.ts';

import { translate } from './translate.ts';
import { nextEpisode } from './schedule.ts';
import { searchPage } from './search.ts';

const DISCORD_PUBLIC_KEY = Deno.env.get('DISCORD_PUBLIC_KEY')!;

async function handler(request: Request): Promise<Response> {
  const { error } = await validateRequest(request, {
    POST: {
      headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
    },
  });

  if (error) {
    return json({ error: error.message }, { status: error.status });
  }

  const { valid, body } = await verifySignature(
    request,
    DISCORD_PUBLIC_KEY,
  );

  if (!valid) {
    return json(
      { error: 'Invalid request' },
      {
        status: 401,
      },
    );
  }

  const {
    type = 0,
    // token = '',
    // message = { embeds: [] },
    data = { options: [] },
    // member = { user: { id: '' } },
  } = JSON.parse(body);

  if (type === 1) {
    return json({
      type: 1,
    });
  }

  // console.log(type, data, token, member);

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
        return await searchPage({
          search: data.options[0].value,
          page: 1,
        });
      case 'next_episode':
        return await nextEpisode({ search: data.options[0].value });
      default:
        break;
    }
  } else if (type === 3) {
    //
    // COMPONENTS
    //

    switch (data.custom_id) {
      // case COMPONENTS.nextPage:
      //   return await nextSearchPage(message);
      default:
        break;
    }
  }

  return json({ error: 'bad request' }, { status: 400 });
}

serve(handler);
