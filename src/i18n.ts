import { AvailableLocales } from '~/src/discord.ts';

import EN from '~/i18n/en-US.json' with { type: 'json' };
import ES from '~/i18n/es-ES.json' with { type: 'json' };

export type Keys = keyof typeof EN;

const dict = {
  'en-US': EN,
  'es-ES': ES,
};

function get(
  key: Keys,
  locale: AvailableLocales = 'en-US',
  ...args: (string | number)[]
): string {
  let value: string = key;

  switch (locale) {
    case 'es-ES':
      value = key in i18n.dict[locale]
        ? i18n.dict[locale][key as keyof typeof ES]
        : i18n.dict['en-US'][key];
      break;
    default:
      value = i18n.dict['en-US'][key];
      break;
  }

  value ??= i18n.dict['en-US'][key] ?? key;

  if (args?.length) {
    value = value.replaceAll(
      /{(\d+)}/g,
      (match, i) => typeof args[i] !== 'undefined' ? `${args[i]}` : match,
    );
  }

  return value;
}

const i18n = { get, dict };

export default i18n;
