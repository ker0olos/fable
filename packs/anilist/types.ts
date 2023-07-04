import {
  Character,
  CharacterRole,
  Media,
  MediaRelation,
  Modify,
  Pool,
} from '../../src/types.ts';

export enum Status {
  'FINISHED' = 'FINISHED',
  'RELEASING' = 'RELEASING',
  'NOT_YET_RELEASED' = 'NOT_YET_RELEASED',
  'CANCELLED' = 'CANCELLED',
  'HIATUS' = 'HIATUS',
}

export type AniListMedia = Modify<Media, {
  title: {
    english?: string;
    romaji?: string;
    native?: string;
  };
  isAdult: boolean;
  tags?: { name: string }[];
  genres?: string[];
  synonyms?: string[];
  coverImage?: {
    extraLarge?: string;
  };
  status?: Status;
  nextAiringEpisode?: {
    airingAt?: number;
  };
  relations?: {
    edges: {
      relationType: MediaRelation;
      node: AniListMedia;
    }[];
  };
  characters?: {
    nodes?: AniListCharacter[];
    pageInfo: { hasNextPage: boolean };
    edges: { role: CharacterRole; node: AniListCharacter }[];
  };
}>;

export type AniListCharacter = Modify<Character, {
  name: {
    full: string;
    native?: string;
    alternative?: string[];
  };
  image?: {
    large?: string;
  };
  media?: {
    edges: { characterRole: CharacterRole; node: AniListMedia }[];
  };
}>;

export type { CharacterRole, Pool };
