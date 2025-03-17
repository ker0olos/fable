import {
  getActiveUsersIfLiked,
  getUser,
  getGuild,
  getGuildCharacters,
  getInventory,
  getMediaCharacters,
  getUserCharacters,
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

const db = {
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
  invertDupes,
};

export {
  COSTS,
  MAX_PULLS,
  RECHARGE_DAILY_TOKENS_HOURS,
  RECHARGE_MINS,
  STEAL_COOLDOWN_HOURS,
};

export default db;
