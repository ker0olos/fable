/// <reference lib="deno.unstable" />

import utils from '../src/utils.ts';

import {
  getGuild,
  getInstance,
  getInstanceInventories,
  getInstancePacks,
  getInventory,
  getUser,
  getUserCharacters,
  getUserParty,
  MAX_NEW_PULLS,
  MAX_PULLS,
  RECHARGE_MINS,
  rechargePulls,
} from './getInventory.ts';

import { addCharacter } from './addCharacter.ts';

import {
  likeCharacter,
  likeMedia,
  unlikeCharacter,
  unlikeMedia,
} from './likeCharacter.ts';

import {
  COOLDOWN_DAYS,
  failSteal,
  stealCharacter,
  tradeCharacters,
} from './tradeCharacters.ts';

import { addGuarantee, addPulls, addTokens, COSTS } from './addTokens.ts';

import {
  setCharacterImage,
  setCharacterNickname,
} from './customizeCharacter.ts';

import { findCharacters, findMediaCharacters } from './findCharacters.ts';

import {
  assignCharacter,
  swapSpots,
  unassignCharacter,
} from './assignParty.ts';

import { assignStats } from './assignStats.ts';

import { gainExp, MAX_LEVEL } from './gainExp.ts';

import {
  addPack,
  getPacksByUserId,
  popularPacks,
  publishPack,
  removePack,
} from './addPack.ts';

import { createVoteRef, resolveVoteRef } from './voteRef.ts';

// import { load as Dotenv } from '$std/dotenv/mod.ts';

// // load .env file
// await Dotenv({
//   export: true,
//   defaultsPath: '.env.example',
//   allowEmptyValues: true,
//   examplePath: null,
// });

export const kv = await Deno.openKv(
  // 'https://api.deno.com/databases/c0e82dfc-caeb-4059-877b-3e9134cf6e52/connect',
);

async function getValue<T>(key: Deno.KvKey): Promise<T | undefined> {
  const res = await kv.get<T>(key);

  return res.value ?? undefined;
}

async function getValueAndTimestamp<T>(
  key: Deno.KvKey,
): Promise<Deno.KvEntryMaybe<T> | undefined> {
  const res = await kv.get<T>(key);

  return res.value === null ? undefined : res;
}

async function getValues<T>(
  selector: Deno.KvListSelector,
): Promise<T[]> {
  const values = [];

  const iter = kv.list<T>(selector);

  for await (const { value } of iter) {
    values.push(value);
  }

  return values;
}

async function getValuesAndTimestamps<T>(
  selector: Deno.KvListSelector,
): Promise<Deno.KvEntry<T>[]> {
  const values = [];

  const iter = kv.list<T>(selector);

  for await (const value of iter) {
    values.push(value);
  }

  return values;
}

async function getManyValues<T>(
  keys: Deno.KvKey[],
): Promise<(T | undefined)[]> {
  const promises = [];

  for (const batch of utils.chunks(keys, 10)) {
    promises.push(kv.getMany<T[]>(batch));
  }

  return (await Promise.all(promises))
    .flat()
    .map((entry) => entry?.value ?? undefined);
}

const db = {
  getValue,
  getValues,
  getValueAndTimestamp,
  getValuesAndTimestamps,
  getManyValues,
  //
  getGuild,
  getInstance,
  getInstanceInventories,
  getInstancePacks,
  getInventory,
  getUser,
  getUserCharacters,
  getUserParty,
  rechargePulls,
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
  tradeCharacters,
  //
  setCharacterImage,
  setCharacterNickname,
  //
  findCharacters,
  findMediaCharacters,
  //
  addTokens,
  addGuarantee,
  addPulls,
  //
  assignCharacter,
  swapSpots,
  unassignCharacter,
  //
  assignStats,
  //
  gainExp,
  //
  addPack,
  getPacksByUserId,
  popularPacks,
  publishPack,
  removePack,
  //
  createVoteRef,
  resolveVoteRef,
};

export {
  COOLDOWN_DAYS,
  COSTS,
  MAX_LEVEL,
  MAX_NEW_PULLS,
  MAX_PULLS,
  RECHARGE_MINS,
};

export default db;
