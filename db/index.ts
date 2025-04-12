import { type ClientSession, type Collection, MongoClient } from 'mongodb';

import config from '~/src/config.ts';

import {
  getActiveUsersIfLiked,
  getGuild,
  getGuildCharacters,
  getInventory,
  getMediaCharacters,
  getUser,
  getUserCharacters,
  MAX_NEW_PULLS,
  MAX_PULLS,
  RECHARGE_DAILY_TOKENS_HOURS,
  RECHARGE_MINS,
  rechargeConsumables,
} from '~/db/getInventory.ts';

import { addCharacter } from '~/db/addCharacter.ts';

import {
  likeCharacter,
  likeMedia,
  unlikeCharacter,
  unlikeMedia,
} from '~/db/likeCharacter.ts';

import {
  failSteal,
  giveCharacters,
  STEAL_COOLDOWN_HOURS,
  stealCharacter,
  tradeCharacters,
} from '~/db/tradeCharacters.ts';

import { addGuarantee, addPulls, addTokens, COSTS } from '~/db/addTokens.ts';

import {
  setCharacterImage,
  setCharacterNickname,
} from '~/db/customizeCharacter.ts';

import {
  findCharacter,
  findCharacters,
  findGuildCharacters,
  findOneCharacter,
} from '~/db/findCharacters.ts';

import {
  assignCharacter,
  clearParty,
  swapSpots,
  unassignCharacter,
} from '~/db/assignParty.ts';

import {
  getLastUpdatedPacks,
  getPack,
  getPacksByMaintainerId,
  getPopularPacks,
  searchPacks,
} from '~/db/getPack.ts';

import { addPack, publishPack, removePack } from '~/db/addPack.ts';

import { invertDupes } from '~/db/manageGuild.ts';

import { ratingPool, likesPool } from '~/db/charactersPool.ts';

import type * as Schema from '~/db/schema.ts';

import type {
  DisaggregatedCharacter,
  DisaggregatedMedia,
} from '~/src/types.ts';

// let _MongoClient: MongoClient | null = null;

export class Mongo {
  #client: MongoClient;

  constructor(url = config.mongoUri!) {
    // if (_MongoClient) {
    //   this.#client = _MongoClient;
    //   return;
    // }
    this.#client = new MongoClient(url, { retryWrites: true });
  }

  async connect(): Promise<Mongo> {
    this.#client = await this.#client.connect();
    // _MongoClient = this.#client;
    return this;
  }

  startSession(): ClientSession {
    return this.#client.startSession();
  }

  async close(): Promise<void> {
    await this.#client.close();
  }

  users(): Collection<Schema.User> {
    return this.#client.db('default').collection('users');
  }

  guilds(): Collection<Schema.Guild> {
    return this.#client.db('default').collection('guilds');
  }

  inventories(): Collection<Schema.Inventory> {
    return this.#client.db('default').collection('inventories');
  }

  characters(): Collection<Schema.Character> {
    return this.#client.db('default').collection('characters');
  }

  packs(): Collection<Schema.Pack> {
    return this.#client.db('default').collection('packs');
  }

  packCharacters(): Collection<DisaggregatedCharacter> {
    return this.#client.db('default').collection('pack_characters');
  }

  packMedia(): Collection<DisaggregatedMedia> {
    return this.#client.db('default').collection('pack_media');
  }
}

const db = {
  newMongo: () => new Mongo(),
  getInventory,
  getUser,
  getGuild,
  getUserCharacters,
  getGuildCharacters,
  rechargeConsumables,
  getActiveUsersIfLiked,
  //
  addCharacter,
  //
  likeCharacter,
  likeMedia,
  unlikeCharacter,
  unlikeMedia,
  //
  failSteal,
  stealCharacter,
  giveCharacters,
  tradeCharacters,
  //
  setCharacterImage,
  setCharacterNickname,
  //
  findCharacter,
  findOneCharacter,
  findCharacters,
  findGuildCharacters,
  getMediaCharacters,
  //
  addTokens,
  addGuarantee,
  addPulls,
  //
  assignCharacter,
  swapSpots,
  unassignCharacter,
  clearParty,
  //
  getPack,
  addPack,
  getPacksByMaintainerId,
  getPopularPacks,
  getLastUpdatedPacks,
  searchPacks,
  publishPack,
  removePack,
  //
  ratingPool,
  likesPool,
  //
  invertDupes,
};

export {
  COSTS,
  MAX_NEW_PULLS,
  MAX_PULLS,
  RECHARGE_DAILY_TOKENS_HOURS,
  RECHARGE_MINS,
  STEAL_COOLDOWN_HOURS,
};

export { ObjectId } from 'mongodb';

export default db;
