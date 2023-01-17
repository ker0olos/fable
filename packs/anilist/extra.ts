import * as discord from '../../src/discord.ts';

import { Status } from './types.ts';

import * as api from './api.ts';

import packs from '../../src/packs.ts';

export async function nextEpisode(
  { title }: { title: string },
  // _: discord.Interaction<unknown>,
) {
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
      message.setContent(
        `The next episode of \`${titles.shift()}\` is <t:${
          // deno-lint-ignore no-non-null-assertion
          anime.nextAiringEpisode!.airingAt}:R>.`,
      );
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
