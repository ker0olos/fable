/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { describe, it, beforeEach, afterEach, expect } from 'vitest';

import db, { Mongo } from '~/db/index.ts';
import config from '~/src/config.ts';

let mongod: MongoMemoryServer;
let client: Mongo;

describe('db.assignCharacter()', () => {
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

  it('1st spot (auto)', async () => {
    const { insertedId: inventoryInsertedId } = await client
      .inventories()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        party: {
          member1Id: undefined,
          member2Id: undefined,
          member3Id: undefined,
          member4Id: undefined,
          member5Id: undefined,
        },
      } as any);

    const { insertedId: characterInsertedId } = await client
      .characters()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        inventoryId: inventoryInsertedId,
        characterId: 'character-id',
      } as any);

    const character = await db.assignCharacter(
      'user-id',
      'guild-id',
      'character-id'
    );

    expect(character).toEqual({
      _id: characterInsertedId,
      userId: 'user-id',
      guildId: 'guild-id',
      inventoryId: inventoryInsertedId,
      characterId: 'character-id',
    } as any);

    const inventory = await client
      .inventories()
      .findOne({ userId: 'user-id', guildId: 'guild-id' });

    expect(inventory).toMatchObject({
      party: {
        member1Id: characterInsertedId,
        member2Id: null,
        member3Id: null,
        member4Id: null,
        member5Id: null,
      },
    });
  });

  it('3rd spot (auto)', async () => {
    const { insertedId: inventoryInsertedId } = await client
      .inventories()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        party: {
          member1Id: 'character-1',
          member2Id: 'character-2',
          member3Id: undefined,
          member4Id: undefined,
          member5Id: undefined,
        },
      } as any);

    const { insertedId: characterInsertedId } = await client
      .characters()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        inventoryId: inventoryInsertedId,
        characterId: 'character-id',
      } as any);

    const character = await db.assignCharacter(
      'user-id',
      'guild-id',
      'character-id'
    );

    expect(character).toEqual({
      _id: characterInsertedId,
      userId: 'user-id',
      guildId: 'guild-id',
      inventoryId: inventoryInsertedId,
      characterId: 'character-id',
    } as any);

    const inventory = await client
      .inventories()
      .findOne({ userId: 'user-id', guildId: 'guild-id' });

    expect(inventory).toMatchObject({
      party: {
        member1Id: 'character-1',
        member2Id: 'character-2',
        member3Id: characterInsertedId,
        member4Id: null,
        member5Id: null,
      },
    });
  });

  it('1st spot (specified spot)', async () => {
    const { insertedId: inventoryInsertedId } = await client
      .inventories()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        party: {
          member1Id: 'character-1',
          member2Id: 'character-2',
          member3Id: undefined,
          member4Id: undefined,
          member5Id: undefined,
        },
      } as any);

    const { insertedId: characterInsertedId } = await client
      .characters()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        inventoryId: inventoryInsertedId,
        characterId: 'character-id',
      } as any);

    const character = await db.assignCharacter(
      'user-id',
      'guild-id',
      'character-id',
      1
    );

    expect(character).toEqual({
      _id: characterInsertedId,
      userId: 'user-id',
      guildId: 'guild-id',
      inventoryId: inventoryInsertedId,
      characterId: 'character-id',
    } as any);

    const inventory = await client
      .inventories()
      .findOne({ userId: 'user-id', guildId: 'guild-id' });

    expect(inventory).toMatchObject({
      party: {
        member1Id: characterInsertedId,
        member2Id: 'character-2',
        member3Id: null,
        member4Id: null,
        member5Id: null,
      },
    });
  });

  it('reassign (specified spot)', async () => {
    const { insertedId: characterInsertedId } = await client
      .characters()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        characterId: 'character-id',
      } as any);

    await client.inventories().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      party: {
        member1Id: undefined,
        member2Id: undefined,
        member3Id: undefined,
        member4Id: undefined,
        member5Id: characterInsertedId,
      },
    } as any);

    const character = await db.assignCharacter(
      'user-id',
      'guild-id',
      'character-id'
    );

    expect(character).toEqual({
      _id: characterInsertedId,
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
    } as any);

    const inventory = await client
      .inventories()
      .findOne({ userId: 'user-id', guildId: 'guild-id' });

    expect(inventory).toMatchObject({
      party: {
        member1Id: characterInsertedId,
        member2Id: null,
        member3Id: null,
        member4Id: null,
        member5Id: null,
      },
    });
  });
});

describe('db.swapCharacters()', () => {
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

  it('1-to-undefined', async () => {
    const inventory = await client.inventories().findOneAndUpdate(
      {},
      {
        $setOnInsert: {
          userId: 'user-id',
          guildId: 'guild-id',
          party: {
            member1Id: 'character-1',
            member2Id: undefined,
            member3Id: undefined,
            member4Id: undefined,
            member5Id: undefined,
          } as any,
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    await db.swapSpots(inventory!, 1, 3);

    const inventoryUpdated = await client
      .inventories()
      .findOne({ userId: 'user-id', guildId: 'guild-id' });

    expect(inventoryUpdated).toMatchObject({
      party: {
        member1Id: null,
        member2Id: null,
        member3Id: 'character-1',
        member4Id: null,
        member5Id: null,
      },
    });
  });

  it('1-to-1', async () => {
    const inventory = await client.inventories().findOneAndUpdate(
      {},
      {
        $setOnInsert: {
          userId: 'user-id',
          guildId: 'guild-id',
          party: {
            member1Id: 'character-1',
            member2Id: 'character-2',
            member3Id: 'character-3',
            member4Id: 'character-4',
            member5Id: 'character-5',
          } as any,
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    await db.swapSpots(inventory!, 1, 3);

    const inventoryUpdated = await client
      .inventories()
      .findOne({ userId: 'user-id', guildId: 'guild-id' });

    expect(inventoryUpdated).toMatchObject({
      party: {
        member1Id: 'character-3',
        member2Id: 'character-2',
        member3Id: 'character-1',
        member4Id: 'character-4',
        member5Id: 'character-5',
      },
    });
  });
});

describe('db.unassignCharacter()', () => {
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
    const { insertedId: inventoryInsertedId } = await client
      .inventories()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        party: {
          member1Id: 'character-1',
          member2Id: 'character-2',
          member3Id: 'character-3',
          member4Id: 'character-4',
          member5Id: 'character-5',
        },
      } as any);

    await db.unassignCharacter('user-id', 'guild-id', 3);

    const inventoryUpdated = await client
      .inventories()
      .findOne({ _id: inventoryInsertedId });

    expect(inventoryUpdated).toMatchObject({
      party: {
        member1Id: 'character-1',
        member2Id: 'character-2',
        member3Id: null,
        member4Id: 'character-4',
        member5Id: 'character-5',
      },
    });
  });
});

describe('db.clearParty()', () => {
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
    const { insertedId: inventoryInsertedId } = await client
      .inventories()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        party: {
          member1Id: 'character-1',
          member2Id: 'character-2',
          member3Id: 'character-3',
          member4Id: 'character-4',
          member5Id: 'character-5',
        },
      } as any);

    await db.clearParty('user-id', 'guild-id');

    const inventoryUpdated = await client
      .inventories()
      .findOne({ _id: inventoryInsertedId });

    expect(inventoryUpdated).toMatchObject({
      party: {
        member1Id: null,
        member2Id: null,
        member3Id: null,
        member4Id: null,
        member5Id: null,
      },
    });
  });
});
