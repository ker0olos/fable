import db from '~/db/mod.ts';

import type * as Schema from '~/db/schema.ts';

type PopularPack = {
  servers: number;
  pack: Schema.Pack;
};

export async function getPopularPacks(
  offset = 0,
  limit = 20,
): Promise<PopularPack[]> {
  const packs = await db.guilds().aggregate()
    .unwind('$packIds')
    .group({
      _id: '$packIds',
      servers: { $sum: 1 },
    })
    .lookup({
      from: 'packs',
      localField: '_id',
      foreignField: 'manifest.id',
      as: 'pack',
    })
    .unwind('$pack')
    .match({
      $and: [
        { 'pack.hidden': false },
        {
          $or: [
            { 'pack.manifest.nsfw': false },
            { 'pack.manifest.nsfw': null },
          ],
        },
        {
          $or: [
            { 'pack.manifest.private': false },
            { 'pack.manifest.private': null },
          ],
        },
      ],
    })
    .sort({ servers: -1 })
    .skip(offset)
    .limit(limit)
    .project({ _id: 0 })
    .toArray() as PopularPack[];

  return packs;
}

export async function getPacksByMaintainerId(
  userId: string,
  offset = 0,
  limit = 20,
): Promise<Schema.Pack[]> {
  const packs = await db.packs()
    .find({
      $or: [
        { owner: userId },
        { 'manifest.maintainers': { $in: [userId] } },
      ],
    })
    .sort({ updatedAt: -1 })
    .skip(offset)
    .limit(limit)
    .toArray();

  return packs;
}

export async function getPack(
  manifestId: string,
  userId?: string,
): Promise<Schema.Pack | null> {
  if (typeof userId === 'string') {
    return await db.packs()
      .findOne({
        'manifest.id': manifestId,
        $or: [
          { 'manifest.private': null },
          { 'manifest.private': false },
          {
            'manifest.private': true,
            $or: [
              { owner: userId },
              { 'manifest.maintainers': { $in: [userId] } },
            ],
          },
        ],
      });
  } else {
    return await db.packs()
      .findOne({
        'manifest.id': manifestId,
        $or: [
          { 'manifest.private': null },
          { 'manifest.private': false },
        ],
      });
  }
}
