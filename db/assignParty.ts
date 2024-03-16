import db from '~/db/mod.ts';

import type * as Schema from '~/db/schema.ts';

export async function assignCharacter(
  userId: string,
  guildId: string,
  characterId: string,
  spot?: 1 | 2 | 3 | 4 | 5,
): Promise<Schema.Character> {
  const character = await db.characters().findOne(
    { userId, guildId, characterId },
  );

  if (!character) {
    throw new Error();
  }

  // deno-lint-ignore no-non-null-assertion
  const inventory = (await db.inventories().findOne({ userId, guildId }))!;

  // remove character from party
  // if they already are in it
  [
    inventory.party.member1Id,
    inventory.party.member2Id,
    inventory.party.member3Id,
    inventory.party.member4Id,
    inventory.party.member5Id,
  ].forEach((id, i) => {
    if (character._id === id) {
      delete inventory.party[`member${(i + 1) as 1 | 2 | 3 | 4 | 5}Id`];
    }
  });

  if (typeof spot === 'number' && spot >= 1 && spot <= 5) {
    switch (spot) {
      case 1:
        inventory.party.member1Id = character._id;
        break;
      case 2:
        inventory.party.member2Id = character._id;
        break;
      case 3:
        inventory.party.member3Id = character._id;
        break;
      case 4:
        inventory.party.member4Id = character._id;
        break;
      case 5:
        inventory.party.member5Id = character._id;
        break;
    }
  } else if (!inventory.party.member1Id) {
    inventory.party.member1Id = character._id;
  } else if (!inventory.party.member2Id) {
    inventory.party.member2Id = character._id;
  } else if (!inventory.party.member3Id) {
    inventory.party.member3Id = character._id;
  } else if (!inventory.party.member4Id) {
    inventory.party.member4Id = character._id;
  } else {
    inventory.party.member5Id = character._id;
  }

  await db.inventories().updateOne(
    { _id: inventory._id },
    { $set: { party: inventory.party } },
  );

  return character;
}

export async function swapSpots(
  inventory: Schema.PopulatedInventory,
  a: 1 | 2 | 3 | 4 | 5,
  b: 1 | 2 | 3 | 4 | 5,
): Promise<void> {
  const temp = inventory.party[`member${a}Id`];

  inventory.party[`member${a}Id`] = inventory.party[`member${b}Id`];
  inventory.party[`member${b}Id`] = temp;

  await db.inventories().updateOne(
    { _id: inventory._id },
    { $set: { party: inventory.party } },
  );
}

export async function unassignCharacter(
  userId: string,
  guildId: string,
  spot: 1 | 2 | 3 | 4 | 5,
): Promise<void> {
  await db.inventories().updateOne(
    { userId, guildId },
    { $unset: { [`party.member${spot}Id`]: '' } },
  );
}
