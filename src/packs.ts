import * as discord from '~/src/discord.ts';

import user from '~/src/user.ts';
import utils from '~/src/utils.ts';

import i18n from '~/src/i18n.ts';

import config from '~/src/config.ts';

import db from '~/db/index.ts';

import { NonFetalError } from '~/src/errors.ts';

import {
  MEDIA_FORMAT,
  MEDIA_RELATION,
  Pack,
  PackCharacter,
  PackMedia,
} from '~/src/types.ts';
import prisma from '~/prisma/index.ts';

const cachedPacks: Record<string, Pack> = {};

const cachedGuilds: Record<
  string,
  {
    packs: string[];
    disables: Map<string, boolean>;
    options: { dupes: boolean };
    excluded?: boolean;
  }
> = {};

const packs = {
  ensureId,
  all,
  findById,
  cachedGuilds,
  characters,
  formatToString,
  install,
  isDisabled,
  media,
  mediaCharacters,
  mediaToString,
  packEmbed,
  pages,
  searchManyCharacters,
  searchManyMedia,
  searchOneCharacter,
  searchOneMedia,
  uninstall,
  uninstallDialog,
};

async function all({ guildId }: { guildId: string }): Promise<Pack[]> {
  let cachedGuild = packs.cachedGuilds[guildId];

  if (!cachedGuild) {
    const guild = await db.getGuild(guildId);

    const _packs = guild.packs;

    _packs.forEach(({ pack }) => {
      cachedPacks[pack.id] = pack;
    });

    cachedGuild = packs.cachedGuilds[guildId] = {
      packs: _packs.map(({ pack: { id } }) => id),
      excluded: guild.excluded,
      options: guild.options || { dupes: false },
      disables: new Map(),
    };

    _packs.forEach(({ pack }) => {
      pack.conflicts?.forEach((id) => {
        cachedGuild.disables.set(id, true);
      });
    });
  }

  const _packs = cachedGuild.packs.map((id) => cachedPacks[id]);

  return _packs;
}

function isDisabled(id: string, guildId: string): boolean {
  return packs.cachedGuilds[guildId]?.disables?.has(id);
}

function packEmbed(pack: {
  id: string;
  author?: string | null;
  description?: string | null;
  image?: string | null;
  title?: string | null;
}): discord.Embed {
  const embed = new discord.Embed()
    .setFooter({ text: pack.author || undefined })
    .setDescription(pack.description || undefined)
    .setTitle(pack.title ?? pack.id);

  if (pack.image) {
    embed.setThumbnailUrl(pack.image);
  }

  return embed;
}

async function uninstallDialog({
  userId,
  guildId,
  packId,
}: {
  userId: string;
  guildId: string;
  packId: string;
}): Promise<discord.Message> {
  const locale = user.cachedUsers[userId]?.locale;

  if (!config.communityPacks) {
    throw new NonFetalError(i18n.get('maintenance-packs', locale));
  }

  const list = await packs.all({ guildId });

  const pack = list.find(({ id }) => id === packId);

  if (!pack) {
    throw new Error('404');
  }

  const message = new discord.Message().addEmbed(packEmbed(pack));

  return discord.Message.dialog({
    userId,
    message,
    type: 'uninstall',
    confirm: discord.join(pack.id, userId),
    description: i18n.get('uninstall-pack-confirmation', locale),
  });
}

async function pages({
  userId,
  guildId,
}: {
  guildId: string;
  userId: string;
}): Promise<discord.Message> {
  const locale =
    user.cachedUsers[userId]?.locale ?? user.cachedGuilds[guildId]?.locale;

  if (!config.communityPacks) {
    throw new NonFetalError(i18n.get('maintenance-packs', locale));
  }

  const list = (await packs.all({ guildId })).reverse();

  const embed = new discord.Embed();

  if (list.length) {
    embed.setDescription(
      list
        .map((pack, i) => {
          let s = `\`${pack.id}\``;

          if (pack.title) {
            s = `${pack.title} | ${s}`;
          }

          return `${i + 1}. [${s}](${config.packsUrl}/${pack.id})`;
        })
        .join('\n')
    );
  } else {
    embed.setDescription(i18n.get('no-packs-installed', locale));
  }

  return new discord.Message().addEmbed(embed);
}

async function install({
  id,
  guildId,
  userId,
}: {
  id: string;
  guildId: string;
  userId: string;
}): Promise<discord.Message> {
  const locale = user.cachedUsers[userId]?.locale;

  if (!config.communityPacks) {
    throw new NonFetalError(i18n.get('maintenance-packs', locale));
  }

  const pack = await db.addPack(userId, guildId, id);

  if (!pack) {
    throw new Error('404');
  }

  // clear guild cache after uninstall
  delete cachedGuilds[guildId];

  const message = new discord.Message()
    .addEmbed(new discord.Embed().setDescription(i18n.get('installed', locale)))
    .addEmbed(packEmbed(pack));

  return message;
}

async function uninstall({
  guildId,
  userId,
  id,
}: {
  guildId: string;
  userId: string;
  id: string;
}): Promise<discord.Message> {
  const locale = user.cachedUsers[userId]?.locale;

  if (!config.communityPacks) {
    throw new NonFetalError(i18n.get('maintenance-packs', locale));
  }

  const pack = await db.removePack(guildId, id);

  if (!pack) {
    throw new Error('404');
  }

  // clear guild cache after uninstall
  delete cachedGuilds[guildId];

  const message = new discord.Message()
    .addEmbed(
      new discord.Embed().setDescription(i18n.get('uninstalled', locale))
    )
    .addEmbed(
      new discord.Embed().setDescription(
        i18n.get('pack-characters-disabled', locale)
      )
    )
    .addEmbed(packEmbed(pack));

  return message;
}

function parseId(
  literal: string,
  defaultPackId?: string
): [string | undefined, string | undefined] {
  const split = /^([-_a-z0-9]+):([-_a-z0-9]+)$/.exec(literal);

  if (split?.length === 3) {
    const [, packId, id] = split;
    return [packId, id];
  } else if (defaultPackId && /^([-_a-z0-9]+)$/.test(literal)) {
    return [defaultPackId, literal];
  }

  return [undefined, undefined];
}

function ensureId(id: string, defaultPackId?: string): string {
  const valid = /^([-_a-z0-9]+):([-_a-z0-9]+)$/.test(id);

  if (!valid && defaultPackId && /^([-_a-z0-9]+)$/.test(id)) {
    return `${defaultPackId}:${id}`;
  }

  return id;
}

async function findById<T>({
  key,
  ids,
  guildId,
  defaultPackId,
}: {
  key: 'media' | 'characters';
  ids: string[];
  guildId: string;
  defaultPackId?: string;
}): Promise<{ [key: string]: T }> {
  const results: { [key: string]: T } = {};

  const list = await packs.all({ guildId });

  for (const literal of [...new Set(ids)]) {
    const [packId, id] = parseId(literal, defaultPackId);

    if (!packId || !id) {
      continue;
    }

    const pack = list.find(({ id }) => id === packId);

    // search for the id in packs
    const match = (key === 'media' ? pack?.media : pack?.characters)?.find(
      (m) => m.id === id
    );

    if (match) {
      results[literal] = ((match.packId = packId), match) as T;
    }
  }

  return results;
}

async function searchManyCharacters({
  search,
  guildId,
}: {
  search: string;
  guildId: string;
}) {
  return prisma.packCharacter.findMany({
    orderBy: { rating: 'desc' },
    include: {
      externalLinks: true,
      media: {
        include: {
          media: { include: { externalLinks: true } },
          node: { include: { externalLinks: true } },
        },
      },
    },
    where: {
      pack: {
        installs: {
          some: {
            guildId,
          },
        },
      },
      OR: [
        { name: { contains: search } },
        { id: { contains: search } },
        { alternative: { has: search } },
      ],
    },
  });
}

async function searchOneCharacter({
  search,
  guildId,
}: {
  search: string;
  guildId: string;
}) {
  return prisma.packCharacter.findFirst({
    orderBy: { rating: 'desc' },
    include: {
      externalLinks: true,
      media: {
        include: {
          media: { include: { externalLinks: true } },
          node: { include: { externalLinks: true } },
        },
      },
    },
    where: {
      pack: {
        installs: {
          some: {
            guildId,
          },
        },
      },
      OR: [
        { name: { contains: search } },
        { id: { contains: search } },
        { alternative: { has: search } },
      ],
    },
  });
}

async function searchManyMedia({
  search,
  guildId,
}: {
  search: string;
  guildId: string;
}) {
  return prisma.packMedia.findMany({
    include: {
      externalLinks: true,
      characters: {
        include: {
          node: {
            include: { externalLinks: true },
          },
        },
      },
      media: {
        include: {
          node: {
            include: { externalLinks: true },
          },
        },
      },
    },
    where: {
      pack: {
        installs: {
          some: {
            guildId,
          },
        },
      },
      OR: [
        { title: { contains: search } },
        { id: { contains: search } },
        { alternative: { has: search } },
      ],
    },
  });
}

async function searchOneMedia({
  search,
  guildId,
}: {
  search: string;
  guildId: string;
}) {
  return prisma.packMedia.findFirst({
    include: {
      externalLinks: true,
      characters: {
        include: {
          node: { include: { externalLinks: true } },
          media: { include: { externalLinks: true } },
        },
      },
      media: { include: { node: { include: { externalLinks: true } } } },
    },
    where: {
      pack: {
        installs: {
          some: {
            guildId,
          },
        },
      },
      OR: [
        { title: { contains: search } },
        { id: { contains: search } },
        { alternative: { has: search } },
      ],
    },
  });
}

async function media({
  ids,
  search,
  guildId,
}: {
  ids?: string[];
  search?: string;
  guildId: string;
}) {
  if (ids?.length) {
    // remove duplicates
    ids = Array.from(new Set(ids));

    const results = await packs.findById<PackMedia>({
      ids,
      guildId,
      key: 'media',
    });

    return Object.values(results);
  } else if (search) {
    const match = await packs.searchOneMedia({ search, guildId });

    return match ? [match] : [];
  } else {
    return [];
  }
}

async function characters({
  ids,
  search,
  guildId,
}: {
  ids?: string[];
  search?: string;
  guildId: string;
}) {
  if (ids?.length) {
    // remove duplicates
    ids = Array.from(new Set(ids));

    const results = await packs.findById<PackCharacter>({
      ids,
      guildId,
      key: 'characters',
    });

    return Object.values(results);
  } else if (search) {
    const match = await packs.searchOneCharacter({ search, guildId });

    return match ? [match] : [];
  } else {
    return [];
  }
}

async function mediaCharacters({
  id,
  search,
  guildId,
  index,
}: {
  id?: string;
  search?: string;
  guildId: string;
  index: number;
}) {
  const results = await packs.media(
    id ? { guildId, ids: [id] } : { search, guildId }
  );

  const media = results[0];

  if (!results.length) {
    throw new Error('404');
  }

  const total = media.characters?.length ?? 0;

  const character = media.characters?.[index];

  return {
    total,
    media,
    role: character?.role,
    character: character?.node,
    next: index + 1 < total,
  };
}

function formatToString(format?: MEDIA_FORMAT | null): string {
  if (!format || format === MEDIA_FORMAT.MUSIC) {
    return '';
  }

  return utils.capitalize(
    format
      .replace(/TV_SHORT|OVA|ONA/, 'Short')
      .replace('VIDEO_GAME', 'Video Game')
      .replace('TV', 'Anime')
  ) as string;
}

function mediaToString({
  media,
  relation,
}: {
  media: { title: string; format?: MEDIA_FORMAT | null };
  relation?: MEDIA_RELATION;
}): string {
  const { title } = media;

  switch (relation) {
    case MEDIA_RELATION.PREQUEL:
    case MEDIA_RELATION.SEQUEL:
    case MEDIA_RELATION.SPIN_OFF:
    case MEDIA_RELATION.SIDE_STORY:
      return [title, `(${utils.capitalize(relation)})`].join(' ');
    default: {
      const format = formatToString(media.format);

      if (!format) {
        return title;
      }

      return [title, `(${format})`].join(' ');
    }
  }
}

export default packs;
