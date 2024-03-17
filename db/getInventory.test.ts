// deno-lint-ignore-file no-explicit-any no-non-null-assertion

import { MongoClient } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

import { stub } from '$std/testing/mock.ts';
import { afterEach, beforeEach, describe, it } from '$std/testing/bdd.ts';
import { assertEquals, assertObjectMatch } from '$std/assert/mod.ts';

import db, { MAX_KEYS, MAX_PULLS } from '~/db/mod.ts';

import utils from '~/src/utils.ts';

let mongod: MongoMemoryReplSet;

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const assertWithinLast5secs = (ts: Date) => {
  assertEquals(Math.abs(Date.now() - ts.getTime()) <= 5000, true);
};

const assertWithinLastMins = (ts: Date, mins: number) => {
  assertEquals(Math.abs(Date.now() - ts.getTime()) <= mins * 60 * 1000, true);
};

describe('db.getUser()', () => {
  beforeEach(async () => {
    mongod = await MongoMemoryReplSet.create();

    db.client = await new MongoClient(mongod.getUri())
      .connect();
  });

  afterEach(async () => {
    await db.client.close();
    await mongod.stop();
  });

  it('create new user', async () => {
    const user = await db.getUser('user-id');

    assertEquals(Object.keys(user), [
      '_id',
      'discordId',
      'availableTokens',
      'dailyTimestamp',
      'guarantees',
      'likes',
    ]);

    assertEquals(objectIdRegex.test(user._id.toHexString()), true);

    assertWithinLast5secs(user.dailyTimestamp);

    assertObjectMatch(user, {
      availableTokens: 0,
      discordId: 'user-id',
      guarantees: [],
      likes: [],
    });
  });

  it('get existing user', async () => {
    const { insertedId } = await db.users().insertOne({
      discordId: 'user-id',
    } as any);

    const user = await db.getUser('user-id');

    assertEquals(user._id, insertedId);
    assertEquals(user.discordId, 'user-id');
  });
});

describe('db.getGuild()', () => {
  beforeEach(async () => {
    mongod = await MongoMemoryReplSet.create();

    db.client = await new MongoClient(mongod.getUri())
      .connect();
  });

  afterEach(async () => {
    await db.client.close();
    await mongod.stop();
  });

  it('create new guild', async () => {
    const guild = await db.getGuild('guild-id');

    assertEquals(Object.keys(guild), [
      '_id',
      'discordId',
      'builtinsDisabled',
      'excluded',
      'packIds',
      'packs',
    ]);

    assertEquals(objectIdRegex.test(guild._id.toHexString()), true);

    assertObjectMatch(guild, {
      excluded: false,
      builtinsDisabled: false,
      discordId: 'guild-id',
      packIds: [],
    });
  });

  it('get existing guild', async () => {
    const { insertedId } = await db.guilds().insertOne({
      discordId: 'guild-id',
    } as any);

    const guild = await db.getGuild('guild-id');

    assertObjectMatch(guild, {
      _id: insertedId,
      discordId: 'guild-id',
    });
  });

  it('packs population', async () => {
    const { insertedId: insertedPackId } = await db.packs().insertOne(
      { id: 'pack-id' } as any,
    );

    const { insertedId: insertedGuildId } = await db.guilds().insertOne({
      discordId: 'guild-id',
      packIds: [insertedPackId],
    } as any);

    const guild = await db.getGuild('guild-id');

    assertObjectMatch(guild, {
      _id: insertedGuildId,
      discordId: 'guild-id',
      packIds: [insertedPackId],
      packs: [{ id: 'pack-id' }],
    });
  });
});

describe('db.getInventory()', () => {
  beforeEach(async () => {
    mongod = await MongoMemoryReplSet.create();

    db.client = await new MongoClient(mongod.getUri())
      .connect();
  });

  afterEach(async () => {
    await db.client.close();
    await mongod.stop();
  });

  it('create new inventory', async () => {
    const inventory = await db.getInventory('guild-id', 'user-id');

    assertEquals(Object.keys(inventory), [
      '_id',
      'guildId',
      'userId',
      'availableKeys',
      'availablePulls',
      'floorsCleared',
      'user',
      'party',
    ]);

    assertEquals(objectIdRegex.test(inventory._id.toHexString()), true);
    assertEquals(objectIdRegex.test(inventory.user._id.toHexString()), true);

    assertObjectMatch(inventory, {
      guildId: 'guild-id',
      userId: 'user-id',
      availablePulls: 10,
      availableKeys: 5,
      floorsCleared: 0,
      party: {
        member1: undefined,
        member2: undefined,
        member3: undefined,
        member4: undefined,
        member5: undefined,
      },
    });
  });

  it('get existing inventory', async () => {
    const { insertedId: userInsertedId } = await db.users().insertOne({
      discordId: 'user-id',
    } as any);

    const { insertedId } = await db.inventories().insertOne({
      guildId: 'guild-id',
      userId: 'user-id',
    } as any);

    const inventory = await db.getInventory('guild-id', 'user-id');

    assertObjectMatch(inventory, {
      _id: insertedId,
      guildId: 'guild-id',
      userId: 'user-id',
      user: {
        _id: userInsertedId,
      },
    } as any);
  });

  it('party population', async () => {
    const { insertedIds } = await db.characters().bulkWrite([
      { insertOne: { document: { characterId: 'character-1' } as any } },
      { insertOne: { document: { characterId: 'character-2' } as any } },
      { insertOne: { document: { characterId: 'character-3' } as any } },
      { insertOne: { document: { characterId: 'character-4' } as any } },
      { insertOne: { document: { characterId: 'character-5' } as any } },
    ]);

    const partyIds = {
      member1Id: insertedIds[0],
      member2Id: insertedIds[1],
      member3Id: insertedIds[2],
      member4Id: insertedIds[3],
      member5Id: insertedIds[4],
    };

    const { insertedId } = await db.inventories().insertOne({
      guildId: 'guild-id',
      userId: 'user-id',
      party: { ...partyIds },
    } as any);

    const inventory = await db.getInventory('guild-id', 'user-id');

    assertObjectMatch(inventory, {
      _id: insertedId,
      guildId: 'guild-id',
      userId: 'user-id',
      party: {
        ...partyIds,
        member1: { characterId: 'character-1' },
        member2: { characterId: 'character-2' },
        member3: { characterId: 'character-3' },
        member4: { characterId: 'character-4' },
        member5: { characterId: 'character-5' },
      },
    } as any);
  });
});

describe('db.rechargeConsumables()', () => {
  beforeEach(async () => {
    mongod = await MongoMemoryReplSet.create();

    db.client = await new MongoClient(mongod.getUri())
      .connect();
  });

  afterEach(async () => {
    await db.client.close();
    await mongod.stop();
  });

  it('normal', async () => {
    const inventory = await db.rechargeConsumables('guild-id', 'user-id');

    assertEquals(Object.keys(inventory), [
      '_id',
      'guildId',
      'userId',
      'availableKeys',
      'availablePulls',
      'floorsCleared',
      'user',
      'party',
    ]);

    assertObjectMatch(inventory, {
      availablePulls: 10,
      availableKeys: 5,
    });
  });

  it('recharge 2 keys (20 mins ago ts)', async () => {
    await db.inventories().insertOne(
      {
        guildId: 'guild-id',
        userId: 'user-id',
        availablePulls: 1,
        availableKeys: 2,
        keysTimestamp: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago,
      } as any,
    );

    const inventory = await db.rechargeConsumables('guild-id', 'user-id');

    assertEquals(Object.keys(inventory), [
      '_id',
      'guildId',
      'userId',
      'availablePulls',
      'availableKeys',
      'keysTimestamp',
      'user',
      'party',
      'rechargeTimestamp',
    ]);

    assertEquals(inventory.availablePulls, 1);
    assertEquals(inventory.availableKeys, 4);

    assertWithinLast5secs(inventory.keysTimestamp!);
    assertWithinLast5secs(inventory.rechargeTimestamp!);
  });

  it('recharge 2 keys (25 mins ago ts)', async () => {
    await db.inventories().insertOne(
      {
        guildId: 'guild-id',
        userId: 'user-id',
        availablePulls: 1,
        availableKeys: 2,
        keysTimestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago,
      } as any,
    );

    const inventory = await db.rechargeConsumables('guild-id', 'user-id');

    assertEquals(Object.keys(inventory), [
      '_id',
      'guildId',
      'userId',
      'availablePulls',
      'availableKeys',
      'keysTimestamp',
      'user',
      'party',
      'rechargeTimestamp',
    ]);

    assertEquals(inventory.availablePulls, 1);
    assertEquals(inventory.availableKeys, 4);

    assertWithinLastMins(inventory.keysTimestamp!, 5.5);
    assertWithinLast5secs(inventory.rechargeTimestamp!);
  });

  it('recharge MAX keys (50 mins ago ts)', async () => {
    await db.inventories().insertOne(
      {
        guildId: 'guild-id',
        userId: 'user-id',
        availablePulls: 1,
        availableKeys: 2,
        keysTimestamp: new Date(Date.now() - 50 * 60 * 1000), // 50 minutes ago,
      } as any,
    );

    const inventory = await db.rechargeConsumables('guild-id', 'user-id');

    assertEquals(Object.keys(inventory), [
      '_id',
      'guildId',
      'userId',
      'availablePulls',
      'availableKeys',
      'user',
      'party',
      'rechargeTimestamp',
    ]);

    assertEquals(inventory.availablePulls, 1);
    assertEquals(inventory.availableKeys, MAX_KEYS);

    assertWithinLast5secs(inventory.rechargeTimestamp!);
  });

  it('recharge 2 pulls (60 mins ago ts)', async () => {
    await db.inventories().insertOne(
      {
        guildId: 'guild-id',
        userId: 'user-id',
        availablePulls: 1,
        availableKeys: 2,
        rechargeTimestamp: new Date(Date.now() - 60 * 60 * 1000), // 60 minutes ago,
      } as any,
    );

    const inventory = await db.rechargeConsumables('guild-id', 'user-id');

    assertEquals(Object.keys(inventory), [
      '_id',
      'guildId',
      'userId',
      'availablePulls',
      'availableKeys',
      'rechargeTimestamp',
      'user',
      'party',
      'keysTimestamp',
    ]);

    assertEquals(inventory.availablePulls, 3);
    assertEquals(inventory.availableKeys, 2);

    assertWithinLast5secs(inventory.keysTimestamp!);
    assertWithinLast5secs(inventory.rechargeTimestamp!);
  });

  it('recharge 2 pulls (70 mins ago ts)', async () => {
    await db.inventories().insertOne(
      {
        guildId: 'guild-id',
        userId: 'user-id',
        availablePulls: 1,
        availableKeys: 2,
        rechargeTimestamp: new Date(Date.now() - 70 * 60 * 1000), // 70 minutes ago,
      } as any,
    );

    const inventory = await db.rechargeConsumables('guild-id', 'user-id');

    assertEquals(Object.keys(inventory), [
      '_id',
      'guildId',
      'userId',
      'availablePulls',
      'availableKeys',
      'rechargeTimestamp',
      'user',
      'party',
      'keysTimestamp',
    ]);

    assertEquals(inventory.availablePulls, 3);
    assertEquals(inventory.availableKeys, 2);

    assertWithinLastMins(inventory.rechargeTimestamp!, 10.5);
    assertWithinLast5secs(inventory.keysTimestamp!);
  });

  it('recharge MAX pulls (2.5 hours ago ts)', async () => {
    await db.inventories().insertOne(
      {
        guildId: 'guild-id',
        userId: 'user-id',
        availablePulls: 1,
        availableKeys: 2,
        rechargeTimestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000), // 2.5 hours ago,
      } as any,
    );

    const inventory = await db.rechargeConsumables('guild-id', 'user-id');

    assertEquals(Object.keys(inventory), [
      '_id',
      'guildId',
      'userId',
      'availablePulls',
      'availableKeys',
      'user',
      'party',
      'keysTimestamp',
    ]);

    assertEquals(inventory.availablePulls, MAX_PULLS);
    assertEquals(inventory.availableKeys, 2);

    assertWithinLast5secs(inventory.keysTimestamp!);
  });

  it('recharge 0 tokens (11 hours ago)', async () => {
    const nowStub = stub(Date, 'now', () => 1710629999665);

    try {
      await db.users().insertOne(
        {
          discordId: 'user-id',
          availableTokens: 0,
          dailyTimestamp: new Date(Date.now() - 11 * 60 * 60 * 1000), // 11 hours ago,
        } as any,
      );

      const { user, ...inventory } = await db.rechargeConsumables(
        'guild-id',
        'user-id',
      );

      assertEquals(Object.keys(inventory), [
        '_id',
        'guildId',
        'userId',
        'availableKeys',
        'availablePulls',
        'floorsCleared',
        'party',
      ]);

      assertEquals(Object.keys(user), [
        '_id',
        'discordId',
        'availableTokens',
        'dailyTimestamp',
      ]);

      assertEquals(user.availableTokens, 0);
    } finally {
      nowStub.restore();
    }
  });

  it('recharge 1 tokens (Monday) (12 hours ago)', async () => {
    const dayOfWeekStub = stub(utils, 'getDayOfWeek', () => 'Monday' as const);

    try {
      await db.users().insertOne(
        {
          discordId: 'user-id',
          availableTokens: 1,
          dailyTimestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago,
        } as any,
      );

      const { user, ...inventory } = await db.rechargeConsumables(
        'guild-id',
        'user-id',
      );

      assertEquals(Object.keys(inventory), [
        '_id',
        'guildId',
        'userId',
        'availableKeys',
        'availablePulls',
        'floorsCleared',
        'party',
      ]);

      assertEquals(Object.keys(user), [
        '_id',
        'discordId',
        'availableTokens',
        'dailyTimestamp',
      ]);

      assertEquals(user.availableTokens, 2);

      assertWithinLast5secs(user.dailyTimestamp);
    } finally {
      dayOfWeekStub.restore();
    }
  });

  it('recharge 2 tokens (Sunday) (12 hours ago)', async () => {
    const dayOfWeekStub = stub(utils, 'getDayOfWeek', () => 'Sunday' as const);

    try {
      await db.users().insertOne(
        {
          discordId: 'user-id',
          availableTokens: 1,
          dailyTimestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago,
        } as any,
      );

      const { user, ...inventory } = await db.rechargeConsumables(
        'guild-id',
        'user-id',
      );

      assertEquals(Object.keys(inventory), [
        '_id',
        'guildId',
        'userId',
        'availableKeys',
        'availablePulls',
        'floorsCleared',
        'party',
      ]);

      assertEquals(Object.keys(user), [
        '_id',
        'discordId',
        'availableTokens',
        'dailyTimestamp',
      ]);

      assertEquals(user.availableTokens, 3);

      assertWithinLast5secs(user.dailyTimestamp);
    } finally {
      dayOfWeekStub.restore();
    }
  });

  it('reset steal cooldown (1 day ago)', async () => {
    await db.inventories().insertOne(
      {
        guildId: 'guild-id',
        userId: 'user-id',
        availablePulls: 5,
        availableKeys: 5,
        stealTimestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago,
      } as any,
    );

    const inventory = await db.rechargeConsumables('guild-id', 'user-id');

    assertEquals(Object.keys(inventory), [
      '_id',
      'guildId',
      'userId',
      'availablePulls',
      'availableKeys',
      'stealTimestamp',
      'user',
      'party',
    ]);
  });

  it.only('reset steal cooldown (3 day ago)', async () => {
    await db.inventories().insertOne(
      {
        guildId: 'guild-id',
        userId: 'user-id',
        availablePulls: 5,
        availableKeys: 5,
        stealTimestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 day ago,
      } as any,
    );

    const inventory = await db.rechargeConsumables('guild-id', 'user-id');

    assertEquals(Object.keys(inventory), [
      '_id',
      'guildId',
      'userId',
      'availablePulls',
      'availableKeys',
      'user',
      'party',
    ]);
  });
});
