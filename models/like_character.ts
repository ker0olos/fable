import {
  Client,
  fql,
  InstanceExpr,
  ResponseExpr,
  StringExpr,
  UserExpr,
} from './fql.ts';

import { getGuild, getInstance, getUser, User } from './get_user_inventory.ts';

export function likeCharacter(
  {
    user,
    instance,
    characterId,
  }: {
    user: UserExpr;
    instance: InstanceExpr;
    characterId: StringExpr;
  },
): unknown {
  return fql.Let({
    exists: fql.Includes(
      { characterId },
      fql.Select(['data', 'likes'], user, []),
    ),
    match: fql.Match(
      fql.Index('characters_instance_id'),
      { characterId },
      fql.Ref(instance),
    ),
    character: fql.If(
      fql.IsNonEmpty(fql.Var('match')),
      fql.Ref(fql.Get(fql.Var('match'))),
      fql.Null(),
    ),
  }, ({ exists, character }) => {
    return fql.If(
      fql.Equals(exists, true),
      {
        ok: true,
        user: fql.Ref(user),
        character,
      },
      fql.Let({
        updatedUser: fql.Update<User>(fql.Ref(user), {
          likes: fql.Append(
            { characterId },
            fql.Select(['data', 'likes'], user, []),
          ),
        }),
      }, ({ updatedUser }) => ({
        ok: true,
        user: fql.Ref(updatedUser),
        character,
      })),
    );
  });
}

export function unlikeCharacter(
  {
    user,
    instance,
    characterId,
  }: {
    user: UserExpr;
    instance: InstanceExpr;
    characterId: StringExpr;
  },
): unknown {
  return fql.Let({
    exists: fql.Includes(
      { characterId },
      fql.Select(['data', 'likes'], user, []),
    ),
    match: fql.Match(
      fql.Index('characters_instance_id'),
      { characterId },
      fql.Ref(instance),
    ),
    character: fql.If(
      fql.IsNonEmpty(fql.Var('match')),
      fql.Ref(fql.Get(fql.Var('match'))),
      fql.Null(),
    ),
  }, ({ exists, character }) => {
    return fql.If(
      fql.Equals(exists, true),
      fql.Let({
        updatedUser: fql.Update<User>(fql.Ref(user), {
          likes: fql.Remove(
            { characterId },
            fql.Select(['data', 'likes'], user, []),
          ),
        }),
      }, ({ updatedUser }) => ({
        ok: true,
        user: fql.Ref(updatedUser),
        character,
      })),
      {
        ok: true,
        user: fql.Ref(user),
        character,
      },
    );
  });
}

export function likeMedia(
  {
    user,
    mediaId,
  }: {
    user: UserExpr;
    mediaId: StringExpr;
  },
): unknown {
  return fql.Let({
    exists: fql.Includes(
      { mediaId },
      fql.Select(['data', 'likes'], user, []),
    ),
  }, ({ exists }) => {
    return fql.If(
      fql.Equals(exists, true),
      {
        ok: true,
        user: fql.Ref(user),
      },
      fql.Let({
        updatedUser: fql.Update<User>(fql.Ref(user), {
          likes: fql.Append(
            { mediaId },
            fql.Select(['data', 'likes'], user, []),
          ),
        }),
      }, ({ updatedUser }) => ({
        ok: true,
        user: fql.Ref(updatedUser),
      })),
    );
  });
}

export function unlikeMedia(
  {
    user,
    mediaId,
  }: {
    user: UserExpr;
    mediaId: StringExpr;
  },
): unknown {
  return fql.Let({
    exists: fql.Includes(
      { mediaId },
      fql.Select(['data', 'likes'], user, []),
    ),
  }, ({ exists }) => {
    return fql.If(
      fql.Equals(exists, true),
      fql.Let({
        updatedUser: fql.Update<User>(fql.Ref(user), {
          likes: fql.Remove(
            { mediaId },
            fql.Select(['data', 'likes'], user, []),
          ),
        }),
      }, ({ updatedUser }) => ({
        ok: true,
        user: fql.Ref(updatedUser),
      })),
      {
        ok: true,
        user: fql.Ref(user),
      },
    );
  });
}

export default function (client: Client): {
  indexers?: (() => Promise<void>)[];
  resolvers?: (() => Promise<void>)[];
} {
  return {
    resolvers: [
      fql.Resolver({
        client,
        name: 'like_character',
        lambda: (userId: string, guildId: string, characterId: string) => {
          return fql.Let(
            {
              user: getUser(userId),
              guild: getGuild(guildId),
              instance: getInstance(fql.Var('guild')),
            },
            ({ user, instance }) =>
              likeCharacter({ user, instance, characterId }) as ResponseExpr,
          );
        },
      }),
      fql.Resolver({
        client,
        name: 'unlike_character',
        lambda: (userId: string, guildId: string, characterId: string) => {
          return fql.Let(
            {
              user: getUser(userId),
              guild: getGuild(guildId),
              instance: getInstance(fql.Var('guild')),
            },
            ({ user, instance }) =>
              unlikeCharacter({ user, instance, characterId }) as ResponseExpr,
          );
        },
      }),
      fql.Resolver({
        client,
        name: 'like_media',
        lambda: (userId: string, mediaId: string) => {
          return fql.Let(
            { user: getUser(userId) },
            ({ user }) => likeMedia({ user, mediaId }) as ResponseExpr,
          );
        },
      }),
      fql.Resolver({
        client,
        name: 'unlike_media',
        lambda: (userId: string, mediaId: string) => {
          return fql.Let(
            { user: getUser(userId) },
            ({ user }) => unlikeMedia({ user, mediaId }) as ResponseExpr,
          );
        },
      }),
    ],
  };
}
