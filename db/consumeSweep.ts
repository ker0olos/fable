import { inventoriesByUser, usersByDiscordId } from './indices.ts';

import type * as Schema from './schema.ts';

import db from './mod.ts';

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
    user,
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

  db.checkDailyTimestamp(user);

  // don't save likes on the user object
  user.likes = undefined;

  op
    .check(inventoryCheck)
    //
    .set(['users', user._id], user)
    .set(usersByDiscordId(user.id), user)
    //
    .set(['inventories', inventory._id], inventory)
    .set(inventoriesByUser(inventory.instance, inventory.user), inventory);
}
