import {
  charactersByInstancePrefix,
  charactersByMediaIdPrefix,
} from '~/db/indices.ts';

import db from '~/db/mod.ts';

import type * as Schema from '~/db/schema.ts';

export async function findCharacter(
  instance: Schema.Instance,
  id: string,
): Promise<
  | {
    character: Schema.Character;
    user: Schema.User;
  }
  | undefined
> {
  const character = await db.getValue<Schema.Character>(
    [...charactersByInstancePrefix(instance._id), id],
  );

  if (!character) {
    return undefined;
  }

  const user = await db.getValue<Schema.User>(
    ['users', character.user ?? '_'],
  );

  if (!user) {
    return undefined;
  }

  return { character, user };
}

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
