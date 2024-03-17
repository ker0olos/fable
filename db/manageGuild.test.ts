// deno-lint-ignore-file no-explicit-any no-non-null-assertion

import { MongoClient } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

import { afterEach, beforeEach, describe, it } from '$std/testing/bdd.ts';
import { assertObjectMatch } from '$std/assert/mod.ts';

import db from '~/db/mod.ts';

let mongod: MongoMemoryReplSet;

describe('db.disableBuiltins()', () => {
  beforeEach(async () => {
    mongod = await MongoMemoryReplSet.create();

    db.client = await new MongoClient(mongod.getUri())
      .connect();
  });

  afterEach(async () => {
    await db.client.close();
    await mongod.stop();
  });

  it('insert new guild', async () => {
    await db.disableBuiltins('guild-id');

    const guild = await db.guilds().findOne({ discordId: 'guild-id' });

    assertObjectMatch(guild!, {
      discordId: 'guild-id',
      excluded: true,
      builtinsDisabled: true,
    });
  });

  it('existing guild', async () => {
    const { insertedId } = await db.guilds().insertOne({
      discordId: 'guild-id',
      excluded: false,
      builtinsDisabled: false,
    } as any);

    await db.disableBuiltins('guild-id');

    const guild = await db.guilds().findOne({ discordId: 'guild-id' });

    assertObjectMatch(guild!, {
      _id: insertedId,
      discordId: 'guild-id',
      excluded: true,
      builtinsDisabled: true,
    });
  });

  it('already disabled', async () => {
    const { insertedId } = await db.guilds().insertOne({
      discordId: 'guild-id',
      excluded: true,
      builtinsDisabled: true,
    } as any);

    await db.disableBuiltins('guild-id');

    const guild = await db.guilds().findOne({ discordId: 'guild-id' });

    assertObjectMatch(guild!, {
      _id: insertedId,
      discordId: 'guild-id',
      excluded: true,
      builtinsDisabled: true,
    });
  });
});
