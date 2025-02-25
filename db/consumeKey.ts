import { Mongo } from '~/db/index.ts';

import type * as Schema from './schema.ts';

export async function clearFloor(
  userId: string,
  guildId: string
): Promise<Schema.Inventory | null> {
  const db = new Mongo();

  let result: Schema.Inventory | null;

  try {
    await db.connect();

    result = await db
      .inventories()
      .findOneAndUpdate(
        { userId, guildId },
        { $inc: { floorsCleared: 1 } },
        { returnDocument: 'after' }
      );
  } finally {
    await db.close();
  }

  return result;
}

export async function consumeKey(
  userId: string,
  guildId: string
): Promise<boolean> {
  const db = new Mongo();

  let result = false;

  try {
    await db.connect();

    const { modifiedCount } = await db.inventories().updateOne(
      { userId, guildId, availableKeys: { $gte: 1 } },
      {
        $inc: { availableKeys: -1 },
        $set: { keysTimestamp: new Date(), lastPVE: new Date() },
      }
    );

    result = modifiedCount === 1;
  } finally {
    await db.close();
  }

  return result;
}
