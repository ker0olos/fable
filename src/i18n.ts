import '#filter-boolean';

import { AvailableLocales } from './discord.ts';

import EN from '../i18n/en-US.json' assert { type: 'json' };

function get(
  key: keyof typeof EN,
  locale: AvailableLocales = 'en-US',
  ...args: (string | number)[]
): string {
  let value: string = key;

  switch (locale) {
    default:
      value = EN[key];
      break;
  }

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
