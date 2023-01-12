// const colors = {
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
  DEV: boolean;
  appId?: string;
  publicKey?: string;
  mongoUrl?: string;
  sentry?: string;
} = {
  DEV: false,
  appId: undefined,
  publicKey: undefined,
  mongoUrl: undefined,
  sentry: undefined,
};

export async function init({ dev }: { dev: boolean }) {
  const query = await Deno.permissions.query({ name: 'env' });

  if (query?.state === 'granted') {
    config.sentry = Deno.env.get('SENTRY_DSN')!;

    config.appId = dev ? Deno.env.get('DEV_ID')! : Deno.env.get('APP_ID')!;

    config.publicKey = dev
      ? Deno.env.get('DEV_PUBLIC_KEY')!
      : Deno.env.get('APP_PUBLIC_KEY')!;

    config.mongoUrl = dev
      ? Deno.env.get('DEV_MONGO_URL')!
      : Deno.env.get('MONGO_URL')!;

    config.DEV = dev;
  }
}

export default config;
