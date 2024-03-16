import db from '~/db/mod.ts';

import type * as Schema from '~/db/schema.ts';

export const COSTS = {
  THREE: 4,
  FOUR: 12,
  FIVE: 28,
};

export async function addTokens(
  userId: string,
  amount: number,
): Promise<void> {
  await db.users().updateOne(
    { discordId: userId },
    { $inc: { availableTokens: amount } },
  );
}

export async function addPulls(
  userId: string,
  guildId: string,
  amount: number,
): Promise<void> {
  const session = db.client.startSession();

  try {
    session.startTransaction();

    const { modifiedCount } = await db.users().updateOne({
      discordId: userId,
      availableTokens: { $gte: amount },
    }, { $inc: { availableTokens: -amount } });

    if (!modifiedCount) {
      throw new Error();
    }

    await db.inventories().updateOne(
      { userId, guildId },
      { $inc: { availablePulls: amount } },
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
}

export async function addGuarantee(
  userId: string,
  guarantee: number,
): Promise<Schema.User | null> {
  const cost = guarantee === 5
    ? COSTS.FIVE
    : guarantee === 4
    ? COSTS.FOUR
    : COSTS.THREE;

  const user = await db.users().findOneAndUpdate({
    discordId: userId,
    availableTokens: { $gte: cost },
  }, {
    $push: { guarantees: guarantee },
    $inc: { availableTokens: -cost },
  }, { returnDocument: 'after' });

  return user;
}

export async function addKeys(
  userId: string,
  guildId: string,
  amount: number,
): Promise<void> {
  const session = db.client.startSession();

  try {
    session.startTransaction();

    const { modifiedCount } = await db.users().updateOne({
      discordId: userId,
      availableTokens: { $gte: amount },
    }, { $inc: { availableTokens: -amount } });

    if (!modifiedCount) {
      throw new Error();
    }

    await db.inventories().updateOne(
      { userId, guildId },
      { $inc: { availableKeys: amount } },
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
}
