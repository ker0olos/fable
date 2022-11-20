import {
  json,
} from 'https://raw.githubusercontent.com/ker0olos/bots/main/index.ts';

import * as anilist from './api.ts';
import { NEW_MESSAGE } from './meta.ts';

export async function nextEpisode({ search }: { search: string }) {
  try {
    const anime = await anilist.getNextAiring({ search });

    if (!anime.nextAiringEpisode?.airingAt || !anime.title?.english) {
      return json({
        type: NEW_MESSAGE,
        data: {
          content:
            `\`${anime.title.english}\` is currently not airing any episodes.`,
        },
      });
    }

    return json({
      type: NEW_MESSAGE,
      data: {
        content:
          `The next episode of \`${anime.title.english}\` is <t:${anime.nextAiringEpisode.airingAt}:R>.`,
      },
    });
  } catch (err) {
    if (err?.response?.status === 404 || err?.message === '404') {
      return json({
        type: NEW_MESSAGE,
        data: {
          content: `Found no anime matching that name!`,
        },
      });
    }

    return json({ errors: err.errors }, { status: err.response.status });
  }
}
