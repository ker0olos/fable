import packs from '~/src/packs.ts';

import Rating from '~/src/rating.ts';

import utils from '~/src/utils.ts';

import user from '~/src/user.ts';

import * as discord from '~/src/discord.ts';

import config from '~/src/config.ts';

import i18n from '~/src/i18n.ts';

import db from '~/db/index.ts';

import { NonFetalError } from '~/src/errors.ts';

import {
  type PackCharacter,
  type PackMedia,
  MEDIA_RELATION,
  MEDIA_FORMAT,
} from '~/src/types.ts';

import { type Character } from '@prisma/client';

export const idPrefix = 'id=';

const musicUrlRegex = /youtube|spotify/;

const externalUrlRegex =
  /^(https:\/\/)?(www\.)?(youtube\.com|twitch\.tv|netflix\\.com|crunchyroll\.com|tapas\.io|webtoons\.com|amazon\.com)[\S]*$/;

type CharacterEmbed = {
  userId?: string;
  existing?: Character[];
  overwrite?: Partial<Character>;
  suffix?: string;
  rating?: Rating | boolean;
  media?: {
    title?: boolean | string;
  };
  mode?: 'thumbnail' | 'full';
  description?: boolean;
  footer?: boolean;
};

function media({
  token,
  id,
  search,
  debug,
  guildId,
}: {
  token: string;
  id?: string;
  search?: string;
  debug?: boolean;
  guildId: string;
}): discord.Message {
  const locale = user.cachedGuilds[guildId]?.locale;

  packs
    .media(id ? { ids: [id], guildId } : { search, guildId })
    .then((results: PackMedia[]) => {
      if (!results.length || packs.isDisabled(results[0].id, guildId)) {
        throw new Error('404');
      }

      return results[0];
    })
    .then(async (media) => {
      if (debug) {
        const message = await mediaDebugMessage(media);
        return await message.patch(token);
      }

      const message = await mediaMessage(media);
      return await message.patch(token);
    })
    .catch(async (err) => {
      if (err.message === '404') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('found-nothing', locale)
            )
          )
          .patch(token);
      }

      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  return discord.Message.spinner();
}

async function mediaMessage(media: PackMedia): Promise<discord.Message> {
  const linksGroup: discord.Component[] = [];
  const musicGroup: discord.Component[] = [];

  const message = new discord.Message();

  const embed = await mediaEmbed(message, media);

  message.addEmbed(embed);

  // character embeds
  // sort characters by popularity
  await Promise.all(
    media.characters?.slice(0, 2).map(async (edge) => {
      const embed = await characterEmbed(message, edge.node, {
        mode: 'thumbnail',
        rating: false,
      });

      message.addEmbed(embed);
    }) ?? []
  );

  // link components
  media.externalLinks?.forEach((link) => {
    if (externalUrlRegex.test(link.url)) {
      const component = new discord.Component()
        .setLabel(link.site)
        .setUrl(link.url);

      linksGroup.push(component);
    }
  });

  // view characters
  if (media?.characters?.length) {
    linksGroup.push(
      new discord.Component()
        .setLabel('View Characters')
        .setId('mcharacters', media.id, '0')
    );
  }

  // relation components
  // sort media by popularity
  media.media?.slice(0, 4)?.forEach(({ node: media, relation }) => {
    const label = packs.mediaToString({
      media,
      relation: relation || undefined,
    });

    // music links
    if (
      relation === MEDIA_RELATION.OTHER &&
      media.format === MEDIA_FORMAT.MUSIC
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
        .setId('media', media.id);

      linksGroup.push(component);
    }
  });

  return message.addComponents([...linksGroup, ...musicGroup]);
}

async function mediaEmbed(
  message: discord.Message,
  media: PackMedia,
  options?: {
    mode?: 'thumbnail' | 'full';
  }
): Promise<discord.Embed> {
  options ??= {
    mode: 'full',
  };

  const title = media.title;

  const image = media.image || undefined;

  const wrapWidth = ['preview', 'thumbnail'].includes(options.mode ?? '')
    ? 25
    : 32;

  const titleWrapped = utils.wrap(title, wrapWidth);

  const embed = new discord.Embed();

  if (options.mode === 'full') {
    const attachment = await embed.setImageWithProxy({ url: image });
    message.addAttachment(attachment);
  } else {
    const attachment = await embed.setThumbnailWithProxy({ url: image });
    message.addAttachment(attachment);
  }

  const description =
    options.mode === 'thumbnail'
      ? utils
          .truncate(
            utils.decodeDescription(media.description || undefined),
            128
          )
          ?.replaceAll('\n', ' ')
      : utils.decodeDescription(media.description || undefined);

  return embed
    .setTitle(titleWrapped)
    .setAuthor({ name: packs.formatToString(media.format) })
    .setDescription(description);
}

async function mediaDebugMessage(media: PackMedia): Promise<discord.Message> {
  const message = new discord.Message();

  const embed = new discord.Embed()
    .setTitle(media.title)
    .setDescription(media.alternative.join('\n'))
    .addField({ name: 'Id', value: media.id })
    .addField({
      name: 'Type',
      value: `${utils.capitalize(media.type)}`,
      inline: true,
    })
    .addField({
      name: 'Format',
      value: `${utils.capitalize(media.format?.toString() || undefined)}`,
      inline: true,
    });

  const image = await embed.setThumbnailWithProxy({
    url: media.image || undefined,
  });

  return message.addEmbed(embed).addAttachment(image);
}

function character({
  token,
  guildId,
  userId,
  search,
  id,
  debug,
}: {
  token: string;
  guildId: string;
  userId: string;
  id?: string;
  search?: string;
  debug?: boolean;
}): discord.Message {
  const locale =
    user.cachedGuilds[userId]?.locale ?? user.cachedGuilds[guildId]?.locale;

  packs
    .characters(id ? { ids: [id], guildId } : { search, guildId })
    .then((results) => {
      if (!results.length) {
        throw new Error('404');
      }

      return Promise.all([
        results[0],
        db.findCharacter(guildId, results[0].id),
      ]);
    })
    .then(async ([character, existing]) => {
      const characterId = character.id;

      const media = character.media?.[0]?.media;

      if (media && packs.isDisabled(media.id, guildId)) {
        throw new Error('404');
      }

      if (debug) {
        const message = await characterDebugMessage(character);
        return await message.patch(token);
      }

      const message = await characterMessage(character, {
        existing,
        userId,
      });

      if (existing) {
        message.insertComponents([
          new discord.Component()
            .setLabel('/stats')
            .setId(`stats`, characterId),
        ]);
      }

      message.insertComponents([
        new discord.Component().setLabel('/like').setId(`like`, characterId),
      ]);

      return await message.patch(token);
    })
    .catch(async (err) => {
      if (err.message === '404') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('found-nothing', locale)
            )
          )
          .patch(token);
      }

      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  return discord.Message.spinner();
}

async function characterMessage(
  character: PackCharacter,
  options?: CharacterEmbed & {
    externalLinks?: boolean;
    relations?: boolean | PackMedia[];
  }
): Promise<discord.Message> {
  options = {
    externalLinks: true,
    relations: true,
    ...options,
  };

  const message = new discord.Message();

  message.addEmbed(await characterEmbed(message, character, options));

  const group: discord.Component[] = [];

  // link components
  if (options.externalLinks) {
    character.externalLinks?.forEach((link) => {
      const component = new discord.Component()
        .setLabel(link.site)
        .setUrl(link.url);

      group.push(component);
    });
  }

  let relations: {
    id: string;
    packId: string;
    title: string;
    format?: MEDIA_FORMAT | null;
  }[] = [];

  // relation components
  // sort media by popularity

  if (Array.isArray(options.relations)) {
    relations = options.relations.slice(0, 1);
  } else if (options.relations && character.media?.length) {
    const edges = character.media.slice(0, 1);
    relations = edges.map(({ media }) => media).filter(utils.nonNullable);
  }

  relations.forEach((media) => {
    const label = packs.mediaToString({ media });

    const component = new discord.Component()
      .setLabel(label)
      .setId('media', media.id);

    group.push(component);
  });

  return message.addComponents(group);
}

async function characterEmbed(
  message: discord.Message,
  character: Omit<PackCharacter, 'media'>,
  options?: CharacterEmbed
): Promise<discord.Embed> {
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

  options.existing = options.existing?.sort((a, b) => {
    if (
      options.userId &&
      a.userId === options.userId &&
      b.userId !== options.userId
    ) {
      return -1;
    }

    if (a.rating !== b.rating) {
      return b.rating - a.rating;
    }

    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  const exists = options.overwrite ?? options.existing?.[0];

  const image = exists?.image ? exists?.image : character.image;

  const alias = exists?.nickname ?? character.name;

  const wrapWidth = ['preview', 'thumbnail'].includes(options.mode ?? '')
    ? 25
    : 32;

  const aliasWrapped = utils.wrap(alias, wrapWidth);

  const userIds = options.overwrite?.userId
    ? [`<@${options.overwrite.userId}>`]
    : options.existing?.map(({ userId }) => `<@${userId}>`);

  if (options.mode === 'full') {
    const attachment = await embed.setImageWithProxy({
      url: image || undefined,
    });
    message.addAttachment(attachment);
  } else {
    const attachment = await embed.setThumbnailWithProxy({
      url: image || undefined,
    });
    message.addAttachment(attachment);
  }

  if (exists?.rating) {
    // FIXME #63 Media Conflict

    if (options?.rating) {
      const rating = new Rating({ stars: exists?.rating });

      embed.setDescription(
        userIds ? `${userIds.join('')}\n\n${rating.emotes}` : rating.emotes
      );
    } else if (userIds) {
      embed.setDescription(userIds.join(''));
    }
  } else if (options?.rating) {
    if (typeof options.rating === 'boolean' && options.rating) {
      options.rating = new Rating({ stars: character.rating });
    }

    if (options.rating instanceof Rating) {
      embed.setDescription(options.rating.emotes);
    }
  }

  const description =
    options.mode === 'thumbnail'
      ? utils
          .truncate(
            utils.decodeDescription(character.description || undefined),
            128
          )
          ?.replaceAll('\n', ' ')
      : utils.decodeDescription(character.description || undefined);

  let mediaTitle: string | undefined = undefined;

  if (typeof options.media?.title === 'string') {
    mediaTitle = options.media.title;
  }
  //  else if (
  //   options.media?.title &&
  //   character.media &&
  //   'edges' in character.media &&
  //   character.media?.edges[0]
  // ) {
  //   mediaTitle = packs.aliasToArray(character.media.edges[0].node.title)[0];
  // }

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
        !description ||
        !options.description ||
        (options.description && options.mode === 'thumbnail')
          ? `${aliasWrapped}`
          : `${aliasWrapped}\n${discord.empty}`,
      value: options.description ? description : options.suffix,
    });
  }

  if (options.footer) {
    embed.setFooter({
      text: [utils.capitalize(character.gender || undefined), character.age]
        .filter(utils.nonNullable)
        .join(', '),
    });
  }

  return embed;
}

async function characterDebugMessage(
  character: PackCharacter
): Promise<discord.Message> {
  const { media, role } = character.media?.[0] ?? {};

  const rating = new Rating({
    stars: character.rating,
  });

  const message = new discord.Message();

  const embed = new discord.Embed()
    .setTitle(character.name)
    .setDescription(character.alternative.join('\n'))
    .addField({ name: 'Id', value: character.id })
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
      value: media?.id,
      inline: true,
    })
    .addField({
      name: 'Role',
      value: `${utils.capitalize(role?.toString())}`,
      inline: true,
    });

  const image = await embed.setThumbnailWithProxy({
    url: character.image || undefined,
  });

  if (!media) {
    embed.addField({
      name: '**WARN**',
      value:
        'Character not available in gacha.\nAdd at least one media to the character.',
    });
  }

  return message.addEmbed(embed).addAttachment(image);
}

function mediaCharacters({
  token,
  search,
  id,
  userId,
  guildId,
  index,
}: {
  token: string;
  search?: string;
  id?: string;
  userId: string;
  guildId: string;
  index: number;
}): discord.Message {
  const locale =
    user.cachedUsers[userId]?.locale ?? user.cachedGuilds[guildId]?.locale;

  packs
    .mediaCharacters({
      id,
      search,
      guildId,
      index,
    })
    .then(async ({ character, media, next, total }) => {
      if (!media || packs.isDisabled(media.id, guildId)) {
        throw new Error('404');
      }

      const title = media.title;

      if (!character) {
        throw new NonFetalError(
          index > 0
            ? `${title} contains no more characters`
            : `${title} contains no characters`
        );
      }

      const existing = await db.findCharacter(guildId, character.id);

      const message = await characterMessage(
        character as unknown as PackCharacter,
        {
          rating: new Rating({ stars: character.rating }),
          relations: false,
          description: true,
          externalLinks: true,
          footer: true,
          existing,
          media: { title },
          userId: userId,
        }
      );

      message.addComponents([
        new discord.Component()
          .setId('media', media.id)
          .setLabel(`/${media.type.toLowerCase()}`),
      ]);

      message.insertComponents([
        new discord.Component().setLabel('/like').setId(`like`, character.id),
      ]);

      await discord.Message.page({
        total,
        type: 'mcharacters',
        target: media.id,
        message,
        index,
        next,
        locale,
      }).patch(token);
    })
    .catch(async (err) => {
      if (err.message === '404') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('found-nothing', locale)
            )
          )
          .patch(token);
      }

      if (err instanceof NonFetalError) {
        return await new discord.Message()
          .addEmbed(new discord.Embed().setDescription(err.message))
          .patch(token);
      }

      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  return discord.Message.spinner();
}

function mediaFound({
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
}): discord.Message {
  const locale = user.cachedUsers[userId]?.locale;

  packs
    .media(id ? { ids: [id], guildId } : { search, guildId })
    .then(async (results: PackMedia[]) => {
      const embed = new discord.Embed();

      const message = new discord.Message();

      if (!results.length || packs.isDisabled(results[0].id, guildId)) {
        throw new Error('404');
      }

      const parent = results[0];

      const media = [parent, ...(parent.media?.map(({ node }) => node) ?? [])];

      const characters = await db.getMediaCharacters(
        guildId,
        media.map(({ id }) => id)
      );

      const chunks = utils.chunks(
        characters.sort((a, b) => {
          if (a.mediaId < b.mediaId) {
            return -1;
          }

          if (a.mediaId > b.mediaId) {
            return 1;
          }

          return b.rating - a.rating;
        }),
        5
      );

      const _characters = await packs.characters({
        ids: chunks[index]?.map(({ characterId }) => characterId),
        guildId,
      });

      for (let i = 0; i < _characters.length; i++) {
        const char = _characters[i];

        const existing = chunks[index].find(
          ({ characterId }) => characterId === char.id
        )!;

        const _media = media.find(({ id }) => id === existing.mediaId);

        const mediaTitle = _media?.title ? utils.wrap(_media.title) : undefined;

        if (_media && packs.isDisabled(_media.id, guildId)) {
          continue;
        }

        const name = `${existing.rating}${
          discord.emotes.smolStar
        } ${`<@${existing?.userId}>`} ${utils.wrap(char.name)}`;

        embed.addField({
          inline: false,
          name: mediaTitle ? mediaTitle : name,
          value: mediaTitle ? name : undefined,
        });
      }

      if (embed.getFieldsCount() <= 0) {
        message.addEmbed(
          embed.setDescription(
            `No one has found any ${parent.title} characters`
          )
        );

        return message.patch(token);
      }

      return discord.Message.page({
        index,
        type: 'found',
        target: parent.id,
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
              'Found _nothing_ matching that query!'
            )
          )
          .patch(token);
      }

      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  return discord.Message.spinner();
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
