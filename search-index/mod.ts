import type { Orama } from 'orama';

import type { CharacterRole } from '~/src/types.ts';

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

export const characterSchema = {
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

// const characterDB: Orama<typeof characterSchema> = await create({
//   schema: characterSchema,
// });

// const result: Results<TypedDocument<IndexedCharacter>> = await search(characterDB, searchParams);
