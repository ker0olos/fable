import {
  CharacterExpr,
  Client,
  fql,
  InstanceExpr,
  NumberExpr,
  RefExpr,
  StringExpr,
  UserExpr,
} from './fql.ts';

import { getGuild, getInstance, getUser } from './get_user_inventory.ts';

export interface Character {
  id: StringExpr;
  instance: RefExpr;
  user: RefExpr;
}

function getCharacters(
  { instance, user, size, after, before }: {
    instance: InstanceExpr;
    user: UserExpr;
    size?: NumberExpr;
    after?: StringExpr;
    before?: StringExpr;
  },
): CharacterExpr[] {
  return fql.Let({
    match: fql.Match(
      fql.Index('characters_instance_user'),
      fql.Ref(instance),
      fql.Ref(user),
    ),
    page: fql.Pagination(fql.Var('match'), size, after, before),
    // deno-lint-ignore no-explicit-any
  }, ({ page }) => fql.Map(page, (ref) => fql.Get(ref)) as any);
}

export default function (client: Client): Promise<void>[] {
  return [
    fql.Indexer({
      client,
      unique: false,
      collection: 'character',
      name: 'characters_instance_user',
      terms: [{ field: ['data', 'instance'] }, { field: ['data', 'user'] }],
    }),
    fql.Resolver({
      client,
      name: 'get_user_characters',
      lambda: (
        userId: string,
        guildId: string,
        size?: number,
        after?: string,
        before?: string,
      ) => {
        return fql.Let(
          {
            user: getUser(userId),
            guild: getGuild(guildId),
            instance: getInstance(fql.Var('guild')),
          },
          ({ instance, user }) =>
            getCharacters({
              instance,
              user,
              size,
              after,
              before,
            }),
        );
      },
    }),
  ];
}
