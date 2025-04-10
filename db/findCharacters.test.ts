/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { describe, it, beforeEach, afterEach, expect } from 'vitest';

import db, { Mongo } from '~/db/index.ts';
import config from '~/src/config.ts';

let mongod: MongoMemoryServer;
let client: Mongo;

describe('db.findCharacter()', () => {
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

  it('exists', async () => {
    const { insertedId: inventoryInsertedId } = await client
      .inventories()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
      } as any);

    const { insertedId: inventory2InsertedId } = await client
      .inventories()
      .insertOne({
        userId: 'another-user-id',
        guildId: 'guild-id',
      } as any);

    const { insertedId: characterInsertedId } = await client
      .characters()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        inventoryId: inventoryInsertedId,
        characterId: 'character-id',
      } as any);

    const { insertedId: character2InsertedId } = await client
      .characters()
      .insertOne({
        userId: 'another-user-id',
        guildId: 'guild-id',
        inventoryId: inventory2InsertedId,
        characterId: 'character-id',
      } as any);

    const characters = await db.findCharacter('guild-id', 'character-id');

    expect(characters).toEqual([
      {
        _id: characterInsertedId,
        userId: 'user-id',
        guildId: 'guild-id',
        inventoryId: inventoryInsertedId,
        inventory: {
          _id: inventoryInsertedId,
          userId: 'user-id',
          guildId: 'guild-id',
        },
        characterId: 'character-id',
      },
      {
        _id: character2InsertedId,
        userId: 'another-user-id',
        guildId: 'guild-id',
        inventoryId: inventory2InsertedId,
        inventory: {
          _id: inventory2InsertedId,
          userId: 'another-user-id',
          guildId: 'guild-id',
        },
        characterId: 'character-id',
      },
    ] as any);
  });

  it("doesn't exists", async () => {
    const characters = await db.findCharacter('guild-id', 'character-id');

    expect(characters.length).toBe(0);
  });
});

describe('db.findOneCharacter()', () => {
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

  it('exists', async () => {
    const { insertedId: inventoryInsertedId } = await client
      .inventories()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
      } as any);

    const { insertedId: characterInsertedId } = await client
      .characters()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        inventoryId: inventoryInsertedId,
        characterId: 'character-id',
      } as any);

    const character = await db.findOneCharacter(
      'guild-id',
      'user-id',
      'character-id'
    );

    expect(character).toEqual({
      _id: characterInsertedId,
      userId: 'user-id',
      guildId: 'guild-id',
      inventoryId: inventoryInsertedId,
      inventory: {
        _id: inventoryInsertedId,
        userId: 'user-id',
        guildId: 'guild-id',
      },
      characterId: 'character-id',
    } as any);
  });

  it("doesn't exists", async () => {
    const character = await db.findOneCharacter(
      'guild-id',
      'user-id',
      'character-id'
    );

    expect(character).toBeUndefined();
  });
});

describe('db.findCharacters()', () => {
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

  it('2 exists', async () => {
    const { insertedId: inventory1InsertedId } = await client
      .inventories()
      .insertOne({
        userId: 'user-1',
        guildId: 'guild-id',
      } as any);

    const { insertedId: character1InsertedId } = await client
      .characters()
      .insertOne({
        userId: 'user-1',
        guildId: 'guild-id',
        inventoryId: inventory1InsertedId,
        characterId: 'character-1',
      } as any);

    const { insertedId: inventory2InsertedId } = await client
      .inventories()
      .insertOne({
        userId: 'user-2',
        guildId: 'guild-id',
      } as any);

    const { insertedId: character2InsertedId } = await client
      .characters()
      .insertOne({
        userId: 'user-2',
        guildId: 'guild-id',
        inventoryId: inventory2InsertedId,
        characterId: 'character-2',
      } as any);

    const characters = await db.findCharacters('guild-id', [
      'character-1',
      'character-2',
    ]);

    expect(characters.length).toBe(2);

    expect(characters[0]).toEqual({
      _id: character1InsertedId,
      userId: 'user-1',
      guildId: 'guild-id',
      inventoryId: inventory1InsertedId,
      inventory: {
        _id: inventory1InsertedId,
        userId: 'user-1',
        guildId: 'guild-id',
      },
      characterId: 'character-1',
    } as any);

    expect(characters[1]).toEqual({
      _id: character2InsertedId,
      userId: 'user-2',
      guildId: 'guild-id',
      inventoryId: inventory2InsertedId,
      inventory: {
        _id: inventory2InsertedId,
        userId: 'user-2',
        guildId: 'guild-id',
      },
      characterId: 'character-2',
    } as any);
  });

  it("1 exists 1 doesn't", async () => {
    const { insertedId: inventory1InsertedId } = await client
      .inventories()
      .insertOne({
        userId: 'user-1',
        guildId: 'guild-id',
      } as any);

    const { insertedId: character1InsertedId } = await client
      .characters()
      .insertOne({
        userId: 'user-1',
        guildId: 'guild-id',
        inventoryId: inventory1InsertedId,
        characterId: 'character-1',
      } as any);

    const characters = await db.findCharacters('guild-id', [
      'character-1',
      'character-2',
    ]);

    expect(characters.length).toBe(2);

    expect(characters[0]).toEqual({
      _id: character1InsertedId,
      userId: 'user-1',
      guildId: 'guild-id',
      inventoryId: inventory1InsertedId,
      inventory: {
        _id: inventory1InsertedId,
        userId: 'user-1',
        guildId: 'guild-id',
      },
      characterId: 'character-1',
    } as any);

    expect(characters[1]).toBeUndefined();
  });

  it("2 don't", async () => {
    const characters = await db.findCharacters('guild-id', [
      'character-1',
      'character-2',
    ]);

    expect(characters.length).toBe(2);

    expect(characters[0]).toBeUndefined();
    expect(characters[1]).toBeUndefined();
  });
});

describe('db.findGuildCharacters()', () => {
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
    const { insertedId: inventory1InsertedId } = await client
      .inventories()
      .insertOne({
        userId: 'user-1',
        guildId: 'guild-id',
      } as any);

    const { insertedId: character1InsertedId } = await client
      .characters()
      .insertOne({
        userId: 'user-1',
        guildId: 'guild-id',
        inventoryId: inventory1InsertedId,
        characterId: 'character-1',
      } as any);

    const { insertedId: inventory2InsertedId } = await client
      .inventories()
      .insertOne({
        userId: 'user-2',
        guildId: 'guild-id',
      } as any);

    const { insertedId: character2InsertedId } = await client
      .characters()
      .insertOne({
        userId: 'user-2',
        guildId: 'guild-id',
        inventoryId: inventory2InsertedId,
        characterId: 'character-2',
      } as any);

    const characters = await db.findGuildCharacters('guild-id');

    expect(characters.length).toBe(2);

    expect(characters[0]).toEqual({
      _id: character1InsertedId,
      userId: 'user-1',
      guildId: 'guild-id',
      inventoryId: inventory1InsertedId,
      characterId: 'character-1',
    } as any);

    expect(characters[1]).toEqual({
      _id: character2InsertedId,
      userId: 'user-2',
      guildId: 'guild-id',
      inventoryId: inventory2InsertedId,
      characterId: 'character-2',
    } as any);
  });
});
