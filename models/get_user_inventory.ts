import {
  type query as _query,
} from 'https://deno.land/x/fauna@5.0.0-deno-alpha9/mod.d.ts';

import {
  And,
  Append,
  Client,
  ContainsPath,
  Create,
  Get,
  GTE,
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
  Now,
  Null,
  Ref,
  Resolver,
  Select,
  StringExpr,
  TimeDiffInMinutes,
  Update,
  User,
  UserExpr,
  Var,
} from './fql.ts';

const AVAILABLE_PULLS_DEFAULT = 5;
const PULLS_RESET_IN_MINUTES = 60;

function getOrCreateUser(id: StringExpr): UserExpr {
  return Let({
    match: Match(Index('users_discord_id'), id),
  }, ({ match }) =>
    If(
      IsNonEmpty(match),
      // return existing user
      Get(match),
      // create a new user then return it
      Create<User>('user', {
        id,
        inventories: [],
      }),
    ));
}

function getOrCreateGuild(id: StringExpr): GuildExpr {
  return Let({
    match: Match(Index('guilds_discord_id'), id),
  }, ({ match }) =>
    If(
      IsNonEmpty(match),
      // return existing guild
      Get(match),
      // create a new guild then return it
      Create<Guild>('guild', {
        id,
        instances: [],
      }),
    ));
}

function getOrCreateInstance(guild: GuildExpr): InstanceExpr {
  return Let({
    match: Select(['data', 'instances'], guild),
  }, ({ match }) =>
    If(
      IsNonEmpty(match),
      // return first instance in array
      // TODO support additional instances per guild
      Get(Select([0], match)),
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
          }),
        },
        // return the created instance
        ({ createdInstance }) => createdInstance,
      ),
    ));
}

function getOrCreateInventory(
  { instance, user }: { instance: InstanceExpr; user: UserExpr },
): InventoryExpr {
  return Let({
    // intersecting between user's inventories on all instances
    // and the inventories of all users on the instance
    // e.g. all_instance_inventories - all_inventories_that_are_not_this_user
    match: Intersection(
      Select(['data', 'inventories'], instance),
      Select(['data', 'inventories'], user),
    ),
  }, ({ match }) =>
    If(
      IsNonEmpty(match),
      Get(Select([0], match)),
      Let(
        {
          // create a new inventory
          createdInventory: Create<Inventory>('inventory', {
            lastPull: Null(),
            lastReset: Null(),
            availablePulls: AVAILABLE_PULLS_DEFAULT,
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
        ({ createdInventory }) => createdInventory,
      ),
    ));
}

function checkPullsForReset(inventory: InventoryExpr): InventoryExpr {
  return If(
    And(
      ContainsPath(['data', 'lastReset'], inventory),
      GTE(
        TimeDiffInMinutes(Select(['data', 'lastReset'], inventory), Now()),
        PULLS_RESET_IN_MINUTES,
      ),
    ),
    Update<Inventory>(Ref(inventory), {
      lastReset: Null(),
      availablePulls: AVAILABLE_PULLS_DEFAULT,
    }),
    inventory,
  );
}

export default function (client: Client): Promise<void> {
  return Resolver({
    client,
    name: 'get_user_inventory',
    lambda: (userId: string, guildId: string) => {
      return Let(
        {
          user: getOrCreateUser(userId),
          guild: getOrCreateGuild(guildId),
          instance: getOrCreateInstance(Var('guild')),
          inventory: getOrCreateInventory({
            user: Var('user'),
            instance: Var('instance'),
          }),
        },
        ({ inventory }) => checkPullsForReset(inventory),
      );
    },
  });
}
