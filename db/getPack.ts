import prisma from '~/prisma/index.ts';

export async function getPopularPacks(offset = 0, limit = 20) {
  const result = await prisma.packInstall.groupBy({
    by: ['packId'],
    where: {
      pack: {
        hidden: { not: true },
        private: { not: true },
        nsfw: { not: true },
      },
    },
    _count: {
      packId: true,
    },
    orderBy: {
      _count: {
        packId: 'desc',
      },
    },
    skip: offset,
    take: limit,
  });

  const packs = await prisma.pack.findMany({
    include: { media: true, characters: true },
    where: {
      id: { in: result.map((pack) => pack.packId) },
    },
  });

  return packs.map((pack) => {
    const servers = result.find((r) => r.packId === pack.id)?._count?.packId;
    return {
      servers: servers || 0,
      pack,
    };
  });
}

export async function getLastUpdatedPacks(offset = 0, limit = 20) {
  return await prisma.pack.findMany({
    include: { media: true, characters: true },
    where: {
      hidden: { not: true },
      private: { not: true },
      nsfw: { not: true },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    skip: offset,
    take: limit,
  });
}

export async function getPacksByMaintainerId(
  userId: string,
  offset = 0,
  limit = 20
) {
  return await prisma.pack.findMany({
    where: {
      maintainers: {
        every: {
          id: userId,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    skip: offset,
    take: limit,
  });
}

export async function getPack(manifestId: string, userId?: string) {
  if (typeof userId === 'string') {
    return await prisma.pack.findFirst({
      where: {
        id: manifestId,
        OR: [
          { private: { not: true } },
          {
            private: true,
            OR: [
              { ownerId: userId },
              { maintainers: { every: { id: userId } } },
            ],
          },
        ],
      },
    });
  } else {
    return await prisma.pack.findFirst({
      where: {
        id: manifestId,
        OR: [{ private: { not: true } }],
      },
    });
  }
}

export async function searchPacks(query: string, offset = 0, limit = 20) {
  return await prisma.pack.findMany({
    include: { media: true, characters: true },
    where: {
      hidden: { not: true },
      private: { not: true },
      nsfw: { not: true },
      OR: [{ title: { search: query } }, { id: { search: query } }],
    },
    orderBy: { updatedAt: 'desc' },
    skip: offset,
    take: limit,
  });
}
