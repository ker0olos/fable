import { distance } from 'https://raw.githubusercontent.com/ka-weihe/fastest-levenshtein/1.0.15/mod.ts';

import { Embed, Interaction, Message } from './discord.ts';

import _anilist from '../packs/anilist/manifest.json' assert {
  type: 'json',
};

import _vtubers from '../packs/vtubers/manifest.json' assert {
  type: 'json',
};

import _x from '../packs/x/manifest.json' assert {
  type: 'json',
};

import * as x from '../packs/x/index.ts';
import * as anilist from '../packs/anilist/index.ts';

import utils from './utils.ts';

import {
  Alias,
  Character,
  CharacterRole,
  DisaggregatedCharacter,
  DisaggregatedMedia,
  Image,
  Manifest,
  ManifestType,
  Media,
  MediaType,
  Pool,
} from './types.ts';

const anilistManifest = _anilist as Manifest;
const vtubersManifest = _vtubers as Manifest;
const xManifest = _x as Manifest;

type All = Media | DisaggregatedMedia | Character | DisaggregatedCharacter;

let manual: Manifest[];

const packs = {
  embed,
  list,
  media,
  characters,
  aggregate,
  commands,
  pool,
  aliasToArray,
  imagesToArray,
};

async function commands(
  name: string,
  interaction: Interaction<unknown>,
): Promise<Message | undefined> {
  if (anilistManifest.commands && name in anilistManifest.commands) {
    const command = anilistManifest.commands[name];
    return await anilist.default
      [command.source as keyof typeof anilist.default](
        // deno-lint-ignore no-explicit-any
        interaction.options as any,
      );
  }

  if (xManifest.commands && name in xManifest.commands) {
    const command = xManifest.commands[name];
    return x.default[command.source as keyof typeof x.default](
      // deno-lint-ignore no-explicit-any
      interaction.options as any,
      interaction,
    );
  }
}

function list(type?: ManifestType): Manifest[] {
  if (!manual) {
    // TODO BLOCKED load manual packs
    // (see https://github.com/ker0olos/fable/issues/10)
    // tje map each loaded pack to 'dict'
    manual = [];
  }

  switch (type) {
    case ManifestType.Builtin:
      return [
        anilistManifest,
        vtubersManifest,
        xManifest,
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

      if (typeof n === 'number') {
        anilistIds.push(n);
      }
    } else {
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

  anilistResults.forEach((item) => results[`anilist:${item.id}`] = item as T);

  return results;
}

async function findOne<T>(
  key: 'media' | 'characters',
  search: string,
  type?: MediaType,
): Promise<T | undefined> {
  let maxPopularity = -1;
  let minDistance = Infinity;
  let match: T | undefined = undefined;

  const anilistPack: Manifest = {
    id: 'anilist',
    [key]: {
      new: await anilist[key]({ search }),
    },
  };

  for (const pack of [anilistPack, ...packs.list()]) {
    for (const item of pack[key]?.new ?? []) {
      if (type && 'type' in item && item.type !== type) {
        continue;
      }

      packs.aliasToArray('name' in item ? item.name : item.title)
        .forEach(
          (alias) => {
            const d = distance(search, alias);
            const popularity = item.popularity || 0;

            if (
              d < minDistance ||
              (d === minDistance && popularity > maxPopularity)
            ) {
              minDistance = d;
              maxPopularity = popularity;
              match = (item.packId = pack.id, item) as T;
            }
          },
        );

      // exact match
      if (minDistance <= 0) {
        break;
      }
    }

    // exact match
    if (minDistance <= 0) {
      break;
    }
  }

  if (minDistance < search.length) {
    return match;
  }
}

async function media({ ids, search, type }: {
  ids?: string[];
  search?: string;
  type?: MediaType;
}): Promise<(Media | DisaggregatedMedia)[]> {
  if (ids?.length) {
    const results = await findById<Media | DisaggregatedMedia>(
      'media',
      ids,
    );

    return Object.values(results);
  } else if (search) {
    const match: Media | DisaggregatedMedia | undefined = await findOne(
      'media',
      search,
      type,
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
    const match: Character | DisaggregatedCharacter | undefined = await findOne(
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
    // overwrite

    const key = `${media.packId}:${media.id}`;

    for (const pack of packs.list()) {
      if (pack.media?.overwrite?.[key]) {
        media = {
          ...pack.media.overwrite[key],
          overwritePackId: pack.id,
          packId: media.packId,
          id: media.id,
        };
      }
    }

    // aggregate

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
    // overwrite

    const key = `${character.packId}:${character.id}`;

    for (const pack of packs.list()) {
      if (pack.characters?.overwrite?.[key]) {
        character = {
          ...pack.characters.overwrite[key],
          overwritePackId: pack.id,
          packId: character.packId,
          id: character.id,
        };
      }
    }

    // aggregate

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

async function pool(
  // deno-lint-ignore camelcase
  { popularity_greater, popularity_lesser, role }: {
    popularity_greater: number;
    popularity_lesser?: number;
    role?: CharacterRole;
  },
): Promise<Pool> {
  const pool = await anilist.pool({
    role,
    popularity_greater,
    popularity_lesser,
  });

  // add characters from packs
  packs
    .list()
    .forEach((pack) => {
      pack.characters?.new?.forEach((character) => {
        if (!pool[character.id]) {
          pool[character.id.toString()] = character;
        }
      });
    });

  // overwriting should be done by the receiving function
  // when the results are narrowed down to 1 character
  // to avoid unnecessary loops

  return pool;
}

function embed(
  { manifest, index, total }: {
    manifest?: Manifest;
    index?: number;
    total: number;
  },
): Message {
  if (!manifest) {
    return new Message()
      .setContent('No packs have been installed yet.');
  }

  const message = Message.page(
    {
      index,
      total,
      // deno-lint-ignore no-non-null-assertion
      id: manifest.type!,
      current: new Embed()
        .setUrl(manifest.url)
        .setDescription(manifest.description)
        .setAuthor({ name: manifest.author })
        .setThumbnail({ url: manifest.image })
        .setTitle(manifest.title ?? manifest.id),
    },
  );

  message
    .setContent(
      manifest.type === ManifestType.Builtin
        ? 'Builtin packs are developed and maintained directly by Fable.'
        : 'The following packs were installed manually by server members.',
    );

  return message;
}

function aliasToArray(
  alias: Alias,
  max?: number,
): string[] {
  let titles = [
    alias.english,
    alias.romaji,
    alias.native,
  ].concat(alias.alternative ?? []);

  titles = titles.filter(Boolean)
    .map((str) => max ? utils.truncate(str, max) : str);

  return titles as string[];
}

function imagesToArray(
  item: Image | undefined,
  order: 'large-first' | 'small-first',
  ideally?: keyof Image,
): string[] | undefined {
  if (!item) {
    return undefined;
  }

  let images = [];

  if (ideally && Boolean(item[ideally])) {
    // if (ideally && ideally in item && Boolean(item[ideally])) {
    return [item[ideally] as string];
  }

  images.push(
    item.extraLarge,
    item.large,
    item.medium,
  );

  images = images.filter(Boolean);

  if (order === 'small-first' && images.length > 1) {
    images.reverse();
  }

  return images as string[];
}

export default packs;
