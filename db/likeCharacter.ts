import database from '~/db/mod.ts';

import type * as Schema from './schema.ts';

export async function likeCharacter(
  userId: string,
  characterId: string,
): Promise<void> {
  await database.users.updateOne(
    { userId },
    { $push: { likes: { characterId } } },
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
    { $push: { likes: { mediaId } } },
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
