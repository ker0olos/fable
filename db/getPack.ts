import database from '~/db/mod.ts';

import type * as Schema from '~/db/schema.ts';

export async function getPopularPacks(
  offset = 0,
  limit = 20,
): Promise<Schema.Pack[]> {
  const packs = await database.guilds.aggregate()
    .lookup({
      from: 'packs',
      localField: 'packIds',
      foreignField: '_id',
      as: 'packs',
    })
    .match({
      $and: [
        { 'packs.hidden': false },
        {
          $or: [{ 'packs.manifest.nsfw': false }, {
            'packs.manifest.nsfw': null,
          }],
        },
        {
          $or: [{ 'packs.manifest.private': false }, {
            'packs.manifest.private': null,
          }],
        },
      ],
    })
    .group({
      _id: '$packs._id',
      count: { $sum: 1 },
    })
    .sort({ count: -1 })
    .skip(offset)
    .limit(limit)
    .toArray() as Schema.Pack[];

  return packs;
}

export async function getPacksByMaintainerId(
  userId: string,
  offset = 0,
  limit = 20,
): Promise<Schema.Pack[]> {
  const packs = await database.packs
    .find({ owner: userId, 'manifest.maintainers': { $in: [userId] } })
    .sort({ updatedAt: -1 })
    .skip(offset)
    .limit(limit)
    .toArray();

  return packs;
}

export async function getPack(
  manifestId: string,
): Promise<Schema.Pack | null> {
  return await database.packs
    .findOne({ 'manifest.id': manifestId });
}
