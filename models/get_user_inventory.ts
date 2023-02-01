import {
  Client,
  query,
} from 'https://deno.land/x/fauna@5.0.0-deno-alpha9/mod.js';

import {
  Expr,
  type query as _query,
} from 'https://deno.land/x/fauna@5.0.0-deno-alpha9/mod.d.ts';

import {
  GuildExpr,
  InstanceExpr,
  InventoryExpr,
  MatchExpr,
  RefExpr,
  StringExpr,
  UserExpr,
} from './types.ts';

const {
  If,
  Query,
  Lambda,
  Var,
  Let,
  Now,
  Match,
  Get,
  Update,
  Create,
  Select,
  Filter,
  Collection,
  Equals,
  Append,
  IsNonEmpty,
  FaunaIndex: Index,
  FaunaFunction: Function,
} = query as typeof _query;

export function Ref(document: Expr): RefExpr {
  return Select('ref', document);
}

export function matchUserById(id: StringExpr): MatchExpr {
  return Match(Index('users_discord_id'), id);
}

export function matchGuildById(id: StringExpr): MatchExpr {
  return Match(Index('guilds_discord_id'), id);
}

export function getOrCreateUser(
  { id, user }: { id: StringExpr; user: MatchExpr },
): UserExpr {
  return If(
    IsNonEmpty(user),
    // return existing user
    Get(user),
    // create a new user then return it
    Create(Collection('users'), {
      data: {
        id: id,
        inventories: [],
      },
    }),
  );
}

export function getOrCreateGuild(
  { id, guild }: { id: StringExpr; guild: MatchExpr },
): GuildExpr {
  return If(
    IsNonEmpty(guild),
    // return existing guild
    Get(guild),
    // create a new guild then return it
    Create(Collection('guilds'), {
      data: {
        id: id,
        instances: [],
      },
    }),
  );
}

export function getOrCreateInstance(guild: GuildExpr): InstanceExpr {
  return If(
    // TODO support other non-main instances
    IsNonEmpty(Select(['data', 'instances'], guild)),
    // return existing main instance
    Get(Select(['data', 'instances', 0], guild)),
    Let(
      {
        // create a new instance
        createdInstance: Create(Collection('instance'), {
          data: {
            main: true,
            guild: Ref(guild),
            inventories: [],
          },
        }),
        // update the guild instances list
        updatedGuild: Update(Ref(guild), {
          data: {
            instances: Append(
              Ref(Var('createdInstance')),
              Select(['data', 'instances'], guild),
            ),
          },
        }),
      },
      // return the created instance
      Var('createdInstance'),
    ),
  );
}

export function getOrCreateInventory(
  { instance, user }: { instance: InstanceExpr; user: UserExpr },
): InventoryExpr {
  return Let(
    {
      filtered: Filter(
        Select(['data', 'inventories'], instance),
        Lambda('user', Equals(Var('user'), user)),
      ),
    },
    If(
      IsNonEmpty(Var('filtered')),
      Get(Select([0], Var('filtered'))),
      Let(
        {
          // create a new inventory
          createdInventory: Create(Collection('inventory'), {
            data: {
              availablePulls: 5,
              lastPull: Now(),
              instance: Ref(instance),
              user: Ref(user),
            },
          }),
          // update the instance inventories list
          updatedInstance: Update(Ref(instance), {
            data: {
              inventories: Append(
                Ref(Var('createdInventory')),
                Select(['data', 'inventories'], instance),
              ),
            },
          }),
          // update the user inventories list
          updatedUser: Update(Ref(user), {
            data: {
              inventories: Append(
                Ref(Var('createdInventory')),
                Select(['data', 'inventories'], user),
              ),
            },
          }),
        },
        // return the created inventory
        Var('createdInventory'),
      ),
    ),
  );
}

export default function (client: Client): Promise<void> {
  return client.query(
    // update existing function
    Update(Function('get_user_inventory'), {
      body: Query(
        Lambda( // lambda is an anonymous function
          ['userId', 'guildId'], // function parameters
          Let(
            {
              userMatch: matchUserById(Var('userId')),
              guildMatch: matchGuildById(Var('guildId')),
              //
              user: getOrCreateUser({
                id: Var('userId'),
                user: Var('userMatch'),
              }),
              guild: getOrCreateGuild({
                id: Var('guildId'),
                guild: Var('guildMatch'),
              }),
              //
              instance: getOrCreateInstance(Var('guild')),
              //
              inventory: getOrCreateInventory({
                user: Var('user'),
                instance: Var('instance'),
              }),
            },
            Var('inventory'),
          ),
        ),
      ),
    }),
  );
}
