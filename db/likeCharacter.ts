/// <reference lib="deno.unstable" />

import { usersLikesByDiscordId } from './indices.ts';

import db from './mod.ts';

import { KvError } from '../src/errors.ts';

import type * as Schema from './schema.ts';

export async function likeCharacter(
  user: Schema.User,
  characterId: string,
): Promise<Schema.User> {
  user.likes ??= [];

  user.likes.push({ characterId });

  if (await db.setBlobValue(usersLikesByDiscordId(user.id), user.likes)) {
    return user;
  }

  throw new KvError('failed to update user');
}

export async function unlikeCharacter(
  user: Schema.User,
  characterId: string,
): Promise<Schema.User> {
  user.likes ??= [];

  const i = user.likes.findIndex((i) => i.characterId === characterId);

  if (i > -1) {
    user.likes.splice(i, 1);
  }

  if (await db.setBlobValue(usersLikesByDiscordId(user.id), user.likes)) {
    return user;
  }

  throw new KvError('failed to update user');
}

export async function likeMedia(
  user: Schema.User,
  mediaId: string,
): Promise<Schema.User> {
  user.likes ??= [];

  user.likes.push({ mediaId });

  if (await db.setBlobValue(usersLikesByDiscordId(user.id), user.likes)) {
    return user;
  }

  throw new KvError('failed to update user');
}

export async function unlikeMedia(
  user: Schema.User,
  mediaId: string,
): Promise<Schema.User> {
  user.likes ??= [];

  const i = user.likes.findIndex((i) => i.mediaId === mediaId);

  if (i > -1) {
    user.likes.splice(i, 1);
  }

  if (await db.setBlobValue(usersLikesByDiscordId(user.id), user.likes)) {
    return user;
  }

  throw new KvError('failed to update user');
}
