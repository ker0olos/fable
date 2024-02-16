import type { Keys } from '../src/i18n.ts';

import type { AcquiredCharacterSkill, CharacterStats } from '../db/schema.ts';

export type Modify<T, R> = Omit<T, keyof R> & R;

export enum MediaType {
  Anime = 'ANIME',
  Manga = 'MANGA',
  Other = 'OTHER',
}

export enum MediaFormat {
  TV = 'TV',
  TvShort = 'TV_SHORT',
  Movie = 'MOVIE',
  Special = 'SPECIAL',
  OVA = 'OVA',
  ONA = 'ONA',
  Music = 'MUSIC',
  Manga = 'MANGA',
  Novel = 'NOVEL',
  OneShot = 'ONE_SHOT',
  VideoGame = 'VIDEO_GAME',
}

export enum MediaRelation {
  Adaptation = 'ADAPTATION',
  Prequel = 'PREQUEL',
  Sequel = 'SEQUEL',
  Parent = 'PARENT',
  Contains = 'CONTAINS',
  SideStory = 'SIDE_STORY',
  // Character = 'CHARACTER',
  // Summary = 'SUMMARY',
  // Alternative = 'ALTERNATIVE',
  SpinOff = 'SPIN_OFF',
  Other = 'OTHER',
  // Source = 'SOURCE',
  // Compilation = 'COMPILATION',
}

export enum CharacterRole {
  Main = 'MAIN',
  Supporting = 'SUPPORTING',
  Background = 'BACKGROUND',
}

export type Alias = {
  english?: string;
  romaji?: string;
  native?: string;
  alternative?: string[];
};

export type Image = {
  url: string;
  artist?: {
    username: string;
    url?: string;
  };
};

export type MediaEdge = { node: Media; relation?: MediaRelation };
export type CharacterEdge = { node: Character; role?: CharacterRole };
export type CharacterMediaEdge = { node: Media; role?: CharacterRole };

export interface Media {
  id: string;
  title: Alias;
  type: MediaType;
  packId?: string;
  added?: string;
  updated?: string;
  format?: MediaFormat;
  description?: string;
  popularity?: number;
  images?: Image[];
  externalLinks?: {
    site: string;
    url: string;
  }[];
  trailer?: {
    id: string;
    site: string;
  };
  relations?: {
    edges: MediaEdge[];
  };
  characters?: {
    edges: CharacterEdge[];
  };
}

export type DisaggregatedMedia = Modify<Media, {
  relations?: {
    relation: MediaRelation;
    mediaId: string;
  }[];
  characters?: {
    role: CharacterRole;
    characterId: string;
  }[];
}>;

export interface Character {
  id: string;
  name: Alias;
  packId?: string;
  added?: string;
  updated?: string;
  description?: string;
  popularity?: number;
  gender?: string;
  age?: string;
  images?: Image[];
  externalLinks?: {
    site: string;
    url: string;
  }[];
  media?: {
    edges: CharacterMediaEdge[];
  };
}

export type DisaggregatedCharacter = Modify<Character, {
  media?: {
    role: CharacterRole;
    mediaId: string;
  }[];
}>;

export type Pool = {
  [key: string]: {
    'ALL': { id: string; mediaId: string; rating: number }[];
    [CharacterRole.Main]: { id: string; mediaId: string; rating: number }[];
    [CharacterRole.Supporting]: {
      id: string;
      mediaId: string;
      rating: number;
    }[];
    [CharacterRole.Background]: {
      id: string;
      mediaId: string;
      rating: number;
    }[];
  };
};

export interface Manifest {
  id: string;
  title?: string;
  description?: string;
  author?: string;
  image?: string;
  url?: string;
  nsfw?: boolean;
  webhookUrl?: string;
  private?: boolean;
  maintainers?: string[];
  conflicts?: string[];
  media?: {
    new?: DisaggregatedMedia[];
  };
  characters?: {
    new?: DisaggregatedCharacter[];
  };
}

// Combat

export type CharacterState = CharacterStats & {
  skills: Record<string, AcquiredCharacterSkill>;
  hp: number;
  maxHP: number;
};

export interface SkillOutput {
  damage?: number;
}

export interface CharacterSkill {
  key: Keys;
  descKey: Keys;

  cost: number;

  activation: (
    attacking: CharacterState,
    receiving: CharacterState,
    lvl: number,
  ) => SkillOutput;

  stats: CharacterAdditionalStat[];
}

export interface CharacterAdditionalStat {
  key: Keys;
  scale: number[];
  prefix?: string;
  suffix?: string;
}
