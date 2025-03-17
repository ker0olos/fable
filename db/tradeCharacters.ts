import utils from '~/src/utils.ts';

import { NonFetalError } from '~/src/errors.ts';
import prisma from '~/prisma/index.ts';

export const STEAL_COOLDOWN_HOURS = 3 * 24;

export async function giveCharacters({
  aUserId,
  bUserId,
  guildId,
  giveIds,
}: {
  aUserId: string;
  bUserId: string;
  guildId: string;
  giveIds: string[];
}) {
  await prisma.$transaction(async (prisma) => {
    const giveCharacters = await prisma.character.findMany({
      include: { inventory: true },
      where: {
        characterId: { in: giveIds },
        userId: aUserId,
        guildId,
      },
    });

    if (giveCharacters.length !== giveIds.length) {
      throw new NonFetalError('NOT_OWNED');
    }

    const aInventory = giveCharacters[0].inventory;

    const aParty = [
      aInventory.partyMember1Id,
      aInventory.partyMember2Id,
      aInventory.partyMember3Id,
      aInventory.partyMember4Id,
      aInventory.partyMember5Id,
    ].filter(utils.nonNullable);

    if (
      giveCharacters.some(({ characterId }) =>
        aParty.some((member) => member === characterId)
      )
    ) {
      throw new NonFetalError('CHARACTER_IN_PARTY');
    }

    await prisma.inventory.upsert({
      where: { userId_guildId: { userId: bUserId, guildId } },
      create: { userId: bUserId, guildId },
      update: {},
    });

    await prisma.character.updateMany({
      where: { characterId: { in: giveIds } },
      data: { userId: bUserId },
    });
  });
}

export async function tradeCharacters({
  aUserId,
  bUserId,
  guildId,
  giveIds,
  takeIds,
}: {
  aUserId: string;
  bUserId: string;
  guildId: string;
  giveIds: string[];
  takeIds: string[];
}) {
  await prisma.$transaction(async (prisma) => {
    const giveCharacters = await prisma.character.findMany({
      include: { inventory: true },
      where: {
        characterId: { in: giveIds },
        userId: aUserId,
        guildId,
      },
    });

    const takeCharacters = await prisma.character.findMany({
      include: { inventory: true },
      where: {
        characterId: { in: takeIds },
        userId: bUserId,
        guildId,
      },
    });

    if (
      giveCharacters.length !== giveIds.length ||
      takeCharacters.length !== takeIds.length
    ) {
      throw new NonFetalError('NOT_OWNED');
    }

    const aInventory = giveCharacters[0].inventory;
    const bInventory = takeCharacters[0].inventory;

    const aParty = [
      aInventory.partyMember1Id,
      aInventory.partyMember2Id,
      aInventory.partyMember3Id,
      aInventory.partyMember4Id,
      aInventory.partyMember5Id,
    ].filter(utils.nonNullable);

    const bParty = [
      bInventory.partyMember1Id,
      bInventory.partyMember2Id,
      bInventory.partyMember3Id,
      bInventory.partyMember4Id,
      bInventory.partyMember5Id,
    ].filter(utils.nonNullable);

    if (
      giveCharacters.some(({ characterId }) =>
        aParty.some((member) => member === characterId)
      ) ||
      takeCharacters.some(({ characterId }) =>
        bParty.some((member) => member === characterId)
      )
    ) {
      throw new NonFetalError('CHARACTER_IN_PARTY');
    }

    await prisma.character.updateMany({
      where: { characterId: { in: giveIds } },
      data: { userId: bUserId },
    });

    await prisma.character.updateMany({
      where: { characterId: { in: takeIds } },
      data: { userId: aUserId },
    });
  });
}

export async function stealCharacter(
  userId: string,
  guildId: string,
  characterId: string
) {
  await prisma.$transaction(async (prisma) => {
    const character = await prisma.character.findUnique({
      where: { characterId_userId_guildId: { characterId, userId, guildId } },
      include: { inventory: true },
    });

    if (!character) {
      throw new NonFetalError('NOT_FOUND');
    }

    const partyMembers = [
      character.inventory.partyMember1Id,
      character.inventory.partyMember2Id,
      character.inventory.partyMember3Id,
      character.inventory.partyMember4Id,
      character.inventory.partyMember5Id,
    ].filter(utils.nonNullable);

    // if stealing a party member
    // we must remove the character from the target user party
    // in the same transaction
    partyMembers.forEach(async (memberId, i) => {
      if (memberId !== characterId) return;
      await prisma.inventory.update({
        where: { userId_guildId: { userId, guildId } },
        data: { [`partyMember${i + 1}Id`]: null },
      });
    });

    await prisma.inventory.upsert({
      where: { userId_guildId: { userId, guildId } },
      create: { userId, guildId, stealTimestamp: new Date() },
      update: { stealTimestamp: new Date() },
    });

    await prisma.character.update({
      where: { characterId_userId_guildId: { characterId, userId, guildId } },
      data: { userId },
    });
  });
}

export async function failSteal(guildId: string, userId: string) {
  await prisma.inventory.upsert({
    where: { userId_guildId: { userId, guildId } },
    create: { userId, guildId, stealTimestamp: new Date() },
    update: { stealTimestamp: new Date() },
  });
}
