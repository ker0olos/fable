import ed25519 from 'https://esm.sh/@evan/wasm@0.0.95/target/ed25519/deno.js';

import { distance as _distance } from 'https://raw.githubusercontent.com/ka-weihe/fastest-levenshtein/1.0.15/mod.ts';

import { inMemoryCache } from 'https://deno.land/x/httpcache@0.1.2/in_memory.ts';

const globalCache = inMemoryCache(20);

function randint(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function hexToInt(hex?: string): number | undefined {
  if (!hex) {
    return;
  }

  const color = hex.substring(1);

  const R = color.substring(0, 2);
  const G = color.substring(2, 4);
  const B = color.substring(4, 6);

  return parseInt(`${R}${G}${B}`, 16);
}

function shuffle<T>(array: T[]): void {
  for (
    let i = 0, length = array.length, swap = 0, temp = null;
    i < length;
    i++
  ) {
    swap = Math.floor(Math.random() * (i + 1));
    temp = array[swap];
    array[swap] = array[i];
    array[i] = temp;
  }
}

function sleep(secs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, secs * 1000));
}

function rng<T>(dict: { [chance: number]: T }): T {
  const pool = Object.values(dict);

  const chances = Object.keys(dict).map((n) => parseInt(n));

  const sum = chances.reduce((a, b) => a + b);

  if (sum !== 100) {
    throw new Error(`Sum of ${chances} is ${sum} when it should be 100`);
  }

  const _ = [];

  for (let i = 0; i < chances.length; i++) {
    // if chance is 5 - add 5 items to the array
    // if chance is 90 - add 90 items to the array
    for (let y = 0; y < chances[i]; y++) {
      // push the index of the item not it's value
      _.push(i);
    }
  }

  // shuffle the generated chances array
  // which is the RNG part of this function
  shuffle(_);

  // use the first item from the shuffled array on the pool
  return pool[_[0]];
}

function truncate(
  str: string | undefined,
  n: number,
): string | undefined {
  if (str && str.length > n) {
    const s = str.substring(0, n - 2);
    return s.slice(0, s.lastIndexOf(' ')) +
      '...';
  }

  return str;
}

function wrap(text: string, width = 32): string {
  return text.replace(
    new RegExp(`(?![^\\n]{1,${width}}$)([^\\n]{1,${width}})\\s`, 'g'),
    '$1\n',
  );
}

function capitalize(s: string | undefined): string | undefined {
  if (!s) {
    return;
  }

  if (s.length <= 3) {
    return s.toUpperCase();
  }

  return s
    .split(/_|\s/)
    .map((s) => s[0].toUpperCase() + s.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

function comma(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function chunks<T>(a: Array<T>, size: number): T[][] {
  return Array.from(
    new Array(Math.ceil(a.length / size)),
    (_, i) => a.slice(i * size, i * size + size),
  );
}

function distance(a: string, b: string): number {
  return 100 - 100 * _distance(a, b) / (a.length + b.length);
}

function parseId(query: string): number | undefined {
  const id = parseInt(query);

  if (!isNaN(id) && id.toString() === query) {
    return id;
  }
}

function decodeDescription(s?: string): string | undefined {
  if (!s) {
    return;
  }

  s = decodeURI(s);

  s = s.replaceAll('&lt;', '<');
  s = s.replaceAll('&gt;', '>');
  s = s.replaceAll('&#039;', '\'');
  s = s.replaceAll('&quot;', '"');
  s = s.replaceAll('&apos;', '\'');
  s = s.replaceAll('&amp;', '&');

  s = s.replace(/~!.+!~/gm, '');
  s = s.replace(/\|\|.+\|\|/gm, '');

  s = s.replace(/<i.*?>(.*?)<\/?i>/g, (_, s) => `*${s.trim()}*`);
  s = s.replace(/<b.*?>(.*?)<\/?b>/g, (_, s) => `**${s.trim()}**`);
  s = s.replace(
    /<strike.*?>(.*?)<\/?strike>/g,
    (_, s) => `~~${s.trim()}~~`,
  );

  s = s.replace(/<\/?br\/?>|<\/?hr\/?>/gm, '\n');

  s = s.replace(/<a.*?href=("|')(.*?)("|').*?>(.*?)<\/?a>/g, '[$4]($2)');

  // s = s.replace(/<a.*?href=("|')(.*?)("|').*?>(.*?)<\/a>/g, '$4');
  // s = s.replace(/\[(.*)\]\((.*)\)/g, '$1');
  // s = s.replace(/(?:https?):\/\/[\n\S]+/gm, '');

  // max characters for discord descriptions is 4096
  return truncate(s, 4096);
}

function hexToUint8Array(hex: string): Uint8Array | undefined {
  const t = hex.match(/.{1,2}/g)?.map((val) => parseInt(val, 16));

  if (t?.length) {
    return new Uint8Array(t);
  }
}

function verifySignature(
  { publicKey, signature, timestamp, body }: {
    publicKey?: string;
    signature?: string;
    timestamp?: string;
    body: string;
  },
): { valid: boolean; body: string } {
  if (!signature || !timestamp || !publicKey) {
    return { valid: false, body };
  }

  const valid = ed25519.verify(
    // deno-lint-ignore no-non-null-assertion
    hexToUint8Array(publicKey)!,
    // deno-lint-ignore no-non-null-assertion
    hexToUint8Array(signature)!,
    new TextEncoder().encode(timestamp + body),
  );

  return { valid, body };
}

const proxy = async (r: Request) => {
  const { pathname, origin } = new URL(r.url);

  try {
    const url = new URL(
      decodeURIComponent(pathname.substring('/external/'.length)),
    );

    let cached = true;

    const response = await globalCache.match(url as unknown as Request) ??
      (cached = false, await fetch(url));

    const type = response?.headers.get('content-type');

    // FIXME discord doesn't allow any gif that doesn't end with the file extension
    // (see #39)
    if (type === 'image/gif' && !url.pathname.endsWith('.gif')) {
      throw new Error();
    }

    // TODO image customization
    //(see https://github.com/ker0olos/fable/issues/24)

    if (response?.status !== 200 || !type?.startsWith('image/')) {
      throw new Error();
    }

    const body = await response.arrayBuffer();

    const proxy = new Response(body);

    proxy.headers.set('content-type', type);
    proxy.headers.set('content-length', `${body.byteLength}`);
    proxy.headers.set('cache-control', 'public, max-age=604800');

    if (!cached) {
      await globalCache.put(url as unknown as Request, proxy);
    }

    return proxy;
  } catch {
    if (r.url?.includes('?size=thumbnail')) {
      return Response.redirect(`${origin}/assets/thumbnail.png`);
    }
    return Response.redirect(`${origin}/assets/medium.png`);
  }
};

const utils = {
  capitalize,
  comma,
  decodeDescription,
  hexToInt,
  parseId,
  randint,
  rng,
  shuffle,
  sleep,
  truncate,
  chunks,
  distance,
  verifySignature,
  proxy,
  wrap,
};

export default utils;
