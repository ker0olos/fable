import { ulid } from 'ulid';

import db, { kv } from './mod.ts';

import { packsByMaintainerId, packsByManifestId } from './indices.ts';

import { KvError } from '../src/errors.ts';

import config from '../src/config.ts';

import type { Manifest } from '../src/types.ts';

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

  keys = keys.map((k) => ['packs', k[2]]);

  return (await db.getManyValues(keys))
    .filter(Boolean) as Schema.Pack[];
}

export async function publishPack(
  userDiscordId: string,
  manifest: Manifest,
): Promise<Schema.Pack> {
  if (!config.publishPacks) {
    throw new Error('UNDER_MAINTENANCE');
  }

  const existingPack = await db.getValue<Schema.Pack>(
    packsByManifestId(manifest.id),
  );

  if (
    existingPack &&
    existingPack.owner !== userDiscordId &&
    !existingPack.manifest.maintainers?.includes(userDiscordId)
  ) {
    throw new Error('PERMISSION_DENIED');
  }

  const oldMaintainers = existingPack?.manifest.maintainers ?? [];
  const newMaintainers = manifest.maintainers ?? [];

  const removedMaintainers = oldMaintainers.filter((oldMaintainer) =>
    !newMaintainers.includes(oldMaintainer)
  );

  const pack: Schema.Pack = existingPack ?? {
    _id: ulid(),
    version: 0,
    added: new Date().toISOString(),
    updated: new Date().toISOString(),
    owner: userDiscordId,
    manifest,
  } satisfies Schema.Pack;

  pack.manifest = manifest;
  pack.version = pack.version + 1;
  pack.updated = new Date().toISOString();

  const op = kv.atomic();

  // update the indices used to query packs by the maintainer/owner id
  // they only refer to the pack id instead of the entire pack object
  // this is to avoid updating all the indices every time the pack is installed or uninstalled
  op.set(packsByMaintainerId(pack.owner, pack._id), 1);

  newMaintainers.forEach((discordId) => {
    op.set(packsByMaintainerId(discordId, pack._id), 1);
  });

  removedMaintainers.forEach((discordId) => {
    op.delete(packsByMaintainerId(discordId, pack._id));
  });
  //

  const insert = await op
    .set(['packs', pack._id], pack)
    .set(packsByManifestId(pack.manifest.id), pack)
    .commit();

  if (!insert.ok) {
    throw new KvError('failed to insert/update pack');
  }

  return pack;
}

export async function addPack(
  instance: Schema.Instance,
  userDiscordId: string,
  packManifestId: string,
): Promise<Schema.Pack> {
  const pack = await db.getValue<Schema.Pack>(
    packsByManifestId(packManifestId),
  );

  if (!pack) {
    throw new Error('PACK_NOT_FOUND');
  }

  if (
    pack.manifest.private &&
    userDiscordId !== pack.owner &&
    !pack.manifest.maintainers?.includes(userDiscordId)
  ) {
    throw new Error('PACK_PRIVATE');
  }

  // already installed
  if (instance.packs.map(({ pack }) => pack).includes(pack._id)) {
    return pack;
  }

  const install: Schema.PackInstall = {
    by: userDiscordId,
    pack: pack._id,
    timestamp: new Date().toISOString(),
  };

  instance.packs.push(install);

  pack.servers = (pack.servers ?? 0) + 1;

  const update = await kv.atomic()
    //
    .set(['packs', pack._id], pack)
    .set(packsByManifestId(packManifestId), pack)
    //
    .set(['instances', instance._id], instance)
    //
    .commit();

  if (!update.ok) {
    throw new KvError('failed to update instance');
  }

  return pack;
}

export async function removePack(
  instance: Schema.Instance,
  packManifestId: string,
): Promise<Schema.Pack> {
  const pack = await db.getValue<Schema.Pack>(
    packsByManifestId(packManifestId),
  );

  if (!pack) {
    throw new Error('PACK_NOT_FOUND');
  }

  const index = instance.packs.findIndex((installed) =>
    installed.pack === pack._id
  );

  // not installed
  if (index <= -1) {
    throw new Error('PACK_NOT_INSTALLED');
  }

  instance.packs.splice(index, 1);

  pack.servers = Math.max(0, (pack.servers ?? 0) - 1);

  const update = await kv.atomic()
    //
    .set(['packs', pack._id], pack)
    .set(packsByManifestId(packManifestId), pack)
    //
    .set(['instances', instance._id], instance)
    //
    .commit();

  if (!update.ok) {
    throw new KvError('failed to update instance');
  }

  return pack;
}
