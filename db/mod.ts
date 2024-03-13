import { MongoClient } from 'mongodb';

import {
  getActiveUsersIfLiked,
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

import { getAllPublicPacks, getPacksByMaintainerId } from '~/db/getPack.ts';

import { addPack, publishPack, removePack } from '~/db/addPack.ts';

import { disableBuiltins } from '~/db/manageGuild.ts';

import type * as Schema from './schema.ts';

// deno-lint-ignore no-non-null-assertion
const client = new MongoClient(Deno.env.get('MONGO_URL')!);

const db = {
  client,
  //
  users: client.db().collection<Schema.User>('users'),
  guilds: client.db().collection<Schema.Guild>('guilds'),
  inventories: client.db().collection<Schema.Inventory>('inventories'),
  characters: client.db().collection<Schema.Character>('characters'),
  packs: client.db().collection<Schema.Pack>('packs'),
  //
  getInventory,
  getUser,
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
  addPack,
  getPacksByMaintainerId,
  getAllPublicPacks,
  publishPack,
  removePack,
  //
  disableBuiltins,
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
