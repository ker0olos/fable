import { BooleanExpr, Client, fql, ResponseExpr, UserExpr } from './fql.ts';

import { getUser, User } from './get_user_inventory.ts';

export function addVote(
  { user }: { user: UserExpr; weekend: BooleanExpr },
): ResponseExpr {
  return fql.Let({
    user: fql.Update<User>(fql.Ref(user), {
      lastVote: fql.Now(),
      totalVotes: fql.Add(
        fql.Select(['data', 'totalVotes'], user, 0),
        1,
      ),
      availableVotes: fql.Add(
        fql.Select(['data', 'availableVotes'], user, 0),
        1,
      ),
    }),
  }, () => ({ ok: true }) as unknown as ResponseExpr);
}

export default function (client: Client): {
  indexers?: (() => Promise<void>)[];
  resolvers?: (() => Promise<void>)[];
} {
  return {
    resolvers: [
      fql.Resolver({
        client,
        name: 'add_vote_to_user',
        lambda: (userId: string, weekend: boolean) => {
          return fql.Let({ user: getUser(userId), weekend }, addVote);
        },
      }),
    ],
  };
}
