import db from '~/db/mod.ts';

import type {
  DisaggregatedCharacter,
  DisaggregatedMedia,
} from '~/src/types.ts';

export async function media(
  ids: number[],
): Promise<DisaggregatedMedia[]> {
  if (!ids.length) return [];
  return await db.anime.media().find({ id: { $all: ids } }).toArray();
}

export async function characters(
  ids: number[],
): Promise<DisaggregatedCharacter[]> {
  if (!ids.length) return [];
  return await db.anime.characters().find({ id: { $all: ids } }).toArray();
}
