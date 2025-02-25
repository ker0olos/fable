/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectId } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { describe, it, beforeEach, afterEach, expect } from 'vitest';

import db, { Mongo } from '~/db/index.ts';

import { experienceToNextLevel } from '~/db/gainExp.ts';
import config from '~/src/config.ts';

let mongod: MongoMemoryReplSet;
let client: Mongo;

const assertWithinLast5secs = (ts: Date) => {
  expect(Math.abs(Date.now() - ts.getTime()) <= 5000).toBe(true);
};

it('experience to next level', () => {
  expect(experienceToNextLevel(1)).toBe(10);
  expect(experienceToNextLevel(2)).toBe(20);
  expect(experienceToNextLevel(10)).toBe(100);
  expect(experienceToNextLevel(20)).toBe(200);
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
      1
    );

    expect(updatedCharacter.curStats?.attack).toBe(1);
    expect(updatedCharacter.curStats?.defense).toBe(0);
    expect(updatedCharacter.curStats?.speed).toBe(0);
    expect(updatedCharacter.curStats?.hp).toBe(15);
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
      1
    );

    expect(updatedCharacter.curStats?.attack).toBe(0);
    expect(updatedCharacter.curStats?.defense).toBe(1);
    expect(updatedCharacter.curStats?.speed).toBe(0);
    expect(updatedCharacter.curStats?.hp).toBe(15);
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
      1
    );

    expect(updatedCharacter.curStats?.attack).toBe(0);
    expect(updatedCharacter.curStats?.defense).toBe(0);
    expect(updatedCharacter.curStats?.speed).toBe(1);
    expect(updatedCharacter.curStats?.hp).toBe(15);
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
      1
    );

    expect(updatedCharacter.curStats?.attack).toBe(0);
    expect(updatedCharacter.curStats?.defense).toBe(0);
    expect(updatedCharacter.curStats?.speed).toBe(1);
    expect(updatedCharacter.curStats?.hp).toBe(15);
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
      4
    );

    expect(updatedCharacter.curStats?.attack).toBe(17);
    expect(updatedCharacter.curStats?.defense).toBe(17);
    expect(updatedCharacter.curStats?.speed).toBe(16);
    expect(updatedCharacter.curStats?.hp).toBe(45);
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
        1
      );

      expect(updatedCharacter.curStats?.attack).toBe(1);
      expect(updatedCharacter.curStats?.defense).toBe(0);
      expect(updatedCharacter.curStats?.speed).toBe(0);
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
        1
      );

      expect(updatedCharacter.curStats?.attack).toBe(1);
      expect(updatedCharacter.curStats?.defense).toBe(1);
      expect(updatedCharacter.curStats?.speed).toBe(0);
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
        1
      );

      expect(updatedCharacter.curStats?.attack).toBe(1);
      expect(updatedCharacter.curStats?.defense).toBe(1);
      expect(updatedCharacter.curStats?.speed).toBe(1);
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
        1
      );

      expect(updatedCharacter.curStats?.attack).toBe(2);
      expect(updatedCharacter.curStats?.defense).toBe(1);
      expect(updatedCharacter.curStats?.speed).toBe(1);
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
        1
      );

      expect(updatedCharacter.curStats?.attack).toBe(1);
      expect(updatedCharacter.curStats?.defense).toBe(0);
      expect(updatedCharacter.curStats?.speed).toBe(0);
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
        1
      );

      expect(updatedCharacter.curStats?.attack).toBe(2);
      expect(updatedCharacter.curStats?.defense).toBe(0);
      expect(updatedCharacter.curStats?.speed).toBe(0);
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
        1
      );

      expect(updatedCharacter.curStats?.attack).toBe(3);
      expect(updatedCharacter.curStats?.defense).toBe(0);
      expect(updatedCharacter.curStats?.speed).toBe(0);
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
        1
      );

      expect(updatedCharacter.curStats?.attack).toBe(4);
      expect(updatedCharacter.curStats?.defense).toBe(0);
      expect(updatedCharacter.curStats?.speed).toBe(0);
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

    const status = await db.gainExp('user-id', 'guild-id', 2, [insertedId], 1);

    const inventory = await client.inventories().findOne({ _id: inventoryId });
    const character = await client.characters().findOne({ _id: insertedId });

    assertWithinLast5secs(inventory!.keysTimestamp!);
    assertWithinLast5secs(inventory!.lastPVE!);

    expect(status).toEqual([
      {
        exp: 1,
        expGained: 1,
        expToLevel: 10,
        id: 'character-id',
        levelUp: 0,
        skillPoints: 0,
        statPoints: 0,
      },
    ]);

    expect(inventory).toMatchObject({
      availableKeys: 0,
      floorsCleared: 2,
    });

    expect(character).toMatchObject({
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

    const status = await db.gainExp('user-id', 'guild-id', 2, [insertedId], 10);

    const inventory = await client.inventories().findOne({ _id: inventoryId });
    const character = await client.characters().findOne({ _id: insertedId });

    assertWithinLast5secs(inventory!.keysTimestamp!);

    expect(status).toEqual([
      {
        exp: 0,
        expGained: 10,
        expToLevel: 20,
        id: 'character-id',
        levelUp: 1,
        skillPoints: 1,
        statPoints: 3,
      },
    ]);

    expect(inventory).toMatchObject({
      availableKeys: 0,
      floorsCleared: 2,
    });

    expect(character).toMatchObject({
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

    const status = await db.gainExp('user-id', 'guild-id', 2, [insertedId], 20);

    const inventory = await client.inventories().findOne({ _id: inventoryId });
    const character = await client.characters().findOne({ _id: insertedId });

    assertWithinLast5secs(inventory!.keysTimestamp!);

    expect(status).toEqual([
      {
        exp: 10,
        expGained: 20,
        expToLevel: 20,
        id: 'character-id',
        levelUp: 1,
        skillPoints: 1,
        statPoints: 3,
      },
    ]);

    expect(inventory).toMatchObject({
      availableKeys: 0,
      floorsCleared: 2,
    });

    expect(character).toMatchObject({
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

    const status = await db.gainExp('user-id', 'guild-id', 2, [insertedId], 30);

    const inventory = await client.inventories().findOne({ _id: inventoryId });
    const character = await client.characters().findOne({ _id: insertedId });

    assertWithinLast5secs(inventory!.keysTimestamp!);

    expect(status).toEqual([
      {
        exp: 0,
        expGained: 30,
        expToLevel: 30,
        id: 'character-id',
        levelUp: 2,
        skillPoints: 2,
        statPoints: 6,
      },
    ]);

    expect(inventory).toMatchObject({
      availableKeys: 0,
      floorsCleared: 2,
    });

    expect(character).toMatchObject({
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
    await client.inventories().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      availableKeys: 0,
      floorsCleared: 1,
    } as any);

    await expect(
      db.gainExp('user-id', 'guild-id', 2, [new ObjectId()], 1)
    ).rejects.toThrow();
  });

  it('not found (edge-case since object ids are used in query)', async () => {
    await client.inventories().insertOne({
      userId: 'user-id',
      guildId: 'guild-id',
      availableKeys: 1,
      floorsCleared: 1,
    } as any);

    await expect(
      db.gainExp('user-id', 'guild-id', 2, [new ObjectId()], 1)
    ).rejects.toThrow();
  });
});
