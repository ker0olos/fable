// deno-lint-ignore-file ban-ts-comment no-external-import

import {
  batchedAtomic,
} from 'https://raw.githubusercontent.com/ker0olos/kv-toolbox/patch-1/batchedAtomic.ts';

import type * as Schema from './schema.ts';

const url =
  'https://api.deno.com/databases/c0e82dfc-caeb-4059-877b-3e9134cf6e52/connect';

if (import.meta.main) {
  const kv = await Deno.openKv(
    url,
  );

  const _inventories = kv.list<Schema.Inventory>({
    prefix: ['inventories'],
  });

  const _inventories1 = kv.list<Schema.Inventory>({
    prefix: ['inventories_by_instance_user'],
  });

  const op = batchedAtomic(kv);

  const func = async (list: typeof _inventories) => {
    for await (const { key, value } of list) {
      delete value.floorsCleared;
      //@ts-ignore
      delete value.sweepsTimestamp;
      //@ts-ignore
      delete value.availableSweeps;
      //@ts-ignore
      delete value.lastSweep;

      delete value.keysTimestamp;
      delete value.availableKeys;
      delete value.lastPVE;

      op.set(key, value);
    }
  };

  await func(_inventories);
  await func(_inventories1);

  await op.commit();
}
