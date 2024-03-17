// deno-lint-ignore-file no-explicit-any no-non-null-assertion

import { MongoClient } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

import { afterEach, beforeEach, describe, it } from '$std/testing/bdd.ts';
import { assertObjectMatch } from '$std/assert/mod.ts';

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

  it('insert new user', async () => {
    await db.likeCharacter('user-id', 'character-id');

    const user = await db.users().findOne({ discordId: 'user-id' });

    assertObjectMatch(user!, {
      discordId: 'user-id',
      likes: [
        { characterId: 'character-id' },
      ],
    });
  });

  it('existing user', async () => {
    const { insertedId } = await db.users().insertOne({
      discordId: 'user-id',
      likes: [{ characterId: 'character-1' }],
    } as any);

    await db.likeCharacter('user-id', 'character-2');

    const user = await db.users().findOne({ discordId: 'user-id' });

    assertObjectMatch(user!, {
      _id: insertedId,
      discordId: 'user-id',
      likes: [
        { characterId: 'character-1' },
        { characterId: 'character-2' },
      ],
    });
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

  it('insert new user', async () => {
    await db.likeMedia('user-id', 'media-id');

    const user = await db.users().findOne({ discordId: 'user-id' });

    assertObjectMatch(user!, {
      discordId: 'user-id',
      likes: [
        { mediaId: 'media-id' },
      ],
    });
  });

  it('existing user', async () => {
    const { insertedId } = await db.users().insertOne({
      discordId: 'user-id',
      likes: [{ mediaId: 'media-1' }],
    } as any);

    await db.likeMedia('user-id', 'media-2');

    const user = await db.users().findOne({ discordId: 'user-id' });

    assertObjectMatch(user!, {
      _id: insertedId,
      discordId: 'user-id',
      likes: [
        { mediaId: 'media-1' },
        { mediaId: 'media-2' },
      ],
    });
  });
});
