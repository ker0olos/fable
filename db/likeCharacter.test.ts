// deno-lint-ignore-file no-explicit-any no-non-null-assertion

import { MongoMemoryServer } from 'mongodb-memory-server';

import { afterEach, beforeEach, describe, it } from '$std/testing/bdd.ts';
import { assertObjectMatch } from '$std/assert/mod.ts';

import db, { Mongo } from '~/db/mod.ts';

import config from '~/src/config.ts';

let mongod: MongoMemoryServer;
let client: Mongo;

describe('db.likeCharacter()', () => {
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

  it('insert new user', async () => {
    await db.likeCharacter('user-id', 'character-id');

    const user = await client.users().findOne({ discordId: 'user-id' });

    assertObjectMatch(user!, {
      discordId: 'user-id',
      likes: [
        { characterId: 'character-id' },
      ],
    });
  });

  it('existing user', async () => {
    const { insertedId } = await client.users().insertOne({
      discordId: 'user-id',
      likes: [{ characterId: 'character-1' }],
    } as any);

    await db.likeCharacter('user-id', 'character-2');

    const user = await client.users().findOne({ discordId: 'user-id' });

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
    mongod = await MongoMemoryServer.create();
    client = new Mongo(mongod.getUri());
    config.mongoUri = mongod.getUri();
  });

  afterEach(async () => {
    delete config.mongoUri;
    await client.close();
    await mongod.stop();
  });

  it('insert new user', async () => {
    await db.likeMedia('user-id', 'media-id');

    const user = await client.users().findOne({ discordId: 'user-id' });

    assertObjectMatch(user!, {
      discordId: 'user-id',
      likes: [
        { mediaId: 'media-id' },
      ],
    });
  });

  it('existing user', async () => {
    const { insertedId } = await client.users().insertOne({
      discordId: 'user-id',
      likes: [{ mediaId: 'media-1' }],
    } as any);

    await db.likeMedia('user-id', 'media-2');

    const user = await client.users().findOne({ discordId: 'user-id' });

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
