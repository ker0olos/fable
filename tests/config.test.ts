// deno-lint-ignore-file no-explicit-any

import { assertEquals } from 'https://deno.land/std@0.177.0/testing/asserts.ts';

import {
  returnsNext,
  stub,
} from 'https://deno.land/std@0.177.0/testing/mock.ts';

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

    const envStub = stub(
      Deno.env,
      'get',
      returnsNext([
        '',
        'sentry_dsn',
        'app_id',
        'public_key',
        'fauna_secret',
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
        origin: undefined,
      });
    } finally {
      clearConfig();
      permissionsStub.restore();
      readFileStub.restore();
      envStub.restore();
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

    const envStub = stub(
      Deno.env,
      'get',
      returnsNext([
        '1',
        'sentry_dsn',
        'app_id',
        'public_key',
        'fauna_secret',
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
        origin: undefined,
      });
    } finally {
      clearConfig();
      permissionsStub.restore();
      readFileStub.restore();
      envStub.restore();
    }
  });
});
