// deno-lint-ignore-file no-explicit-any no-non-null-assertion

import { MongoClient } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

import { afterEach, beforeEach, describe, it } from '$std/testing/bdd.ts';
import { assertEquals } from '$std/assert/mod.ts';

import db from '~/db/mod.ts';

let mongod: MongoMemoryReplSet;

describe('db.likeCharacter()', () => {
  beforeEach(async () => {
    mongod = await MongoMemoryReplSet.create();

    db.client = await new MongoClient(mongod.getUri())
      .connect();
  });

  afterEach(async () => {
    await db.client.close();
    await mongod.stop();
  });

  it('like character (insert new user)', async () => {
    // const { insertedId } = await db.characters().insertOne({
    //   userId: 'user-id',
    //   guildId: 'guild-id',
    //   characterId: 'character-id',
    // } as any);

    await db.likeCharacter('user-id', 'character-id');

    const user = await db.users().findOne({ discordId: 'user-id' });

    assertEquals(user!.likes, [{ characterId: 'character-id' }]);
  });

  it('like character (existing user)', async () => {
    const { insertedId } = await db.users().insertOne({
      discordId: 'user-id',
      likes: [{ characterId: 'character-1' }],
    } as any);

    await db.likeCharacter('user-id', 'character-2');

    const user = await db.users().findOne({ discordId: 'user-id' });

    assertEquals(user!._id, insertedId);
    assertEquals(user!.likes, [
      { characterId: 'character-1' },
      { characterId: 'character-2' },
    ]);
  });
});

describe('db.likeMedia()', () => {
  beforeEach(async () => {
    mongod = await MongoMemoryReplSet.create();

    db.client = await new MongoClient(mongod.getUri())
      .connect();
  });

  afterEach(async () => {
    await db.client.close();
    await mongod.stop();
  });

  it('like media (insert new user)', async () => {
    await db.likeMedia('user-id', 'media-id');

    const user = await db.users().findOne({ discordId: 'user-id' });

    assertEquals(user!.likes, [{ mediaId: 'media-id' }]);
  });

  it('like media (existing user)', async () => {
    const { insertedId } = await db.users().insertOne({
      discordId: 'user-id',
      likes: [{ mediaId: 'media-1' }],
    } as any);

    await db.likeMedia('user-id', 'media-2');

    const user = await db.users().findOne({ discordId: 'user-id' });

    assertEquals(user!._id, insertedId);
    assertEquals(user!.likes, [
      { mediaId: 'media-1' },
      { mediaId: 'media-2' },
    ]);
  });
});
