import db, { type Mongo } from '~/db/index.ts';

import i18n from '~/src/i18n.ts';

import user from '~/src/user.ts';

import { NonFetalError, NoPullsError } from '~/src/errors.ts';

import type { ObjectId } from '~/db/index.ts';

import type * as Schema from '~/db/schema.ts';

import type { AnyBulkWriteOperation } from 'mongodb';

export async function addCharacter({
  rating,
  mediaId,
  characterId,
  guaranteed,
  userId,
  guildId,
  sacrifices,
  mongo,
}: {
  rating: number;
  mediaId: string;
  characterId: string;
  guaranteed: boolean;
  userId: string;
  guildId: string;
  sacrifices?: ObjectId[];
  mongo: Mongo;
}): Promise<void> {
  const locale =
    user.cachedUsers[userId]?.locale ?? user.cachedUsers[guildId]?.locale;

  const session = mongo.startSession();

  try {
    session.startTransaction();

    const { user, ...inventory } = await db.rechargeConsumables(
      guildId,
      userId,
      mongo,
      true
    );

    if (!guaranteed && !sacrifices?.length && inventory.availablePulls <= 0) {
      throw new NoPullsError(inventory.rechargeTimestamp);
    }

    if (
      guaranteed &&
      !sacrifices?.length &&
      !user?.guarantees?.includes(rating)
    ) {
      throw new Error('403');
    }

    const newCharacter: Schema.Character = {
      createdAt: new Date(),
      inventoryId: inventory._id,
      characterId,
      guildId,
      userId,
      mediaId,
      rating,
    };

    const update: Partial<Schema.Inventory> = {
      lastPull: new Date(),
    };

    const deleteSacrifices: AnyBulkWriteOperation<Schema.Character>[] = [];

    // if sacrifices (merge)
    if (sacrifices?.length) {
      deleteSacrifices.push({
        deleteMany: { filter: { _id: { $in: sacrifices } } },
      });
    } else if (guaranteed) {
      // if guaranteed pull
      const i = user.guarantees.indexOf(rating);

      user.guarantees.splice(i, 1);

      await mongo.users().updateOne(
        { _id: user._id },
        {
          $set: { guarantees: user.guarantees },
        },
        { session }
      );
    } else {
      // if normal pull
      update.availablePulls = inventory.availablePulls - 1;
      update.rechargeTimestamp = inventory.rechargeTimestamp ?? new Date();
    }

    await mongo
      .inventories()
      .updateOne({ _id: inventory._id }, { $set: update }, { session });

    const result = await mongo
      .characters()
      .bulkWrite(
        [...deleteSacrifices, { insertOne: { document: newCharacter } }],
        { session }
      );

    if (sacrifices?.length && result.deletedCount !== sacrifices.length) {
      throw new NonFetalError(i18n.get('failed', locale));
    }

    await session.commitTransaction();
  } catch (err) {
    if (session.transaction.isActive) {
      await session.abortTransaction();
    }

    await session.endSession();

    throw err;
  } finally {
    await session.endSession();
  }
}
