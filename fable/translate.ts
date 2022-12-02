import * as discord from '../discord.ts';

import * as anilist from './api.ts';

export async function translate(
  { search, lang }: { search: string; lang: 'english' | 'romaji' | 'native' },
) {
  const results = await anilist.search({ search });

  if (!results.media) {
    throw new Error('404');
  }

  const message: discord.Message = new discord.Message(
    discord.MESSAGE_TYPE.NEW,
  ).setContent(`${results.media.title[lang]}`);

  return message.json();
}
