import { load as Dotenv } from 'https://deno.land/std@0.172.0/dotenv/mod.ts';

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

const config: {
  dev: boolean;
  deploy: boolean;
  appId?: string;
  publicKey?: string;
  mongoUrl?: string;
  sentry?: string;
  origin?: string;
} = {
  dev: false,
  deploy: false,
  appId: undefined,
  publicKey: undefined,
  mongoUrl: undefined,
  sentry: undefined,
  origin: undefined,
};

export async function init(
  { url }: { url: URL },
): Promise<void> {
  const query = await Deno.permissions.query({ name: 'env' });

  if (query?.state === 'granted') {
    config.dev = url.pathname === '/dev';

    config.deploy = !!Deno.env.get('DENO_DEPLOYMENT_ID');

    // load .env file
    if (!config.deploy) {
      try {
        await Dotenv({ export: true, allowEmptyValues: true });
      } catch {
        //
      }
    }

    config.sentry = Deno.env.get('SENTRY_DSN');

    config.appId = config.dev ? Deno.env.get('DEV_ID') : Deno.env.get('APP_ID');

    config.publicKey = config.dev
      ? Deno.env.get('DEV_PUBLIC_KEY')
      : Deno.env.get('APP_PUBLIC_KEY');

    config.mongoUrl = config.dev
      ? Deno.env.get('DEV_MONGO_URL')
      : Deno.env.get('MONGO_URL');

    config.origin = url.origin;

    if (!config.origin.startsWith('http://localhost')) {
      config.origin = config.origin.replace('http://', 'https://');
    }
  }
}

export default config;
