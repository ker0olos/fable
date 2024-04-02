// deno-lint-ignore-file no-explicit-any no-non-null-assertion

import { MongoMemoryServer } from 'mongodb-memory-server';

import { afterEach, beforeEach, describe, it } from '$std/testing/bdd.ts';
import { assert, assertEquals, assertObjectMatch } from '$std/assert/mod.ts';

import db, { Mongo } from '~/db/mod.ts';
import config from '~/src/config.ts';

let mongod: MongoMemoryServer;
let client: Mongo;

const assertWithinLast5secs = (ts: Date) => {
  assertEquals(Math.abs(Date.now() - ts.getTime()) <= 5000, true);
};

describe('db.clearFloor()', () => {
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
    const { insertedId } = await client.inventories()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        floorsCleared: 1,
      } as any);

    const inventory = await db.clearFloor(
      'user-id',
      'guild-id',
    );

    assertObjectMatch(inventory!, {
      _id: insertedId,
      userId: 'user-id',
      guildId: 'guild-id',
      floorsCleared: 2,
    });
  });
});

describe('db.consumeKey()', () => {
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
    const { insertedId } = await client.inventories()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        availableKeys: 1,
      } as any);

    const update = await db.consumeKey(
      'user-id',
      'guild-id',
    );

    assert(update);

    const inventory = await client.inventories().findOne({ _id: insertedId });

    assertWithinLast5secs(inventory!.keysTimestamp!);
    assertWithinLast5secs(inventory!.lastPVE!);

    assertObjectMatch(inventory!, {
      _id: insertedId,
      userId: 'user-id',
      guildId: 'guild-id',
      availableKeys: 0,
    });
  });

  it('no keys', async () => {
    await client.inventories()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
      } as any);

    const update = await db.consumeKey(
      'user-id',
      'guild-id',
    );

    assert(!update);
  });
});
