import { Mongo } from '~/db/index.ts';

import { newUser } from '~/db/getInventory.ts';

export async function likeCharacter(
  userId: string,
  characterId: string
): Promise<void> {
  const db = new Mongo();

  try {
    await db.connect();

    await db.users().updateOne(
      { discordId: userId },
      {
        $setOnInsert: newUser(userId, ['likes']),
        $addToSet: { likes: { characterId } },
      },
      { upsert: true }
    );
  } finally {
    await db.close();
  }
}

export async function unlikeCharacter(
  userId: string,
  characterId: string
): Promise<void> {
  const db = new Mongo();

  try {
    await db.connect();

    await db
      .users()
      .updateOne({ discordId: userId }, { $pull: { likes: { characterId } } });
  } finally {
    await db.close();
  }
}

export async function likeMedia(
  userId: string,
  mediaId: string
): Promise<void> {
  const db = new Mongo();

  try {
    await db.connect();

    await db.users().updateOne(
      { discordId: userId },
      {
        $setOnInsert: newUser(userId, ['likes']),
        $addToSet: { likes: { mediaId } },
      },
      { upsert: true }
    );
  } finally {
    await db.close();
  }
}

export async function unlikeMedia(
  userId: string,
  mediaId: string
): Promise<void> {
  const db = new Mongo();

  try {
    await db.connect();

    await db
      .users()
      .updateOne({ discordId: userId }, { $pull: { likes: { mediaId } } });
  } finally {
    await db.close();
  }
}
