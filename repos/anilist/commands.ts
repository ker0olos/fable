import utils from '../../src/utils.ts';

import * as discord from '../../src/discord.ts';

import { Status } from './types.ts';

import * as api from './api.ts';

export async function nextEpisode(
  { title }: { title: string },
  // _: discord.Interaction<unknown>,
) {
  const anime = await api.nextEpisode({ search: title });

  const titles = utils.titlesToArray(anime);

  const message = new discord.Message();

  switch (anime.status) {
    case Status.RELEASING:
      message.setContent(
        `The next episode of \`${titles.shift()}\` is <t:${
          anime.nextAiringEpisode!.airingAt
        }:R>.`,
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
