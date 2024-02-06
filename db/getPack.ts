import db from './mod.ts';

import { packsByMaintainerId } from './indices.ts';

import type * as Schema from './schema.ts';

export async function getAllPublicPacks(): Promise<Schema.Pack[]> {
  const packs = await db.getValues<Schema.Pack>({ prefix: ['packs'] });

  return packs
    .filter(({ hidden, manifest }) =>
      !(hidden || manifest.private || manifest.nsfw)
    );
}

export async function getPacksByMaintainerId(
  userDiscordId: string,
): Promise<Schema.Pack[]> {
  let keys = await db.getKeys({
    prefix: packsByMaintainerId(userDiscordId),
  });

  // the object value is useless
  // the 3 part of the object key is the pack id which is what's needed
  keys = keys.map(([, , pack_id]) => ['packs', pack_id]);

  return (await db.getManyValues(keys))
    .filter(Boolean) as Schema.Pack[];
}
