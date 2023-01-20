import nacl from 'https://esm.sh/tweetnacl@1.0.3';

import { distance as _distance } from 'https://raw.githubusercontent.com/ka-weihe/fastest-levenshtein/1.0.15/mod.ts';

import config from './config.ts';

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

  s = s.replace(/<i.*?>((.|\s)*?)<\/?i>/g, (_, s) => `*${s.trim()}*`);
  s = s.replace(/<b.*?>((.|\s)*?)<\/?b>/g, (_, s) => `**${s.trim()}**`);
  s = s.replace(
    /<strike.*?>((.|\s)*?)<\/?strike>/g,
    (_, s) => `~~${s.trim()}~~`,
  );

  s = s.replace(/<\/?br\/?>|<\/?hr\/?>/gm, '\n');

  s = s.replace(/<a.*?href=("|')(.*?)("|').*?>(.*?)<\/?a>/g, '[$4]($2)');

  // s = s.replace(/<a.*?href=("|')(.*?)("|').*?>(.*?)<\/a>/g, '$4');
  // s = s.replace(/\[(.*)\]\((.*)\)/g, '$1');
  // s = s.replace(/(?:https?):\/\/[\n\S]+/gm, '');

  return s;
}

async function verifySignature(
  r: Request,
  publicKey?: string,
): Promise<{ valid: boolean; body: string }> {
  const signature = r.headers.get('X-Signature-Ed25519') || undefined;
  const timestamp = r.headers.get('X-Signature-Timestamp') || undefined;

  const body = await r.text();

  function hexToUint8Array(hex?: string): Uint8Array | undefined {
    const t = hex?.match(/.{1,2}/g);

    if (t) {
      return new Uint8Array(
        t.map((val) => parseInt(val, 16)),
      );
    }
  }

  const sig = hexToUint8Array(signature);
  const pubKey = hexToUint8Array(publicKey);

  if (!sig || !pubKey) {
    return { valid: false, body };
  }

  const valid = nacl.sign.detached.verify(
    new TextEncoder().encode(timestamp + body),
    sig,
    pubKey,
  );

  return { valid, body };
}

const proxy = async (r: Request) => {
  try {
    const encoded = new URL(r.url);

    const url = new URL(
      decodeURIComponent(encoded.pathname.substring('/external/'.length)),
    );

    const image = url ? await fetch(url) : undefined;
    const type = image?.headers.get('content-type');

    // NOTE discord doesn't allow any gif that doesn't end with the file extension
    // I suspect it's some kind of nitro restriction thingy like the one with APNGs
    // but for now so it's clear that the gif is invalid we straight out refuse it
    if (type === 'image/gif' && !url.pathname.endsWith('.gif')) {
      throw new Error();
    }

    // TODO image customization
    //(see https://github.com/ker0olos/fable/issues/24)

    // const searchParams = encoded.searchParams;

    if (image?.status === 200 && type?.startsWith('image/')) {
      const body = await image.arrayBuffer();

      const response = new Response(body);

      response.headers.set('content-type', type);
      response.headers.set('content-length', `${body.byteLength}`);
      response.headers.set('cache-control', 'public, max-age=604800');

      return response;
    }

    throw new Error();
  } catch {
    return Response.redirect(`${config.origin}/file/large.jpg`);
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
