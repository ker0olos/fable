const config: {
  deploy: boolean;
  appId?: string;
  publicKey?: string;
  mongoUri?: string;
  sentry?: string;
  origin?: string;
  notice?: string;
  global?: boolean;
  gacha?: boolean;
  trading?: boolean;
  stealing?: boolean;
  synthesis?: boolean;
  shop?: boolean;
  communityPacks?: boolean;
  communityPacksMaintainerAPI?: boolean;
  communityPacksBrowseAPI?: boolean;
  combat?: boolean;
  chat?: boolean;
  //
  disableImagesProxy?: boolean;
} = {
  deploy: false,
  appId: undefined,
  publicKey: undefined,
  mongoUri: undefined,
  sentry: undefined,
  origin: undefined,
  notice: undefined,
  global: undefined,
  gacha: undefined,
  trading: undefined,
  stealing: undefined,
  synthesis: undefined,
  shop: undefined,
  communityPacks: undefined,
  communityPacksMaintainerAPI: undefined,
  communityPacksBrowseAPI: undefined,
  combat: undefined,
  chat: undefined,
  //
  disableImagesProxy: undefined,
};

export async function initConfig(): Promise<void> {
  const query = await Deno.permissions.query({ name: 'env' });

  if (query?.state === 'granted') {
    config.deploy = !!Deno.env.get('DENO_DEPLOYMENT_ID');

    config.sentry = Deno.env.get('SENTRY_DSN');

    config.appId = Deno.env.get('APP_ID');

    config.publicKey = Deno.env.get('PUBLIC_KEY');

    config.mongoUri = Deno.env.get('MONGO_URI');

    config.notice = Deno.env.get('NOTICE');

    // feature flags
    config.global = !Deno.env.has('GLOBAL') ||
      Deno.env.get('GLOBAL') === '1';

    config.gacha = !Deno.env.has('GACHA') ||
      Deno.env.get('GACHA') === '1';

    config.trading = !Deno.env.has('TRADING') ||
      Deno.env.get('TRADING') === '1';

    config.stealing = !Deno.env.has('STEALING') ||
      Deno.env.get('STEALING') === '1';

    config.synthesis = !Deno.env.has('SYNTHESIS') ||
      Deno.env.get('SYNTHESIS') === '1';

    config.shop = !Deno.env.has('SHOP') ||
      Deno.env.get('SHOP') === '1';

    config.communityPacks = !Deno.env.has('COMMUNITY_PACKS') ||
      Deno.env.get('COMMUNITY_PACKS') === '1';

    config.communityPacksMaintainerAPI =
      !Deno.env.has('COMMUNITY_PACKS_MAINTAINER_API') ||
      Deno.env.get('COMMUNITY_PACKS_MAINTAINER_API') === '1';

    config.communityPacksBrowseAPI =
      !Deno.env.has('COMMUNITY_PACKS_BROWSE_API') ||
      Deno.env.get('COMMUNITY_PACKS_BROWSE_API') === '1';

    config.combat = !Deno.env.has('COMBAT') ||
      Deno.env.get('COMBAT') === '1';

    config.chat = !Deno.env.has('CHAT') ||
      Deno.env.get('CHAT') === '1';
    //
    config.disableImagesProxy = Deno.env.get('DISABLE_IMAGES_PROXY') === '1';

    config.origin = undefined;
  }
}

export function clearConfig(): void {
  Object.keys(config).forEach((key) =>
    delete config[key as keyof typeof config]
  );
}

export default config;
