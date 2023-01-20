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
  Internet = 'INTERNET',
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
  extraLarge?: string;
  large?: string;
  medium?: string;
  color?: string;
};

export interface Media {
  id: string;
  packId?: string;
  type: MediaType;
  format: MediaFormat;
  title: Alias;
  description?: string;
  popularity?: number;
  coverImage?: Image;
  externalLinks?: {
    site: string;
    url: string;
  }[];
  trailer?: {
    id: string;
    site: string;
  };
  relations?: {
    edges: {
      relation: MediaRelation;
      node: Media;
    }[];
  };
  characters?: {
    edges: { role: CharacterRole; node: Character }[];
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
  image?: Image;
  media?: {
    edges: { role: CharacterRole; node: Media }[];
  };
}

export type DisaggregatedCharacter = Modify<Character, {
  media?: {
    role: CharacterRole;
    mediaId: string;
  }[];
}>;

export type Pool = { [id: string]: Character | DisaggregatedCharacter };

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
