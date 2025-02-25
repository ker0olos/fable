/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import db, { Mongo } from '~/db/index.ts';
import config from '~/src/config.ts';

let mongod: MongoMemoryServer;
let client: Mongo;

describe('db.getPopularPacks()', () => {
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
    const { insertedId: pack1InsertedId } = await client.packs().insertOne({
      hidden: false,
      manifest: { id: 'pack-id' },
    } as any);

    const { insertedId: pack2InsertedId } = await client.packs().insertOne({
      hidden: false,
      manifest: { id: 'pack-2' },
    } as any);

    await client.guilds().insertOne({
      discordId: 'guild-1',
      packIds: ['pack-id', 'pack-2'],
    } as any);

    await client.guilds().insertOne({
      discordId: 'guild-2',
      packIds: ['pack-2'],
    } as any);

    const packs = await db.getPopularPacks();

    expect(packs).toEqual([
      {
        servers: 2,
        pack: {
          _id: pack2InsertedId,
          hidden: false,
          manifest: { id: 'pack-2' },
        } as any,
      },
      {
        servers: 1,
        pack: {
          _id: pack1InsertedId,
          hidden: false,
          manifest: { id: 'pack-id' },
        } as any,
      },
    ]);
  });

  it('filter out hidden', async () => {
    const { insertedId: pack1InsertedId } = await client.packs().insertOne({
      hidden: false,
      manifest: { id: 'pack-id' },
    } as any);

    await client.packs().insertOne({
      hidden: true,
      manifest: { id: 'pack-2' },
    } as any);

    await client.guilds().insertOne({
      discordId: 'guild-1',
      packIds: ['pack-id', 'pack-2'],
    } as any);

    await client.guilds().insertOne({
      discordId: 'guild-2',
      packIds: ['pack-2'],
    } as any);

    const packs = await db.getPopularPacks();

    expect(packs).toEqual([
      {
        servers: 1,
        pack: {
          _id: pack1InsertedId,
          hidden: false,
          manifest: { id: 'pack-id' },
        } as any,
      },
    ]);
  });

  it('filter out private', async () => {
    const { insertedId: pack1InsertedId } = await client.packs().insertOne({
      hidden: false,
      manifest: { id: 'pack-id' },
    } as any);

    await client.packs().insertOne({
      hidden: false,
      manifest: { private: true, id: 'pack-2' },
    } as any);

    await client.guilds().insertOne({
      discordId: 'guild-1',
      packIds: ['pack-id', 'pack-2'],
    } as any);

    await client.guilds().insertOne({
      discordId: 'guild-2',
      packIds: ['pack-2'],
    } as any);

    const packs = await db.getPopularPacks();

    expect(packs).toEqual([
      {
        servers: 1,
        pack: {
          _id: pack1InsertedId,
          hidden: false,
          manifest: { id: 'pack-id' },
        } as any,
      },
    ]);
  });

  it('filter out nsfw', async () => {
    const { insertedId: pack1InsertedId } = await client.packs().insertOne({
      hidden: false,
      manifest: { id: 'pack-id' },
    } as any);

    await client.packs().insertOne({
      hidden: false,
      manifest: { nsfw: true, id: 'pack-2' },
    } as any);

    await client.guilds().insertOne({
      discordId: 'guild-1',
      packIds: ['pack-id', 'pack-2'],
    } as any);

    await client.guilds().insertOne({
      discordId: 'guild-2',
      packIds: ['pack-2'],
    } as any);

    const packs = await db.getPopularPacks();

    expect(packs).toEqual([
      {
        servers: 1,
        pack: {
          _id: pack1InsertedId,
          hidden: false,
          manifest: { id: 'pack-id' },
        } as any,
      },
    ]);
  });
});

describe('db.getPacksByMaintainerId()', () => {
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

  it('returns packs by owner Id', async () => {
    const { insertedId: pack1InsertedId } = await client.packs().insertOne({
      owner: 'maintainer-id',
      manifest: { id: 'pack-1' },
    } as any);

    const { insertedId: pack2InsertedId } = await client.packs().insertOne({
      owner: 'maintainer-id',
      manifest: { id: 'pack-2' },
    } as any);

    await client.packs().insertOne({
      owner: 'maintainer-2',
      manifest: { id: 'pack-3' },
    } as any);

    const packs = await db.getPacksByMaintainerId('maintainer-id');

    expect(packs).toEqual([
      {
        _id: pack1InsertedId,
        owner: 'maintainer-id',
        manifest: { id: 'pack-1' },
      },
      {
        _id: pack2InsertedId,
        owner: 'maintainer-id',
        manifest: { id: 'pack-2' },
      },
    ] as any);
  });

  it('returns packs by maintainer Id', async () => {
    const { insertedId: pack1InsertedId } = await client.packs().insertOne({
      manifest: { id: 'pack-1', maintainers: ['maintainer-id'] },
    } as any);

    const { insertedId: pack2InsertedId } = await client.packs().insertOne({
      manifest: { id: 'pack-2', maintainers: ['maintainer-id'] },
    } as any);

    await client.packs().insertOne({
      manifest: { id: 'pack-3', maintainers: ['maintainer-2'] },
    } as any);

    const packs = await db.getPacksByMaintainerId('maintainer-id');

    expect(packs).toEqual([
      {
        _id: pack1InsertedId,
        manifest: { id: 'pack-1', maintainers: ['maintainer-id'] },
      },
      {
        _id: pack2InsertedId,
        manifest: { id: 'pack-2', maintainers: ['maintainer-id'] },
      },
    ] as any);
  });

  it('returns packs by maintainer & owner Id', async () => {
    const { insertedId: pack1InsertedId } = await client.packs().insertOne({
      owner: 'maintainer-id',
      manifest: { id: 'pack-1', maintainers: [] },
    } as any);

    const { insertedId: pack2InsertedId } = await client.packs().insertOne({
      manifest: { id: 'pack-2', maintainers: ['maintainer-id'] },
    } as any);

    await client.packs().insertOne({
      owner: 'maintainer-2',
      manifest: { id: 'pack-3', maintainers: ['maintainer-3'] },
    } as any);

    const packs = await db.getPacksByMaintainerId('maintainer-id');

    expect(packs).toEqual([
      {
        _id: pack1InsertedId,
        owner: 'maintainer-id',
        manifest: { id: 'pack-1', maintainers: [] },
      },
      {
        _id: pack2InsertedId,
        manifest: { id: 'pack-2', maintainers: ['maintainer-id'] },
      },
    ] as any);
  });
});

describe('db.getPack()', () => {
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
    const { insertedId } = await client.packs().insertOne({
      owner: 'maintainer-id',
      manifest: { id: 'pack-id' },
    } as any);

    const pack = await db.getPack('pack-id');

    expect(pack).toEqual({
      _id: insertedId,
      owner: 'maintainer-id',
      manifest: { id: 'pack-id' },
    } as any);
  });

  it('private (not owned)', async () => {
    await client.packs().insertOne({
      owner: 'maintainer-id',
      manifest: {
        private: true,
        id: 'pack-id',
      },
    } as any);

    const pack = await db.getPack('pack-id');

    expect(pack).toBeNull();
  });

  it('private (owned)', async () => {
    const { insertedId } = await client.packs().insertOne({
      owner: 'maintainer-id',
      manifest: {
        private: true,
        id: 'pack-id',
      },
    } as any);

    const pack = await db.getPack('pack-id', 'maintainer-id');

    expect(pack).toEqual({
      _id: insertedId,
      owner: 'maintainer-id',
      manifest: { private: true, id: 'pack-id' },
    } as any);
  });

  it('private (maintainer)', async () => {
    const { insertedId } = await client.packs().insertOne({
      owner: 'maintainer-2',
      manifest: {
        private: true,
        id: 'pack-id',
        maintainers: ['maintainer-id'],
      },
    } as any);

    const pack = await db.getPack('pack-id', 'maintainer-id');

    expect(pack).toEqual({
      _id: insertedId,
      owner: 'maintainer-2',
      manifest: {
        private: true,
        id: 'pack-id',
        maintainers: ['maintainer-id'],
      },
    } as any);
  });
});
