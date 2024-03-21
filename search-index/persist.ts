import { type AnyOrama, create, load, save } from 'orama';

export async function persist<T extends AnyOrama>(
  db: T,
  filepath: string,
): Promise<void> {
  const index = await save(db);

  const encoded = JSON.stringify(index);

  await Deno.writeTextFile(`${filepath}.json`, encoded);
}

export async function restore<T extends AnyOrama>(
  filepath: string,
): Promise<T> {
  const index = await create({
    schema: { __placeholder: 'string' },
  });

  const data = await Deno.readTextFile(`${filepath}.json`);

  console.time('decode');
  const decoded = JSON.parse(data);
  console.timeEnd('decode');

  load(index, decoded);

  return index as unknown as T;
}
