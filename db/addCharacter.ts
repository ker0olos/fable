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
    sacrifices?: Deno.KvEntry<Schema.Character>[];
  },
): Promise<{ ok: boolean }> {
  let retries = 0;

  while (retries < 5) {
    const op = kv.atomic();

    const guild = await db.getGuild(guildId);
    const instance = await db.getInstance(guild);

    const user = await db.getUser(userId);

    const { inventory, inventoryCheck } = await db.rechargeConsumables(
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
      for (const { key, value: char, versionstamp } of sacrifices) {
        op
          .check({ key, versionstamp })
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
          ]);
      }
    } else if (guaranteed) {
      // deno-lint-ignore no-non-null-assertion
      const i = user.guarantees!.indexOf(rating);

      // deno-lint-ignore no-non-null-assertion
      user.guarantees!.splice(i, 1);
    } else {
      inventory.availablePulls = inventory.availablePulls - 1;
    }

    db.checkDailyTimestamp(user);

    inventory.lastPull = new Date().toISOString();
    inventory.rechargeTimestamp ??= new Date().toISOString();

    // don't save likes on the user object
    user.likes = undefined;

    const res = await op
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

    retries += 1;
  }

  throw new KvError('failed to add character');
}
