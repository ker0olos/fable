import { capitalize } from '../utils.ts';

import * as discord from '../discord.ts';

import * as anilist from './api.ts';

const embedCharacter = (
  media?: anilist.Media,
  character?: anilist.Character,
) =>
  new discord.Embed()
    .setTitle(character!.name.full)
    .setDescription(character!.description)
    .setColor(media?.coverImage?.color)
    .setThumbnail(character!.image?.large)
    .setFooter(
      [
        character!.age,
        character!.gender,
      ].filter(Boolean).join(' '),
    );

export async function search(
  { id, search }: {
    id?: number;
    search?: string;
  },
) {
  const { media, character } = await anilist.search(id ? { id } : { search });

  if (!media && !character) {
    throw new Error('404');
  }

  const titles = [
    media?.title.english,
    media?.title.romaji,
    media?.title.native,
  ].filter(Boolean);

  const message = new discord.Message();

  // const characterExactMatch = [
  //   character?.name.full,
  //   character?.name.native!,
  //   ...character?.name.alternative!,
  //   ...character?.name.alternativeSpoiler!,
  // ].some((name) => name!.toLowerCase() === search?.toLowerCase());

  // const mediaExactMatch = titles.some((title) =>
  //   title?.toLowerCase() === search?.toLowerCase()
  // );

  // // if search is exact match for a character's name
  // // respond with only the character embed
  // if (!mediaExactMatch && characterExactMatch) {
  //   const embed = embedCharacter(media, character);

  //   const group: discord.Component[] = [];

  //   character?.media?.nodes!.forEach((media) => {
  //     const titles = [
  //       media.title.english,
  //       media.title.romaji,
  //       media.title.native,
  //     ].filter(Boolean);

  //     const component = new discord.Component()
  //       .setStyle(discord.ButtonStyle.Grey)
  //       .setLabel(`${titles.shift()} (${capitalize(media.type)})`)
  //       .setId(
  //         `id:${media.id!}`,
  //       );

  //     group.push(component);
  //   });

  //   message.addEmbed(embed);

  //   message.addComponents(group);

  //   return message.json();
  // }

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
    const embed = embedCharacter(media, character.node);
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
  const { media } = await anilist.search({ search });

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
