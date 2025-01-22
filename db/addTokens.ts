import { Mongo } from '~/db/mod.ts';

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
  free: boolean = false,
): Promise<void> {
  const db = new Mongo();

  const session = db.startSession();

  try {
    await db.connect();

    session.startTransaction();

    if (!free) {
      const { modifiedCount } = await db.users().updateOne({
        discordId: userId,
        availableTokens: { $gte: amount },
      }, { $inc: { availableTokens: -amount } });

      if (!modifiedCount) {
        throw new Error('INSUFFICIENT_TOKENS');
      }
    }

    await db.inventories().updateOne(
      { userId, guildId },
      { $inc: { availablePulls: amount } },
    );

    await session.commitTransaction();
  } catch (err) {
    if (session.transaction.isActive) {
      await session.abortTransaction();
    }

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
): Promise<void> {
  const cost = guarantee === 5
    ? COSTS.FIVE
    : guarantee === 4
    ? COSTS.FOUR
    : COSTS.THREE;

  const db = new Mongo();

  try {
    await db.connect();

    const { modifiedCount } = await db.users().updateOne({
      discordId: userId,
      availableTokens: { $gte: cost },
    }, {
      $push: { guarantees: guarantee },
      $inc: { availableTokens: -cost },
    });

    if (!modifiedCount) {
      throw new Error('INSUFFICIENT_TOKENS');
    }
  } finally {
    await db.close();
  }
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
    if (session.transaction.isActive) {
      await session.abortTransaction();
    }

    await session.endSession();
    await db.close();

    throw err;
  } finally {
    await session.endSession();
    await db.close();
  }
}
