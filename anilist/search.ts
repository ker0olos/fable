import { capitalize } from '../utils.ts';

import * as discord from '../discord.ts';

import * as anilist from './api.ts';

function embedCharacter(media: anilist.Media, character: anilist.Character) {
  const embed = new discord.Embed()
    .setTitle(character.name.full)
    .setDescription(character.description)
    .setColor(media.coverImage?.color)
    .setThumbnail(character.image?.large)
    .setFooter(
      [
        character.age,
        character.gender,
      ].filter(Boolean).join(' '),
    );
  return embed;
}

export async function search(
  { id, search }: {
    id?: number;
    search?: string;
  },
  type = discord.MESSAGE_TYPE.NEW,
) {
  try {
    const { media, character } = await anilist.search(id ? { id } : { search });

    if (!media && !character) {
      throw new Error('404');
    }

    const titles = [
      media.title.english,
      media.title.romaji,
      media.title.native,
    ].filter(Boolean);

    const message: discord.Message = new discord.Message(type);

    const characterExactMatch = [
      character.name.full,
      character.name.native ?? '',
      ...character.name.alternative ?? [],
      ...character.name.alternativeSpoiler ?? [],
    ].some((name) => name === search);

    const mediaExactMatch = titles.some((title) => title === search);

    // if search is exact match for a character's name
    // respond with only the character embed
    if (!mediaExactMatch && characterExactMatch) {
      const embed = embedCharacter(media, character);

      const group: discord.Component[] = [];

      character?.media?.nodes.forEach((media) => {
        const titles = [
          media.title.english,
          media.title.romaji,
          media.title.native,
        ].filter(Boolean);

        const component = new discord.Component()
          .setStyle(discord.BUTTON_COLOR.GREY)
          .setLabel(`${titles.shift()} (${capitalize(media.type)})`)
          .setId(
            `id:${media.id!}`,
          );

        group.push(component);
      });

      message.addEmbed(embed);

      message.addComponents(group);

      return message.json();
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
        .setFooter(titles.join(' - ')),
    );

    media.characters?.edges.slice(0, 2).forEach((character) => {
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
        .setStyle(discord.BUTTON_COLOR.GREY);

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
            .setLabel(capitalize(relation.node.type!))
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
    const { media } = await anilist.search({ search });

    if (!media) {
      throw new Error('404');
    }

    const message: discord.Message = new discord.Message(type);

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

console.log(await search({ search: 'chainsaw' }));
