import { load as Dotenv } from 'https://deno.land/std@0.179.0/dotenv/mod.ts';

export const faunaUrl = 'https://graphql.us.fauna.com/graphql';

const config: {
  deploy: boolean;
  appId?: string;
  publicKey?: string;
  faunaSecret?: string;
  topggCipher?: number;
  topggSecret?: string;
  sentry?: string;
  origin?: string;
  trading?: boolean;
  communityPacks?: boolean;
} = {
  deploy: false,
  appId: undefined,
  publicKey: undefined,
  faunaSecret: undefined,
  topggCipher: undefined,
  topggSecret: undefined,
  sentry: undefined,
  origin: undefined,
  trading: undefined,
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

    config.appId = Deno.env.get('APP_ID');

    config.publicKey = Deno.env.get('PUBLIC_KEY');

    config.faunaSecret = Deno.env.get('FAUNA_SECRET');

    config.topggCipher = Number(Deno.env.get('TOPGG_WEBHOOK_CIPHER'));
    config.topggSecret = Deno.env.get('TOPGG_WEBHOOK_SECRET');

    // community packs feature flag
    config.trading = Boolean(Deno.env.get('TRADING') === '1');
    config.communityPacks = Boolean(Deno.env.get('COMMUNITY_PACKS') === '1');

    config.origin = undefined;
  }
}

export function clearConfig(): void {
  Object.keys(config).forEach((key) =>
    delete config[key as keyof typeof config]
  );
}

export default config;
