import 'dotenv/config';
import { writeFile } from 'fs/promises';
import { ClientSession, MongoClient } from 'mongodb';

class Mongo {
  #client: MongoClient;

  constructor() {
    this.#client = new MongoClient(process.env.MONGO_URI!, {
      retryWrites: true,
    });
  }

  async connect(): Promise<Mongo> {
    this.#client = await this.#client.connect();
    return this;
  }

  startSession(): ClientSession {
    return this.#client.startSession();
  }

  async close(): Promise<void> {
    await this.#client.close();
  }

  users() {
    return this.#client.db('default').collection('users');
  }

  guilds() {
    return this.#client.db('default').collection('guilds');
  }

  inventories() {
    return this.#client.db('default').collection('inventories');
  }

  characters() {
    return this.#client.db('default').collection('characters');
  }

  packs() {
    return this.#client.db('default').collection('packs');
  }

  // public get anime() {
  //   return {
  //     media: () => {
  //       return this.#client.db('anime').collection('media');
  //     },
  //     characters: () => {
  //       return this.#client.db('anime').collection('characters');
  //     },
  //   };
  // }
}

const db = new Mongo();

console.log('Fetching data from MongoDB...');

const users = await db.users().find().toArray();
const packs = await db.packs().find().toArray();
const guilds = await db.guilds().find().toArray();
const inventories = await db.inventories().find().toArray();
const characters = await db.characters().find().toArray();
// const anime_characters = await db.anime.characters().find().toArray();
// const anime_media = await db.anime.media().find().toArray();

await writeFile('./db/migrate/users.json', JSON.stringify(users, null, 2));
await writeFile('./db/migrate/packs.json', JSON.stringify(packs, null, 2));
await writeFile('./db/migrate/guilds.json', JSON.stringify(guilds, null, 2));
await writeFile(
  './db/migrate/inventories.json',
  JSON.stringify(inventories, null, 2)
);
await writeFile(
  './db/migrate/characters.json',
  JSON.stringify(characters, null, 2)
);
// await writeFile(
//   './db/migrate/anime_characters.json',
//   JSON.stringify(anime_characters, null, 2)
// );
// await writeFile(
//   './db/migrate/anime_media.json',
//   JSON.stringify(anime_media, null, 2)
// );

await db.close();
