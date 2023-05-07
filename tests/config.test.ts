// deno-lint-ignore-file no-explicit-any

import { assertEquals } from 'https://deno.land/std@0.183.0/testing/asserts.ts';

import {
  returnsNext,
  stub,
} from 'https://deno.land/std@0.183.0/testing/mock.ts';

import config, { clearConfig, initConfig } from '../src/config.ts';

Deno.test('init', async (test) => {
  await test.step('stable', async () => {
    const permissionsStub = stub(
      Deno.permissions,
      'query',
      () => ({ state: 'granted' } as any),
    );

    const readFileStub = stub(
      Deno,
      'readTextFile',
      () => Promise.resolve(''),
    );

    const hasStub = stub(
      Deno.env,
      'has',
      returnsNext([
        false,
        false,
        false,
        false,
        false,
      ]),
    );

    const getStub = stub(
      Deno.env,
      'get',
      returnsNext([
        '',
        'sentry_dsn',
        'app_id',
        'public_key',
        'fauna_secret',
        '123',
        'topgg_secret',
        'notice_message',
      ]),
    );

    try {
      await initConfig();

      assertEquals(config, {
        deploy: false,
        appId: 'app_id',
        publicKey: 'public_key',
        faunaSecret: 'fauna_secret',
        sentry: 'sentry_dsn',
        topggCipher: 123,
        topggSecret: 'topgg_secret',
        notice: 'notice_message',
        gacha: true,
        trading: true,
        stealing: true,
        synthesis: true,
        communityPacks: true,
        origin: undefined,
      });
    } finally {
      clearConfig();
      permissionsStub.restore();
      readFileStub.restore();
      hasStub.restore();
      getStub.restore();
    }
  });

  await test.step('deploy', async () => {
    const permissionsStub = stub(
      Deno.permissions,
      'query',
      () => ({ state: 'granted' } as any),
    );

    const readFileStub = stub(
      Deno,
      'readTextFile',
      () => Promise.resolve(''),
    );

    const hasStub = stub(
      Deno.env,
      'has',
      returnsNext([
        true,
        true,
        true,
        true,
        true,
      ]),
    );

    const getStub = stub(
      Deno.env,
      'get',
      returnsNext([
        '1',
        'sentry_dsn',
        'app_id',
        'public_key',
        'fauna_secret',
        '123',
        'topgg_secret',
        'notice_message',
        '0',
        '0',
        '0',
        '0',
        '0',
      ]),
    );

    try {
      await initConfig();

      assertEquals(config, {
        deploy: true,
        appId: 'app_id',
        publicKey: 'public_key',
        faunaSecret: 'fauna_secret',
        sentry: 'sentry_dsn',
        topggCipher: 123,
        topggSecret: 'topgg_secret',
        notice: 'notice_message',
        gacha: false,
        trading: false,
        stealing: false,
        synthesis: false,
        communityPacks: false,
        origin: undefined,
      });
    } finally {
      clearConfig();
      permissionsStub.restore();
      readFileStub.restore();
      hasStub.restore();
      getStub.restore();
    }
  });
});
