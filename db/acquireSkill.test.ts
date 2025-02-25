/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import db, { Mongo } from '~/db/index.ts';
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
      'crit'
    );

    const character = await client.characters().findOne({ _id: insertedId });

    expect(character!._id).toEqual(insertedId);
    expect(skill.level).toBe(2);
    expect(character).toMatchObject({
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

    await expect(
      db.acquireSkill('user-id', 'guild-id', 'character-id', 'crit')
    ).rejects.toThrow();

    const character = await client.characters().findOne({ _id: insertedId });

    expect(character).toMatchObject({
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

    await expect(
      db.acquireSkill('user-id', 'guild-id', 'character-id', 'crit')
    ).rejects.toThrow();

    const character = await client.characters().findOne({ _id: insertedId });

    expect(character).toMatchObject({
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
