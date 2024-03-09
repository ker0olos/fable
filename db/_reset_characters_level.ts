// deno-lint-ignore no-external-import
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

  const _characters = kv.list<Schema.Character>({
    prefix: ['characters'],
  });

  const _characters1 = kv.list<Schema.Character>({
    prefix: ['characters_by_instance_fid'],
  });

  const _characters2 = kv.list<Schema.Character>({
    prefix: ['characters_by_inventory'],
  });

  const _characters3 = kv.list<Schema.Character>({
    prefix: ['characters_by_media_instance'],
  });

  const op = batchedAtomic(kv);

  const func = async (list: typeof _characters) => {
    for await (const { key, value } of list) {
      if (!value.combat || JSON.stringify(value.combat) === '{}') {
        continue;
      }

      value.combat = {};

      op.set(key, value);
    }
  };

  await func(_characters);
  await func(_characters1);
  await func(_characters2);
  await func(_characters3);

  await op.commit();
}
