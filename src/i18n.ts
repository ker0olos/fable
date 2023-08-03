import { AvailableLocales } from './discord.ts';

import EN from '../i18n/en-US.json' assert { type: 'json' };

function get(
  key: keyof typeof EN,
  locale: AvailableLocales = 'en-US',
): string {
  switch (locale) {
    default:
      return EN[key];
  }
}

const i18n = { get };

export default i18n;
