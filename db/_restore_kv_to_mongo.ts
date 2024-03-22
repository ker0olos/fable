// deno-lint-ignore-file no-unused-vars no-non-null-assertion no-external-import no-explicit-any

/// <reference lib="deno.unstable" />

import { MongoClient } from 'mongodb';

import { getFromBlob } from '~/db/blob.ts';

import db from '~/db/mod.ts';

import utils from '~/src/utils.ts';

import type * as Schema from './schema.ts';

import type * as OldSchema from 'https://raw.githubusercontent.com/ker0olos/fable/c0d63ffcdf654b33132cdb247e118c7876cf7bfc/db/schema.ts';
import { ensureCombat } from '~/db/addCharacter.ts';

import { MongoMemoryServer } from 'mongodb-memory-server';
import { red } from '$std/fmt/colors.ts';

async function getBlobValue<T>(
  kv: Deno.Kv,
  key: Deno.KvKey,
): Promise<T | undefined> {
  return await getFromBlob<T>(kv, key);
}

function decodeTime(ulid: string): Date | null {
  const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford's Base32
  const ENCODING_LEN = ENCODING.length;
  const TIME_MAX = Math.pow(2, 48) - 1;
  const TIME_LEN = 10;
  const RANDOM_LEN = 16;

  if (ulid.length !== TIME_LEN + RANDOM_LEN) {
    return null;
  }
  const time = parseInt(
    ulid
      .substring(0, TIME_LEN)
      .split('')
      .reverse()
      // deno-lint-ignore ban-ts-comment
      //@ts-ignore
      .reduce((carry, char, index) => {
        const encodingIndex = ENCODING.indexOf(char);
        if (encodingIndex === -1) {
          return null;
        }
        return (carry += encodingIndex * Math.pow(ENCODING_LEN, index));
      }, 0),
  );

  if (time > TIME_MAX) {
    return null;
  }

  return new Date(time);
}

const KVIDMap = new Map<string, string>();

if (import.meta.main) {
  const kv = await Deno.openKv('http://0.0.0.0:4512');

  // const testServer = await MongoMemoryServer.create();

  // db.client = await new MongoClient(testServer.getUri())
  //   .connect();

  db.client = await new MongoClient(
    Deno.env.get('MONGO_URI')!,
    { retryWrites: true },
  ).connect();

  await restoreUsers(kv);

  await restorePacks(kv);
  await restoreGuilds(kv);

  await restoreInventories(kv);
  await restoreCharacters(kv);
  await restoreParties();

  await db.client.close();
  // await testServer.stop();

  kv.close();
}

async function restoreUsers(kv: Deno.Kv): Promise<void> {
  const users = kv.list<OldSchema.User>({
    // ['users', 'guilds', 'instances', 'inventories', 'characters', 'likes', 'packs'];
    prefix: ['users'],
  });

  const bulk: Parameters<
    ReturnType<typeof db.users>['bulkWrite']
  >[0] = [];

  for await (const { key, value: old } of users) {
    KVIDMap.set(old._id, old.id);

    const _new: Schema.User = {
      discordId: old.id,
      availableTokens: old.availableTokens || 0,
      dailyTimestamp: old.dailyTimestamp
        ? new Date(old.dailyTimestamp)
        : new Date(),
      guarantees: old.guarantees || [],
      likes: [],
    };

    const likes = await getBlobValue<Schema.Like[]>(
      kv,
      ['users_likes_by_discord_id', old.id],
    );

    _new.likes = likes || [];

    bulk.push({
      insertOne: { document: _new },
    });
  }

  const insert = await db.users().bulkWrite(bulk);

  console.log(insert.insertedCount);
}

async function restorePacks(kv: Deno.Kv): Promise<void> {
  const packs = kv.list<OldSchema.Pack>({
    // ['users', 'guilds', 'instances', 'inventories', 'characters', 'likes', 'packs'];
    prefix: ['packs'],
  });

  const bulk: Parameters<
    ReturnType<typeof db.packs>['bulkWrite']
  >[0] = [];

  for await (const { key, value: old } of packs) {
    KVIDMap.set(old._id, old.manifest.id);

    const _new: Schema.Pack = {
      // createdAt: decodeTime(key.slice(-1)[0].toString()) || new Date(),
      createdAt: new Date(old.added),
      updatedAt: new Date(old.updated),
      approved: false,
      hidden: false,
      owner: old.owner,
      manifest: old.manifest,
    };

    bulk.push({
      insertOne: { document: _new },
    });
  }

  const insert = await db.packs().bulkWrite(bulk);

  console.log(insert.insertedCount);
}

async function restoreGuilds(kv: Deno.Kv): Promise<void> {
  const instances = kv.list<OldSchema.Instance>({
    // ['users', 'guilds', 'instances', 'inventories', 'characters', 'likes', 'packs'];
    prefix: ['instances'],
  });

  const bulk: Parameters<
    ReturnType<typeof db.guilds>['bulkWrite']
  >[0] = [];

  for await (const { key, value: old } of instances) {
    const oldGuild = (await kv.get<OldSchema.Guild>(['guilds', old.guild]))
      .value!;

    KVIDMap.set(old._id, oldGuild.id);
    KVIDMap.set(oldGuild._id, oldGuild.id);

    const _new: Schema.Guild = {
      discordId: oldGuild.id,
      builtinsDisabled: old.builtinsDisabled || false,
      excluded: old.excluded || false,
      packIds: old.packs?.map(({ pack }) =>
        KVIDMap.get(pack)
      ).filter(utils.nonNullable) ?? [],
    };

    bulk.push({
      insertOne: { document: _new },
    });
  }

  const insert = await db.guilds().bulkWrite(bulk);

  console.log(insert.insertedCount);
}

async function restoreInventories(kv: Deno.Kv): Promise<void> {
  const inventories = kv.list<OldSchema.Inventory>({
    // ['users', 'guilds', 'instances', 'inventories', 'characters', 'likes', 'packs'];
    prefix: ['inventories'],
  });

  const bulk: Parameters<
    ReturnType<typeof db.inventories>['bulkWrite']
  >[0] = [];

  const _ids: string[] = [];

  for await (const { key, value: old } of inventories) {
    const _new: Schema.Inventory = {
      availableKeys: old.availableKeys || 0,
      availablePulls: old.availablePulls,
      floorsCleared: old.floorsCleared || 0,
      guildId: KVIDMap.get(old.instance)!,
      userId: KVIDMap.get(old.user)!,
      party: {
        member1Id: old.party?.member1 as any,
        member2Id: old.party?.member2 as any,
        member3Id: old.party?.member3 as any,
        member4Id: old.party?.member4 as any,
        member5Id: old.party?.member5 as any,
      },
      keysTimestamp: old.keysTimestamp
        ? new Date(old.keysTimestamp)
        : undefined,
      rechargeTimestamp: old.rechargeTimestamp
        ? new Date(old.rechargeTimestamp)
        : undefined,
      lastPull: old.lastPull ? new Date(old.lastPull) : undefined,
      lastPVE: old.lastPVE ? new Date(old.lastPVE) : undefined,
      stealTimestamp: old.stealTimestamp
        ? new Date(old.stealTimestamp)
        : undefined,
    };

    if (!_new.userId) {
      throw new Error('');
    }

    if (!_new.guildId) {
      throw new Error('');
    }

    _ids.push(old._id);

    bulk.push({
      insertOne: { document: _new },
    });
  }

  const insert = await db.inventories().bulkWrite(bulk);

  for (let i = 0; i < _ids.length; i++) {
    KVIDMap.set(_ids[i], insert.insertedIds[i]);
  }

  console.log(insert.insertedCount);
}

async function restoreCharacters(kv: Deno.Kv): Promise<void> {
  const characters = kv.list<OldSchema.Character>({
    // ['users', 'guilds', 'instances', 'inventories', 'characters', 'likes', 'packs'];
    prefix: ['characters'],
  });

  const bulk: Parameters<
    ReturnType<typeof db.characters>['bulkWrite']
  >[0] = [];

  const _ids: string[] = [];

  for await (const { key, value: old } of characters) {
    let _new: Schema.Character = {
      createdAt: decodeTime(key.slice(-1)[0].toString()) || new Date(),
      characterId: old.id,
      combat: undefined as any,
      inventoryId: KVIDMap.get(old.inventory) as any,
      guildId: KVIDMap.get(old.instance)!,
      userId: KVIDMap.get(old.user)!,
      mediaId: old.mediaId,
      rating: old.rating,
      nickname: old.nickname,
      image: old.image,
    };

    if (!_new.guildId) {
      console.error(
        red(
          `missing guild id on character, ignoring ${_new.characterId} ${_new.rating}*`,
        ),
      );
      continue;
    }

    if (!_new.userId) {
      console.error(
        red(
          `missing user id on character, ignoring ${_new.characterId} ${_new.rating}*`,
        ),
      );
      continue;
    }

    if (!_new.inventoryId) {
      console.error(
        red(
          `missing inv id on character, ignoring ${_new.characterId} ${_new.rating}*`,
        ),
      );
      continue;
    }

    _new = ensureCombat(_new);

    _ids.push(old._id);

    bulk.push({
      insertOne: { document: _new },
    });
  }

  const insert = await db.characters().bulkWrite(bulk);

  for (let i = 0; i < _ids.length; i++) {
    KVIDMap.set(_ids[i], insert.insertedIds[i]);
  }

  console.log(insert.insertedCount);
}

async function restoreParties(): Promise<void> {
  const inventories = await db.inventories().find({}).toArray();

  const bulk: Parameters<
    ReturnType<typeof db.inventories>['bulkWrite']
  >[0] = [];

  for (const inventory of inventories) {
    const $set: Schema.Inventory['party'] = {
      member1Id: KVIDMap.get(inventory.party.member1Id as any) as any || null,
      member2Id: KVIDMap.get(inventory.party.member2Id as any) as any || null,
      member3Id: KVIDMap.get(inventory.party.member3Id as any) as any || null,
      member4Id: KVIDMap.get(inventory.party.member4Id as any) as any || null,
      member5Id: KVIDMap.get(inventory.party.member5Id as any) as any || null,
    };

    if (
      (inventory.party.member1Id && !$set.member1Id) ||
      (inventory.party.member2Id && !$set.member2Id) ||
      (inventory.party.member3Id && !$set.member3Id) ||
      (inventory.party.member4Id && !$set.member4Id) ||
      (inventory.party.member5Id && !$set.member5Id)
    ) {
      throw new Error('');
    }

    bulk.push({
      updateOne: {
        filter: { _id: inventory._id },
        update: { $set: { party: $set } },
      },
    });
  }

  const modify = await db.inventories().bulkWrite(bulk);

  console.log(modify.modifiedCount);
}
