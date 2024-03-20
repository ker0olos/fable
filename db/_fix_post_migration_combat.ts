// deno-lint-ignore-file no-external-import no-non-null-assertion

/// <reference lib="deno.unstable" />

import { MongoClient } from 'mongodb';

import db from '~/db/mod.ts';

import type * as Schema from './schema.ts';

import type * as OldSchema from 'https://raw.githubusercontent.com/ker0olos/fable/c0d63ffcdf654b33132cdb247e118c7876cf7bfc/db/schema.ts';

import { red } from '$std/fmt/colors.ts';

const KVIDMap = new Map<string, string>();

if (import.meta.main) {
  const kv = await Deno.openKv('http://0.0.0.0:4512');

  db.client = await new MongoClient(
    Deno.env.get('MONGO_URI')!,
    { retryWrites: true },
  ).connect();

  await restoreUsersIDS(kv);
  await restoreGuildsIDS(kv);

  await restoreCharactersCombat(kv);

  await db.client.close();

  kv.close();
}

async function restoreUsersIDS(kv: Deno.Kv): Promise<void> {
  const users = kv.list<OldSchema.User>({
    prefix: ['users'],
  });

  for await (const { value: old } of users) {
    KVIDMap.set(old._id, old.id);
  }
}

async function restoreGuildsIDS(kv: Deno.Kv): Promise<void> {
  const instances = kv.list<OldSchema.Instance>({
    prefix: ['instances'],
  });

  for await (const { value: old } of instances) {
    const oldGuild = (await kv.get<OldSchema.Guild>(['guilds', old.guild]))
      .value!;

    KVIDMap.set(old._id, oldGuild.id);
    KVIDMap.set(oldGuild._id, oldGuild.id);
  }
}

async function restoreCharactersCombat(kv: Deno.Kv): Promise<void> {
  const characters = kv.list<OldSchema.Character>({
    prefix: ['characters'],
  });

  const bulk: Parameters<
    ReturnType<typeof db.characters>['bulkWrite']
  >[0] = [];

  for await (const { value: old } of characters) {
    const filter: Partial<Schema.Character> = {
      characterId: old.id,
      guildId: KVIDMap.get(old.instance)!,
      userId: KVIDMap.get(old.user)!,
    };

    if (!filter.guildId) {
      console.error(
        red(
          `missing guild id on character, ignoring ${filter.characterId} ${filter.rating}*`,
        ),
      );
      continue;
    }

    if (!filter.userId) {
      console.error(
        red(
          `missing user id on character, ignoring ${filter.characterId} ${filter.rating}*`,
        ),
      );
      continue;
    }

    if (!old.combat || !old.combat.baseStats) {
      continue;
    }

    bulk.push({
      updateOne: {
        filter,
        update: {
          $set: {
            combat: {
              baseStats: old.combat.baseStats!,
              curStats: old.combat.curStats!,
              skillPoints: old.combat.skillPoints!,
              exp: old.combat.exp!,
              level: old.combat.level!,
              skills: old.combat.skills!,
            },
          },
        },
      },
    });
  }

  const update = await db.characters().bulkWrite(bulk);

  console.log(update.modifiedCount);
}
