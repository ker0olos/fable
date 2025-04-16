const config: {
  appId?: string;
  publicKey?: string;
  mongoUri?: string;
  packsUrl?: string;
  sentry?: string;
  origin?: string;
  notice?: string;
  global?: boolean;
  gacha?: boolean;
  trading?: boolean;
  stealing?: boolean;
  synthesis?: boolean;
  shop?: boolean;
  communityPacksMaintainerAPI?: boolean;
  communityPacksBrowseAPI?: boolean;
  disableImagesProxy?: boolean;
} = {
  appId: undefined,
  publicKey: undefined,
  mongoUri: undefined,
  packsUrl: undefined,
  sentry: undefined,
  origin: undefined,
  notice: undefined,
  global: undefined,
  gacha: undefined,
  trading: undefined,
  stealing: undefined,
  synthesis: undefined,
  shop: undefined,
  communityPacksMaintainerAPI: undefined,
  communityPacksBrowseAPI: undefined,
  //
  disableImagesProxy: undefined,
};

export async function initConfig(): Promise<void> {
  config.sentry = process.env.SENTRY_DSN;

  config.appId = process.env.APP_ID;

  config.publicKey = process.env.PUBLIC_KEY;

  config.mongoUri = process.env.MONGO_URI;

  config.packsUrl = process.env.PACKS_URL;

  config.notice = process.env.NOTICE;

  // feature flags
  config.global = !('GLOBAL' in process.env) || process.env.GLOBAL === '1';

  config.gacha = !('GACHA' in process.env) || process.env.GACHA === '1';

  config.trading = !('TRADING' in process.env) || process.env.TRADING === '1';

  config.stealing =
    !('STEALING' in process.env) || process.env.STEALING === '1';

  config.synthesis =
    !('SYNTHESIS' in process.env) || process.env.SYNTHESIS === '1';

  config.shop = !('SHOP' in process.env) || process.env.SHOP === '1';

  config.communityPacksMaintainerAPI =
    !('COMMUNITY_PACKS_MAINTAINER_API' in process.env) ||
    process.env.COMMUNITY_PACKS_MAINTAINER_API === '1';

  config.communityPacksBrowseAPI =
    !('COMMUNITY_PACKS_BROWSE_API' in process.env) ||
    process.env.COMMUNITY_PACKS_BROWSE_API === '1';

  config.disableImagesProxy = process.env.DISABLE_IMAGES_PROXY === '1';

  config.origin = undefined;
}

export function clearConfig(): void {
  Object.keys(config).forEach(
    (key) => delete config[key as keyof typeof config]
  );
}

export default config;
