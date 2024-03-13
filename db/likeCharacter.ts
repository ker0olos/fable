import database from '~/db/mod.ts';
import { newUser } from '~/db/getInventory.ts';

export async function likeCharacter(
  userId: string,
  characterId: string,
): Promise<void> {
  await database.users.updateOne(
    { userId },
    {
      $setOnInsert: newUser(userId),
      $push: { likes: { characterId } },
    },
    { upsert: true },
  );
}

export async function unlikeCharacter(
  userId: string,
  characterId: string,
): Promise<void> {
  await database.users.updateOne(
    { userId },
    { $pull: { likes: { characterId } } },
  );
}

export async function likeMedia(
  userId: string,
  mediaId: string,
): Promise<void> {
  await database.users.updateOne(
    { userId },
    {
      $setOnInsert: newUser(userId),
      $push: { likes: { mediaId } },
    },
    { upsert: true },
  );
}

export async function unlikeMedia(
  userId: string,
  mediaId: string,
): Promise<void> {
  await database.users.updateOne(
    { userId },
    { $pull: { likes: { mediaId } } },
  );
}
