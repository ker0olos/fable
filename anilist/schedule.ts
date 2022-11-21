import { json } from '../index.ts';

import * as discord from '../discord.ts';

import * as anilist from './api.ts';

export async function nextEpisode({ search }: { search: string }) {
  try {
    const anime = await anilist.getNextAiring({ search });

    const titles = [
      anime.title.english,
      anime.title.romaji,
      anime.title.native,
    ].filter(Boolean);

    const message: discord.Message = new discord.Message(
      discord.MESSAGE_TYPE.NEW,
    );

    switch (anime.status) {
      case 'RELEASING':
        message.setContent(
          `The next episode of \`${titles.shift()}\` is <t:${
            anime.nextAiringEpisode!.airingAt
          }:R>.`,
        );
        break;
      case 'NOT_YET_RELEASED':
        message.setContent(
          `\`${titles.shift()}\` is coming soon.`,
        );
        break;
      case 'HIATUS':
        message.setContent(
          `\`${titles.shift()}\` is taking a short break.`,
        );
        break;
      case 'FINISHED':
      case 'CANCELLED':
        message.setContent(
          `Unfortunately, \`${titles.shift()}\` has already aired its final episode.`,
        );
        break;
      default:
        throw new Error('404');
    }

    return json(message.done());
  } catch (err) {
    if (err?.response?.status === 404 || err?.message === '404') {
      return json(discord.Message.error('Found no anime matching that name!'));
    }

    return json(discord.Message.error(err));
  }
}
