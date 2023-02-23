import * as discord from '../../src/discord.ts';

import { Status } from './types.ts';

import * as api from './api.ts';

import packs from '../../src/packs.ts';

export async function nextEpisode(
  { title }: { title: string },
  // _: discord.Interaction<unknown>,
): Promise<discord.Message> {
  const anime = await api.nextEpisode({ search: title });

  const titles = packs.aliasToArray({
    english: anime.title?.english,
    romaji: anime.title?.romaji,
    native: anime.title?.native,
  });

  if (!titles.length) {
    throw new Error('404');
  }

  const message = new discord.Message();

  switch (anime.status) {
    case Status.RELEASING:
      if (anime.nextAiringEpisode?.airingAt) {
        message.setContent(
          `The next episode of \`${titles.shift()}\` is <t:${anime.nextAiringEpisode.airingAt}:R>.`,
        );
      } else {
        message.setContent(
          `\`${titles.shift()}\` is releasing new episodes but we can't figure out when the next episode will be.`,
        );
      }
      break;
    case Status.NOT_YET_RELEASED:
      message.setContent(
        `\`${titles.shift()}\` is coming soon.`,
      );
      break;
    case Status.HIATUS:
      message.setContent(
        `\`${titles.shift()}\` is taking a short break.`,
      );
      break;
    case Status.FINISHED:
    case Status.CANCELLED:
      message.setContent(
        `Unfortunately, \`${titles.shift()}\` has already aired its final episode.`,
      );
      break;
    default:
      throw new Error('404');
  }

  return message;
}
