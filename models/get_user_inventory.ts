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
  inventories: RefExpr[];
  lastVote?: TimeExpr;
  availableVotes?: NumberExpr;
  dailyTimestamp?: TimeExpr;
  guarantees?: NumberExpr[];
  likes?: {
    mediaId?: StringExpr;
    characterId?: StringExpr;
  }[];
  badges?: RefExpr[];
}

export interface Guild {
  id: StringExpr;
  instances: RefExpr[];
}

export interface PackInstall {
  ref: RefExpr;
  timestamp: TimeExpr;
  by: StringExpr;
}

export interface Instance {
  main: BooleanExpr;
  inventories: RefExpr[];
  packs: PackInstall[];
  guild: RefExpr;
}

export interface Inventory {
  availablePulls: NumberExpr;
  lastPull?: TimeExpr;
  rechargeTimestamp?: TimeExpr;
  stealTimestamp?: TimeExpr;
  characters?: RefExpr[];
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

function getActiveInventories(
  { instance }: { instance: InstanceExpr },
): InventoryExpr[] {
  return fql.Let(
    {
      matches: fql.Paginate<[TimeExpr, RefExpr]>(
        fql.Range(
          fql.Match(fql.Index('inventories_last_pull'), fql.Ref(instance)),
          fql.TimeSubtractInDays(fql.Now(), 14),
          fql.Now(),
        ),
        { size: 30 },
      ),
    },
    ({ matches }) =>
      fql.Select(
        ['data'],
        fql.Map(
          // deno-lint-ignore no-explicit-any
          matches as any,
          (_, ref) => fql.Get<InventoryExpr>(ref as RefExpr),
        ),
      ),
  );
}

export function populateCharactersArray(
  { inventory }: { inventory: InventoryExpr },
): InventoryExpr {
  return fql.Let(
    {
      match: fql.Match(
        fql.Index('inventory_characters'),
        fql.Ref(inventory),
      ),
    },
    ({ match }) =>
      ({
        data: fql.Merge<{ [key: string]: unknown }>(
          fql.Select(['data'], inventory),
          {
            characters: fql.Select(
              ['data'],
              fql.Paginate(match, {
                size: 9999,
              }),
            ),
          },
        ),
      }) as unknown as InventoryExpr,
  );
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
      fql.Indexer({
        client,
        unique: false,
        collection: 'character',
        name: 'inventory_characters',
        terms: [{ field: ['data', 'inventory'] }],
      }),
      fql.Indexer({
        client,
        unique: false,
        collection: 'inventory',
        name: 'inventories_last_pull',
        terms: [{ field: ['data', 'instance'] }],
        values: [{ field: ['data', 'lastPull'] }, { field: ['ref'] }],
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
              inventory: rechargePulls({
                inventory: getInventory({
                  user: fql.Var('user'),
                  instance: fql.Var('instance'),
                }),
              }),
            },
            populateCharactersArray,
          );
        },
      }),
      fql.Resolver({
        client,
        name: 'get_active_inventories',
        lambda: (guildId: string) => {
          return fql.Let(
            {
              guild: getGuild(guildId),
              instance: getInstance(fql.Var('guild')),
            },
            getActiveInventories,
          );
        },
      }),
    ],
  };
}
