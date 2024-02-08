/// <reference lib="deno.unstable" />

import utils from '~/src/utils.ts';

import {
  checkDailyTimestamp,
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
  MAX_SWEEPS,
  RECHARGE_MINS,
  RECHARGE_SWEEPS_MINS,
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
  COOLDOWN_DAYS,
  failSteal,
  stealCharacter,
  tradeCharacters,
} from '~/db/tradeCharacters.ts';

import {
  addGuarantee,
  addPulls,
  addSweeps,
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
} from '~/db/findCharacters.ts';

import {
  assignCharacter,
  swapSpots,
  unassignCharacter,
} from '~/db/assignParty.ts';

import {
  initStats,
  //  upgradeStats
} from '~/db/assignStats.ts';

import { acquireSkill } from '~/db/acquireSkill.ts';

import { gainExp, MAX_LEVEL } from '~/db/gainExp.ts';

import { clearFloor, consumeSweep } from '~/db/consumeSweep.ts';

import { getAllPublicPacks, getPacksByMaintainerId } from '~/db/getPack.ts';

import { addPack, publishPack, removePack } from '~/db/addPack.ts';

import { disableBuiltins } from '~/db/manageInstance.ts';

import { createVoteRef, resolveVoteRef } from '~/db/voteRef.ts';

import { getFromBlob, setAsBlob } from '~/db/blob.ts';

export const kv = await Deno.openKv(
  ':memory:',
  // 'https://api.deno.com/databases/c0e82dfc-caeb-4059-877b-3e9134cf6e52/connect',
);

async function setValue<T>(
  key: Deno.KvKey,
  value: unknown,
  options?: {
    expireIn?: number | undefined;
  },
): Promise<boolean> {
  const res = await kv.set(key, value, options);

  return res.ok;
}

async function getValue<T>(key: Deno.KvKey): Promise<T | undefined> {
  const res = await kv.get<T>(key);

  return res.value ?? undefined;
}

async function getBlobValue<T>(key: Deno.KvKey): Promise<T | undefined> {
  return await getFromBlob<T>(kv, key);
}

async function setBlobValue<T>(key: Deno.KvKey, value: T): Promise<boolean> {
  const op = kv.atomic();

  await setAsBlob(kv, key, op, value);

  const res = await op.commit();

  return res.ok;
}

async function getValueAndTimestamp<T>(
  key: Deno.KvKey,
): Promise<Deno.KvEntryMaybe<T> | undefined> {
  const res = await kv.get<T>(key);

  return res.value === null ? undefined : res;
}

async function getKeys(
  selector: Deno.KvListSelector,
  _kv?: Deno.Kv,
): Promise<Deno.KvKey[]> {
  const keys = [];

  const iter = (_kv ?? kv).list(selector, {
    batchSize: 100,
  });

  for await (const { key } of iter) {
    keys.push(key);
  }

  return keys;
}

async function getValues<T>(
  selector: Deno.KvListSelector,
  _kv?: Deno.Kv,
): Promise<T[]> {
  const values = [];

  const iter = (_kv ?? kv).list<T>(selector, {
    batchSize: 100,
  });

  for await (const { value } of iter) {
    values.push(value);
  }

  return values;
}

async function getValuesAndTimestamps<T>(
  selector: Deno.KvListSelector,
): Promise<Deno.KvEntry<T>[]> {
  const values = [];

  const iter = kv.list<T>(selector, {
    batchSize: 100,
  });

  for await (const value of iter) {
    values.push(value);
  }

  return values;
}

async function getManyValues<T>(
  keys: Deno.KvKey[],
): Promise<(T | undefined)[]> {
  const promises = [];

  // getMany max range is 10 keys
  for (const batch of utils.chunks(keys, 10)) {
    promises.push(kv.getMany<T[]>(batch));
  }

  return (await Promise.all(promises))
    .flat()
    .map((entry) => entry?.value ?? undefined);
}

async function getManyBlobValues<T>(
  keys: Deno.KvKey[],
): Promise<(T | undefined)[]> {
  const promises = [];

  for (const key of keys) {
    promises.push(getBlobValue<T>(key));
  }

  return (await Promise.all(promises))
    .map((entry) => entry ?? undefined);
}

const db = {
  kv,
  setValue,
  getValue,
  getKeys,
  getValues,
  getValueAndTimestamp,
  getValuesAndTimestamps,
  getManyValues,
  //
  getBlobValue,
  getManyBlobValues,
  setBlobValue,
  //
  getGuild,
  getInstance,
  getInstanceInventories,
  getInstancePacks,
  getInventory,
  getUser,
  getUserCharacters,
  getUserParty,
  rechargeConsumables,
  checkDailyTimestamp,
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
  findCharacter,
  findCharacters,
  findMediaCharacters,
  //
  addTokens,
  addGuarantee,
  addPulls,
  addSweeps,
  //
  assignCharacter,
  swapSpots,
  unassignCharacter,
  //
  initStats,
  // upgradeStats,
  acquireSkill,
  //
  gainExp,
  consumeSweep,
  clearFloor,
  //
  addPack,
  getPacksByMaintainerId,
  getAllPublicPacks,
  publishPack,
  removePack,
  //
  disableBuiltins,
  //
  createVoteRef,
  resolveVoteRef,
};

export {
  COOLDOWN_DAYS,
  COSTS,
  findCharacter,
  MAX_LEVEL,
  MAX_NEW_PULLS,
  MAX_PULLS,
  MAX_SWEEPS,
  RECHARGE_MINS,
  RECHARGE_SWEEPS_MINS,
};

export default db;
