import type { ObjectId, WithId } from 'mongodb';

import type { Manifest, SkillKey } from '~/src/types.ts';

export interface Guild {
  discordId: string;

  excluded: boolean;
  builtinsDisabled: boolean;

  packIds: ObjectId[];
  inventoryIds: ObjectId[];
}

export interface User {
  discordId: string;
  availableTokens: number;
  dailyTimestamp: Date;
  guarantees: number[];
  likes: Like[];

  inventoryIds: ObjectId[];
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
    member1Id?: ObjectId;
    member2Id?: ObjectId;
    member3Id?: ObjectId;
    member4Id?: ObjectId;
    member5Id?: ObjectId;
  };
}

export type PopulatedInventory = WithId<Inventory> & {
  user: WithId<User>;
  guild: WithId<Guild>;
  party: {
    member1?: Character;
    member2?: Character;
    member3?: Character;
    member4?: Character;
    member5?: Character;
  };
};

export interface Character {
  characterId: string;
  mediaId: string;

  rating: number;
  nickname?: string;
  image?: string;

  combat: CharacterCombat;

  guildId: string;
  userId: string;
  inventoryId: ObjectId;
}

export type PopulatedCharacter = WithId<Inventory> & {
  user: WithId<User>;
  guild: WithId<Guild>;
  inventory: WithId<Inventory>;
};

export interface Pack {
  owner: string;
  createdAt: Date;
  updatedAt: Date;
  manifest: Manifest;
  approved: boolean;
  hidden: boolean;

  // version: number;
  // servers?: number;
  // guildIds: ObjectId[];
}

export interface AcquiredCharacterSkill {
  level: number;
}

export interface CharacterCombat {
  exp: number;
  level: number;

  skillPoints: number;
  skills: Partial<Record<SkillKey, AcquiredCharacterSkill>>;

  // unclaimedStatsPoints?: number;
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

// export interface PackInstall {
//   pack: string;
//   timestamp: string;
//   by: string;
// }

export interface Party {
  member1?: Character;
  member2?: Character;
  member3?: Character;
  member4?: Character;
  member5?: Character;
}
