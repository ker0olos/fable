import { load as Dotenv } from 'https://deno.land/std@0.175.0/dotenv/mod.ts';

// export const colors = {
//   background: '#2b2d42',
//   purple: '#6b3ebd',
//   gold: '#feb500',
//   yellow: '#fed33c',
// };

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
  sentry?: string;
  origin?: string;
} = {
  deploy: false,
  appId: undefined,
  publicKey: undefined,
  faunaSecret: undefined,
  sentry: undefined,
  origin: undefined,
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

    config.origin = undefined;
  }
}

export function clearConfig(): void {
  Object.keys(config).forEach((key) =>
    delete config[key as keyof typeof config]
  );
}

export default config;
