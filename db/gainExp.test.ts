// deno-lint-ignore-file

import { ObjectId } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

import { afterEach, beforeEach, describe, it } from '$std/testing/bdd.ts';
import {
  assertEquals,
  assertObjectMatch,
  assertRejects,
} from '$std/assert/mod.ts';

import db, { Mongo } from '~/db/mod.ts';

import { experienceToNextLevel } from '~/db/gainExp.ts';
import config from '~/src/config.ts';

let mongod: MongoMemoryReplSet;
let client: Mongo;

const assertWithinLast5secs = (ts: Date) => {
  assertEquals(Math.abs(Date.now() - ts.getTime()) <= 5000, true);
};

it('experience to next level', () => {
  assertEquals(experienceToNextLevel(1), 10);
  assertEquals(experienceToNextLevel(2), 20);
  assertEquals(experienceToNextLevel(10), 100);
  assertEquals(experienceToNextLevel(20), 200);
});

describe('distribute new stat points', () => {
  it('1-0-0 (add 1 new point)', () => {
    const character = {
      combat: {
        baseStats: { attack: 1, defense: 0, speed: 0, hp: 10 },
        curStats: { attack: 0, defense: 0, speed: 0, hp: 10 },
      },
    };

    const newStatPoints = 1;

    const updatedCharacter = db.distributeNewStats(
      character.combat as any,
      newStatPoints,
      1,
    );

    assertEquals(updatedCharacter.curStats?.attack, 1);
    assertEquals(updatedCharacter.curStats?.defense, 0);
    assertEquals(updatedCharacter.curStats?.speed, 0);
    assertEquals(updatedCharacter.curStats?.hp, 15);
  });

  it('0-1-0 (add 1 new point)', () => {
    const character = {
      combat: {
        baseStats: { attack: 0, defense: 1, speed: 0, hp: 10 },
        curStats: { attack: 0, defense: 0, speed: 0, hp: 10 },
      },
    };

    const newStatPoints = 1;

    const updatedCharacter = db.distributeNewStats(
      character.combat as any,
      newStatPoints,
      1,
    );

    assertEquals(updatedCharacter.curStats?.attack, 0);
    assertEquals(updatedCharacter.curStats?.defense, 1);
    assertEquals(updatedCharacter.curStats?.speed, 0);
    assertEquals(updatedCharacter.curStats?.hp, 15);
  });

  it('0-0-1 (add 1 new point)', () => {
    const character = {
      combat: {
        baseStats: { attack: 0, defense: 0, speed: 1, hp: 10 },
        curStats: { attack: 0, defense: 0, speed: 0, hp: 10 },
      },
    };

    const newStatPoints = 1;

    const updatedCharacter = db.distributeNewStats(
      character.combat as any,
      newStatPoints,
      1,
    );

    assertEquals(updatedCharacter.curStats?.attack, 0);
    assertEquals(updatedCharacter.curStats?.defense, 0);
    assertEquals(updatedCharacter.curStats?.speed, 1);
    assertEquals(updatedCharacter.curStats?.hp, 15);
  });

  it('1-1-1 (add 1 new point)', () => {
    const character = {
      combat: {
        baseStats: { attack: 1, defense: 1, speed: 1, hp: 10 },
        curStats: { attack: 0, defense: 0, speed: 0, hp: 10 },
      },
    };

    const newStatPoints = 1;

    const updatedCharacter = db.distributeNewStats(
      character.combat as any,
      newStatPoints,
      1,
    );

    assertEquals(updatedCharacter.curStats?.attack, 0);
    assertEquals(updatedCharacter.curStats?.defense, 0);
    assertEquals(updatedCharacter.curStats?.speed, 1);
    assertEquals(updatedCharacter.curStats?.hp, 15);
  });

  it('1-1-1 (add 50 new point)', () => {
    const character = {
      combat: {
        baseStats: { attack: 1, defense: 1, speed: 1, hp: 25 },
        curStats: { attack: 0, defense: 0, speed: 0, hp: 25 },
      },
    };

    const newStatPoints = 50;

    const updatedCharacter = db.distributeNewStats(
      character.combat as any,
      newStatPoints,
      4,
    );

    assertEquals(updatedCharacter.curStats?.attack, 17);
    assertEquals(updatedCharacter.curStats?.defense, 17);
    assertEquals(updatedCharacter.curStats?.speed, 16);
    assertEquals(updatedCharacter.curStats?.hp, 45);
  });

  describe('2-1-1 (from 1 to 4 points)', () => {
    it('add 1 new point', () => {
      const character = {
        combat: {
          baseStats: { attack: 2, defense: 1, speed: 1 },
          curStats: { attack: 0, defense: 0, speed: 0 },
        },
      };

      const newStatPoints = 1;

      const updatedCharacter = db.distributeNewStats(
        character.combat as any,
        newStatPoints,
        1,
      );

      assertEquals(updatedCharacter.curStats?.attack, 1);
      assertEquals(updatedCharacter.curStats?.defense, 0);
      assertEquals(updatedCharacter.curStats?.speed, 0);
    });

    it('add 2 new point', () => {
      const character = {
        combat: {
          baseStats: { attack: 2, defense: 1, speed: 1 },
          curStats: { attack: 0, defense: 0, speed: 0 },
        },
      };

      const newStatPoints = 2;

      const updatedCharacter = db.distributeNewStats(
        character.combat as any,
        newStatPoints,
        1,
      );

      assertEquals(updatedCharacter.curStats?.attack, 1);
      assertEquals(updatedCharacter.curStats?.defense, 1);
      assertEquals(updatedCharacter.curStats?.speed, 0);
    });

    it('add 3 new point', () => {
      const character = {
        combat: {
          baseStats: { attack: 2, defense: 1, speed: 1 },
          curStats: { attack: 0, defense: 0, speed: 0 },
        },
      };

      const newStatPoints = 3;

      const updatedCharacter = db.distributeNewStats(
        character.combat as any,
        newStatPoints,
        1,
      );

      assertEquals(updatedCharacter.curStats?.attack, 1);
      assertEquals(updatedCharacter.curStats?.defense, 1);
      assertEquals(updatedCharacter.curStats?.speed, 1);
    });

    it('add 4 new point', () => {
      const character = {
        combat: {
          baseStats: { attack: 2, defense: 1, speed: 1 },
          curStats: { attack: 0, defense: 0, speed: 0 },
        },
      };

      const newStatPoints = 4;

      const updatedCharacter = db.distributeNewStats(
        character.combat as any,
        newStatPoints,
        1,
      );

      assertEquals(updatedCharacter.curStats?.attack, 2);
      assertEquals(updatedCharacter.curStats?.defense, 1);
      assertEquals(updatedCharacter.curStats?.speed, 1);
    });
  });

  describe('2-0-0 (from 1 to 4 points)', () => {
    it('add 1 new point', () => {
      const character = {
        combat: {
          baseStats: { attack: 2, defense: 0, speed: 0 },
          curStats: { attack: 0, defense: 0, speed: 0 },
        },
      };

      const newStatPoints = 1;

      const updatedCharacter = db.distributeNewStats(
        character.combat as any,
        newStatPoints,
        1,
      );

      assertEquals(updatedCharacter.curStats?.attack, 1);
      assertEquals(updatedCharacter.curStats?.defense, 0);
      assertEquals(updatedCharacter.curStats?.speed, 0);
    });

    it('add 2 new point', () => {
      const character = {
        combat: {
          baseStats: { attack: 2, defense: 0, speed: 0 },
          curStats: { attack: 0, defense: 0, speed: 0 },
        },
      };

      const newStatPoints = 2;

      const updatedCharacter = db.distributeNewStats(
        character.combat as any,
        newStatPoints,
        1,
      );

      assertEquals(updatedCharacter.curStats?.attack, 2);
      assertEquals(updatedCharacter.curStats?.defense, 0);
      assertEquals(updatedCharacter.curStats?.speed, 0);
    });

    it('add 3 new point', () => {
      const character = {
        combat: {
          baseStats: { attack: 2, defense: 0, speed: 0 },
          curStats: { attack: 0, defense: 0, speed: 0 },
        },
      };

      const newStatPoints = 3;

      const updatedCharacter = db.distributeNewStats(
        character.combat as any,
        newStatPoints,
        1,
      );

      assertEquals(updatedCharacter.curStats?.attack, 3);
      assertEquals(updatedCharacter.curStats?.defense, 0);
      assertEquals(updatedCharacter.curStats?.speed, 0);
    });

    it('add 4 new point', () => {
      const character = {
        combat: {
          baseStats: { attack: 2, defense: 0, speed: 0 },
          curStats: { attack: 0, defense: 0, speed: 0 },
        },
      };

      const newStatPoints = 4;

      const updatedCharacter = db.distributeNewStats(
        character.combat as any,
        newStatPoints,
        1,
      );

      assertEquals(updatedCharacter.curStats?.attack, 4);
      assertEquals(updatedCharacter.curStats?.defense, 0);
      assertEquals(updatedCharacter.curStats?.speed, 0);
    });
  });
});

describe('db.gainExp()', () => {
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

  it('gain 1 exp (no levels up)', async () => {
    const { insertedId: inventoryId } = await client.inventories().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      availableKeys: 1,
      floorsCleared: 1,
    } as any);

    const { insertedId } = await client.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
      inventoryId,
      combat: {
        exp: 0,
        level: 1,
        skillPoints: 0,
        curStats: { attack: 1, hp: 1, speed: 1, defense: 1 },
        baseStats: { attack: 1, hp: 1, speed: 1, defense: 1 },
        skills: {},
      },
    } as any);

    const status = await db.gainExp(
      'user-id',
      'guild-id',
      2,
      [insertedId],
      1,
    );

    const inventory = await client.inventories().findOne({ _id: inventoryId });
    const character = await client.characters().findOne({ _id: insertedId });

    assertWithinLast5secs(inventory!.keysTimestamp!);
    assertWithinLast5secs(inventory!.lastPVE!);

    assertEquals(status, [{
      exp: 1,
      expGained: 1,
      expToLevel: 10,
      id: 'character-id',
      levelUp: 0,
      skillPoints: 0,
      statPoints: 0,
    }]);

    assertObjectMatch(inventory!, {
      availableKeys: 0,
      floorsCleared: 2,
    });

    assertObjectMatch(character!, {
      combat: {
        exp: 1,
        level: 1,
        skillPoints: 0,
        curStats: { attack: 1, hp: 1, speed: 1, defense: 1 },
        baseStats: { attack: 1, hp: 1, speed: 1, defense: 1 },
      },
    });
  });

  it('gain 10 exp (1 level up)', async () => {
    const { insertedId: inventoryId } = await client.inventories().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      availableKeys: 10,
      floorsCleared: 1,
    } as any);

    const { insertedId } = await client.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
      inventoryId,
      combat: {
        exp: 0,
        level: 1,
        skillPoints: 0,
        curStats: { attack: 1, hp: 1, speed: 1, defense: 1 },
        baseStats: { attack: 1, hp: 1, speed: 1, defense: 1 },
        skills: {},
      },
    } as any);

    const status = await db.gainExp(
      'user-id',
      'guild-id',
      2,
      [insertedId],
      10,
    );

    const inventory = await client.inventories().findOne({ _id: inventoryId });
    const character = await client.characters().findOne({ _id: insertedId });

    assertWithinLast5secs(inventory!.keysTimestamp!);

    assertEquals(status, [{
      exp: 0,
      expGained: 10,
      expToLevel: 20,
      id: 'character-id',
      levelUp: 1,
      skillPoints: 1,
      statPoints: 3,
    }]);

    assertObjectMatch(inventory!, {
      availableKeys: 0,
      floorsCleared: 2,
    });

    assertObjectMatch(character!, {
      combat: {
        exp: 0,
        level: 2,
        skillPoints: 1,
        curStats: { attack: 2, hp: 6, speed: 2, defense: 2 },
        baseStats: { attack: 1, hp: 1, speed: 1, defense: 1 },
      },
    });
  });

  it('gain 30 exp (1 level up)', async () => {
    const { insertedId: inventoryId } = await client.inventories().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      availableKeys: 20,
      floorsCleared: 1,
    } as any);

    const { insertedId } = await client.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
      inventoryId,
      combat: {
        exp: 0,
        level: 1,
        skillPoints: 0,
        curStats: { attack: 1, hp: 1, speed: 1, defense: 1 },
        baseStats: { attack: 1, hp: 1, speed: 1, defense: 1 },
        skills: {},
      },
    } as any);

    const status = await db.gainExp(
      'user-id',
      'guild-id',
      2,
      [insertedId],
      20,
    );

    const inventory = await client.inventories().findOne({ _id: inventoryId });
    const character = await client.characters().findOne({ _id: insertedId });

    assertWithinLast5secs(inventory!.keysTimestamp!);

    assertEquals(status, [{
      exp: 10,
      expGained: 20,
      expToLevel: 20,
      id: 'character-id',
      levelUp: 1,
      skillPoints: 1,
      statPoints: 3,
    }]);

    assertObjectMatch(inventory!, {
      availableKeys: 0,
      floorsCleared: 2,
    });

    assertObjectMatch(character!, {
      combat: {
        exp: 10,
        level: 2,
        skillPoints: 1,
        curStats: { attack: 2, hp: 6, speed: 2, defense: 2 },
        baseStats: { attack: 1, hp: 1, speed: 1, defense: 1 },
      },
    });
  });

  it('gain 40 exp (2 level up)', async () => {
    const { insertedId: inventoryId } = await client.inventories().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      availableKeys: 30,
      floorsCleared: 1,
    } as any);

    const { insertedId } = await client.characters().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      characterId: 'character-id',
      inventoryId,
      combat: {
        exp: 0,
        level: 1,
        skillPoints: 0,
        curStats: { attack: 1, hp: 1, speed: 1, defense: 1 },
        baseStats: { attack: 1, hp: 1, speed: 1, defense: 1 },
        skills: {},
      },
    } as any);

    const status = await db.gainExp(
      'user-id',
      'guild-id',
      2,
      [insertedId],
      30,
    );

    const inventory = await client.inventories().findOne({ _id: inventoryId });
    const character = await client.characters().findOne({ _id: insertedId });

    assertWithinLast5secs(inventory!.keysTimestamp!);

    assertEquals(status, [{
      exp: 0,
      expGained: 30,
      expToLevel: 30,
      id: 'character-id',
      levelUp: 2,
      skillPoints: 2,
      statPoints: 6,
    }]);

    assertObjectMatch(inventory!, {
      availableKeys: 0,
      floorsCleared: 2,
    });

    assertObjectMatch(character!, {
      combat: {
        exp: 0,
        level: 3,
        skillPoints: 2,
        curStats: { attack: 3, hp: 11, speed: 3, defense: 3 },
        baseStats: { attack: 1, hp: 1, speed: 1, defense: 1 },
      },
    });
  });

  it('no keys', async () => {
    const { insertedId: inventoryId } = await client.inventories().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      availableKeys: 0,
      floorsCleared: 1,
    } as any);

    await assertRejects(() =>
      db.gainExp(
        'user-id',
        'guild-id',
        2,
        [new ObjectId()],
        1,
      )
    );
  });

  it('not found (edge-case since object ids are used in query)', async () => {
    const { insertedId: inventoryId } = await client.inventories().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      availableKeys: 1,
      floorsCleared: 1,
    } as any);

    await assertRejects(() =>
      db.gainExp(
        'user-id',
        'guild-id',
        2,
        [new ObjectId()],
        1,
      )
    );
  });
});
