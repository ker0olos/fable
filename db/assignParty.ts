/// <reference lib="deno.unstable" />

import { charactersByInstancePrefix, inventoriesByUser } from './indices.ts';

import db, { kv } from './mod.ts';

import { KvError } from '../src/errors.ts';

import type * as Schema from './schema.ts';

export async function assignCharacter(
  user: Schema.User,
  instance: Schema.Instance,
  characterId: string,
  spot?: number,
): Promise<Schema.Character> {
  const { inventory, inventoryCheck } = await db.getInventory(instance, user);

  const character = await db.getValue<Schema.Character>([
    ...charactersByInstancePrefix(instance._id),
    characterId,
  ]);

  if (!character) {
    throw new Error('CHARACTER_NOT_FOUND');
  }

  if (character.inventory !== inventory._id) {
    throw new Error('CHARACTER_NOT_OWNED');
  }

  inventory.party ??= {};

  if (typeof spot === 'number' && spot >= 1 && spot <= 5) {
    switch (spot) {
      case 1:
        inventory.party.member1 = character._id;
        break;
      case 2:
        inventory.party.member2 = character._id;
        break;
      case 3:
        inventory.party.member3 = character._id;
        break;
      case 4:
        inventory.party.member4 = character._id;
        break;
      case 5:
        inventory.party.member5 = character._id;
        break;
    }
  } else if (!inventory.party.member1) {
    inventory.party.member1 = character._id;
  } else if (!inventory.party.member2) {
    inventory.party.member2 = character._id;
  } else if (!inventory.party.member3) {
    inventory.party.member3 = character._id;
  } else if (!inventory.party.member4) {
    inventory.party.member4 = character._id;
  } else {
    inventory.party.member5 = character._id;
  }

  const update = await kv.atomic()
    .check(inventoryCheck)
    //
    .set(['inventories', inventory._id], inventory)
    .set(inventoriesByUser(instance._id, user._id), inventory)
    //
    .commit();

  if (update.ok) {
    return character;
  }

  throw new KvError('failed to update inventory');
}

export async function swapSpots(
  user: Schema.User,
  instance: Schema.Instance,
  a: number,
  b: number,
): Promise<Schema.Party> {
  const { inventory, inventoryCheck } = await db.getInventory(instance, user);

  inventory.party ??= {};

  const party = [
    inventory.party.member1,
    inventory.party.member2,
    inventory.party.member3,
    inventory.party.member4,
    inventory.party.member5,
  ];

  const t = party[a - 1];

  party[a - 1] = party[b - 1];

  party[b - 1] = t;

  inventory.party.member1 = party[0];
  inventory.party.member2 = party[1];
  inventory.party.member3 = party[2];
  inventory.party.member4 = party[3];
  inventory.party.member5 = party[4];

  const update = await kv.atomic()
    .check(inventoryCheck)
    //
    .set(['inventories', inventory._id], inventory)
    .set(inventoriesByUser(instance._id, user._id), inventory)
    //
    .commit();

  if (update.ok) {
    return await db.getUserParty(inventory);
  }

  throw new KvError('failed to update inventory');
}

export async function unassignCharacter(
  user: Schema.User,
  instance: Schema.Instance,
  spot: number,
): Promise<Schema.Character | undefined> {
  const { inventory, inventoryCheck } = await db.getInventory(instance, user);

  inventory.party ??= {};

  const party = [
    inventory.party.member1,
    inventory.party.member2,
    inventory.party.member3,
    inventory.party.member4,
    inventory.party.member5,
  ];

  const t = party[spot - 1];

  if (!t) {
    return;
  }

  party[spot - 1] = undefined;

  inventory.party.member1 = party[0];
  inventory.party.member2 = party[1];
  inventory.party.member3 = party[2];
  inventory.party.member4 = party[3];
  inventory.party.member5 = party[4];

  const update = await kv.atomic()
    .check(inventoryCheck)
    //
    .set(['inventories', inventory._id], inventory)
    .set(inventoriesByUser(instance._id, user._id), inventory)
    //
    .commit();

  if (update.ok) {
    const character = await db.getValue<Schema.Character>(['characters', t]);

    return character ?? undefined;
  }

  throw new KvError('failed to update inventory');
}
