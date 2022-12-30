export enum TYPE {
  'ANIME' = 'ANIME',
  'MANGA' = 'MANGA',
}

export enum RELATION_TYPE {
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

export enum STATUS {
  'FINISHED' = 'FINISHED',
  'RELEASING' = 'RELEASING',
  'NOT_YET_RELEASED' = 'NOT_YET_RELEASED',
  'CANCELLED' = 'CANCELLED',
  'HIATUS' = 'HIATUS',
}

export enum FORMAT {
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

export enum CHARACTER_ROLE {
  'MAIN' = 'MAIN',
  'SUPPORTING' = 'SUPPORTING',
  'BACKGROUND' = 'BACKGROUND',
}

export type Media = {
  type: TYPE;
  format: FORMAT;
  title: {
    english?: string;
    romaji?: string;
    native?: string;
  };
  externalLinks: {
    site: string;
    url: string;
  }[];
  nextAiringEpisode?: {
    airingAt?: number;
  };
  id?: number;
  status: STATUS;
  relations: {
    edges: {
      relationType: RELATION_TYPE;
      node: Media;
    }[];
  };
  popularity?: number;
  description?: string;
  characters?: {
    nodes?: Character[];
    edges?: { role: CHARACTER_ROLE; node: Character }[];
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
};

export type Character = {
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
    edges?: { characterRole: CHARACTER_ROLE; node: Media }[];
  };
};
