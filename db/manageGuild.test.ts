// deno-lint-ignore-file no-explicit-any no-non-null-assertion

import { MongoMemoryServer } from 'mongodb-memory-server';

import { afterEach, beforeEach, describe, it } from '$std/testing/bdd.ts';
import { assertObjectMatch } from '$std/assert/mod.ts';

import db, { Mongo } from '~/db/mod.ts';

import config from '~/src/config.ts';

let mongod: MongoMemoryServer;
let client: Mongo;

describe('db.disableBuiltins()', () => {
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

  it('insert new guild', async () => {
    await db.disableBuiltins('guild-id');

    const guild = await client.guilds().findOne({ discordId: 'guild-id' });

    assertObjectMatch(guild!, {
      discordId: 'guild-id',
      excluded: true,
      builtinsDisabled: true,
    });
  });

  it('existing guild', async () => {
    const { insertedId } = await client.guilds().insertOne({
      discordId: 'guild-id',
      excluded: false,
      builtinsDisabled: false,
    } as any);

    await db.disableBuiltins('guild-id');

    const guild = await client.guilds().findOne({ discordId: 'guild-id' });

    assertObjectMatch(guild!, {
      _id: insertedId,
      discordId: 'guild-id',
      excluded: true,
      builtinsDisabled: true,
    });
  });

  it('already disabled', async () => {
    const { insertedId } = await client.guilds().insertOne({
      discordId: 'guild-id',
      excluded: true,
      builtinsDisabled: true,
    } as any);

    await db.disableBuiltins('guild-id');

    const guild = await client.guilds().findOne({ discordId: 'guild-id' });

    assertObjectMatch(guild!, {
      _id: insertedId,
      discordId: 'guild-id',
      excluded: true,
      builtinsDisabled: true,
    });
  });
});
