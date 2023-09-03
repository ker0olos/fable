/// <reference lib="deno.unstable" />

import { usersByDiscordId } from './indices.ts';

import { kv } from './mod.ts';

import { KvError } from '../src/errors.ts';

import type * as Schema from './schema.ts';

export async function likeCharacter(
  user: Schema.User,
  characterId: string,
): Promise<Schema.User> {
  user.likes ??= [];

  user.likes.push({ characterId });

  const update = await kv.atomic()
    .set(['users', user._id], user)
    .set(usersByDiscordId(user.id), user)
    .commit();

  if (update.ok) {
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

  const update = await kv.atomic()
    .set(['users', user._id], user)
    .set(usersByDiscordId(user.id), user)
    .commit();

  if (update.ok) {
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

  const update = await kv.atomic()
    .set(['users', user._id], user)
    .set(usersByDiscordId(user.id), user)
    .commit();

  if (update.ok) {
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

  const update = await kv.atomic()
    .set(['users', user._id], user)
    .set(usersByDiscordId(user.id), user)
    .commit();

  if (update.ok) {
    return user;
  }

  throw new KvError('failed to update user');
}
