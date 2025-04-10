import { Mongo } from '~/db/index.ts';

import type {
  DisaggregatedCharacter,
  DisaggregatedMedia,
} from '~/src/types.ts';

export async function media(ids?: string[]): Promise<DisaggregatedMedia[]> {
  if (!ids?.length) {
    return [];
  }

  const db = new Mongo();

  let results: DisaggregatedMedia[];

  try {
    await db.connect();

    results = await db.anime
      .media()
      .find({ id: { $in: ids } })
      .toArray();
  } finally {
    await db.close();
  }

  return results ?? [];
}

export async function characters(
  ids?: string[]
): Promise<DisaggregatedCharacter[]> {
  if (!ids?.length) {
    return [];
  }

  const db = new Mongo();

  let results: DisaggregatedCharacter[];

  try {
    await db.connect();

    results = await db.anime
      .characters()
      .find({ id: { $in: ids } })
      .toArray();
  } finally {
    await db.close();
  }

  return results ?? [];
}
