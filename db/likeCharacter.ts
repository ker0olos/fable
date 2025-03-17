import prisma from '~/prisma/index.ts';

export async function likeCharacter(
  userId: string,
  characterId: string
): Promise<void> {
  await prisma.like.create({
    data: {
      characterId,
      user: {
        connectOrCreate: {
          where: { id: userId },
          create: { id: userId },
        },
      },
    },
  });
}

export async function unlikeCharacter(
  userId: string,
  characterId: string
): Promise<void> {
  await prisma.like.delete({
    where: {
      userId_characterId: {
        userId,
        characterId,
      },
    },
  });
}

export async function likeMedia(
  userId: string,
  mediaId: string
): Promise<void> {
  await prisma.like.create({
    data: {
      mediaId,
      user: {
        connectOrCreate: {
          where: { id: userId },
          create: { id: userId },
        },
      },
    },
  });
}

export async function unlikeMedia(
  userId: string,
  mediaId: string
): Promise<void> {
  await prisma.like.delete({
    where: {
      userId_mediaId: {
        userId,
        mediaId,
      },
    },
  });
}
