import {
  BooleanExpr,
  Client,
  fql,
  GuildExpr,
  InstanceExpr,
  InventoryExpr,
  NullExpr,
  NumberExpr,
  RefExpr,
  StringExpr,
  TimeExpr,
  UserExpr,
} from './fql.ts';

export interface User {
  id: StringExpr;
  inventories: RefExpr[];
}

export interface Guild {
  id: StringExpr;
  instances: RefExpr[];
}

export interface Instance {
  main: BooleanExpr;
  guild: RefExpr;
  inventories: RefExpr[];
}

export interface Inventory {
  lastPull: TimeExpr | NullExpr;
  availablePulls: NumberExpr;
  instance: RefExpr;
  user: RefExpr;
}

export const AVAILABLE_PULLS_DEFAULT = 5;
export const PULLS_RESET_TIME = 60;

export function getOrCreateUser(id: StringExpr): UserExpr {
  return fql.Let({
    match: fql.Match(fql.Index('users_discord_id'), id),
  }, ({ match }) =>
    fql.If(
      fql.IsNonEmpty(match),
      // return existing user
      fql.Get(match),
      // create a new user then return it
      fql.Create<User>('user', {
        id,
        inventories: [],
      }),
    ));
}

export function getOrCreateGuild(id: StringExpr): GuildExpr {
  return fql.Let({
    match: fql.Match(fql.Index('guilds_discord_id'), id),
  }, ({ match }) =>
    fql.If(
      fql.IsNonEmpty(match),
      // return existing guild
      fql.Get(match),
      // create a new guild then return it
      fql.Create<Guild>('guild', {
        id,
        instances: [],
      }),
    ));
}

export function getOrCreateInstance(guild: GuildExpr): InstanceExpr {
  return fql.Let({
    match: fql.Select(['data', 'instances'], guild),
  }, ({ match }) =>
    fql.If(
      fql.IsNonEmpty(match),
      // return first instance in array
      // TODO support additional instances per guild
      fql.Get(fql.Select([0], match)),
      fql.Let(
        {
          // create a new instance
          createdInstance: fql.Create<Instance>('instance', {
            main: true,
            guild: fql.Ref(guild),
            inventories: [],
          }),
          // update the guild instances list
          updatedGuild: fql.Update<Guild>(fql.Ref(guild), {
            instances: [fql.Ref(fql.Var('createdInstance'))],
          }),
        },
        // return the created instance
        ({ createdInstance }) => createdInstance,
      ),
    ));
}

export function getOrCreateInventory(
  { instance, user }: { instance: InstanceExpr; user: UserExpr },
): InventoryExpr {
  return fql.Let({
    // intersecting between user's inventories on all instances
    // and the inventories of all users on the instance
    // e.g. all_instance_inventories - all_inventories_that_are_not_this_user
    match: fql.Intersection(
      fql.Select(['data', 'inventories'], instance),
      fql.Select(['data', 'inventories'], user),
    ),
  }, ({ match }) =>
    fql.If(
      fql.IsNonEmpty(match),
      fql.Get(fql.Select([0], match)),
      fql.Let(
        {
          // create a new inventory
          createdInventory: fql.Create<Inventory>('inventory', {
            lastPull: fql.Null(),
            availablePulls: AVAILABLE_PULLS_DEFAULT,
            instance: fql.Ref(instance),
            user: fql.Ref(user),
          }),
          // update the instance inventories list
          updatedInstance: fql.Update<Instance>(fql.Ref(instance), {
            inventories: fql.Append(
              fql.Ref(fql.Var('createdInventory')),
              fql.Select(['data', 'inventories'], instance),
            ),
          }),
          // update the user inventories list
          updatedUser: fql.Update<User>(fql.Ref(user), {
            inventories: fql.Append(
              fql.Ref(fql.Var('createdInventory')),
              fql.Select(['data', 'inventories'], user),
            ),
          }),
        },
        ({ createdInventory }) => createdInventory,
      ),
    ));
}

export function checkPullsForReset(inventory: InventoryExpr): InventoryExpr {
  return fql.If(
    fql.And(
      // if available pulls is less than or equal to 0
      fql.LTE(fql.Select(['data', 'availablePulls'], inventory), 0),
      // and difference in time between the last pull and now
      // is greater than or equal to 60 minutes
      fql.GTE(
        fql.TimeDiffInMinutes(
          fql.Select(['data', 'lastPull'], inventory),
          fql.Now(),
        ),
        PULLS_RESET_TIME,
      ),
    ),
    // reset the available pulls to default
    fql.Update<Inventory>(fql.Ref(inventory), {
      availablePulls: AVAILABLE_PULLS_DEFAULT,
    }),
    // return inventory as is
    inventory,
  );
}

export default function (client: Client): Promise<void> {
  return fql.Resolver({
    client,
    name: 'get_user_inventory',
    lambda: (userId: string, guildId: string) => {
      return fql.Let(
        {
          user: getOrCreateUser(userId),
          guild: getOrCreateGuild(guildId),
          instance: getOrCreateInstance(fql.Var('guild')),
          inventory: getOrCreateInventory({
            user: fql.Var('user'),
            instance: fql.Var('instance'),
          }),
        },
        ({ inventory }) => checkPullsForReset(inventory),
      );
    },
  });
}
