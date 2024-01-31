import {
  charactersByInstancePrefix,
  charactersByInventoryPrefix,
  charactersByMediaIdPrefix,
} from './indices.ts';

import db, { kv } from './mod.ts';

import type * as Schema from './schema.ts';

import { KvError } from '../src/errors.ts';

export async function assignStats(
  inventory: Schema.Inventory,
  characterId: string,
  unclaimed?: number,
  strength?: number,
  stamina?: number,
  agility?: number,
): Promise<Schema.Character> {
  let retries = 0;

  while (retries < 5) {
    const response = await db.getValueAndTimestamp<Schema.Character>([
      ...charactersByInstancePrefix(inventory.instance),
      characterId,
    ]);

    if (!response?.value || !response.versionstamp) {
      throw new Error('CHARACTER_NOT_FOUND');
    }

    const character = response.value;

    if (character.inventory !== inventory._id) {
      throw new Error('CHARACTER_NOT_OWNED');
    }

    character.combat ??= {};
    character.combat.stats ??= {};

    if (typeof unclaimed === 'number') {
      character.combat.stats.unclaimed = unclaimed;
    }

    if (typeof strength === 'number') {
      character.combat.stats.strength = strength;
    }

    if (typeof stamina === 'number') {
      character.combat.stats.stamina = stamina;
    }

    if (typeof agility === 'number') {
      character.combat.stats.agility = agility;
    }

    const update = await kv.atomic()
      .check(response)
      .set(['characters', character._id], character)
      .set(
        [
          ...charactersByInstancePrefix(inventory.instance),
          character.id,
        ],
        character,
      )
      .set(
        [
          ...charactersByInventoryPrefix(inventory._id),
          character._id,
        ],
        character,
      )
      .set(
        [
          ...charactersByMediaIdPrefix(
            inventory.instance,
            character.mediaId,
          ),
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

  throw new KvError('failed to update character');
}
