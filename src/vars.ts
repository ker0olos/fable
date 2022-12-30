let prod = true;

export function setCanary(canary: boolean) {
  prod = !canary;
}

export const appPublicKey = () =>
  prod ? Deno.env.get('APP_PUBLIC_KEY')! : Deno.env.get('CANARY_PUBLIC_KEY')!;

export const appId = () =>
  prod ? Deno.env.get('APP_ID')! : Deno.env.get('CANARY_ID')!;

export const dsn = Deno.env.get('SENTRY_DSN')!;
// export mongoUrl = Deno.env.get('MONGO_URL')!;
