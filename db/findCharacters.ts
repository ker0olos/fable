import database from '~/db/mod.ts';

import type * as Schema from '~/db/schema.ts';

async function aggregateCharacters(
  matchCondition: import('mongodb').Document,
): Promise<Schema.PopulatedCharacter[]> {
  const result = await database.characters.aggregate()
    .match(matchCondition)
    //
    .lookup({
      localField: 'userId',
      foreignField: 'discordId',
      from: 'users',
      as: 'user',
    })
    .lookup({
      localField: 'guildId',
      foreignField: 'discordId',
      from: 'guilds',
      as: 'guild',
    })
    .lookup({
      localField: 'inventoryId',
      foreignField: '_id',
      from: 'inventories',
      as: 'inventory',
    })
    //
    .unwind('user')
    .unwind('guild')
    .unwind('inventory')
    //
    .toArray();

  return result as Schema.PopulatedCharacter[];
}

export async function findCharacter(
  guildId: string,
  characterId: string,
): Promise<Schema.PopulatedCharacter | null> {
  return (await aggregateCharacters({
    characterId,
    guildId,
  }))[0];
}

export async function findCharacters(
  guildId: string,
  charactersIds: string[],
): Promise<Schema.PopulatedCharacter[]> {
  return await aggregateCharacters({
    characterId: { $in: charactersIds },
    guildId,
  });
}

export async function findMediaCharacters(
  guildId: string,
  mediaIds: string[],
): Promise<Schema.PopulatedCharacter[]> {
  return await aggregateCharacters({
    mediaId: { $in: mediaIds },
    guildId,
  });
}

export async function findUserCharacters(
  guildId: string,
  userId: string,
): Promise<Schema.PopulatedCharacter[]> {
  return await aggregateCharacters({
    userId,
    guildId,
  });
}
