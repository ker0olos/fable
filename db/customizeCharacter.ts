import {
  charactersByInstancePrefix,
  charactersByInventoryPrefix,
  charactersByMediaIdPrefix,
} from './indices.ts';

import db, { kv } from './mod.ts';

import { KvError } from '../src/errors.ts';

import type * as Schema from './schema.ts';

export async function setCharacterNickname(
  user: Schema.User,
  inventory: Schema.Inventory,
  instance: Schema.Instance,
  characterId: string,
  nickname?: string,
): Promise<Schema.Character> {
  const character = await db.getValue<Schema.Character>(
    [...charactersByInstancePrefix(instance._id), characterId],
  );

  if (!character) {
    throw new Error('CHARACTER_NOT_FOUND');
  }

  if (character.user !== user._id) {
    throw new Error('CHARACTER_NOT_OWNED');
  }

  character.nickname = nickname;

  const update = await kv.atomic()
    .set(['characters', character._id], character)
    .set(
      [
        ...charactersByInstancePrefix(instance._id),
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
        ...charactersByMediaIdPrefix(instance._id, character.mediaId),
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

export async function setCharacterImage(
  user: Schema.User,
  inventory: Schema.Inventory,
  instance: Schema.Instance,
  characterId: string,
  image?: string,
): Promise<Schema.Character> {
  const character = await db.getValue<Schema.Character>(
    [...charactersByInstancePrefix(instance._id), characterId],
  );

  if (!character) {
    throw new Error('CHARACTER_NOT_FOUND');
  }

  if (character.user !== user._id) {
    throw new Error('CHARACTER_NOT_OWNED');
  }

  character.image = image;

  const update = await kv.atomic()
    .set(['characters', character._id], character)
    .set(
      [
        ...charactersByInstancePrefix(instance._id),
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
        ...charactersByMediaIdPrefix(instance._id, character.mediaId),
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
