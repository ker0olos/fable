import {
  CharacterExpr,
  Client,
  fql,
  InstanceExpr,
  RefExpr,
  StringExpr,
} from './fql.ts';

import { getGuild, getInstance } from './get_user_inventory.ts';

export function findMedia(
  { mediaIds, instance }: { mediaIds: StringExpr[]; instance: InstanceExpr },
): CharacterExpr[] {
  return fql.Let({
    matches: fql.Map(mediaIds, (mediaId) =>
      fql.Match(
        fql.Index('unsorted_media_instance_id'),
        mediaId,
        fql.Ref(instance),
      )),
  }, ({ matches }) =>
    fql.Reduce(
      fql.Map(
        matches,
        (match) =>
          fql.Map<RefExpr, CharacterExpr>(
            fql.Select(
              ['data'],
              fql.Paginate(match, { size: 1000 }),
            ),
            fql.Get,
          ),
      ),
      (a, b) => fql.Prepend(a, b),
    ));
}

export function findCharacters(
  {
    charactersId,
    instance,
  }: {
    charactersId: StringExpr[];
    instance: InstanceExpr;
  },
): CharacterExpr[] {
  return fql.Let({
    matches: fql.Map(charactersId, (characterId) =>
      fql.Match(
        fql.Index('characters_instance_id'),
        characterId,
        fql.Ref(instance),
      )),
  }, ({ matches }) =>
    fql.Reduce(
      fql.Map(
        matches,
        (match) =>
          fql.Map<RefExpr, CharacterExpr>(
            fql.Select(
              ['data'],
              fql.Paginate(match, { size: 1000 }),
            ),
            fql.Get,
          ),
      ),
      (a, b) => fql.Prepend(a, b),
    ));
}

export default function (client: Client): {
  indexers?: (() => Promise<void>)[];
  resolvers?: (() => Promise<void>)[];
} {
  return {
    indexers: [
      fql.Indexer({
        client,
        unique: false,
        collection: 'character',
        name: 'unsorted_media_instance_id',
        terms: [
          { field: ['data', 'mediaId'] },
          { field: ['data', 'instance'] },
        ],
      }),
      fql.Indexer({
        client,
        unique: true,
        collection: 'character',
        name: 'characters_instance_id',
        terms: [{ field: ['data', 'id'] }, { field: ['data', 'instance'] }],
      }),
    ],
    resolvers: [
      fql.Resolver({
        client,
        name: 'find_media',
        lambda: (mediaIds: StringExpr[], guildId: StringExpr) => {
          return fql.Let(
            {
              guild: getGuild(guildId),
              instance: getInstance(fql.Var('guild')),
            },
            ({ instance }) => findMedia({ mediaIds, instance }),
          );
        },
      }),
      fql.Resolver({
        client,
        name: 'find_characters',
        lambda: (charactersId: StringExpr[], guildId: StringExpr) => {
          return fql.Let(
            {
              guild: getGuild(guildId),
              instance: getInstance(fql.Var('guild')),
            },
            ({ instance }) => findCharacters({ charactersId, instance }),
          );
        },
      }),
    ],
  };
}
