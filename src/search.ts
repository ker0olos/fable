import utils from './utils.ts';

import { Rating } from './ratings.ts';

import { Character, Format, Media, RelationType } from './types.ts';

import * as discord from './discord.ts';

import * as anilist from '../repos/anilist/index.ts';

export async function media(
  { id, search, debug }: {
    id?: number;
    search?: string;
    debug: boolean;
  },
  prioritize?: 'anime' | 'manga',
): Promise<discord.Message> {
  if (typeof (id = utils.parseId(search!)) === 'number') {
    search = undefined;
  }

  const media = await anilist.media(
    id ? { id } : { search },
    prioritize,
  ) as Media | undefined;

  if (!media) {
    throw new Error('404');
  }

  if (debug) {
    return new discord.Message().addEmbed(mediaDebugEmbed(media));
  }

  const titles = utils.titlesToArray(media);

  const message = new discord.Message();

  message.addEmbed(
    new discord.Embed()
      .setTitle(titles.shift()!)
      .setAuthor({ name: utils.capitalize(media.type!) })
      .setDescription(media.description)
      .setColor(media.coverImage?.color)
      .setImage({ url: media.coverImage?.extraLarge })
      .setFooter({ text: media.title!.native }),
  );

  media.characters?.edges!.slice(0, 2).forEach((character) => {
    const embed = new discord.Embed()
      .setTitle(character.node!.name!.full)
      .setDescription(character.node!.description)
      .setColor(media?.coverImage?.color)
      .setThumbnail({ url: character.node!.image?.large })
      .setFooter(
        {
          text: [
            character.node!.gender,
            character.node!.age,
          ].filter(Boolean).join(', '),
        },
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

    const label = utils.titlesToArray(relation.node, 60)[0];

    switch (relation.relationType) {
      case RelationType.PREQUEL:
      case RelationType.SEQUEL:
      case RelationType.SIDE_STORY:
      case RelationType.SPIN_OFF: {
        component
          .setLabel(
            `${label} (${utils.capitalize(relation.relationType!)})`,
          ).setId(
            `media:${relation.node.id!}`,
          );
        secondaryGroup.push(component);
        break;
      }
      case RelationType.ADAPTATION: {
        component
          .setLabel(
            `${label} (${utils.capitalize(relation.node.format!)})`,
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
          .setUrl(relation.node.externalLinks?.[0]?.url!);

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

function mediaDebugEmbed(media: Media) {
  const titles = utils.titlesToArray(media);

  return new discord.Embed()
    .setTitle(titles.shift()!)
    .setDescription(titles.join('\n'))
    .addField({ name: 'Id', value: `${media.id}` })
    .addField({
      name: 'Type',
      value: `${utils.capitalize(media.type!)}`,
      inline: true,
    })
    .addField({
      name: 'Format',
      value: `${utils.capitalize(media.format!)}`,
      inline: true,
    })
    .addField({
      name: 'Popularity',
      value: `${utils.comma(media.popularity!)}`,
      inline: true,
    })
    .setThumbnail({ url: media.coverImage?.large });
}

export async function character(
  { id, search, debug }: {
    id?: number;
    search?: string;
    debug: boolean;
  },
): Promise<discord.Message> {
  if (typeof (id = utils.parseId(search!)) === 'number') {
    search = undefined;
  }

  const character = await anilist.character(id ? { id } : { search });

  if (!character) {
    throw new Error('404');
  }

  if (debug) {
    return new discord.Message().addEmbed(characterDebugEmbed(character));
  }

  const message = new discord.Message()
    .addEmbed(
      new discord.Embed()
        .setTitle(character.name!.full)
        .setDescription(character.description)
        .setImage({ url: character.image?.large })
        .setFooter(
          {
            text: [
              character.gender,
              character!.age,
            ].filter(Boolean).join(', '),
          },
        ),
    );

  const group: discord.Component[] = [];

  character.media?.edges?.forEach((relation) => {
    const label = utils.titlesToArray(relation.node, 60)[0];

    const component = new discord.Component()
      .setStyle(discord.ButtonStyle.Grey)
      .setLabel(
        `${label} (${utils.capitalize(relation.node.format!)})`,
      ).setId(
        `media:${relation.node.id!}`,
      );

    group.push(component);
  });

  message.addComponents(group);

  return message;
}

function characterDebugEmbed(character: Character) {
  const media = character.media!.edges![0].node;

  const role = character.media!.edges![0].characterRole;
  const rating = new Rating(role, media.popularity!);

  return new discord.Embed()
    .setTitle(character.name!.full)
    .setDescription(character.name!.alternative?.join('\n'))
    .addField({ name: 'Id', value: `${character.id}` })
    .addField({
      name: 'Rating',
      value: rating.emotes,
    })
    .addField({
      name: 'Gender',
      value: `${character.gender}`,
      inline: true,
    })
    .addField({ name: 'Age', value: `${character.age}`, inline: true })
    .addField({ name: 'Media', value: `${media.id}`, inline: true })
    .addField({
      name: 'Role',
      value: `${utils.capitalize(role)}`,
      inline: true,
    })
    .addField({
      name: 'Type',
      value: `${utils.capitalize(media.type!)}`,
      inline: true,
    })
    .addField({
      name: 'Format',
      value: `${utils.capitalize(media.format!)}`,
      inline: true,
    })
    .addField({
      name: 'Popularity',
      value: `${utils.comma(media.popularity!)}`,
      inline: true,
    })
    .setThumbnail({ url: character.image?.large });
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
          (relation.node.title!.english || relation.node.title!.romaji ||
            relation.node.title!.native)!,
        )
        .setUrl(relation.node.externalLinks?.shift()?.url!);

      message.addComponents([component]);
    }
  });

  if (message.components() <= 0) {
    throw new Error('404');
  }

  return message;
}
