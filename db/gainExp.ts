// deno-lint-ignore-file

import {
  charactersByInstancePrefix,
  charactersByInventoryPrefix,
  charactersByMediaIdPrefix,
} from '~/db/indices.ts';

import type * as Schema from '~/db/schema.ts';

export const MAX_LEVEL = 10;

export const experienceToNextLevel = (level: number): number => {
  return level * 10;
};

type Status = {
  levelUp: number;
  skillPoints: number;
  // statPoints: number;
  exp: number;
  expToLevel: number;
};

export function gainExp(
  op: Deno.AtomicOperation,
  inventory: Schema.Inventory,
  character: Schema.Character,
  gainExp: number,
): Status {
  const status: Status = {
    levelUp: 0,
    skillPoints: 0,
    // statPoints: 0,
    exp: 0,
    expToLevel: 0,
  };

  character.combat ??= {};

  character.combat.exp ??= 0;
  character.combat.level ??= 1;
  character.combat.skillPoints ??= 0;

  // character.combat.unclaimedStatsPoints ??= 0;

  if (character.combat.level >= MAX_LEVEL) {
    return status;
  }

  character.combat.exp += gainExp;

  while (
    character.combat.exp >= experienceToNextLevel(character.combat.level)
  ) {
    character.combat.exp -= experienceToNextLevel(character.combat.level);

    character.combat.level += 1;
    character.combat.skillPoints += 1;
    // character.combat.unclaimedStatsPoints! += 3;

    status.levelUp += 1;
    status.skillPoints += 1;
    // status.statPoints += 3;

    // extra skill points based on level
    if (character.combat.level >= 10) {
      character.combat.skillPoints += 1;
      status.skillPoints += 1;

      // character.combat.unclaimedStatsPoints! += 3 * 2;
      // status.statPoints += 3 * 2;
    } else if (character.combat.level >= 20) {
      character.combat.skillPoints += 2;
      status.skillPoints += 2;

      // character.combat.unclaimedStatsPoints! += 3 * 3;
      // status.statPoints += 3 * 3;
    } else if (character.combat.level >= 40) {
      character.combat.skillPoints += 3;
      status.skillPoints += 3;

      // character.combat.unclaimedStatsPoints! += 3 * 5;
      // status.statPoints += 3 * 5;
    }
  }

  status.exp = character.combat.exp;
  status.expToLevel = experienceToNextLevel(character.combat.level);

  op
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
    );

  return status;
}
