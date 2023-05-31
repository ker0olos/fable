// deno-lint-ignore-file no-explicit-any

import Ajv from 'https://esm.sh/ajv@8.12.0';

import { prettify } from 'https://esm.sh/awesome-ajv-errors@5.1.0';

import { green, red } from '$std/fmt/colors.ts';

import { AssertionError } from '$std/testing/asserts.ts';

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

const reservedIds = ['anilist', 'vtubers'];

export const purgeReservedProps = (data: Manifest): Manifest => {
  const purged: any = {};

  Object.keys(data).forEach((key) => {
    if (key.startsWith('$')) {
      return;
    }

    purged[key] = data[key as keyof Manifest];
  });

  return purged as Manifest;
};

export const assertValidManifest = (data: Manifest) => {
  const validate = new Ajv({ strict: false, allErrors: true })
    .addSchema(alias)
    .addSchema(image)
    .addSchema(media)
    .addSchema(character)
    .addSchema(index).compile(builtin);

  if (!validate(data)) {
    throw new AssertionError(prettify(validate, {
      bigNumbers: false,
      data,
    }));
  }
};

export default (data: Manifest) => {
  data = purgeReservedProps(data);

  // deno-lint-ignore ban-ts-comment
  //@ts-ignore
  index.additionalProperties = false;

  const validate = new Ajv({ strict: false, allErrors: true })
    .addSchema(alias)
    .addSchema(image)
    .addSchema(media)
    .addSchema(character)
    .compile(index);

  if (reservedIds.includes(data.id)) {
    return { errors: [`${data.id} is a reserved id`] };
  } else if (!validate(data)) {
    return {
      errors: validate.errors,
    };
  } else if (data.media?.new?.length && data.media.new.length > 16) {
    return { errors: [`A single pack can't contain more than 16 media`] };
  } else if (data.characters?.new?.length && data.characters.new.length > 128) {
    return { errors: [`A single pack can't contain more than 128 characters`] };
  } else {
    return { errors: [] };
  }
};

// if being called directly
if (import.meta.main) {
  const filename = Deno.args[0];

  let data = (await utils.readJson(filename)) as Manifest;

  data = purgeReservedProps(data);

  // deno-lint-ignore ban-ts-comment
  //@ts-ignore
  index.additionalProperties = false;

  const validate = new Ajv({ strict: false, allErrors: true })
    .addSchema(alias)
    .addSchema(image)
    .addSchema(media)
    .addSchema(character)
    .compile(index);

  if (reservedIds.includes(data.id)) {
    console.log(red(`${data.id} is a reserved id`));
    Deno.exit(1);
  } else if (!validate(data)) {
    console.log(prettify(validate, {
      bigNumbers: false,
      data,
    }));
    Deno.exit(1);
  } else if (data.media?.new?.length && data.media.new.length > 16) {
    console.log(red(`A single pack can't contain more than 16 media`));
    Deno.exit(1);
  } else if (data.characters?.new?.length && data.characters.new.length > 128) {
    console.log(red(`A single pack can't contain more than 128 characters`));
    Deno.exit(1);
  } else {
    console.log(green('Valid'));
  }
}
