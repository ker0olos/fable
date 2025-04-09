import prisma from '~/prisma/index.ts';

export async function findGuildCharacters(guildId: string) {
  return await prisma.character.findMany({
    select: { characterId: true, userId: true },
    where: { guildId },
  });
}

export async function findCharacter(guildId: string, characterId: string) {
  return await prisma.character.findMany({
    include: { inventory: true, user: true },
    where: { guildId, characterId },
  });
}

export async function findOneCharacter(
  guildId: string,
  userId: string,
  characterId: string
) {
  return await prisma.character.findUnique({
    include: { inventory: true, user: true },
    where: { characterId_userId_guildId: { characterId, userId, guildId } },
  });
}

export async function findCharacters(guildId: string, charactersIds: string[]) {
  return await prisma.character.findMany({
    include: { inventory: true, user: true },
    where: { guildId, characterId: { in: charactersIds } },
  });
}
