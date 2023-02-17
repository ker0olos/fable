import packs from './packs.ts';

import Rating from './rating.ts';

import utils from './utils.ts';

import * as discord from './discord.ts';

import {
  Character,
  DisaggregatedCharacter,
  DisaggregatedMedia,
  Media,
  MediaFormat,
  MediaRelation,
} from './types.ts';

import { NonFetalError } from './errors.ts';

const musicUrlRegex = /youtube|spotify/;
const externalUrlRegex =
  /^(https:\/\/)?(www\.)?(youtube\.com|twitch\.tv|crunchyroll\.com|tapas\.io|webtoon\.com|amazon\.com)[\S]*$/;

export async function media(
  { id, search, debug }: {
    id?: string;
    search?: string;
    debug?: boolean;
  },
): Promise<discord.Message> {
  const results: (Media | DisaggregatedMedia)[] = await packs
    .media(id ? { ids: [id] } : { search });

  if (!results.length) {
    throw new Error('404');
  }

  // aggregate the media by populating any references to other media/characters
  const media = await packs.aggregate<Media>({ media: results[0], end: 4 });

  if (debug) {
    return mediaDebugMessage(media);
  }

  return mediaMessage(media);
}

export function mediaMessage(media: Media): discord.Message {
  const titles = packs.aliasToArray(media.title);

  if (!titles?.length) {
    throw new Error('404');
  }

  const linksGroup: discord.Component[] = [];
  const musicGroup: discord.Component[] = [];

  const message = new discord.Message()
    .addEmbed(mediaEmbed(media, titles));

  // character embeds
  // sort characters by popularity
  media.characters?.edges
    ?.slice(0, 2)
    .forEach((edge) => {
      const embed = characterEmbed(edge.node, {
        mode: 'thumbnail',
      });

      message.addEmbed(embed);
    });

  if (media.trailer?.site === 'youtube') {
    const component = new discord.Component()
      .setUrl(`https://youtu.be/${media.trailer?.id}`)
      .setLabel('Trailer');

    linksGroup.push(component);
  }

  // link components
  media.externalLinks
    ?.forEach((link) => {
      if (externalUrlRegex.test(link.url)) {
        const component = new discord.Component()
          .setLabel(link.site)
          .setUrl(link.url);

        linksGroup.push(component);
      }
    });

  // view characters
  if (media?.characters?.edges.length) {
    linksGroup.push(
      new discord.Component().setLabel('View Characters').setId(
        'mcharacter',
        `${media.packId}:${media.id}`,
      ),
    );
  }

  // relation components
  // sort media by popularity
  media.relations?.edges
    ?.slice(0, 4)
    ?.forEach(({ node: media, relation }) => {
      const label = packs.mediaToString({
        media,
        relation,
      });

      // music links
      if (
        relation === MediaRelation.Other && media.format === MediaFormat.Music
      ) {
        if (
          musicGroup.length < 3 &&
          media.externalLinks?.[0]?.url &&
          musicUrlRegex.test(media.externalLinks?.[0]?.url)
        ) {
          const component = new discord.Component()
            .setLabel(label)
            .setUrl(media.externalLinks[0].url);

          musicGroup.push(component);
        }
        // relations buttons
      } else {
        const component = new discord.Component()
          .setLabel(label)
          .setId('media', `${media.packId}:${media.id}`);

        linksGroup.push(component);
      }
    });

  return message.addComponents([...linksGroup, ...musicGroup]);
}

export function mediaEmbed(media: Media, titles: string[]): discord.Embed {
  return new discord.Embed()
    .setTitle(utils.wrap(titles[0]))
    .setAuthor({ name: packs.formatToString(media.format) })
    .setDescription(utils.decodeDescription(media.description))
    .setImage({ url: media.images?.[0].url });
}

export function mediaDebugMessage(
  media: Media | DisaggregatedMedia,
): discord.Message | discord.Message {
  const titles = packs.aliasToArray(media.title);

  if (!titles?.length) {
    throw new Error('404');
  }

  const embed = new discord.Embed()
    .setTitle(titles.shift())
    .setDescription(titles.join('\n'))
    .setThumbnail({ url: media.images?.[0].url })
    .addField({ name: 'Id', value: `${media.packId}:${media.id}` })
    .addField({
      name: 'Type',
      value: `${utils.capitalize(media.type)}`,
      inline: true,
    })
    .addField({
      name: 'Format',
      value: `${utils.capitalize(media.format)}`,
      inline: true,
    })
    .addField({
      name: 'Popularity',
      value: `${utils.comma(media.popularity || 0)}`,
      inline: true,
    });

  return new discord.Message().addEmbed(embed);
}

export async function character(
  { id, search, debug }: {
    id?: string;
    search?: string;
    debug?: boolean;
  },
): Promise<discord.Message> {
  const results: (Character | DisaggregatedCharacter)[] = await packs
    .characters(id ? { ids: [id] } : { search });

  if (!results.length) {
    throw new Error('404');
  }

  // aggregate the media by populating any references to other media/character objects
  const character = await packs.aggregate<Character>({
    character: results[0],
    end: 4,
  });

  if (debug) {
    return characterDebugMessage(character);
  }

  return characterMessage(character);
}

export function characterMessage(
  character: Character | DisaggregatedCharacter,
  options?: Parameters<typeof characterEmbed>[1] & {
    externalLinks?: boolean;
    relations?: boolean | number | DisaggregatedMedia[];
  },
): discord.Message {
  options = {
    ...{
      externalLinks: true,
      relations: true,
    },
    ...options,
  };

  const message = new discord.Message()
    .addEmbed(characterEmbed(character, options));

  const group: discord.Component[] = [];

  // link components
  if (options.externalLinks) {
    character.externalLinks
      ?.forEach((link) => {
        const component = new discord.Component()
          .setLabel(link.site)
          .setUrl(link.url);

        group.push(component);
      });
  }

  let relations: (Media | DisaggregatedMedia)[] = [];

  // relation components
  // sort media by popularity
  if (Array.isArray(options.relations)) {
    relations = options.relations.slice(0, 4);
  } else if (
    options.relations && character.media && 'edges' in character.media
  ) {
    let edges = character.media.edges;

    if (typeof options.relations === 'number') {
      edges = edges.slice(0, Math.min(Math.max(options.relations, 1), 4));
    } else {
      edges = edges.slice(0, 4);
    }

    relations = edges.map(({ node }) => node);
  }

  relations.forEach((media) => {
    const label = packs.mediaToString({ media });

    const component = new discord.Component()
      .setLabel(label)
      .setId('media', `${media.packId}:${media.id}`);

    group.push(component);
  });

  return message.addComponents(group);
}

export function characterEmbed(
  character: Character | DisaggregatedCharacter,
  options?: {
    rating?: Rating;
    media?: {
      title?: boolean | string;
    };
    mode?: 'thumbnail' | 'full';
    description?: boolean;
    footer?: boolean;
  },
): discord.Embed {
  options = {
    ...{
      mode: 'full',
      description: true,
      footer: true,
    },
    ...options,
  };

  const alias = packs.aliasToArray(character.name);

  const embed = new discord.Embed();

  if (options.mode === 'full') {
    embed.setImage({ url: character.images?.[0].url });
  } else {
    embed
      .setThumbnail({ url: character.images?.[0].url });
  }

  if (options?.rating) {
    embed.setTitle(options.rating.emotes);
  }

  const description = options.mode === 'thumbnail'
    ? utils.truncate(utils.decodeDescription(character.description), 128)
    : utils.decodeDescription(character.description);

  let mediaTitle: string | undefined = undefined;

  if (typeof options.media?.title === 'string') {
    mediaTitle = options.media.title;
  } else if (
    options.media?.title && character.media && 'edges' in character.media &&
    character.media?.edges[0]
  ) {
    mediaTitle = packs.aliasToArray(
      character.media.edges[0].node.title,
    )[0];
  }

  if (mediaTitle) {
    embed.addField({
      name: utils.wrap(mediaTitle),
      value: `**${utils.wrap(alias[0])}**`,
    });

    if (options.description) {
      embed.addField({ value: description });
    }
  } else {
    embed.addField({
      name: options.description && options.mode === 'thumbnail'
        ? `${utils.wrap(alias[0])}`
        : `${utils.wrap(alias[0])}\n${discord.empty}`,
      value: options.description ? description : undefined,
    });
  }

  if (options.footer) {
    embed.setFooter(
      {
        text: [
          utils.capitalize(character.gender),
          character.age,
        ].filter(Boolean).join(', '),
      },
    );
  }

  return embed;
}

export function characterDebugMessage(character: Character): discord.Message {
  const media = character.media?.edges?.[0];

  const role = media?.role;
  const popularity = character.popularity || media?.node.popularity || 0;

  const rating = new Rating({
    popularity,
    role: character.popularity ? undefined : role,
  });

  const titles = packs.aliasToArray(character.name);

  const embed = new discord.Embed()
    .setTitle(titles.splice(0, 1)[0])
    .setDescription(titles.join('\n'))
    .setThumbnail({ url: character.images?.[0].url })
    .addField({ name: 'Id', value: `${character.packId}:${character.id}` })
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
    .addField({
      name: 'Media',
      value: `${media?.node.packId}:${media?.node.id}`,
      inline: true,
    })
    .addField({
      name: 'Role',
      value: `${utils.capitalize(role)}`,
      inline: true,
    })
    .addField({
      name: 'Popularity',
      value: `${utils.comma(popularity)}`,
      inline: true,
    });

  if (!media) {
    embed.addField({
      name: '**WARN**',
      value:
        'Character not available in gacha.\nAdd at least one media to the character.',
    });
  }

  return new discord.Message().addEmbed(embed);
}

export async function mediaCharacter(
  { mediaId, index }: {
    mediaId: string;
    index: number;
  },
): Promise<discord.Message> {
  const { character: node, media, next, total } = await packs.mediaCharacter({
    mediaId,
    index,
  });

  if (!media) {
    throw new Error('404');
  }

  const titles = packs.aliasToArray(media.title);

  if (!node) {
    throw new NonFetalError(
      index > 0
        ? `${titles[0]} contains no more characters`
        : `${titles[0]} contains no characters`,
    );
  }

  if (packs.isDisabled(`${node.packId}:${node.id}`)) {
    throw new NonFetalError('character is disabled or invalid');
  }

  const character = await packs.aggregate<Character>({
    character: node,
    end: 1,
  });

  const message = characterMessage(character, {
    relations: [media as DisaggregatedMedia],
  });

  return discord.Message.page({
    total,
    type: 'mcharacter',
    target: mediaId,
    message,
    index,
    next,
  });
}
