import prisma from '~/prisma/index.ts';

export async function invertDupes(guildId: string) {
  const options = await prisma.options.findUnique({
    where: { guildId },
  });

  const { guild, ...updatedOptions } = await prisma.options.upsert({
    include: { guild: true },
    where: { guildId },
    create: {
      guildId,
      dupes: false,
    },
    update: {
      dupes: {
        set: !(options?.dupes ?? true),
      },
    },
  });

  return { ...guild, options: updatedOptions };
}
