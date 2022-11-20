import {
  json,
} from 'https://raw.githubusercontent.com/ker0olos/bots/main/index.ts';

import * as anilist from './api.ts';
import { NEW_MESSAGE } from './meta.ts';

export async function translate(
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

    return json({
      type: NEW_MESSAGE,
      data: {
        content: JSON.stringify(err),
      },
    });
  }
}
