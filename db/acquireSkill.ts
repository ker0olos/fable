import { Mongo } from '~/db/mod.ts';

import type * as Schema from './schema.ts';

import type { SkillKey } from '~/src/types.ts';

import { skills } from '~/src/skills.ts';

import { NonFetalError } from '~/src/errors.ts';

// export const MAX_SKILL_SLOTS = 8;

export async function acquireSkill(
  userId: string,
  guildId: string,
  characterId: string,
  skillKey: SkillKey,
): Promise<Schema.AcquiredCharacterSkill> {
  const db = new Mongo();

  // deno-lint-ignore no-explicit-any
  let document: any;

  try {
    await db.connect();

    const level = `combat.skills.${skillKey}.level`;

    const skill = skills[skillKey];

    document = await db.characters().findOneAndUpdate(
      {
        userId,
        guildId,
        characterId,
        'combat.skillPoints': { $gte: skill.cost }, // has enough skill points
        $or: [
          { [level]: null }, // not acquired
          { [level]: { $lt: skill.max } }, // less than max level
        ],
      },
      { $inc: { 'combat.skillPoints': -skill.cost, [level]: 1 } },
      { returnDocument: 'after' },
    );

    if (!document || !document.combat.skills[skillKey]?.level) {
      throw new NonFetalError('failed');
    }
  } finally {
    await db.close();
  }

  // deno-lint-ignore no-non-null-assertion
  return document.combat.skills[skillKey]!;
}
