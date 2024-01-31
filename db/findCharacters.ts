import {
  charactersByInstancePrefix,
  charactersByMediaIdPrefix,
} from './indices.ts';

import db from './mod.ts';

import type * as Schema from './schema.ts';

export async function findCharacters(
  instance: Schema.Instance,
  ids: string[],
): Promise<([Schema.Character | undefined, Schema.User | undefined])[]> {
  const characters = await db.getManyValues<Schema.Character>(
    ids.map((id) => [
      ...charactersByInstancePrefix(instance._id),
      id,
    ]),
  );

  const users = await db.getManyValues<Schema.User>(
    characters.map((character) => ['users', character?.user ?? '_']),
  );

  return characters.map((character, i) => [character, users[i]]);
}

export async function findMediaCharacters(
  instance: Schema.Instance,
  ids: string[],
): Promise<([Schema.Character, Schema.User | undefined])[]> {
  const entries: Promise<Schema.Character[]>[] = [];

  ids.forEach((id) => {
    entries.push(
      db.getValues<Schema.Character>({
        prefix: charactersByMediaIdPrefix(instance._id, id),
      }),
    );
  });

  const characters = (await Promise.all(entries)).flat();

  const users = await db.getManyValues<Schema.User>(
    characters.map((character) => ['users', character?.user ?? '_']),
  );

  return characters.map((character, i) => [character, users[i]]);
}
