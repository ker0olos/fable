import { Mongo } from '~/db/index.ts';

import type { WithId } from 'mongodb';

import type * as Schema from '~/db/schema.ts';

export async function setCharacterNickname(
  userId: string,
  guildId: string,
  characterId: string,
  nickname?: string
): Promise<WithId<Schema.Character> | null> {
  const db = new Mongo();

  let result: WithId<Schema.Character> | null;

  try {
    await db.connect();

    result = await db
      .characters()
      .findOneAndUpdate(
        { userId, guildId, characterId },
        nickname ? { $set: { nickname } } : { $unset: { nickname: '' } },
        { returnDocument: 'after' }
      );
  } finally {
    await db.close();
  }

  return result;
}

export async function setCharacterImage(
  userId: string,
  guildId: string,
  characterId: string,
  image?: string
): Promise<WithId<Schema.Character> | null> {
  const db = new Mongo();

  let result: WithId<Schema.Character> | null;

  try {
    await db.connect();

    result = await db
      .characters()
      .findOneAndUpdate(
        { userId, guildId, characterId },
        image ? { $set: { image } } : { $unset: { image: '' } },
        { returnDocument: 'after' }
      );
  } finally {
    await db.close();
  }

  return result;
}
