import { json } from '../index.ts';

import { capitalize } from '../utils.ts';

import * as discord from '../discord.ts';

import * as anilist from './api.ts';

export async function searchPage(
  { id, search }: {
    id?: number;
    search?: string;
  },
  type = discord.MESSAGE_TYPE.NEW,
) {
  try {
    const results = await anilist.search(id ? { id } : { search });

    if (!results.media.length) {
      throw new Error('404');
    }

    const media = results.media[0];

    const titles = [
      media.title.english,
      media.title.romaji,
      media.title.native,
    ].filter(Boolean);

    const message: discord.Message = new discord.Message(type);

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

    const main_group: discord.Component[] = [];
    const secondary_group: discord.Component[] = [];
    const additional_group: discord.Component[] = [];

    if (media.trailer?.site === 'youtube') {
      const component = new discord.Component()
        .setLabel('Trailer')
        .setUrl(`https://www.youtube.com/watch?v=${media.trailer?.id}`);

      main_group.push(component);
    }

    media.externalLinks?.forEach((link) => {
      if (link.site !== 'Crunchyroll') {
        return;
      }

      const component = new discord.Component()
        .setLabel(link.site)
        .setUrl(link.url);

      main_group.push(component);
    });

    media.relations?.edges.toReversed().forEach((relation) => {
      const component = new discord.Component()
        .setStyle(discord.BUTTON_COLOR.GREY);

      switch (relation.relationType) {
        case anilist.RELATION_TYPE.PREQUEL:
        case anilist.RELATION_TYPE.SEQUEL:
        case anilist.RELATION_TYPE.SIDE_STORY:
        case anilist.RELATION_TYPE.SPIN_OFF:
          component
            .setLabel(capitalize(relation.relationType!))
            .setId(
              `id:${relation.node.id!}`,
            );
          secondary_group.push(component);
          break;
        case anilist.RELATION_TYPE.ADAPTATION:
          component
            .setLabel(capitalize(relation.node.type!))
            .setId(
              `id:${relation.node.id!}`,
            );
          secondary_group.push(component);
          break;
        default:
          break;
      }

      switch (relation.node.format) {
        case anilist.FORMAT.MUSIC:
          component
            .setLabel(
              (relation.node.title.english || relation.node.title.romaji ||
                relation.node.title.native)!,
            )
            .setUrl(relation.node.externalLinks?.shift()?.url!);
          additional_group.push(component);
          break;
        default:
          break;
      }
    });

    message.addComponent(
      ...[
        ...main_group,
        ...secondary_group,
        ...additional_group,
      ].slice(0, 5).toReversed(),
    );

    return json(message.done());
  } catch (err) {
    if (err?.response?.status === 404 || err?.message === '404') {
      return json(JSON.stringify({
        type,
        data: {
          content: 'Found nothing matching that name!',
        },
      }));
    }

    return json(JSON.stringify({
      type,
      data: {
        content: JSON.stringify(err),
      },
    }));
  }
}
