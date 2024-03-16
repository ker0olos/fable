/// <reference lib="deno.unstable" />

import { getFromBlob } from '~/db/blob.ts';

import type * as Schema from './schema.ts';

const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford's Base32
const ENCODING_LEN = ENCODING.length;
const TIME_MAX = Math.pow(2, 48) - 1;
const TIME_LEN = 10;
const RANDOM_LEN = 16;

async function getBlobValue<T>(
  kv: Deno.Kv,
  key: Deno.KvKey,
): Promise<T | undefined> {
  return await getFromBlob<T>(kv, key);
}

function decodeTime(ulid: string): Date | null {
  if (ulid.length !== TIME_LEN + RANDOM_LEN) {
    return null;
  }
  const time = parseInt(
    ulid
      .substring(0, TIME_LEN)
      .split('')
      .reverse()
      // deno-lint-ignore ban-ts-comment
      //@ts-ignore
      .reduce((carry, char, index) => {
        const encodingIndex = ENCODING.indexOf(char);
        if (encodingIndex === -1) {
          return null;
        }
        return (carry += encodingIndex * Math.pow(ENCODING_LEN, index));
      }, 0),
  );

  if (time > TIME_MAX) {
    return null;
  }

  return new Date(time);
}

if (import.meta.main) {
  const kv = await Deno.openKv('http://0.0.0.0:4512');

  const _ = kv.list({ prefix: ['users'] });

  // ['users', 'guilds', 'instances', 'inventories', 'characters', 'likes', 'packs'];

  for await (const { key, value } of _) {
    const createdAt = decodeTime(key.slice(-1)[0].toString());
  }
}
