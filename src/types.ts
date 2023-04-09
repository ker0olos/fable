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
    'ALL': { id: string; rating: number }[];
    [CharacterRole.Main]: { id: string; rating: number }[];
    [CharacterRole.Supporting]: { id: string; rating: number }[];
    [CharacterRole.Background]: { id: string; rating: number }[];
  };
};

export type PoolInfo = {
  pool: number;
  popularityChance?: number;
  popularityGreater?: number;
  popularityLesser?: number;
  roleChance?: number;
  role?: CharacterRole;
};

export enum PackType {
  Builtin = 'builtin',
  Community = 'community',
}

export interface Manifest {
  id: string;
  title?: string;
  description?: string;
  nsfw?: boolean;
  author?: string;
  image?: string;
  url?: string;
  depends?: string[];
  conflicts?: string[];
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
}

export interface Pack {
  id?: number;
  installedBy?: {
    id: string;
  };
  manifest: Manifest;
  type: PackType;
}

// deno-lint-ignore no-namespace
export namespace Schema {
  export type Character = {
    id: string;
    rating: number;
    mediaId: string;
    user: { id: string };
    nickname?: string;
    image?: string;
  };
  export type User = {
    lastVote?: string;
    totalVotes?: number;
    availableVotes?: number;
    guarantees?: number[];
    badges: {
      name: string;
      description: string;
      emote: string;
    }[];
  };
  export type Inventory = {
    availablePulls: number;
    rechargeTimestamp?: string;
    lastPull?: string;
    characters: Character[];
    user: User;
    party?: {
      member1?: Character;
      member2?: Character;
      member3?: Character;
      member4?: Character;
      member5?: Character;
    };
  };
  export type Mutation =
    | {
      ok: false;
      error: 'CHARACTER_EXISTS';
    }
    | {
      ok: false;
      error: 'CHARACTER_NOT_FOUND';
    }
    | {
      ok: false;
      error: 'PACK_NOT_FOUND';
    }
    | {
      ok: false;
      error: 'NO_GUARANTEES';
      user: User;
    }
    | {
      ok: false;
      error: 'PACK_NOT_INSTALLED';
    }
    | {
      ok: false;
      error: 'PACK_ID_CHANGED';
      manifest: Manifest;
    }
    | {
      ok: false;
      error: 'NO_PULLS_AVAILABLE';
      inventory: Inventory;
    }
    | {
      ok: false;
      error: 'CHARACTER_NOT_OWNED';
      character: Character;
    }
    | {
      ok: false;
      error: 'CHARACTER_IN_PARTY';
    }
    | {
      ok: true;
      user: User;
      inventory: Inventory;
      character: Character;
      manifest: Manifest;
    };
}

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
