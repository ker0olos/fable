import { ulid } from 'ulid';

import db, { kv } from './mod.ts';

import { packsByManifestId } from './indices.ts';

import { KvError } from '../src/errors.ts';

import config from '../src/config.ts';

import type { Manifest } from '../src/types.ts';

import type * as Schema from './schema.ts';

export async function popularPacks(): Promise<Schema.Pack[]> {
  const packs = await db.getValues<Schema.Pack>({ prefix: ['packs'] });

  return packs
    .filter(({ manifest }) => !manifest.private)
    .toSorted((a, b) => (b.servers ?? 0) - (a.servers ?? 0));
}

export async function getPacksByUserId(
  userDiscordId: string,
): Promise<Schema.Pack[]> {
  const packs = await db.getValues<Schema.Pack>({ prefix: ['packs'] });

  return packs.filter((pack) => {
    if (pack.owner === userDiscordId) return true;
    if (pack.manifest.maintainers?.includes(userDiscordId)) return true;
    return false;
  });
}

export async function publishPack(
  userDiscordId: string,
  manifest: Manifest,
): Promise<Schema.Pack> {
  if (!config.publishPacks) {
    throw new Error('UNDER_MAINTENANCE');
  }

  let pack = await db.getValue<Schema.Pack>(packsByManifestId(manifest.id));

  if (
    pack &&
    userDiscordId !== pack.owner &&
    !pack.manifest.maintainers?.includes(userDiscordId)
  ) {
    throw new Error('PERMISSION_DENIED');
  }

  pack ??= {
    manifest,
    _id: ulid(),
    added: new Date().toISOString(),
    owner: userDiscordId,
  };

  pack.version = (pack.version ?? 0) + 1;
  pack.updated = new Date().toISOString();
  pack.manifest = manifest;

  const insert = await kv.atomic()
    //
    .set(['packs', pack._id], pack)
    .set(packsByManifestId(pack.manifest.id), pack)
    //
    .commit();

  if (!insert.ok) {
    throw new KvError('failed to insert pack');
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
