import { json } from '../index.ts';

import * as discord from './discord.ts';
import * as anilist from './api.ts';

export async function translate(
  { search, lang }: { search: string; lang: 'english' | 'romaji' | 'native' },
) {
  try {
    const results = await anilist.search({ search, page: 1 });

    if (!results.media.length) {
      throw new Error('404');
    }

    const message: discord.Message = new discord.Message(
      discord.MESSAGE_TYPE.NEW,
    ).setContent(`${results.media[0].title[lang]}`);

    return json(message.done());
  } catch (err) {
    if (err?.response?.status === 404 || err?.message === '404') {
      return json(JSON.stringify({
        type: discord.MESSAGE_TYPE.NEW,
        data: {
          content: `Found nothing matching that name!`,
        },
      }));
    }

    return json(JSON.stringify({
      type: discord.MESSAGE_TYPE.NEW,
      data: {
        content: JSON.stringify(err),
      },
    }));
  }
}
