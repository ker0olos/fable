import {
  Character,
  CharacterRole,
  Media,
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
  status?: Status;
  nextAiringEpisode?: {
    airingAt?: number;
  };
}>;

export type AniListCharacter = Modify<Character, {
  name: {
    full: string;
    native?: string;
    alternative?: string[];
    alternativeSpoiler?: string[];
  };
}>;

export type { CharacterRole, Pool };
