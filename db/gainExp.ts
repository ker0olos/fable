/// <reference lib="deno.unstable" />

import {
  charactersByInstancePrefix,
  charactersByInventoryPrefix,
  charactersByMediaIdPrefix,
} from './indices.ts';

import db, { kv } from './mod.ts';

import type * as Schema from './schema.ts';

import { KvError } from '../src/errors.ts';

export const MAX_LEVEL = 10;

export const experienceToNextLevel = (level: number): number => {
  return level * level * 10;
};

export async function gainExp(
  inventory: Schema.Inventory,
  characterId: string,
  gainExp: number,
): Promise<Schema.Character> {
  const character = await db.getValue<Schema.Character>([
    ...charactersByInstancePrefix(inventory.instance),
    characterId,
  ]);

  if (!character) {
    throw new Error('CHARACTER_NOT_FOUND');
  }

  if (character.inventory !== inventory._id) {
    throw new Error('CHARACTER_NOT_OWNED');
  }

  character.combat ??= {};

  character.combat.level ??= 1;
  character.combat.exp ??= 0;
  character.combat.skillPoints ??= 0;

  if (character.combat.level >= MAX_LEVEL) {
    return character;
  }

  character.combat.exp += gainExp;

  while (
    character.combat.exp >= experienceToNextLevel(character.combat.level)
  ) {
    character.combat.level += 1;
    character.combat.skillPoints += 1;

    character.combat.exp -= experienceToNextLevel(character.combat.level);

    // extra skill points based on level
    if (character.combat.level >= 10) {
      character.combat.skillPoints += 1;
    } else if (character.combat.level >= 20) {
      character.combat.skillPoints += 2;
    } else if (character.combat.level >= 40) {
      character.combat.skillPoints += 3;
    }
  }

  const update = await kv.atomic()
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

  throw new KvError('failed to update character');
}
