// deno-lint-ignore-file no-explicit-any

import Ajv, { ValidateFunction } from 'https://esm.sh/ajv@8.12.0';

import { bold, green, red } from 'https://deno.land/std@0.178.0/fmt/colors.ts';

import { AssertionError } from 'https://deno.land/std@0.178.0/testing/asserts.ts';

import utils from './utils.ts';

import alias from '../json/alias.json' assert {
  type: 'json',
};

import image from '../json/image.json' assert {
  type: 'json',
};

import media from '../json/media.json' assert {
  type: 'json',
};

import character from '../json/character.json' assert {
  type: 'json',
};

import index from '../json/schema.json' assert {
  type: 'json',
};

import builtin from '../json/schema.builtin.json' assert {
  type: 'json',
};

import { Manifest } from './types.ts';

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

export const prettify = (
  data: any,
  { errors }: ValidateFunction,
  opts?: { markdown?: boolean; terminal?: boolean },
) => {
  if (!errors) {
    throw new Error();
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

  errors.forEach((err, index) => {
    if (err.instancePath === '') {
      data = appendError(data, index);
    }
  });

  let json = JSON.stringify(
    data,
    replacerWithPath((value, path) => {
      // deno-lint-ignore no-non-null-assertion
      const index = errors!.findIndex((e) => e.instancePath === path);

      return appendError(value, index);
    }),
    2,
  );

  errors.forEach((err, index) => {
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
        (_: unknown, s: string) => `${s}" >>> ${message}\n${underline}`,
      );
  });

  if (opts?.markdown) {
    return `Errors: ${errors.length}` + '\n```json\n' + json + '\n```';
  }

  return json;
};

export const assertValidManifest = (data: Manifest) => {
  const validate = new Ajv({ strict: false, allErrors: true })
    .addSchema(alias)
    .addSchema(image)
    .addSchema(media)
    .addSchema(character)
    .addSchema(index).compile(builtin);

  if (!validate(data)) {
    throw new AssertionError(prettify(data, validate));
  }
};

export default (data: Manifest): { error?: string } => {
  const validate = new Ajv({ strict: false, allErrors: true })
    .addSchema(alias)
    .addSchema(image)
    .addSchema(media)
    .addSchema(character)
    .compile(index);

  if (!validate(data)) {
    return {
      error: prettify(data, validate, { markdown: true }),
    };
  }

  return {};
};

// if being called directly
if (import.meta.main) {
  const filename = Deno.args[0];

  const data = await utils.readJson(filename);

  const validate = new Ajv({ strict: false, allErrors: true })
    .addSchema(alias)
    .addSchema(image)
    .addSchema(media)
    .addSchema(character)
    .compile(index);

  if (!validate(data)) {
    console.log(prettify(data, validate, { terminal: true }));
    Deno.exit(1);
  } else {
    console.log(green('Valid'));
  }
}
