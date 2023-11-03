import { green } from '$std/fmt/colors.ts';
import type { Inventory } from './db/schema.ts';

// const url =
//   'https://api.deno.com/databases/c0e82dfc-caeb-4059-877b-3e9134cf6e52/connect';

if (import.meta.main) {
  const kv = await Deno.openKv();

  const inventories = kv.list({ prefix: ['inventories'] });

  const op = kv.atomic();

  for await (const { key } of inventories) {
    op.set(key, {
      floorsCleared: undefined,
    } as Partial<Inventory>);
  }

  const update = await op.commit();

  if (!update.ok) {
    Deno.exit(1);
  }

  console.log(green('ok'));
}
