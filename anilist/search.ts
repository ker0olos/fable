import {
  json,
} from 'https://raw.githubusercontent.com/ker0olos/bots/main/index.ts';

import * as anilist from './api.ts';
import { capitalize, decodeDescription, hexToInt } from './meta.ts';

// export async function nextSearchPage({ embeds }: { embeds: any[] }) {
//   const response: anilist.Response = {
//     type: anilist.MESSAGE_TYPE.UPDATE,
//     data: {
//       components: [],
//       embeds: [
//         {
//           type: 'rich',
//           title: 'Unimplemented',
//           description: JSON.stringify(embeds[0].footer),
//         },
//       ],
//     },
//   };

//   return json(response);
// }

export async function searchPage(
  { search, page }: {
    search: string;
    page: number;
  },
) {
  try {
    const results = await anilist.search({ search, page });

    if (!results.media.length) {
      throw new Error('404');
    }

    const media = results.media[0];
    const embedColorInt = hexToInt(media.coverImage?.color);

    const titles = [
      media.title.english,
      media.title.romaji,
      media.title.native,
    ].filter(Boolean);

    const response: anilist.Response = {
      type: anilist.MESSAGE_TYPE.NEW,
      data: {
        embeds: [
          {
            type: 'rich',
            title: titles.shift(),
            description: decodeDescription(media.description),
            color: embedColorInt,
            fields: [],
            image: media.coverImage?.extraLarge
              ? {
                url: media.coverImage.extraLarge,
              }
              : undefined,
            author: {
              name: capitalize(media.type!),
            },
            footer: {
              text: titles.join(' • '),
            },
          },
        ],
        // TODO
        // components: [
        //   {
        //     type: anilist.COMPONENT_TYPE.GROUP,
        //     components: [],
        //   },
        // ],
      },
    };

    media.characters?.edges.slice(0, 2).forEach((character) => {
      response.data.embeds?.push({
        type: 'rich',
        title: character.node.name.full,
        color: embedColorInt,
        description: decodeDescription(character.node.description),
        thumbnail: character.node.image?.large
          ? {
            url: character.node.image?.large,
          }
          : undefined,
        footer: {
          text: [
            character.node.age,
            character.node.gender,
          ].filter(Boolean).join(' '),
        },
      });
    });

    // if (prev) {
    //   response.data.components![0].components!.push({
    //     type: anilist.COMPONENT_TYPE.BUTTON,
    //     style: anilist.BUTTON_COLOR.GREY,
    //     custom_id: componentsIds.prevPage,
    //     label: 'Prev',
    //   });
    // }

    // if (next) {
    //   response.data.components![0].components!.push({
    //     type: anilist.COMPONENT_TYPE.BUTTON,
    //     style: anilist.BUTTON_COLOR.GREY,
    //     custom_id: componentsIds.nextPage,
    //     label: 'Next',
    //   });
    // }

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
