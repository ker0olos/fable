import { Mongo } from '~/db/index.ts';

import { newGuild } from '~/db/getInventory.ts';

import type {
  DisaggregatedCharacter,
  DisaggregatedMedia,
  Manifest,
} from '~/src/types.ts';

import type * as Schema from '~/db/schema.ts';

export async function publishPack(
  userId: string,
  manifest: Manifest,
  characters?: DisaggregatedCharacter[],
  media?: DisaggregatedMedia[]
): Promise<void> {
  const db = new Mongo();

  try {
    await db.connect();

    const newPack: Omit<Omit<Schema.Pack, 'updatedAt'>, 'manifest'> = {
      owner: userId,
      createdAt: new Date(),
      approved: false,
      hidden: false,
    };

    await db.packs().updateOne(
      {
        'manifest.id': manifest.id,
        $or: [{ owner: userId }, { 'manifest.maintainers': { $in: [userId] } }],
      },
      {
        $setOnInsert: newPack, // new
        $set: { manifest, updatedAt: new Date() }, // update existing
      },
      { upsert: true }
    );

    await Promise.all(
      (characters ?? []).map(async (char) => {
        char.packId = manifest.id;

        return db
          .packCharacters()
          .findOneAndUpdate(
            { packId: manifest.id, id: char.id },
            { $set: char, $setOnInsert: char },
            { upsert: true }
          );
      })
    );

    await Promise.all(
      (media ?? []).map(async (media) => {
        media.packId = manifest.id;

        return db
          .packMedia()
          .findOneAndUpdate(
            { packId: manifest.id },
            { $set: media, $setOnInsert: media },
            { upsert: true }
          );
      })
    );
  } finally {
    await db.close();
  }
}

export async function addPack(
  userId: string,
  guildId: string,
  manifestId: string
): Promise<Schema.Pack | null> {
  const db = new Mongo();

  let result: Schema.Pack;

  try {
    await db.connect();

    const pack = await db.packs().findOne({ 'manifest.id': manifestId });

    if (!pack) {
      await db.close();
      return null;
    }

    if (
      pack.manifest.private &&
      pack.owner !== userId &&
      !pack.manifest.maintainers?.includes(userId)
    ) {
      await db.close();
      return null;
    }

    const guild = await db.guilds().findOneAndUpdate(
      { discordId: guildId },
      {
        $setOnInsert: newGuild(guildId, ['packIds']),
        $addToSet: { packIds: manifestId },
      },
      { upsert: true, returnDocument: 'after' }
    );

    if (!guild) {
      await db.close();
      return null;
    }

    result = pack;
  } finally {
    await db.close();
  }

  return result;
}

export async function removePack(
  guildId: string,
  manifestId: string
): Promise<Schema.Pack | null> {
  const db = new Mongo();

  let result: Schema.Pack | null;

  try {
    await db.connect();

    const pack = await db.packs().findOne({ 'manifest.id': manifestId });

    if (!pack) {
      await db.close();
      return null;
    }

    const guild = await db
      .guilds()
      .findOneAndUpdate(
        { discordId: guildId },
        { $pull: { packIds: manifestId } },
        { returnDocument: 'after' }
      );

    if (!guild) {
      await db.close();
      return null;
    }

    result = pack;
  } finally {
    await db.close();
  }

  return result;
}
