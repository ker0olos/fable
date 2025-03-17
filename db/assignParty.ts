import { Inventory } from '@prisma/client/edge';
import prisma from '~/prisma/index.ts';

export async function assignCharacter(
  userId: string,
  guildId: string,
  characterId: string,
  spot?: 1 | 2 | 3 | 4 | 5
) {
  const [character, inventory] = await prisma.$transaction([
    prisma.character.findUnique({
      where: { characterId_userId_guildId: { userId, guildId, characterId } },
    }),
    prisma.inventory.findUnique({
      where: { userId_guildId: { userId, guildId } },
    }),
  ]);

  if (!character || !inventory) {
    throw new Error();
  }

  let {
    partyMember1Id,
    partyMember2Id,
    partyMember3Id,
    partyMember4Id,
    partyMember5Id,
  } = inventory;

  // if the character is already in the party, remove them
  if (partyMember1Id === characterId) {
    partyMember1Id = null;
  } else if (partyMember2Id === characterId) {
    partyMember2Id = null;
  } else if (partyMember3Id === characterId) {
    partyMember3Id = null;
  } else if (partyMember4Id === characterId) {
    partyMember4Id = null;
  } else if (partyMember5Id === characterId) {
    partyMember5Id = null;
  }

  // if spot is not provided, assign the character to the first available spot
  if (typeof spot !== 'number') {
    if (!partyMember1Id) {
      spot = 1;
    } else if (!partyMember2Id) {
      spot = 2;
    } else if (!partyMember3Id) {
      spot = 3;
    } else if (!partyMember4Id) {
      spot = 4;
    } else {
      spot = 5;
    }
  }

  switch (spot) {
    case 1:
      partyMember1Id = characterId;
      break;
    case 2:
      partyMember2Id = characterId;
      break;
    case 3:
      partyMember3Id = characterId;
      break;
    case 4:
      partyMember4Id = characterId;
      break;
    case 5:
      partyMember5Id = characterId;
      break;
  }

  await prisma.inventory.update({
    where: { userId_guildId: { userId, guildId } },
    data: {
      partyMember1Id,
      partyMember2Id,
      partyMember3Id,
      partyMember4Id,
      partyMember5Id,
    },
  });

  return character;
}

export async function swapSpots(
  inventory: Inventory,
  a: 1 | 2 | 3 | 4 | 5,
  b: 1 | 2 | 3 | 4 | 5
) {
  const temp = inventory[`partyMember${a}Id`];
  inventory[`partyMember${a}Id`] = inventory[`partyMember${b}Id`];
  inventory[`partyMember${b}Id`] = temp;

  await prisma.inventory.update({
    where: {
      userId_guildId: { userId: inventory.userId, guildId: inventory.guildId },
    },
    data: {
      partyMember1Id: inventory.partyMember1Id,
      partyMember2Id: inventory.partyMember2Id,
      partyMember3Id: inventory.partyMember3Id,
      partyMember4Id: inventory.partyMember4Id,
      partyMember5Id: inventory.partyMember5Id,
    },
  });
}

export async function unassignCharacter(
  userId: string,
  guildId: string,
  spot: 1 | 2 | 3 | 4 | 5
) {
  await prisma.inventory.update({
    where: { userId_guildId: { userId, guildId } },
    data: { [`partyMember${spot}Id`]: null },
  });
}

export async function clearParty(userId: string, guildId: string) {
  await prisma.inventory.update({
    where: { userId_guildId: { userId, guildId } },
    data: {
      partyMember1Id: null,
      partyMember2Id: null,
      partyMember3Id: null,
      partyMember4Id: null,
      partyMember5Id: null,
    },
  });
}
