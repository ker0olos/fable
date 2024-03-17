import db from '~/db/mod.ts';

import type * as Schema from './schema.ts';

import type { SkillKey } from '~/src/types.ts';

import { skills } from '~/src/skills.ts';

// export const MAX_SKILL_SLOTS = 8;

export async function acquireSkill(
  userId: string,
  guildId: string,
  characterId: string,
  skillKey: SkillKey,
): Promise<Schema.AcquiredCharacterSkill> {
  const lvl = `combat.skills.${skillKey}.level`;

  const skill = skills[skillKey];

  const document = await db.characters().findOneAndUpdate(
    {
      userId,
      guildId,
      characterId,
      'combat.skillPoints': { $gte: skill.cost }, // has enough skill points
      $or: [
        { [lvl]: null }, // not acquired
        { [lvl]: { $lt: skill.max } }, // less than max level
      ],
    },
    { $inc: { 'combat.skillPoints': -skill.cost, [lvl]: 1 } },
    { returnDocument: 'after' },
  );

  if (!document || !document.combat.skills[skillKey]?.level) {
    throw new Error();
  }

  // deno-lint-ignore no-non-null-assertion
  return document.combat.skills[skillKey]!;
}
