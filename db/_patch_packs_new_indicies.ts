// deno-lint-ignore no-external-import
import {
  batchedAtomic,
} from 'https://raw.githubusercontent.com/ker0olos/kv-toolbox/patch-1/batchedAtomic.ts';

import { packsByMaintainerId } from './indices.ts';

import type * as Schema from './schema.ts';

const url =
  'https://api.deno.com/databases/c0e82dfc-caeb-4059-877b-3e9134cf6e52/connect';

if (import.meta.main) {
  const kv = await Deno.openKv(
    url,
  );

  const _packs = kv.list<Schema.Pack>({
    prefix: ['packs'],
  });

  const op = batchedAtomic(kv);

  for await (const { key, value } of _packs) {
    const pack = value;

    console.log(key, pack.owner, pack.manifest.maintainers);

    op.set(packsByMaintainerId(pack.owner, pack._id), 1);

    (pack.manifest.maintainers ?? []).forEach((discordId) => {
      op.set(packsByMaintainerId(discordId, pack._id), 1);
    });
  }

  await op.commit();
}
