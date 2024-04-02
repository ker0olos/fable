import { Mongo } from '~/db/mod.ts';

import type { WithId } from 'mongodb';

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
  const db = new Mongo();

  try {
    await db.connect();

    await db.users().updateOne(
      { discordId: userId },
      { $inc: { availableTokens: amount } },
    );
  } finally {
    await db.close();
  }
}

export async function addPulls(
  userId: string,
  guildId: string,
  amount: number,
): Promise<void> {
  const db = new Mongo();

  const session = db.startSession();

  try {
    await db.connect();

    session.startTransaction();

    const { modifiedCount } = await db.users().updateOne({
      discordId: userId,
      availableTokens: { $gte: amount },
    }, { $inc: { availableTokens: -amount } });

    if (!modifiedCount) {
      throw new Error('INSUFFICIENT_TOKENS');
    }

    await db.inventories().updateOne(
      { userId, guildId },
      { $inc: { availablePulls: amount } },
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    await db.close();

    throw err;
  } finally {
    await session.endSession();
    await db.close();
  }
}

export async function addGuarantee(
  userId: string,
  guarantee: number,
): Promise<WithId<Schema.User> | null> {
  const cost = guarantee === 5
    ? COSTS.FIVE
    : guarantee === 4
    ? COSTS.FOUR
    : COSTS.THREE;

  const db = new Mongo();

  let result: WithId<Schema.User> | null;

  try {
    await db.connect();

    result = await db.users().findOneAndUpdate({
      discordId: userId,
      availableTokens: { $gte: cost },
    }, {
      $push: { guarantees: guarantee },
      $inc: { availableTokens: -cost },
    }, { returnDocument: 'after' });
  } finally {
    await db.close();
  }

  return result;
}

export async function addKeys(
  userId: string,
  guildId: string,
  amount: number,
): Promise<void> {
  const db = new Mongo();

  const session = db.startSession();

  try {
    await db.connect();

    session.startTransaction();

    const { modifiedCount } = await db.users().updateOne({
      discordId: userId,
      availableTokens: { $gte: amount },
    }, { $inc: { availableTokens: -amount } });

    if (!modifiedCount) {
      throw new Error('INSUFFICIENT_TOKENS');
    }

    await db.inventories().updateOne(
      { userId, guildId },
      { $inc: { availableKeys: amount } },
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    await db.close();

    throw err;
  } finally {
    await session.endSession();
    await db.close();
  }
}
