import nacl from 'https://cdn.skypack.dev/tweetnacl@v1.0.3?dts';

import { Image, Media } from './types.ts';

function randint(min: number, max: number) {
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

function shuffle<T>(array: T[]) {
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

function sleep(secs: number) {
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

function wrap(text: string, width = 32) {
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

function comma(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function parseId(query?: string): number | undefined {
  const id = parseInt(query!);

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

  s = s.replaceAll(/~!.+!~/gm, '');

  s = s.replace(/<i.*?>((.|\n)*?)<\/i>/g, '*$1*');
  s = s.replace(/<b.*?>((.|\n)*?)<\/b>/g, '**$1**');
  s = s.replace(/<strike.*?>((.|\n)*?)<\/strike>/g, '~~$1~~');

  s = s.replaceAll(/<br>|<\/br>|<br\/>|<hr>|<\/hr>/gm, '\n');

  s = s.replace(/<a.*?href="(.*?)".*?>(.*?)<\/a>/g, '[$2]($1)');

  return s;
}

function titlesToArray(media: Media, max?: number): string[] {
  let titles = [
    media.title?.english,
    media.title?.romaji,
    media.title?.native,
  ];

  titles = titles.filter(Boolean)
    .map((str) => max ? truncate(str, max) : str);

  return titles as string[];
}

function imagesToArray(
  item: Image | undefined,
  order: 'large-first' | 'small-first',
  ideally?: keyof Image,
): string[] | undefined {
  if (!item) {
    return undefined;
  }

  let images = [];

  if (ideally && Boolean(item[ideally])) {
    // if (ideally && ideally in item && Boolean(item[ideally])) {
    return [item[ideally]!];
  }

  images.push(
    item.extraLarge,
    item.large,
    item.medium,
  );

  images = images.filter(Boolean);

  if (order === 'small-first' && images.length > 1) {
    images.reverse();
  }

  return images as string[];
}

async function verifySignature(
  request: Request,
  publicKey: string,
): Promise<{ valid: boolean; body: string }> {
  const signature = request.headers.get('X-Signature-Ed25519')!;
  const timestamp = request.headers.get('X-Signature-Timestamp')!;

  const body = await request.text();

  function hexToUint8Array(hex: string) {
    return new Uint8Array(
      hex?.match(/.{1,2}/g)!.map((val) => parseInt(val, 16)),
    );
  }

  const valid = nacl.sign.detached.verify(
    new TextEncoder().encode(timestamp + body),
    hexToUint8Array(signature),
    hexToUint8Array(publicKey),
  );

  return { valid, body };
}

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
  titlesToArray,
  imagesToArray,
  truncate,
  verifySignature,
  wrap,
};

export default utils;
