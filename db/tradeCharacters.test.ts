// deno-lint-ignore-file no-explicit-any no-non-null-assertion

import { ObjectId } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

import { afterEach, beforeEach, describe, it } from '$std/testing/bdd.ts';
import {
  assertEquals,
  assertNotEquals,
  assertObjectMatch,
  assertRejects,
} from '$std/assert/mod.ts';

import db, { Mongo } from '~/db/mod.ts';

import config from '~/src/config.ts';

let mongod: MongoMemoryReplSet;
let client: Mongo;

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const assertWithinLast5secs = (ts: Date) => {
  assertEquals(Math.abs(Date.now() - ts.getTime()) <= 5000, true);
};

describe('db.giveCharacters()', () => {
  beforeEach(async () => {
    mongod = await MongoMemoryReplSet.create();
    client = new Mongo(mongod.getUri());
    config.mongoUri = mongod.getUri();
  });

  afterEach(async () => {
    delete config.mongoUri;
    await client.close();
    await mongod.stop();
  });

  it('give 1 character to new user', async () => {
    const { insertedIds: inventoryId } = await client.inventories().insertMany([
      {
        userId: 'user-1',
        guildId: 'guild-id',
        party: {},
      },
    ] as any);

    await client.characters().insertMany([
      {
        characterId: 'character-id',
        inventoryId: inventoryId[0],
        userId: 'user-1',
        guildId: 'guild-id',
      },
    ] as any);

    await db.giveCharacters({
      aUserId: 'user-1',
      bUserId: 'user-2',
      guildId: 'guild-id',
      giveIds: ['character-id'],
    });

    const character = await client.characters().findOne({
      characterId: 'character-id',
    });

    assertEquals(objectIdRegex.test(inventoryId[0].toHexString()), true);
    assertEquals(objectIdRegex.test(character!._id.toHexString()), true);

    assertEquals(
      objectIdRegex.test(character!.inventoryId.toHexString()),
      true,
    );

    assertNotEquals(character!.inventoryId, inventoryId[0]);

    assertObjectMatch(character!, {
      userId: 'user-2',
      guildId: 'guild-id',
      characterId: 'character-id',
    });
  });

  it('give 1 character to existing user', async () => {
    const { insertedIds: inventoryId } = await client.inventories().insertMany([
      {
        userId: 'user-1',
        guildId: 'guild-id',
        party: {},
      },
      {
        userId: 'user-2',
        guildId: 'guild-id',
        party: {},
      },
    ] as any);

    await client.characters().insertMany([
      {
        userId: 'user-1',
        guildId: 'guild-id',
        inventoryId: inventoryId[0],
        characterId: 'character-id',
      },
    ] as any);

    await db.giveCharacters({
      aUserId: 'user-1',
      bUserId: 'user-2',
      guildId: 'guild-id',
      giveIds: ['character-id'],
    });

    const character = await client.characters().findOne({
      characterId: 'character-id',
    });

    assertEquals(objectIdRegex.test(character!._id.toHexString()), true);

    assertObjectMatch(character!, {
      userId: 'user-2',
      guildId: 'guild-id',
      inventoryId: inventoryId[1],
      characterId: 'character-id',
    });
  });

  it('character not found', async () => {
    await client.inventories().insertMany([
      {
        userId: 'user-1',
        guildId: 'guild-id',
        party: {},
      },
    ] as any);

    await assertRejects(
      () =>
        db.giveCharacters({
          aUserId: 'user-1',
          bUserId: 'user-2',
          guildId: 'guild-id',
          giveIds: ['character-id'],
        }),
      Error,
      'NOT_OWNED',
    );
  });

  it('character not owned', async () => {
    const { insertedIds: inventoryId } = await client.inventories().insertMany([
      {
        userId: 'user-1',
        guildId: 'guild-id',
        party: {},
      },
      {
        userId: 'user-2',
        guildId: 'guild-id',
        party: {},
      },
    ] as any);

    await client.characters().insertMany([
      {
        userId: 'user-2',
        guildId: 'guild-id',
        inventoryId: inventoryId[1],
        characterId: 'character-id',
      },
    ] as any);

    await assertRejects(
      () =>
        db.giveCharacters({
          aUserId: 'user-1',
          bUserId: 'user-2',
          guildId: 'guild-id',
          giveIds: ['character-id'],
        }),
      Error,
      'NOT_OWNED',
    );
  });

  it('give party characters', async () => {
    const characterInsertedId = new ObjectId();

    const { insertedIds: inventoryId } = await client.inventories().insertMany([
      {
        userId: 'user-1',
        guildId: 'guild-id',
        party: {
          member1Id: characterInsertedId,
        },
      },
    ] as any);

    await client.characters().insertMany([
      {
        _id: characterInsertedId,
        characterId: 'character-id',
        inventoryId: inventoryId[0],
        userId: 'user-1',
        guildId: 'guild-id',
      },
    ] as any);

    await assertRejects(
      () =>
        db.giveCharacters({
          aUserId: 'user-1',
          bUserId: 'user-2',
          guildId: 'guild-id',
          giveIds: ['character-id'],
        }),
      Error,
      'CHARACTER_IN_PARTY',
    );
  });
});

describe('db.tradeCharacters()', () => {
  beforeEach(async () => {
    mongod = await MongoMemoryReplSet.create();
    client = new Mongo(mongod.getUri());
    config.mongoUri = mongod.getUri();
  });

  afterEach(async () => {
    delete config.mongoUri;
    await client.close();
    await mongod.stop();
  });

  it('give 1 character take 1 character', async () => {
    const { insertedIds: inventoryId } = await client.inventories().insertMany([
      {
        userId: 'user-1',
        guildId: 'guild-id',
        party: {},
      },
      {
        userId: 'user-2',
        guildId: 'guild-id',
        party: {},
      },
    ] as any);

    await client.characters().insertMany([
      {
        userId: 'user-1',
        guildId: 'guild-id',
        inventoryId: inventoryId[0],
        characterId: 'character-1',
      },
      {
        userId: 'user-2',
        guildId: 'guild-id',
        inventoryId: inventoryId[1],
        characterId: 'character-2',
      },
    ] as any);

    await db.tradeCharacters({
      aUserId: 'user-1',
      bUserId: 'user-2',
      guildId: 'guild-id',
      giveIds: ['character-1'],
      takeIds: ['character-2'],
    });

    const [character1, character2] = await client.characters().find({
      characterId: { $in: ['character-1', 'character-2'] },
    }).toArray();

    assertEquals(objectIdRegex.test(character1!._id.toHexString()), true);
    assertEquals(objectIdRegex.test(character2!._id.toHexString()), true);

    assertObjectMatch(character1!, {
      userId: 'user-2',
      guildId: 'guild-id',
      inventoryId: inventoryId[1],
      characterId: 'character-1',
    });

    assertObjectMatch(character2!, {
      userId: 'user-1',
      guildId: 'guild-id',
      inventoryId: inventoryId[0],
      characterId: 'character-2',
    });
  });

  it('give character not found', async () => {
    const { insertedIds: inventoryId } = await client.inventories().insertMany([
      {
        userId: 'user-1',
        guildId: 'guild-id',
        party: {},
      },
      {
        userId: 'user-2',
        guildId: 'guild-id',
        party: {},
      },
    ] as any);

    await client.characters().insertMany([
      // {
      //   userId: 'user-1',
      //   guildId: 'guild-id',
      //   inventoryId: inventoryId[0],
      //   characterId: 'character-1',
      // },
      {
        userId: 'user-2',
        guildId: 'guild-id',
        inventoryId: inventoryId[1],
        characterId: 'character-2',
      },
    ] as any);

    await assertRejects(
      () =>
        db.tradeCharacters({
          aUserId: 'user-1',
          bUserId: 'user-2',
          guildId: 'guild-id',
          giveIds: ['character-1'],
          takeIds: ['character-2'],
        }),
      Error,
      'NOT_OWNED',
    );
  });

  it('take character not found', async () => {
    const { insertedIds: inventoryId } = await client.inventories().insertMany([
      {
        userId: 'user-1',
        guildId: 'guild-id',
        party: {},
      },
      {
        userId: 'user-2',
        guildId: 'guild-id',
        party: {},
      },
    ] as any);

    await client.characters().insertMany([
      {
        userId: 'user-1',
        guildId: 'guild-id',
        inventoryId: inventoryId[0],
        characterId: 'character-1',
      },
      // {
      //   userId: 'user-2',
      //   guildId: 'guild-id',
      //   inventoryId: inventoryId[1],
      //   characterId: 'character-2',
      // },
    ] as any);

    await assertRejects(
      () =>
        db.tradeCharacters({
          aUserId: 'user-1',
          bUserId: 'user-2',
          guildId: 'guild-id',
          giveIds: ['character-1'],
          takeIds: ['character-2'],
        }),
      Error,
      'NOT_OWNED',
    );
  });

  it('give character not owned', async () => {
    const { insertedIds: inventoryId } = await client.inventories().insertMany([
      {
        userId: 'user-1',
        guildId: 'guild-id',
        party: {},
      },
      {
        userId: 'user-2',
        guildId: 'guild-id',
        party: {},
      },
    ] as any);

    await client.characters().insertMany([
      {
        userId: 'user-2',
        guildId: 'guild-id',
        inventoryId: inventoryId[0],
        characterId: 'character-1',
      },
      {
        userId: 'user-2',
        guildId: 'guild-id',
        inventoryId: inventoryId[1],
        characterId: 'character-2',
      },
    ] as any);

    await assertRejects(
      () =>
        db.tradeCharacters({
          aUserId: 'user-1',
          bUserId: 'user-2',
          guildId: 'guild-id',
          giveIds: ['character-1'],
          takeIds: ['character-2'],
        }),
      Error,
      'NOT_OWNED',
    );
  });

  it('take character not owned', async () => {
    const { insertedIds: inventoryId } = await client.inventories().insertMany([
      {
        userId: 'user-1',
        guildId: 'guild-id',
        party: {},
      },
      {
        userId: 'user-2',
        guildId: 'guild-id',
        party: {},
      },
    ] as any);

    await client.characters().insertMany([
      {
        userId: 'user-1',
        guildId: 'guild-id',
        inventoryId: inventoryId[0],
        characterId: 'character-1',
      },
      {
        userId: 'user-1',
        guildId: 'guild-id',
        inventoryId: inventoryId[1],
        characterId: 'character-2',
      },
    ] as any);

    await assertRejects(
      () =>
        db.tradeCharacters({
          aUserId: 'user-1',
          bUserId: 'user-2',
          guildId: 'guild-id',
          giveIds: ['character-1'],
          takeIds: ['character-2'],
        }),
      Error,
      'NOT_OWNED',
    );
  });

  it('give character in party', async () => {
    const characterInsertedId = new ObjectId();

    const { insertedIds: inventoryId } = await client.inventories().insertMany([
      {
        userId: 'user-1',
        guildId: 'guild-id',
        party: {
          member1Id: characterInsertedId,
        },
      },
      {
        userId: 'user-2',
        guildId: 'guild-id',
        party: {},
      },
    ] as any);

    await client.characters().insertMany([
      {
        _id: characterInsertedId,
        userId: 'user-1',
        guildId: 'guild-id',
        inventoryId: inventoryId[0],
        characterId: 'character-1',
      },
      {
        userId: 'user-2',
        guildId: 'guild-id',
        inventoryId: inventoryId[1],
        characterId: 'character-2',
      },
    ] as any);

    await assertRejects(
      () =>
        db.tradeCharacters({
          aUserId: 'user-1',
          bUserId: 'user-2',
          guildId: 'guild-id',
          giveIds: ['character-1'],
          takeIds: ['character-2'],
        }),
      Error,
      'CHARACTER_IN_PARTY',
    );
  });

  it('take character in party', async () => {
    const characterInsertedId = new ObjectId();

    const { insertedIds: inventoryId } = await client.inventories().insertMany([
      {
        userId: 'user-1',
        guildId: 'guild-id',
        party: {},
      },
      {
        userId: 'user-2',
        guildId: 'guild-id',
        party: {
          member1Id: characterInsertedId,
        },
      },
    ] as any);

    await client.characters().insertMany([
      {
        userId: 'user-1',
        guildId: 'guild-id',
        inventoryId: inventoryId[0],
        characterId: 'character-1',
      },
      {
        _id: characterInsertedId,
        userId: 'user-2',
        guildId: 'guild-id',
        inventoryId: inventoryId[1],
        characterId: 'character-2',
      },
    ] as any);

    await assertRejects(
      () =>
        db.tradeCharacters({
          aUserId: 'user-1',
          bUserId: 'user-2',
          guildId: 'guild-id',
          giveIds: ['character-1'],
          takeIds: ['character-2'],
        }),
      Error,
      'CHARACTER_IN_PARTY',
    );
  });
});

describe('db.stealCharacter()', () => {
  beforeEach(async () => {
    mongod = await MongoMemoryReplSet.create();
    client = new Mongo(mongod.getUri());
    config.mongoUri = mongod.getUri();
  });

  afterEach(async () => {
    delete config.mongoUri;
    await client.close();
    await mongod.stop();
  });

  it('normal', async () => {
    const { insertedIds: inventoryId } = await client.inventories().insertMany([
      {
        userId: 'user-1',
        guildId: 'guild-id',
        party: {},
      },
      {
        userId: 'user-2',
        guildId: 'guild-id',
        party: {},
      },
    ] as any);

    const { insertedId: characterOId } = await client.characters().insertOne({
      userId: 'user-2',
      guildId: 'guild-id',
      inventoryId: inventoryId[1],
      characterId: 'character-id',
    } as any);

    await db.stealCharacter(
      'user-1',
      'guild-id',
      characterOId,
    );

    const character = await client.characters().findOne({
      characterId: 'character-id',
    });

    assertEquals(objectIdRegex.test(character!._id.toHexString()), true);

    assertObjectMatch(character!, {
      userId: 'user-1',
      guildId: 'guild-id',
      inventoryId: inventoryId[0],
      characterId: 'character-id',
    });
  });

  it('from target party', async () => {
    const characterInsertedId = new ObjectId();

    const { insertedIds: inventoryId } = await client.inventories().insertMany([
      {
        userId: 'user-1',
        guildId: 'guild-id',
        party: {},
      },
      {
        userId: 'user-2',
        guildId: 'guild-id',
        party: { member1Id: characterInsertedId },
      },
    ] as any);

    const { insertedId: characterOId } = await client.characters().insertOne({
      _id: characterInsertedId,
      userId: 'user-2',
      guildId: 'guild-id',
      inventoryId: inventoryId[1],
      characterId: 'character-id',
    } as any);

    await db.stealCharacter(
      'user-1',
      'guild-id',
      characterOId,
    );

    const character = await client.characters().findOne({
      characterId: 'character-id',
    });

    assertEquals(objectIdRegex.test(character!._id.toHexString()), true);

    assertObjectMatch(character!, {
      userId: 'user-1',
      guildId: 'guild-id',
      inventoryId: inventoryId[0],
      characterId: 'character-id',
    });

    const targetInventory = await client.inventories().findOne({
      _id: inventoryId[1],
    });

    assertEquals(targetInventory!.party, {} as any);
  });

  it('character not found', async () => {
    await assertRejects(
      () => db.stealCharacter('user-1', 'guild-id', new ObjectId()),
      Error,
      'NOT_FOUND',
    );
  });
});

describe('db.failSteal()', () => {
  beforeEach(async () => {
    mongod = await MongoMemoryReplSet.create();
    client = new Mongo(mongod.getUri());
    config.mongoUri = mongod.getUri();
  });

  afterEach(async () => {
    delete config.mongoUri;
    await client.close();
    await mongod.stop();
  });

  it('new inventory', async () => {
    await db.failSteal('guild-id', 'user-id');

    const inventory = await client.inventories().findOne({
      userId: 'user-id',
      guildId: 'guild-id',
    });

    assertEquals(objectIdRegex.test(inventory!._id.toHexString()), true);

    assertWithinLast5secs(inventory!.stealTimestamp!);
  });

  it('existing', async () => {
    const { insertedId } = await client.inventories().insertOne(
      {
        userId: 'user-id',
        guildId: 'guild-id',
        stealTimestamp: new Date('1999-1-1'),
      } as any,
    );

    await db.failSteal('guild-id', 'user-id');

    const inventory = await client.inventories().findOne({
      userId: 'user-id',
      guildId: 'guild-id',
    });

    assertEquals(inventory!._id.toHexString(), insertedId.toHexString());

    assertWithinLast5secs(inventory!.stealTimestamp!);
  });
});
