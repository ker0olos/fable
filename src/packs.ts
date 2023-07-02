import '#filter-boolean';

import _anilistManifest from '../packs/anilist/manifest.json' assert {
  type: 'json',
};

import _vtubersManifest from '../packs/vtubers/manifest.json' assert {
  type: 'json',
};

import * as _anilist from '../packs/anilist/index.ts';

import * as discord from './discord.ts';

import { gql, request } from './graphql.ts';

import config, { faunaUrl } from './config.ts';

import utils from './utils.ts';

import Rating from './rating.ts';

import {
  Alias,
  Character,
  CharacterRole,
  DisaggregatedCharacter,
  DisaggregatedMedia,
  Manifest,
  Media,
  MediaFormat,
  MediaRelation,
  Pack,
  PackInstall,
  Pool,
  Schema,
} from './types.ts';

import { NonFetalError } from './errors.ts';

import { AniListMedia } from '../packs/anilist/types.ts';

const anilistManifest = _anilistManifest as Manifest;
const vtubersManifest = _vtubersManifest as Manifest;

type AnilistSearchOptions = {
  page: number;
  perPage: number;
};

const cachedGuilds: Record<string, PackInstall[]> = {};

const packs = {
  aggregate,
  aliasToArray,
  all,
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
  pool,
  searchMany,
  uninstall,
  uninstallDialog,
};

async function all(
  { guildId, filter }: { guildId?: string; filter?: boolean },
): Promise<(PackInstall[])> {
  const query = gql`
    query ($guildId: String!) {
      getGuildInstance(guildId: $guildId) {
        packs {
          by
          ref {
            approved
            manifest {
              id
              title
              description
              author
              image
              url
              media {
                conflicts
                new {
                  id
                  type
                  title {
                    english
                    romaji
                    native
                    alternative
                  }
                  format
                  description
                  popularity
                  images {
                    url
                    artist {
                      username
                      url
                    }
                  }
                  externalLinks {
                    url
                    site
                  }
                  trailer {
                    id
                    site
                  }
                  relations {
                    relation
                    mediaId
                  }
                  characters {
                    role
                    characterId
                  }
                }
              }
              characters {
                conflicts
                new {
                  id
                  name {
                    english
                    romaji
                    native
                    alternative
                  }
                  description
                  popularity
                  gender
                  age
                  images {
                    url
                    artist {
                      username
                      url
                    }
                  }
                  externalLinks {
                    url
                    site
                  }
                  media {
                    role
                    mediaId
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const builtins = [
    { ref: { manifest: anilistManifest } },
    { ref: { manifest: vtubersManifest } },
  ];

  if (!guildId || !config.communityPacks) {
    if (filter) {
      return [];
    }

    return builtins;
  }

  if (guildId in packs.cachedGuilds) {
    if (filter) {
      return packs.cachedGuilds[guildId];
    }

    return [...builtins, ...packs.cachedGuilds[guildId]];
  }

  const response = (await request<{
    getGuildInstance: { packs: { ref: Pack }[] };
  }>({
    query,
    url: faunaUrl,
    headers: { 'authorization': `Bearer ${config.faunaSecret}` },
    variables: { guildId },
  })).getGuildInstance;

  packs.cachedGuilds[guildId] = response.packs;

  if (filter) {
    return response.packs;
  }

  return [...builtins, ...response.packs];
}

function isDisabled(id: string, list: PackInstall[]): boolean {
  const disabled: Record<string, boolean> = {};

  // TODO refactor to avoid this the loops-purgatory
  list.forEach(({ ref: { manifest } }) => {
    manifest.media?.conflicts?.forEach((id) => disabled[id] = true);
    manifest.characters?.conflicts?.forEach((id) => disabled[id] = true);
  });

  return disabled[id];
}

function packEmbed(pack: PackInstall): discord.Embed {
  const embed = new discord.Embed()
    .setFooter({ text: pack.ref.manifest.author })
    .setDescription(pack.ref.manifest.description)
    .setThumbnail({
      url: pack.ref.manifest.image,
      default: false,
      proxy: false,
    })
    .setTitle(pack.ref.manifest.title ?? pack.ref.manifest.id);

  return embed;
}

function uninstallDialog(
  { pack, userId }: { pack: PackInstall; userId: string },
): discord.Message {
  const message = new discord.Message()
    .addEmbed(packEmbed(pack));

  return discord.Message.dialog({
    userId,
    message,
    type: 'uninstall',
    confirm: discord.join(pack.ref.manifest.id, userId),
    description:
      `**Are you sure you want to uninstall this pack?**\n\nUninstalling a pack will disable any characters your server members have from the pack, which may be met with negative reactions.`,
  });
}

async function pages(
  { index, guildId }: {
    index: number;
    guildId: string;
  },
): Promise<discord.Message> {
  if (!config.communityPacks) {
    throw new NonFetalError(
      'Community Packs are under maintenance, try again later!',
    );
  }

  const list = (await packs.all({ guildId })).toReversed();

  const pack = list[index];

  if (!pack) {
    throw new NonFetalError('This pack doesn\'t exist');
  }

  const embed = packEmbed(pack);

  const message = new discord.Message()
    .addEmbed(embed);

  if (pack.ref.manifest.url) {
    message.addComponents([
      new discord.Component()
        .setLabel('Homepage')
        .setUrl(pack.ref.manifest.url),
    ]);
  }

  return discord.Message.page({
    index,
    type: 'packs',
    total: list.length,
    next: list.length > index + 1,
    message,
  });
}

async function install(
  { id, guildId, userId }: { id: string; guildId: string; userId: string },
): Promise<discord.Message> {
  if (!config.communityPacks) {
    throw new NonFetalError(
      'Community Packs are under maintenance, try again later!',
    );
  }

  const mutation = gql`
    mutation ($userId: String!, $guildId: String!, $packId: String!) {
      addPackToInstance(userId: $userId, guildId: $guildId, packId: $packId) {
        ok
        error
        install {
          ref {
            manifest {
              id
              title
              description
              author
              image
              url
            }
          }
        }
      }
    }
  `;

  const response = (await request<{
    addPackToInstance: Schema.Mutation;
  }>({
    url: faunaUrl,
    query: mutation,
    headers: {
      'authorization': `Bearer ${config.faunaSecret}`,
    },
    variables: {
      userId,
      guildId,
      packId: id,
    },
  })).addPackToInstance;

  if (response.ok) {
    // clear guild cache after uninstall
    delete cachedGuilds[guildId];

    const message = new discord.Message()
      .addEmbed(new discord.Embed().setDescription('Installed'))
      .addEmbed(packEmbed(response.install));

    return message;
  } else {
    switch (response.error) {
      case 'PACK_PRIVATE':
        throw new NonFetalError(
          'This pack is private and cannot be installed by you',
        );
      case 'PACK_NOT_FOUND':
        throw new Error('404');
      default:
        throw new Error(response.error);
    }
  }
}

async function uninstall(
  { guildId, id }: { guildId: string; id: string },
): Promise<discord.Message> {
  if (!config.communityPacks) {
    throw new NonFetalError(
      'Community Packs are under maintenance, try again later!',
    );
  }

  const message = new discord.Message();

  const mutation = gql`
    mutation ($guildId: String!, $packId: String!) {
      removePackFromInstance(guildId: $guildId, packId: $packId) {
        ok
        error
        uninstall {
          manifest {
            id
            title
            description
            author
            image
            url
          }
        }
      }
    }
  `;

  const response = (await request<{
    removePackFromInstance: Schema.Mutation;
  }>({
    url: faunaUrl,
    query: mutation,
    headers: {
      'authorization': `Bearer ${config.faunaSecret}`,
    },
    variables: {
      guildId,
      packId: id,
    },
  })).removePackFromInstance;

  if (response.ok) {
    // clear guild cache after uninstall
    delete cachedGuilds[guildId];

    return message
      .addEmbed(new discord.Embed().setDescription('Uninstalled'))
      .addEmbed(
        new discord.Embed().setDescription(
          '**All characters from this pack are now disabled**',
        ),
      )
      .addEmbed(packEmbed({ ref: response.uninstall }));
  } else {
    switch (response.error) {
      case 'PACK_NOT_FOUND':
      case 'PACK_NOT_INSTALLED':
        throw new Error('404');
      default:
        throw new Error(response.error);
    }
  }
}

function parseId(
  literal: string,
  defaultPackId?: string,
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

async function findById<T>(
  { key, ids, guildId, anilistOptions, defaultPackId }: {
    key: 'media' | 'characters';
    ids: string[];
    guildId: string;
    anilistOptions?: AnilistSearchOptions;
    defaultPackId?: string;
  },
): Promise<{ [key: string]: T }> {
  const anilistIds: number[] = [];

  const results: { [key: string]: T } = {};

  const list = await packs.all({ guildId });

  ids = ids.filter((id) => !packs.isDisabled(id, list));

  for (const literal of [...new Set(ids)]) {
    const [packId, id] = parseId(literal, defaultPackId);

    if (!packId || !id) {
      continue;
    }

    if (packId === 'anilist') {
      const n = utils.parseInt(id);

      if (typeof n === 'number') {
        anilistIds.push(n);
      }
    } else {
      const pack = list.find(({ ref: { manifest } }) => manifest.id === packId);

      // search for the id in packs
      const match = (pack?.ref?.manifest[key]?.new as Array<
        DisaggregatedCharacter | DisaggregatedMedia
      >)?.find((m) => m.id === id);

      if (match) {
        results[literal] = (match.packId = packId, match) as T;
      }
    }
  }

  // request the ids from anilist
  const anilistResults = await _anilist[key](
    { ids: anilistIds, ...anilistOptions },
  );

  anilistIds.forEach((n) => {
    const i = anilistResults.findIndex((r) => `${r.id}` === `${n}`);

    if (i > -1) {
      results[`anilist:${n}`] = _anilist.transform<T>({
        item: anilistResults[i],
      });
    }
  });

  return results;
}

async function searchMany<
  T extends (Media | DisaggregatedMedia | Character | DisaggregatedCharacter),
>(
  { key, search, guildId, anilistOptions, threshold }: {
    key: 'media' | 'characters';
    search: string;
    guildId: string;
    anilistOptions?: AnilistSearchOptions;
    threshold?: number;
  },
): Promise<T[]> {
  threshold = threshold ?? 65;

  const percentages: Set<number> = new Set();

  const possibilities: { [percentage: number]: T[] } = {};

  const anilistPack: Manifest = {
    id: 'anilist',
    [key]: {
      new: (await _anilist[key]({ search, ...anilistOptions })).map((item) =>
        _anilist.transform({ item })
      ),
    },
  };

  const list = await packs.all({ guildId });

  for (
    const pack of [
      anilistPack,
      ...list.map(({ ref: { manifest } }) => manifest),
    ]
  ) {
    for (const item of pack[key]?.new ?? []) {
      // filter out disabled ids
      if (packs.isDisabled(`${pack.id}:${item.id}`, list)) {
        continue;
      }

      const all = packs.aliasToArray(
        'name' in item ? item.name : item.title,
      ).map((alias) => utils.distance(search, alias));

      if (!all.length) {
        return [];
      }

      const percentage = Math.max(...all);

      if (percentage < threshold) {
        continue;
      }

      if (!possibilities[percentage]) {
        possibilities[percentage] = (percentages.add(percentage), []);
      }

      possibilities[percentage]
        .push((item.packId = pack.id, item) as T);
    }
  }

  const sorted = [...percentages]
    .sort((a, b) => b - a);

  let output: T[] = [];

  for (const i of sorted) {
    output = output.concat(
      possibilities[i].sort((a, b) =>
        (b.popularity || 0) - (a.popularity || 0)
      ),
    );
  }

  return output;
}

async function searchOne<
  T extends (Media | DisaggregatedMedia | Character | DisaggregatedCharacter),
>(
  { key, search, guildId, anilistOptions }: {
    key: 'media' | 'characters';
    search: string;
    guildId: string;
    anilistOptions?: AnilistSearchOptions;
  },
): Promise<T | undefined> {
  const possibilities = await searchMany<T>({
    key,
    search,
    guildId,
    anilistOptions,
  });

  return possibilities?.[0];
}

async function media({ ids, search, guildId, anilistOptions }: {
  ids?: string[];
  search?: string;
  guildId: string;
  anilistOptions?: AnilistSearchOptions;
}): Promise<(Media | DisaggregatedMedia)[]> {
  if (ids?.length) {
    const results = await findById<Media | DisaggregatedMedia>(
      {
        ids,
        guildId,
        key: 'media',
        anilistOptions,
      },
    );

    return Object.values(results);
  } else if (search) {
    const match: Media | DisaggregatedMedia | undefined = await searchOne(
      { key: 'media', search, guildId, anilistOptions },
    );

    return match ? [match] : [];
  } else {
    return [];
  }
}

async function characters({ ids, search, guildId }: {
  ids?: string[];
  search?: string;
  guildId: string;
}): Promise<(Character | DisaggregatedCharacter)[]> {
  if (ids?.length) {
    const results = await findById<Character | DisaggregatedCharacter>(
      {
        ids,
        guildId,
        key: 'characters',
      },
    );

    return Object.values(results);
  } else if (search) {
    const match: Character | DisaggregatedCharacter | undefined =
      await searchOne(
        { key: 'characters', search, guildId },
      );

    return match ? [match] : [];
  } else {
    return [];
  }
}

async function mediaCharacters({ id, search, guildId, index }: {
  id?: string;
  search?: string;
  guildId: string;
  index: number;
}): Promise<
  {
    media?: Media | DisaggregatedMedia;
    role?: CharacterRole;
    character?: DisaggregatedCharacter;
    total?: number;
    next: boolean;
  }
> {
  const results: (Media | DisaggregatedMedia)[] = await packs
    .media(
      id
        ? {
          guildId,
          ids: [id],
          anilistOptions: {
            perPage: 1,
            page: index + 1,
          },
        }
        : {
          search,
          guildId,
          anilistOptions: {
            perPage: 1,
            page: index + 1,
          },
        },
    );

  if (!results.length) {
    throw new Error('404');
  }

  if (results[0].packId === 'anilist') {
    return {
      next: Boolean(
        (results[0] as AniListMedia).characters?.pageInfo.hasNextPage,
      ),
      media: results[0] as AniListMedia,
      role: (results[0] as AniListMedia).characters?.edges?.[0].role,
      character: (results[0] as AniListMedia).characters?.edges?.[0]
        ?.node as DisaggregatedCharacter,
    };
  } else {
    const total = (results[0] as DisaggregatedMedia).characters?.length || 0;

    const media = await aggregate<Media>({
      media: results[0],
      start: index,
      end: 1,
      guildId,
    });

    return {
      total,
      media,
      role: media.characters?.edges?.[0]?.role,
      character: media.characters?.edges?.[0]?.node as DisaggregatedCharacter,
      next: index + 1 < total,
    };
  }
}

async function aggregate<T>({ media, character, start, end, guildId }: {
  media?: Media | DisaggregatedMedia;
  character?: Character | DisaggregatedCharacter;
  start?: number;
  end?: number;
  guildId: string;
}): Promise<T> {
  start = start || 0;

  if (end) {
    end = start + (end || 1);
  }

  const list = await packs.all({ guildId });

  if (media) {
    if (
      (media.relations && 'edges' in media.relations) ||
      (media.characters && 'edges' in media.characters)
    ) {
      if (media.relations && 'edges' in media.relations) {
        media.relations.edges = media.relations.edges.filter((edge) =>
          !packs.isDisabled(`anilist:${edge.node.id}`, list)
        );
      }

      if (media.characters && 'edges' in media.characters) {
        media.characters.edges = media.characters.edges.filter((edge) =>
          !packs.isDisabled(`anilist:${edge.node.id}`, list)
        );
      }

      return media as T;
    }

    media = media as DisaggregatedMedia;

    const mediaIds = (media.relations instanceof Array
      ? media.relations.slice(start, end)
      : [])
      .map((
        { mediaId },
      ) =>
        mediaId
      );

    const characterIds = (media.characters instanceof Array
      ? media.characters.slice(start, end)
      : [])
      .map((
        { characterId },
      ) => characterId);

    const [mediaRefs, characterRefs] = await Promise.all([
      findById<Media>({
        guildId,
        key: 'media',
        ids: mediaIds,
        defaultPackId: media.packId,
      }),
      findById<Character>({
        guildId,
        key: 'characters',
        ids: characterIds,
        defaultPackId: media.packId,
      }),
    ]);

    const t: Media = {
      ...media,
      relations: {
        edges: media.relations?.slice(start, end)
          ?.filter(({ mediaId }) => {
            // deno-lint-ignore no-non-null-assertion
            const [packId, id] = parseId(mediaId, media!.packId);

            return !packs.isDisabled(`${packId}:${id}`, list);
          })
          ?.map(({ relation, mediaId }) => ({
            relation,
            node: mediaRefs[mediaId],
          })).filter(({ node }) => Boolean(node)) ?? [],
      },
      characters: {
        edges: media.characters?.slice(start, end)
          ?.filter(({ characterId }) => {
            // deno-lint-ignore no-non-null-assertion
            const [packId, id] = parseId(characterId, media!.packId);

            return !packs.isDisabled(`${packId}:${id}`, list);
          })
          ?.map(({ role, characterId }) => ({
            role,
            node: characterRefs[characterId],
          })).filter(({ node }) => Boolean(node)) ?? [],
      },
    };

    return t as T;
  } else if (character) {
    if (character.media && 'edges' in character.media) {
      character.media.edges = character.media.edges.filter((edge) =>
        !packs.isDisabled(`anilist:${edge.node.id}`, list)
      );
      return character as T;
    }

    character = character as DisaggregatedCharacter;

    const mediaIds = (character.media instanceof Array
      ? character.media.slice(start, end)
      : [])
      .map(({ mediaId }) =>
        mediaId
      );

    const [mediaRefs] = [
      await findById<Media>({
        guildId,
        key: 'media',
        ids: mediaIds,
        defaultPackId: character.packId,
      }),
    ];

    const t: Character = {
      ...character,
      media: {
        edges: character.media?.slice(start, end)
          ?.filter(({ mediaId }) => {
            // deno-lint-ignore no-non-null-assertion
            const [packId, id] = parseId(mediaId, character!.packId);

            return !packs.isDisabled(`${packId}:${id}`, list);
          })
          ?.map(({ role, mediaId }) => ({
            role,
            node: mediaRefs[mediaId],
          })).filter(({ node }) => Boolean(node)) ?? [],
      },
    };

    return t as T;
  }

  throw new Error();
}

async function pool({ guildId, range, role, stars }: {
  guildId: string;
  range?: number[];
  role?: CharacterRole;
  stars?: number;
}): Promise<Pool['']['ALL']> {
  const [list, anilist] = await Promise.all([
    await packs.all({ guildId }),
    utils.readJson<Pool>('packs/anilist/pool.json'),
  ]);

  let pool: Pool[0]['ALL'] = [];

  if (typeof stars === 'number') {
    Object.values(anilist).forEach((range) => {
      pool = pool.concat(range.ALL);
    });
  } else {
    pool = anilist[JSON.stringify(range)][role ?? 'ALL'];
  }

  await Promise.all(list.map(async ({ ref: { manifest } }) => {
    if (manifest.characters && Array.isArray(manifest.characters.new)) {
      const characters = await Promise.all(
        manifest.characters.new.map(async (char) => {
          char.packId = manifest.id;

          const character = await packs.aggregate<Character>({
            guildId,
            character: char,
          });

          const media = character.media?.edges?.[0]?.node;

          if (media) {
            const rating = Rating.fromCharacter(character).stars;

            return {
              id: `${manifest.id}:${character.id}`,
              mediaId: `${media.packId}:${media.id}`,
              rating,
            };
          }
        }),
      );

      pool = pool.concat(characters.filter(Boolean));
    }
  }));

  const occurrences: Record<string, boolean> = {};

  // shuffle here is to ensure that occurrences are randomly ordered
  utils.shuffle(pool);

  return pool.filter(({ mediaId, rating }) => {
    if (typeof stars === 'number' && rating !== stars) {
      return false;
    }

    if (occurrences[mediaId]) {
      return false;
    }

    return (occurrences[mediaId] = true);
  });
}

function aliasToArray(
  alias: Alias,
  max?: number,
): string[] {
  const set = new Set(
    [
      alias.english,
      alias.romaji,
      alias.native,
    ]
      .concat(alias.alternative ?? [])
      .filter(Boolean)
      .map((str) => max ? utils.truncate(str, max) : str),
  );

  return Array.from(set) as string[];
}

function formatToString(format?: MediaFormat): string {
  if (!format || format === MediaFormat.Music) {
    return '';
  }

  return utils.capitalize(
    format
      .replace(/TV_SHORT|OVA|ONA/, 'Short')
      .replace('VIDEO_GAME', 'Video Game')
      .replace('TV', 'Anime'),
  ) as string;
}

function mediaToString(
  { media, relation }: {
    media: Media | DisaggregatedMedia;
    relation?: MediaRelation;
  },
): string {
  const title = packs.aliasToArray(media.title, 40)[0];

  switch (relation) {
    case MediaRelation.Prequel:
    case MediaRelation.Sequel:
    case MediaRelation.SpinOff:
    case MediaRelation.SideStory:
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
