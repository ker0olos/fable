// deno-lint-ignore-file no-explicit-any prefer-ascii

import { assertEquals } from '$std/assert/mod.ts';

import i18n from '~/src/i18n.ts';

Deno.test('es-ES', async (test) => {
  await test.step('return value if exists', () => {
    try {
      const key = 'someKey';

      const enValue = 'Value in English';
      const esValue = 'Valor en español';

      const mockEN = { [key]: enValue };
      const mockES = { [key]: esValue };

      // deno-lint-ignore ban-ts-comment
      //@ts-ignore
      i18n._dict = i18n.dict;

      i18n.dict = {
        'en-US': mockEN,
        'es-ES': mockES,
      } as any;

      // Test Spanish translation
      const resultES = i18n.get(key as any, 'es-ES');
      assertEquals(resultES, esValue);

      // Test English translation
      const resultEN = i18n.get(key as any, 'en-US');
      assertEquals(resultEN, enValue);
    } finally {
      // deno-lint-ignore ban-ts-comment
      //@ts-ignore
      i18n.dict = i18n._dict;
    }
  });

  await test.step('fallback to english', () => {
    try {
      const key = 'someKey';

      const enValue = 'Value in English';

      const mockEN = { [key]: enValue };
      const mockES = {};

      // deno-lint-ignore ban-ts-comment
      //@ts-ignore
      i18n._dict = i18n.dict;

      i18n.dict = {
        'en-US': mockEN,
        'es-ES': mockES,
      } as any;

      // Test Spanish translation
      const resultES = i18n.get(key as any, 'es-ES');
      assertEquals(resultES, enValue);

      // Test English translation
      const resultEN = i18n.get(key as any, 'en-US');
      assertEquals(resultEN, enValue);
    } finally {
      // deno-lint-ignore ban-ts-comment
      //@ts-ignore
      i18n.dict = i18n._dict;
    }
  });
});

Deno.test('sub template strings', () => {
  try {
    const key = 'someKey';

    const mockEN = {
      [key]: 'Hello, {0}',
    };

    // deno-lint-ignore ban-ts-comment
    //@ts-ignore
    i18n._dict = i18n.dict;

    i18n.dict = {
      'en-US': mockEN,
    } as any;

    const resultDefault = i18n.get(key as any, 'en-US', 'World');

    assertEquals(resultDefault, 'Hello, World');
  } finally {
    // deno-lint-ignore ban-ts-comment
    //@ts-ignore
    i18n.dict = i18n._dict;
  }
});

Deno.test('fallback to key if not found', () => {
  try {
    const key = 'someKey';

    const mockEN = {};
    const mockES = {};

    // deno-lint-ignore ban-ts-comment
    //@ts-ignore
    i18n._dict = i18n.dict;

    i18n.dict = {
      'en-US': mockEN,
      'es-ES': mockES,
    } as any;

    const resultDefault = i18n.get(key as any, 'es-ES');

    assertEquals(resultDefault, key);
  } finally {
    // deno-lint-ignore ban-ts-comment
    //@ts-ignore
    i18n.dict = i18n._dict;
  }
});
