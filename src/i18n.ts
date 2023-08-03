import enUS from '../i18n/en-US.json' assert { type: 'json' };

function get(key: keyof typeof enUS, locale = 'en-US'): string {
  switch (locale) {
    default:
      return enUS[key];
  }
}

const i18n = { get };

export default i18n;
