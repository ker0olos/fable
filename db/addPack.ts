import prisma from '~/prisma/index.ts';

import type { Pack } from '@prisma/client';
export async function publishPack(
  userId: string,
  pack: Partial<Pack> & { id: string }
): Promise<void> {
  // not assignable by API
  // create an object without ownerId, approved, hidden
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { ownerId, approved, hidden, ...packData } = pack;

  await prisma.pack.upsert({
    where: { id: pack.id },
    create: { ...packData, ownerId: userId },
    update: packData,
  });
}

export async function addPack(userId: string, guildId: string, packId: string) {
  const pack = await prisma.pack.findFirst({
    where: {
      id: packId,
      OR: [
        { private: { not: true } },
        { ownerId: userId },
        { maintainers: { some: { id: userId } } },
      ],
    },
    include: { maintainers: true },
  });

  if (!pack) {
    return null;
  }

  await prisma.packInstall.upsert({
    where: { packId_guildId: { packId, guildId } },
    create: { packId, guildId, byId: userId },
    update: {},
  });

  return pack;
}

export async function removePack(guildId: string, packId: string) {
  const pack = await prisma.packInstall.findUnique({
    where: { packId_guildId: { packId, guildId } },
    include: { pack: true },
  });

  if (!pack) {
    return null;
  }

  await prisma.packInstall.delete({
    where: { packId_guildId: { packId, guildId } },
  });

  return pack.pack;
}
