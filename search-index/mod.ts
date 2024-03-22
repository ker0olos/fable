import { join } from '$std/path/mod.ts';

import { restore } from '~/search-index/persist.ts';

import {
  create,
  insert,
  type Orama,
  type Results,
  search,
  type TypedDocument,
} from 'orama';

import type { CharacterRole } from '~/src/types.ts';

const dirname = new URL('.', import.meta.url).pathname;

export const mediaIndexCachePath = join(dirname, './media');
export const charactersIndexCachePath = join(dirname, './characters');

export type IndexedCharacter = {
  name: string[];
  mediaTitle: string[];
  popularity: number;
  role: CharacterRole;
  rating: number;
};

export type IndexedMedia = {
  title: string[];
  popularity: number;
};

export const charactersSchema = {
  name: 'string[]',
  mediaTitle: 'string[]',
  popularity: 'number',
  role: 'enum',
  rating: 'number',
} as const;

export const mediaSchema = {
  title: 'string[]',
  popularity: 'number',
} as const;

type CharacterDocument = TypedDocument<Orama<typeof charactersSchema>>;
type MediaDocument = TypedDocument<Orama<typeof mediaSchema>>;

export type CharacterIndex = Orama<typeof charactersSchema>;
export type CharacterSearch = Results<CharacterDocument>;
export type MediaSearch = Results<MediaDocument>;

export const loadMediaIndex = async (
  builtinEnabled: boolean,
): Promise<Orama<typeof mediaSchema>> =>
  builtinEnabled ? await restore(mediaIndexCachePath) : await create({
    schema: mediaSchema,
  });

export const loadCharactersIndex = async (
  builtinEnabled: boolean,
): Promise<Orama<typeof charactersSchema>> =>
  builtinEnabled ? await restore(charactersIndexCachePath) : await create({
    schema: charactersSchema,
  });

export { insert, search };
