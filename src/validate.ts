// deno-lint-ignore-file no-explicit-any

import Ajv from 'ajv';

import { prettify } from 'awesome-ajv';

import { AssertionError } from '$std/assert/mod.ts';

import alias from '~/json/alias.json' with {
  type: 'json',
};

import image from '~/json/image.json' with {
  type: 'json',
};

import media from '~/json/media.json' with {
  type: 'json',
};

import character from '~/json/character.json' with {
  type: 'json',
};

import index from '~/json/schema.json' with {
  type: 'json',
};

import { Manifest } from '~/src/types.ts';

const reservedIds = ['fable', 'anilist'];

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
  } else {
    return { errors: [] };
  }
};
