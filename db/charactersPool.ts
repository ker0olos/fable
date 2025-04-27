import { Mongo } from '~/db/index.ts';

import packs from '~/src/packs.ts';

import utils from '~/src/utils.ts';

import type { DisaggregatedCharacter } from '~/src/types.ts';

export async function ratingPool({
  guildId,
  rating,
}: {
  rating: number;
  guildId: string;
}) {
  const db = new Mongo();

  const list = await packs.all({ guildId });

  const packIds = list.map(({ manifest }) => manifest.id);

  try {
    await db.connect();

    const characters = await db
      .packCharacters()
      .find({ packId: { $in: packIds }, rating })
      .toArray();

    if (!characters) {
      throw new Error();
    }

    return characters;
  } catch (error) {
    console.error(error);
  } finally {
    await db.close();
  }

  return [];
}

export async function likesPool({
  guildId,
  // mediaIds,
  characterIds,
}: {
  mediaIds: string[];
  characterIds: string[];
  guildId: string;
}) {
  const db = new Mongo();

  const list = await packs.all({ guildId });

  try {
    await db.connect();

    const pool: DisaggregatedCharacter[] = [];

    const characters = characterIds
      .map((id) => packs.parseId(id))
      .filter(utils.nonNullable)
      .filter(([packId]) => {
        const pack = list.some(({ manifest }) => manifest.id === packId);
        return pack;
      });

    const queries = characters.map(async ([packId, id]) => {
      const item = await db.packCharacters().findOne({ packId, id });
      if (item) pool.push(item);
    });

    await Promise.allSettled(queries);
    await db.close();

    return pool;
  } catch (error) {
    console.error(error);
  } finally {
    await db.close();
  }

  return [];
}
