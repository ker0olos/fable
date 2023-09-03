/// <reference lib="deno.unstable" />

import { inventoriesByUser, usersByDiscordId } from './indices.ts';

import db, { kv, MAX_PULLS } from './mod.ts';

import { KvError } from '../src/errors.ts';

import type * as Schema from './schema.ts';

export const COSTS = {
  THREE: 4,
  FOUR: 12,
  FIVE: 28,
};

export async function addTokens(
  user: Schema.User,
  amount: number,
  vote?: boolean,
): Promise<Schema.User> {
  user.availableTokens ??= 0;

  user.availableTokens = user.availableTokens + amount;

  if (vote) {
    user.lastVote = new Date().toISOString();
  }

  let res = { ok: false }, retires = 0;

  while (!res.ok && retires < 5) {
    res = await kv.atomic()
      .set(['users', user._id], user)
      .set(usersByDiscordId(user.id), user)
      .commit();

    if (res.ok) {
      return user;
    }

    retires += 1;
  }

  throw new KvError('failed to update user');
}

export async function addPulls(
  instance: Schema.Instance,
  user: Schema.User,
  amount: number,
): Promise<Schema.Inventory> {
  user.availableTokens ??= 0;

  if (amount > user.availableTokens) {
    throw new Error('INSUFFICIENT_TOKENS');
  }

  user.availableTokens = user.availableTokens - amount;

  let res = { ok: false }, retires = 0;

  while (!res.ok && retires < 5) {
    const { inventory, inventoryCheck } = await db.rechargePulls(
      instance,
      user,
      false,
    );

    inventory.availablePulls = Math.min(99, inventory.availablePulls + amount);

    if (inventory.availablePulls >= MAX_PULLS) {
      inventory.rechargeTimestamp = undefined;
    }

    res = await kv.atomic()
      .check(inventoryCheck)
      //
      .set(['inventories', inventory._id], inventory)
      .set(inventoriesByUser(inventory.instance, user._id), inventory)
      //
      .set(['users', user._id], user)
      .set(usersByDiscordId(user.id), user)
      //
      .commit();

    if (res.ok) {
      return inventory;
    }

    retires += 1;
  }

  throw new KvError('failed to update inventory');
}

export async function addGuarantee(
  user: Schema.User,
  guarantee: number,
): Promise<Schema.User> {
  const cost = guarantee === 5
    ? COSTS.FIVE
    : guarantee === 4
    ? COSTS.FOUR
    : COSTS.THREE;

  user.guarantees ??= [];
  user.availableTokens ??= 0;

  if (cost > user.availableTokens) {
    throw new Error('INSUFFICIENT_TOKENS');
  }

  user.availableTokens = user.availableTokens - cost;

  user.guarantees.push(guarantee);

  const update = await kv.atomic()
    .set(['users', user._id], user)
    .set(usersByDiscordId(user.id), user)
    .commit();

  if (update.ok) {
    return user;
  }

  throw new KvError('failed to update user');
}
