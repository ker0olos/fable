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
  MAX_KEYS,
  MAX_NEW_PULLS,
  MAX_PULLS,
  RECHARGE_DAILY_TOKENS_HOURS,
  RECHARGE_KEYS_MINS,
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

import {
  addGuarantee,
  addKeys,
  addPulls,
  addTokens,
  COSTS,
} from '~/db/addTokens.ts';

import {
  setCharacterImage,
  setCharacterNickname,
} from '~/db/customizeCharacter.ts';

import { findCharacter, findCharacters } from '~/db/findCharacters.ts';

import {
  assignCharacter,
  swapSpots,
  unassignCharacter,
} from '~/db/assignParty.ts';

import { acquireSkill } from '~/db/acquireSkill.ts';

import { distributeNewStats, gainExp, MAX_LEVEL } from '~/db/gainExp.ts';

import { clearFloor, consumeKey } from '~/db/consumeKey.ts';

import {
  getLastUpdatedPacks,
  getPack,
  getPacksByMaintainerId,
  getPopularPacks,
} from '~/db/getPack.ts';

import { addPack, publishPack, removePack } from '~/db/addPack.ts';

import { disableBuiltins } from '~/db/manageGuild.ts';

import { addChatMessage } from '~/db/getChatHistory.ts';

import type * as Schema from '~/db/schema.ts';

import type {
  DisaggregatedCharacter,
  DisaggregatedMedia,
} from '~/src/types.ts';

export class Mongo {
  #client: MongoClient;

  // deno-lint-ignore no-non-null-assertion
  constructor(url = config.mongoUri!) {
    this.#client = new MongoClient(url, {
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

  battles(): Collection<Schema.BattleData> {
    return this.#client.db('default').collection('battles');
  }

  chat(): Collection<Schema.Chat> {
    return this.#client.db('default').collection('chat');
  }

  // deno-lint-ignore explicit-function-return-type
  public get anime() {
    return {
      media: (): Collection<DisaggregatedMedia> => {
        return this.#client.db('anime').collection('media');
      },
      characters: (): Collection<DisaggregatedCharacter> => {
        return this.#client.db('anime').collection('characters');
      },
    };
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
  findCharacters,
  getMediaCharacters,
  //
  addTokens,
  addGuarantee,
  addPulls,
  addKeys,
  //
  assignCharacter,
  swapSpots,
  unassignCharacter,
  //
  acquireSkill,
  //
  gainExp,
  distributeNewStats,
  consumeKey,
  clearFloor,
  //
  getPack,
  addPack,
  getPacksByMaintainerId,
  getPopularPacks,
  getLastUpdatedPacks,
  publishPack,
  removePack,
  //
  disableBuiltins,
  //
  addChatMessage,
};

export {
  COSTS,
  findCharacter,
  MAX_KEYS,
  MAX_LEVEL,
  MAX_NEW_PULLS,
  MAX_PULLS,
  RECHARGE_DAILY_TOKENS_HOURS,
  RECHARGE_KEYS_MINS,
  RECHARGE_MINS,
  STEAL_COOLDOWN_HOURS,
};

export { ObjectId } from 'mongodb';

export default db;
