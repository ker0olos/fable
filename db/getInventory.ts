import { Mongo, STEAL_COOLDOWN_HOURS } from '~/db/mod.ts';

import utils from '~/src/utils.ts';

import type * as Schema from './schema.ts';

import type { WithId } from 'mongodb';

export const MAX_PULLS = 5;
export const MAX_NEW_PULLS = 10;

export const MAX_KEYS = 5;

export const RECHARGE_MINS = 30;
export const RECHARGE_KEYS_MINS = 10;

export const RECHARGE_DAILY_TOKENS_HOURS = 12;

export const newUser = (
  userId: string,
  omit?: (keyof Schema.User)[],
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
  omit?: (keyof Schema.Guild)[],
): Schema.Guild => {
  const guild: Schema.Guild = {
    excluded: false,
    builtinsDisabled: false,
    discordId: guildId,
    packIds: [],
  };

  omit?.forEach((key) => {
    delete guild[key];
  });

  return guild;
};

export const newInventory = (
  guildId: string,
  userId: string,
  omit?: (keyof Schema.Inventory)[],
): Schema.Inventory => {
  const inventory: Schema.Inventory = {
    guildId,
    userId,
    availablePulls: MAX_NEW_PULLS,
    availableKeys: MAX_KEYS,
    floorsCleared: 0,
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
  manual?: boolean,
): Promise<WithId<Schema.User>> {
  db ??= new Mongo();

  let result: WithId<Schema.User>;

  try {
    !manual && await db.connect();

    // deno-lint-ignore no-non-null-assertion
    result = (await db.users().findOneAndUpdate(
      { discordId: userId },
      { $setOnInsert: newUser(userId) }, // only invoked if document isn't found
      { upsert: true, returnDocument: 'after' },
    ))!;
  } finally {
    !manual && await db.close();
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
): Promise<Schema.PopulatedGuild> {
  const db = new Mongo();

  let _result: Schema.PopulatedGuild;

  try {
    await db.connect();

    // deno-lint-ignore no-non-null-assertion
    const { _id } = (await db.guilds().findOneAndUpdate(
      { discordId: guildId },
      { $setOnInsert: newGuild(guildId) }, // only invoked if document isn't found
      { upsert: true, returnDocument: 'after' },
    ))!;

    // populate the guild with the relevant relations
    // unfortunately cannot be done in the same step as findOrInsert
    const [result] = await db.guilds().aggregate()
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
    await db.close();
  }

  return _result;
}

export async function getInventory(
  guildId: string,
  userId: string,
  db?: Mongo,
  manual?: boolean,
): Promise<Schema.PopulatedInventory> {
  db ??= new Mongo();

  let _result: Schema.PopulatedInventory;

  try {
    !manual && await db.connect();

    // deno-lint-ignore no-non-null-assertion
    const { _id } = (await db.inventories().findOneAndUpdate(
      { guildId, userId },
      { $setOnInsert: newInventory(guildId, userId) }, // only invoked if document isn't found
      { upsert: true, returnDocument: 'after' },
    ))!;

    // populate the inventory with the relevant relations
    // unfortunately cannot be done in the same step as findOrInsert
    const [result] = await db.inventories().aggregate()
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
      .toArray() as Schema.PopulatedInventory[];

    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    if (Array.isArray(result.user)) {
      result.user = result.user.length
        ? result.user[0]
        : await forceNewUser(userId);
    }

    // manually unwind relation arrays

    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    if (Array.isArray(result.party.member1)) {
      result.party.member1 = result.party.member1.length
        ? result.party.member1[0]
        : undefined;
    }
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    if (Array.isArray(result.party.member2)) {
      result.party.member2 = result.party.member2.length
        ? result.party.member2[0]
        : undefined;
    }
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    if (Array.isArray(result.party.member3)) {
      result.party.member3 = result.party.member3.length
        ? result.party.member3[0]
        : undefined;
    }
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    if (Array.isArray(result.party.member4)) {
      result.party.member4 = result.party.member4.length
        ? result.party.member4[0]
        : undefined;
    }
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    if (Array.isArray(result.party.member5)) {
      result.party.member5 = result.party.member5.length
        ? result.party.member5[0]
        : undefined;
    }

    _result = result as Schema.PopulatedInventory;
  } finally {
    !manual && await db.close();
  }

  return _result;
}

export async function rechargeConsumables(
  guildId: string,
  userId: string,
  db?: Mongo,
  manual?: boolean,
): Promise<Schema.PopulatedInventory> {
  db ??= new Mongo();

  let result: Schema.PopulatedInventory;

  try {
    !manual && await db.connect();

    const inventory = await getInventory(guildId, userId, db, true);

    const { user } = inventory;

    const keysTimestamp = inventory.keysTimestamp ?? new Date();
    const pullsTimestamp = inventory.rechargeTimestamp ?? new Date();

    const currentPulls = inventory.availablePulls;
    const currentKeys = inventory.availableKeys;

    const newPulls = Math.max(
      0,
      Math.min(
        MAX_PULLS - currentPulls,
        Math.trunc(
          utils.diffInMinutes(pullsTimestamp, new Date()) / RECHARGE_MINS,
        ),
      ),
    );

    const newKeys = Math.max(
      0,
      Math.min(
        MAX_KEYS - currentKeys,
        Math.trunc(
          utils.diffInMinutes(keysTimestamp, new Date()) / RECHARGE_KEYS_MINS,
        ),
      ),
    );

    const { dailyTimestamp } = user;

    const newDailyTokens = utils.diffInHours(dailyTimestamp, new Date()) >=
      RECHARGE_DAILY_TOKENS_HOURS;

    const stealTimestamp = inventory.stealTimestamp;

    const resetSteal = stealTimestamp &&
      utils.diffInHours(stealTimestamp, new Date()) >=
        STEAL_COOLDOWN_HOURS;

    if (
      !newPulls &&
      !newKeys &&
      !newDailyTokens &&
      !resetSteal
    ) {
      !manual && await db.close();
      return inventory;
    }

    const rechargedPulls = currentPulls + newPulls;
    const rechargedKeys = currentKeys + newKeys;

    const $userSet: Partial<Schema.User> = {};

    const $set: Partial<Schema.Inventory> = {};
    const $unset: Partial<{ [K in keyof Schema.Inventory]: '' }> = {};

    $set.availablePulls = Math.min(99, rechargedPulls);
    $set.availableKeys = Math.min(99, rechargedKeys);

    if (rechargedPulls < MAX_PULLS) {
      $set.rechargeTimestamp = new Date(
        pullsTimestamp.getTime() + (newPulls * RECHARGE_MINS * 60000),
      );
    } else {
      $unset.rechargeTimestamp = '';
    }

    if (rechargedKeys < MAX_KEYS) {
      $set.keysTimestamp = new Date(
        keysTimestamp.getTime() + (newKeys * RECHARGE_KEYS_MINS * 60000),
      );
    } else {
      $unset.keysTimestamp = '';
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

      await db.users().updateOne({ discordId: user.discordId }, {
        $set: $userSet,
      });
    }

    if (resetSteal) {
      $unset.stealTimestamp = '';
    }

    await db.inventories().updateOne(
      { _id: inventory._id },
      { $set, $unset },
    );

    result = { ...inventory, ...$set };

    result.user = { ...result.user, ...$userSet };

    Object.keys($unset).forEach((key) => {
      delete result[key as keyof Schema.PopulatedInventory];
    });
  } finally {
    !manual && await db.close();
  }

  return result;
}

export async function getActiveUsersIfLiked(
  guildId: string,
  characterId: string,
  mediaIds: string[],
): Promise<string[]> {
  const db = new Mongo();

  let results: string[];

  const twoWeeks = new Date();

  twoWeeks.setDate(twoWeeks.getDate() - (7 * 2));

  try {
    await db.connect();

    results = (await db.inventories().aggregate()
      .match({
        guildId,
        $or: [
          { lastPull: { $gte: twoWeeks } },
          { lastPVE: { $gte: twoWeeks } },
        ],
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
      .toArray())
      .map(({ userId }) => userId);
  } finally {
    await db.close();
  }

  return results;
}

export async function getUserCharacters(
  userId: string,
  guildId: string,
  db?: Mongo,
  manual?: boolean,
): Promise<WithId<Schema.Character>[]> {
  db ??= new Mongo();

  let result: WithId<Schema.Character>[];

  try {
    !manual && await db.connect();

    result = await db.characters().find({ userId, guildId }, {
      sort: { createdAt: 1 },
    }).toArray();
  } finally {
    !manual && await db.close();
  }

  return result;
}

export async function getGuildCharacters(
  guildId: string,
): Promise<string[]> {
  const db = new Mongo();

  let result: WithId<Schema.Character>[];

  try {
    await db.connect();

    result = await db.characters().find({ guildId }).toArray();
  } finally {
    await db.close();
  }

  return result.map(({ characterId }) => characterId);
}
