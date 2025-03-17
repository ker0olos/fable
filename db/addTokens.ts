import prisma from '~/prisma/index.ts';

export const COSTS = {
  THREE: 4,
  FOUR: 12,
  FIVE: 28,
};

export async function addTokens(userId: string, amount: number): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { availableTokens: { increment: amount } },
  });
}

export async function addPulls(
  userId: string,
  guildId: string,
  amount: number,
  free: boolean = false
): Promise<void> {
  await prisma.$transaction(async (prisma) => {
    if (!free) {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { availableTokens: { decrement: amount } },
      });

      if (user?.availableTokens < 0) {
        throw new Error('INSUFFICIENT_TOKENS');
      }

      await prisma.inventory.update({
        where: { userId_guildId: { userId, guildId } },
        data: { availablePulls: { increment: amount } },
      });
    }
  });
}

export async function addGuarantee(
  userId: string,
  guarantee: number
): Promise<void> {
  const cost =
    guarantee === 5 ? COSTS.FIVE : guarantee === 4 ? COSTS.FOUR : COSTS.THREE;

  await prisma.$transaction(async (prisma) => {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        availableTokens: { decrement: cost },
        guarantees: { push: guarantee },
      },
    });

    if (user?.availableTokens < 0) {
      throw new Error('INSUFFICIENT_TOKENS');
    }
  });
}
