import { inventoriesByUser } from '~/db/indices.ts';

import type * as Schema from '~/db/schema.ts';

export function clearFloor(
  op: Deno.AtomicOperation,
  inventory: Schema.Inventory,
): number {
  inventory.floorsCleared ??= 0;
  inventory.floorsCleared += 1;

  op
    .set(['inventories', inventory._id], inventory)
    .set(inventoriesByUser(inventory.instance, inventory.user), inventory);

  return inventory.floorsCleared;
}

export function consumeKey(
  {
    op,
    inventory,
    inventoryCheck,
    amount,
  }: {
    op: Deno.AtomicOperation;
    inventory: Schema.Inventory;
    inventoryCheck: Deno.AtomicCheck;
    amount?: number;
  },
): number {
  if (typeof inventory.availableKeys === 'undefined') {
    throw new Error("available keys shouldn't be undefined");
  }

  const keys = amount ?? inventory.availableKeys;

  inventory.availableKeys -= keys;

  inventory.lastPVE = new Date().toISOString();
  inventory.keysTimestamp ??= new Date().toISOString();

  op
    .check(inventoryCheck)
    .set(['inventories', inventory._id], inventory)
    .set(inventoriesByUser(inventory.instance, inventory.user), inventory);

  return keys;
}
