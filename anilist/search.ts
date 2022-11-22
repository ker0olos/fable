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

    const mainGroup: discord.Component[] = [];
    const secondaryGroup: discord.Component[] = [];
    const additionalGroup: discord.Component[] = [];

    if (media.trailer?.site === 'youtube') {
      const component = new discord.Component()
        .setLabel('Trailer')
        .setUrl(`https://www.youtube.com/watch?v=${media.trailer?.id}`);

      mainGroup.push(component);
    }

    media.externalLinks?.forEach((link) => {
      if (link.site !== 'Crunchyroll') {
        return;
      }

      const component = new discord.Component()
        .setLabel(link.site)
        .setUrl(link.url);

      mainGroup.push(component);
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
          secondaryGroup.push(component);
          break;
        case anilist.RELATION_TYPE.ADAPTATION:
          component
            .setLabel(capitalize(relation.node.type!))
            .setId(
              `id:${relation.node.id!}`,
            );
          secondaryGroup.push(component);
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

          additionalGroup.push(component);
          break;
        default:
          break;
      }
    });

    message.addComponent(
      ...[
        ...mainGroup,
        ...secondaryGroup,
        ...additionalGroup,
      ],
    );

    return message.json();
  } catch (err) {
    if (err?.response?.status === 404 || err?.message === '404') {
      return discord.Message.error('Found no anime matching that name!');
    }
    return discord.Message.error(err);
  }
}

export async function songs(
  { search }: {
    search?: string;
  },
  type = discord.MESSAGE_TYPE.NEW,
) {
  try {
    const results = await anilist.search({ search });

    if (!results.media.length) {
      throw new Error('404');
    }

    const media = results.media[0];

    const message: discord.Message = new discord.Message(type);

    media.relations?.edges.forEach((relation) => {
      if (relation.node.format === anilist.FORMAT.MUSIC) {
        const component = new discord.Component()
          .setLabel(
            (relation.node.title.english || relation.node.title.romaji ||
              relation.node.title.native)!,
          )
          .setUrl(relation.node.externalLinks?.shift()?.url!);

        message.addComponent(component);
      }
    });

    if (message._data.components.length <= 0) {
      return discord.Message.error('Couldn\'t find any songs for that anime!');
    }

    return message.json();
  } catch (err) {
    if (err?.response?.status === 404 || err?.message === '404') {
      return discord.Message.error('Found no anime matching that name!');
    }
    return discord.Message.error(err);
  }
}
