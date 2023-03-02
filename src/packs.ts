import _anilistManifest from '../packs/anilist/manifest.json' assert {
  type: 'json',
};

import _vtubersManifest from '../packs/vtubers/manifest.json' assert {
  type: 'json',
};

import * as _anilist from '../packs/anilist/index.ts';

import * as discord from './discord.ts';

import utils from './utils.ts';
import github from './github.ts';
import config from './config.ts';

import validate from './validate.ts';

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

import { NonFetalError } from './errors.ts';

const anilistManifest = _anilistManifest as Manifest;
const vtubersManifest = _vtubersManifest as Manifest;

type All = Media | DisaggregatedMedia | Character | DisaggregatedCharacter;

// TODO FIX this should be cached on database for each server
// updated each time a pack is installed
let community: Manifest[] | undefined = undefined;

// TODO FIX this should be cached on database for each server
// updated each time a pack is installed
let disabled: { [key: string]: boolean } | undefined = undefined;

const packs = {
  aggregate,
  aliasToArray,
  anilist,
  characters,
  embed,
  formatToString,
  install,
  isDisabled,
  list,
  media,
  mediaCharacters,
  mediaToString,
  pool,
  searchMany,
  // used in tests to clear cache
  clear: () => {
    community = undefined;
    disabled = undefined;
  },
};

async function anilist(
  name: string,
  interaction: discord.Interaction<unknown>,
): Promise<discord.Message> {
  // deno-lint-ignore no-non-null-assertion
  const command = anilistManifest.commands![name];

  return await _anilist.default
    [command.source as keyof typeof _anilist.default](
      // deno-lint-ignore no-explicit-any
      interaction.options as any,
    );
}

function list(type?: ManifestType): Manifest[] {
  // TODO FIX this should be cached on database for each server
  if (!community) {
    // TODO load community packs
    // (see https://github.com/ker0olos/fable/issues/10)
    // then map each loaded pack to 'dict'
    // 1^ block loading packs if name is used for builtins
    // for example never accept packs named anilist even if the builtin anilist is disabled
    community = [];
  }

  switch (type) {
    case ManifestType.Builtin:
      return [
        anilistManifest,
        vtubersManifest,
      ];
    case ManifestType.Community:
      return [...community];
    default:
      return [
        vtubersManifest,
        ...community,
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
  { type, index }: {
    type: ManifestType;
    index: number;
  },
): discord.Message {
  const list = packs.list(type);

  if (!list.length) {
    const embed = new discord.Embed().setDescription(
      'No packs have been installed yet',
    );

    return new discord.Message()
      .addEmbed(embed);
  }

  const manifest = list[index];

  const disclaimer = manifest.type === ManifestType.Builtin
    ? new discord.Embed().setDescription(
      'Builtin packs are developed and maintained directly by Fable',
    )
    : new discord.Embed().setDescription(
      'The following third-party packs were manually installed by your server members',
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

  const message = new discord.Message()
    .addEmbed(disclaimer)
    .addEmbed(pack);

  return discord.Message.page({
    index,
    total: list.length,
    next: list.length > index + 1,
    message,
    type,
  });
}

function install({
  token,
  shallow,
  // userId,
  // guildId,
  url,
  ref,
}: {
  token: string;
  userId: string;
  guildId: string;
  channelId?: string;
  url: string;
  ref?: string;
  shallow?: boolean;
}): discord.Message {
  github.manifest({ url, ref })
    .then(async ({ repo, manifest }) => {
      const message = new discord.Message();

      // validate against json schema
      const valid = validate(manifest);

      if (valid.error) {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed()
              .setColor(discord.colors.red)
              .setDescription(valid.error),
          )
          .patch(token);
      }

      // shallow install is only meant as validation test
      if (shallow) {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed()
              .setColor(discord.colors.green)
              .setDescription('Valid'),
          )
          .patch(token);
      }

      // TODO add pack to the guild database
      message.setContent(`${repo.id}: ${manifest.id}`);

      return message.patch(token);
    })
    .catch(async (err) => {
      if (err instanceof NonFetalError) {
        return await new discord.Message()
          .setFlags(discord.MessageFlags.Ephemeral)
          .addEmbed(new discord.Embed().setDescription(err.message))
          .patch(token);
      }

      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  return new discord.Message()
    .setType(discord.MessageType.Loading);
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
  key: 'media' | 'characters',
  ids: string[],
  defaultPackId?: string,
): Promise<{ [key: string]: T }> {
  const anilistIds: number[] = [];

  const results: { [key: string]: T } = {};

  // filter out disabled ids
  ids = ids.filter((id) => !packs.isDisabled(id));

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
  const anilistResults = await _anilist[key](
    { ids: anilistIds },
  );

  anilistResults.forEach((item) =>
    results[`anilist:${item.id}`] = _anilist.transform<T>({ item })
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
      new: (await _anilist[key]({ search })).map((item) =>
        _anilist.transform({ item })
      ),
    },
  };

  for (const pack of [anilistPack, ...packs.list()]) {
    for (const item of pack[key]?.new ?? []) {
      // filter out disabled ids
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

async function mediaCharacters({ mediaId, index }: {
  mediaId: string;
  index: number;
}): Promise<
  {
    media?: Media | DisaggregatedMedia;
    character?: Character | DisaggregatedCharacter;
    total?: number;
    next: boolean;
  }
> {
  const [packId, id] = parseId(mediaId);

  if (packs.isDisabled(mediaId) || !packId || !id) {
    throw new Error('404');
  }

  if (packId === 'anilist') {
    return _anilist.mediaCharacters({
      id,
      index,
    });
  } else {
    // search for the id in packs
    const match: Media | DisaggregatedMedia | undefined = dict()[packId]?.media
      ?.new?.find((m) => m.id === id);

    if (!match) {
      return { next: false };
    }

    match.packId = packId;

    const total = match?.characters?.length ?? 0;

    const media = await aggregate<Media>({
      media: match,
      start: index,
      end: 1,
    });

    return {
      total,
      media,
      character: media?.characters?.edges?.[0]?.node,
      next: index + 1 < total,
    };
  }
}

async function aggregate<T>({ media, character, start, end }: {
  media?: Media | DisaggregatedMedia;
  character?: Character | DisaggregatedCharacter;
  start?: number;
  end?: number;
}): Promise<T> {
  start = start || 0;

  if (end) {
    end = start + (end || 1);
  }

  if (media) {
    if (
      (media.relations && 'edges' in media.relations) ||
      (media.characters && 'edges' in media.characters)
    ) {
      if (media.relations && 'edges' in media.relations) {
        media.relations.edges = media.relations.edges.filter((edge) =>
          !packs.isDisabled(`anilist:${edge.node.id}`)
        );
      }

      if (media.characters && 'edges' in media.characters) {
        media.characters.edges = media.characters.edges.filter((edge) =>
          !packs.isDisabled(`anilist:${edge.node.id}`)
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
      findById<Media>('media', mediaIds, media.packId),
      findById<Character>('characters', characterIds, media.packId),
    ]);

    const t: Media = {
      ...media,
      relations: {
        edges: media.relations?.slice(start, end)
          ?.filter(({ mediaId }) => {
            // deno-lint-ignore no-non-null-assertion
            const [packId, id] = parseId(mediaId, media!.packId);
            return !packs.isDisabled(`${packId}:${id}`);
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
            return !packs.isDisabled(`${packId}:${id}`);
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
        !packs.isDisabled(`anilist:${edge.node.id}`)
      );
      return character as T;
    }

    character = character as DisaggregatedCharacter;

    const mediaIds = (character.media instanceof Array
      ? character.media.slice(start, end)
      : [])
      .map((
        { mediaId },
      ) =>
        mediaId
      );

    const [mediaRefs] = [
      await findById<Media>('media', mediaIds, character.packId),
    ];

    const t: Character = {
      ...character,
      media: {
        edges: character.media?.slice(start, end)
          ?.filter(({ mediaId }) => {
            // deno-lint-ignore no-non-null-assertion
            const [packId, id] = parseId(mediaId, character!.packId);
            return !packs.isDisabled(`${packId}:${id}`);
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

function formatToString(format?: MediaFormat): string {
  if (!format || format === MediaFormat.Music) {
    return '';
  }

  return utils.capitalize(
    format
      .replace(/TV_SHORT|OVA|ONA/, 'Short')
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
