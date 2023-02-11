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
  inventories: RefExpr[];
  guild: RefExpr;
}

export interface Inventory {
  lastPull: TimeExpr | NullExpr;
  availablePulls: NumberExpr;
  characters: RefExpr[];
  instance: RefExpr;
  user: RefExpr;
}

export const PULLS_DEFAULT = 5;

export function getUser(id: StringExpr): UserExpr {
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

export function getGuild(id: StringExpr): GuildExpr {
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

export function getInstance(guild: GuildExpr): InstanceExpr {
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

export function getInventory(
  { instance, user }: { instance: InstanceExpr; user: UserExpr },
): InventoryExpr {
  return fql.Let({
    match: fql.Match(
      fql.Index('inventories_instance_user'),
      fql.Ref(instance),
      fql.Ref(user),
    ),
  }, ({ match }) =>
    fql.If(
      fql.IsNonEmpty(match),
      fql.Get(match),
      fql.Let(
        {
          // create a new inventory
          createdInventory: fql.Create<Inventory>('inventory', {
            lastPull: fql.Null(),
            availablePulls: PULLS_DEFAULT,
            characters: [],
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

export function refillPulls(
  { inventory }: { inventory: InventoryExpr },
): InventoryExpr {
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
        60,
      ),
    ),
    // refill the available pulls to default
    fql.Update<Inventory>(fql.Ref(inventory), {
      availablePulls: PULLS_DEFAULT,
    }),
    // return inventory as is
    inventory,
  );
}

export default function (client: Client): (() => Promise<void>)[] {
  return [
    fql.Indexer({
      client,
      unique: true,
      collection: 'user',
      name: 'users_discord_id',
      terms: [{ field: ['data', 'id'] }],
    }),
    fql.Indexer({
      client,
      unique: true,
      collection: 'guild',
      name: 'guilds_discord_id',
      terms: [{ field: ['data', 'id'] }],
    }),
    fql.Indexer({
      client,
      unique: true,
      collection: 'inventory',
      name: 'inventories_instance_user',
      terms: [{ field: ['data', 'instance'] }, { field: ['data', 'user'] }],
    }),
    fql.Resolver({
      client,
      name: 'get_user_inventory',
      lambda: (userId: string, guildId: string) => {
        return fql.Let(
          {
            user: getUser(userId),
            guild: getGuild(guildId),
            instance: getInstance(fql.Var('guild')),
            inventory: getInventory({
              user: fql.Var('user'),
              instance: fql.Var('instance'),
            }),
          },
          refillPulls,
        );
      },
    }),
  ];
}
