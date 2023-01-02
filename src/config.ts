export let appId: string;
export let publicKey: string;

export const dsn = Deno.env.get('SENTRY_DSN')!;
// export mongoUrl = Deno.env.get('MONGO_URL')!;

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

export let CANARY = false;

export function setCanary(canary: boolean) {
  appId = canary ? Deno.env.get('CANARY_ID')! : Deno.env.get('APP_ID')!;

  publicKey = canary
    ? Deno.env.get('CANARY_PUBLIC_KEY')!
    : Deno.env.get('APP_PUBLIC_KEY')!;

  CANARY = canary;
}
