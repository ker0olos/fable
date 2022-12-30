export const appPublicKey = () =>
  Deno.env.get('CANARY') === '1'
    ? Deno.env.get('CANARY_PUBLIC_KEY')!
    : Deno.env.get('APP_PUBLIC_KEY')!;

export const appId = () =>
  Deno.env.get('CANARY') === '1'
    ? Deno.env.get('CANARY_ID')!
    : Deno.env.get('APP_ID')!;

export const dsn = Deno.env.get('SENTRY_DSN')!;
// export mongoUrl = Deno.env.get('MONGO_URL')!;
