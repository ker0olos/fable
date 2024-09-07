import { Mongo } from '~/db/mod.ts';

import type * as Schema from '~/db/schema.ts';

async function populateCharacters(
  matchCondition: import('mongodb').Document,
  db?: Mongo,
  manual?: boolean,
): Promise<Schema.PopulatedCharacter[]> {
  db ??= new Mongo();

  let results: Schema.PopulatedCharacter[];

  try {
    !manual && await db.connect();

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
    !manual && await db.close();
  }

  return results;
}

export async function findGuildCharacters(
  guildId: string,
  db?: Mongo,
  manual?: boolean,
): Promise<Schema.Character[]> {
  db ??= new Mongo();
  try {
    !manual && await db.connect();
    return db.characters().find({ guildId }).toArray();
  } finally {
    !manual && await db.close();
  }
}

export async function findCharacter(
  guildId: string,
  characterId: string,
  db?: Mongo,
  manual?: boolean,
): Promise<Schema.PopulatedCharacter[]> {
  return (await populateCharacters({
    characterId,
    guildId,
    db,
    manual,
  }));
}

export async function findOneCharacter(
  guildId: string,
  userId: string,
  characterId: string,
  db?: Mongo,
  manual?: boolean,
): Promise<Schema.PopulatedCharacter | undefined> {
  return (await populateCharacters({
    characterId,
    userId,
    guildId,
    db,
    manual,
  }))[0];
}

export async function findCharacters(
  guildId: string,
  charactersIds: string[],
  db?: Mongo,
  manual?: boolean,
): Promise<(Schema.PopulatedCharacter | undefined)[]> {
  const result = await populateCharacters({
    characterId: { $in: charactersIds },
    guildId,
    db,
    manual,
  });

  const map = new Map(result.map((char) => [char.characterId, char]));

  return charactersIds.map((id) => map.get(id));
}
