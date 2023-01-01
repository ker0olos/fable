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
  type: Type;
  format: Format;
  title: {
    english?: string;
    romaji?: string;
    native?: string;
  };
  externalLinks: {
    site: string;
    url: string;
  }[];
  id?: number;
  relations: {
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
    extraLarge: string;
    large: string;
    medium: string;
    color?: string;
  };
  trailer?: {
    id: string;
    site: string;
  };
}

export interface Character {
  name: {
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

export type CommandDeclaration = {
  source: string;
  description: string;
  options: {
    id: string;
    type: string;
    description: string;
  }[];
};

export type Manifest = {
  id: string;
  title: string;
  description: string;
  url?: string;
  source?: string;
  commands?: { [key: string]: CommandDeclaration };
};

declare module '*.json' {
  const value: Manifest;
  export default value;
}
