type Modify<T, R> = Omit<T, keyof R> & R;

export enum Type {
  Anime = 'ANIME',
  Manga = 'MANGA',
}

export enum RelationType {
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

export enum Format {
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

export enum CharacterRole {
  Main = 'MAIN',
  Supporting = 'SUPPORTING',
  Background = 'BACKGROUND',
}

export enum Behavior {
  New = 'NEW',
  Override = 'OVERRIDE',
  Extend = 'EXTEND',
}

type ID = string | number;

export type Image = {
  extraLarge?: string;
  large?: string;
  medium?: string;
  color?: string;
};

export interface Media {
  id?: number;
  type?: Type;
  format?: Format;
  title?: {
    english?: string;
    romaji?: string;
    native?: string;
  };
  popularity?: number;
  description?: string;
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
      relationType: RelationType;
      node: Media;
    }[];
  };
  characters?: {
    nodes?: Character[];
    edges?: { role: CharacterRole; node: Character }[];
  };
}

export type PackMedia = Modify<Media, {
  id: ID;
  behavior?: Behavior;
  relations: {
    relationType: RelationType;
    characterId: number;
  }[];
  characters: {
    relationType: CharacterRole;
    characterId: ID;
  }[];
}>;

export interface Character {
  name?: {
    full: string;
    native?: string;
    alternative?: string[];
    alternativeSpoiler?: string[];
  };
  id?: number;
  description?: string;
  gender?: string;
  age?: string;
  image?: Image;
  media?: {
    nodes?: Media[];
    edges?: { characterRole: CharacterRole; node: Media }[];
  };
}

export type PackCharacter = Modify<Character, {
  id: ID;
  behavior?: Behavior;
  media: {
    relationType: CharacterRole;
    mediaId: ID;
  }[];
}>;

export type Pool = { [id: number]: Character };

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
  media?: PackMedia[];
  characters?: PackCharacter[];
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
