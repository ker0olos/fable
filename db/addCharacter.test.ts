// deno-lint-ignore-file no-explicit-any no-non-null-assertion

import { MongoMemoryReplSet } from 'mongodb-memory-server';

import { afterEach, beforeEach, describe, it } from '$std/testing/bdd.ts';
import {
  assertEquals,
  assertObjectMatch,
  assertRejects,
} from '$std/assert/mod.ts';

import db, { Mongo, ObjectId } from '~/db/mod.ts';

import config from '~/src/config.ts';

import { DupeError, NonFetalError } from '~/src/errors.ts';

let mongod: MongoMemoryReplSet;
let client: Mongo;

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const assertWithinLast5secs = (ts: Date) => {
  assertEquals(Math.abs(Date.now() - ts.getTime()) <= 5000, true);
};

describe({
  name: 'db.addCharacter()',
  // WORKAROUND fails to clean up properly in github ci
  // causing an error unrelated to test results
  sanitizeExit: false,
  sanitizeResources: false,
  sanitizeOps: false,
  fn: () => {
    beforeEach(async () => {
      mongod = await MongoMemoryReplSet.create();
      client = new Mongo(mongod.getUri());
      config.mongoUri = mongod.getUri();
    });

    afterEach(async () => {
      delete config.mongoUri;
      await client.close();
      await mongod.stop();
    });

    it('normal pull', async () => {
      await db.addCharacter({
        rating: 3,
        mediaId: 'media-id',
        userId: 'user-id',
        guildId: 'guild-id',
        characterId: 'character-id',
        guaranteed: false,
        mongo: client,
      });

      const character = await client.characters().findOne({
        userId: 'user-id',
        guildId: 'guild-id',
        characterId: 'character-id',
      });

      const inventory = await client.inventories().findOne({
        userId: 'user-id',
        guildId: 'guild-id',
      });

      assertEquals(Object.keys(character!), [
        '_id',
        'createdAt',
        'inventoryId',
        'characterId',
        'guildId',
        'userId',
        'mediaId',
        'rating',
        'combat',
      ]);

      assertEquals(objectIdRegex.test(character!._id.toHexString()), true);

      assertWithinLast5secs(character!.createdAt);

      assertObjectMatch(character!, {
        rating: 3,
        userId: 'user-id',
        guildId: 'guild-id',
        characterId: 'character-id',
        mediaId: 'media-id',
      });

      assertWithinLast5secs(inventory!.lastPull!);
      assertWithinLast5secs(inventory!.rechargeTimestamp!);

      assertEquals(inventory!.availablePulls, 9);
    });

    it.only('duped pull (disallowed)', async () => {
      await client.characters().insertOne({
        userId: 'user-id',
        guildId: 'guild-id',
        characterId: 'character-id',
      } as any);

      console.log(await client.characters().find({}).toArray());

      await assertRejects(
        () =>
          db.addCharacter({
            rating: 3,
            mediaId: 'media-id',
            userId: 'user-id',
            guildId: 'guild-id',
            characterId: 'character-id',
            guaranteed: false,
            mongo: client,
          }),
        DupeError,
        'DUPLICATED',
      );
    });

    it('with sacrifices', async () => {
      const { insertedId } = await client.characters().insertOne({} as any);

      await db.addCharacter({
        rating: 3,
        mediaId: 'media-id',
        userId: 'user-id',
        guildId: 'guild-id',
        characterId: 'character-id',
        guaranteed: false,
        sacrifices: [insertedId],
        mongo: client,
      });

      const character = await client.characters().findOne({
        userId: 'user-id',
        guildId: 'guild-id',
        characterId: 'character-id',
      });

      const sacrificedCharacter = await client.characters().findOne({
        _id: insertedId,
      });

      assertEquals(sacrificedCharacter, null);

      const inventory = await client.inventories().findOne({
        userId: 'user-id',
        guildId: 'guild-id',
      });

      assertEquals(Object.keys(character!), [
        '_id',
        'createdAt',
        'inventoryId',
        'characterId',
        'guildId',
        'userId',
        'mediaId',
        'rating',
        'combat',
      ]);

      assertEquals(objectIdRegex.test(character!._id.toHexString()), true);

      assertWithinLast5secs(character!.createdAt);

      assertObjectMatch(character!, {
        rating: 3,
        userId: 'user-id',
        guildId: 'guild-id',
        characterId: 'character-id',
        mediaId: 'media-id',
      });

      assertWithinLast5secs(inventory!.lastPull!);
      assertEquals(inventory!.availablePulls, 10);
    });

    it('with sacrifices (failed)', async () => {
      await assertRejects(() =>
        db.addCharacter({
          rating: 3,
          mediaId: 'media-id',
          userId: 'user-id',
          guildId: 'guild-id',
          characterId: 'character-id',
          guaranteed: false,
          sacrifices: [new ObjectId()],
          mongo: client,
        })
      ),
        NonFetalError,
        'Failed';
    });

    it('guaranteed pull', async () => {
      await client.users().insertOne({
        discordId: 'user-id',
        guarantees: [2, 3, 5],
        availableTokens: 0,
        dailyTimestamp: new Date(),
        likes: [],
      });

      await db.addCharacter({
        rating: 3,
        mediaId: 'media-id',
        userId: 'user-id',
        guildId: 'guild-id',
        characterId: 'character-id',
        guaranteed: true,
        mongo: client,
      });

      const character = await client.characters().findOne({
        userId: 'user-id',
        guildId: 'guild-id',
        characterId: 'character-id',
      });

      const inventory = await client.inventories().findOne({
        userId: 'user-id',
        guildId: 'guild-id',
      });

      const user = await client.users().findOne({
        discordId: 'user-id',
      } as any);

      assertEquals(Object.keys(character!), [
        '_id',
        'createdAt',
        'inventoryId',
        'characterId',
        'guildId',
        'userId',
        'mediaId',
        'rating',
        'combat',
      ]);

      assertEquals(objectIdRegex.test(character!._id.toHexString()), true);

      assertWithinLast5secs(character!.createdAt);

      assertObjectMatch(character!, {
        rating: 3,
        userId: 'user-id',
        guildId: 'guild-id',
        characterId: 'character-id',
        mediaId: 'media-id',
      });

      assertWithinLast5secs(inventory!.lastPull!);

      assertEquals(inventory!.availablePulls, 10);

      assertEquals(user!.guarantees, [2, 5]);
    });

    it('guaranteed pull (not available)', async () => {
      await assertRejects(
        () => {
          return db.addCharacter({
            rating: 3,
            mediaId: 'media-id',
            userId: 'user-id',
            guildId: 'guild-id',
            characterId: 'character-id',
            guaranteed: true,
            mongo: client,
          });
        },
        Error,
        '403',
      );
    });
  },
});
