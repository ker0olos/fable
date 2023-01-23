// deno-lint-ignore-file no-explicit-any

import { assertEquals } from 'https://deno.land/std@0.173.0/testing/asserts.ts';

import {
  returnsNext,
  stub,
} from 'https://deno.land/std@0.173.0/testing/mock.ts';

import config, {
  clearConfig,
  initConfig,
  updateConfig,
} from '../src/config.ts';

Deno.test('init', async (test) => {
  await test.step('stable', async () => {
    const permissionsStub = stub(
      Deno.permissions,
      'query',
      () => ({ state: 'granted' } as any),
    );

    const readFileStub = stub(
      Deno,
      'readFile',
      // deno-lint-ignore require-await
      async () => new Uint8Array(),
    );

    const envStub = stub(
      Deno.env,
      'get',
      returnsNext([
        '',
        'sentry_dsn',
        'app_id',
        'public_key',
        'mongo_url',
      ]),
    );

    try {
      await initConfig();

      assertEquals(config, {
        deploy: false,
        dev: false,
        appId: 'app_id',
        publicKey: 'public_key',
        mongoUrl: 'mongo_url',
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

  await test.step('dev', async () => {
    const permissionsStub = stub(
      Deno.permissions,
      'query',
      () => ({ state: 'granted' } as any),
    );

    const readFileStub = stub(
      Deno,
      'readFile',
      // deno-lint-ignore require-await
      async () => new Uint8Array(),
    );

    const envStub = stub(
      Deno.env,
      'get',
      returnsNext([
        '',
        'sentry_dsn',
        'app_id',
        'public_key',
        'mongo_url',
      ]),
    );

    try {
      await initConfig();

      assertEquals(config, {
        deploy: false,
        dev: false,
        appId: 'app_id',
        publicKey: 'public_key',
        mongoUrl: 'mongo_url',
        origin: undefined,
        sentry: 'sentry_dsn',
      });

      await updateConfig(new URL('http://localhost:8000/dev'));

      assertEquals(config, {
        deploy: false,
        dev: true,
        appId: 'app_id',
        publicKey: 'public_key',
        mongoUrl: 'mongo_url',
        origin: 'http://localhost:8000',
        sentry: 'sentry_dsn',
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
      'readFile',
      // deno-lint-ignore require-await
      async () => new Uint8Array(),
    );

    const envStub = stub(
      Deno.env,
      'get',
      returnsNext([
        '1',
        'sentry_dsn',
        'app_id',
        'public_key',
        'mongo_url',
      ]),
    );

    try {
      await initConfig();

      assertEquals(config, {
        deploy: true,
        dev: false,
        appId: 'app_id',
        publicKey: 'public_key',
        mongoUrl: 'mongo_url',
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
