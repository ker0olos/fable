// deno-lint-ignore-file no-explicit-any no-non-null-assertion

import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { afterEach, beforeEach, describe, it } from '$std/testing/bdd.ts';
import {
  assertEquals,
  assertObjectMatch,
  assertRejects,
} from '$std/assert/mod.ts';

import db from '~/db/mod.ts';

let mongod: MongoMemoryServer;

describe({
  name: 'db.acquireSkill()',
  // WORKAROUND fails to clean up properly in github ci
  // causing an error unrelated to test results
  sanitizeExit: false,
  sanitizeResources: false,
  sanitizeOps: false,
  fn: () => {
    beforeEach(async () => {
      mongod = await MongoMemoryServer.create();

      db.client = await new MongoClient(mongod.getUri())
        .connect();
    });

    afterEach(async () => {
      await db.client.close();
      await mongod.stop();
    });

    it('normal', async () => {
      const { insertedId } = await db.characters().insertOne({
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

      const character = await db.characters().findOne({ _id: insertedId });

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
      const { insertedId } = await db.characters().insertOne({
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

      const character = await db.characters().findOne({ _id: insertedId });

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
      const { insertedId } = await db.characters().insertOne({
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

      const character = await db.characters().findOne({ _id: insertedId });

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
  },
});
