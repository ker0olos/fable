import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import config, { clearConfig, initConfig } from '~/src/config.ts';

const originalEnv = { ...process.env };

describe('Config', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.mock('fs/promises', () => ({
      readFile: vi.fn().mockResolvedValue(''),
    }));
  });

  afterEach(() => {
    clearConfig();
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should initialize with environment variables when present', async () => {
    process.env.SENTRY_DSN = 'sentry_dsn';
    process.env.APP_ID = 'app_id';
    process.env.PUBLIC_KEY = 'public_key';
    process.env.MONGO_URI = 'mongo_uri';
    process.env.PACKS_URL = 'packs_url';
    process.env.NOTICE = 'notice_message';
    process.env.GLOBAL = '1';
    process.env.GACHA = '1';
    process.env.TRADING = '1';
    process.env.STEALING = '1';
    process.env.SYNTHESIS = '1';
    process.env.SHOP = '1';
    process.env.COMMUNITY_PACKS = '1';
    process.env.COMMUNITY_PACKS_MAINTAINER_API = '1';
    process.env.COMMUNITY_PACKS_BROWSE_API = '1';
    process.env.DISABLE_IMAGES_PROXY = '1';

    await initConfig();

    expect(config).toEqual({
      appId: 'app_id',
      publicKey: 'public_key',
      sentry: 'sentry_dsn',
      mongoUri: 'mongo_uri',
      packsUrl: 'packs_url',
      notice: 'notice_message',
      gacha: true,
      global: true,
      trading: true,
      stealing: true,
      synthesis: true,
      shop: true,
      communityPacks: true,
      communityPacksMaintainerAPI: true,
      communityPacksBrowseAPI: true,
      disableImagesProxy: true,
    });
  });

  it('should initialize with default values when environment variables not present', async () => {
    process.env.SENTRY_DSN = 'sentry_dsn';
    process.env.APP_ID = 'app_id';
    process.env.PUBLIC_KEY = 'public_key';
    process.env.MONGO_URI = 'mongo_uri';
    process.env.PACKS_URL = 'packs_url';
    process.env.NOTICE = 'notice_message';

    await initConfig();

    expect(config).toEqual({
      appId: 'app_id',
      publicKey: 'public_key',
      sentry: 'sentry_dsn',
      mongoUri: 'mongo_uri',
      packsUrl: 'packs_url',
      notice: 'notice_message',
      global: true,
      gacha: true,
      trading: true,
      stealing: true,
      synthesis: true,
      shop: true,
      communityPacks: true,
      communityPacksMaintainerAPI: true,
      communityPacksBrowseAPI: true,
      disableImagesProxy: false,
      config: undefined,
    });
  });

  it('should initialize with environment variables when present and are false', async () => {
    process.env.SENTRY_DSN = 'sentry_dsn';
    process.env.APP_ID = 'app_id';
    process.env.PUBLIC_KEY = 'public_key';
    process.env.MONGO_URI = 'mongo_uri';
    process.env.PACKS_URL = 'packs_url';
    process.env.NOTICE = 'notice_message';
    process.env.GLOBAL = '0';
    process.env.GACHA = '0';
    process.env.TRADING = '0';
    process.env.STEALING = '0';
    process.env.SYNTHESIS = '0';
    process.env.SHOP = '0';
    process.env.COMMUNITY_PACKS = '0';
    process.env.COMMUNITY_PACKS_MAINTAINER_API = '0';
    process.env.COMMUNITY_PACKS_BROWSE_API = '0';
    process.env.DISABLE_IMAGES_PROXY = '0';

    await initConfig();

    expect(config).toEqual({
      appId: 'app_id',
      publicKey: 'public_key',
      sentry: 'sentry_dsn',
      mongoUri: 'mongo_uri',
      packsUrl: 'packs_url',
      notice: 'notice_message',
      gacha: false,
      global: false,
      trading: false,
      stealing: false,
      synthesis: false,
      shop: false,
      communityPacks: false,
      communityPacksMaintainerAPI: false,
      communityPacksBrowseAPI: false,
      disableImagesProxy: false,
      config: undefined,
    });
  });
});
