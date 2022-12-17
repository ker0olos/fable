import * as discord from '../discord.ts';

import * as anilist from './api.ts';

export async function nextEpisode({ search }: { search: string }) {
  const anime = await anilist.getNextAiring({ search });

  const titles = [
    anime.title.english,
    anime.title.romaji,
    anime.title.native,
  ].filter(Boolean);

  const message = new discord.Message();

  switch (anime.status) {
    case anilist.STATUS.RELEASING:
      message.setContent(
        `The next episode of \`${titles.shift()}\` is <t:${
          anime.nextAiringEpisode!.airingAt
        }:R>.`,
      );
      break;
    case anilist.STATUS.NOT_YET_RELEASED:
      message.setContent(
        `\`${titles.shift()}\` is coming soon.`,
      );
      break;
    case anilist.STATUS.HIATUS:
      message.setContent(
        `\`${titles.shift()}\` is taking a short break.`,
      );
      break;
    case anilist.STATUS.FINISHED:
    case anilist.STATUS.CANCELLED:
      message.setContent(
        `Unfortunately, \`${titles.shift()}\` has already aired its final episode.`,
      );
      break;
    default:
      throw new Error('404');
  }

  return message.json();
}
