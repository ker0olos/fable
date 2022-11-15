import { serve } from 'https://deno.land/std@0.130.0/http/server.ts';

import {
  json,
  validateRequest,
  verifySignature,
} from 'https://raw.githubusercontent.com/ker0olos/bots/main/index.ts';

import * as anilist from './api.ts';

const NEW_MESSAGE = 4;
const UPDATE_MESSAGE = 7;

const ACTION_ROW = 1;
const BUTTON = 2;

const BLUE = 1;
const GREY = 2;
const GREEN = 3;
const RED = 4;

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
    Deno.env.get('DISCORD_PUBLIC_KEY')!,
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

  // slash command
  if (type === 2) {
    switch (data.name) {
      // case 'search':
      //   return await search({ search: data.options[0].value });
      case 'next_episode':
        return await nextEpisode({ search: data.options[0].value });
      default:
        break;
    }
    // components (buttons)
  } else if (type === 3) {
    switch (data.custom_id) {
      // case 'row_0_button_0':
      //   return edit_test_button();
      default:
        break;
    }
  }

  return json({ error: 'bad request' }, { status: 400 });
}

// function send_test_button() {
//   return json({
//     type: NEW_MESSAGE,
//     data: {
//       content: `Unclicked`,
//       components: [
//         {
//           type: ACTION_ROW,
//           components: [
//             {
//               style: GREY,
//               type: BUTTON,
//               label: `Click`,
//               custom_id: `row_0_button_0`,
//             },
//           ],
//         },
//       ],
//     },
//   });
// }

// function edit_test_button() {
//   return json({
//     type: UPDATE_MESSAGE,
//     data: {
//       content: `clicked`,
//       components: [],
//     },
//   });
// }

// async function search({ search }: { search: string }): Promise<Response> {
//   const data = await anilist.search({ search });

//   // console.log(data);

//   return json({
//     type: NEW_MESSAGE,
//     data: {
//       content: `\`${JSON.stringify(data)}\``,
//     },
//   });
// }

async function nextEpisode({ search }: { search: string }) {
  try {
    const anime = await anilist.getNextAiring({ search });

    if (!anime.nextAiringEpisode) {
      return json({
        type: NEW_MESSAGE,
        data: {
          content:
            `\`${anime.title.english}\` is currently not airing anymore episodes.`,
        },
      });
    }

    return json({
      type: NEW_MESSAGE,
      data: {
        content:
          `The next episode of \`${anime.title.english}\` is <t:${anime.nextAiringEpisode.airingAt}:R>.`,
      },
    });
  } catch (err) {
    if (err.response.status === 404) {
      return json({
        type: NEW_MESSAGE,
        data: {
          content: `Found no anime matching that name!`,
        },
      });
    }

    return json({ errors: err.errors }, { status: err.response.status });
  }
}

serve(handler);
