// deno-lint-ignore-file explicit-function-return-type

import { green } from '$std/fmt/colors.ts';

import database from '~/db/mod.ts';

enum Direction {
  ascending = 1,
  descending = -1,
}

try {
  await createGuildsIndexes();
  await createUsersIndexes();
  await createInventoriesIndexes();
  await createCharactersIndexes();
  await createPacksIndexes();

  console.log(green('Done'));
} finally {
  await database.client.close();
}

async function createGuildsIndexes() {
  await database.guilds // Uniqueness Index
    .createIndex({ discordId: Direction.ascending }, { unique: true });
}

async function createUsersIndexes() {
  await database.users // Uniqueness Index
    .createIndex({ discordId: Direction.ascending }, { unique: true });
}

async function createInventoriesIndexes() {
  await database.inventories // Uniqueness Index
    .createIndex({
      userId: Direction.ascending,
      guildId: Direction.ascending,
    }, { unique: true });
}

async function createCharactersIndexes() {
  await database.characters // Uniqueness Index
    .createIndex({
      characterId: Direction.ascending,
      guildId: Direction.ascending,
    }, { unique: true });

  // @findCharacters.findMediaCharacters
  // @findCharacters.findUserCharacters
  await database.characters // Compound Index (speeds up queries)
    .createIndexes([
      { key: { userId: Direction.ascending, guildId: Direction.ascending } },
      { key: { mediaId: Direction.ascending, guildId: Direction.ascending } },
    ]);
}

async function createPacksIndexes() {
  await database.packs // Uniqueness Index
    .createIndex({ 'manifest.id': Direction.ascending }, { unique: true });

  // Compound Index (speeds up queries)
  // @getPack.getPacksByMaintainerId()
  await database.packs
    .createIndex({
      owner: Direction.ascending,
      'manifest.maintainers': Direction.ascending,
    });
}
