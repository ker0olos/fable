import type { ObjectId, WithId } from 'mongodb';

import type { Manifest, SkillKey } from '~/src/types.ts';

export interface Guild {
  discordId: string;
  excluded: boolean;
  packIds: string[];
  options: { dupes: boolean };
}

export type PopulatedGuild = WithId<Guild> & {
  packs: Pack[];
};

export interface User {
  discordId: string;
  availableTokens: number;
  dailyTimestamp: Date;
  guarantees: number[];
  likes: Like[];
}

export interface Inventory {
  userId: string;
  guildId: string;

  availablePulls: number;
  availableKeys: number;

  floorsCleared: number;

  lastPVE?: Date;
  lastPull?: Date;
  rechargeTimestamp?: Date;
  keysTimestamp?: Date;
  stealTimestamp?: Date;

  party: {
    member1Id: ObjectId | null;
    member2Id: ObjectId | null;
    member3Id: ObjectId | null;
    member4Id: ObjectId | null;
    member5Id: ObjectId | null;
  };
}

export type PopulatedInventory = WithId<Inventory> & {
  user: WithId<User>;
  party: {
    member1?: WithId<Character>;
    member2?: WithId<Character>;
    member3?: WithId<Character>;
    member4?: WithId<Character>;
    member5?: WithId<Character>;
  };
};

export interface Character {
  characterId: string;
  mediaId: string;

  rating: number;
  nickname?: string;
  image?: string;

  createdAt: Date;

  combat: CharacterCombat;

  guildId: string;
  userId: string;
  inventoryId: ObjectId;
}

export type PopulatedCharacter = WithId<Character> & {
  inventory: WithId<Inventory>;
};

export interface Pack {
  owner: string;
  createdAt: Date;
  updatedAt: Date;
  manifest: Manifest;
  approved: boolean;
  hidden: boolean;
}

export interface BattleData {
  createdAt: Date;
}

export interface AcquiredCharacterSkill {
  level: number;
}

export interface CharacterCombat {
  exp: number;
  level: number;

  skillPoints: number;
  skills: Partial<Record<SkillKey, AcquiredCharacterSkill>>;

  curStats: CharacterStats;
  baseStats: CharacterStats;
}

export interface CharacterStats {
  attack: number;
  defense: number;
  speed: number;
  hp: number;
}

export interface Like {
  mediaId?: string;
  characterId?: string;
}

export interface Party {
  member1?: Character;
  member2?: Character;
  member3?: Character;
  member4?: Character;
  member5?: Character;
}

export interface Chat {
  userId: string;
  guildId: string;
  characterId: string;
  createdAt: Date;
  updatedAt: Date;
  messages: { role: 'user' | 'assistant'; content: string }[];
}
