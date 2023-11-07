import { green } from '$std/fmt/colors.ts';
import type { Inventory } from './db/schema.ts';

// const url =
//   'https://api.deno.com/databases/c0e82dfc-caeb-4059-877b-3e9134cf6e52/connect';

if (import.meta.main) {
  const kv = await Deno.openKv();

  const inventories = kv.list({ prefix: ['inventories'] });

  const inventoriesByInstance = kv.list({
    prefix: ['inventories_by_instance_user'],
  });

  const op = kv.atomic();

  for await (const { key } of inventories) {
    const existing = await kv.get<Inventory>(key);
    if (!existing.value) {
      throw new Error('');
    }
    op.set(key, {
      ...existing.value,
      floorsCleared: undefined,
      lastSweep: undefined,
      availableSweeps: undefined,
    } as Inventory);
  }

  for await (const { key } of inventoriesByInstance) {
    const existing = await kv.get<Inventory>(key);
    if (!existing.value) {
      throw new Error('');
    }
    op.set(key, {
      ...existing.value,
      floorsCleared: undefined,
      lastSweep: undefined,
      availableSweeps: undefined,
    } as Inventory);
  }

  const update = await op.commit();

  if (!update.ok) {
    Deno.exit(1);
  }

  console.log(green('ok'));
}
