import db from './mod.ts';

import { packByManifestId, packsByMaintainerId } from './indices.ts';

import type * as Schema from './schema.ts';

// export async function popularPacks(): Promise<Schema.Pack[]> {
//   const packs = await db.getValues<Schema.Pack>({ prefix: ['packs'] });

//   return packs
//     .filter(({ manifest }) => !manifest.private)
//     .toSorted((a, b) => (b.servers ?? 0) - (a.servers ?? 0));
// }

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

export function getPack(
  manifestId: string,
): Promise<Schema.Pack | undefined> {
  return db.getValue<Schema.Pack>(packByManifestId(manifestId));
}
