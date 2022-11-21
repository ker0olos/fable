import { json } from '../index.ts';

import { capitalize } from '../utils.ts';

import * as discord from './discord.ts';
import * as anilist from './api.ts';

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

    const titles = [
      media.title.english,
      media.title.romaji,
      media.title.native,
    ].filter(Boolean);

    const message: discord.Message = new discord.Message(
      discord.MESSAGE_TYPE.NEW,
    );

    message.addEmbed(
      new discord.Embed()
        .setTitle(titles.shift()!)
        .setAuthor(capitalize(media.type!))
        .setDescription(media.description)
        .setColor(media.coverImage?.color)
        .setImage(
          media.coverImage?.extraLarge,
        )
        .setFooter(titles.join(' - ')),
    );

    media.characters?.edges.slice(0, 2).forEach((character) => {
      const embed = new discord.Embed()
        .setTitle(character.node.name.full)
        .setDescription(character.node.description)
        .setColor(media.coverImage?.color)
        .setThumbnail(character.node.image?.large)
        .setFooter(
          [
            character.node.age,
            character.node.gender,
          ].filter(Boolean).join(' '),
        );

      message.addEmbed(embed);
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

    return json(message.done());
  } catch (err) {
    if (err?.response?.status === 404 || err?.message === '404') {
      return json(JSON.stringify({
        type: discord.MESSAGE_TYPE.NEW,
        data: {
          content: 'Found nothing matching that name!',
        },
      }));
    }

    return json(JSON.stringify({
      type: discord.MESSAGE_TYPE.NEW,
      data: {
        content: JSON.stringify(err),
      },
    }));
  }
}
