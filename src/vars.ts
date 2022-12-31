export let appId: string;
export let publicKey: string;

export const dsn = Deno.env.get('SENTRY_DSN')!;
// export mongoUrl = Deno.env.get('MONGO_URL')!;

export function setCanary(canary: boolean) {
  if (canary) {
    appId = Deno.env.get('CANARY_ID')!;
    publicKey = Deno.env.get('CANARY_PUBLIC_KEY')!;
  } else {
    appId = Deno.env.get('APP_ID')!;
    publicKey = Deno.env.get('APP_PUBLIC_KEY')!;
  }
}
