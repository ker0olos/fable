// deno-lint-ignore no-external-import
import { decode, encode } from 'npm:@msgpack/msgpack';

// NOTE borked
// import { encode } from '$std/msgpack/mod.ts';

import { type AnyOrama, create, load, save } from 'orama';

export async function persist<T extends AnyOrama>(
  db: T,
  filepath: string,
): Promise<void> {
  const index = await save(db);

  // deno-lint-ignore no-explicit-any
  await Deno.writeFile(filepath, encode(index as any));
}

export async function restore<T extends AnyOrama>(
  filepath: string,
): Promise<T> {
  const index = await create({
    schema: { __placeholder: 'string' },
  });

  const data = await Deno.readFile(filepath);

  // deno-lint-ignore no-explicit-any
  load(index, decode(data) as any);

  return index as unknown as T;
}
