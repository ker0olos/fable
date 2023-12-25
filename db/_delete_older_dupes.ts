// deno-lint-ignore-file no-non-null-assertion

import db from './mod.ts';

import type * as Schema from './schema.ts';

const url =
  'https://api.deno.com/databases/c0e82dfc-caeb-4059-877b-3e9134cf6e52/connect';

if (import.meta.main) {
  const kv = await Deno.openKv(url);

  const _packs = await db.getValues<Schema.Pack>({ prefix: ['packs'] }, kv);

  const dict: Record<string, Schema.Pack[]> = {};

  _packs.forEach((pack) => {
    dict[pack.manifest.id] ??= [];
    dict[pack.manifest.id].push(pack);
  });

  const op = kv.atomic();

  Object.entries(dict).forEach(([key, dupes]) => {
    if (dupes.length > 1) {
      console.log(key, dupes[0].owner);

      const sortedList = dupes.sort((a, b) =>
        (a.added! < b.added!) ? -1 : ((a.added! > b.added!) ? 1 : 0)
      );

      sortedList
        .slice(0, -1)
        .forEach((pack) => {
          console.log(pack.added);
          op.delete(['packs', pack._id]);
        });

      console.log(
        'KEPT',
        sortedList
          .slice(-1)[0].added,
      );
    }
  });

  // const res = await op.commit();

  // console.log(res);
}
