// deno-lint-ignore-file no-explicit-any

const BATCH_SIZE = 10;
const CHUNK_SIZE = 63_000;

const BLOB_KEY = '_blob';

function objToBlob(obj: any): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(obj));
}

function blobToObj<T>(blob: Uint8Array): T {
  return JSON.parse(new TextDecoder().decode(blob)) as T;
}

async function keys(
  kv: Deno.Kv,
  selector: Deno.KvListSelector,
  options?: Deno.KvListOptions,
): Promise<Deno.KvKey[]> {
  const keys: Deno.KvKey[] = [];

  const list = kv.list(selector, options);

  for await (const { key } of list) {
    keys.push(key);
  }

  return keys;
}

export async function getFromBlob<T>(
  kv: Deno.Kv,
  key: Deno.KvKey,
): Promise<T | undefined> {
  const list = kv.list<Uint8Array>({ prefix: [...key, BLOB_KEY] }, {
    batchSize: BATCH_SIZE,
  });

  let exists = false;
  let value = new Uint8Array();

  for await (const item of list) {
    if (item.value) {
      exists = true;

      if (!(item.value instanceof Uint8Array)) {
        throw new TypeError('KV value is not a Uint8Array.');
      }

      const v = new Uint8Array(value.length + item.value.length);

      v.set(value, 0);
      v.set(item.value, value.length);

      value = v;
    }
  }

  return exists ? blobToObj<T>(value) : undefined;
}

export async function setAsBlob(
  kv: Deno.Kv,
  key: Deno.KvKey,
  op: Deno.AtomicOperation,
  obj: any,
): Promise<void> {
  const blob = objToBlob(obj);

  let count = writeArrayBuffer(key, op, blob);

  // delete any excess key values
  const current = await keys(kv, { prefix: [...key, BLOB_KEY] });

  while (++count <= current.length) {
    op.delete([...key, BLOB_KEY, count]);
  }
  //
}

function writeArrayBuffer(
  key: Deno.KvKey,
  op: Deno.AtomicOperation,
  blob: Uint8Array,
): number {
  let offset = 0, count = 0;

  while (blob.byteLength > offset) {
    count++;

    const chunk = blob.subarray(offset, offset + CHUNK_SIZE);

    op.set([...key, BLOB_KEY, count], chunk);

    offset += CHUNK_SIZE;
  }

  return count;
}

// export async function remove(kv: Deno.Kv, key: Deno.KvKey): Promise<void> {
//   const parts = await keys(kv, { prefix: [...key, BLOB_KEY] }, {
//     batchSize: BATCH_SIZE,
//   });

//   if (parts.length) {
//     let op = kv.atomic();

//     for (const key of parts) {
//       op = op.delete(key);
//     }

//     await op.commit();
//   }
// }
