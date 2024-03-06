import { ulid } from 'ulid';

import {
  charactersByInventoryPrefix,
  guildsByDiscordId,
  inventoriesByInstance,
  inventoriesByUser,
  usersByDiscordId,
  usersLikesByDiscordId,
} from '~/db/indices.ts';

import db, { kv } from '~/db/mod.ts';

import utils from '~/src/utils.ts';

import { KvError } from '~/src/errors.ts';

import type * as Schema from '~/db/schema.ts';

export const MAX_PULLS = 5;
export const MAX_SWEEPS = 5;

export const MAX_NEW_PULLS = 10;
export const MAX_NEW_SWEEPS = MAX_SWEEPS;

export const RECHARGE_MINS = 30;
export const RECHARGE_SWEEPS_MINS = 60;

// in hours
export const RECHARGE_DAILY_TOKENS = 12;

export async function getUser(userId: string): Promise<Schema.User> {
  const response = await Promise.all([
    db.getValue<Schema.User>(usersByDiscordId(userId)),
    db.getBlobValue<Schema.Like[]>(
      usersLikesByDiscordId(userId),
    ),
  ]);

  if (response[0]) {
    return (response[0].likes = response[1] ?? [], response[0]);
  }

  const newUser: Schema.User = {
    _id: ulid(),
    id: userId,
    inventories: [],
  };

  const insert = await kv.atomic()
    .check({ key: usersByDiscordId(userId), versionstamp: null })
    //
    .set(['users', newUser._id], newUser)
    .set(usersByDiscordId(userId), newUser)
    //
    .commit();

  if (insert.ok) {
    return newUser;
  }

  throw new KvError('failed to insert user');
}

export async function getGuild(guildId: string): Promise<Schema.Guild> {
  const response = await db.getValue<Schema.Guild>(guildsByDiscordId(guildId));

  if (response) {
    return response;
  }

  const newGuild: Schema.Guild = {
    _id: ulid(),
    id: guildId,
    instances: [],
  };

  const insert = await kv.atomic()
    .check({ key: guildsByDiscordId(guildId), versionstamp: null })
    //
    .set(['guilds', newGuild._id], newGuild)
    .set(guildsByDiscordId(guildId), newGuild)
    //
    .commit();

  if (insert.ok) {
    return newGuild;
  }

  throw new KvError('failed to insert guild');
}

export async function getInstance(
  guild: Schema.Guild,
): Promise<Schema.Instance> {
  if (guild.instances.length) {
    const response = await db.getValue<Schema.Instance>([
      'instances',
      guild.instances[0],
    ]);

    if (response) {
      return response;
    }
  }

  const newInstance: Schema.Instance = {
    _id: ulid(),
    main: true,
    guild: guild._id,
    inventories: [],
    packs: [],
  };

  guild.instances = [newInstance._id];

  const insert = await kv.atomic()
    //
    .set(['instances', newInstance._id], newInstance)
    //
    .set(['guilds', guild._id], guild)
    .set(guildsByDiscordId(guild.id), guild)
    //
    .commit();

  if (insert.ok) {
    return newInstance;
  }

  throw new KvError('failed to insert instance');
}

export async function getInstancePacks(
  instance: Schema.Instance,
): Promise<Schema.Pack[]> {
  const ids = instance.packs.map(({ pack }) => ['packs', pack]);

  const packs = (await db.getManyValues<Schema.Pack>(ids))
    .filter(Boolean) as Schema.Pack[];

  return packs;
}

export async function getInventory(
  instance: Schema.Instance,
  user: Schema.User,
): Promise<{
  inventory: Schema.Inventory;
  inventoryCheck: Deno.AtomicCheck;
}> {
  const key = inventoriesByUser(instance._id, user._id);

  const response = await db.getValueAndTimestamp<Schema.Inventory>(key);

  if (response?.value) {
    return {
      inventory: response.value,
      inventoryCheck: response,
    };
  }

  const newInventory: Schema.Inventory = {
    _id: ulid(),
    availablePulls: MAX_NEW_PULLS,
    instance: instance._id,
    user: user._id,
  };

  instance.inventories.push(newInventory._id);
  user.inventories.push(newInventory._id);

  const insert = await kv.atomic()
    .check({ key, versionstamp: null })
    //
    .set(['inventories', newInventory._id], newInventory)
    .set(inventoriesByUser(instance._id, user._id), newInventory)
    //
    .set(['instances', instance._id], instance)
    //
    .set(['users', user._id], user)
    .set(usersByDiscordId(user.id), user)
    //
    .commit();

  if (insert.ok) {
    return {
      inventory: newInventory,
      inventoryCheck: {
        key,
        versionstamp: (insert as Deno.KvCommitResult).versionstamp,
      },
    };
  }

  throw new KvError('failed to insert inventory');
}

export async function rechargeConsumables(
  instance: Schema.Instance,
  user: Schema.User,
  commit = true,
): Promise<{
  user: Schema.User;
  inventory: Schema.Inventory;
  inventoryCheck: Deno.AtomicCheck;
}> {
  let res = { ok: false }, retries = 0;

  while (!res.ok && retries < 5) {
    const { inventory, inventoryCheck } = await db.getInventory(instance, user);

    const sweepsTimestamp = new Date(inventory.sweepsTimestamp ?? Date.now());
    const pullsTimestamp = new Date(inventory.rechargeTimestamp ?? Date.now());

    const currentPulls = inventory.availablePulls;
    const currentSweeps = inventory.availableSweeps ?? MAX_NEW_SWEEPS;

    const newPulls = Math.max(
      0,
      Math.min(
        MAX_PULLS - currentPulls,
        Math.trunc(
          utils.diffInMinutes(pullsTimestamp, new Date()) / RECHARGE_MINS,
        ),
      ),
    );

    const newSweeps = Math.min(
      MAX_SWEEPS - currentSweeps,
      utils.diffInMinutes(sweepsTimestamp, new Date()) >= RECHARGE_SWEEPS_MINS
        ? MAX_SWEEPS - currentSweeps
        : 0,
    );

    const dailyTimestamp = user.dailyTimestamp
      ? new Date(user.dailyTimestamp)
      : undefined;

    const dailyTimestampThreshold = new Date(
      Date.now() - RECHARGE_DAILY_TOKENS * 60 * 60 * 1000,
    );

    const newDailyTokens = !dailyTimestamp ||
      dailyTimestamp <= dailyTimestampThreshold;

    if (
      newPulls === currentPulls &&
      newSweeps === currentSweeps &&
      !newDailyTokens
    ) {
      return { user, inventory, inventoryCheck };
    }

    const rechargedPulls = currentPulls + newPulls;
    const rechargedSweeps = currentSweeps + newSweeps;

    inventory.availablePulls = Math.min(99, rechargedPulls);
    inventory.availableSweeps = Math.min(99, rechargedSweeps);

    inventory.rechargeTimestamp = rechargedPulls >= MAX_PULLS
      ? undefined
      : new Date(pullsTimestamp.getTime() + (newPulls * RECHARGE_MINS * 60000))
        .toISOString();

    inventory.sweepsTimestamp = rechargedSweeps >= MAX_SWEEPS
      ? undefined
      : new Date(
        sweepsTimestamp.getTime() + (newSweeps * RECHARGE_SWEEPS_MINS * 60000),
      )
        .toISOString();

    if (newDailyTokens) {
      user.availableTokens ??= 0;

      user.availableTokens += 1;

      const dayOfWeek = new Date().getUTCDay();

      if (dayOfWeek === 0 || dayOfWeek === 6 || dayOfWeek === 5) {
        // Today is a Weekend (Saturday, Sunday, or Friday) in GMT timezone
        user.availableTokens += 2;
      } else {
        // Today is a normal weekday in GMT timezone
        user.availableTokens += 1;
      }

      user.dailyTimestamp = new Date().toISOString();
    }

    if (!commit) {
      return { user, inventory, inventoryCheck };
    }

    // don't save likes on the user object
    user.likes = undefined;

    res = await kv.atomic()
      .check(inventoryCheck)
      //
      .set(['inventories', inventory._id], inventory)
      .set(inventoriesByUser(inventory.instance, inventory._id), inventory)
      //
      .set(['users', user._id], user)
      .set(usersByDiscordId(user.id), user)
      //
      .commit();

    if (res.ok) {
      return {
        user,
        inventory,
        inventoryCheck: {
          key: inventoryCheck.key,
          versionstamp: (res as Deno.KvCommitResult).versionstamp,
        },
      };
    }

    retries += 1;
  }

  throw new KvError('failed to update inventory');
}

export async function getInstanceInventories(
  instance: Schema.Instance,
): Promise<[Schema.Inventory, Schema.User][]> {
  let inventories = await db.getValues<Schema.Inventory>(
    { prefix: inventoriesByInstance(instance._id) },
  );

  inventories = inventories.filter((inv) => {
    if (!inv.lastPull) {
      return false;
    }

    if (!utils.isWithin14Days(new Date(inv.lastPull))) {
      return false;
    }

    return true;
  });

  const users = (await db.getManyValues<Schema.User>(
    inventories.map(({ user }) => ['users', user]),
  )).filter(Boolean) as Schema.User[];

  const likes = await db.getManyBlobValues<Schema.Like[]>(
    users.map(({ id }) => usersLikesByDiscordId(id)),
  );

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    user.likes = likes[i];
  }

  // deno-lint-ignore no-non-null-assertion
  return inventories.map((inventory, i) => [inventory, users[i]!]);
}

export async function getUserCharacters(
  inventory: Schema.Inventory,
): Promise<Deno.KvEntry<Schema.Character>[]> {
  const characters = await db.getValuesAndTimestamps<Schema.Character>(
    { prefix: charactersByInventoryPrefix(inventory._id) },
  );

  return characters;
}

export async function getUserParty(
  inventory: Schema.Inventory,
): Promise<Schema.Party> {
  const response = await db.getManyValues<Schema.Character>([
    ['characters', inventory.party?.member1 ?? ''],
    ['characters', inventory.party?.member2 ?? ''],
    ['characters', inventory.party?.member3 ?? ''],
    ['characters', inventory.party?.member4 ?? ''],
    ['characters', inventory.party?.member5 ?? ''],
  ]);

  return {
    member1: response[0],
    member2: response[1],
    member3: response[2],
    member4: response[3],
    member5: response[4],
  };
}
