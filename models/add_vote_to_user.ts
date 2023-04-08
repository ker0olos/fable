import {
  BooleanExpr,
  Client,
  fql,
  InventoryExpr,
  NumberExpr,
  ResponseExpr,
  UserExpr,
} from './fql.ts';

import {
  getGuild,
  getInstance,
  getInventory,
  getUser,
  Inventory,
  rechargePulls,
  User,
} from './get_user_inventory.ts';

export function addGuarantee(
  {
    user,
    guarantee,
  }: {
    user: UserExpr;
    guarantee: NumberExpr;
  },
): ResponseExpr {
  return fql.Let(
    {
      // increased by factor of 3
      cost: fql.If(
        fql.Equals(guarantee, 3),
        4,
        fql.If(
          fql.Equals(guarantee, 4),
          12,
          fql.If(
            fql.Equals(guarantee, 5),
            36,
            fql.Null(),
          ),
        ),
      ),
    },
    ({ cost }) =>
      fql.If(
        fql.IsNull(cost),
        { ok: false, error: 'NOT_SUPPORTED' },
        fql.If(
          fql.GTE(fql.Select(['data', 'availableVotes'], user, 0), cost),
          fql.Let(
            {
              updatedUser: fql.Update<User>(fql.Ref(user), {
                availableVotes: fql.Subtract(
                  fql.Select(['data', 'availableVotes'], user),
                  cost,
                ),
                guarantees: fql.Append(
                  guarantee,
                  fql.Select(['data', 'guarantees'], user, []),
                ),
              }),
            },
            ({ updatedUser }) =>
              ({
                ok: true,
                user: fql.Ref(updatedUser),
              }) as unknown as ResponseExpr,
          ),
          { ok: false, error: 'INSUFFICIENT_VOTES' },
        ),
      ),
  );
}

export function addPulls(
  { user, inventory, votes }: {
    user: UserExpr;
    inventory: InventoryExpr;
    votes: NumberExpr;
  },
): ResponseExpr {
  return fql.If(
    fql.GTE(fql.Select(['data', 'availableVotes'], user, 0), votes),
    fql.Let(
      {
        updatedUser: fql.Update<User>(fql.Ref(user), {
          availableVotes: fql.Subtract(
            fql.Select(['data', 'availableVotes'], user),
            votes,
          ),
        }),
        updatedInventory: fql.Update<Inventory>(fql.Ref(inventory), {
          availablePulls: fql.Add(
            fql.Select(['data', 'availablePulls'], inventory),
            votes,
          ),
        }),
      },
      ({ updatedInventory }) =>
        ({
          ok: true,
          inventory: fql.Ref(updatedInventory),
        }) as unknown as ResponseExpr,
    ),
    { ok: false, error: 'INSUFFICIENT_VOTES' },
  );
}

export function addVote(
  { user, weekend }: { user: UserExpr; weekend: BooleanExpr },
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
        // double votes on weekends
        fql.If(fql.Equals(weekend, true), 2, 1),
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
        name: 'exchange_votes_for_guarantees',
        lambda: (userId: string, guarantee: number) => {
          return fql.Let(
            { user: getUser(userId) },
            ({ user }) => addGuarantee({ user, guarantee }),
          );
        },
      }),
      fql.Resolver({
        client,
        name: 'exchange_votes_for_pulls',
        lambda: (userId: string, guildId: string, votes: number) => {
          return fql.Let(
            {
              user: getUser(userId),
              guild: getGuild(guildId),
              instance: getInstance(fql.Var('guild')),
              _inventory: getInventory({
                user: fql.Var('user'),
                instance: fql.Var('instance'),
              }),
              inventory: rechargePulls({
                inventory: fql.Var('_inventory'),
              }),
            },
            ({ user, inventory }) => addPulls({ user, inventory, votes }),
          );
        },
      }),
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
