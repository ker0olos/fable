export let appId: string;
export let publicKey: string;
export let mongoUrl: string;
export let dsn: string;

// export const colors = {
//   background: '#2b2d42',
//   purple: '#6b3ebd',
//   gold: '#feb500',
//   yellow: '#fed33c',
// };

export const emotes = {
  star: '<:fable_star:1058059570305585303>',
  noStar: '<:fable_no_star:1058182412963688548>',
};

export let DEV = false;

export async function init({ dev }: { dev: boolean }) {
  const query = await Deno.permissions.query({ name: 'env' });

  if (query) {
    dsn = Deno.env.get('SENTRY_DSN')!;

    appId = dev ? Deno.env.get('DEV_ID')! : Deno.env.get('APP_ID')!;

    publicKey = dev
      ? Deno.env.get('DEV_PUBLIC_KEY')!
      : Deno.env.get('APP_PUBLIC_KEY')!;

    mongoUrl = dev
      ? Deno.env.get('DEV_MONGO_URL')!
      : Deno.env.get('MONGO_URL')!;

    DEV = dev;
  }
}
