import database from '~/db/mod.ts';
import type * as Schema from './schema.ts';

export async function clearFloor(
  userId: string,
  guildId: string,
): Promise<Schema.Inventory | null> {
  const inventory = await database.inventories.findOneAndUpdate(
    { userId, guildId },
    { $inc: { floorsCleared: 1 } },
    { returnDocument: 'after' },
  );

  return inventory;
}

export async function consumeKey(
  userId: string,
  guildId: string,
  amount?: number,
): Promise<void> {
  await database.inventories.updateOne(
    { userId, guildId, availableKeys: { $gte: amount } },
    { $inc: { availableKeys: -1 } },
  );
}
