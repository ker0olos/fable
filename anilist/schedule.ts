import {
  json,
} from 'https://raw.githubusercontent.com/ker0olos/bots/main/index.ts';

import * as anilist from './api.ts';

export async function nextEpisode({ search }: { search: string }) {
  try {
    const anime = await anilist.getNextAiring({ search });

    if (!anime.nextAiringEpisode?.airingAt || !anime.title?.english) {
      return json({
        type: anilist.MESSAGE_TYPE.NEW,
        data: {
          content:
            `\`${anime.title.english}\` is currently not airing any episodes.`,
        },
      });
    }

    const response: anilist.Response = {
      type: anilist.MESSAGE_TYPE.NEW,
      data: {
        content:
          `The next episode of \`${anime.title.english}\` is <t:${anime.nextAiringEpisode.airingAt}:R>.`,
      },
    };

    return json(response);
  } catch (err) {
    if (err?.response?.status === 404 || err?.message === '404') {
      return json({
        type: anilist.MESSAGE_TYPE.NEW,
        data: {
          content: `Found no anime matching that name!`,
        },
      });
    }

    return json({
      type: anilist.MESSAGE_TYPE.NEW,
      data: {
        content: JSON.stringify(err),
      },
    });
  }
}
