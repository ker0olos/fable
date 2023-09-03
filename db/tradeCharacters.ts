/// <reference lib="deno.unstable" />

import {
  charactersByInstancePrefix,
  charactersByInventoryPrefix,
  charactersByMediaIdPrefix,
  inventoriesByUser,
} from './indices.ts';

import db, { kv } from './mod.ts';

import { KvError } from '../src/errors.ts';

import type * as Schema from './schema.ts';

export const COOLDOWN_DAYS = 3;

export async function tradeCharacters(
  {
    aUser,
    bUser,
    aInventory,
    bInventory,
    instance,
    giveIds,
    takeIds,
  }: {
    aUser: Schema.User;
    bUser: Schema.User;
    aInventory: Schema.Inventory;
    bInventory: Schema.Inventory;
    instance: Schema.Instance;
    giveIds: string[];
    takeIds: string[];
  },
): Promise<{ ok: boolean }> {
  let res = { ok: false }, retires = 0;

  while (!res.ok && retires < 5) {
    // TODO update once Deploy KV atomic ops limit
    // const op = kv.atomic();
    const ops: Deno.AtomicOperation[] = [];

    const [giveCharacters, takeCharacters] = await Promise.all([
      db.getManyValues<Schema.Character>(
        giveIds.map((id) => [...charactersByInstancePrefix(instance._id), id]),
      ),
      db.getManyValues<Schema.Character>(
        takeIds.map((id) => [...charactersByInstancePrefix(instance._id), id]),
      ),
    ]);

    if (
      giveCharacters.some((character) => !character) ||
      takeCharacters.some((character) => !character)
    ) {
      throw new Error('CHARACTER_NOT_FOUND');
    }

    if (
      giveCharacters.some((character) => character?.user !== aUser._id) ||
      takeCharacters.some((character) => character?.user !== bUser._id)
    ) {
      throw new Error('CHARACTER_NOT_OWNED');
    }

    const aParty = [
      aInventory.party?.member1,
      aInventory.party?.member2,
      aInventory.party?.member3,
      aInventory.party?.member4,
      aInventory.party?.member5,
    ];

    const bParty = [
      bInventory.party?.member1,
      bInventory.party?.member2,
      bInventory.party?.member3,
      bInventory.party?.member4,
      bInventory.party?.member5,
    ];

    if (
      giveCharacters
        .some((character) => character && aParty.includes(character._id))
    ) {
      throw new Error('CHARACTER_IN_PARTY');
    }

    if (
      takeCharacters
        .some((character) => character && bParty.includes(character._id))
    ) {
      throw new Error('CHARACTER_IN_PARTY');
    }

    giveCharacters.forEach((character) => {
      // deno-lint-ignore no-non-null-assertion
      character!.user = bUser._id;
      // deno-lint-ignore no-non-null-assertion
      character!.inventory = bInventory._id;

      ops.push(
        // TODO update once Deploy KV atomic ops limit
        kv.atomic()
          // deno-lint-ignore no-non-null-assertion
          .set(['characters', character!._id], character)
          .set(
            [
              ...charactersByInstancePrefix(instance._id),
              // deno-lint-ignore no-non-null-assertion
              character!.id,
            ],
            character,
          )
          .delete(
            [
              ...charactersByInventoryPrefix(aInventory._id),
              // deno-lint-ignore no-non-null-assertion
              character!._id,
            ],
          )
          .set(
            [
              ...charactersByInventoryPrefix(bInventory._id),
              // deno-lint-ignore no-non-null-assertion
              character!._id,
            ],
            character,
          )
          .set(
            [
              // deno-lint-ignore no-non-null-assertion
              ...charactersByMediaIdPrefix(instance._id, character!.mediaId),
              // deno-lint-ignore no-non-null-assertion
              character!._id,
            ],
            character,
          ),
      );
    });

    takeCharacters.forEach((character) => {
      // deno-lint-ignore no-non-null-assertion
      character!.user = aUser._id;
      // deno-lint-ignore no-non-null-assertion
      character!.inventory = aInventory._id;

      ops.push(
        // TODO update once Deploy KV atomic ops limit
        kv.atomic()
          // deno-lint-ignore no-non-null-assertion
          .set(['characters', character!._id], character)
          .set(
            [
              ...charactersByInstancePrefix(instance._id),
              // deno-lint-ignore no-non-null-assertion
              character!.id,
            ],
            character,
          )
          .delete(
            [
              ...charactersByInventoryPrefix(bInventory._id),
              // deno-lint-ignore no-non-null-assertion
              character!._id,
            ],
          )
          .set(
            [
              ...charactersByInventoryPrefix(aInventory._id),
              // deno-lint-ignore no-non-null-assertion
              character!._id,
            ],
            character,
          )
          .set(
            [
              // deno-lint-ignore no-non-null-assertion
              ...charactersByMediaIdPrefix(instance._id, character!.mediaId),
              // deno-lint-ignore no-non-null-assertion
              character!._id,
            ],
            character,
          ),
      );
    });

    // res = await op.commit();

    // if (res.ok) {
    //   return { ok: true };
    // }

    // retires += 1;

    // TODO update once Deploy KV atomic ops limit
    await Promise.all(ops.map((op) => op.commit()));

    // TODO update once Deploy KV atomic ops limit
    res = { ok: true };
  }

  throw new KvError('failed to trade characters');
}

export async function stealCharacter(
  {
    aUser,
    aInventory,
    aInventoryCheck,
    bInventoryId,
    instance,
    characterId,
  }: {
    aUser: Schema.User;
    aInventory: Schema.Inventory;
    aInventoryCheck: Deno.AtomicCheck;
    bInventoryId: string;
    instance: Schema.Instance;
    characterId: string;
  },
): Promise<Schema.Character> {
  const character = await db.getValue<Schema.Character>([
    ...charactersByInstancePrefix(instance._id),
    characterId,
  ]);

  if (!character) {
    throw new Error('CHARACTER_NOT_FOUND');
  }

  const bInventoryMaybe = await db.getValueAndTimestamp<Schema.Inventory>([
    'inventories',
    bInventoryId,
  ]);

  if (
    !bInventoryMaybe?.value || character.inventory !== bInventoryMaybe.value._id
  ) {
    throw new Error('CHARACTER_NOT_OWNED');
  }

  const bInventory = bInventoryMaybe.value;

  bInventory.party ??= {};

  character.user = aUser._id;
  character.inventory = aInventory._id;

  if (bInventory.party.member1 === character._id) {
    bInventory.party.member1 = undefined;
  } else if (bInventory.party.member2 === character._id) {
    bInventory.party.member2 = undefined;
  } else if (bInventory.party.member3 === character._id) {
    bInventory.party.member3 = undefined;
  } else if (bInventory.party.member4 === character._id) {
    bInventory.party.member4 = undefined;
  } else if (bInventory.party.member5 === character._id) {
    bInventory.party.member5 = undefined;
  }

  const stealTimestamp = new Date();

  stealTimestamp.setDate(stealTimestamp.getDate() + COOLDOWN_DAYS);

  aInventory.stealTimestamp = stealTimestamp.toISOString();

  const update = await kv.atomic()
    .check(aInventoryCheck)
    .check({
      key: ['inventories', bInventoryId],
      versionstamp: bInventoryMaybe.versionstamp,
    })
    //
    .set(['inventories', aInventory._id], aInventory)
    .set(inventoriesByUser(instance._id, aUser._id), aInventory)
    //
    .set(['inventories', bInventory._id], bInventory)
    .set(inventoriesByUser(instance._id, bInventory.user), bInventory)
    //
    .set(['characters', character._id], character)
    .set(
      [
        ...charactersByInstancePrefix(instance._id),
        character.id,
      ],
      character,
    )
    .delete(
      [
        ...charactersByInventoryPrefix(aInventory._id),
        character._id,
      ],
    )
    .set(
      [
        ...charactersByInventoryPrefix(bInventory._id),
        character._id,
      ],
      character,
    )
    .set(
      [
        ...charactersByMediaIdPrefix(instance._id, character.mediaId),
        character._id,
      ],
      character,
    )
    //
    .commit();

  if (update.ok) {
    return character;
  }

  throw new KvError('failed to update character');
}

export async function failSteal(
  inventory: Schema.Inventory,
  inventoryCheck: Deno.AtomicCheck,
): Promise<Schema.Inventory> {
  const stealTimestamp = new Date();

  stealTimestamp.setDate(stealTimestamp.getDate() + COOLDOWN_DAYS);

  inventory.stealTimestamp = stealTimestamp.toISOString();

  const update = await kv.atomic()
    .check(inventoryCheck)
    //
    .set(['inventories', inventory._id], inventory)
    .set(inventoriesByUser(inventory.instance, inventory.user), inventory)
    //
    .commit();

  if (update.ok) {
    return inventory;
  }

  throw new KvError('failed to update inventory');
}
