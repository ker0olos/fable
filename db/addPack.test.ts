/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoMemoryReplSet, MongoMemoryServer } from 'mongodb-memory-server';
import { describe, it, beforeEach, afterEach, expect } from 'vitest';

import db, { Mongo } from '~/db/index.ts';
import config from '~/src/config.ts';

let mongod: MongoMemoryServer | MongoMemoryReplSet;
let client: Mongo;

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const assertWithinLast5secs = (ts: Date) => {
  expect(Math.abs(Date.now() - ts.getTime()) <= 5000).toBe(true);
};

describe('db.addPack()', () => {
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

  it('install public on new guild', async () => {
    await client.packs().insertOne({
      owner: 'user-id',
      manifest: {
        id: 'pack-id',
      },
    } as any);

    const pack = await db.addPack('user-id', 'guild-id', 'pack-id');

    const guild = await client.guilds().findOne({
      discordId: 'guild-id',
    });

    expect(objectIdRegex.test(guild!._id.toHexString())).toBe(true);

    expect(pack!.manifest.id).toBe('pack-id');

    expect(guild!.packIds).toEqual(['pack-id']);
  });

  it('install public on existing guild', async () => {
    const { insertedId: guildInsertedId } = await client.guilds().insertOne({
      discordId: 'guild-id',
      packIds: ['old-pack-id'],
    } as any);

    await client.packs().insertOne({
      owner: 'user-id',
      manifest: {
        id: 'pack-id',
      },
    } as any);

    const pack = await db.addPack('user-id', 'guild-id', 'pack-id');

    const guild = await client.guilds().findOne({
      _id: guildInsertedId,
    });

    expect(pack!.manifest.id).toBe('pack-id');

    expect(guild!.packIds).toEqual(['old-pack-id', 'pack-id']);
  });

  it('install private (owned)', async () => {
    await client.packs().insertOne({
      owner: 'user-id',
      manifest: {
        id: 'pack-id',
        private: true,
      },
    } as any);

    const pack = await db.addPack('user-id', 'guild-id', 'pack-id');

    const guild = await client.guilds().findOne({
      discordId: 'guild-id',
    });

    expect(objectIdRegex.test(guild!._id.toHexString())).toBe(true);

    expect(pack!.manifest.id).toBe('pack-id');

    expect(guild!.packIds).toEqual(['pack-id']);
  });

  it('install private (maintained)', async () => {
    await client.packs().insertOne({
      owner: 'another-user-id',
      manifest: {
        id: 'pack-id',
        private: true,
        maintainers: ['user-id'],
      },
    } as any);

    const pack = await db.addPack('user-id', 'guild-id', 'pack-id');

    const guild = await client.guilds().findOne({
      discordId: 'guild-id',
    });

    expect(objectIdRegex.test(guild!._id.toHexString())).toBe(true);

    expect(pack!.manifest.id).toBe('pack-id');

    expect(guild!.packIds).toEqual(['pack-id']);
  });

  it('install private (not allowed)', async () => {
    await client.packs().insertOne({
      owner: 'another-user-id',
      manifest: {
        id: 'pack-id',
        private: true,
        maintainers: ['another-extra-user'],
      },
    } as any);

    const pack = await db.addPack('user-id', 'guild-id', 'pack-id');

    const guild = await client.guilds().findOne({
      discordId: 'guild-id',
    });

    expect(pack).toBe(null);
    expect(guild).toBe(null);
  });
});

describe('db.removePack()', () => {
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
    await client.packs().insertOne({
      owner: 'user-id',
      manifest: {
        id: 'pack-1',
      },
    } as any);

    await client.packs().insertOne({
      owner: 'user-id',
      manifest: {
        id: 'pack-2',
      },
    } as any);

    const { insertedId: guildInsertedId } = await client.guilds().insertOne({
      discordId: 'guild-id',
      packIds: ['pack-1', 'pack-2'],
    } as any);

    const pack = await db.removePack('guild-id', 'pack-1');

    const guild = await client.guilds().findOne({
      _id: guildInsertedId,
    });

    expect(pack!.manifest.id).toBe('pack-1');

    expect(guild!.packIds).toEqual(['pack-2']);
  });

  it('not found', async () => {
    await client.guilds().insertOne({
      discordId: 'guild-id',
      packIds: [],
    } as any);

    const pack = await db.removePack('guild-id', 'pack-1');

    expect(pack).toBe(null);
  });
});

describe('db.publishPack()', () => {
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

  it('publish new pack', async () => {
    await db.publishPack('user-id', { id: 'pack-id' } as any);

    const pack = await client.packs().findOne({ 'manifest.id': 'pack-id' });

    expect(objectIdRegex.test(pack!._id.toHexString())).toBe(true);

    expect(Object.keys(pack!)).toEqual([
      '_id',
      'manifest',
      'approved',
      'createdAt',
      'hidden',
      'owner',
      'updatedAt',
    ]);

    assertWithinLast5secs(pack!.createdAt);
    assertWithinLast5secs(pack!.updatedAt);

    expect(pack).toMatchObject({
      approved: false,
      hidden: false,
      owner: 'user-id',
      manifest: {
        id: 'pack-id',
      },
    });
  });

  it('update existing pack (owner)', async () => {
    const { insertedId } = await client.packs().insertOne({
      owner: 'user-id',
      createdAt: new Date('1999-1-1'),
      updatedAt: new Date('1999-1-1'),
      manifest: { id: 'pack-id', title: 'old' },
    } as any);

    await db.publishPack('user-id', { id: 'pack-id', title: 'new' } as any);

    const pack = await client.packs().findOne({ 'manifest.id': 'pack-id' });

    assertWithinLast5secs(pack!.updatedAt);

    expect(pack).toMatchObject({
      _id: insertedId,
      owner: 'user-id',
      manifest: {
        title: 'new',
        id: 'pack-id',
      },
    });
  });

  it('update existing pack (maintainer)', async () => {
    const { insertedId } = await client.packs().insertOne({
      owner: 'another-user-id',
      createdAt: new Date('1999-1-1'),
      updatedAt: new Date('1999-1-1'),
      manifest: { id: 'pack-id', title: 'old', maintainers: ['user-id'] },
    } as any);

    await db.publishPack('user-id', { id: 'pack-id', title: 'new' } as any);

    const pack = await client.packs().findOne({ 'manifest.id': 'pack-id' });

    assertWithinLast5secs(pack!.updatedAt);

    expect(pack).toMatchObject({
      _id: insertedId,
      owner: 'another-user-id',
      manifest: {
        title: 'new',
        id: 'pack-id',
      },
    });
  });

  it('update existing pack (no permission)', async () => {
    const { insertedId } = await client.packs().insertOne({
      owner: 'another-user-id',
      createdAt: new Date('1999-1-1'),
      updatedAt: new Date('1999-1-1'),
      manifest: { id: 'pack-id', title: 'old' },
    } as any);

    await db.publishPack('user-id', { id: 'pack-id', title: 'new' } as any);

    const pack = await client.packs().findOne({ 'manifest.id': 'pack-id' });

    expect(pack!.updatedAt).toEqual(new Date('1999-1-1'));

    expect(pack).toMatchObject({
      _id: insertedId,
      owner: 'another-user-id',
      manifest: {
        title: 'old',
        id: 'pack-id',
      },
    });
  });
});
