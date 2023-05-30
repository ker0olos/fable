import nacl from 'https://esm.sh/tweetnacl@1.0.3';

import {
  decode as base64Decode,
  encode as base64Encode,
} from 'https://raw.githubusercontent.com/commenthol/url-safe-base64/v1.3.0/src/index.js';

import {
  captureException,
  init as initSentry,
} from 'https://raw.githubusercontent.com/timfish/sentry-deno/fb3c482d4e7ad6c4cf4e7ec657be28768f0e729f/src/mod.ts';

import {
  json,
  serve,
  serveStatic,
  validateRequest,
} from 'https://deno.land/x/sift@0.6.0/mod.ts';

import { distance as _distance } from 'https://raw.githubusercontent.com/ka-weihe/fastest-levenshtein/1.0.15/mod.ts';

import { RECHARGE_MINS } from '../models/get_user_inventory.ts';

export enum ImageSize {
  Preview = 'preview', // 64x64
  Thumbnail = 'thumbnail', // 110x155
  Medium = 'medium', // 230x325
  Large = 'large', // 450x635,
}

function randint(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomFloat(): number {
  const randomInt = crypto.getRandomValues(new Uint32Array(1))[0];
  return randomInt / 2 ** 32;
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

function rng<T>(dict: { [chance: number]: T }): { value: T; chance: number } {
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
  return {
    value: pool[_[0]],
    chance: chances[_[0]],
  };
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
  return 100 -
    100 * _distance(a.toLowerCase(), b.toLowerCase()) / (a.length + b.length);
}

function _parseInt(query?: string): number | undefined {
  if (query === undefined) {
    return;
  }

  const id = parseInt(query);

  if (!isNaN(id) && id.toString() === query) {
    return id;
  }
}

function decodeDescription(s?: string): string | undefined {
  if (!s) {
    return;
  }

  s = s.replaceAll('&lt;', '<');
  s = s.replaceAll('&gt;', '>');
  s = s.replaceAll('&#039;', '\'');
  s = s.replaceAll('&quot;', '"');
  s = s.replaceAll('&apos;', '\'');
  s = s.replaceAll('&rsquo;', '\'');
  s = s.replaceAll('&mdash;', '-');
  s = s.replaceAll('&amp;', '&');

  s = s.replace(/~![\S\s]+!~/gm, '');
  s = s.replace(/\|\|[\S\s]+\|\|/gm, '');

  s = s.replace(/<i.*?>([\S\s]*?)<\/?i>/g, (_, s) => `*${s.trim()}*`);
  s = s.replace(/<b.*?>([\S\s]*?)<\/?b>/g, (_, s) => `**${s.trim()}**`);
  s = s.replace(
    /<strike.*?>([\S\s]*)<\/?strike>/g,
    (_, s) => `~~${s.trim()}~~`,
  );

  s = s.replace(/<\/?br\/?>|<\/?hr\/?>/gm, '\n');

  s = s.replace(/<a.*?href=("|')(.*?)("|').*?>([\S\s]*?)<\/?a>/g, '[$4]($2)');

  return s;
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
    signature?: string | null;
    timestamp?: string | null;
    body: string;
  },
): { valid: boolean; body: string } {
  if (!signature || !timestamp || !publicKey) {
    return { valid: false, body };
  }

  const valid = nacl.sign.detached.verify(
    new TextEncoder().encode(timestamp + body),
    // deno-lint-ignore no-non-null-assertion
    hexToUint8Array(signature)!,
    // deno-lint-ignore no-non-null-assertion
    hexToUint8Array(publicKey)!,
  );

  return { valid, body };
}

async function readJson<T>(filePath: string): Promise<T> {
  try {
    const jsonString = await Deno.readTextFile(filePath);
    return JSON.parse(jsonString);
  } catch (err) {
    err.message = `${filePath}: ${err.message}`;
    throw err;
  }
}

function rechargeTimestamp(v?: string): string {
  const parsed = new Date(v ?? new Date());

  parsed.setMinutes(parsed.getMinutes() + RECHARGE_MINS);

  const ts = parsed.getTime();

  // discord uses seconds not milliseconds
  return Math.floor(ts / 1000).toString();
}

function votingTimestamp(v?: string): { canVote: boolean; timeLeft: string } {
  const parsed = new Date(v ?? new Date());

  parsed.setHours(parsed.getHours() + 12);

  const ts = parsed.getTime();

  return {
    canVote: Date.now() >= parsed.getTime(),
    // discord uses seconds not milliseconds
    timeLeft: Math.floor(ts / 1000).toString(),
  };
}

function stealTimestamp(v?: string): string {
  const parsed = new Date(v ?? new Date());

  const ts = parsed.getTime();

  // discord uses seconds not milliseconds
  return Math.floor(ts / 1000).toString();
}

function diffInDays(a: Date, b: Date): number {
  return Math.floor(Math.abs(a.getTime() - b.getTime()) / 3600000 / 24);
}

function cipher(str: string, secret: number): string {
  let b = '';

  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);

    code = code + secret;

    b += String.fromCharCode(code);
  }

  return base64Encode(btoa(b));
}

function decipher(a: string, secret: number): string {
  let str = '';

  const b = atob(base64Decode(a));

  for (let i = 0; i < b.length; i++) {
    let code = b.charCodeAt(i);

    code = code - secret;

    str += String.fromCharCode(code);
  }

  return str;
}

function captureOutage(id: string): Promise<Response> {
  return fetch(
    `https://api.instatus.com/v3/integrations/webhook/${id}`,
    {
      method: 'POST',
      body: JSON.stringify({
        'trigger': 'down',
      }),
    },
  );
}

const utils = {
  capitalize,
  captureException,
  captureOutage,
  chunks,
  cipher,
  comma,
  decipher,
  decodeDescription,
  distance,
  hexToInt,
  initSentry,
  json,
  parseInt: _parseInt,
  randint,
  diffInDays,
  readJson,
  rechargeTimestamp,
  rng,
  serve,
  serveStatic,
  shuffle,
  sleep,
  truncate,
  validateRequest,
  verifySignature,
  votingTimestamp,
  stealTimestamp,
  getRandomFloat,
  wrap,
};

export default utils;
