/// <reference lib="deno.unstable" />

import { inventoriesByUser } from './indices.ts';

import { NoSweepsError } from '../src/errors.ts';

import type { Inventory } from './schema.ts';

export function clearFloor(
  op: Deno.AtomicOperation,
  inventory: Inventory,
): number {
  inventory.floorsCleared ??= 0;

  inventory.floorsCleared += 1;

  op
    .set(['inventories', inventory._id], inventory)
    .set(inventoriesByUser(inventory.instance, inventory.user), inventory);

  return inventory.floorsCleared;
}

export function consumeSweep(
  {
    op,
    inventory,
    inventoryCheck,
  }: {
    op: Deno.AtomicOperation;
    inventory: Inventory;
    inventoryCheck: Deno.AtomicCheck;
  },
): void {
  // deno-lint-ignore no-non-null-assertion
  if (!inventory.floorsCleared || inventory.availableSweeps! <= 0) {
    throw new NoSweepsError(inventory.sweepsTimestamp);
  }

  // deno-lint-ignore no-non-null-assertion
  inventory.availableSweeps = inventory.availableSweeps! - 1;

  inventory.lastSweep = new Date().toISOString();
  inventory.sweepsTimestamp ??= new Date().toISOString();

  op
    .check(inventoryCheck)
    //
    .set(['inventories', inventory._id], inventory)
    .set(inventoriesByUser(inventory.instance, inventory.user), inventory);
}
