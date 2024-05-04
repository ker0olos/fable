import { Mongo } from '~/db/mod.ts';

import { Chat } from '~/db/schema.ts';

// export async function getChatHistory(
//   guildId: string,
//   userId: string,
//   characterId: string,
// ): Promise<Chat | null> {
//   const db = new Mongo();

//   try {
//     await db.connect();

//     return await db.chat().findOne(
//       { userId, guildId, characterId },
//     );
//   } finally {
//     await db.close();
//   }
// }

export async function addChatMessage(
  { guildId, userId, characterId, role, content }: {
    guildId: string;
    userId: string;
    characterId: string;
    role: 'user' | 'assistant';
    content: string;
  },
): Promise<Chat | null> {
  const db = new Mongo();

  try {
    await db.connect();

    const chat = await db.chat().findOneAndUpdate(
      { userId, guildId, characterId },
      {
        $setOnInsert: {
          createdAt: new Date(),
          userId,
          guildId,
          characterId,
        },
        $set: { updatedAt: new Date() },
        $addToSet: { messages: { role, content } },
      },
      { upsert: true },
    );

    return chat;
  } finally {
    await db.close();
  }
}
