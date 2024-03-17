// deno-lint-ignore-file no-explicit-any

import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { afterEach, beforeEach, describe, it } from '$std/testing/bdd.ts';
import { assertEquals } from '$std/assert/mod.ts';

import db from '~/db/mod.ts';

let mongod: MongoMemoryServer;

describe('db.getPopularPacks()', () => {
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
    const { insertedId: pack1InsertedId } = await db.packs().insertOne({
      hidden: false,
      manifest: { id: 'pack-id' },
    } as any);

    const { insertedId: pack2InsertedId } = await db.packs().insertOne({
      hidden: false,
      manifest: { id: 'pack-2' },
    } as any);

    await db.guilds().insertOne({
      discordId: 'guild-1',
      packIds: ['pack-id', 'pack-2'],
    } as any);

    await db.guilds().insertOne({
      discordId: 'guild-2',
      packIds: ['pack-2'],
    } as any);

    const packs = await db.getPopularPacks();

    assertEquals(packs, [
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
    const { insertedId: pack1InsertedId } = await db.packs().insertOne({
      hidden: false,
      manifest: { id: 'pack-id' },
    } as any);

    const { insertedId: _pack2InsertedId } = await db.packs().insertOne({
      hidden: true,
      manifest: { id: 'pack-2' },
    } as any);

    await db.guilds().insertOne({
      discordId: 'guild-1',
      packIds: ['pack-id', 'pack-2'],
    } as any);

    await db.guilds().insertOne({
      discordId: 'guild-2',
      packIds: ['pack-2'],
    } as any);

    const packs = await db.getPopularPacks();

    assertEquals(packs, [
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
    const { insertedId: pack1InsertedId } = await db.packs().insertOne({
      hidden: false,
      manifest: { id: 'pack-id' },
    } as any);

    const { insertedId: _pack2InsertedId } = await db.packs().insertOne({
      hidden: false,
      manifest: { private: true, id: 'pack-2' },
    } as any);

    await db.guilds().insertOne({
      discordId: 'guild-1',
      packIds: ['pack-id', 'pack-2'],
    } as any);

    await db.guilds().insertOne({
      discordId: 'guild-2',
      packIds: ['pack-2'],
    } as any);

    const packs = await db.getPopularPacks();

    assertEquals(packs, [
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
    const { insertedId: pack1InsertedId } = await db.packs().insertOne({
      hidden: false,
      manifest: { id: 'pack-id' },
    } as any);

    const { insertedId: _pack2InsertedId } = await db.packs().insertOne({
      hidden: false,
      manifest: { nsfw: true, id: 'pack-2' },
    } as any);

    await db.guilds().insertOne({
      discordId: 'guild-1',
      packIds: ['pack-id', 'pack-2'],
    } as any);

    await db.guilds().insertOne({
      discordId: 'guild-2',
      packIds: ['pack-2'],
    } as any);

    const packs = await db.getPopularPacks();

    assertEquals(packs, [
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

    db.client = await new MongoClient(mongod.getUri())
      .connect();
  });

  afterEach(async () => {
    await db.client.close();
    await mongod.stop();
  });

  it('returns packs by owner Id', async () => {
    const { insertedId: pack1InsertedId } = await db.packs().insertOne({
      owner: 'maintainer-id',
      manifest: { id: 'pack-1' },
    } as any);

    const { insertedId: pack2InsertedId } = await db.packs().insertOne({
      owner: 'maintainer-id',
      manifest: { id: 'pack-2' },
    } as any);

    const { insertedId: _pack3InsertedId } = await db.packs().insertOne({
      owner: 'maintainer-2',
      manifest: { id: 'pack-3' },
    } as any);

    const packs = await db.getPacksByMaintainerId('maintainer-id');

    assertEquals(packs, [
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
    const { insertedId: pack1InsertedId } = await db.packs().insertOne({
      manifest: { id: 'pack-1', maintainers: ['maintainer-id'] },
    } as any);

    const { insertedId: pack2InsertedId } = await db.packs().insertOne({
      manifest: { id: 'pack-2', maintainers: ['maintainer-id'] },
    } as any);

    const { insertedId: _pack3InsertedId } = await db.packs().insertOne({
      manifest: { id: 'pack-3', maintainers: ['maintainer-2'] },
    } as any);

    const packs = await db.getPacksByMaintainerId('maintainer-id');

    assertEquals(packs, [
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
    const { insertedId: pack1InsertedId } = await db.packs().insertOne({
      owner: 'maintainer-id',
      manifest: { id: 'pack-1', maintainers: [] },
    } as any);

    const { insertedId: pack2InsertedId } = await db.packs().insertOne({
      manifest: { id: 'pack-2', maintainers: ['maintainer-id'] },
    } as any);

    const { insertedId: _pack3InsertedId } = await db.packs().insertOne({
      owner: 'maintainer-2',
      manifest: { id: 'pack-3', maintainers: ['maintainer-3'] },
    } as any);

    const packs = await db.getPacksByMaintainerId('maintainer-id');

    assertEquals(packs, [
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

    db.client = await new MongoClient(mongod.getUri())
      .connect();
  });

  afterEach(async () => {
    await db.client.close();
    await mongod.stop();
  });

  it('normal', async () => {
    const { insertedId } = await db.packs().insertOne({
      owner: 'maintainer-id',
      manifest: { id: 'pack-id' },
    } as any);

    const pack = await db.getPack('pack-id');

    assertEquals(pack, {
      _id: insertedId,
      owner: 'maintainer-id',
      manifest: { id: 'pack-id' },
    } as any);
  });

  it('private (not owned)', async () => {
    await db.packs().insertOne({
      owner: 'maintainer-id',
      manifest: {
        private: true,
        id: 'pack-id',
      },
    } as any);

    const pack = await db.getPack('pack-id');

    assertEquals(pack, null);
  });

  it('private (owned)', async () => {
    const { insertedId } = await db.packs().insertOne({
      owner: 'maintainer-id',
      manifest: {
        private: true,
        id: 'pack-id',
      },
    } as any);

    const pack = await db.getPack('pack-id', 'maintainer-id');

    assertEquals(pack, {
      _id: insertedId,
      owner: 'maintainer-id',
      manifest: { private: true, id: 'pack-id' },
    } as any);
  });

  it('private (maintainer)', async () => {
    const { insertedId } = await db.packs().insertOne({
      owner: 'maintainer-2',
      manifest: {
        private: true,
        id: 'pack-id',
        maintainers: ['maintainer-id'],
      },
    } as any);

    const pack = await db.getPack('pack-id', 'maintainer-id');

    assertEquals(pack, {
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
