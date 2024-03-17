// deno-lint-ignore-file no-explicit-any no-non-null-assertion

import { MongoClient } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

import { afterEach, beforeEach, describe, it } from '$std/testing/bdd.ts';
import {
  assertEquals,
  assertObjectMatch,
  assertRejects,
} from '$std/assert/mod.ts';

import db from '~/db/mod.ts';

let mongod: MongoMemoryReplSet;

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const assertWithinLast5secs = (ts: Date) => {
  assertEquals(Math.abs(Date.now() - ts.getTime()) <= 5000, true);
};

describe('db.addCharacter()', () => {
  beforeEach(async () => {
    mongod = await MongoMemoryReplSet.create({
      replSet: { storageEngine: 'ephemeralForTest' },
    });

    db.client = await new MongoClient(mongod.getUri())
      .connect();
  });

  afterEach(async () => {
    await db.client.close();
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
    });

    const character = await db.characters().findOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
    });

    const inventory = await db.inventories().findOne({
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

  // it('guaranteed pull', async () => {
  //   await db.users().insertOne({
  //     discordId: 'user-id',
  //     guarantees: [2, 3, 5],
  //     availableTokens: 0,
  //     dailyTimestamp: new Date(),
  //     likes: [],
  //   });

  //   await db.addCharacter({
  //     rating: 3,
  //     mediaId: 'media-id',
  //     userId: 'user-id',
  //     guildId: 'guild-id',
  //     characterId: 'character-id',
  //     guaranteed: true,
  //   });

  //   const character = await db.characters().findOne({
  //     userId: 'user-id',
  //     guildId: 'guild-id',
  //     characterId: 'character-id',
  //   });

  //   const inventory = await db.inventories().findOne({
  //     userId: 'user-id',
  //     guildId: 'guild-id',
  //   });

  //   const user = await db.users().findOne({
  //     discordId: 'user-id',
  //   } as any);

  //   assertEquals(Object.keys(character!), [
  //     '_id',
  //     'createdAt',
  //     'inventoryId',
  //     'characterId',
  //     'guildId',
  //     'userId',
  //     'mediaId',
  //     'rating',
  //     'combat',
  //   ]);

  //   assertEquals(objectIdRegex.test(character!._id.toHexString()), true);

  //   assertWithinLast5secs(character!.createdAt);

  //   assertObjectMatch(character!, {
  //     rating: 3,
  //     userId: 'user-id',
  //     guildId: 'guild-id',
  //     characterId: 'character-id',
  //     mediaId: 'media-id',
  //   });

  //   assertWithinLast5secs(inventory!.lastPull!);

  //   assertEquals(inventory!.availablePulls, 10);

  //   assertEquals(user!.guarantees, [2, 5]);
  // });

  // it('guaranteed pull (not available)', async () => {
  //   await assertRejects(
  //     () => {
  //       return db.addCharacter({
  //         rating: 3,
  //         mediaId: 'media-id',
  //         userId: 'user-id',
  //         guildId: 'guild-id',
  //         characterId: 'character-id',
  //         guaranteed: true,
  //       });
  //     },
  //     Error,
  //     '403',
  //   );
  // });
});
