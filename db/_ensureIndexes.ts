// deno-lint-ignore-file explicit-function-return-type

import { green } from '$std/fmt/colors.ts';

import { Mongo } from '~/db/mod.ts';

import { MAX_BATTLE_TIME } from '~/src/battle.ts';

enum Direction {
  ascending = 1,
  descending = -1,
}

export async function ensureIndexes(): Promise<void> {
  // deno-lint-ignore no-non-null-assertion
  const db = new Mongo(Deno.env.get('MONGO_URI')!);

  await createGuildsIndexes(db);
  await createUsersIndexes(db);
  await createInventoriesIndexes(db);
  await createCharactersIndexes(db);
  await createPacksIndexes(db);
  await createBattleIndexes(db);

  await createAnimeIndexes(db);

  await db.close();
}

if (import.meta.main) {
  await ensureIndexes();

  console.log(green('Ensured Database Indexes'));
}

async function createGuildsIndexes(db: Mongo) {
  await db.guilds() // Uniqueness Index
    .createIndex({ discordId: Direction.ascending }, { unique: true });

  await db.guilds() // Uniqueness Index
    .createIndex({ packIds: Direction.ascending });
}

async function createUsersIndexes(db: Mongo) {
  await db.users() // Compound Index (speeds up queries)
    .createIndex({ discordId: Direction.ascending }, { unique: true });
}

async function createInventoriesIndexes(db: Mongo) {
  await db.inventories() // Uniqueness Index
    .createIndex({
      userId: Direction.ascending,
      guildId: Direction.ascending,
    }, { unique: true });
}

async function createCharactersIndexes(db: Mongo) {
  await db.characters() // Uniqueness Index
    .createIndex({
      characterId: Direction.ascending,
      guildId: Direction.ascending,
    });

  // @getInventory.getMediaCharacters
  // @getInventory.getUserCharacters
  await db.characters() // Compound Index (speeds up queries)
    .createIndexes([
      { key: { userId: Direction.ascending, guildId: Direction.ascending } },
      { key: { mediaId: Direction.ascending, guildId: Direction.ascending } },
    ]);

  // @getInventory.getGuildCharacters
  await db.characters() // Normal Index (speeds up queries)
    .createIndexes([
      { key: { guildId: Direction.ascending } },
    ]);
}

async function createPacksIndexes(db: Mongo) {
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

async function createBattleIndexes(db: Mongo) {
  await db.battles() // TTL Index
    .createIndex({
      'createdAt': Direction.ascending,
    }, { expireAfterSeconds: MAX_BATTLE_TIME });
}

async function createAnimeIndexes(db: Mongo) {
  await db.anime.media()
    .createIndex({ 'id': Direction.ascending }, { unique: true });

  await db.anime.characters()
    .createIndex({ 'id': Direction.ascending }, { unique: true });
}
