import { capitalize, titlesToArray } from './utils.ts';

import { Format, RelationType } from './repo.d.ts';

import * as discord from './discord.ts';

import * as anilist from '../repos/anilist/index.ts';

export async function media(
  { id, search }: {
    id?: number;
    search?: string;
  },
  prioritize?: 'anime' | 'manga',
) {
  const media = await anilist.media(id ? { id } : { search }, prioritize);

  if (!media) {
    throw new Error('404');
  }

  const titles = titlesToArray(media);

  const message = new discord.Message();

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

    const label = titlesToArray(relation.node, 60)[0];

    switch (relation.relationType) {
      case RelationType.PREQUEL:
      case RelationType.SEQUEL:
      case RelationType.SIDE_STORY:
      case RelationType.SPIN_OFF: {
        component
          .setLabel(
            `${label} (${capitalize(relation.relationType!)})`,
          ).setId(
            `media:${relation.node.id!}`,
          );
        secondaryGroup.push(component);
        break;
      }
      case RelationType.ADAPTATION: {
        component
          .setLabel(
            `${label} (${capitalize(relation.node.format!)})`,
          )
          .setId(
            `media:${relation.node.id!}`,
          );

        secondaryGroup.push(component);
        break;
      }
      default:
        break;
    }

    switch (relation.node.format) {
      case Format.MUSIC: {
        component
          .setLabel(label)
          .setUrl(relation.node.externalLinks?.[0]?.url);

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

export async function character(
  { id, search, debug }: {
    id?: number;
    search?: string;
    debug?: boolean;
  },
) {
  const character = await anilist.character(id ? { id } : { search });

  if (!character) {
    throw new Error('404');
  }

  if (debug) {
    return new discord.Message()
      .addEmbed(
        new discord.Embed()
          .setTitle(character.name.full)
          .addField('ID', `\`${character.id}\``)
          .setThumbnail(character.image?.large),
      );
  }

  const message = new discord.Message()
    .addEmbed(
      new discord.Embed()
        .setTitle(character.name.full)
        .setDescription(character.description)
        .setImage(character.image?.large)
        .setFooter(
          [
            character.gender,
            character!.age,
          ].filter(Boolean).join(', '),
        ),
    );

  const group: discord.Component[] = [];

  character.media?.edges?.forEach((relation) => {
    const label = titlesToArray(relation.node, 60)[0];

    const component = new discord.Component()
      .setStyle(discord.ButtonStyle.Grey)
      .setLabel(
        `${label} (${capitalize(relation.node.format!)})`,
      ).setId(
        `media:${relation.node.id!}`,
      );

    group.push(component);
  });

  message.addComponents(group);

  return message;
}

export async function themes(
  { search }: {
    search?: string;
  },
) {
  const media = await anilist.media({ search });

  if (!media) {
    throw new Error('404');
  }

  const message = new discord.Message();

  media.relations?.edges.forEach((relation) => {
    if (relation.node.format === Format.MUSIC) {
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
