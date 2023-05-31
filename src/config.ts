import { load as Dotenv } from '$std/dotenv/mod.ts';

export const faunaUrl = 'https://graphql.us.fauna.com/graphql';

const config: {
  deploy: boolean;
  appId?: string;
  publicKey?: string;
  faunaSecret?: string;
  imageProxyUrl?: string;
  topggCipher?: number;
  topggSecret?: string;
  sentry?: string;
  instatus?: string;
  origin?: string;
  notice?: string;
  gacha?: boolean;
  trading?: boolean;
  stealing?: boolean;
  synthesis?: boolean;
  communityPacks?: boolean;
} = {
  deploy: false,
  appId: undefined,
  publicKey: undefined,
  faunaSecret: undefined,
  imageProxyUrl: undefined,
  topggCipher: undefined,
  topggSecret: undefined,
  sentry: undefined,
  instatus: undefined,
  origin: undefined,
  notice: undefined,
  gacha: undefined,
  trading: undefined,
  stealing: undefined,
  synthesis: undefined,
  communityPacks: undefined,
};

export async function initConfig(): Promise<void> {
  const query = await Deno.permissions.query({ name: 'env' });

  if (query?.state === 'granted') {
    config.deploy = !!Deno.env.get('DENO_DEPLOYMENT_ID');

    // load .env file
    if (!config.deploy) {
      await Dotenv({ export: true, allowEmptyValues: true });
    }

    config.sentry = Deno.env.get('SENTRY_DSN');
    config.instatus = Deno.env.get('INSTATUS_WEBHOOK');

    config.appId = Deno.env.get('APP_ID');

    config.publicKey = Deno.env.get('PUBLIC_KEY');

    config.faunaSecret = Deno.env.get('FAUNA_SECRET');
    config.imageProxyUrl = Deno.env.get('IMAGE_PROXY_URL');

    config.topggCipher = Number(Deno.env.get('TOPGG_WEBHOOK_CIPHER'));
    config.topggSecret = Deno.env.get('TOPGG_WEBHOOK_SECRET');

    config.notice = Deno.env.get('NOTICE');

    // feature flags
    config.gacha = !Deno.env.has('GACHA') ||
      Deno.env.get('GACHA') === '1';

    config.trading = !Deno.env.has('TRADING') ||
      Deno.env.get('TRADING') === '1';

    config.stealing = !Deno.env.has('STEALING') ||
      Deno.env.get('STEALING') === '1';

    config.synthesis = !Deno.env.has('SYNTHESIS') ||
      Deno.env.get('SYNTHESIS') === '1';

    config.communityPacks = !Deno.env.has('COMMUNITY_PACKS') ||
      Deno.env.get('COMMUNITY_PACKS') === '1';

    config.origin = undefined;
  }
}

export function clearConfig(): void {
  Object.keys(config).forEach((key) =>
    delete config[key as keyof typeof config]
  );
}

export default config;
