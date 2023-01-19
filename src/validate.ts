// deno-lint-ignore-file no-explicit-any

import Ajv from 'https://esm.sh/ajv@8.12.0';

import { bold, red } from 'https://deno.land/std@0.172.0/fmt/colors.ts';

import media from '../json/media.json' assert {
  type: 'json',
};

import character from '../json/character.json' assert {
  type: 'json',
};

import index from '../json/index.json' assert {
  type: 'json',
};

import builtin from '../json/builtin.json' assert {
  type: 'json',
};

import { AssertionError } from 'https://deno.land/std@0.172.0/testing/asserts.ts';

const _v = new Ajv({ strict: false, allErrors: true })
  .addSchema(media)
  .addSchema(character)
  .addSchema(index).compile(builtin);

const replacerWithPath = (
  replacer: (value: any, path: string) => string,
) => {
  const m = new Map();

  return function (this: any, key: string, value: any): string {
    let path = m.get(this);

    path += `/${key}`;

    if (value === Object(value)) {
      m.set(value, path);
    }

    return replacer.call(
      this,
      value,
      path.replace(/undefined\/\/?/, '/'),
    );
  };
};

export const validate = (data: any) => _v(data);

export const prettify = (
  data: any,
  opts?: { markdown?: boolean; terminal?: boolean },
) => {
  if (!_v.errors) {
    return '';
  }

  function appendError(data: any, index: number): any {
    const key0 = `ERROR/${index}`;

    if (index > -1) {
      switch (typeof data) {
        case 'object':
          if (Array.isArray(data)) {
            return [
              key0,
              ...data,
            ];
          } else {
            return {
              [key0]: 0,
              ...data,
            };
          }
        default:
          return `${data}${key0}`;
      }
    } else {
      return data;
    }
  }

  _v.errors.forEach((err, index) => {
    if (err.instancePath === '') {
      data = appendError(appendError, index);
    }
  });

  let json = JSON.stringify(
    data,
    replacerWithPath((value, path) => {
      // deno-lint-ignore no-non-null-assertion
      const index = _v.errors!.findIndex((e) => e.instancePath === path);

      return appendError(value, index);
    }),
    2,
  );

  _v.errors.forEach((err, index) => {
    let message = `${err.message}`;

    // deno-lint-ignore no-non-null-assertion
    let underline = '^'.repeat(err.message!.length);

    if (opts?.terminal) {
      message = bold(red(message));
      underline = bold(red(underline));
    }

    json = json
      .replace(new RegExp(`"ERROR/${index}": 0,`), `${message}\n${underline}`)
      .replace(new RegExp(`"ERROR/${index}",`), `${message}\n${underline}`)
      .replace(
        new RegExp(`(.*)ERROR/${index}"`),
        (_, s) => `${s}" >>> ${message}\n${underline}`,
      );
  });

  if (opts?.markdown) {
    return `Errors: ${_v.errors.length}` + '\n```json\n' + json + '\n```';
  }

  return json;
};

export const assertValidManifest = (data: any) => {
  if (!validate(data)) {
    throw new AssertionError(prettify(data, { terminal: true }));
  }
};
