import {
  CharacterExpr,
  Client,
  fql,
  InstanceExpr,
  MatchExpr,
  NullExpr,
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
  }, ({ matches }) => {
    return fql.Reduce(
      fql.Map(
        matches,
        (match) =>
          fql.Map(
            fql.Select<CharacterExpr[]>(
              ['data'],
              fql.Paginate(match, { size: 1000 }),
            ),
            fql.Get,
          ),
      ),
      (a, b) => fql.Prepend(a, b),
    );
  });
}

export function findCharacter(
  {
    characterId,
    instance,
  }: {
    characterId: StringExpr;
    instance: InstanceExpr;
  },
): MatchExpr | NullExpr {
  return fql.Let({
    match: fql.Match(
      fql.Index('characters_instance_id'),
      characterId,
      fql.Ref(instance),
    ),
  }, ({ match }) =>
    fql.If(
      fql.IsNonEmpty(match),
      fql.Get(match),
      fql.Null(),
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
        lambda: (mediaIds: string[], guildId: string) => {
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
        name: 'find_character',
        lambda: (characterId: string, guildId: string) => {
          return fql.Let(
            {
              guild: getGuild(guildId),
              instance: getInstance(fql.Var('guild')),
            },
            ({ instance }) => findCharacter({ characterId, instance }),
          );
        },
      }),
    ],
  };
}
