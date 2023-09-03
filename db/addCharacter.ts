/// <reference lib="deno.unstable" />

import { ulid } from 'ulid';

import {
  charactersByInstancePrefix,
  charactersByInventoryPrefix,
  charactersByMediaIdPrefix,
  inventoriesByUser,
  usersByDiscordId,
} from './indices.ts';

import db, { kv } from './mod.ts';

import { KvError, NoPullsError } from '../src/errors.ts';

import type * as Schema from './schema.ts';

export async function addCharacter(
  {
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
    sacrifices?: Schema.Character[];
  },
): Promise<{ ok: boolean }> {
  let res = { ok: false }, retires = 0;

  while (!res.ok && retires < 5) {
    // TODO update once Deploy KV atomic ops limit
    // const op = kv.atomic();
    const ops: Deno.AtomicOperation[] = [];

    const guild = await db.getGuild(guildId);
    const instance = await db.getInstance(guild);

    const user = await db.getUser(userId);

    const { inventory, inventoryCheck } = await db.rechargePulls(
      instance,
      user,
      false,
    );

    if (!guaranteed && !sacrifices?.length && inventory.availablePulls <= 0) {
      throw new NoPullsError(inventory.rechargeTimestamp);
    }

    if (
      guaranteed && !sacrifices?.length && !user.guarantees?.includes(rating)
    ) {
      throw new Error('403');
    }

    const newCharacter: Schema.Character = {
      _id: ulid(),
      rating,
      mediaId,
      id: characterId,
      inventory: inventory._id,
      instance: inventory.instance,
      user: user._id,
    };

    if (sacrifices?.length) {
      for (const char of sacrifices) {
        // TODO update once Deploy KV atomic ops limit
        ops.push(
          kv.atomic()
            .delete(['characters', char._id])
            .delete([
              ...charactersByInstancePrefix(inventory.instance),
              char.id,
            ])
            .delete([
              ...charactersByInventoryPrefix(inventory._id),
              char._id,
            ])
            .delete([
              ...charactersByMediaIdPrefix(
                inventory.instance,
                newCharacter.mediaId,
              ),
              char._id,
            ]),
        );
      }
    } else if (guaranteed) {
      // deno-lint-ignore no-non-null-assertion
      const i = user.guarantees!.indexOf(rating);

      // deno-lint-ignore no-non-null-assertion
      user.guarantees!.splice(i, 1);
    } else {
      inventory.availablePulls = inventory.availablePulls - 1;
    }

    if (new Date() >= new Date(user.dailyTimestamp ?? new Date())) {
      const newDailyTimestamp = new Date();

      user.dailyTimestamp = (
        newDailyTimestamp.setDate(newDailyTimestamp.getDate() + 1),
          newDailyTimestamp.toISOString()
      );

      user.availableTokens = (user.availableTokens ?? 0) + 1;
    }

    inventory.lastPull = new Date().toISOString();
    inventory.rechargeTimestamp ??= new Date().toISOString();

    // TODO update once Deploy KV atomic ops limit
    await Promise.all(ops.map((op) => op.commit()));

    res = await kv.atomic()
      .check(inventoryCheck)
      .check({
        versionstamp: null,
        key: [
          ...charactersByInstancePrefix(inventory.instance),
          newCharacter.id,
        ],
      })
      //
      .set(['characters', newCharacter._id], newCharacter)
      .set(
        [
          ...charactersByInstancePrefix(inventory.instance),
          newCharacter.id,
        ],
        newCharacter,
      )
      .set(
        [
          ...charactersByInventoryPrefix(inventory._id),
          newCharacter._id,
        ],
        newCharacter,
      )
      .set(
        [
          ...charactersByMediaIdPrefix(
            inventory.instance,
            newCharacter.mediaId,
          ),
          newCharacter._id,
        ],
        newCharacter,
      )
      //
      .set(['users', user._id], user)
      .set(usersByDiscordId(user.id), user)
      //
      .set(['inventories', inventory._id], inventory)
      .set(inventoriesByUser(inventory.instance, user._id), inventory)
      .commit();

    if (res.ok) {
      return { ok: true };
    }

    retires += 1;
  }

  throw new KvError('failed to add character');
}
