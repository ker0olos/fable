import {
  type query as _query,
} from 'https://deno.land/x/fauna@5.0.0-deno-alpha9/mod.d.ts';

import {
  Append,
  Client,
  Create,
  Get,
  Guild,
  GuildExpr,
  If,
  Index,
  Instance,
  InstanceExpr,
  Intersection,
  Inventory,
  InventoryExpr,
  IsNonEmpty,
  Let,
  Match,
  MatchExpr,
  Now,
  Ref,
  Select,
  StringExpr,
  Update,
  updateResolver,
  User,
  UserExpr,
  Var,
} from './fql.ts';

function matchUserById(id: StringExpr): MatchExpr {
  return Match(Index('users_discord_id'), id);
}

function matchGuildById(id: StringExpr): MatchExpr {
  return Match(Index('guilds_discord_id'), id);
}

function getOrCreateUser(
  { id, user }: { id: StringExpr; user: MatchExpr },
): UserExpr {
  return If(
    IsNonEmpty(user),
    // return existing user
    Get(user),
    // create a new user then return it
    Create<User>('user', {
      id,
      inventories: [],
    }),
  );
}

function getOrCreateGuild(
  { id, guild }: { id: StringExpr; guild: MatchExpr },
): GuildExpr {
  return If(
    IsNonEmpty(guild),
    // return existing guild
    Get(guild),
    // create a new guild then return it
    Create<Guild>('guild', {
      id,
      instances: [],
    }),
  );
}

function getOrCreateInstance(guild: GuildExpr): InstanceExpr {
  // TODO support other non-main instances

  return Let(
    {
      match: Select(['data', 'instances'], guild),
    },
    If(
      IsNonEmpty(Var('match')),
      Get(Select([0], Var('match'))),
      Let(
        {
          // create a new instance
          createdInstance: Create<Instance>('instance', {
            main: true,
            guild: Ref(guild),
            inventories: [],
          }),
          // update the guild instances list
          updatedGuild: Update<Guild>(Ref(guild), {
            instances: [Ref(Var('createdInstance'))],
            // instances: Append(
            //   Ref(Var('createdInstance')),
            //   Select(['data', 'instances'], guild),
            // ),
          }),
        },
        // return the created instance
        Var('createdInstance'),
      ),
    ),
  );
}

function getOrCreateInventory(
  { instance, user }: {
    instance: InstanceExpr;
    user: UserExpr;
  },
): InventoryExpr {
  return Let(
    {
      // search the instance's inventories list for the user
      match: Intersection(
        Select(['data', 'inventories'], instance),
        Select(['data', 'inventories'], user),
      ),
    },
    If(
      IsNonEmpty(Var('match')),
      Get(Select([0], Var('match'))),
      Let(
        {
          // create a new inventory
          createdInventory: Create<Inventory>('inventory', {
            availablePulls: 5,
            lastPull: Now(),
            instance: Ref(instance),
            user: Ref(user),
          }),
          // update the instance inventories list
          updatedInstance: Update<Instance>(Ref(instance), {
            inventories: Append(
              Ref(Var('createdInventory')),
              Select(['data', 'inventories'], instance),
            ),
          }),
          // update the user inventories list
          updatedUser: Update<User>(Ref(user), {
            inventories: Append(
              Ref(Var('createdInventory')),
              Select(['data', 'inventories'], user),
            ),
          }),
        },
        // return the created inventory
        Var('createdInventory'),
      ),
    ),
  );
}

export default function (client: Client): Promise<void> {
  return updateResolver({
    client,
    name: 'get_user_inventory',
    lambda: (userId: string, guildId: string) =>
      Let(
        {
          userMatch: matchUserById(userId),
          guildMatch: matchGuildById(guildId),
          //
          user: getOrCreateUser({
            id: userId,
            user: Var('userMatch'),
          }),
          guild: getOrCreateGuild({
            id: guildId,
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
  });
}
