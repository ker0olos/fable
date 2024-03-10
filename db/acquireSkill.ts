import {
  charactersByInstancePrefix,
  charactersByInventoryPrefix,
  charactersByMediaIdPrefix,
} from '~/db/indices.ts';

import db, { kv } from '~/db/mod.ts';

import { KvError } from '~/src/errors.ts';

import type * as Schema from '~/db/schema.ts';

import type { SkillKey } from '~/src/types.ts';

import { skills } from '~/src/skills.ts';

export const MAX_SKILL_SLOTS = 5;

export async function acquireSkill(
  inventory: Schema.Inventory,
  characterId: string,
  skillKey: SkillKey,
): Promise<Schema.AcquiredCharacterSkill> {
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
    const skill = skills[skillKey];

    if (character.inventory !== inventory._id) {
      throw new Error('CHARACTER_NOT_OWNED');
    }

    character.combat ??= {};
    character.combat.skillPoints ??= 0;
    character.combat.skills ??= {};

    if (Object.keys(character.combat.skills).length >= MAX_SKILL_SLOTS) {
      throw new Error('CHARACTER_HAS_MAX_SKILLS_SLOTS');
    }

    character.combat.skillPoints -= skill.cost;

    if (character.combat.skillPoints < 0) {
      throw new Error('NOT_ENOUGH_SKILL_POINTS');
    }

    if (
      typeof character.combat.skills[skillKey]?.level !== 'number'
    ) {
      character.combat.skills[skillKey] = { level: 1 };
    } else {
      // deno-lint-ignore no-non-null-assertion
      const maxed = skill.max <= character.combat.skills[skillKey]!.level;

      if (maxed) {
        throw new Error('SKILL_MAXED');
      }

      // deno-lint-ignore no-non-null-assertion
      character.combat.skills[skillKey]!.level += 1;
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
      // deno-lint-ignore no-non-null-assertion
      return character.combat.skills[skillKey]!;
    }

    retries += 1;
  }

  throw new KvError('failed to update character');
}
