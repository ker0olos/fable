import db, { STEAL_COOLDOWN_HOURS } from '~/db/mod.ts';

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
  const user = {
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
  const guild = {
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
): Schema.Inventory => ({
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
});

export async function getUser(userId: string): Promise<WithId<Schema.User>> {
  // deno-lint-ignore no-non-null-assertion
  const result = (await db.users().findOneAndUpdate(
    { discordId: userId },
    { $setOnInsert: newUser(userId) }, // only invoked if document isn't found
    { upsert: true, returnDocument: 'after' },
  ))!;

  return result;
}

export async function forceNewUser(userId: string): Promise<Schema.User> {
  const user = newUser(userId);
  return (await db.users().insertOne(user), user);
}

export async function getGuild(
  guildId: string,
): Promise<Schema.PopulatedGuild> {
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
    //
    .lookup({
      localField: 'packIds',
      foreignField: '_id',
      from: 'packs',
      as: 'packs',
    })
    .toArray();

  return result as Schema.PopulatedGuild;
}

export async function getInventory(
  guildId: string,
  userId: string,
): Promise<Schema.PopulatedInventory> {
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

  return result as Schema.PopulatedInventory;
}

export async function rechargeConsumables(
  guildId: string,
  userId: string,
): Promise<Schema.PopulatedInventory> {
  const inventory = await db.getInventory(guildId, userId);

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

  const t = { ...inventory, ...$set };

  t.user = { ...t.user, ...$userSet };

  Object.keys($unset).forEach((key) => {
    delete t[key as keyof Schema.PopulatedInventory];
  });

  return t;
}

export async function getActiveUsersIfLiked(
  guildId: string,
  characterId: string,
  mediaIds: string[],
): Promise<string[]> {
  const twoWeeks = new Date();

  twoWeeks.setDate(twoWeeks.getDate() - (7 * 2));

  const results = await db.inventories().aggregate()
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
    .toArray();

  return (results as Schema.PopulatedInventory[])
    .map(({ userId }) => userId);
}

export async function getUserCharacters(
  userId: string,
  guildId: string,
): Promise<WithId<Schema.Character>[]> {
  return await db.characters().find({ userId, guildId }).toArray();
}
