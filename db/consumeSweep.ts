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
): void {
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
