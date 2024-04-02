import db from '~/db/mod.ts';

import type * as Schema from './schema.ts';

export async function clearFloor(
  userId: string,
  guildId: string,
): Promise<Schema.Inventory | null> {
  const inventory = await db.inventories().findOneAndUpdate(
    { userId, guildId },
    { $inc: { floorsCleared: 1 } },
    { returnDocument: 'after' },
  );

  return inventory;
}

export async function consumeKey(
  userId: string,
  guildId: string,
): Promise<boolean> {
  const { modifiedCount } = await db.inventories().updateOne(
    { userId, guildId, availableKeys: { $gte: 1 } },
    {
      $inc: { availableKeys: -1 },
      $set: { keysTimestamp: new Date(), lastPVE: new Date() },
    },
  );

  return modifiedCount === 1;
}
