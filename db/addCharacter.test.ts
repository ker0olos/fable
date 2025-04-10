/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { describe, it, beforeEach, afterEach, expect } from 'vitest';

import db, { Mongo, ObjectId } from '~/db/index.ts';

import config from '~/src/config.ts';

import { NonFetalError } from '~/src/errors.ts';

let mongod: MongoMemoryReplSet;
let client: Mongo;

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const assertWithinLast5secs = (ts: Date) => {
  expect(Math.abs(Date.now() - ts.getTime()) <= 5000).toBe(true);
};

describe('db.addCharacter()', () => {
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

  it('normal pull', async () => {
    await db.addCharacter({
      rating: 3,
      mediaId: 'media-id',
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
      guaranteed: false,
      mongo: client,
    });

    const character = await client.characters().findOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
    });

    const inventory = await client.inventories().findOne({
      userId: 'user-id',
      guildId: 'guild-id',
    });

    expect(Object.keys(character!)).toEqual([
      '_id',
      'createdAt',
      'inventoryId',
      'characterId',
      'guildId',
      'userId',
      'mediaId',
      'rating',
    ]);

    expect(objectIdRegex.test(character!._id.toHexString())).toBe(true);

    assertWithinLast5secs(character!.createdAt);

    expect(character).toMatchObject({
      rating: 3,
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
      mediaId: 'media-id',
    });

    assertWithinLast5secs(inventory!.lastPull!);
    assertWithinLast5secs(inventory!.rechargeTimestamp!);

    expect(inventory!.availablePulls).toBe(9);
  });

  it('with sacrifices', async () => {
    const { insertedId } = await client.characters().insertOne({} as any);

    await db.addCharacter({
      rating: 3,
      mediaId: 'media-id',
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
      guaranteed: false,
      sacrifices: [insertedId],
      mongo: client,
    });

    const character = await client.characters().findOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
    });

    const sacrificedCharacter = await client.characters().findOne({
      _id: insertedId,
    });

    expect(sacrificedCharacter).toBe(null);

    const inventory = await client.inventories().findOne({
      userId: 'user-id',
      guildId: 'guild-id',
    });

    expect(Object.keys(character!)).toEqual([
      '_id',
      'createdAt',
      'inventoryId',
      'characterId',
      'guildId',
      'userId',
      'mediaId',
      'rating',
    ]);

    expect(objectIdRegex.test(character!._id.toHexString())).toBe(true);

    assertWithinLast5secs(character!.createdAt);

    expect(character).toMatchObject({
      rating: 3,
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
      mediaId: 'media-id',
    });

    assertWithinLast5secs(inventory!.lastPull!);
    expect(inventory!.availablePulls).toBe(10);
  });

  it('with sacrifices (failed)', async () => {
    await expect(
      db.addCharacter({
        rating: 3,
        mediaId: 'media-id',
        userId: 'user-id',
        guildId: 'guild-id',
        characterId: 'character-id',
        guaranteed: false,
        sacrifices: [new ObjectId()],
        mongo: client,
      })
    ).rejects.toThrow(NonFetalError);
  });

  it('guaranteed pull', async () => {
    await client.users().insertOne({
      discordId: 'user-id',
      guarantees: [2, 3, 5],
      availableTokens: 0,
      dailyTimestamp: new Date(),
      likes: [],
    });

    await db.addCharacter({
      rating: 3,
      mediaId: 'media-id',
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
      guaranteed: true,
      mongo: client,
    });

    const character = await client.characters().findOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
    });

    const inventory = await client.inventories().findOne({
      userId: 'user-id',
      guildId: 'guild-id',
    });

    const user = await client.users().findOne({
      discordId: 'user-id',
    } as any);

    expect(Object.keys(character!)).toEqual([
      '_id',
      'createdAt',
      'inventoryId',
      'characterId',
      'guildId',
      'userId',
      'mediaId',
      'rating',
    ]);

    expect(objectIdRegex.test(character!._id.toHexString())).toBe(true);

    assertWithinLast5secs(character!.createdAt);

    expect(character).toMatchObject({
      rating: 3,
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
      mediaId: 'media-id',
    });

    assertWithinLast5secs(inventory!.lastPull!);

    expect(inventory!.availablePulls).toBe(10);

    expect(user!.guarantees).toEqual([2, 5]);
  });

  it('guaranteed pull (not available)', async () => {
    await expect(
      db.addCharacter({
        rating: 3,
        mediaId: 'media-id',
        userId: 'user-id',
        guildId: 'guild-id',
        characterId: 'character-id',
        guaranteed: true,
        mongo: client,
      })
    ).rejects.toThrowError('403');
  });
});
