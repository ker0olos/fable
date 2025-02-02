import { Mongo } from '~/db/mod.ts';

import type * as Schema from '~/db/schema.ts';

type PopularPack = {
  servers: number;
  pack: Schema.Pack;
};

export async function getPopularPacks(
  offset = 0,
  limit = 20,
): Promise<PopularPack[]> {
  const db = new Mongo();

  let packs: PopularPack[];

  try {
    await db.connect();

    packs = await db.guilds().aggregate()
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
  } finally {
    await db.close();
  }

  return packs;
}

export async function getLastUpdatedPacks(
  offset = 0,
  limit = 20,
): Promise<Schema.Pack[]> {
  const db = new Mongo();

  let packs: Schema.Pack[];

  try {
    await db.connect();

    packs = await db.packs().aggregate()
      .match({
        $and: [
          { 'hidden': false },
          {
            $or: [
              { 'manifest.nsfw': false },
              { 'manifest.nsfw': null },
            ],
          },
          {
            $or: [
              { 'manifest.private': false },
              { 'manifest.private': null },
            ],
          },
        ],
      })
      .sort({ updatedAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray() as Schema.Pack[];
  } finally {
    await db.close();
  }

  return packs;
}

export async function getPacksByMaintainerId(
  userId: string,
  offset = 0,
  limit = 20,
): Promise<Schema.Pack[]> {
  const db = new Mongo();

  let packs: Schema.Pack[];

  try {
    await db.connect();

    packs = await db.packs()
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
  } finally {
    await db.close();
  }

  return packs;
}

export async function getPack(
  manifestId: string,
  userId?: string,
): Promise<Schema.Pack | null> {
  const db = new Mongo();

  let pack: Schema.Pack;

  try {
    await db.connect();

    if (typeof userId === 'string') {
      pack = await db.packs()
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
        }) as Schema.Pack;
    } else {
      pack = await db.packs()
        .findOne({
          'manifest.id': manifestId,
          $or: [
            { 'manifest.private': null },
            { 'manifest.private': false },
          ],
        }) as Schema.Pack;
    }
  } finally {
    await db.close();
  }

  return pack;
}
