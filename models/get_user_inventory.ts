import {
  BooleanExpr,
  Client,
  fql,
  GuildExpr,
  InstanceExpr,
  InventoryExpr,
  NumberExpr,
  RefExpr,
  StringExpr,
  TimeExpr,
  UserExpr,
} from './fql.ts';

export interface User {
  id: StringExpr;
  lastVote?: TimeExpr;
  totalVotes?: NumberExpr;
  availableVotes?: NumberExpr;
  guarantees: NumberExpr[];
  inventories: RefExpr[];
  badges: RefExpr[];
}

export interface Guild {
  id: StringExpr;
  instances: RefExpr[];
}

export interface Instance {
  main: BooleanExpr;
  inventories: RefExpr[];
  packs: RefExpr[];
  guild: RefExpr;
}

export interface Inventory {
  availablePulls: NumberExpr;
  lastPull?: TimeExpr;
  rechargeTimestamp?: TimeExpr;
  characters: RefExpr[];
  instance: RefExpr;
  user: RefExpr;
  party?: {
    member1?: RefExpr;
    member2?: RefExpr;
    member3?: RefExpr;
    member4?: RefExpr;
    member5?: RefExpr;
  };
}

export const MAX_PULLS = 5;
export const RECHARGE_MINS = 30;

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
        guarantees: [],
        inventories: [],
        badges: [
          // Early Bird Gets the Worm
          fql.Id('badge', '357600097731608662'),
        ],
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
    match: fql.Select<InstanceExpr>(['data', 'instances'], guild),
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
            packs: [],
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
            availablePulls: MAX_PULLS,
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

export function rechargePulls(
  { inventory }: { inventory: InventoryExpr },
): InventoryExpr {
  return fql.Let(
    {
      rechargeTimestamp: fql.Select(
        ['data', 'rechargeTimestamp'],
        inventory,
        fql.Now(), // fallback
      ),
      currentPulls: fql.Select(['data', 'availablePulls'], inventory),
      newPulls: fql.Max(
        0,
        fql.Min(
          fql.Subtract(
            MAX_PULLS,
            fql.Var('currentPulls'),
          ),
          fql.Divide(
            fql.TimeDiffInMinutes(
              fql.Var('rechargeTimestamp'),
              fql.Now(),
            ),
            RECHARGE_MINS,
          ),
        ),
      ),
      rechargedPulls: fql.Add(fql.Var('currentPulls'), fql.Var('newPulls')),
    },
    ({ rechargeTimestamp, newPulls, rechargedPulls }) =>
      fql.Update<Inventory>(fql.Ref(inventory), {
        availablePulls: fql.Min(99, rechargedPulls),
        rechargeTimestamp: fql.If(
          fql.GTE(rechargedPulls, MAX_PULLS),
          fql.Null(),
          fql.TimeAddInMinutes(
            rechargeTimestamp,
            fql.Multiply(newPulls, RECHARGE_MINS),
          ),
        ),
      }),
  );
}

export default function (client: Client): {
  indexers?: (() => Promise<void>)[];
  resolvers?: (() => Promise<void>)[];
} {
  return {
    indexers: [
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
    ],
    resolvers: [
      fql.Resolver({
        client,
        name: 'get_guild_instance',
        lambda: (guildId: string) => {
          return fql.Let(
            { guild: getGuild(guildId) },
            ({ guild }) => getInstance(guild),
          );
        },
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
            rechargePulls,
          );
        },
      }),
    ],
  };
}
