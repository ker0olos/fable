// deno-lint-ignore-file no-explicit-any no-non-null-assertion

import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { afterEach, beforeEach, describe, it } from '$std/testing/bdd.ts';
import { assertEquals } from '$std/assert/mod.ts';

import db from '~/db/mod.ts';

let mongod: MongoMemoryServer;

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

describe('db.addPack()', () => {
  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();

    db.client = await new MongoClient(mongod.getUri())
      .connect();
  });

  afterEach(async () => {
    await db.client.close();
    await mongod.stop();
  });

  it('install public on new guild', async () => {
    await db.packs().insertOne({
      owner: 'user-id',
      manifest: {
        id: 'pack-id',
      },
    } as any);

    const pack = await db.addPack('user-id', 'guild-id', 'pack-id');

    const guild = await db.guilds().findOne({
      discordId: 'guild-id',
    });

    assertEquals(objectIdRegex.test(guild!._id.toHexString()), true);

    assertEquals(pack!.manifest.id, 'pack-id');

    assertEquals(guild!.packIds, ['pack-id']);
  });

  it('install public on existing guild', async () => {
    const { insertedId: guildInsertedId } = await db.guilds().insertOne({
      discordId: 'guild-id',
      packIds: ['old-pack-id'],
    } as any);

    await db.packs().insertOne({
      owner: 'user-id',
      manifest: {
        id: 'pack-id',
      },
    } as any);

    const pack = await db.addPack('user-id', 'guild-id', 'pack-id');

    const guild = await db.guilds().findOne({
      _id: guildInsertedId,
    });

    assertEquals(pack!.manifest.id, 'pack-id');

    assertEquals(guild!.packIds, ['old-pack-id', 'pack-id'] as any);
  });

  it('install private (owned)', async () => {
    await db.packs().insertOne({
      owner: 'user-id',
      manifest: {
        id: 'pack-id',
        private: true,
      },
    } as any);

    const pack = await db.addPack('user-id', 'guild-id', 'pack-id');

    const guild = await db.guilds().findOne({
      discordId: 'guild-id',
    });

    assertEquals(objectIdRegex.test(guild!._id.toHexString()), true);

    assertEquals(pack!.manifest.id, 'pack-id');

    assertEquals(guild!.packIds, ['pack-id']);
  });

  it('install private (maintained)', async () => {
    await db.packs().insertOne({
      owner: 'another-user-id',
      manifest: {
        id: 'pack-id',
        private: true,
        maintainers: ['user-id'],
      },
    } as any);

    const pack = await db.addPack('user-id', 'guild-id', 'pack-id');

    const guild = await db.guilds().findOne({
      discordId: 'guild-id',
    });

    assertEquals(objectIdRegex.test(guild!._id.toHexString()), true);

    assertEquals(pack!.manifest.id, 'pack-id');

    assertEquals(guild!.packIds, ['pack-id']);
  });

  it('install private (not allowed)', async () => {
    await db.packs().insertOne({
      owner: 'another-user-id',
      manifest: {
        id: 'pack-id',
        private: true,
        maintainers: ['another-extra-user'],
      },
    } as any);

    const pack = await db.addPack('user-id', 'guild-id', 'pack-id');

    const guild = await db.guilds().findOne({
      discordId: 'guild-id',
    });

    assertEquals(pack, null);
    assertEquals(guild, null);
  });
});

describe('db.removePack()', () => {
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
    await db.packs().insertOne({
      owner: 'user-id',
      manifest: {
        id: 'pack-1',
      },
    } as any);

    await db.packs().insertOne({
      owner: 'user-id',
      manifest: {
        id: 'pack-2',
      },
    } as any);

    const { insertedId: guildInsertedId } = await db.guilds().insertOne({
      discordId: 'guild-id',
      packIds: ['pack-1', 'pack-2'],
    } as any);

    const pack = await db.removePack('guild-id', 'pack-1');

    const guild = await db.guilds().findOne({
      _id: guildInsertedId,
    });

    assertEquals(pack!.manifest.id, 'pack-1');

    assertEquals(guild!.packIds, ['pack-2'] as any);
  });

  it('not found', async () => {
    const { insertedId: _guildInsertedId } = await db.guilds().insertOne({
      discordId: 'guild-id',
      packIds: [],
    } as any);

    const pack = await db.removePack('guild-id', 'pack-1');

    assertEquals(pack, null);
  });
});
