// deno-lint-ignore-file no-explicit-any no-non-null-assertion

import { MongoMemoryServer } from 'mongodb-memory-server';

import { afterEach, beforeEach, describe, it } from '$std/testing/bdd.ts';
import {
  assertEquals,
  assertObjectMatch,
  assertRejects,
} from '$std/assert/mod.ts';

import db, { Mongo } from '~/db/mod.ts';
import config from '~/src/config.ts';

let mongod: MongoMemoryServer;
let client: Mongo;

describe('db.acquireSkill()', () => {
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

  it('normal', async () => {
    const { insertedId } = await client.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
      combat: {
        skillPoints: 2,
        skills: {
          crit: {
            level: 1,
          },
        },
      },
    } as any);

    const skill = await db.acquireSkill(
      'user-id',
      'guild-id',
      'character-id',
      'crit',
    );

    const character = await client.characters().findOne({ _id: insertedId });

    assertEquals(character!._id, insertedId);

    assertEquals(skill.level, 2);

    assertObjectMatch(character!, {
      combat: {
        skillPoints: 0,
        skills: {
          crit: {
            level: 2,
          },
        },
      },
    });
  });

  it('no skill points', async () => {
    const { insertedId } = await client.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
      combat: {
        skillPoints: 1,
        skills: {
          crit: {
            level: 1,
          },
        },
      },
    } as any);

    await assertRejects(() =>
      db.acquireSkill(
        'user-id',
        'guild-id',
        'character-id',
        'crit',
      )
    );

    const character = await client.characters().findOne({ _id: insertedId });

    assertObjectMatch(character!, {
      combat: {
        skillPoints: 1,
        skills: {
          crit: {
            level: 1,
          },
        },
      },
    });
  });

  it('max level', async () => {
    const { insertedId } = await client.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
      combat: {
        skillPoints: 999,
        skills: {
          crit: {
            level: 3,
          },
        },
      },
    } as any);

    await assertRejects(() =>
      db.acquireSkill(
        'user-id',
        'guild-id',
        'character-id',
        'crit',
      )
    );

    const character = await client.characters().findOne({ _id: insertedId });

    assertObjectMatch(character!, {
      combat: {
        skillPoints: 999,
        skills: {
          crit: {
            level: 3,
          },
        },
      },
    });
  });
});
