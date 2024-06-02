// deno-lint-ignore-file no-explicit-any no-non-null-assertion

import { MongoMemoryServer } from 'mongodb-memory-server';

import { stub } from '$std/testing/mock.ts';
import { afterEach, beforeEach, describe, it } from '$std/testing/bdd.ts';
import { assertEquals, assertObjectMatch } from '$std/assert/mod.ts';

import db, { MAX_KEYS, MAX_PULLS, Mongo } from '~/db/mod.ts';

import utils from '~/src/utils.ts';
import config from '~/src/config.ts';

let mongod: MongoMemoryServer;
let client: Mongo;

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const assertWithinLast5secs = (ts: Date) => {
  assertEquals(Math.abs(Date.now() - ts.getTime()) <= 5000, true);
};

const assertWithinLastMins = (ts: Date, mins: number) => {
  assertEquals(Math.abs(Date.now() - ts.getTime()) <= mins * 60 * 1000, true);
};

describe('db.getUser()', () => {
  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    client = new Mongo(mongod.getUri());
    config.mongoUri = mongod.getUri();
  });

  afterEach(async () => {
    delete config.mongoUri;
    await client.close();
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
    const { insertedId } = await client.users().insertOne({
      discordId: 'user-id',
    } as any);

    const user = await db.getUser('user-id');

    assertEquals(user._id, insertedId);
    assertEquals(user.discordId, 'user-id');
  });
});

describe('db.getGuild()', () => {
  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    client = new Mongo(mongod.getUri());
    config.mongoUri = mongod.getUri();
  });

  afterEach(async () => {
    delete config.mongoUri;
    await client.close();
    await mongod.stop();
  });

  it('create new guild', async () => {
    const guild = await db.getGuild('guild-id');

    assertEquals(Object.keys(guild), [
      '_id',
      'discordId',
      'excluded',
      'packIds',
      'packs',
    ]);

    assertEquals(objectIdRegex.test(guild._id.toHexString()), true);

    assertObjectMatch(guild, {
      excluded: false,
      discordId: 'guild-id',
      packIds: ['vtubers', 'anilist'],
    });
  });

  it('get existing guild', async () => {
    const { insertedId } = await client.guilds().insertOne({
      discordId: 'guild-id',
    } as any);

    const guild = await db.getGuild('guild-id');

    assertObjectMatch(guild, {
      _id: insertedId,
      discordId: 'guild-id',
    });
  });

  it('packs population', async () => {
    const { insertedId: insertedPackId } = await client.packs().insertOne(
      { manifest: { id: 'pack-id' } } as any,
    );

    const { insertedId: insertedGuildId } = await client.guilds().insertOne({
      discordId: 'guild-id',
      packIds: ['pack-id'],
    } as any);

    const guild = await db.getGuild('guild-id');

    assertObjectMatch(guild, {
      _id: insertedGuildId,
      discordId: 'guild-id',
      packIds: ['pack-id'],
      packs: [{ _id: insertedPackId, manifest: { id: 'pack-id' } }],
    });
  });
});

describe('db.getInventory()', () => {
  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    client = new Mongo(mongod.getUri());
    config.mongoUri = mongod.getUri();
  });

  afterEach(async () => {
    delete config.mongoUri;
    await client.close();
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
    const { insertedId: userInsertedId } = await client.users().insertOne({
      discordId: 'user-id',
    } as any);

    const { insertedId } = await client.inventories().insertOne({
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
    const { insertedIds } = await client.characters().bulkWrite([
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

    const { insertedId } = await client.inventories().insertOne({
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
    mongod = await MongoMemoryServer.create();
    client = new Mongo(mongod.getUri());
    config.mongoUri = mongod.getUri();
  });

  afterEach(async () => {
    delete config.mongoUri;
    await client.close();
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
    await client.inventories().insertOne(
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
    await client.inventories().insertOne(
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
    await client.inventories().insertOne(
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
    await client.inventories().insertOne(
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
    await client.inventories().insertOne(
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
    await client.inventories().insertOne(
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
    await client.users().insertOne(
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
  });

  it('recharge 1 tokens (Monday) (12 hours ago)', async () => {
    const dayOfWeekStub = stub(utils, 'getDayOfWeek', () => 'Monday' as const);

    try {
      await client.users().insertOne(
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
      await client.users().insertOne(
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
    await client.inventories().insertOne(
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

  it('reset steal cooldown (3 day ago)', async () => {
    await client.inventories().insertOne(
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

describe('db.getActiveUsersIfLiked()', () => {
  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    client = new Mongo(mongod.getUri());
    config.mongoUri = mongod.getUri();
  });

  afterEach(async () => {
    delete config.mongoUri;
    await client.close();
    await mongod.stop();
  });

  it('2 users like character', async () => {
    await client.users().insertOne({
      discordId: 'user-id',
      likes: [
        { characterId: 'character-id' },
        { characterId: 'character-2' },
      ],
    } as any);

    await client.inventories()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        lastPull: new Date(),
      } as any);

    await client.users().insertOne({
      discordId: 'user-2',
      likes: [
        { characterId: 'character-id' },
        { characterId: 'character-2' },
      ],
    } as any);

    await client.inventories()
      .insertOne({
        userId: 'user-2',
        guildId: 'guild-id',
        lastPull: new Date(),
      } as any);

    const users = await db.getActiveUsersIfLiked(
      'guild-id',
      'character-id',
      ['media-id'],
    );

    assertEquals(users, ['user-id', 'user-2']);
  });

  it('2 users like media', async () => {
    await client.users().insertOne({
      discordId: 'user-id',
      likes: [
        { mediaId: 'media-id' },
        { mediaId: 'media-2' },
      ],
    } as any);

    await client.inventories()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        lastPull: new Date(),
      } as any);

    await client.users().insertOne({
      discordId: 'user-2',
      likes: [
        { mediaId: 'media-id' },
        { mediaId: 'media-2' },
      ],
    } as any);

    await client.inventories()
      .insertOne({
        userId: 'user-2',
        guildId: 'guild-id',
        lastPull: new Date(),
      } as any);

    const users = await db.getActiveUsersIfLiked(
      'guild-id',
      'character-id',
      ['media-id'],
    );

    assertEquals(users, ['user-id', 'user-2']);
  });

  it('1 active user likes character', async () => {
    await client.users().insertOne({
      discordId: 'user-id',
      likes: [
        { characterId: 'character-id' },
      ],
    } as any);

    await client.inventories()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        lastPull: new Date('1999-1-1'),
      } as any);

    await client.users().insertOne({
      discordId: 'user-2',
      likes: [
        { characterId: 'character-id' },
      ],
    } as any);

    await client.inventories()
      .insertOne({
        userId: 'user-2',
        guildId: 'guild-id',
        lastPull: new Date(),
      } as any);

    const users = await db.getActiveUsersIfLiked(
      'guild-id',
      'character-id',
      ['media-id'],
    );

    assertEquals(users, ['user-2']);
  });

  it('no users like character', async () => {
    await client.users().insertOne({
      discordId: 'user-id',
      likes: [
        { characterId: 'character-2' },
      ],
    } as any);

    await client.users().insertOne({
      discordId: 'user-2',
      likes: [
        { mediaId: 'media-2' },
      ],
    } as any);

    await client.inventories()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        lastPull: new Date(),
      } as any);

    const users = await db.getActiveUsersIfLiked(
      'guild-id',
      'character-id',
      ['media-id'],
    );

    assertEquals(users, []);
  });
});

describe('db.getUserCharacters()', () => {
  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    client = new Mongo(mongod.getUri());
    config.mongoUri = mongod.getUri();
  });

  afterEach(async () => {
    delete config.mongoUri;
    await client.close();
    await mongod.stop();
  });

  it('normal', async () => {
    await client.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-1',
    } as any);

    await client.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-2',
    } as any);

    await client.characters().insertOne({
      userId: 'user-id',
      guildId: 'another-guild-id',
      characterId: 'character-1',
    } as any);

    await client.characters().insertOne({
      userId: 'another-user-id',
      guildId: 'guild-id',
      characterId: 'character-3',
    } as any);

    const characters = await db.getUserCharacters(
      'user-id',
      'guild-id',
    );

    assertEquals(characters.length, 2);

    assertObjectMatch(characters[0], {
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-1',
    });

    assertObjectMatch(characters[1], {
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-2',
    });
  });

  it('sorting 1', async () => {
    await client.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-1',
      createdAt: new Date('1999-1-1'),
    } as any);

    await client.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-2',
    } as any);

    const characters = await db.getUserCharacters(
      'user-id',
      'guild-id',
    );

    assertEquals(characters.length, 2);

    assertObjectMatch(characters[0], {
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-2',
    });

    assertObjectMatch(characters[1], {
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-1',
    });
  });

  it('sorting 2', async () => {
    await client.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-1',
    } as any);

    await client.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-2',
      createdAt: new Date('1999-1-1'),
    } as any);

    const characters = await db.getUserCharacters(
      'user-id',
      'guild-id',
    );

    assertEquals(characters.length, 2);

    assertObjectMatch(characters[0], {
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-1',
    });

    assertObjectMatch(characters[1], {
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-2',
    });
  });

  it('none', async () => {
    await client.characters().insertOne({
      userId: 'user-id',
      guildId: 'another-guild-id',
      characterId: 'character-1',
    } as any);

    await client.characters().insertOne({
      userId: 'another-user-id',
      guildId: 'guild-id',
      characterId: 'character-2',
    } as any);

    const characters = await db.getUserCharacters(
      'user-id',
      'guild-id',
    );

    assertEquals(characters.length, 0);
  });
});

describe('db.getMediaCharacters()', () => {
  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    client = new Mongo(mongod.getUri());
    config.mongoUri = mongod.getUri();
  });

  afterEach(async () => {
    delete config.mongoUri;
    await client.close();
    await mongod.stop();
  });

  it('2 character - 1 media (exists)', async () => {
    const { insertedId: inventoryInsertedId } = await client.inventories()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
      } as any);

    const { insertedId: character1InsertedId } = await client.characters()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        inventoryId: inventoryInsertedId,
        characterId: 'character-1',
        mediaId: 'media-id',
      } as any);

    const { insertedId: character2InsertedId } = await client.characters()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        inventoryId: inventoryInsertedId,
        characterId: 'character-2',
        mediaId: 'media-id',
      } as any);

    const { insertedId: _character3InsertedId } = await client.characters()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        inventoryId: inventoryInsertedId,
        characterId: 'character-3',
        mediaId: 'another-media-id',
      } as any);

    const characters = await db.getMediaCharacters('guild-id', [
      'media-id',
    ]);

    assertEquals(characters.length, 2);

    assertEquals(characters[0]!, {
      _id: character1InsertedId,
      userId: 'user-id',
      guildId: 'guild-id',
      inventoryId: inventoryInsertedId,
      characterId: 'character-1',
      mediaId: 'media-id',
    } as any);

    assertEquals(characters[1]!, {
      _id: character2InsertedId,
      userId: 'user-id',
      guildId: 'guild-id',
      inventoryId: inventoryInsertedId,
      characterId: 'character-2',
      mediaId: 'media-id',
    } as any);
  });

  it('2 character - 2 media (exists)', async () => {
    const { insertedId: inventoryInsertedId } = await client.inventories()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
      } as any);

    const { insertedId: character1InsertedId } = await client.characters()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        inventoryId: inventoryInsertedId,
        characterId: 'character-1',
        mediaId: 'media-id',
      } as any);

    const { insertedId: character2InsertedId } = await client.characters()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        inventoryId: inventoryInsertedId,
        characterId: 'character-2',
        mediaId: 'media-id',
      } as any);

    const { insertedId: character3InsertedId } = await client.characters()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        inventoryId: inventoryInsertedId,
        characterId: 'character-3',
        mediaId: 'another-media-id',
      } as any);

    const characters = await db.getMediaCharacters('guild-id', [
      'media-id',
      'another-media-id',
    ]);

    assertEquals(characters.length, 3);

    assertEquals(characters[0]!, {
      _id: character1InsertedId,
      userId: 'user-id',
      guildId: 'guild-id',
      inventoryId: inventoryInsertedId,
      characterId: 'character-1',
      mediaId: 'media-id',
    } as any);

    assertEquals(characters[1]!, {
      _id: character2InsertedId,
      userId: 'user-id',
      guildId: 'guild-id',
      inventoryId: inventoryInsertedId,
      characterId: 'character-2',
      mediaId: 'media-id',
    } as any);

    assertEquals(characters[2]!, {
      _id: character3InsertedId,
      userId: 'user-id',
      guildId: 'guild-id',
      inventoryId: inventoryInsertedId,
      characterId: 'character-3',
      mediaId: 'another-media-id',
    } as any);
  });

  it('2 media (nothing found)', async () => {
    const characters = await db.getMediaCharacters('guild-id', [
      'media-id',
      'another-media-id',
    ]);

    assertEquals(characters.length, 0);
  });
});
