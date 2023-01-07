import { Character, CharacterRole, Media, Pool } from '../../src/types.ts';

export enum Status {
  'FINISHED' = 'FINISHED',
  'RELEASING' = 'RELEASING',
  'NOT_YET_RELEASED' = 'NOT_YET_RELEASED',
  'CANCELLED' = 'CANCELLED',
  'HIATUS' = 'HIATUS',
}

export interface AniListMedia extends Media {
  nextAiringEpisode?: {
    airingAt?: number;
  };
  status: Status;
}

export type { Character, CharacterRole, Pool };
