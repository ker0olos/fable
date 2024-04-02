// deno-lint-ignore-file no-explicit-any no-non-null-assertion

import { MongoMemoryServer } from 'mongodb-memory-server';

import { afterEach, beforeEach, describe, it } from '$std/testing/bdd.ts';
import { assertEquals, assertRejects } from '$std/assert/mod.ts';

import db, { COSTS, Mongo } from '~/db/mod.ts';
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

    assertEquals(user!._id, insertedId);
    assertEquals(user!.availableTokens, 5);
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

    const user = await db.addGuarantee('user-id', 5);

    assertEquals(user!._id, insertedId);
    assertEquals(user!.availableTokens, 0);
    assertEquals(user!.guarantees, [1, 5]);
  });

  it('add 4*', async () => {
    const { insertedId } = await client.users().insertOne({
      discordId: 'user-id',
      availableTokens: COSTS.FOUR,
      guarantees: [1],
    } as any);

    const user = await db.addGuarantee('user-id', 4);

    assertEquals(user!._id, insertedId);
    assertEquals(user!.availableTokens, 0);
    assertEquals(user!.guarantees, [1, 4]);
  });

  it('add 3*', async () => {
    const { insertedId } = await client.users().insertOne({
      discordId: 'user-id',
      availableTokens: COSTS.THREE,
      guarantees: [1],
    } as any);

    const user = await db.addGuarantee('user-id', 3);

    assertEquals(user!._id, insertedId);
    assertEquals(user!.availableTokens, 0);
    assertEquals(user!.guarantees, [1, 3]);
  });

  it('not enough tokens', async () => {
    const { insertedId } = await client.users().insertOne({
      discordId: 'user-id',
      availableTokens: COSTS.FIVE - 1,
      guarantees: [1],
    } as any);

    const user = await db.addGuarantee('user-id', 5);

    assertEquals(user, null);

    const _user = await client.users().findOne({ discordId: 'user-id' });

    assertEquals(_user!._id, insertedId);
    assertEquals(_user!.availableTokens, COSTS.FIVE - 1);
    assertEquals(_user!.guarantees, [1]);
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

    const { insertedId: insertedInventoryId } = await client.inventories()
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

    assertEquals(user!._id, insertedUserId);
    assertEquals(inventory!._id, insertedInventoryId);

    assertEquals(user!.availableTokens, 0);
    assertEquals(inventory!.availablePulls, 3);
  });

  it('add 2 pulls (not enough tokens)', async () => {
    await client.users().insertOne({
      discordId: 'user-id',
      availableTokens: 1,
    } as any);

    await assertRejects(
      () => db.addPulls('user-id', 'guild-id', 2),
      Error,
      'INSUFFICIENT_TOKENS',
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

    const { insertedId: insertedInventoryId } = await client.inventories()
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

    assertEquals(user!._id, insertedUserId);
    assertEquals(inventory!._id, insertedInventoryId);

    assertEquals(user!.availableTokens, 0);
    assertEquals(inventory!.availableKeys, 3);
  });

  it('add 2 keys (not enough tokens)', async () => {
    await client.users().insertOne({
      discordId: 'user-id',
      availableTokens: 1,
    } as any);

    await assertRejects(
      () => db.addKeys('user-id', 'guild-id', 2),
      Error,
      'INSUFFICIENT_TOKENS',
    );
  });
});
