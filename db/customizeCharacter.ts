import db from '~/db/mod.ts';

import type * as Schema from './schema.ts';

export async function setCharacterNickname(
  userId: string,
  guildId: string,
  characterId: string,
  nickname?: string,
): Promise<Schema.Character | null> {
  const character = await db.characters().findOneAndUpdate(
    { userId, guildId, characterId },
    nickname ? { $set: { nickname } } : { $unset: { nickname: '' } },
    { returnDocument: 'after' },
  );

  return character;
}

export async function setCharacterImage(
  userId: string,
  guildId: string,
  characterId: string,
  image?: string,
): Promise<Schema.Character | null> {
  const character = await db.characters().findOneAndUpdate(
    { userId, guildId, characterId },
    image ? { $set: { image } } : { $unset: { image: '' } },
    { returnDocument: 'after' },
  );

  return character;
}
