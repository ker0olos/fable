export type Modify<T, R> = Omit<T, keyof R> & R;

export enum MediaType {
  Anime = 'ANIME',
  Manga = 'MANGA',
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
  packId?: string;
  type: MediaType;
  format?: MediaFormat;
  title: Alias;
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
    'ALL': { id: string }[];
    [CharacterRole.Main]: { id: string }[];
    [CharacterRole.Supporting]: { id: string }[];
    [CharacterRole.Background]: { id: string }[];
  };
};

export type PoolInfo = {
  pool: number;
  popularityChance: number;
  popularityGreater: number;
  popularityLesser?: number;
  roleChance?: number;
  role?: CharacterRole;
};

export enum ManifestType {
  Builtin = 'builtin',
  Manual = 'manual',
}

export interface Manifest {
  id: string;
  title?: string;
  description?: string;
  nsfw?: boolean;
  author?: string;
  image?: string;
  url?: string;
  // TODO BLOCKED load manual packs
  depends?: string[];
  // TODO BLOCKED load manual packs
  conflicts?: string[];
  // TODO BLOCKED load manual packs
  addedBy?: string;
  media?: {
    conflicts?: string[];
    new?: DisaggregatedMedia[];
  };
  characters?: {
    conflicts?: string[];
    new?: DisaggregatedCharacter[];
  };
  // properties available for builtin packs only
  commands?: { [key: string]: Command };
  // properties set internally on load
  type?: ManifestType;
}

export type Inventory = {
  lastPull?: string;
  availablePulls: number;
  characters: { id: string; mediaId: string; rating: number }[];
};

export type Mutation = {
  ok: false;
  error: 'CHARACTER_EXISTS';
} | {
  ok: false;
  error: 'NO_PULLS_AVAILABLE';
  inventory: Inventory;
} | {
  ok: true;
  inventory: Inventory;
};

type Command = {
  source: string;
  description: string;
  options: {
    id: string;
    type: string;
    description: string;
    required?: boolean;
  }[];
};
