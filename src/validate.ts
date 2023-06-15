// deno-lint-ignore-file no-explicit-any

import Ajv from 'ajv';

import { prettify } from 'awesome-ajv';

import { AssertionError } from '$std/testing/asserts.ts';

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
    .compile(index);

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
