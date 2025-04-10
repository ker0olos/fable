/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import db, { Mongo } from '~/db/index.ts';
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

  it('dupes are disallowed', async () => {
    const { insertedId } = await client.guilds().insertOne({
      discordId: 'guild-id',
      options: { dupes: false },
    } as any);

    await db.invertDupes('guild-id');

    const guild = await client.guilds().findOne({ discordId: 'guild-id' });

    expect(guild).toMatchObject({
      _id: insertedId,
      discordId: 'guild-id',
      options: { dupes: true },
    });
  });

  it('dupes are allowed', async () => {
    const { insertedId } = await client.guilds().insertOne({
      discordId: 'guild-id',
      options: { dupes: true },
    } as any);

    await db.invertDupes('guild-id');

    const guild = await client.guilds().findOne({ discordId: 'guild-id' });

    expect(guild).toMatchObject({
      _id: insertedId,
      discordId: 'guild-id',
      options: { dupes: false },
    });
  });
});
