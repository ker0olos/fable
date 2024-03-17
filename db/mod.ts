import { type Collection, MongoClient } from 'mongodb';

import {
  getActiveUsersIfLiked,
  getGuild,
  getInventory,
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

import {
  findCharacter,
  findCharacters,
  findMediaCharacters,
  findUserCharacters,
} from '~/db/findCharacters.ts';

import {
  assignCharacter,
  swapSpots,
  unassignCharacter,
} from '~/db/assignParty.ts';

import { acquireSkill } from '~/db/acquireSkill.ts';

import { distributeNewStats, gainExp, MAX_LEVEL } from '~/db/gainExp.ts';

import { clearFloor, consumeKey } from '~/db/consumeKey.ts';

import {
  getPack,
  getPacksByMaintainerId,
  getPopularPacks,
} from '~/db/getPack.ts';

import { addPack, publishPack, removePack } from '~/db/addPack.ts';

import { disableBuiltins } from '~/db/manageGuild.ts';

import type * as Schema from '~/db/schema.ts';

const _db = {} as { client: MongoClient };

const db = {
  ..._db,
  users: (): Collection<Schema.User> => {
    return db.client.db().collection('users');
  },
  guilds: (): Collection<Schema.Guild> => {
    return db.client.db().collection('guilds');
  },
  inventories: (): Collection<Schema.Inventory> => {
    return db.client.db().collection('inventories');
  },
  characters: (): Collection<Schema.Character> => {
    return db.client.db().collection('characters');
  },
  packs: (): Collection<Schema.Pack> => {
    return db.client.db().collection('packs');
  },
  battles: (): Collection<Schema.BattleData> => {
    return db.client.db().collection('battles');
  },
  //
  getInventory,
  getUser,
  getGuild,
  getUserCharacters,
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
  findMediaCharacters,
  findUserCharacters,
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
  publishPack,
  removePack,
  //
  disableBuiltins,
  //
  performOperationWithRetry,
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

async function performOperationWithRetry(
  // deno-lint-ignore no-explicit-any
  operation: () => Promise<any>,
  retries = 3,
  // deno-lint-ignore no-explicit-any
): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (error.message.includes('Write conflict during plan execution')) {
        console.log(
          `Retrying operation due to write conflict. Attempt ${
            i + 1
          } of ${retries}.`,
        );
        continue;
      } else {
        throw error; // Rethrow the error if it's not a write conflict
      }
    }
  }

  throw new Error('Operation failed after multiple retries.');
}

export { ObjectId } from 'mongodb';

export default db;
