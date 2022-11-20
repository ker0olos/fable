import {
  json,
} from 'https://raw.githubusercontent.com/ker0olos/bots/main/index.ts';

import * as anilist from './api.ts';
import { componentsIds, hexToInt } from './meta.ts';

// deno-lint-ignore no-explicit-any
export async function nextSearchPage({ embeds }: { embeds: any[] }) {
  const response: anilist.Response = {
    type: anilist.MESSAGE_TYPE.UPDATE,
    data: {
      components: [],
      embeds: [
        {
          type: 'rich',
          title: 'Unimplemented',
          description: JSON.stringify(embeds[0].footer),
        },
      ],
    },
  };

  return json(response);
}

export async function searchPage(
  { search, page, next, prev }: {
    search: string;
    page: number;
    next: boolean;
    prev: boolean;
  },
) {
  try {
    const results = await anilist.search({ search, page });

    if (!results.media.length) {
      throw new Error('404');
    }

    const media = results.media[0];
    const embedColorInt = hexToInt(media.coverImage?.color);

    const response: anilist.Response = {
      type: anilist.MESSAGE_TYPE.NEW,
      data: {
        embeds: [
          {
            type: 'rich',
            title: media.title.english,
            description: media.description?.replaceAll('<br>', '\n'),
            color: embedColorInt,
            fields: [/**2 Main Characters*/],
            image: media.coverImage?.extraLarge
              ? {
                url: media.coverImage.extraLarge,
              }
              : undefined,
            footer: {
              text: [
                media.title.romaji,
                media.title.native,
              ].filter(Boolean).join(' - '),
            },
          },
        ],
        components: [
          {
            type: 1,
            components: [/** Next and Prev Buttons */],
          },
        ],
      },
    };

    media.characters?.edges.slice(0, 2).forEach((char) => {
      response.data.embeds?.push({
        type: 'rich',
        color: embedColorInt,
        title: '**MAIN**',
        description: char.node.name.full,
        thumbnail: char.node.image?.large
          ? {
            url: char.node.image?.large,
          }
          : undefined,
      });
    });

    if (prev) {
      response.data.components![0].components!.push({
        type: 2,
        style: 4,
        custom_id: componentsIds.prevPage,
        label: 'Prev',
      });
    }

    if (next) {
      response.data.components![0].components!.push({
        type: 2,
        style: 4,
        custom_id: componentsIds.nextPage,
        label: 'Next',
      });
    }

    return json(response);
  } catch (err) {
    if (err?.response?.status === 404 || err?.message === '404') {
      return json({
        type: anilist.MESSAGE_TYPE.NEW,
        data: {
          content: 'Found nothing matching that name!',
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
