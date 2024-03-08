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

export function consumeSweep(
  {
    op,
    inventory,
    inventoryCheck,
  }: {
    op: Deno.AtomicOperation;
    inventory: Schema.Inventory;
    user: Schema.User;
    inventoryCheck: Deno.AtomicCheck;
  },
): number {
  const sweeps = inventory.availableSweeps ?? 0;

  inventory.availableSweeps = 0;

  inventory.lastSweep = new Date().toISOString();
  inventory.sweepsTimestamp ??= new Date().toISOString();

  op
    .check(inventoryCheck)
    .set(['inventories', inventory._id], inventory)
    .set(inventoriesByUser(inventory.instance, inventory.user), inventory);

  return sweeps;
}
