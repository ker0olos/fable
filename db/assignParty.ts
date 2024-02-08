import {
  charactersByInstancePrefix,
  charactersByInventoryPrefix,
  charactersByMediaIdPrefix,
  inventoriesByUser,
} from '~/db/indices.ts';

import db, { kv } from '~/db/mod.ts';

import { KvError } from '~/src/errors.ts';

import type * as Schema from '~/db/schema.ts';

export async function assignCharacter(
  user: Schema.User,
  instance: Schema.Instance,
  characterId: string,
  spot?: number,
): Promise<Schema.Character> {
  let retries = 0;

  while (retries < 5) {
    const { inventory, inventoryCheck } = await db.getInventory(instance, user);

    const characterCheck = await db.getValueAndTimestamp<Schema.Character>([
      ...charactersByInstancePrefix(instance._id),
      characterId,
    ]);

    if (!characterCheck?.value) {
      throw new Error('CHARACTER_NOT_FOUND');
    }

    const character = db.unsureInitStats(characterCheck.value);

    if (character.inventory !== inventory._id) {
      throw new Error('CHARACTER_NOT_OWNED');
    }

    inventory.party ??= {};

    // remove character from party
    // if they already are in it
    [
      inventory.party.member1,
      inventory.party.member2,
      inventory.party.member3,
      inventory.party.member4,
      inventory.party.member5,
    ].forEach((id, i) => {
      type T = keyof typeof inventory.party;
      if (character._id === id) {
        // deno-lint-ignore no-non-null-assertion
        delete inventory.party![`member${i + 1}` as T];
      }
    });

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
      .check(characterCheck)
      //
      .set(['inventories', inventory._id], inventory)
      .set(inventoriesByUser(instance._id, user._id), inventory)
      //
      .set(['characters', character._id], character)
      .set(
        [
          ...charactersByInstancePrefix(character.instance),
          character.id,
        ],
        character,
      )
      .set(
        [
          ...charactersByInventoryPrefix(character.inventory),
          character._id,
        ],
        character,
      )
      .set(
        [
          ...charactersByMediaIdPrefix(character.instance, character.mediaId),
          character._id,
        ],
        character,
      )
      .commit();

    if (update.ok) {
      return character;
    }

    retries += 1;
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
