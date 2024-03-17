import db from '~/db/mod.ts';

import { newGuild } from '~/db/getInventory.ts';

import type { Manifest } from '~/src/types.ts';

import type * as Schema from '~/db/schema.ts';

export async function publishPack(
  userId: string,
  manifest: Manifest,
): Promise<void> {
  const newPack: Omit<Omit<Schema.Pack, 'updatedAt'>, 'manifest'> = {
    owner: userId,
    createdAt: new Date(),
    approved: false,
    hidden: false,
  };

  await db.packs().updateOne(
    {
      'manifest.id': manifest.id,
      $or: [
        { owner: userId },
        { 'manifest.maintainers': { $in: [userId] } },
      ],
    },
    {
      $setOnInsert: newPack, // new
      $set: { manifest, updatedAt: new Date() }, // update existing
    },
    { upsert: true },
  );
}

export async function addPack(
  userId: string,
  guildId: string,
  manifestId: string,
): Promise<Schema.Pack | null> {
  const pack = await db.packs().findOne(
    { 'manifest.id': manifestId },
  );

  if (!pack) {
    return null;
  }

  if (
    pack.manifest.private && pack.owner !== userId &&
    !pack.manifest.maintainers?.includes(userId)
  ) {
    return null;
  }

  const guild = await db.guilds().findOneAndUpdate(
    { discordId: guildId },
    {
      $setOnInsert: newGuild(guildId, ['packIds']),
      $addToSet: { packIds: manifestId },
    },
    { upsert: true, returnDocument: 'after' },
  );

  if (!guild) {
    return null;
  }

  return pack;
}

export async function removePack(
  guildId: string,
  manifestId: string,
): Promise<Schema.Pack | null> {
  const pack = await db.packs().findOne(
    { 'manifest.id': manifestId },
  );

  if (!pack) {
    return null;
  }

  const guild = await db.guilds().findOneAndUpdate(
    { discordId: guildId },
    { $pull: { packIds: manifestId } },
    { returnDocument: 'after' },
  );

  if (!guild) {
    return null;
  }

  return pack;
}
