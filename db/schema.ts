import type { Manifest } from '../src/types.ts';

interface Collection {
  _id: string;
}

export interface Guild extends Collection {
  id: string;
  instances: string[];
}

export interface Instance extends Collection {
  main: boolean;
  excluded?: boolean;
  builtinsDisabled?: boolean;
  inventories: string[];
  guild: string;
  packs: PackInstall[];
}

export interface User extends Collection {
  id: string;
  inventories: string[];
  lastVote?: string;
  availableTokens?: number;
  dailyTimestamp?: string;
  guarantees?: number[];
  likes?: Like[];
}

export interface Inventory extends Collection {
  user: string;
  instance: string;
  availablePulls: number;
  lastPull?: string;
  rechargeTimestamp?: string;
  stealTimestamp?: string;

  floorsCleared?: number;
  availableSweeps?: number;
  sweepsTimestamp?: string;
  lastSweep?: string;

  party?: {
    member1?: string;
    member2?: string;
    member3?: string;
    member4?: string;
    member5?: string;
  };
}

export interface Character extends Collection {
  id: string;
  mediaId: string;
  rating: number;
  nickname?: string;
  image?: string;
  combat?: CharacterCombat;
  instance: string;
  inventory: string;
  user: string;
}

export interface Pack extends Collection {
  owner: string;
  added: string;
  updated: string;
  version: number;
  manifest: Manifest;
  servers?: number;
  approved?: boolean;
  hidden?: boolean;
}

export interface AcquiredCharacterSkill {
  level: number;
}

export interface CharacterCombat {
  exp?: number;
  level?: number;

  skillPoints?: number;
  skills?: Record<string, AcquiredCharacterSkill>;

  unclaimedStatsPoints?: number;
  curStats?: CharacterStats;
  baseStats?: CharacterStats;
}

export interface CharacterStats {
  attack: number;
  defense: number;
  speed: number;
}

export interface Like {
  mediaId?: string;
  characterId?: string;
}

export interface PackInstall {
  pack: string;
  timestamp: string;
  by: string;
}

export interface Party {
  member1?: Character;
  member2?: Character;
  member3?: Character;
  member4?: Character;
  member5?: Character;
}
