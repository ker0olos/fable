import { Mongo, type ObjectId } from '~/db/mod.ts';

import { getFloorExp } from '~/src/tower.ts';

import type * as Schema from './schema.ts';

export const MAX_LEVEL = 10;

type Status = {
  id: string;
  levelUp: number;
  skillPoints: number;
  statPoints: number;
  exp: number;
  expToLevel: number;
  expGained: number;
};

export const experienceToNextLevel = (level?: number): number => {
  return (level || 0) * 10;
};

export function distributeNewStats(
  combat: Schema.CharacterCombat,
  newStatPoints: number,
  levelUp: number,
): Schema.CharacterCombat {
  const { baseStats } = combat;

  const baseStatsSum = baseStats.attack + baseStats.defense + baseStats.speed;

  if (baseStatsSum === 0) {
    throw new Error('');
  }

  const attackPercentage = baseStats.attack / baseStatsSum;
  const defensePercentage = baseStats.defense / baseStatsSum;
  const speedPercentage = baseStats.speed / baseStatsSum;

  let distributedAttack = Math.round(newStatPoints * attackPercentage);
  let distributedDefense = Math.round(newStatPoints * defensePercentage);
  let distributedSpeed = Math.round(newStatPoints * speedPercentage);

  let distributedSum = distributedAttack + distributedDefense +
    distributedSpeed;

  while (distributedSum > newStatPoints) {
    if (
      distributedAttack > distributedDefense &&
      distributedAttack > distributedSpeed
    ) {
      distributedAttack -= 1;
    } else if (
      distributedDefense > distributedAttack &&
      distributedDefense > distributedSpeed
    ) {
      distributedDefense -= 1;
    } else {
      distributedSpeed -= 1;
    }

    distributedSum = distributedAttack + distributedDefense +
      distributedSpeed;
  }

  while (distributedSum < newStatPoints) {
    if (
      distributedAttack < distributedDefense &&
      distributedAttack < distributedSpeed
    ) {
      distributedAttack += 1;
    } else if (
      distributedDefense < distributedAttack &&
      distributedDefense < distributedSpeed
    ) {
      distributedDefense += 1;
    } else {
      distributedSpeed += 1;
    }

    distributedSum = distributedAttack + distributedDefense +
      distributedSpeed;
  }

  combat.curStats.attack += distributedAttack;
  combat.curStats.defense += distributedDefense;
  combat.curStats.speed += distributedSpeed;

  combat.curStats.hp += 5 * levelUp;

  return combat;
}

export async function gainExp(
  userId: string,
  guildId: string,
  floor: number,
  party: ObjectId[],
  keys: number,
): Promise<Status[]> {
  const db = new Mongo();

  const session = db.startSession();

  const bulk: Parameters<
    ReturnType<typeof db.characters>['bulkWrite']
  >[0] = [];

  let status: Status[];

  try {
    session.startTransaction();

    const inventory = await db.inventories().updateOne(
      { userId, guildId, availableKeys: { $gte: keys } },
      {
        $inc: { availableKeys: -keys },
        $set: {
          floorsCleared: floor,
          keysTimestamp: new Date(),
          lastPVE: new Date(),
        },
      },
      { session },
    );

    if (inventory.modifiedCount <= 0) {
      throw new Error();
    }

    const characters = await db.characters().find(
      { _id: { $in: party } },
    ).toArray();

    if (party.length !== characters.length) {
      throw new Error();
    }

    const expGained = getFloorExp(Math.max(floor, 1)) *
      Math.max(keys, 1);

    status = characters.map((character) => {
      const status: Status = {
        exp: 0,
        expToLevel: 0,
        levelUp: 0,
        skillPoints: 0,
        statPoints: 0,
        id: character.characterId,
        expGained,
      };

      character.combat.exp += expGained;

      if (character.combat.level < MAX_LEVEL) {
        while (
          character.combat.exp >= experienceToNextLevel(character.combat.level)
        ) {
          character.combat.exp -= experienceToNextLevel(character.combat.level);

          character.combat.level += 1;
          character.combat.skillPoints += 1;
          // character.combat.unclaimedStatsPoints! += 3;

          status.levelUp += 1;
          status.skillPoints += 1;
          status.statPoints += 3;

          // extra skill points based on level
          if (character.combat.level >= 10) {
            character.combat.skillPoints += 1;
            status.skillPoints += 1;

            // character.combat.unclaimedStatsPoints! += 3 * 2;
            status.statPoints += 3 * 2;
          } else if (character.combat.level >= 20) {
            character.combat.skillPoints += 2;
            status.skillPoints += 2;

            // character.combat.unclaimedStatsPoints! += 3 * 3;
            status.statPoints += 3 * 3;
          } else if (character.combat.level >= 40) {
            character.combat.skillPoints += 3;
            status.skillPoints += 3;

            // character.combat.unclaimedStatsPoints! += 3 * 5;
            status.statPoints += 3 * 5;
          }
        }
      }

      status.exp = character.combat.exp;
      status.expToLevel = experienceToNextLevel(character.combat.level);

      // character leveled
      if (status.statPoints > 0) {
        character.combat = distributeNewStats(
          character.combat,
          status.statPoints,
          status.levelUp,
        );
      }

      bulk.push({
        updateOne: {
          filter: { _id: character._id },
          update: { $set: { combat: character.combat } },
        },
      });

      return status;
    });

    const update = await db.characters().bulkWrite(bulk, { session });

    if (update.modifiedCount !== bulk.length) {
      throw new Error(update.getWriteErrors().join(', '));
    }

    await session.commitTransaction();
    await session.endSession();
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    await db.close();

    throw err;
  } finally {
    await session.endSession();
    await db.close();
  }

  return status;
}
