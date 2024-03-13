import database from '~/db/mod.ts';

import type * as Schema from '~/db/schema.ts';

export async function getAllPublicPacks(): Promise<Schema.Pack[]> {
  return await database.packs.find({
    $and: [
      { hidden: false },
      { $or: [{ 'manifest.nsfw': false }, { 'manifest.nsfw': null }] },
      { $or: [{ 'manifest.private': false }, { 'manifest.private': null }] },
    ],
  }).toArray();
}

export async function getPacksByMaintainerId(
  userId: string,
): Promise<Schema.Pack[]> {
  return await database.packs.find({
    owner: userId,
    'manifest.maintainers': { $in: [userId] },
  }).toArray();
}
