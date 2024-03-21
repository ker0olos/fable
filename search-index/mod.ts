import { join } from '$std/path/mod.ts';

import { restore } from '~/search-index/persist.ts';

import type { Orama } from 'orama';

import type { CharacterRole } from '~/src/types.ts';

const dirname = new URL('.', import.meta.url).pathname;

export const mediaIndexCachePath = join(dirname, './media.msp');
export const charactersIndexCachePath = join(dirname, './characters.msp');

export type IndexedCharacter = Orama<{
  id: string;
  name: string[];
  mediaTitle: string[];
  popularity: number;
  role: CharacterRole;
}>;

export type IndexedMedia = Orama<{
  id: string;
  title: string[];
  popularity: number;
}>;

export const charactersSchema = {
  id: 'string',
  name: 'string[]',
  mediaTitle: 'string[]',
  popularity: 'number',
  role: 'enum',
} as const;

export const mediaSchema = {
  id: 'string',
  title: 'string[]',
  popularity: 'number',
} as const;

// const searchParams: SearchParams<Orama<typeof characterSchema>> = {
//   term: 'luka',
// };

// const result: Results<TypedDocument<IndexedCharacter>> = await search(characterDB, searchParams);

export const loadMediaIndex = () =>
  restore<Orama<typeof mediaSchema>>(mediaIndexCachePath);

export const loadCharactersIndex = () =>
  restore<Orama<typeof charactersSchema>>(charactersIndexCachePath);
