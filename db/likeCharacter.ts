import db from '~/db/mod.ts';

import { newUser } from '~/db/getInventory.ts';

export async function likeCharacter(
  userId: string,
  characterId: string,
): Promise<void> {
  await db.users().updateOne(
    { discordId: userId },
    {
      $setOnInsert: newUser(userId, ['likes']),
      $addToSet: { likes: { characterId } },
    },
    { upsert: true },
  );
}

export async function unlikeCharacter(
  userId: string,
  characterId: string,
): Promise<void> {
  await db.users().updateOne(
    { discordId: userId },
    { $pull: { likes: { characterId } } },
  );
}

export async function likeMedia(
  userId: string,
  mediaId: string,
): Promise<void> {
  await db.users().updateOne(
    { discordId: userId },
    {
      $setOnInsert: newUser(userId, ['likes']),
      $addToSet: { likes: { mediaId } },
    },
    { upsert: true },
  );
}

export async function unlikeMedia(
  userId: string,
  mediaId: string,
): Promise<void> {
  await db.users().updateOne(
    { discordId: userId },
    { $pull: { likes: { mediaId } } },
  );
}
