import {
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

export const COSTS = {
  THREE: 4,
  FOUR: 12,
  FIVE: 28,
};

export function addPulls(
  { user, inventory, amount }: {
    user: UserExpr;
    inventory: InventoryExpr;
    amount: NumberExpr;
  },
): ResponseExpr {
  return fql.If(
    fql.GTE(fql.Select(['data', 'availableVotes'], user, 0), amount),
    fql.Let(
      {
        updatedUser: fql.Update<User>(fql.Ref(user), {
          availableVotes: fql.Subtract(
            fql.Select(['data', 'availableVotes'], user),
            amount,
          ),
        }),
        updatedInventory: fql.Update<Inventory>(fql.Ref(inventory), {
          availablePulls: fql.Add(
            fql.Select(['data', 'availablePulls'], inventory),
            amount,
          ),
        }),
      },
      ({ updatedInventory }) =>
        ({
          ok: true,
          inventory: fql.Ref(updatedInventory),
        }) as unknown as ResponseExpr,
    ),
    {
      ok: false,
      error: 'INSUFFICIENT_TOKENS',
      user: fql.Ref(user),
    },
  );
}

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
      cost: fql.If(
        fql.Equals(guarantee, 3),
        COSTS.THREE,
        fql.If(
          fql.Equals(guarantee, 4),
          COSTS.FOUR,
          fql.If(
            fql.Equals(guarantee, 5),
            COSTS.FIVE,
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
          {
            ok: false,
            error: 'INSUFFICIENT_TOKENS',
            user: fql.Ref(user),
          },
        ),
      ),
  );
}

export function addTokens(
  { user, amount }: { user: UserExpr; amount: NumberExpr },
): ResponseExpr {
  return fql.Let({
    user: fql.Update<User>(fql.Ref(user), {
      lastVote: fql.Now(),
      availableVotes: fql.Add(
        fql.Select(['data', 'availableVotes'], user, 0),
        amount,
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
        name: 'exchange_tokens_for_pulls',
        lambda: (userId: string, guildId: string, amount: number) => {
          return fql.Let(
            {
              user: getUser(userId),
              guild: getGuild(guildId),
              instance: getInstance(fql.Var('guild')),
              inventory: rechargePulls({
                inventory: getInventory({
                  user: fql.Var('user'),
                  instance: fql.Var('instance'),
                }),
              }),
            },
            ({ user, inventory }) => addPulls({ user, inventory, amount }),
          );
        },
      }),
      fql.Resolver({
        client,
        name: 'exchange_tokens_for_guarantees',
        lambda: (userId: string, guarantee: number) => {
          return fql.Let(
            { user: getUser(userId) },
            ({ user }) => addGuarantee({ user, guarantee }),
          );
        },
      }),
      fql.Resolver({
        client,
        name: 'add_tokens_to_user',
        lambda: (userId: string, amount: number) => {
          return fql.Let({ user: getUser(userId), amount }, addTokens);
        },
      }),
    ],
  };
}
