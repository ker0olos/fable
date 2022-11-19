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
        return await searchPage({ search: data.options[0].value, page: 1 });
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
      case 'row_0_button_0':
        return await nextSearchPage();
      default:
        break;
    }
  }

  return json({ error: 'bad request' }, { status: 400 });
}

async function nextSearchPage() {
  return json({
    type: UPDATE_MESSAGE,
    data: {
      content: `Clicked`,
      components: [],
    },
  });
}

async function searchPage({ search, page }: { search: string; page: number }) {
  try {
    const results = await anilist.search({ search, page });

    if (!results.media.length) {
      throw new Error('404');
    }

    return json({
      type: NEW_MESSAGE,
      data: {
        content: `${results.media[0].title.english}`,
        components: [
          {
            type: ACTION_ROW,
            components: [
              {
                style: GREY,
                type: BUTTON,
                label: `Next`,
                custom_id: `next-search-result`,
              },
            ],
          },
        ],
      },
    });
  } catch (err) {
    if (err?.response?.status === 404 || err?.message === '404') {
      return json({
        type: NEW_MESSAGE,
        data: {
          content: `Found nothing matching that name!`,
        },
      });
    }

    return json({ errors: err.errors }, { status: err.response.status });
  }
}

async function nextEpisode({ search }: { search: string }) {
  try {
    const anime = await anilist.getNextAiring({ search });

    if (!anime.nextAiringEpisode?.airingAt || !anime.title?.english) {
      return json({
        type: NEW_MESSAGE,
        data: {
          content:
            `\`${anime.title.english}\` is currently not airing any episodes.`,
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
    if (err?.response?.status === 404 || err?.message === '404') {
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

async function translate(
  { search, lang }: { search: string; lang: 'english' | 'romaji' | 'native' },
) {
  try {
    const results = await anilist.search({ search, page: 1 });

    if (!results.media.length) {
      throw new Error('404');
    }

    return json({
      type: NEW_MESSAGE,
      data: {
        content: `${results.media[0].title[lang]}`,
      },
    });
  } catch (err) {
    if (err?.response?.status === 404 || err?.message === '404') {
      return json({
        type: NEW_MESSAGE,
        data: {
          content: `Found nothing matching that name!`,
        },
      });
    }

    return json({ errors: err.errors }, { status: err.response.status });
  }
}

serve(handler);
