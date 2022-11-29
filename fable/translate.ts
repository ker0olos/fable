import * as discord from '../discord.ts';

import * as anilist from './api.ts';

export async function translate(
  { search, lang }: { search: string; lang: 'english' | 'romaji' | 'native' },
) {
  try {
    const results = await anilist.search({ search });

    if (!results.media) {
      throw new Error('404');
    }

    const message: discord.Message = new discord.Message(
      discord.MESSAGE_TYPE.NEW,
    ).setContent(`${results.media.title[lang]}`);

    return message.json();
  } catch (err) {
    if (err?.response?.status === 404 || err?.message === '404') {
      if (err?.response?.status === 404 || err?.message === '404') {
        return discord.Message.error('Found nothing matching that name!');
      }
    }
    return discord.Message.error(err);
  }
}
