import {
  BooleanExpr,
  CharacterExpr,
  Client,
  fql,
  InstanceExpr,
  MatchExpr,
  NullExpr,
  StringExpr,
  UserExpr,
} from './fql.ts';

import { getGuild, getInstance, getUser } from './get_user_inventory.ts';

export interface CharacterNode {
  character: CharacterExpr;
  anchor: StringExpr;
}

export const paginateCharacters = ({
  after,
  before,
  afterCursor,
  beforeCursor,
  afterSelector,
  beforeSelector,
}: {
  after?: string;
  before?: string;
  // deno-lint-ignore no-explicit-any
  afterCursor: any;
  // deno-lint-ignore no-explicit-any
  beforeCursor: any;
  // deno-lint-ignore no-explicit-any
  afterSelector: any[];
  // deno-lint-ignore no-explicit-any
  beforeSelector: any[];
}) => {
  return fql.If(
    fql.IsNonEmpty(fql.Var('characters')),
    fql.If(
      fql.IsNull(before),
      fql.If(
        fql.IsNull(after),
        fql.Ref(fql.Get(fql.Var('characters'))),
        fql.Let({
          // after returns itself then a new item
          match: fql.Paginate(fql.Var('characters'), {
            after: afterCursor,
            size: 2,
          }),
        }, ({ match }) => {
          return fql.Select(
            afterSelector,
            match,
            // or first item
            fql.Ref(fql.Get(fql.Var('characters'))),
          );
        }),
      ),
      fql.Let({
        // before doesn't return itself
        match: fql.Paginate(fql.Var('characters'), {
          before: beforeCursor,
          size: 1,
        }),
      }, ({ match }) => {
        return fql.Select(
          beforeSelector,
          match,
          // or last item
          fql.Ref(fql.Get(fql.Reverse(fql.Var('characters')))),
        );
      }),
    ),
    fql.Null(),
  );
};

export function findMedia(
  {
    mediaId,
    instance,
    before,
    after,
  }: {
    mediaId: StringExpr;
    instance: InstanceExpr;
    before?: string;
    after?: string;
  },
): CharacterNode {
  return fql.Let({
    characters: fql.Match(
      fql.Index('media_instance_id'),
      mediaId,
      fql.Ref(instance),
    ),
    character: paginateCharacters({
      after,
      before,
      afterCursor: [
        fql.Select(
          ['data', 'rating'],
          // deno-lint-ignore no-non-null-assertion
          fql.Get(fql.Id('character', after!)),
        ),
        // deno-lint-ignore no-non-null-assertion
        fql.Id('character', after!),
        // deno-lint-ignore no-non-null-assertion
        fql.Id('character', after!),
      ],
      beforeCursor: [
        fql.Select(
          ['data', 'rating'],
          // deno-lint-ignore no-non-null-assertion
          fql.Get(fql.Id('character', before!)),
        ),
        // deno-lint-ignore no-non-null-assertion
        fql.Id('character', before!),
        // deno-lint-ignore no-non-null-assertion
        fql.Id('character', before!),
      ],
      afterSelector: ['data', 1, 1],
      beforeSelector: ['data', 0, 1],
    }),
  }, ({ character }) => {
    return {
      character,
      anchor: fql.Select(['id'], character, fql.Null()),
    };
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

export function verifyCharacters(
  {
    charactersIds,
    instance,
    user,
  }: {
    charactersIds: StringExpr[];
    instance: InstanceExpr;
    user: UserExpr;
  },
): BooleanExpr {
  return fql.Let({
    characters: fql.Map(charactersIds, (id) =>
      fql.Match(
        fql.Index('characters_instance_id'),
        id,
        fql.Ref(instance),
      )),
  }, ({ characters }) =>
    fql.If(
      fql.All(fql.Map(characters, (char) => fql.IsNonEmpty(char))),
      fql.If(
        fql.All(fql.Map(characters, (char) =>
          fql.Equals(
            fql.Select(['data', 'user'], fql.Get(char)),
            fql.Ref(user),
          ))),
        'OK',
        'NOT_OWNED',
      ),
      'NOT_FOUND',
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
        name: 'media_instance_id',
        terms: [
          { field: ['data', 'mediaId'] },
          { field: ['data', 'instance'] },
        ],
        values: [{ field: ['data', 'rating'], reverse: true }, {
          field: ['ref'],
        }],
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
        lambda: (
          mediaId: string,
          guildId: string,
          before?: string,
          after?: string,
        ) => {
          return fql.Let(
            {
              guild: getGuild(guildId),
              instance: getInstance(fql.Var('guild')),
            },
            ({ instance }) =>
              findMedia({
                mediaId,
                instance,
                before,
                after,
              }),
          );
        },
      }),
      fql.Resolver({
        client,
        name: 'find_character',
        lambda: (
          characterId: string,
          guildId: string,
        ) => {
          return fql.Let(
            {
              guild: getGuild(guildId),
              instance: getInstance(fql.Var('guild')),
            },
            ({ instance }) =>
              findCharacter({
                characterId,
                instance,
              }),
          );
        },
      }),
      fql.Resolver({
        client,
        name: 'verify_characters',
        lambda: (
          charactersIds: string[],
          guildId: string,
          userId: string,
        ) => {
          return fql.Let(
            {
              user: getUser(userId),
              guild: getGuild(guildId),
              instance: getInstance(fql.Var('guild')),
            },
            ({ user, instance }) =>
              verifyCharacters({
                user,
                instance,
                charactersIds,
              }),
          );
        },
      }),
    ],
  };
}
