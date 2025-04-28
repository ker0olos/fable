/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import db, { Mongo } from '~/db/index.ts';
import packs from '~/src/packs.ts';

import config from '~/src/config.ts';

import type { Manifest } from '~/src/types.ts';

let mongod: MongoMemoryServer;
let client: Mongo;

describe.skip('db.charactersPool()', () => {
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
    const manifest: Manifest = { id: 'pack-id' };

    vi.spyOn(packs, 'all').mockReturnValue(
      Promise.resolve([{ manifest } as any])
    );

    const { insertedId } = await client.packCharacters().insertOne({
      rating: 1,
      packId: 'pack-id',
      id: 'character-id',
    } as any);

    await client.packCharacters().insertOne({
      rating: 2,
      packId: 'pack-id',
      id: 'another-character-id',
    } as any);

    const pool = await db.ratingPool({
      guildId: 'guild-id',
      rating: 1,
    });

    expect(pool).toEqual([
      {
        _id: insertedId,
        id: 'character-id',
        packId: 'pack-id',
        rating: 1,
      },
    ]);
  });
});

describe('db.likesPool()', () => {
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

  it('character', async () => {
    const manifest: Manifest = { id: 'pack-id' };

    vi.spyOn(packs, 'all').mockReturnValue(
      Promise.resolve([{ manifest } as any])
    );

    const { insertedId } = await client.packCharacters().insertOne({
      rating: 1,
      packId: 'pack-id',
      id: 'character-id',
    } as any);

    const pool = await db.likesPool({
      guildId: 'guild-id',
      characterIds: ['pack-id:character-id'],
      mediaIds: [],
    });

    expect(pool).toEqual([
      {
        _id: insertedId,
        id: 'character-id',
        packId: 'pack-id',
        rating: 1,
      },
    ]);
  });
});
