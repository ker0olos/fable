/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any
import { MongoMemoryServer } from 'mongodb-memory-server';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';

import db, { MAX_PULLS, Mongo } from '~/db/index.ts';

import utils from '~/src/utils.ts';
import config from '~/src/config.ts';

let mongod: MongoMemoryServer;
let client: Mongo;

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const assertWithinLast5secs = (ts: Date) => {
  expect(Math.abs(Date.now() - ts.getTime()) <= 5000).toBe(true);
};

const assertWithinLastMins = (ts: Date, mins: number) => {
  expect(Math.abs(Date.now() - ts.getTime()) <= mins * 60 * 1000).toBe(true);
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

    expect(Object.keys(user)).toEqual([
      '_id',
      'discordId',
      'availableTokens',
      'dailyTimestamp',
      'guarantees',
      'likes',
    ]);

    expect(objectIdRegex.test(user._id.toHexString())).toBe(true);

    assertWithinLast5secs(user.dailyTimestamp);

    expect(user).toMatchObject({
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

    expect(user._id).toEqual(insertedId);
    expect(user.discordId).toBe('user-id');
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

    expect(Object.keys(guild)).toEqual([
      '_id',
      'discordId',
      'excluded',
      'options',
      'packIds',
      'packs',
    ]);

    expect(objectIdRegex.test(guild._id.toHexString())).toBe(true);

    expect(guild).toMatchObject({
      excluded: false,
      discordId: 'guild-id',
      options: { dupes: false },
      packIds: ['anilist', 'vtubers'],
    });
  });

  it('get existing guild', async () => {
    const { insertedId } = await client.guilds().insertOne({
      discordId: 'guild-id',
    } as any);

    const guild = await db.getGuild('guild-id');

    expect(guild).toMatchObject({
      _id: insertedId,
      discordId: 'guild-id',
    });
  });

  it('packs population', async () => {
    const { insertedId: insertedPackId } = await client
      .packs()
      .insertOne({ manifest: { id: 'pack-id' } } as any);

    const { insertedId: insertedGuildId } = await client.guilds().insertOne({
      discordId: 'guild-id',
      packIds: ['pack-id'],
    } as any);

    const guild = await db.getGuild('guild-id');

    expect(guild).toMatchObject({
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

    expect(Object.keys(inventory).sort()).toEqual(
      ['_id', 'guildId', 'userId', 'availablePulls', 'party', 'user'].sort()
    );

    expect(objectIdRegex.test(inventory._id.toHexString())).toBe(true);
    expect(objectIdRegex.test(inventory.user._id.toHexString())).toBe(true);

    expect(inventory).toMatchObject({
      guildId: 'guild-id',
      userId: 'user-id',
      availablePulls: 10,
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

    expect(inventory).toMatchObject({
      _id: insertedId,
      guildId: 'guild-id',
      userId: 'user-id',
      user: {
        _id: userInsertedId,
      },
    } as any);
  });

  it('party population', async () => {
    const { insertedIds } = await client
      .characters()
      .bulkWrite([
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

    expect(inventory).toMatchObject({
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
    vi.resetAllMocks();
    delete config.mongoUri;
    await client.close();
    await mongod.stop();
  });

  it('normal', async () => {
    const inventory = await db.rechargeConsumables('guild-id', 'user-id');

    expect(Object.keys(inventory).sort().sort()).toEqual(
      ['_id', 'userId', 'guildId', 'availablePulls', 'party', 'user'].sort()
    );

    expect(inventory).toMatchObject({
      availablePulls: 10,
    });
  });

  it('recharge 2 pulls (60 mins ago ts)', async () => {
    await client.inventories().insertOne({
      guildId: 'guild-id',
      userId: 'user-id',
      availablePulls: 1,
      rechargeTimestamp: new Date(Date.now() - 60 * 60 * 1000), // 60 minutes ago,
    } as any);

    const inventory = await db.rechargeConsumables('guild-id', 'user-id');

    expect(Object.keys(inventory).sort()).toEqual(
      [
        '_id',
        'guildId',
        'userId',
        'availablePulls',
        'rechargeTimestamp',
        'user',
        'party',
      ].sort()
    );

    expect(inventory.availablePulls).toBe(3);

    assertWithinLast5secs(inventory.rechargeTimestamp!);
  });

  it('recharge 2 pulls (70 mins ago ts)', async () => {
    await client.inventories().insertOne({
      guildId: 'guild-id',
      userId: 'user-id',
      availablePulls: 1,
      rechargeTimestamp: new Date(Date.now() - 70 * 60 * 1000), // 70 minutes ago,
    } as any);

    const inventory = await db.rechargeConsumables('guild-id', 'user-id');

    expect(Object.keys(inventory).sort()).toEqual(
      [
        '_id',
        'guildId',
        'userId',
        'availablePulls',
        'rechargeTimestamp',
        'user',
        'party',
      ].sort()
    );

    expect(inventory.availablePulls).toBe(3);

    assertWithinLastMins(inventory.rechargeTimestamp!, 10.5);
  });

  it('recharge MAX pulls (2.5 hours ago ts)', async () => {
    await client.inventories().insertOne({
      guildId: 'guild-id',
      userId: 'user-id',
      availablePulls: 1,
      rechargeTimestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000), // 2.5 hours ago,
    } as any);

    const inventory = await db.rechargeConsumables('guild-id', 'user-id');

    expect(Object.keys(inventory).sort()).toEqual(
      ['_id', 'guildId', 'userId', 'availablePulls', 'user', 'party'].sort()
    );

    expect(inventory.availablePulls).toBe(MAX_PULLS);
  });

  it('recharge 0 tokens (11 hours ago)', async () => {
    await client.users().insertOne({
      discordId: 'user-id',
      availableTokens: 0,
      dailyTimestamp: new Date(Date.now() - 11 * 60 * 60 * 1000), // 11 hours ago,
    } as any);

    const { user, ...inventory } = await db.rechargeConsumables(
      'guild-id',
      'user-id'
    );

    expect(Object.keys(inventory).sort().sort()).toEqual(
      ['_id', 'guildId', 'userId', 'availablePulls', 'party'].sort()
    );

    expect(Object.keys(user)).toEqual([
      '_id',
      'discordId',
      'availableTokens',
      'dailyTimestamp',
    ]);

    expect(user.availableTokens).toBe(0);
  });

  it('recharge 1 tokens (Monday) (12 hours ago)', async () => {
    vi.spyOn(utils, 'getDayOfWeek').mockReturnValue('Monday');

    await client.users().insertOne({
      discordId: 'user-id',
      availableTokens: 1,
      dailyTimestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago,
    } as any);

    const { user, ...inventory } = await db.rechargeConsumables(
      'guild-id',
      'user-id'
    );

    expect(Object.keys(inventory).sort().sort()).toEqual(
      ['_id', 'userId', 'guildId', 'availablePulls', 'party'].sort()
    );

    expect(Object.keys(user)).toEqual([
      '_id',
      'discordId',
      'availableTokens',
      'dailyTimestamp',
    ]);

    expect(user.availableTokens).toBe(2);

    assertWithinLast5secs(user.dailyTimestamp);
  });

  it('recharge 2 tokens (Sunday) (12 hours ago)', async () => {
    vi.spyOn(utils, 'getDayOfWeek').mockReturnValue('Sunday');

    await client.users().insertOne({
      discordId: 'user-id',
      availableTokens: 1,
      dailyTimestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago,
    } as any);

    const { user, ...inventory } = await db.rechargeConsumables(
      'guild-id',
      'user-id'
    );

    expect(Object.keys(inventory).sort()).toEqual(
      ['_id', 'userId', 'guildId', 'availablePulls', 'party'].sort()
    );

    expect(Object.keys(user)).toEqual([
      '_id',
      'discordId',
      'availableTokens',
      'dailyTimestamp',
    ]);

    expect(user.availableTokens).toBe(3);

    assertWithinLast5secs(user.dailyTimestamp);
  });

  it('reset steal cooldown (1 day ago)', async () => {
    await client.inventories().insertOne({
      guildId: 'guild-id',
      userId: 'user-id',
      availablePulls: 5,
      stealTimestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago,
    } as any);

    const inventory = await db.rechargeConsumables('guild-id', 'user-id');

    expect(Object.keys(inventory).sort()).toEqual(
      [
        '_id',
        'guildId',
        'userId',
        'availablePulls',
        'stealTimestamp',
        'user',
        'party',
      ].sort()
    );
  });

  it('reset steal cooldown (3 day ago)', async () => {
    await client.inventories().insertOne({
      guildId: 'guild-id',
      userId: 'user-id',
      availablePulls: 5,
      stealTimestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 day ago,
    } as any);

    const inventory = await db.rechargeConsumables('guild-id', 'user-id');

    expect(Object.keys(inventory).sort()).toEqual(
      ['_id', 'guildId', 'userId', 'availablePulls', 'user', 'party'].sort()
    );
  });

  it('recharge with custom maxPulls (10) should respect server limit', async () => {
    await client.guilds().insertOne({
      discordId: 'guild-id',
      options: { maxPulls: 10, rechargeMins: 30 },
    } as any);

    await client.inventories().insertOne({
      guildId: 'guild-id',
      userId: 'user-id',
      availablePulls: 5,
      rechargeTimestamp: new Date(Date.now() - 5 * 30 * 60 * 1000), // 2.5 hours ago (5 recharges)
    } as any);

    const inventory = await db.rechargeConsumables('guild-id', 'user-id');

    expect(Object.keys(inventory).sort()).toEqual(
      ['_id', 'guildId', 'userId', 'availablePulls', 'user', 'party'].sort()
    );

    expect(inventory.availablePulls).toBe(10);

    expect(inventory.rechargeTimestamp).toBeUndefined();
  });

  it('recharge with custom maxPulls (10) should keep timestamp when not at max', async () => {
    await client.guilds().insertOne({
      discordId: 'guild-id',
      options: { maxPulls: 10, rechargeMins: 30 },
    } as any);

    await client.inventories().insertOne({
      guildId: 'guild-id',
      userId: 'user-id',
      availablePulls: 5,
      rechargeTimestamp: new Date(Date.now() - 2 * 30 * 60 * 1000), // 1 hour ago (2 recharges)
    } as any);

    const inventory = await db.rechargeConsumables('guild-id', 'user-id');

    expect(Object.keys(inventory).sort()).toEqual(
      [
        '_id',
        'guildId',
        'userId',
        'availablePulls',
        'rechargeTimestamp',
        'user',
        'party',
      ].sort()
    );

    // Should have 7 pulls now (5 + 2)
    expect(inventory.availablePulls).toBe(7);

    // rechargeTimestamp should still exist since not at max (10)
    expect(inventory.rechargeTimestamp).toBeDefined();
    assertWithinLastMins(inventory.rechargeTimestamp!, 1);
  });

  it('recharge with custom maxPulls (3) lower than default should cap at 3', async () => {
    await client.guilds().insertOne({
      discordId: 'guild-id',
      options: { maxPulls: 3, rechargeMins: 30 },
    } as any);

    await client.inventories().insertOne({
      guildId: 'guild-id',
      userId: 'user-id',
      availablePulls: 1,
      rechargeTimestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago (10 recharges worth)
    } as any);

    const inventory = await db.rechargeConsumables('guild-id', 'user-id');

    // rechargeTimestamp should not be present when at max pulls
    expect(Object.keys(inventory).sort()).toEqual(
      ['_id', 'guildId', 'userId', 'availablePulls', 'user', 'party'].sort()
    );

    // Should cap at server's max (3), not default MAX_PULLS (5) or higher
    expect(inventory.availablePulls).toBe(3);

    // rechargeTimestamp should be undefined when at max
    expect(inventory.rechargeTimestamp).toBeUndefined();
  });

  it('recharge with custom maxPulls (3) and custom rechargeMins (120)', async () => {
    await client.guilds().insertOne({
      discordId: 'guild-id',
      options: { maxPulls: 3, rechargeMins: 120 },
    } as any);

    await client.inventories().insertOne({
      guildId: 'guild-id',
      userId: 'user-id',
      availablePulls: 1,
      rechargeTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (120 minutes)
    } as any);

    const inventory = await db.rechargeConsumables('guild-id', 'user-id');

    // With 120 min recharge: 120 mins / 120 = 1 recharge
    // 1 (starting) + 1 (recharged) = 2 (not at max yet)
    expect(Object.keys(inventory).sort()).toEqual(
      [
        '_id',
        'guildId',
        'userId',
        'availablePulls',
        'rechargeTimestamp',
        'user',
        'party',
      ].sort()
    );

    // Should be 2 pulls (1 + 1 recharge), not at max (3) yet
    expect(inventory.availablePulls).toBe(2);

    // rechargeTimestamp should still be present since not at max
    expect(inventory.rechargeTimestamp).toBeDefined();
    assertWithinLastMins(inventory.rechargeTimestamp!, 1);
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
      likes: [{ characterId: 'character-id' }, { characterId: 'character-2' }],
    } as any);

    await client.inventories().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      lastPull: new Date(),
    } as any);

    await client.users().insertOne({
      discordId: 'user-2',
      likes: [{ characterId: 'character-id' }, { characterId: 'character-2' }],
    } as any);

    await client.inventories().insertOne({
      userId: 'user-2',
      guildId: 'guild-id',
      lastPull: new Date(),
    } as any);

    const users = await db.getActiveUsersIfLiked('guild-id', 'character-id', [
      'media-id',
    ]);

    expect(users).toEqual(['user-id', 'user-2']);
  });

  it('2 users like media', async () => {
    await client.users().insertOne({
      discordId: 'user-id',
      likes: [{ mediaId: 'media-id' }, { mediaId: 'media-2' }],
    } as any);

    await client.inventories().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      lastPull: new Date(),
    } as any);

    await client.users().insertOne({
      discordId: 'user-2',
      likes: [{ mediaId: 'media-id' }, { mediaId: 'media-2' }],
    } as any);

    await client.inventories().insertOne({
      userId: 'user-2',
      guildId: 'guild-id',
      lastPull: new Date(),
    } as any);

    const users = await db.getActiveUsersIfLiked('guild-id', 'character-id', [
      'media-id',
    ]);

    expect(users).toEqual(['user-id', 'user-2']);
  });

  it('1 active user likes character', async () => {
    await client.users().insertOne({
      discordId: 'user-id',
      likes: [{ characterId: 'character-id' }],
    } as any);

    await client.inventories().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      lastPull: new Date('1999-1-1'),
    } as any);

    await client.users().insertOne({
      discordId: 'user-2',
      likes: [{ characterId: 'character-id' }],
    } as any);

    await client.inventories().insertOne({
      userId: 'user-2',
      guildId: 'guild-id',
      lastPull: new Date(),
    } as any);

    const users = await db.getActiveUsersIfLiked('guild-id', 'character-id', [
      'media-id',
    ]);

    expect(users).toEqual(['user-2']);
  });

  it('no users like character', async () => {
    await client.users().insertOne({
      discordId: 'user-id',
      likes: [{ characterId: 'character-2' }],
    } as any);

    await client.users().insertOne({
      discordId: 'user-2',
      likes: [{ mediaId: 'media-2' }],
    } as any);

    await client.inventories().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      lastPull: new Date(),
    } as any);

    const users = await db.getActiveUsersIfLiked('guild-id', 'character-id', [
      'media-id',
    ]);

    expect(users).toEqual([]);
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

    const characters = await db.getUserCharacters('user-id', 'guild-id');

    expect(characters.length).toBe(2);

    expect(characters[0]).toMatchObject({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-1',
    });

    expect(characters[1]).toMatchObject({
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

    const characters = await db.getUserCharacters('user-id', 'guild-id');

    expect(characters.length).toBe(2);

    expect(characters[0]).toMatchObject({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-2',
    });

    expect(characters[1]).toMatchObject({
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

    const characters = await db.getUserCharacters('user-id', 'guild-id');

    expect(characters.length).toBe(2);

    expect(characters[0]).toMatchObject({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-1',
    });

    expect(characters[1]).toMatchObject({
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

    const characters = await db.getUserCharacters('user-id', 'guild-id');

    expect(characters.length).toBe(0);
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
    const { insertedId: inventoryInsertedId } = await client
      .inventories()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
      } as any);

    await client.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      inventoryId: inventoryInsertedId,
      characterId: 'character-1',
      mediaId: 'media-id',
    } as any);

    await client.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      inventoryId: inventoryInsertedId,
      characterId: 'character-2',
      mediaId: 'media-id',
    } as any);

    await client.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      inventoryId: inventoryInsertedId,
      characterId: 'character-3',
      mediaId: 'another-media-id',
    } as any);

    const characters = await db.getMediaCharacters('guild-id', ['media-id']);

    expect(characters.length).toBe(2);

    expect(characters[0]).toMatchObject({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-1',
      mediaId: 'media-id',
    });

    expect(characters[1]).toMatchObject({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-2',
      mediaId: 'media-id',
    });
  });

  it('2 character - 2 media (exists)', async () => {
    const { insertedId: inventoryInsertedId } = await client
      .inventories()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
      } as any);

    await client.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      inventoryId: inventoryInsertedId,
      characterId: 'character-1',
      mediaId: 'media-id',
    } as any);

    await client.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      inventoryId: inventoryInsertedId,
      characterId: 'character-2',
      mediaId: 'media-id',
    } as any);

    await client.characters().insertOne({
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

    expect(characters.length).toBe(3);

    expect(characters[0]).toMatchObject({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-1',
      mediaId: 'media-id',
    });

    expect(characters[1]).toMatchObject({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-2',
      mediaId: 'media-id',
    });

    expect(characters[2]).toMatchObject({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-3',
      mediaId: 'another-media-id',
    });
  });

  it('2 media (nothing found)', async () => {
    const characters = await db.getMediaCharacters('guild-id', [
      'media-id',
      'another-media-id',
    ]);

    expect(characters.length).toBe(0);
  });
});
