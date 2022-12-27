import * as discord from './discord.ts';

import * as anilist from './api.ts';

export async function translate(
  { search, lang }: { search: string; lang: 'english' | 'romaji' | 'native' },
) {
  const media = await anilist.search({ search });

  if (!media) {
    throw new Error('404');
  }

  const message = new discord.Message().setContent(
    `${media?.title[lang]}`,
  );

  return message;
}
