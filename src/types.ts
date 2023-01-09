// deno-lint-ignore-file camelcase

export enum Type {
  'ANIME' = 'ANIME',
  'MANGA' = 'MANGA',
}

export enum RelationType {
  'ADAPTATION' = 'ADAPTATION',
  'PREQUEL' = 'PREQUEL',
  'SEQUEL' = 'SEQUEL',
  'PARENT' = 'PARENT',
  'SIDE_STORY' = 'SIDE_STORY',
  'CHARACTER' = 'CHARACTER',
  'SUMMARY' = 'SUMMARY',
  'ALTERNATIVE' = 'ALTERNATIVE',
  'SPIN_OFF' = 'SPIN_OFF',
  'OTHER' = 'OTHER',
  'SOURCE' = 'SOURCE',
  'COMPILATION' = 'COMPILATION',
  'CONTAINS' = 'CONTAINS',
}

export enum Format {
  'TV' = 'TV',
  'TV_SHORT' = 'TV_SHORT',
  'MOVIE' = 'MOVIE',
  'SPECIAL' = 'SPECIAL',
  'OVA' = 'OVA',
  'ONA' = 'ONA',
  'MUSIC' = 'MUSIC',
  'MANGA' = 'MANGA',
  'NOVEL' = 'NOVEL',
  'ONE_SHOT' = 'ONE_SHOT',
}

export enum CharacterRole {
  'MAIN' = 'MAIN',
  'SUPPORTING' = 'SUPPORTING',
  'BACKGROUND' = 'BACKGROUND',
}

export interface Media {
  // deno-lint-ignore no-explicit-any
  [x: string]: any;
  type?: Type;
  format?: Format;
  title?: {
    english?: string;
    romaji?: string;
    native?: string;
  };
  externalLinks?: {
    site: string;
    url: string;
  }[];
  id?: number;
  relations?: {
    edges: {
      relationType: RelationType;
      node: Media;
    }[];
  };
  popularity?: number;
  description?: string;
  characters?: {
    nodes?: Character[];
    edges?: { role: CharacterRole; node: Character }[];
  };
  coverImage?: {
    extraLarge?: string;
    large?: string;
    medium?: string;
    color?: string;
  };
  trailer?: {
    id: string;
    site: string;
  };
}

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
  image?: {
    large: string;
  };
  media?: {
    nodes?: Media[];
    edges?: { characterRole: CharacterRole; node: Media }[];
  };
}

export type Pool = { [id: number]: Character };

export enum ManifestType {
  Builtin = 'builtin',
  Manual = 'manual',
}

export interface Manifest {
  /** A unique alphanumeric id (must match /^[a-z][a-z0-9]+$/ */
  id: string;
  /** The display title of the pack */
  title: string;
  /** The type of the manifest */
  type?: ManifestType;
  /** A small description about the pack and what it contains */
  description?: string;
  /** The icon of the pack or the author of the pack */
  icon_url?: string;
  /** the name of the pack's author */
  author?: string;
  /** The url to pack's homepage */
  url?: string;
  /** If the pack contains nsfw (adult) content */
  nsfw?: boolean;
}

export interface Builtin extends Manifest {
  commands?: { [key: string]: PackCommand };
}

export type PackCommand = {
  source: string;
  description: string;
  options: {
    id: string;
    type: string;
    description: string;
  }[];
};
