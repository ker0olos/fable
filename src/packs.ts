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
const xManifest = _x as Manifest;

type MediaEdge = { node: Media; relation?: MediaRelation };
type CharacterEdge = { node: Character; role?: CharacterRole };

type All = Media | DisaggregatedMedia | Character | DisaggregatedCharacter;

let manual: Manifest[] | undefined = undefined;

let disabled: { [key: string]: boolean } | undefined = undefined;

const packs = {
  embed,
  list,
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
  //
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
    .setThumbnail({ url: manifest.image })
    .setTitle(manifest.title ?? manifest.id);

  if (!manifest.type) {
    throw new Error(`Manifest "${manifest.id}" type is undefined`);
  }

  const message = discord.Message.page({
    page,
    total,
    id: manifest.type,
    embeds: [
      disclaimer,
      pack,
    ],
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

async function findOne<T>(
  key: 'media' | 'characters',
  search: string,
): Promise<T | undefined> {
  let maxPopularity = -1;
  let match: T | undefined = undefined;

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

      const popularity = item.popularity || 0;

      packs.aliasToArray('name' in item ? item.name : item.title)
        .forEach(
          (alias) => {
            const percentage = utils.distance(search, alias);

            if (
              percentage >= 100 ||
              (percentage > 65 && popularity > maxPopularity)
            ) {
              match =
                (maxPopularity = popularity, item.packId = pack.id, item) as T;
            }
          },
        );
    }
  }

  return match;
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
    const match: Media | DisaggregatedMedia | undefined = await findOne(
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

async function pool(
  // deno-lint-ignore camelcase
  { popularity_greater, popularity_lesser, role }: {
    popularity_greater: number;
    popularity_lesser?: number;
    role?: CharacterRole;
  },
): Promise<Pool> {
  let dict: Pool = {};

  // add characters from packs
  packs
    .list()
    .forEach((pack) => {
      pack.characters?.new?.forEach((character) => {
        dict[`${pack.id}:${character.id}`] =
          (character.packId = pack.id, character);
      });
    });

  // request characters from anilist
  dict = await anilist.pool({
    role,
    popularity_greater,
    popularity_lesser,
  }, dict);

  return dict;
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
