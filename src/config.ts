export let appId: string;
export let publicKey: string;

export const dsn = Deno.env.get('SENTRY_DSN')!;
// export mongoUrl = Deno.env.get('MONGO_URL')!;

export function setCanary(canary: boolean) {
  appId = canary ? Deno.env.get('CANARY_ID')! : Deno.env.get('APP_ID')!;

  publicKey = canary
    ? Deno.env.get('CANARY_PUBLIC_KEY')!
    : Deno.env.get('APP_PUBLIC_KEY')!;
}
