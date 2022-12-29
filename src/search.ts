import { capitalize } from './utils.ts';

import * as discord from './discord.ts';

import * as anilist from './anilist.ts';

export async function search(
  { id, search }: {
    id?: number;
    search?: string;
  },
) {
  const media = await anilist.search(id ? { id } : { search });

  if (!media) {
    throw new Error('404');
  }

  const titles = anilist.titles(media);

  const message = new discord.Message();

  if (!media) {
    throw new Error('404');
  }

  message.addEmbed(
    new discord.Embed()
      .setTitle(titles.shift()!)
      .setAuthor(capitalize(media.type!))
      .setDescription(media.description)
      .setColor(media.coverImage?.color)
      .setImage(
        media.coverImage?.extraLarge,
      )
      .setFooter(media.title.native),
  );

  media.characters?.edges!.slice(0, 2).forEach((character) => {
    const embed = new discord.Embed()
      .setTitle(character.node!.name.full)
      .setDescription(character.node!.description)
      .setColor(media?.coverImage?.color)
      .setThumbnail(character.node!.image?.large)
      .setFooter(
        [
          character.node!.gender,
          character.node!.age,
        ].filter(Boolean).join(', '),
      );

    message.addEmbed(embed);
  });

  const mainGroup: discord.Component[] = [];
  const secondaryGroup: discord.Component[] = [];
  const additionalGroup: discord.Component[] = [];

  if (media.trailer?.site === 'youtube') {
    const component = new discord.Component()
      .setUrl(`https://youtu.be/${media.trailer?.id}`)
      .setLabel('Trailer');

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

  media.relations?.edges.forEach((relation) => {
    const component = new discord.Component()
      .setStyle(discord.ButtonStyle.Grey);

    switch (relation.relationType) {
      case anilist.RELATION_TYPE.PREQUEL:
      case anilist.RELATION_TYPE.SEQUEL:
      case anilist.RELATION_TYPE.SIDE_STORY:
      case anilist.RELATION_TYPE.SPIN_OFF: {
        component
          .setLabel(capitalize(relation.relationType!))
          .setId(
            `id:${relation.node.id!}`,
          );
        secondaryGroup.push(component);
        break;
      }
      case anilist.RELATION_TYPE.ADAPTATION: {
        component
          .setLabel(capitalize(relation.node.format!))
          .setId(
            `id:${relation.node.id!}`,
          );

        secondaryGroup.push(component);
        break;
      }
      default:
        break;
    }

    switch (relation.node.format) {
      case anilist.FORMAT.MUSIC: {
        component
          .setLabel(
            (relation.node.title.english || relation.node.title.romaji ||
              relation.node.title.native)!,
          )
          .setUrl(relation.node.externalLinks?.shift()?.url!);

        additionalGroup.push(component);
        break;
      }
      default:
        break;
    }
  });

  message.addComponents(mainGroup);
  message.addComponents(secondaryGroup);
  message.addComponents(additionalGroup);

  return message;
}

export async function songs(
  { search }: {
    search?: string;
  },
) {
  const media = await anilist.search({ search });

  if (!media) {
    throw new Error('404');
  }

  const message = new discord.Message();

  media.relations?.edges.forEach((relation) => {
    if (relation.node.format === anilist.FORMAT.MUSIC) {
      const component = new discord.Component()
        .setLabel(
          (relation.node.title.english || relation.node.title.romaji ||
            relation.node.title.native)!,
        )
        .setUrl(relation.node.externalLinks?.shift()?.url!);

      message.addComponents([component]);
    }
  });

  if (message._data.components.length <= 0) {
    throw new Error('404');
  }

  return message;
}
