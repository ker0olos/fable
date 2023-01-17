// deno-lint-ignore-file no-explicit-any

import { assertEquals } from 'https://deno.land/std@0.172.0/testing/asserts.ts';

import {
  returnsNext,
  stub,
} from 'https://deno.land/std@0.172.0/testing/mock.ts';

import config, { init } from '../src/config.ts';

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
        'app_public_key',
        'mongo_url',
      ]),
    );

    try {
      await init({ baseUrl: 'http://localhost:8000/' });

      assertEquals(config, {
        deploy: false,
        dev: false,
        appId: 'app_id',
        publicKey: 'app_public_key',
        mongoUrl: 'mongo_url',
        origin: 'http://localhost:8000',
        sentry: 'sentry_dsn',
      });
    } finally {
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
        'dev_id',
        'dev_public_key',
        'dev_mongo_url',
      ]),
    );

    try {
      await init({ baseUrl: 'http://localhost:8000/dev' });

      assertEquals(config, {
        deploy: false,
        dev: true,
        appId: 'dev_id',
        publicKey: 'dev_public_key',
        mongoUrl: 'dev_mongo_url',
        origin: 'http://localhost:8000',
        sentry: 'sentry_dsn',
      });
    } finally {
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
        'dev_id',
        'dev_public_key',
        'dev_mongo_url',
      ]),
    );

    try {
      await init({ baseUrl: 'http://localhost:8000/dev' });

      assertEquals(config, {
        deploy: true,
        dev: true,
        appId: 'dev_id',
        publicKey: 'dev_public_key',
        mongoUrl: 'dev_mongo_url',
        origin: 'http://localhost:8000',
        sentry: 'sentry_dsn',
      });
    } finally {
      permissionsStub.restore();
      readFileStub.restore();
      envStub.restore();
    }
  });
});
