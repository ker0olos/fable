import db from '~/db/mod.ts';

import utils from '~/src/utils.ts';

import { skills } from '~/src/skills.ts';

import { NoPullsError } from '~/src/errors.ts';

import type { ObjectId } from '~/db/mod.ts';

import type * as Schema from './schema.ts';

import type { SkillKey } from '~/src/types.ts';

const newSkills = (rating: number): number => {
  switch (rating) {
    case 5:
      return 2;
    case 4:
      return 1;
    default:
      return 0;
  }
};

const newUnclaimed = (rating: number): number => {
  return 3 * rating;
};

export const randomStats = (
  total: number,
  seed?: string,
): Schema.CharacterStats => {
  let attack = 0;
  let defense = 0;
  let speed = 0;

  const rng = seed ? new utils.LehmerRNG(seed) : undefined;

  for (let i = 0; i < total; i++) {
    const rand = rng
      ? Math.floor(rng.nextFloat() * 3)
      : Math.floor(Math.random() * 3);

    if (rand === 0) {
      attack += 1;
    } else if (rand === 1) {
      defense += 1;
    } else {
      speed += 1;
    }
  }

  return {
    attack,
    defense,
    speed,
    hp: 10,
  };
};

export const ensureCombat = (
  character: Partial<Schema.Character>,
): Schema.Character => {
  if (character.combat !== undefined) {
    return character as Schema.Character;
  }

  // deno-lint-ignore no-non-null-assertion
  const total = newUnclaimed(character.rating!);

  // deno-lint-ignore no-non-null-assertion
  const slots = newSkills(character.rating!);

  character.combat = {
    exp: 0,
    level: 1,
    skillPoints: 0,
    skills: {},
    baseStats: randomStats(total),
    curStats: { attack: 0, defense: 0, hp: 0, speed: 0 },
  };

  character.combat.curStats = { ...character.combat.baseStats };

  const skillsPool = Object.keys(skills) as SkillKey[];

  for (let i = 0; i < slots; i++) {
    const randomSkillKey = skillsPool.splice(
      Math.floor(Math.random() * skillsPool.length),
      1,
    )[0];

    character.combat.skills[randomSkillKey] = { level: 1 };
  }

  return character as Schema.Character;
};

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
    sacrifices?: ObjectId[];
  },
): Promise<void> {
  const session = db.client.startSession();

  try {
    session.startTransaction();

    const { user, ...inventory } = await db.rechargeConsumables(
      guildId,
      userId,
    );

    if (!guaranteed && !sacrifices?.length && inventory.availablePulls <= 0) {
      throw new NoPullsError(inventory.rechargeTimestamp);
    }

    if (
      guaranteed && !sacrifices?.length && !user?.guarantees?.includes(rating)
    ) {
      throw new Error('403');
    }

    const newCharacter: Schema.Character = ensureCombat({
      createdAt: new Date(),
      inventoryId: inventory._id,
      characterId,
      guildId,
      userId,
      mediaId,
      rating,
    });

    const update: Partial<Schema.Inventory> = {
      lastPull: new Date(),
    };

    const deleteSacrifices: Parameters<
      ReturnType<typeof db.characters>['bulkWrite']
    >[0] = [];

    // if sacrifices (merge)
    if (sacrifices?.length) {
      deleteSacrifices.push({
        deleteMany: { filter: { _id: { $in: sacrifices } } },
      });
    } else if (guaranteed) {
      // if guaranteed pull
      const i = user.guarantees.indexOf(rating);

      user.guarantees.splice(i, 1);

      await db.users().updateOne({ _id: user._id }, {
        $set: { guarantees: user.guarantees },
      }, { session });
    } else {
      // if normal pull
      update.availablePulls = inventory.availablePulls - 1;
      update.rechargeTimestamp = inventory.rechargeTimestamp ?? new Date();
    }

    await db.inventories().updateOne(
      { _id: inventory._id },
      { $set: update },
      { session },
    );

    await db.characters().bulkWrite([
      ...deleteSacrifices,
      { insertOne: { document: newCharacter } },
    ], { session });

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
}
