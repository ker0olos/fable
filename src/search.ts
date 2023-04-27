import packs from './packs.ts';

import Rating from './rating.ts';

import utils from './utils.ts';

import user from './user.ts';

import * as discord from './discord.ts';

import { gql, request } from './graphql.ts';

import config, { faunaUrl } from './config.ts';

import {
  Character,
  DisaggregatedCharacter,
  DisaggregatedMedia,
  Media,
  MediaFormat,
  MediaRelation,
  Schema,
} from './types.ts';

import { NonFetalError } from './errors.ts';

export const idPrefix = 'id=';

const musicUrlRegex = /youtube|spotify/;

const externalUrlRegex =
  /^(https:\/\/)?(www\.)?(youtube\.com|twitch\.tv|crunchyroll\.com|tapas\.io|webtoon\.com|amazon\.com)[\S]*$/;

function media(
  { token, id, search, debug, guildId, channelId }: {
    token: string;
    id?: string;
    search?: string;
    debug?: boolean;
    guildId: string;
    channelId: string;
  },
): discord.Message {
  packs
    .media(id ? { ids: [id], guildId } : { search, guildId })
    .then((results: (Media | DisaggregatedMedia)[]) => {
      if (!results.length) {
        throw new Error('404');
      }

      return packs.aggregate<Media>({
        guildId,
        media: results[0],
        end: 4,
      });
    })
    .then(async (media) => {
      if (debug) {
        return await mediaDebugMessage(media, channelId)
          .patch(token);
      }

      return await mediaMessage(media, channelId)
        .patch(token);
    })
    .catch(async (err) => {
      if (err.message === '404') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              'Found _nothing_ matching that query!',
            ),
          ).patch(token);
      }

      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  const loading = new discord.Message()
    .addEmbed(
      new discord.Embed().setImage(
        { url: `${config.origin}/assets/spinner.gif` },
      ),
    );

  return loading;
}

function mediaMessage(media: Media, channelId: string): discord.Message {
  const titles = packs.aliasToArray(media.title);

  if (!titles?.length) {
    throw new Error('404');
  }

  const linksGroup: discord.Component[] = [];
  const musicGroup: discord.Component[] = [];

  const message = new discord.Message()
    .addEmbed(mediaEmbed(media, channelId, titles));

  // character embeds
  // sort characters by popularity
  media.characters?.edges
    ?.slice(0, 2)
    .forEach((edge) => {
      const embed = characterEmbed(edge.node, channelId, {
        mode: 'thumbnail',
        rating: false,
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
        'mcharacters',
        `${media.packId}:${media.id}`,
        '0',
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

function mediaEmbed(
  media: Media,
  channelId: string,
  titles: string[],
): discord.Embed {
  return new discord.Embed()
    .setTitle(utils.wrap(titles[0]))
    .setAuthor({ name: packs.formatToString(media.format) })
    .setDescription(utils.decodeDescription(media.description))
    .setImage({
      url: media.images?.[0]?.url,
      blur: media.images?.[0]?.nsfw && !packs.cachedChannels[channelId]?.nsfw,
    });
}

function mediaDebugMessage(
  media: Media | DisaggregatedMedia,
  channelId: string,
): discord.Message | discord.Message {
  const titles = packs.aliasToArray(media.title);

  if (!titles?.length) {
    throw new Error('404');
  }

  const embed = new discord.Embed()
    .setTitle(titles.shift())
    .setDescription(titles.join('\n'))
    .setThumbnail({
      url: media.images?.[0]?.url,
      blur: media.images?.[0]?.nsfw && !packs.cachedChannels[channelId]?.nsfw,
    })
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

function character(
  { token, guildId, channelId, search, id, debug }: {
    token: string;
    channelId: string;
    guildId: string;
    id?: string;
    search?: string;
    debug?: boolean;
  },
): discord.Message {
  packs
    .characters(id ? { ids: [id], guildId } : { search, guildId })
    .then((results: (Character | DisaggregatedCharacter)[]) => {
      if (!results.length) {
        throw new Error('404');
      }

      return Promise.all([
        // aggregate the media by populating any references to other media/character objects
        packs.aggregate<Character>({
          guildId,
          character: results[0],
          end: 4,
        }),
        // find if the character is owned
        user.findCharacter({
          guildId,
          characterId: `${results[0].packId}:${results[0].id}`,
        }),
      ]);
    })
    .then(async ([character, existing]) => {
      if (debug) {
        return await characterDebugMessage(character, channelId)
          .patch(token);
      }

      const message = characterMessage(character, channelId, {
        existing,
      });

      message.insertComponents([
        new discord.Component()
          .setLabel('/like')
          .setId(`like`, `${character.packId}:${character.id}`),
      ]);

      return await message.patch(token);
    })
    .catch(async (err) => {
      if (err.message === '404') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              'Found _nothing_ matching that query!',
            ),
          ).patch(token);
      }

      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  const loading = new discord.Message()
    .addEmbed(
      new discord.Embed().setImage(
        { url: `${config.origin}/assets/spinner.gif` },
      ),
    );

  return loading;
}

function characterMessage(
  character: Character | DisaggregatedCharacter,
  channelId: string,
  options?: Parameters<typeof characterEmbed>[2] & {
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
    .addEmbed(characterEmbed(character, channelId, options));

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

function characterEmbed(
  character: Character | DisaggregatedCharacter,
  channelId: string,
  options?: {
    existing?: Partial<Schema.Character>;
    rating?: Rating | boolean;
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
      rating: true,
      description: true,
      footer: true,
    },
    ...options,
  };

  const embed = new discord.Embed();

  const image = options.existing?.image
    ? { url: options.existing?.image }
    : character.images?.[0];

  const alias = options.existing?.nickname ??
    packs.aliasToArray(character.name)[0];

  if (options.mode === 'full') {
    embed.setImage({
      url: image?.url,
      blur: image?.nsfw &&
        !packs.cachedChannels[channelId]?.nsfw,
    });
  } else {
    embed.setThumbnail({
      url: image?.url,
      blur: image?.nsfw &&
        !packs.cachedChannels[channelId]?.nsfw,
    });
  }

  if (options?.existing?.rating) {
    // FIXME #63 Media Conflict

    const rating = new Rating({ stars: options.existing.rating });

    if (options.existing.user?.id) {
      embed.setDescription(
        `<@${options.existing.user.id}>\n\n${rating.emotes}`,
      );
    }
  } else if (options?.rating) {
    if (typeof options.rating === 'boolean' && options.rating) {
      options.rating = Rating.fromCharacter(character);
    }

    embed.setDescription(options.rating.emotes);
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
      value: `**${utils.wrap(alias)}**`,
    });

    if (options.description && description) {
      embed.addField({ value: description });
    }
  } else {
    embed.addField({
      name: options.description && options.mode === 'thumbnail' || !description
        ? `${utils.wrap(alias)}`
        : `${utils.wrap(alias)}\n${discord.empty}`,
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

function characterDebugMessage(
  character: Character,
  channelId: string,
): discord.Message {
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
    .setThumbnail({
      url: character.images?.[0]?.url,
      blur: character.images?.[0]?.nsfw &&
        !packs.cachedChannels[channelId]?.nsfw,
    })
    .addField({ name: 'Id', value: `${character.packId}:${character.id}` })
    .addField({
      name: 'Rating',
      value: `${rating.stars}*`,
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

async function mediaCharacters(
  { search, id, guildId, channelId, index }: {
    search?: string;
    id?: string;
    guildId: string;
    channelId: string;
    index: number;
  },
): Promise<discord.Message> {
  const list = await packs.all({ guildId });

  const { character: node, media, next, total } = await packs.mediaCharacters({
    id,
    search,
    guildId,
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

  if (packs.isDisabled(`${node.packId}:${node.id}`, list)) {
    throw new NonFetalError('This character was removed or disabled');
  }

  const [character, existing] = await Promise.all([
    // aggregate the media by populating any references to other media/character objects
    packs.aggregate<Character>({
      guildId,
      character: node,
      end: 1,
    }),
    // find if the character is owned
    user.findCharacter({
      guildId,
      characterId: `${node.packId}:${node.id}`,
    }),
  ]);

  const message = characterMessage(character, channelId, {
    existing,
    relations: false,
  }).addComponents([
    new discord.Component()
      .setId('media', `${media.packId}:${media.id}`)
      .setLabel(`/${media.type.toLowerCase()}`),
  ]);

  message.insertComponents([
    new discord.Component()
      .setLabel('/like')
      .setId(`like`, `${character.packId}:${character.id}`),
  ]);

  return discord.Message.page({
    total,
    type: 'mcharacters',
    target: `${media.packId}:${media.id}`,
    message,
    index,
    next,
  });
}

async function mediaFound(
  { search, id, guildId, channelId, before, after }: {
    guildId: string;
    channelId: string;
    search?: string;
    id?: string;
    before?: string;
    after?: string;
  },
): Promise<discord.Message> {
  const results: (Media | DisaggregatedMedia)[] = await packs
    .media(id ? { ids: [id], guildId } : { search, guildId });

  if (!results.length) {
    throw new Error('404');
  }

  const media = results[0];
  const mediaId = `${media.packId}:${media.id}`;

  const titles = packs.aliasToArray(media.title);

  const query = gql`
    query ($guildId: String!, $mediaId: String!, $before: String, $after: String) {
      findMedia(guildId: $guildId, mediaId: $mediaId, before: $before, after: $after) {
        anchor
        character {
          id
          mediaId
          rating
          user {
            id
          }
        }
      }
    }
  `;

  const { character, anchor } = (await request<{
    findMedia: {
      character?: Schema.Inventory['characters'][0];
      anchor?: string;
    };
  }>({
    url: faunaUrl,
    query,
    headers: {
      'authorization': `Bearer ${config.faunaSecret}`,
    },
    variables: {
      guildId,
      mediaId,
      before,
      after,
    },
  })).findMedia;

  if (!character || !anchor) {
    const message = new discord.Message()
      .addEmbed(
        new discord.Embed()
          .setDescription(`No one has found any ${titles[0]} characters`),
      );

    return message;
  }

  const characters = await packs.characters({ ids: [character.id], guildId });

  let message: discord.Message;

  if (!characters.length) {
    message = new discord.Message()
      .addEmbed(
        new discord.Embed()
          .setDescription('This character was removed or disabled'),
      );
  } else {
    message = characterMessage(
      characters[0],
      channelId,
      {
        existing: character,
        rating: new Rating({ stars: character.rating }),
        relations: false,
      },
    ).addComponents([
      new discord.Component()
        .setId('media', `${media.packId}:${media.id}`)
        .setLabel(`/${media.type.toLowerCase()}`),
    ]);
  }

  return discord.Message.anchor({
    id: '',
    type: 'found',
    target: mediaId,
    anchor,
    message,
  });
}

const search = {
  media,
  mediaMessage,
  mediaEmbed,
  mediaDebugMessage,
  character,
  characterMessage,
  characterEmbed,
  characterDebugMessage,
  mediaCharacters,
  mediaFound,
};

export default search;
