/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import db, { Mongo } from '~/db/index.ts';
import config from '~/src/config.ts';

let mongod: MongoMemoryServer;
let client: Mongo;

const assertWithinLast5secs = (ts: Date) => {
  expect(Math.abs(Date.now() - ts.getTime()) <= 5000).toBe(true);
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
    const { insertedId } = await client.inventories().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      floorsCleared: 1,
    } as any);

    const inventory = await db.clearFloor('user-id', 'guild-id');

    expect(inventory).toMatchObject({
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
    const { insertedId } = await client.inventories().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      availableKeys: 1,
    } as any);

    const update = await db.consumeKey('user-id', 'guild-id');

    expect(update).toBeTruthy();

    const inventory = await client.inventories().findOne({ _id: insertedId });

    assertWithinLast5secs(inventory!.keysTimestamp!);
    assertWithinLast5secs(inventory!.lastPVE!);

    expect(inventory).toMatchObject({
      _id: insertedId,
      userId: 'user-id',
      guildId: 'guild-id',
      availableKeys: 0,
    });
  });

  it('no keys', async () => {
    await client.inventories().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
    } as any);

    const update = await db.consumeKey('user-id', 'guild-id');

    expect(update).toBeFalsy();
  });
});
