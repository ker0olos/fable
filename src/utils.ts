import nacl from 'tweetnacl';

import { chunk } from '$std/collections/chunk.ts';

import { basename, extname } from '$std/path/mod.ts';
import { extensionsByType } from '$std/media_types/mod.ts';

import {
  captureException as _captureException,
  init as _initSentry,
} from 'sentry';

import { json, serve, serveStatic, validateRequest } from 'sift';

import { distance as levenshtein } from 'levenshtein';

import { proxy as _proxy } from 'images-proxy';

import {
  RECHARGE_DAILY_TOKENS_HOURS,
  RECHARGE_KEYS_MINS,
  RECHARGE_MINS,
  STEAL_COOLDOWN_HOURS,
} from '~/db/mod.ts';

import type { Attachment } from '~/src/discord.ts';

export enum ImageSize {
  Preview = 'preview',
  Thumbnail = 'thumbnail',
  Medium = 'medium',
  Large = 'large',
}

type DayOfWeek =
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday';

class LehmerRNG {
  private seed: number;

  constructor(seed: string) {
    this.seed = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      this.seed ^= seed.charCodeAt(i);
      this.seed *= 16777619;
    }
    this.seed = this.seed >>> 0;
  }

  nextFloat(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed / 2147483647;
  }
}

function getRandomFloat(): number {
  const randomInt = crypto.getRandomValues(new Uint32Array(1))[0];
  return randomInt / 2 ** 32;
}

function nanoid(size = 16): string {
  return crypto.getRandomValues(new Uint8Array(size)).reduce((id, byte) => {
    byte &= 63;
    if (byte < 36) {
      // `0-9a-z`
      id += byte.toString(36);
    } else if (byte < 62) {
      // `A-Z`
      id += (byte - 26).toString(36).toLowerCase();
    } else if (byte > 62) {
      id += '-';
    } else {
      id += '_';
    }
    return id;
  }, '');
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

function shuffle<T>(array: T[], seed?: string): void {
  const rng = seed ? () => new LehmerRNG(seed).nextFloat() : Math.random;

  for (
    let i = 0, length = array.length, swap = 0, temp = null;
    i < length;
    i++
  ) {
    swap = Math.floor(rng() * (i + 1));
    temp = array[swap];
    array[swap] = array[i];
    array[i] = temp;
  }
}

function sleep(secs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, secs * 1000));
}

async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit,
  n = 0,
): Promise<Response> {
  try {
    const response = await fetch(input, init);

    if (response.status > 400) {
      throw new Error(`${response.status}:${response.statusText}`);
    }

    return response;
  } catch (err) {
    if (n > 5) {
      throw err;
    }

    await sleep(0.250 * n);

    return fetchWithRetry(input, init, n + 1);
  }
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
    .filter(nonNullable)
    .map((s) => s[0]?.toUpperCase() + s.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

function compact(n: number): string {
  if (n <= 0) {
    return '0';
  }

  const units = ['', 'K', 'M', 'G', 'T', 'P', 'E'];
  const index = Math.floor(Math.log10(Math.abs(n)) / 3);
  const value = n / Math.pow(10, index * 3);

  const formattedValue = value.toFixed(1)
    .replace(/\.0+$/, '');

  return formattedValue + units[index];
}

function comma(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function distance(a: string, b: string): number {
  return 100 -
    (100 * levenshtein(a.toLowerCase(), b.toLowerCase())) /
      (a.length + b.length);
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
  s = s.replaceAll('&#039;', "'");
  s = s.replaceAll('&quot;', '"');
  s = s.replaceAll('&apos;', "'");
  s = s.replaceAll('&rsquo;', "'");
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
    (err as Error).message = `${filePath}: ${(err as Error).message}`;
    throw err;
  }
}

function normalTimestamp(v?: Date): string {
  const parsed = v ?? new Date();

  const ts = parsed.getTime();

  // discord uses seconds not milliseconds
  return Math.floor(ts / 1000).toString();
}

function rechargeTimestamp(v?: Date): string {
  const parsed = v ?? new Date();

  parsed.setMinutes(parsed.getMinutes() + RECHARGE_MINS);

  const ts = parsed.getTime();

  // discord uses seconds not milliseconds
  return Math.floor(ts / 1000).toString();
}

function rechargeDailyTimestamp(v?: Date): string {
  const parsed = v ?? new Date();

  parsed.setHours(parsed.getHours() + RECHARGE_DAILY_TOKENS_HOURS);

  const ts = parsed.getTime();

  // discord uses seconds not milliseconds
  return Math.floor(ts / 1000).toString();
}

function rechargeKeysTimestamp(v?: Date): string {
  const parsed = v ?? new Date();

  parsed.setMinutes(parsed.getMinutes() + RECHARGE_KEYS_MINS);

  const ts = parsed.getTime();

  // discord uses seconds not milliseconds
  return Math.floor(ts / 1000).toString();
}

function rechargeStealTimestamp(v?: Date): string {
  const parsed = v ?? new Date();

  parsed.setHours(parsed.getHours() + STEAL_COOLDOWN_HOURS);

  const ts = parsed.getTime();

  // discord uses seconds not milliseconds
  return Math.floor(ts / 1000).toString();
}

function diffInDays(a: Date, b: Date): number {
  return Math.floor(Math.abs(a.getTime() - b.getTime()) / 3600000 / 24);
}

function diffInHours(a: Date, b: Date): number {
  return Math.floor(Math.abs(a.getTime() - b.getTime()) / 3600000);
}

function diffInMinutes(a: Date, b: Date): number {
  return Math.floor(Math.abs(a.getTime() - b.getTime()) / 60000);
}

function captureException(err: Error, opts?: {
  // deno-lint-ignore no-explicit-any
  extra?: any;
}): string {
  return _captureException(err, {
    extra: {
      ...(err.cause ?? {}),
      ...(opts?.extra ?? {}),
    },
  });
}

function nonNullable<T>(value: T): value is NonNullable<T> {
  return Boolean(value);
}

function isWithin14Days(date?: Date): boolean {
  if (!date) return false;
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  return date >= fourteenDaysAgo;
}
function pagination<T, X extends string>(
  url: URL,
  collection: T[],
  collectionName: X,
  defaultLimit = 20,
): { [K in X]: T[] } & { length: number; offset: number; limit: number } {
  const limit = +(url.searchParams.get('limit') ?? defaultLimit);
  const offset = +(url.searchParams.get('offset') ?? 0);

  const paginatedCollection = collection.slice(offset, offset + limit);

  return {
    [collectionName]: paginatedCollection,
    length: collection.length,
    offset,
    limit,
  } as { [K in X]: T[] } & { length: number; offset: number; limit: number };
}

function getDayOfWeek(): DayOfWeek {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  return days[new Date().getUTCDay()] as DayOfWeek;
}

function initSentry(dsn?: string): void {
  const DENO_DEPLOYMENT_ID = Deno.env.get('DENO_DEPLOYMENT_ID');

  if (dsn) {
    _initSentry({ dsn, release: DENO_DEPLOYMENT_ID });
  }
}

async function proxy(
  url?: string,
  size?: ImageSize,
): Promise<Attachment> {
  let filename = url ? basename(url) : 'default.webp';

  const file = await _proxy(url ?? '', size);

  if (extname(filename) === '') {
    const ext = extensionsByType(file.format);

    if (ext?.length) {
      filename = `${filename}.${ext[0]}`;
    }
  }

  const asciiFilename = Array.from(filename)
    .map((char) => char.charCodeAt(0))
    .map((code) => code < 128 ? String.fromCharCode(code) : '-')
    .join('')
    .replaceAll('_', '-')
    .replace(/\s+/g, '');

  return {
    filename: asciiFilename,
    arrayBuffer: file.image,
    type: file.format,
  };
}

const utils = {
  proxy,
  LehmerRNG,
  isWithin14Days,
  capitalize,
  captureException,
  chunks: chunk,
  comma,
  compact,
  nonNullable,
  decodeDescription,
  diffInDays,
  diffInMinutes,
  diffInHours,
  getDayOfWeek,
  distance,
  fetchWithRetry,
  getRandomFloat,
  hexToInt,
  initSentry,
  json,
  nanoid,
  parseInt: _parseInt,
  readJson,
  normalTimestamp,
  rechargeTimestamp,
  rechargeDailyTimestamp,
  rechargeKeysTimestamp,
  rechargeStealTimestamp,
  rng,
  serve,
  serveStatic,
  shuffle,
  sleep,
  truncate,
  validateRequest,
  verifySignature,
  wrap,
  pagination,
};

export default utils;
