/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterEach, beforeEach, describe, it, expect } from 'vitest';

import db, { Mongo } from '~/db/index.ts';
import config from '~/src/config.ts';

let mongod: MongoMemoryServer;
let client: Mongo;

describe('db.setCharacterNickname()', () => {
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

  it('set new nickname', async () => {
    const { insertedId } = await client.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
    } as any);

    const character = await db.setCharacterNickname(
      'user-id',
      'guild-id',
      'character-id',
      'new-nickname'
    );

    expect(character!._id).toEqual(insertedId);
    expect(character!.nickname).toBe('new-nickname');
  });

  it('reset nickname', async () => {
    const { insertedId } = await client.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
      nickname: 'nickname',
    } as any);

    const character = await db.setCharacterNickname(
      'user-id',
      'guild-id',
      'character-id'
    );

    expect(character!._id).toEqual(insertedId);
    expect(character!.nickname).toBeUndefined();
  });
});

describe('db.setCharacterImage()', () => {
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

  it('set new image', async () => {
    const { insertedId } = await client.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
    } as any);

    const character = await db.setCharacterImage(
      'user-id',
      'guild-id',
      'character-id',
      'new-image-url'
    );

    expect(character!._id).toEqual(insertedId);
    expect(character!.image).toBe('new-image-url');
  });

  it('reset image', async () => {
    const { insertedId } = await client.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
      Image: 'image-url',
    } as any);

    const character = await db.setCharacterImage(
      'user-id',
      'guild-id',
      'character-id'
    );

    expect(character!._id).toEqual(insertedId);
    expect(character!.image).toBeUndefined();
  });
});
