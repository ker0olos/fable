import { Mongo } from '~/db/mod.ts';

import type * as Schema from '~/db/schema.ts';

async function populateCharacters(
  matchCondition: import('mongodb').Document,
): Promise<Schema.PopulatedCharacter[]> {
  const db = new Mongo();

  let results: Schema.PopulatedCharacter[];

  try {
    await db.connect();

    const _results = await db.characters().aggregate()
      .match(matchCondition)
      .lookup({
        localField: 'inventoryId',
        foreignField: '_id',
        from: 'inventories',
        as: 'inventory',
      })
      .toArray() as Schema.PopulatedCharacter[];

    results = _results.map((char) => {
      if (Array.isArray(char.inventory) && char.inventory.length) {
        char.inventory = char.inventory[0];
      } else {
        throw new Error("inventory doesn't exist");
      }

      return char;
    });
  } finally {
    await db.close();
  }

  return results;
}

export async function findCharacter(
  guildId: string,
  characterId: string,
): Promise<Schema.PopulatedCharacter | null> {
  return (await populateCharacters({
    characterId,
    guildId,
  }))[0];
}

export async function findCharacters(
  guildId: string,
  charactersIds: string[],
): Promise<(Schema.PopulatedCharacter | undefined)[]> {
  const result = await populateCharacters({
    characterId: { $in: charactersIds },
    guildId,
  });

  const map = new Map(result.map((char) => [char.characterId, char]));

  return charactersIds.map((id) => map.get(id));
}
