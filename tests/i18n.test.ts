/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest';
import i18n from '~/src/i18n.ts';

describe('i18n', () => {
  // Store original dictionary and restore it after each test
  let originalDict: typeof i18n.dict;

  beforeEach(() => {
    // Save original dictionary before each test
    originalDict = i18n.dict;

    // Restore original dictionary after each test
    return () => {
      i18n.dict = originalDict;
    };
  });

  describe('es-ES', () => {
    it('return value if exists', () => {
      const key = 'someKey';

      const enValue = 'Value in English';
      const esValue = 'Valor en español';

      const mockEN = { [key]: enValue };
      const mockES = { [key]: esValue };

      i18n.dict = {
        'en-US': mockEN,
        'es-ES': mockES,
      } as any;

      // Test Spanish translation
      const resultES = i18n.get(key as any, 'es-ES');
      expect(resultES).toBe(esValue);

      // Test English translation
      const resultEN = i18n.get(key as any, 'en-US');
      expect(resultEN).toBe(enValue);
    });

    it('fallback to english', () => {
      const key = 'someKey';

      const enValue = 'Value in English';

      const mockEN = { [key]: enValue };
      const mockES = {};

      i18n.dict = {
        'en-US': mockEN,
        'es-ES': mockES,
      } as any;

      // Test Spanish translation
      const resultES = i18n.get(key as any, 'es-ES');
      expect(resultES).toBe(enValue);

      // Test English translation
      const resultEN = i18n.get(key as any, 'en-US');
      expect(resultEN).toBe(enValue);
    });
  });

  it('sub template strings', () => {
    const key = 'someKey';

    const mockEN = {
      [key]: 'Hello, {0}',
    };

    i18n.dict = {
      'en-US': mockEN,
    } as any;

    const resultDefault = i18n.get(key as any, 'en-US', 'World');

    expect(resultDefault).toBe('Hello, World');
  });

  it('fallback to key if not found', () => {
    const key = 'someKey';

    const mockEN = {};
    const mockES = {};

    i18n.dict = {
      'en-US': mockEN,
      'es-ES': mockES,
    } as any;

    const resultDefault = i18n.get(key as any, 'es-ES');

    expect(resultDefault).toBe(key);
  });
});
