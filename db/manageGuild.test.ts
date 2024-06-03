// deno-lint-ignore-file no-explicit-any no-non-null-assertion

import { MongoMemoryServer } from 'mongodb-memory-server';

import { afterEach, beforeEach, describe, it } from '$std/testing/bdd.ts';
import { assertObjectMatch } from '$std/assert/mod.ts';

import db, { Mongo } from '~/db/mod.ts';

import config from '~/src/config.ts';

let mongod: MongoMemoryServer;
let client: Mongo;

describe('db.invertDupes()', () => {
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

  it('dupes is disallowed', async () => {
    const { insertedId } = await client.guilds().insertOne({
      discordId: 'guild-id',
      options: { dupes: false },
    } as any);

    await db.invertDupes('guild-id');

    const guild = await client.guilds().findOne({ discordId: 'guild-id' });

    assertObjectMatch(guild!, {
      _id: insertedId,
      discordId: 'guild-id',
      options: { dupes: true },
    });
  });

  it('dupes is allowed', async () => {
    const { insertedId } = await client.guilds().insertOne({
      discordId: 'guild-id',
      options: { dupes: true },
    } as any);

    await db.invertDupes('guild-id');

    const guild = await client.guilds().findOne({ discordId: 'guild-id' });

    assertObjectMatch(guild!, {
      _id: insertedId,
      discordId: 'guild-id',
      options: { dupes: false },
    });
  });
});
