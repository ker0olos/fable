// deno-lint-ignore-file no-explicit-any

import {
  assert,
  assertEquals,
  assertThrows,
} from 'https://deno.land/std@0.168.0/testing/asserts.ts';

import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  stub,
} from 'https://deno.land/std@0.168.0/testing/mock.ts';

import * as config from '../src/config.ts';

Deno.test('init', async (test) => {
  await test.step('stable', async () => {
    const permissionsStub = stub(
      Deno.permissions,
      'query',
      () => Promise.resolve({ state: 'granted' } as any),
    );

    const envStub = stub(
      Deno.env,
      'get',
      returnsNext([
        'sentry_dsn',
        'app_id',
        'app_public_key',
        'mongo_url',
      ]),
    );

    try {
      await config.init({ dev: false });

      // test config parameters

      assertEquals([
        config.DEV,
        config.appId,
        config.publicKey,
        config.mongoUrl,
        config.dsn,
      ], [
        false,
        'app_id',
        'app_public_key',
        'mongo_url',
        'sentry_dsn',
      ]);

      // test function calls

      assertSpyCalls(permissionsStub, 1);
      assertSpyCalls(envStub, 4);

      assertSpyCall(permissionsStub, 0, {
        args: [{ name: 'env' } as any],
        returned: Promise.resolve({ state: 'granted' } as any),
      });

      assertSpyCall(envStub, 0, {
        args: ['SENTRY_DSN'],
        returned: 'sentry_dsn',
      });

      assertSpyCall(envStub, 1, {
        args: ['APP_ID'],
        returned: 'app_id',
      });

      assertSpyCall(envStub, 2, {
        args: ['APP_PUBLIC_KEY'],
        returned: 'app_public_key',
      });

      assertSpyCall(envStub, 3, {
        args: ['MONGO_URL'],
        returned: 'mongo_url',
      });
    } finally {
      permissionsStub.restore();
      envStub.restore();
    }
  });

  await test.step('dev', async () => {
    const permissionsStub = stub(
      Deno.permissions,
      'query',
      () => Promise.resolve({ state: 'granted' } as any),
    );

    const envStub = stub(
      Deno.env,
      'get',
      returnsNext([
        'sentry_dsn',
        'dev_id',
        'dev_public_key',
        'dev_mongo_url',
      ]),
    );

    try {
      await config.init({ dev: true });

      // test config parameters

      assertEquals([
        config.DEV,
        config.appId,
        config.publicKey,
        config.mongoUrl,
        config.dsn,
      ], [
        true,
        'dev_id',
        'dev_public_key',
        'dev_mongo_url',
        'sentry_dsn',
      ]);

      // test function calls

      assertSpyCalls(permissionsStub, 1);
      assertSpyCalls(envStub, 4);

      assertSpyCall(permissionsStub, 0, {
        args: [{ name: 'env' } as any],
        returned: Promise.resolve({ state: 'granted' } as any),
      });

      assertSpyCall(envStub, 0, {
        args: ['SENTRY_DSN'],
        returned: 'sentry_dsn',
      });

      assertSpyCall(envStub, 1, {
        args: ['DEV_ID'],
        returned: 'dev_id',
      });

      assertSpyCall(envStub, 2, {
        args: ['DEV_PUBLIC_KEY'],
        returned: 'dev_public_key',
      });

      assertSpyCall(envStub, 3, {
        args: ['DEV_MONGO_URL'],
        returned: 'dev_mongo_url',
      });
    } finally {
      permissionsStub.restore();
      envStub.restore();
    }
  });
});
