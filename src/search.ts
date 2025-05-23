import packs from '~/src/packs.ts';

import Rating from '~/src/rating.ts';

import utils from '~/src/utils.ts';

import user from '~/src/user.ts';

import * as discord from '~/src/discord.ts';
import * as discordV2 from '~/src/discordV2.ts';

import config from '~/src/config.ts';

import i18n from '~/src/i18n.ts';

import db from '~/db/index.ts';

import {
  Character,
  DisaggregatedCharacter,
  DisaggregatedMedia,
  Media,
  MediaFormat,
  MediaRelation,
} from '~/src/types.ts';

import { NonFetalError } from '~/src/errors.ts';

import type * as Schema from '~/db/schema.ts';

export const idPrefix = 'id=';

const musicUrlRegex = /youtube|spotify/;

const externalUrlRegex =
  /^(https:\/\/)?(www\.)?(youtube\.com|twitch\.tv|netflix\\.com|crunchyroll\.com|tapas\.io|webtoons\.com|amazon\.com)[\S]*$/;

type CharacterEmbed = {
  userId?: string;
  existing?: Schema.Character[];
  overwrite?: Partial<Schema.Character>;
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
  guildId,
}: {
  token: string;
  id?: string;
  search?: string;
  guildId: string;
}) {
  const locale = user.cachedGuilds[guildId]?.locale;

  return packs
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
      const message = await mediaMessageV2(media);
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
}

async function mediaMessageV2(media: Media): Promise<discordV2.Message> {
  const titles = packs.aliasToArray(media.title);

  if (!titles?.length) {
    throw new Error('404');
  }

  const linksGroup: discordV2.Button[] = [];
  const musicGroup: discordV2.Button[] = [];

  const message = new discordV2.Message();

  const container = await mediaContainer(message, media);

  message.addComponent(container);

  // character embeds
  // sort characters by popularity
  await Promise.all(
    media.characters?.edges?.slice(0, 2).map(async (edge) => {
      const container = await characterContainer(message, edge.node, {
        mode: 'thumbnail',
        rating: false,
      });

      message.addComponent(container);
    }) ?? []
  );

  if (media.trailer?.site === 'youtube') {
    const btn = new discordV2.Button()
      .setUrl(`https://youtu.be/${media.trailer?.id}`)
      .setLabel('Trailer');

    linksGroup.push(btn);
  }

  // link components
  media.externalLinks?.forEach((link) => {
    if (externalUrlRegex.test(link.url)) {
      linksGroup.push(
        new discordV2.Button().setLabel(link.site).setUrl(link.url)
      );
    }
  });

  // view characters
  if (media?.characters?.edges.length) {
    linksGroup.push(
      new discordV2.Button()
        .setLabel('View Characters')
        .setId('mcharacters', `${media.packId}:${media.id}`, '0')
    );
  }

  // relation components
  // sort media by popularity
  media.relations?.edges?.slice(0, 4)?.forEach(({ node: media, relation }) => {
    const label = packs.mediaToString({
      media,
      relation,
    });

    // music links
    if (
      relation === MediaRelation.Other &&
      media.format === MediaFormat.Music
    ) {
      if (
        musicGroup.length < 3 &&
        media.externalLinks?.[0]?.url &&
        musicUrlRegex.test(media.externalLinks?.[0]?.url)
      ) {
        musicGroup.push(
          new discordV2.Button()
            .setLabel(label)
            .setUrl(media.externalLinks[0].url)
        );
      }
      // relations buttons
    } else {
      linksGroup.push(
        new discordV2.Button()
          .setLabel(label)
          .setId('media', `${media.packId}:${media.id}`)
      );
    }
  });

  const buttons = utils.chunks([...linksGroup, ...musicGroup], 5);

  buttons.forEach((group) => {
    const actionRow = new discordV2.ActionRow(...group);
    message.addComponent(actionRow);
  });

  return message;
}

async function mediaContainer(
  message: discordV2.Message,
  media: Media | DisaggregatedMedia,
  options?: {
    mode?: 'thumbnail' | 'full';
  }
): Promise<discordV2.Container> {
  options ??= {
    mode: 'full',
  };

  const title = packs.aliasToArray(media.title)[0];

  const image = media.images?.[0]?.url;

  const wrapWidth = ['preview', 'thumbnail'].includes(options.mode ?? '')
    ? 25
    : 32;

  const titleWrapped = utils.wrap(title, wrapWidth);

  const description =
    options.mode === 'thumbnail'
      ? utils
          .truncate(utils.decodeDescription(media.description), 128)
          ?.replaceAll('\n', ' ')
      : utils.decodeDescription(media.description);

  const container = new discordV2.Container().addComponent(
    new discordV2.TextDisplay(
      `-# ${packs.formatToString(media.type, media.format)}`
    )
  );

  const text = new discordV2.TextDisplay(
    `**${titleWrapped}**\n${description ?? ''}`.trim()
  );

  if (options.mode === 'full') {
    const mediaGallery = new discordV2.MediaGallery();
    const attachment = await mediaGallery.addWithProxy({ url: image });
    container.addComponent(text).addComponent(mediaGallery);
    message.addAttachment(attachment);
  } else {
    const thumbnail = new discordV2.Thumbnail();
    const attachment = await thumbnail.setWithProxy({ url: image });
    const section = new discordV2.Section()
      .addText(text)
      .setAccessory(thumbnail);
    container.addComponent(section);
    message.addAttachment(attachment);
  }

  return container;
}

function character({
  token,
  guildId,
  userId,
  search,
  id,
}: {
  token: string;
  guildId: string;
  userId: string;
  id?: string;
  search?: string;
}) {
  const locale =
    user.cachedGuilds[userId]?.locale ?? user.cachedGuilds[guildId]?.locale;

  return packs
    .characters(id ? { ids: [id], guildId } : { search, guildId })
    .then((results) => {
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
        db.findCharacter(guildId, `${results[0].packId}:${results[0].id}`),
      ]);
    })
    .then(async ([character, existing]) => {
      const media = character.media?.edges?.[0]?.node;

      if (media && packs.isDisabled(`${media.packId}:${media.id}`, guildId)) {
        throw new Error('404');
      }

      const message = await characterMessageV2(character, {
        like: true,
        existing,
        userId,
      });

      return await message.patch(token);
    })
    .catch(async (err) => {
      if (err.message === '404') {
        return await new discordV2.Message()
          .addComponent(
            new discordV2.Container().addComponent(
              new discordV2.TextDisplay(i18n.get('found-nothing', locale))
            )
          )
          .patch(token);
      }

      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discordV2.Message.internal(refId).patch(token);
    });
}

async function characterMessage(
  character: Character | DisaggregatedCharacter,
  options?: CharacterEmbed & {
    externalLinks?: boolean;
    relations?: boolean | DisaggregatedMedia[];
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

  let relations: (Media | DisaggregatedMedia)[] = [];

  // relation components
  // sort media by popularity

  if (Array.isArray(options.relations)) {
    relations = options.relations.slice(0, 1);
  } else if (
    options.relations &&
    character.media &&
    'edges' in character.media
  ) {
    const edges = character.media.edges.slice(0, 1);

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

async function characterEmbed(
  message: discord.Message,
  character: Character | DisaggregatedCharacter,
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

  const image = exists?.image ? { url: exists?.image } : character.images?.[0];

  const alias = exists?.nickname ?? packs.aliasToArray(character.name)[0];

  const wrapWidth = ['preview', 'thumbnail'].includes(options.mode ?? '')
    ? 25
    : 32;

  const aliasWrapped = utils.wrap(alias, wrapWidth);

  const userIds = options.overwrite?.userId
    ? [`<@${options.overwrite.userId}>`]
    : options.existing?.map(({ userId }) => `<@${userId}>`);

  if (options.mode === 'full') {
    const attachment = await embed.setImageWithProxy({ url: image?.url });
    message.addAttachment(attachment);
  } else {
    const attachment = await embed.setThumbnailWithProxy({ url: image?.url });
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
          .truncate(utils.decodeDescription(character.description), 128)
          ?.replaceAll('\n', ' ')
      : utils.decodeDescription(character.description);

  let mediaTitle: string | undefined = undefined;

  if (typeof options.media?.title === 'string') {
    mediaTitle = options.media.title;
  } else if (
    options.media?.title &&
    character.media &&
    'edges' in character.media &&
    character.media?.edges[0]
  ) {
    mediaTitle = packs.aliasToArray(character.media.edges[0].node.title)[0];
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
      text: [utils.capitalize(character.gender), character.age]
        .filter(utils.nonNullable)
        .join(', '),
    });
  }

  return embed;
}

async function characterMessageV2(
  character: Character | DisaggregatedCharacter,
  options?: CharacterEmbed & {
    externalLinks?: boolean;
    relations?: boolean | DisaggregatedMedia[];
    like?: boolean;
  }
): Promise<discordV2.Message> {
  options = {
    externalLinks: true,
    relations: true,
    ...options,
  };

  const message = new discordV2.Message().setPing();

  const container = await characterContainer(message, character, options);

  message.addComponent(container);

  const group: discordV2.Button[] = [];

  // link components
  if (options.externalLinks) {
    character.externalLinks?.forEach((link) => {
      const component = new discordV2.Button()
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
    options.relations &&
    character.media &&
    'edges' in character.media
  ) {
    const edges = character.media.edges.slice(0, 1);

    relations = edges.map(({ node }) => node);
  }

  relations.forEach((media) => {
    const label = packs.mediaToString({ media });

    const component = new discordV2.Button()
      .setLabel(label)
      .setId('media', `${media.packId}:${media.id}`);

    group.push(component);
  });

  if (options.like) {
    group.unshift(
      new discordV2.Button()
        .setLabel('/like')
        .setId(`like`, `${character.packId}:${character.id}`)
    );
  }

  const buttons = utils.chunks(group, 5);

  buttons.forEach((group) => {
    const actionRow = new discordV2.ActionRow(...group);
    message.addComponent(actionRow);
  });

  return message;
}

async function characterContainer(
  message: discordV2.Message,
  character: Character | DisaggregatedCharacter,
  options?: CharacterEmbed
): Promise<discordV2.Container> {
  options = {
    ...{
      mode: 'full',
      rating: true,
      description: true,
      footer: true,
    },
    ...options,
  };

  const container = new discordV2.Container();

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

  const image = exists?.image ? { url: exists?.image } : character.images?.[0];

  const alias = exists?.nickname ?? packs.aliasToArray(character.name)[0];

  const wrapWidth = ['preview', 'thumbnail'].includes(options.mode ?? '')
    ? 25
    : 32;

  const aliasWrapped = utils.wrap(alias, wrapWidth);

  const userIds = options.overwrite?.userId
    ? [`<@${options.overwrite.userId}>`]
    : options.existing?.map(({ userId }) => `<@${userId}>`);

  if (exists?.rating) {
    // FIXME #63 Media Conflict

    if (options?.rating) {
      const rating = new Rating({ stars: exists?.rating });

      container.addComponent(
        new discordV2.TextDisplay(
          userIds ? `${userIds.join('')}\n\n${rating.emotes}` : rating.emotes
        )
      );
    } else if (userIds) {
      container.addComponent(new discordV2.TextDisplay(userIds.join('')));
    }
  } else if (options?.rating) {
    if (typeof options.rating === 'boolean' && options.rating) {
      options.rating = new Rating({ stars: character.rating });
    }

    if (options.rating instanceof Rating) {
      container.addComponent(new discordV2.TextDisplay(options.rating.emotes));
    }
  }

  const description =
    options.mode === 'thumbnail'
      ? utils
          .truncate(utils.decodeDescription(character.description), 128)
          ?.replaceAll('\n', ' ')
      : utils.decodeDescription(character.description);

  let mediaTitle: string | undefined = undefined;

  if (typeof options.media?.title === 'string') {
    mediaTitle = options.media.title;
  } else if (
    options.media?.title &&
    character.media &&
    'edges' in character.media &&
    character.media?.edges[0]
  ) {
    mediaTitle = packs.aliasToArray(character.media.edges[0].node.title)[0];
  }

  if (mediaTitle) {
    const text = new discordV2.TextDisplay(
      `${utils.wrap(mediaTitle, wrapWidth)}\n**${aliasWrapped}**\n${options.description && description ? description : ''}`.trim()
    );

    if (options.mode === 'thumbnail') {
      const thumbnail = new discordV2.Thumbnail();
      const attachment = await thumbnail.setWithProxy({ url: image?.url });
      const section = new discordV2.Section()
        .addText(text)
        .setAccessory(thumbnail);
      container.addComponent(section);
      message.addAttachment(attachment);
    } else {
      container.addComponent(text);
    }
  } else {
    const text = new discordV2.TextDisplay(
      `${`**${aliasWrapped}**`}\n${options.description ? description || '' : options.suffix || ''}`.trim()
    );

    if (options.mode === 'thumbnail') {
      const thumbnail = new discordV2.Thumbnail();
      const attachment = await thumbnail.setWithProxy({ url: image?.url });
      new discordV2.Section().addText(text).setAccessory(thumbnail);
      container.addComponent(
        new discordV2.Section().addText(text).setAccessory(thumbnail)
      );
      message.addAttachment(attachment);
    } else {
      container.addComponent(text);
    }
  }

  if (options.mode === 'full') {
    const mediaGallery = new discordV2.MediaGallery();
    const attachment = await mediaGallery.addWithProxy({ url: image?.url });
    container.addComponent(mediaGallery);
    message.addAttachment(attachment);
  }

  const footer = [utils.capitalize(character.gender), character.age]
    .filter(utils.nonNullable)
    .join(', ')
    .trim();

  if (options.footer && footer) {
    container.addComponent(new discordV2.TextDisplay(`-# ${footer}`));
  }

  return container;
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
}) {
  const locale =
    user.cachedUsers[userId]?.locale ?? user.cachedGuilds[guildId]?.locale;

  return packs
    .mediaCharacters({
      id,
      search,
      guildId,
      index,
    })
    .then(async ({ character, media, next, total }) => {
      if (!media || packs.isDisabled(`${media.packId}:${media.id}`, guildId)) {
        throw new Error('404');
      }

      const titles = packs.aliasToArray(media.title);

      if (!character) {
        throw new NonFetalError(
          index > 0
            ? `${titles[0]} contains no more characters`
            : `${titles[0]} contains no characters`
        );
      }

      const existing = await db.findCharacter(
        guildId,
        `${character.packId}:${character.id}`
      );

      // const [character, existing] = await Promise.all([
      //   packs.aggregate<Character>({
      //     guildId,
      //     character: character,
      //     end: 1,
      //   }),
      //   // find if the character is owned
      //   db.findCharacter(guildId, `${character.packId}:${character.id}`),
      // ]);

      const message = await characterMessageV2(character, {
        rating: new Rating({ stars: character.rating }),
        relations: false,
        description: true,
        externalLinks: true,
        footer: true,
        existing,
        userId: userId,
      });

      const actionRow = new discordV2.ActionRow();

      actionRow.addComponent(
        new discordV2.Button()
          .setLabel('/like')
          .setId(`like`, `${character.packId}:${character.id}`)
      );

      actionRow.addComponent(
        new discordV2.Button()
          .setId('media', `${media.packId}:${media.id}`)
          .setLabel(`/${media.type.toLowerCase()}`)
      );

      message.addComponent(actionRow);

      discordV2.Message.page({
        total,
        type: 'mcharacters',
        target: `${media.packId}:${media.id}`,
        actionRow,
        index,
        next,
        locale,
      });

      return message.patch(token);
    })
    .catch(async (err) => {
      if (err.message === '404') {
        return await new discordV2.Message()
          .addComponent(
            new discordV2.Container(
              new discordV2.TextDisplay(i18n.get('found-nothing', locale))
            )
          )
          .patch(token);
      }

      if (err instanceof NonFetalError) {
        return await new discordV2.Message()
          .addComponent(
            new discordV2.Container(new discordV2.TextDisplay(err.message))
          )
          .patch(token);
      }

      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discordV2.Message.internal(refId).patch(token);
    });
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
}) {
  const locale = user.cachedUsers[userId]?.locale;

  return packs
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
        ...(parent.relations?.edges?.map(({ node }) => node) ?? []),
      ];

      const characters = await db.getMediaCharacters(
        guildId,
        media.map(({ packId, id }) => `${packId}:${id}`)
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
          ({ characterId }) => characterId === `${char.packId}:${char.id}`
        )!;

        const _media = media.find(
          ({ packId, id }) => `${packId}:${id}` === existing.mediaId
        );

        const mediaTitle = _media?.title
          ? utils.wrap(packs.aliasToArray(_media.title)[0])
          : undefined;

        if (
          _media &&
          packs.isDisabled(`${_media.packId}:${_media.id}`, guildId)
        ) {
          continue;
        }

        const name = `${existing.rating}${
          discord.emotes.smolStar
        } ${`<@${existing?.userId}>`} ${utils.wrap(
          packs.aliasToArray(char.name)[0]
        )}`;

        embed.addField({
          inline: false,
          name: mediaTitle ? mediaTitle : name,
          value: mediaTitle ? name : undefined,
        });
      }

      if (embed.getFieldsCount() <= 0) {
        message.addEmbed(
          embed.setDescription(
            `No one has found any ${
              packs.aliasToArray(parent.title)[0]
            } characters`
          )
        );

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
}

const search = {
  media,
  character,
  mediaMessageV2,
  mediaContainer,
  characterMessage,
  characterEmbed,
  characterMessageV2,
  characterContainer,
  mediaCharacters,
  mediaFound,
};

export default search;
