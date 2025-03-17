import { NoPullsError } from '~/src/errors.ts';

import db from './index.ts';

export async function addCharacter({
  rating,
  mediaId,
  characterId,
  guaranteed,
  userId,
  guildId,
  sacrifices,
}: {
  rating: number;
  mediaId: string;
  characterId: string;
  guaranteed: boolean;
  userId: string;
  guildId: string;
  sacrifices?: string[];
}): Promise<void> {
  await db.rechargeConsumables(
    guildId,
    userId,
    async (prisma, inventory, user) => {
      if (!guaranteed && !sacrifices?.length && inventory.availablePulls <= 0) {
        throw new NoPullsError(inventory.rechargeTimestamp);
      }

      if (
        guaranteed &&
        !sacrifices?.length &&
        !user?.guarantees?.includes(rating)
      ) {
        throw new Error('403');
      }

      await prisma.character.create({
        data: {
          inventory: { connect: { userId_guildId: { userId, guildId } } },
          guild: { connect: { id: guildId } },
          user: { connect: { id: userId } },
          characterId,
          mediaId,
          rating,
        },
      });

      if (sacrifices?.length) {
        await prisma.character.deleteMany({
          where: { characterId: { in: sacrifices } },
        });
      } else if (guaranteed) {
        const i = user.guarantees.indexOf(rating);

        user.guarantees.splice(i, 1);

        await prisma.user.update({
          where: { id: userId },
          data: { guarantees: { set: user.guarantees } },
        });
      } else {
        inventory.availablePulls = inventory.availablePulls - 1;
        inventory.rechargeTimestamp = inventory.rechargeTimestamp ?? new Date();
      }

      await prisma.inventory.update({
        where: { userId_guildId: { userId, guildId } },
        data: {
          lastPull: new Date(),
          availablePulls: inventory.availablePulls,
          rechargeTimestamp: inventory.rechargeTimestamp,
        },
      });
    }
  );
}
