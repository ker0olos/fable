import prisma from '~/prisma/index.ts';

import { STEAL_COOLDOWN_HOURS } from '~/db/index.ts';

import utils from '~/src/utils.ts';

import type { Inventory, User } from '@prisma/client/edge';

export const MAX_PULLS = 5;
export const RECHARGE_MINS = 30;
export const RECHARGE_DAILY_TOKENS_HOURS = 12;

export async function getUser(userId: string) {
  return await prisma.user.upsert({
    include: { likes: true },
    where: { id: userId },
    create: { id: userId },
    update: {},
  });
}

export async function getGuild(guildId: string) {
  return await prisma.guild.upsert({
    include: {
      options: true,
      packs: {
        include: {
          pack: {
            include: {
              owner: true,
              maintainers: true,
              characters: {
                include: {
                  externalLinks: true,
                  media: {
                    include: {
                      media: { include: { externalLinks: true } },
                      node: { include: { externalLinks: true } },
                    },
                  },
                },
              },
              media: {
                include: {
                  externalLinks: true,
                  media: {
                    include: {
                      node: { include: { externalLinks: true } },
                    },
                  },
                  characters: {
                    include: {
                      node: { include: { externalLinks: true } },
                      media: { include: { externalLinks: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    where: { id: guildId },
    update: {},
    create: {
      id: guildId,
      packs: {
        createMany: { data: [{ packId: 'vtubers' }, { packId: 'anilist' }] },
      },
    },
  });
}

export async function getInventory(guildId: string, userId: string) {
  return await prisma.inventory.upsert({
    include: {
      user: { include: { likes: true } },
      partyMember1: { include: { character: true, media: true } },
      partyMember2: { include: { character: true, media: true } },
      partyMember3: { include: { character: true, media: true } },
      partyMember4: { include: { character: true, media: true } },
      partyMember5: { include: { character: true, media: true } },
    },
    where: { userId_guildId: { userId, guildId } },
    create: { userId, guildId },
    update: {},
  });
}

export async function rechargeConsumables(
  guildId: string,
  userId: string,
  transaction?: (
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    inventory: Inventory,
    user: User
  ) => Promise<void>
) {
  return await prisma.$transaction(async (prisma) => {
    let inventory = await prisma.inventory.upsert({
      include: { user: true },
      where: { userId_guildId: { userId, guildId } },
      create: {
        user: {
          connectOrCreate: { where: { id: userId }, create: { id: userId } },
        },
        guild: {
          connectOrCreate: { where: { id: guildId }, create: { id: guildId } },
        },
      },
      update: {},
    });

    const { user } = inventory;

    const pullsTimestamp = inventory.rechargeTimestamp ?? new Date();

    const currentPulls = inventory.availablePulls;

    const newPulls = Math.max(
      0,
      Math.min(
        MAX_PULLS - currentPulls,
        Math.trunc(
          utils.diffInMinutes(pullsTimestamp, new Date()) / RECHARGE_MINS
        )
      )
    );

    const { dailyTimestamp } = user;

    const newDailyTokens =
      utils.diffInHours(dailyTimestamp, new Date()) >=
      RECHARGE_DAILY_TOKENS_HOURS;

    const stealTimestamp = inventory.stealTimestamp;

    const resetSteal =
      stealTimestamp &&
      utils.diffInHours(stealTimestamp, new Date()) >= STEAL_COOLDOWN_HOURS;

    if (!newPulls && !newDailyTokens && !resetSteal) {
      return inventory;
    }

    const rechargedPulls = currentPulls + newPulls;

    const $set: Partial<Inventory> = {};

    $set.availablePulls = Math.min(99, rechargedPulls);

    if (rechargedPulls < MAX_PULLS) {
      $set.rechargeTimestamp = new Date(
        pullsTimestamp.getTime() + newPulls * RECHARGE_MINS * 60000
      );
    } else {
      $set.rechargeTimestamp = null;
    }

    if (newDailyTokens) {
      let newTokens = 1;

      // reward extra token on weekends
      switch (utils.getDayOfWeek()) {
        case 'Friday':
        case 'Saturday':
        case 'Sunday':
          newTokens += 1;
          break;
        default:
          break;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          dailyTimestamp: new Date(),
          availableTokens: user.availableTokens + newTokens,
        },
      });
    }

    if (resetSteal) {
      $set.stealTimestamp = null;
    }

    inventory = await prisma.inventory.update({
      include: { user: true },
      where: { userId_guildId: { userId, guildId } },
      data: $set,
    });

    if (transaction) await transaction(prisma, inventory, inventory.user);

    return inventory;
  });
}

export async function getActiveUsersIfLiked(
  guildId: string,
  characterId: string,
  mediaIds: string[]
): Promise<string[]> {
  const twoWeeksAgo = new Date();

  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7 * 2);

  const activeInvs = await prisma.inventory.findMany({
    where: { guildId, lastPull: { gte: twoWeeksAgo } },
  });

  const activeUsers = activeInvs.map(({ userId }) => userId);

  const likes = await prisma.like.findMany({
    where: {
      userId: { in: activeUsers },
      OR: [{ mediaId: { in: mediaIds } }, { characterId }],
    },
  });

  return likes.map(({ userId }) => userId);
}

export async function getUserCharacters(userId: string, guildId: string) {
  return await prisma.character.findMany({
    where: { userId, guildId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getGuildCharacters(guildId: string) {
  return await prisma.character.findMany({
    where: { guildId },
  });
}

export async function getMediaCharacters(guildId: string, mediaIds: string[]) {
  return await prisma.character.findMany({
    where: { guildId, mediaId: { in: mediaIds } },
  });
}
