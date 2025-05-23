import 'dotenv/config';

import { Mongo } from '~/db/index.ts';

enum Direction {
  ascending = 1,
  descending = -1,
}

const green = (text: string) => `\x1b[32m${text}\x1b[0m`;

export async function ensureIndexes(): Promise<void> {
  const db = new Mongo(process.env.MONGO_URI);

  await createGuildsIndexes(db);
  await createUsersIndexes(db);
  await createInventoriesIndexes(db);
  await createCharactersIndexes(db);
  await createPacksIndexes(db);

  await db.close();
}

async function createGuildsIndexes(db: Mongo) {
  await db
    .guilds() // Uniqueness Index
    .createIndex({ discordId: Direction.ascending }, { unique: true });

  await db
    .guilds() // Uniqueness Index
    .createIndex({ packIds: Direction.ascending });
}

async function createUsersIndexes(db: Mongo) {
  await db
    .users() // Compound Index (speeds up queries)
    .createIndex({ discordId: Direction.ascending }, { unique: true });
}

async function createInventoriesIndexes(db: Mongo) {
  await db
    .inventories() // Uniqueness Index
    .createIndex(
      {
        userId: Direction.ascending,
        guildId: Direction.ascending,
      },
      { unique: true }
    );
}

async function createCharactersIndexes(db: Mongo) {
  await db.characters().createIndex(
    {
      userId: Direction.ascending,
      characterId: Direction.ascending,
      guildId: Direction.ascending,
    },
    { unique: true }
  );

  await db.characters().createIndex({
    characterId: Direction.ascending,
    guildId: Direction.ascending,
  });

  // @getInventory.getUserCharacters
  // @getInventory.getMediaCharacters
  // @getInventory.getGuildCharacters
  await db
    .characters() // Compound Index (speeds up queries)
    .createIndexes([
      { key: { userId: Direction.ascending, guildId: Direction.ascending } },
      { key: { mediaId: Direction.ascending, guildId: Direction.ascending } },
      { key: { guildId: Direction.ascending } },
    ]);
}

async function createPacksIndexes(db: Mongo) {
  await db
    .packs() // Uniqueness Index
    .createIndex({ 'manifest.id': Direction.ascending }, { unique: true });

  // Compound Index (speeds up queries)
  // @getPack.getPacksByMaintainerId()
  await db.packs().createIndex({
    owner: Direction.ascending,
    'manifest.maintainers': Direction.ascending,
  });

  await db.packCharacters().createIndex(
    {
      id: Direction.ascending,
      packId: Direction.ascending,
    },
    { unique: true }
  );

  await db.packMedia().createIndex(
    {
      id: Direction.ascending,
      packId: Direction.ascending,
    },
    { unique: true }
  );

  //

  await db.packCharacters().createIndex({
    packId: Direction.ascending,
  });

  await db.packCharacters().createIndex({
    rating: Direction.descending,
  });

  //

  await db.packCharacters().createSearchIndex({
    definition: {
      mappings: {
        dynamic: false,
        fields: {
          name: {
            type: 'document',
            fields: {
              alternative: [{ type: 'string' }, { type: 'autocomplete' }],
              english: [{ type: 'string' }, { type: 'autocomplete' }],
            },
          },
          rating: {
            type: 'number',
          },
        },
      },
      storedSource: {
        include: ['name.english', 'id', 'packId', 'media.mediaId'],
      },
    },
  });

  await db.packCharacters().createSearchIndex({
    name: 'gacha',
    definition: {
      mappings: {
        dynamic: false,
        fields: {
          packId: {
            type: 'token',
          },
          rating: {
            type: 'number',
          },
        },
      },
      storedSource: {
        include: [
          'id',
          'packId',
          'rating',
          'name.english',
          'media.mediaId',
          'images',
        ],
      },
    },
  });

  await db.packMedia().createSearchIndex({
    name: 'default',
    definition: {
      mappings: {
        dynamic: false,
        fields: {
          popularity: {
            type: 'number',
          },
          title: {
            type: 'document',
            fields: {
              alternative: [{ type: 'string' }, { type: 'autocomplete' }],
              english: [{ type: 'string' }, { type: 'autocomplete' }],
            },
          },
        },
      },
      storedSource: {
        include: ['packId', 'id', 'title.english'],
      },
    },
  });
}

await ensureIndexes();

console.log(green('Ensured Database Indexes'));
