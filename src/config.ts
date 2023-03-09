import { load as Dotenv } from 'https://deno.land/std@0.178.0/dotenv/mod.ts';

export const emotes = {
  star: '<:star:1061016362832642098>',
  noStar: '<:no_star:1061016360190222466>',
};

export const faunaUrl = 'https://graphql.us.fauna.com/graphql';

const config: {
  deploy: boolean;
  appId?: string;
  publicKey?: string;
  faunaSecret?: string;
  topggSecret?: string;
  sentry?: string;
  origin?: string;
  communityPacks?: boolean;
} = {
  deploy: false,
  appId: undefined,
  publicKey: undefined,
  faunaSecret: undefined,
  topggSecret: undefined,
  sentry: undefined,
  origin: undefined,
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
    config.topggSecret = Deno.env.get('TOPGG_SECRET');

    // community packs feature flag
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
