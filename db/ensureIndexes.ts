// deno-lint-ignore-file explicit-function-return-type

import { MongoClient } from 'mongodb';

import { green } from '$std/fmt/colors.ts';

import db from '~/db/mod.ts';

import { MAX_BATTLE_TIME } from '~/src/battle.ts';

enum Direction {
  ascending = 1,
  descending = -1,
}

if (import.meta.main) {
  // deno-lint-ignore no-non-null-assertion
  db.client = await new MongoClient(Deno.env.get('MONGO_URI')!, {
    retryWrites: true,
  })
    .connect();

  await createGuildsIndexes();
  await createUsersIndexes();
  await createInventoriesIndexes();
  await createCharactersIndexes();
  await createPacksIndexes();
  await createBattleIndexes();

  console.log(green('Ensured Database Indexes'));
}

async function createGuildsIndexes() {
  await db.guilds() // Uniqueness Index
    .createIndex({ discordId: Direction.ascending }, { unique: true });

  await db.guilds() // Uniqueness Index
    .createIndex({ packIds: Direction.ascending });
}

async function createUsersIndexes() {
  await db.users() // Compound Index (speeds up queries)
    .createIndex({ discordId: Direction.ascending }, { unique: true });
}

async function createInventoriesIndexes() {
  await db.inventories() // Uniqueness Index
    .createIndex({
      userId: Direction.ascending,
      guildId: Direction.ascending,
    }, { unique: true });
}

async function createCharactersIndexes() {
  await db.characters() // Uniqueness Index
    .createIndex({
      characterId: Direction.ascending,
      guildId: Direction.ascending,
    }, { unique: true });

  // @findCharacters.findMediaCharacters
  // @findCharacters.findUserCharacters
  await db.characters() // Compound Index (speeds up queries)
    .createIndexes([
      { key: { userId: Direction.ascending, guildId: Direction.ascending } },
      { key: { mediaId: Direction.ascending, guildId: Direction.ascending } },
    ]);
}

async function createPacksIndexes() {
  await db.packs() // Uniqueness Index
    .createIndex({ 'manifest.id': Direction.ascending }, { unique: true });

  // Compound Index (speeds up queries)
  // @getPack.getPacksByMaintainerId()
  await db.packs()
    .createIndex({
      owner: Direction.ascending,
      'manifest.maintainers': Direction.ascending,
    });
}

async function createBattleIndexes() {
  await db.packs() // TTL Index
    .createIndex({
      'createdAt': Direction.ascending,
    }, { expireAfterSeconds: MAX_BATTLE_TIME });
}
