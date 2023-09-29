// deno-lint-ignore-file no-explicit-any

import { assertEquals } from '$std/assert/mod.ts';

import { returnsNext, stub } from '$std/testing/mock.ts';

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
        'instatus_hook',
        'app_id',
        'public_key',
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
        sentry: 'sentry_dsn',
        instatus: 'instatus_hook',
        topggSecret: 'topgg_secret',
        notice: 'notice_message',
        global: true,
        gacha: true,
        trading: true,
        stealing: true,
        synthesis: true,
        communityPacks: true,
        combat: true,
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
        'instatus_hook',
        'app_id',
        'public_key',
        'topgg_secret',
        'notice_message',
        '0',
        '0',
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
        sentry: 'sentry_dsn',
        instatus: 'instatus_hook',
        topggSecret: 'topgg_secret',
        notice: 'notice_message',
        gacha: false,
        global: false,
        trading: false,
        stealing: false,
        synthesis: false,
        communityPacks: false,
        combat: false,
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
