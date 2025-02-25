/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import db, { COSTS, Mongo } from '~/db/index.ts';
import config from '~/src/config.ts';

let mongod: MongoMemoryServer;
let client: Mongo;

describe('db.addTokens()', () => {
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

  it('add 3 tokens', async () => {
    const { insertedId } = await client.users().insertOne({
      discordId: 'user-id',
      availableTokens: 2,
    } as any);

    await db.addTokens('user-id', 3);

    const user = await client.users().findOne({ discordId: 'user-id' });

    expect(user!._id).toEqual(insertedId);
    expect(user!.availableTokens).toBe(5);
  });
});

describe('db.addGuarantee()', () => {
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

  it('add 5*', async () => {
    const { insertedId } = await client.users().insertOne({
      discordId: 'user-id',
      availableTokens: COSTS.FIVE,
      guarantees: [1],
    } as any);

    await db.addGuarantee('user-id', 5);

    const _user = await client.users().findOne({ discordId: 'user-id' });

    expect(_user!._id).toEqual(insertedId);
    expect(_user!.availableTokens).toBe(0);
    expect(_user!.guarantees).toEqual([1, 5]);
  });

  it('add 4*', async () => {
    const { insertedId } = await client.users().insertOne({
      discordId: 'user-id',
      availableTokens: COSTS.FOUR,
      guarantees: [1],
    } as any);

    await db.addGuarantee('user-id', 4);

    const _user = await client.users().findOne({ discordId: 'user-id' });

    expect(_user!._id).toEqual(insertedId);
    expect(_user!.availableTokens).toBe(0);
    expect(_user!.guarantees).toEqual([1, 4]);
  });

  it('add 3*', async () => {
    const { insertedId } = await client.users().insertOne({
      discordId: 'user-id',
      availableTokens: COSTS.THREE,
      guarantees: [1],
    } as any);

    await db.addGuarantee('user-id', 3);

    const _user = await client.users().findOne({ discordId: 'user-id' });

    expect(_user!._id).toEqual(insertedId);
    expect(_user!.availableTokens).toBe(0);
    expect(_user!.guarantees).toEqual([1, 3]);
  });

  it('not enough tokens', async () => {
    const { insertedId } = await client.users().insertOne({
      discordId: 'user-id',
      availableTokens: COSTS.FIVE - 1,
      guarantees: [1],
    } as any);

    await expect(db.addGuarantee('user-id', 5)).rejects.toThrow(
      'INSUFFICIENT_TOKENS'
    );

    const _user = await client.users().findOne({ discordId: 'user-id' });

    expect(_user!._id).toEqual(insertedId);
    expect(_user!.availableTokens).toBe(COSTS.FIVE - 1);
    expect(_user!.guarantees).toEqual([1]);
  });
});

describe('db.addPulls()', () => {
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

  it('add 2 pulls', async () => {
    const { insertedId: insertedUserId } = await client.users().insertOne({
      discordId: 'user-id',
      availableTokens: 2,
    } as any);

    const { insertedId: insertedInventoryId } = await client
      .inventories()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        availablePulls: 1,
      } as any);

    await db.addPulls('user-id', 'guild-id', 2);

    const user = await client.users().findOne({ discordId: 'user-id' });
    const inventory = await client.inventories().findOne({
      userId: 'user-id',
      guildId: 'guild-id',
    });

    expect(user!._id).toEqual(insertedUserId);
    expect(inventory!._id).toEqual(insertedInventoryId);

    expect(user!.availableTokens).toBe(0);
    expect(inventory!.availablePulls).toBe(3);
  });

  it('add 2 pulls (not enough tokens)', async () => {
    await client.users().insertOne({
      discordId: 'user-id',
      availableTokens: 1,
    } as any);

    await expect(db.addPulls('user-id', 'guild-id', 2)).rejects.toThrow(
      'INSUFFICIENT_TOKENS'
    );
  });
});

describe('db.addKeys()', () => {
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

  it('add 2 keys', async () => {
    const { insertedId: insertedUserId } = await client.users().insertOne({
      discordId: 'user-id',
      availableTokens: 2,
    } as any);

    const { insertedId: insertedInventoryId } = await client
      .inventories()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        availableKeys: 1,
      } as any);

    await db.addKeys('user-id', 'guild-id', 2);

    const user = await client.users().findOne({ discordId: 'user-id' });
    const inventory = await client.inventories().findOne({
      userId: 'user-id',
      guildId: 'guild-id',
    });

    expect(user!._id).toEqual(insertedUserId);
    expect(inventory!._id).toEqual(insertedInventoryId);

    expect(user!.availableTokens).toBe(0);
    expect(inventory!.availableKeys).toBe(3);
  });

  it('add 2 keys (not enough tokens)', async () => {
    await client.users().insertOne({
      discordId: 'user-id',
      availableTokens: 1,
    } as any);

    await expect(db.addKeys('user-id', 'guild-id', 2)).rejects.toThrow(
      'INSUFFICIENT_TOKENS'
    );
  });
});
