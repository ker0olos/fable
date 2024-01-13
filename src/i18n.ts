import { AvailableLocales } from './discord.ts';

import EN from '../i18n/en-US.json' with { type: 'json' };
import ES from '../i18n/es-ES.json' with { type: 'json' };

export type Keys = keyof typeof EN;

function get(
  key: Keys,
  locale: AvailableLocales = 'en-US',
  ...args: (string | number)[]
): string {
  let value: string = key;

  switch (locale) {
    case 'es-ES':
      value = ES[key];
      break;
    default:
      value = EN[key];
      break;
  }

  value ??= key;

  if (args?.length) {
    value = value.replaceAll(
      /{(\d+)}/g,
      (match, i) => typeof args[i] !== 'undefined' ? `${args[i]}` : match,
    );
  }

  return value;
}

const i18n = { get };

export default i18n;
