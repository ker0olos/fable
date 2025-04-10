import Ajv from 'ajv';

import alias from '~/json/alias.json' with { type: 'json' };

import image from '~/json/image.json' with { type: 'json' };

import media from '~/json/media.json' with { type: 'json' };

import character from '~/json/character.json' with { type: 'json' };

import index from '~/json/schema.json' with { type: 'json' };

import { Manifest } from '~/src/types.ts';

const reservedIds = ['fable', 'anilist'];

export const purgeReservedProps = (data: Manifest): Manifest => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const validate = new Ajv({
    strictDefaults: false,
    strictKeywords: false,
    strictNumbers: false,
    allErrors: true,
  })
    .addSchema(alias)
    .addSchema(image)
    .addSchema(media)
    .addSchema(character)
    .compile(index);

  if (!validate(data)) {
    throw new Error(validate.errors?.map((error) => error.message).join('\n'));
  }
};

export default (data: Manifest) => {
  data = purgeReservedProps(data);

  index.additionalProperties = false;

  const validate = new Ajv({
    strictDefaults: false,
    strictKeywords: false,
    strictNumbers: false,
    allErrors: true,
  })
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
