// deno-lint-ignore-file no-explicit-any no-non-null-assertion

import { MongoClient } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

import { afterEach, beforeEach, describe, it } from '$std/testing/bdd.ts';
import { assertEquals } from '$std/assert/mod.ts';

import db from '~/db/mod.ts';

let mongod: MongoMemoryReplSet;

describe('db.setCharacterNickname()', () => {
  beforeEach(async () => {
    mongod = await MongoMemoryReplSet.create();

    db.client = await new MongoClient(mongod.getUri())
      .connect();
  });

  afterEach(async () => {
    await db.client.close();
    await mongod.stop();
  });

  it('set new nickname', async () => {
    const { insertedId } = await db.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
    } as any);

    const character = await db.setCharacterNickname(
      'user-id',
      'guild-id',
      'character-id',
      'new-nickname',
    );

    assertEquals(character!._id, insertedId);
    assertEquals(character!.nickname, 'new-nickname');
  });

  it('reset nickname', async () => {
    const { insertedId } = await db.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
      nickname: 'nickname',
    } as any);

    const character = await db.setCharacterNickname(
      'user-id',
      'guild-id',
      'character-id',
    );

    assertEquals(character!._id, insertedId);
    assertEquals(character!.nickname, undefined);
  });
});

describe('db.setCharacterImage()', () => {
  beforeEach(async () => {
    mongod = await MongoMemoryReplSet.create();

    db.client = await new MongoClient(mongod.getUri())
      .connect();
  });

  afterEach(async () => {
    await db.client.close();
    await mongod.stop();
  });

  it('set new image', async () => {
    const { insertedId } = await db.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
    } as any);

    const character = await db.setCharacterImage(
      'user-id',
      'guild-id',
      'character-id',
      'new-image-url',
    );

    assertEquals(character!._id, insertedId);
    assertEquals(character!.image, 'new-image-url');
  });

  it('reset image', async () => {
    const { insertedId } = await db.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
      Image: 'image-url',
    } as any);

    const character = await db.setCharacterImage(
      'user-id',
      'guild-id',
      'character-id',
    );

    assertEquals(character!._id, insertedId);
    assertEquals(character!.image, undefined);
  });
});
