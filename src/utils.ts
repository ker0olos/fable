/* eslint-disable @typescript-eslint/no-explicit-any */

import nacl from 'tweetnacl';

import { nanoid } from 'nanoid';

import { captureException } from '@sentry/deno';

import { distance as levenshtein } from 'fastest-levenshtein';

import {
  RECHARGE_DAILY_TOKENS_HOURS,
  RECHARGE_MINS,
  STEAL_COOLDOWN_HOURS,
} from '~/db/index.ts';

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

export function json(
  jsobj: Parameters<typeof JSON.stringify>[0],
  {
    status = 200,
    statusText = 'OK',
  }: { status?: number; statusText?: string } = {}
): Response {
  const headers = new Headers();

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json; charset=utf-8');
  }

  return new Response(JSON.stringify(jsobj) + '\n', {
    status,
    statusText,
    headers,
  });
}

function getRandomFloat(): number {
  const randomInt = crypto.getRandomValues(new Uint32Array(1))[0];
  return randomInt / 2 ** 32;
}

export async function validateRequest(
  request: Request,
  terms: any
): Promise<{
  error?: { message: string; status: number };
  body?: { [key: string]: unknown };
}> {
  let body = {};

  // Validate the method.
  if (!terms[request.method]) {
    return {
      error: {
        message: `method ${request.method} is not allowed for the URL`,
        status: 405,
      },
    };
  }

  // Validate the params if defined in the terms.
  if (
    terms[request.method]?.params &&
    terms[request.method].params!.length > 0
  ) {
    const requestParams: string[] = [];

    const { searchParams } = new URL(request.url);

    for (const param of searchParams.keys()) {
      requestParams.push(param);
    }

    for (const param of terms[request.method].params!) {
      if (!requestParams.includes(param)) {
        return {
          error: {
            message: `param '${param}' is required to process the request`,
            status: 400,
          },
        };
      }
    }
  }

  // Validate the headers if defined in the terms.
  if (
    terms[request.method].headers &&
    terms[request.method].headers!.length > 0
  ) {
    // Collect the headers into an array.
    const requestHeaderKeys: string[] = [];

    for (const header of request.headers.keys()) {
      requestHeaderKeys.push(header);
    }

    // Loop through the headers defined in the terms and check if they
    // are present in the request.
    for (const header of terms[request.method].headers!) {
      if (!requestHeaderKeys.includes(header.toLowerCase())) {
        return {
          error: {
            message: `header '${header}' not available`,
            status: 400,
          },
        };
      }
    }
  }

  // Validate the body of the request if defined in the terms.
  if (terms[request.method].body && terms[request.method].body!.length > 0) {
    const requestBody: any = await request.json();

    const bodyKeys = Object.keys(requestBody);

    for (const key of terms[request.method].body!) {
      if (!bodyKeys.includes(key)) {
        return {
          error: {
            message: `field '${key}' is not available in the body`,
            status: 400,
          },
        };
      }
    }

    // We store and return the body as once the request.json() is called
    // the user cannot call request.json() again.
    body = requestBody;
  }

  return { body };
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
    let i = 0, length = array.length, swap = 0, temp: T | null = null;
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

async function fastFetchWithRetry(
  input: RequestInfo | URL,
  n = 0
): Promise<Response> {
  try {
    const response = await fetch(input);

    if (response.status > 500) {
      throw new Error(`${response.status}:${response.statusText}`);
    }

    return response;
  } catch (err) {
    if (n > 5) {
      throw err;
    }

    await sleep(0.05);

    return fastFetchWithRetry(input, n + 1);
  }
}

async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit,
  n = 0
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

    await sleep(0.25 * n);

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

  const _: number[] = [];

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

function truncate(str: string | undefined, n: number): string | undefined {
  if (str && str.length > n) {
    const s = str.substring(0, n - 2);
    return s.slice(0, s.lastIndexOf(' ')) + '...';
  }

  return str;
}

function wrap(text: string, width = 32): string {
  return text.replace(
    new RegExp(`(?![^\\n]{1,${width}}$)([^\\n]{1,${width}})\\s`, 'g'),
    '$1\n'
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

  const formattedValue = value.toFixed(1).replace(/\.0+$/, '');

  return formattedValue + units[index];
}

function comma(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function distance(a: string, b: string): number {
  return (
    100 -
    (100 * levenshtein(a.toLowerCase(), b.toLowerCase())) /
      (a.length + b.length)
  );
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
    (_, s) => `~~${s.trim()}~~`
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

function verifySignature({
  publicKey,
  signature,
  timestamp,
  body,
}: {
  publicKey?: string;
  signature?: string | null;
  timestamp?: string | null;
  body: string;
}): { valid: boolean; body: string } {
  if (!signature || !timestamp || !publicKey) {
    return { valid: false, body };
  }

  const valid = nacl.sign.detached.verify(
    new TextEncoder().encode(timestamp + body),

    hexToUint8Array(signature)!,

    hexToUint8Array(publicKey)!
  );

  return { valid, body };
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
  defaultLimit = 20
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

async function proxy(
  url?: string,
  size?: ImageSize
): Promise<Attachment | null> {
  try {
    let response = await fastFetchWithRetry(
      url ??
        'https://raw.githubusercontent.com/ker0olos/fable/refs/heads/main/assets/default.webp'
    );

    let contentType = response.headers.get('Content-Type');

    const sizes: Record<string, [number, number]> = {
      preview: [32, 32],
      thumbnail: [110, 155],
      medium: [230, 325],
      large: [450, 635],
    };

    if (contentType?.startsWith('text/html')) {
      const xml = await response.text();

      const re = /<meta.*?property="og:image".*?content="(.*?)"/;

      const match = xml.match(re);

      if (match) {
        const imageUrl = new URL(match[1]);

        if (imageUrl.hostname === 'i.imgur.com') {
          imageUrl.search = '';
        }

        response = await fetch(imageUrl.toString());
        contentType = response.headers.get('Content-Type');
      } else {
        console.warn('html page has no og:image');
        return proxy(undefined, size);
      }
    }

    if (!contentType) {
      throw new Error('no content type header');
    } else if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(contentType)
    ) {
      console.warn(`image type ${contentType} is not supported`);
      return proxy(undefined, size);
    }

    console.log(`${response.status} ${contentType} ${url}`);

    const data = await response
      .arrayBuffer()
      .then((buffer) => new Uint8Array(buffer));

    const photon = await import('@cf-wasm/photon/node');

    const image = photon.PhotonImage.new_from_byteslice(new Uint8Array(data));

    const resizeToFit = async ([desiredWidth, desiredHeight]: [
      number,
      number,
    ]) => {
      const [currentWidth, currentHeight] = [
        image.get_width(),
        image.get_height(),
      ];

      const wraito = desiredWidth / currentWidth;
      const hratio = desiredHeight / currentHeight;

      const ratio = Math.max(wraito, hratio);

      let newWidth = Math.max(Math.round(currentWidth * ratio), 1);
      let newHeight = Math.max(Math.round(currentHeight * ratio), 1);

      if (newWidth < desiredWidth || newHeight < desiredHeight) {
        const adjusted = Math.max(
          desiredWidth / currentWidth,
          desiredHeight / currentHeight
        );

        newWidth = currentWidth * adjusted;
        newHeight = currentHeight * adjusted;
      }

      const resized = photon.resize(image, newWidth, newHeight, 1);

      const cx = Math.floor(resized.get_width() - desiredWidth) / 2;
      const cy = Math.floor(resized.get_height() - desiredHeight) / 2;

      const final = photon.crop(
        resized,
        cx,
        cy,
        desiredWidth + cx,
        desiredHeight + cy
      );

      resized.free();

      return final;
    };

    const final = await resizeToFit(sizes[size ?? ImageSize.Large]);
    const bytes = final.get_bytes_webp();

    image.free();
    final.free();

    return {
      filename: crypto.randomUUID() + '.webp',
      arrayBuffer: bytes,
      type: 'image/webp',
    };
  } catch (err) {
    console.error(`${url}`);
    throw err;
  }
}

function chunks<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

const utils = {
  proxy,
  LehmerRNG,
  isWithin14Days,
  capitalize,
  chunks,
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
  captureException,
  json,
  nanoid,
  parseInt: _parseInt,
  normalTimestamp,
  rechargeTimestamp,
  rechargeDailyTimestamp,
  rechargeStealTimestamp,
  rng,
  shuffle,
  sleep,
  truncate,
  validateRequest,
  verifySignature,
  wrap,
  pagination,
};

export default utils;
