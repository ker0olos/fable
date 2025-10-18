import { Mongo, STEAL_COOLDOWN_HOURS } from '~/db/index.ts';

import utils from '~/src/utils.ts';

import type * as Schema from './schema.ts';

import type { WithId } from 'mongodb';

export const MAX_PULLS = 5;
export const MAX_NEW_PULLS = 10;

export const RECHARGE_MINS = 30;

export const RECHARGE_DAILY_TOKENS_HOURS = 12;

export const newUser = (
  userId: string,
  omit?: (keyof Schema.User)[]
): Schema.User => {
  const user: Schema.User = {
    discordId: userId,
    dailyTimestamp: new Date(),
    availableTokens: 0,
    guarantees: [],
    likes: [],
  };

  omit?.forEach((key) => {
    delete user[key];
  });

  return user;
};

export const newGuild = (
  guildId: string,
  omit?: (keyof Schema.Guild)[]
): Schema.Guild => {
  const guild: Schema.Guild = {
    excluded: false,
    discordId: guildId,
    options: { dupes: false, steal: true },
    packIds: ['anilist', 'vtubers'],
  };

  omit?.forEach((key) => {
    delete guild[key];
  });

  return guild;
};

export const newInventory = (
  guildId: string,
  userId: string,
  omit?: (keyof Schema.Inventory)[]
): Schema.Inventory => {
  const inventory: Schema.Inventory = {
    guildId,
    userId,
    availablePulls: MAX_NEW_PULLS,
    party: {
      member1Id: null,
      member2Id: null,
      member3Id: null,
      member4Id: null,
      member5Id: null,
    },
  };

  omit?.forEach((key) => {
    delete inventory[key];
  });

  return inventory;
};

export async function getUser(
  userId: string,
  db?: Mongo,
  manual?: boolean
): Promise<WithId<Schema.User>> {
  db ??= new Mongo();

  let result: WithId<Schema.User>;

  try {
    if (!manual) await db.connect();

    result = (await db.users().findOneAndUpdate(
      { discordId: userId },
      { $setOnInsert: newUser(userId) }, // only invoked if document isn't found
      { upsert: true, returnDocument: 'after' }
    ))!;
  } finally {
    if (!manual) await db.close();
  }

  return result;
}

export async function forceNewUser(userId: string): Promise<Schema.User> {
  const db = new Mongo();

  const user: Schema.User = newUser(userId);

  try {
    await db.connect();

    await db.users().insertOne(user);
  } finally {
    await db.close();
  }

  return user;
}

export async function getGuild(
  guildId: string,
  db?: Mongo,
  manual?: boolean
): Promise<Schema.PopulatedGuild> {
  db ??= new Mongo();

  let _result: Schema.PopulatedGuild;

  try {
    if (!manual) await db.connect();

    const { _id } = (await db.guilds().findOneAndUpdate(
      { discordId: guildId },
      { $setOnInsert: newGuild(guildId) }, // only invoked if document isn't found
      { upsert: true, returnDocument: 'after' }
    ))!;

    // populate the guild with the relevant relations
    // unfortunately cannot be done in the same step as findOrInsert
    const [result] = await db
      .guilds()
      .aggregate()
      .match({ _id })
      .lookup({
        localField: 'packIds',
        foreignField: 'manifest.id',
        from: 'packs',
        as: 'packs',
      })
      .toArray();

    _result = result as Schema.PopulatedGuild;
  } finally {
    if (!manual) await db.close();
  }

  return _result;
}

export async function getInventory(
  guildId: string,
  userId: string,
  db?: Mongo,
  manual?: boolean
): Promise<Schema.PopulatedInventory> {
  db ??= new Mongo();

  let _result: Schema.PopulatedInventory;

  try {
    if (!manual) await db.connect();

    const { _id } = (await db.inventories().findOneAndUpdate(
      { guildId, userId },
      { $setOnInsert: newInventory(guildId, userId) }, // only invoked if document isn't found
      { upsert: true, returnDocument: 'after' }
    ))!;

    // populate the inventory with the relevant relations
    // unfortunately cannot be done in the same step as findOrInsert
    const [result] = (await db
      .inventories()
      .aggregate()
      .match({ _id })
      //
      .lookup({
        localField: 'userId',
        foreignField: 'discordId',
        from: 'users',
        as: 'user',
      })
      .lookup({
        localField: 'party.member1Id',
        foreignField: '_id',
        from: 'characters',
        as: 'party.member1',
      })
      .lookup({
        localField: 'party.member2Id',
        foreignField: '_id',
        from: 'characters',
        as: 'party.member2',
      })
      .lookup({
        localField: 'party.member3Id',
        foreignField: '_id',
        from: 'characters',
        as: 'party.member3',
      })
      .lookup({
        localField: 'party.member4Id',
        foreignField: '_id',
        from: 'characters',
        as: 'party.member4',
      })
      .lookup({
        localField: 'party.member5Id',
        foreignField: '_id',
        from: 'characters',
        as: 'party.member5',
      })
      .toArray()) as Schema.PopulatedInventory[];

    if (Array.isArray(result.user)) {
      result.user = result.user.length
        ? result.user[0]
        : await forceNewUser(userId);
    }

    // manually unwind relation arrays

    if (Array.isArray(result.party.member1)) {
      result.party.member1 = result.party.member1.length
        ? result.party.member1[0]
        : undefined;
    }

    if (Array.isArray(result.party.member2)) {
      result.party.member2 = result.party.member2.length
        ? result.party.member2[0]
        : undefined;
    }

    if (Array.isArray(result.party.member3)) {
      result.party.member3 = result.party.member3.length
        ? result.party.member3[0]
        : undefined;
    }

    if (Array.isArray(result.party.member4)) {
      result.party.member4 = result.party.member4.length
        ? result.party.member4[0]
        : undefined;
    }

    if (Array.isArray(result.party.member5)) {
      result.party.member5 = result.party.member5.length
        ? result.party.member5[0]
        : undefined;
    }

    _result = result as Schema.PopulatedInventory;
  } finally {
    if (!manual) await db.close();
  }

  return _result;
}

export async function rechargeConsumables(
  guildId: string,
  userId: string,
  db?: Mongo,
  manual?: boolean
): Promise<Schema.PopulatedInventory> {
  db ??= new Mongo();

  let result: Schema.PopulatedInventory;

  try {
    if (!manual) await db.connect();

    const [guild, inventory] = await Promise.all([
      getGuild(guildId, db, true),
      getInventory(guildId, userId, db, true),
    ]);

    const { user } = inventory;

    const pullsTimestamp = inventory.rechargeTimestamp ?? new Date();

    const currentPulls = inventory.availablePulls;
    const maxPulls = guild.options.maxPulls ?? MAX_PULLS;
    const rechargeMins = guild.options.rechargeMins ?? RECHARGE_MINS;

    const newPulls = Math.max(
      0,
      Math.min(
        maxPulls - currentPulls,
        Math.trunc(
          utils.diffInMinutes(pullsTimestamp, new Date()) / rechargeMins
        )
      )
    );

    const { dailyTimestamp } = user;

    const newDailyTokens =
      utils.diffInHours(dailyTimestamp, new Date()) >=
      RECHARGE_DAILY_TOKENS_HOURS;

    const stealTimestamp = inventory.stealTimestamp;

    const resetSteal =
      stealTimestamp &&
      utils.diffInHours(stealTimestamp, new Date()) >= STEAL_COOLDOWN_HOURS;

    if (!newPulls && !newDailyTokens && !resetSteal) {
      if (!manual) await db.close();
      return inventory;
    }

    const rechargedPulls = currentPulls + newPulls;

    const $userSet: Partial<Schema.User> = {};

    const $set: Partial<Schema.Inventory> = {};
    const $unset: Partial<{ [K in keyof Schema.Inventory]: '' }> = {};

    $set.availablePulls = Math.min(99, rechargedPulls);

    if (rechargedPulls < MAX_PULLS) {
      $set.rechargeTimestamp = new Date(
        pullsTimestamp.getTime() + newPulls * rechargeMins * 60000
      );
    } else {
      $unset.rechargeTimestamp = '';
    }

    if (newDailyTokens) {
      let newTokens = 1;

      // reward extra token on weekends
      switch (utils.getDayOfWeek()) {
        case 'Friday':
        case 'Saturday':
        case 'Sunday':
          newTokens += 1;
          break;
        default:
          break;
      }

      $userSet.dailyTimestamp = new Date();
      $userSet.availableTokens = user.availableTokens + newTokens;

      await db.users().updateOne(
        { discordId: user.discordId },
        {
          $set: $userSet,
        }
      );
    }

    if (resetSteal) {
      $unset.stealTimestamp = '';
    }

    await db.inventories().updateOne({ _id: inventory._id }, { $set, $unset });

    result = { ...inventory, ...$set };

    result.user = { ...result.user, ...$userSet };

    Object.keys($unset).forEach((key) => {
      delete result[key as keyof Schema.PopulatedInventory];
    });
  } finally {
    if (!manual) await db.close();
  }

  return result;
}

export async function getActiveUsersIfLiked(
  guildId: string,
  characterId: string,
  mediaIds: string[]
): Promise<string[]> {
  const db = new Mongo();

  let results: string[];

  const twoWeeks = new Date();

  twoWeeks.setDate(twoWeeks.getDate() - 7 * 2);

  try {
    await db.connect();

    results = (
      await db
        .inventories()
        .aggregate()
        .match({
          guildId,
          $or: [{ lastPull: { $gte: twoWeeks } }],
        })
        .lookup({
          localField: 'userId',
          foreignField: 'discordId',
          from: 'users',
          as: 'user',
        })
        .match({
          $or: [
            { 'user.likes': { $in: mediaIds.map((mediaId) => ({ mediaId })) } },
            { 'user.likes': { $in: [{ characterId }] } },
          ],
        })
        .toArray()
    ).map(({ userId }) => userId);
  } finally {
    await db.close();
  }

  return results;
}

export async function getUserCharacters(
  userId: string,
  guildId: string,
  db?: Mongo,
  manual?: boolean
): Promise<WithId<Schema.Character>[]> {
  db ??= new Mongo();

  let result: WithId<Schema.Character>[];

  try {
    if (!manual) await db.connect();

    result = await db
      .characters()
      .find(
        { userId, guildId },
        {
          sort: { createdAt: 1 },
        }
      )
      .toArray();
  } finally {
    if (!manual) await db.close();
  }

  return result;
}

export async function getGuildCharacters(
  guildId: string,
  db?: Mongo,
  manual?: boolean
): Promise<string[]> {
  db ??= new Mongo();

  let result: WithId<Schema.Character>[];

  try {
    if (!manual) await db.connect();

    result = await db.characters().find({ guildId }).toArray();
  } finally {
    if (!manual) await db.close();
  }

  return result.map(({ characterId }) => characterId);
}

export async function getMediaCharacters(
  guildId: string,
  mediaIds: string[],
  db?: Mongo,
  manual?: boolean
): Promise<Schema.Character[]> {
  db ??= new Mongo();

  let results: Schema.Character[];

  try {
    if (!manual) await db.connect();

    results = await db
      .characters()
      .find({
        mediaId: { $in: mediaIds },
        guildId,
      })
      .toArray();
  } finally {
    if (!manual) await db.close();
  }

  return results;
}
