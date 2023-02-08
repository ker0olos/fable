import _anilist from '../packs/anilist/manifest.json' assert {
  type: 'json',
};

import _vtubers from '../packs/vtubers/manifest.json' assert {
  type: 'json',
};

import * as anilist from '../packs/anilist/index.ts';

import utils from './utils.ts';

import * as discord from './discord.ts';

import {
  Alias,
  Character,
  CharacterRole,
  DisaggregatedCharacter,
  DisaggregatedMedia,
  Manifest,
  ManifestType,
  Media,
  MediaFormat,
  MediaRelation,
  Pool,
} from './types.ts';

const anilistManifest = _anilist as Manifest;
const vtubersManifest = _vtubers as Manifest;

type MediaEdge = { node: Media; relation?: MediaRelation };
type CharacterEdge = { node: Character; role?: CharacterRole };

type All = Media | DisaggregatedMedia | Character | DisaggregatedCharacter;

// TODO FIX this should be cached on database for each server
// updated each time a pack is installed
let manual: Manifest[] | undefined = undefined;

// TODO FIX this should be cached on database for each server
// updated each time a pack is installed
let disabled: { [key: string]: boolean } | undefined = undefined;

const packs = {
  embed,
  list,
  searchMany,
  media,
  characters,
  aggregate,
  commands,
  pool,
  isDisabled,
  aliasToArray,
  formatToString,
  mediaToString,
  sortMedia,
  sortCharacters,
  // used in tests to clear cache
  clear: () => {
    manual = undefined;
    disabled = undefined;
  },
};

async function commands(
  name: string,
  interaction: discord.Interaction<unknown>,
): Promise<discord.Message | undefined> {
  if (anilistManifest.commands && name in anilistManifest.commands) {
    const command = anilistManifest.commands[name];
    return await anilist.default
      [command.source as keyof typeof anilist.default](
        // deno-lint-ignore no-explicit-any
        interaction.options as any,
      );
  }
}

function list(type?: ManifestType): Manifest[] {
  // TODO FIX this should be cached on database for each server
  if (!manual) {
    // TODO BLOCKED load manual packs
    // (see https://github.com/ker0olos/fable/issues/10)
    // then map each loaded pack to 'dict'
    // 1^ block loading packs if name is used for builtins
    // for example never accept packs named anilist even if the builtin anilist is disabled
    manual = [];
  }

  switch (type) {
    case ManifestType.Builtin:
      return [
        anilistManifest,
        vtubersManifest,
      ];
    case ManifestType.Manual:
      return [...manual];
    default:
      return [
        vtubersManifest,
        ...manual,
      ];
  }
}

function dict(): { [key: string]: Manifest } {
  return packs.list().reduce(
    (
      obj: { [key: string]: Manifest },
      manifest,
    ) => (obj[manifest.id] = manifest, obj),
    {},
  );
}

function embed(
  { manifest, page, total }: {
    manifest?: Manifest;
    page?: number;
    total: number;
  },
): discord.Message {
  if (!manifest) {
    const embed = new discord.Embed().setDescription(
      'No packs have been added yet',
    );

    return new discord.Message()
      .addEmbed(embed);
  }

  const disclaimer = manifest.type === ManifestType.Builtin
    ? new discord.Embed().setDescription(
      'Builtin packs are developed and maintained directly by Fable',
    )
    : new discord.Embed().setDescription(
      'The following third-party packs were manually added by your server members',
    );

  const pack = new discord.Embed()
    .setUrl(manifest.url)
    .setDescription(manifest.description)
    .setAuthor({ name: manifest.author })
    .setThumbnail({ url: manifest.image, default: false, proxy: false })
    .setTitle(manifest.title ?? manifest.id);

  if (!manifest.type) {
    throw new Error(`Manifest "${manifest.id}" type is undefined`);
  }

  const message = discord.Message.page({
    page,
    total,
    id: manifest.type,
    message: new discord.Message()
      .addEmbed(disclaimer)
      .addEmbed(pack),
  });

  return message;
}

async function findById<T>(
  key: 'media' | 'characters',
  ids: string[],
  defaultId?: string,
): Promise<{ [key: string]: T }> {
  const anilistIds: number[] = [];

  const results: { [key: string]: T } = {};

  for (const literal of [...new Set(ids)]) {
    let id: string;
    let packId: string;

    const split = /^([-_a-z0-9]+):([-_a-z0-9]+)$/.exec(literal);

    if (split?.length === 3) {
      [, packId, id] = split;
    } else if (defaultId && /^([-_a-z0-9]+)$/.test(literal)) {
      [packId, id] = [defaultId, literal];
    } else {
      continue;
    }

    if (packId === 'anilist') {
      const n = utils.parseId(id);

      if (typeof n === 'number' && !packs.isDisabled(`anilist:${n}`)) {
        anilistIds.push(n);
      }
    } else {
      if (packs.isDisabled(`${packId}:${id}`)) {
        continue;
      }

      // search for the id in packs
      // deno-lint-ignore no-explicit-any
      const match: All = (dict()[packId]?.[key]?.new as Array<any>)?.find((
        m,
      ) => m.id === id);

      if (match) {
        results[literal] = (match.packId = packId, match) as T;
      }
    }
  }

  // request the ids from anilist
  const anilistResults = await anilist[key](
    { ids: anilistIds },
  );

  anilistResults.forEach((item) =>
    results[`anilist:${item.id}`] = anilist.transform<T>({ item })
  );

  return results;
}

async function searchMany<
  T extends (Media | DisaggregatedMedia | Character | DisaggregatedCharacter),
>(
  key: 'media' | 'characters',
  search: string,
  threshold = 65,
): Promise<T[]> {
  const percentages: Set<number> = new Set();

  const possibilities: { [percentage: number]: T[] } = {};

  const anilistPack: Manifest = {
    id: 'anilist',
    [key]: {
      new: (await anilist[key]({ search })).map((item) =>
        anilist.transform({ item })
      ),
    },
  };

  for (const pack of [anilistPack, ...packs.list()]) {
    for (const item of pack[key]?.new ?? []) {
      if (packs.isDisabled(`${pack.id}:${item.id}`)) {
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
  key: 'media' | 'characters',
  search: string,
): Promise<T | undefined> {
  const possibilities = await searchMany<T>(key, search);

  return possibilities?.[0];
}

async function media({ ids, search }: {
  ids?: string[];
  search?: string;
}): Promise<(Media | DisaggregatedMedia)[]> {
  if (ids?.length) {
    const results = await findById<Media | DisaggregatedMedia>(
      'media',
      ids,
    );

    return Object.values(results);
  } else if (search) {
    const match: Media | DisaggregatedMedia | undefined = await searchOne(
      'media',
      search,
    );

    return match ? [match] : [];
  } else {
    return [];
  }
}

async function characters({ ids, search }: {
  ids?: string[];
  search?: string;
}): Promise<(Character | DisaggregatedCharacter)[]> {
  if (ids?.length) {
    const results = await findById<Character | DisaggregatedCharacter>(
      'characters',
      ids,
    );

    return Object.values(results);
  } else if (search) {
    const match: Character | DisaggregatedCharacter | undefined =
      await searchOne(
        'characters',
        search,
      );

    return match ? [match] : [];
  } else {
    return [];
  }
}

async function aggregate<T>({ media, character }: {
  media?: Media | DisaggregatedMedia;
  character?: Character | DisaggregatedCharacter;
}): Promise<T> {
  if (media) {
    if (
      (media.relations && 'edges' in media.relations) ||
      (media.characters && 'edges' in media.characters)
    ) {
      return media as T;
    }

    media = media as DisaggregatedMedia;

    const mediaIds = (media.relations instanceof Array ? media.relations : [])
      .map((
        { mediaId },
      ) => mediaId);

    const characterIds =
      (media.characters instanceof Array ? media.characters : [])
        .map((
          { characterId },
        ) => characterId);

    const [mediaRefs, characterRefs] = await Promise.all([
      findById<Media>('media', mediaIds, media.packId),
      findById<Character>('characters', characterIds, media.packId),
    ]);

    const t: Media = {
      ...media,
      relations: {
        edges: media.relations
          ?.map(({ relation, mediaId }) => ({
            relation,
            node: mediaRefs[mediaId],
          })).filter(({ node }) => Boolean(node)) ?? [],
      },
      characters: {
        edges: media.characters
          ?.map(({ role, characterId }) => ({
            role,
            node: characterRefs[characterId],
          })).filter(({ node }) => Boolean(node)) ?? [],
      },
    };

    return t as T;
  } else if (character) {
    if (character.media && 'edges' in character.media) {
      return character as T;
    }

    character = character as DisaggregatedCharacter;

    const mediaIds = (character.media instanceof Array ? character.media : [])
      .map((
        { mediaId },
      ) => mediaId);

    const [mediaRefs] = [
      await findById<Media>('media', mediaIds, character.packId),
    ];

    const t: Character = {
      ...character,
      media: {
        edges: character.media
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

async function pool({ range, role }: {
  range: number[];
  role?: CharacterRole;
}): Promise<Pool['']['ALL']> {
  const t = (await utils.readJson<Pool>('packs/anilist/pool.json'))[
    JSON.stringify(range)
  ][
    role || 'ALL'
  ];

  // add characters from packs
  packs
    .list()
    .forEach((pack) => {
      t.push(
        ...(pack.characters?.new?.map((character) => ({
          id: `${pack.id}:${character.id}`,
        })) ?? []),
      );
    });

  return t;
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

function isDisabled(id: string): boolean {
  // TODO FIX this should be cached on database for each server
  if (!disabled) {
    disabled = {};

    packs.list().forEach((pack) => {
      // deno-lint-ignore no-non-null-assertion
      pack.media?.conflicts?.forEach((id) => disabled![id] = true);
      // deno-lint-ignore no-non-null-assertion
      pack.characters?.conflicts?.forEach((id) => disabled![id] = true);
    });
  }

  return disabled[id];
}

function formatToString(format: MediaFormat): string {
  return utils.capitalize(
    format
      .replace(/TV_SHORT|OVA|ONA/, 'Short')
      .replace('TV', 'Anime'),
  ) as string;
}

function mediaToString(
  { media, relation }: {
    media: Media;
    relation?: MediaRelation;
  },
): string {
  const title = packs.aliasToArray(media.title, 40)[0];

  switch (media.format) {
    case MediaFormat.Music:
    case MediaFormat.Internet:
      return title;
    default:
      break;
  }

  switch (relation) {
    case MediaRelation.Prequel:
    case MediaRelation.Sequel:
    case MediaRelation.SpinOff:
    case MediaRelation.SideStory:
      return `${title} (${utils.capitalize(relation)})`;
    default:
      return `${title} (${formatToString(media.format)})`;
  }
}

function sortMedia(
  edges?: MediaEdge[],
): MediaEdge[] | undefined {
  if (!edges?.length) {
    return;
  }

  return edges.sort((a, b) => {
    return (b.node.popularity || 0) - (a.node.popularity || 0);
  });
}

function sortCharacters(
  edges?: CharacterEdge[],
): CharacterEdge[] | undefined {
  if (!edges?.length) {
    return;
  }

  return edges.sort((a, b) => {
    return (b.node.popularity || 0) - (a.node.popularity || 0);
  });
}

export default packs;
