import packs from './packs.ts';

import Rating from './rating.ts';

import utils from './utils.ts';

import user from './user.ts';

import * as discord from './discord.ts';

import config from './config.ts';

import db from '../db/mod.ts';

import type * as Schema from '../db/schema.ts';

import {
  Character,
  DisaggregatedCharacter,
  DisaggregatedMedia,
  Media,
  MediaFormat,
  MediaRelation,
} from './types.ts';

import { NonFetalError } from './errors.ts';

export const idPrefix = 'id=';

export const relationFilter = [
  MediaRelation.Parent,
  MediaRelation.Contains,
  MediaRelation.Prequel,
  MediaRelation.Sequel,
  MediaRelation.SideStory,
  MediaRelation.SpinOff,
];

const musicUrlRegex = /youtube|spotify/;

const externalUrlRegex =
  /^(https:\/\/)?(www\.)?(youtube\.com|twitch\.tv|crunchyroll\.com|tapas\.io|webtoons\.com|amazon\.com)[\S]*$/;

const findCharacter = async (
  guildId: string,
  characterId: string,
) => {
  const guild = await db.getGuild(guildId);
  const instance = await db.getInstance(guild);

  const results = await db.findCharacters(instance, [characterId]);

  return results[0];
};

function media(
  { token, id, search, debug, guildId }: {
    token: string;
    id?: string;
    search?: string;
    debug?: boolean;
    guildId: string;
  },
): discord.Message {
  packs
    .media(id ? { ids: [id], guildId } : { search, guildId })
    .then((results: (Media | DisaggregatedMedia)[]) => {
      if (
        !results.length ||
        packs.isDisabled(`${results[0].packId}:${results[0].id}`, guildId)
      ) {
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
        return await mediaDebugMessage(media)
          .patch(token);
      }

      return await mediaMessage(media)
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

function mediaMessage(media: Media): discord.Message {
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
  titles: string[],
): discord.Embed {
  return new discord.Embed()
    .setTitle(utils.wrap(titles[0]))
    .setAuthor({ name: packs.formatToString(media.format) })
    .setDescription(utils.decodeDescription(media.description))
    .setImage({ url: media.images?.[0]?.url });
}

function mediaDebugMessage(
  media: Media | DisaggregatedMedia,
): discord.Message | discord.Message {
  const titles = packs.aliasToArray(media.title);

  if (!titles?.length) {
    throw new Error('404');
  }

  const embed = new discord.Embed()
    .setTitle(titles.shift())
    .setDescription(titles.join('\n'))
    .setThumbnail({ url: media.images?.[0]?.url })
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
  { token, guildId, search, id, debug }: {
    token: string;
    guildId: string;
    id?: string;
    search?: string;
    debug?: boolean;
  },
): discord.Message {
  packs
    .characters(id ? { ids: [id], guildId } : { search, guildId })
    .then((results) => {
      if (!results.length) {
        throw new Error('404');
      }

      if (packs.isDisabled(`${results[0].packId}:${results[0].id}`, guildId)) {
        throw new Error('404');
      }

      return Promise.all([
        // aggregate the media by populating any references to other media/character objects
        packs.aggregate<Character>({
          guildId,
          character: results[0],
          end: 4,
        }),
        findCharacter(guildId, `${results[0].packId}:${results[0].id}`),
      ]);
    })
    .then(async ([character, existing]) => {
      const media = character.media?.edges?.[0]?.node;

      if (
        (
          existing?.[0] &&
          packs.isDisabled(existing[0].mediaId, guildId)
        ) ||
        (
          media &&
          packs.isDisabled(`${media.packId}:${media.id}`, guildId)
        )
      ) {
        throw new Error('404');
      }

      if (debug) {
        return await characterDebugMessage(character)
          .patch(token);
      }

      const message = characterMessage(character, {
        existing: existing?.[0],
        userId: existing?.[1]?.id,
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
  options?: Parameters<typeof characterEmbed>[1] & {
    externalLinks?: boolean;
    relations?: boolean | DisaggregatedMedia[];
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
    relations = options.relations.slice(0, 1);
  } else if (
    options.relations && character.media && 'edges' in character.media
  ) {
    const edges = character.media.edges
      .slice(0, 1);

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
  options?: {
    userId?: string;
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

  const wrapWidth = ['preview', 'thumbnail'].includes(options.mode ?? '')
    ? 25
    : 32;

  const aliasWrapped = utils.wrap(alias, wrapWidth);

  if (options.mode === 'full') {
    embed.setImage({ url: image?.url });
  } else {
    embed.setThumbnail({ url: image?.url });
  }

  if (options?.existing?.rating) {
    // FIXME #63 Media Conflict

    if (options?.rating) {
      const rating = new Rating({ stars: options.existing.rating });

      embed.setDescription(
        options.userId
          ? `<@${options.userId}>\n\n${rating.emotes}`
          : rating.emotes,
      );
    } else if (options.userId) {
      embed.setDescription(`<@${options.userId}>`);
    }
  } else if (options?.rating) {
    if (typeof options.rating === 'boolean' && options.rating) {
      options.rating = Rating.fromCharacter(character as Character);
    }

    if (options.rating instanceof Rating) {
      embed.setDescription(options.rating.emotes);
    }
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
      name: utils.wrap(mediaTitle, wrapWidth),
      value: `**${aliasWrapped}**`,
    });

    if (options.description && description) {
      embed.addField({ value: description });
    }
  } else {
    embed.addField({
      name:
        !description || (options.description && options.mode === 'thumbnail')
          ? `${aliasWrapped}`
          : `${aliasWrapped}\n${discord.empty}`,
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

function characterDebugMessage(character: Character): discord.Message {
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
    .setThumbnail({ url: character.images?.[0]?.url })
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
  { search, id, userId, guildId, index }: {
    search?: string;
    id?: string;
    userId: string;
    guildId: string;
    index: number;
  },
): Promise<discord.Message> {
  const locale = user.cachedUsers[userId]?.locale;

  const { character: node, media, next, total } = await packs
    .mediaCharacters({
      id,
      search,
      guildId,
      index,
    });

  if (!media || packs.isDisabled(`${media.packId}:${media.id}`, guildId)) {
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

  if (packs.isDisabled(`${node.packId}:${node.id}`, guildId)) {
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
    findCharacter(guildId, `${node.packId}:${node.id}`),
  ]);

  const message = characterMessage(character, {
    rating: false,
    relations: false,
    description: true,
    externalLinks: true,
    footer: true,
    existing: existing?.[0],
    userId: existing?.[1]?.id,
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
    locale,
  });
}

function mediaFound(
  {
    token,
    index,
    search,
    id,
    userId,
    guildId,
  }: {
    token: string;
    index: number;
    guildId: string;
    userId: string;
    search?: string;
    id?: string;
  },
): discord.Message {
  const locale = user.cachedUsers[userId]?.locale;

  packs
    .media(id ? { ids: [id], guildId } : { search, guildId })
    .then(async (results: (Media | DisaggregatedMedia)[]) => {
      const embed = new discord.Embed();

      const message = new discord.Message();

      if (
        !results.length ||
        packs.isDisabled(`${results[0].packId}:${results[0].id}`, guildId)
      ) {
        throw new Error('404');
      }

      const parent = await packs.aggregate<Media>({
        media: results[0],
        guildId,
      });

      const media = [
        parent,
        ...(parent.relations?.edges?.filter(({ relation }) =>
          // deno-lint-ignore no-non-null-assertion
          relationFilter.includes(relation!)
        ).map(({ node }) => node) ?? []),
      ];

      const guild = await db.getGuild(guildId);
      const instance = await db.getInstance(guild);

      const characters = await db.findMediaCharacters(
        instance,
        media.map(({ packId, id }) => `${packId}:${id}`),
      );

      const chunks = utils.chunks(
        characters.sort((a, b) => {
          if (a[0].mediaId < b[0].mediaId) {
            return -1;
          }

          if (a[0].mediaId > b[0].mediaId) {
            return 1;
          }

          return b[0].rating - a[0].rating;
        }),
        5,
      );

      const _characters = await packs.characters({
        ids: chunks[index]?.map(([{ id }]) => id),
        guildId,
      });

      for (let i = 0; i < _characters.length; i++) {
        const char = _characters[i];

        // deno-lint-ignore no-non-null-assertion
        const existing = chunks[index].find(([{ id }]) =>
          id === `${char.packId}:${char.id}`
        )!;

        const _media = media.find(({ packId, id }) =>
          `${packId}:${id}` === existing[0].mediaId
        );

        const mediaTitle = _media?.title
          ? utils.wrap(
            packs.aliasToArray(_media.title)[0],
          )
          : undefined;

        if (
          packs.isDisabled(`${char.packId}:${char.id}`, guildId) ||
          (
            _media &&
            packs.isDisabled(`${_media.packId}:${_media.id}`, guildId)
          )
        ) {
          continue;
        }

        const name = `${existing[0].rating}${discord.emotes.smolStar} ${`<@${
          existing[1]?.id
        }>`} ${utils.wrap(packs.aliasToArray(char.name)[0])}`;

        embed.addField({
          inline: false,
          name: mediaTitle ? mediaTitle : name,
          value: mediaTitle ? name : undefined,
        });
      }

      if (embed.getFieldsCount() <= 0) {
        message.addEmbed(embed.setDescription(
          `No one has found any ${
            packs.aliasToArray(parent.title)[0]
          } characters`,
        ));

        return message.patch(token);
      }

      return discord.Message.page({
        index,
        type: 'found',
        target: `${parent.packId}:${parent.id}`,
        total: chunks.length,
        message: message.addEmbed(embed),
        next: index + 1 < chunks.length,
        locale,
      }).patch(token);
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
