import prisma from '~/prisma/index.ts';

export async function setCharacterNickname(
  userId: string,
  guildId: string,
  characterId: string,
  nickname?: string
) {
  return await prisma.character.update({
    where: { characterId_userId_guildId: { characterId, userId, guildId } },
    data: { nickname: nickname ?? null },
  });
}

export async function setCharacterImage(
  userId: string,
  guildId: string,
  characterId: string,
  image?: string
) {
  return await prisma.character.update({
    where: { characterId_userId_guildId: { characterId, userId, guildId } },
    data: { image: image ?? null },
  });
}
