// deno-lint-ignore-file no-explicit-any no-non-null-assertion

import { MongoMemoryServer } from 'mongodb-memory-server';

import { afterEach, beforeEach, describe, it } from '$std/testing/bdd.ts';
import { assertEquals } from '$std/assert/mod.ts';

import db, { Mongo } from '~/db/mod.ts';

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
    const { insertedId: inventoryInsertedId } = await client.inventories()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
      } as any);

    const { insertedId: characterInsertedId } = await client.characters()
      .insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        inventoryId: inventoryInsertedId,
        characterId: 'character-id',
      } as any);

    const character = await db.findCharacter('guild-id', 'character-id');

    assertEquals(character!, {
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
    const character = await db.findCharacter('guild-id', 'character-id');

    assertEquals(character, undefined);
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
    const { insertedId: inventory1InsertedId } = await client.inventories()
      .insertOne({
        userId: 'user-1',
        guildId: 'guild-id',
      } as any);

    const { insertedId: character1InsertedId } = await client.characters()
      .insertOne({
        userId: 'user-1',
        guildId: 'guild-id',
        inventoryId: inventory1InsertedId,
        characterId: 'character-1',
      } as any);

    const { insertedId: inventory2InsertedId } = await client.inventories()
      .insertOne({
        userId: 'user-2',
        guildId: 'guild-id',
      } as any);

    const { insertedId: character2InsertedId } = await client.characters()
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

    assertEquals(characters.length, 2);

    assertEquals(characters[0]!, {
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

    assertEquals(characters[1]!, {
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
    const { insertedId: inventory1InsertedId } = await client.inventories()
      .insertOne({
        userId: 'user-1',
        guildId: 'guild-id',
      } as any);

    const { insertedId: character1InsertedId } = await client.characters()
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

    assertEquals(characters.length, 2);

    assertEquals(characters[0]!, {
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

    assertEquals(characters[1], undefined);
  });

  it("2 don't", async () => {
    const characters = await db.findCharacters('guild-id', [
      'character-1',
      'character-2',
    ]);

    assertEquals(characters.length, 2);

    assertEquals(characters[0], undefined);
    assertEquals(characters[1], undefined);
  });
});
