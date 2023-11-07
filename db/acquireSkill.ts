/// <reference lib="deno.unstable" />

import {
  charactersByInstancePrefix,
  charactersByInventoryPrefix,
  charactersByMediaIdPrefix,
} from './indices.ts';

import db, { kv } from './mod.ts';

import { KvError } from '../src/errors.ts';

import type * as Schema from './schema.ts';

import type { CharacterSkill } from '../src/types.ts';

export async function acquireSkill(
  inventory: Schema.Inventory,
  characterId: string,
  skill: CharacterSkill,
): Promise<Schema.AcquiredCharacterSkill> {
  let retires = 0;

  while (retires < 5) {
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
    character.combat.skillPoints ??= 0;
    character.combat.skills ??= {};

    character.combat.skillPoints -= skill.cost;

    if (character.combat.skillPoints < 0) {
      throw new Error('NOT_ENOUGH_SKILL_POINTS');
    }

    if (typeof character.combat.skills[skill.key]?.level !== 'number') {
      character.combat.skills[skill.key] = { level: 1 };
    } else {
      const maxed =
        skill.stats[0].scale.length <= character.combat.skills[skill.key].level;

      if (maxed) {
        throw new Error('SKILL_MAXED');
      }

      character.combat.skills[skill.key].level += 1;
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
      return character.combat.skills[skill.key];
    }

    retires += 1;
  }

  throw new KvError('failed to update character');
}
