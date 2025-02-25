import { Ajv } from 'ajv';

import { prettify } from 'awesome-ajv-errors';

import alias from '~/json/alias.json';

import image from '~/json/image.json';

import media from '~/json/media.json';

import character from '~/json/character.json';

import index from '~/json/schema.json';

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
    throw new Error(
      prettify(validate, {
        bigNumbers: false,
        data,
      })
    );
  }
};

export default (data: Manifest) => {
  data = purgeReservedProps(data);

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
