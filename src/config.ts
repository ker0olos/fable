export const faunaUrl = 'https://graphql.us.fauna.com/graphql';

const config: {
  appId?: string;
  publicKey?: string;
  faunaSecret?: string;
  topggCipher?: number;
  topggSecret?: string;
  sentry?: string;
  instatus?: string;
  origin?: string;
  notice?: string;
  gacha?: boolean;
  trading?: boolean;
  stealing?: boolean;
  synthesis?: boolean;
  communityPacks?: boolean;
} = {
  appId: undefined,
  publicKey: undefined,
  faunaSecret: undefined,
  topggCipher: undefined,
  topggSecret: undefined,
  sentry: undefined,
  instatus: undefined,
  origin: undefined,
  notice: undefined,
  gacha: undefined,
  trading: undefined,
  stealing: undefined,
  synthesis: undefined,
  communityPacks: undefined,
};

/**
 * @source 'https://deno.land/std@0.186.0/dotenv/mod.ts'
 */
function parse(rawDotenv: string): Record<string, string> {
  const REGEX =
    /^\s*(?:export\s+)?(?<key>[a-zA-Z_]+[a-zA-Z0-9_]*?)\s*=[\ \t]*('\n?(?<notInterpolated>(.|\n)*?)\n?'|"\n?(?<interpolated>(.|\n)*?)\n?"|(?<unquoted>[^\n#]*)) *#*.*$/gm;

  const env: Record<string, string> = {};

  let match;

  while ((match = REGEX.exec(rawDotenv)) !== null) {
    const { key, unquoted } = match
      ?.groups as {
        key: string;
        unquoted: string;
      };

    env[key] = unquoted.trim();
  }

  return env;
}

export async function initConfig(env: Record<string, string>): Promise<void> {
  try {
    const fileUrl = new URL('../.env', import.meta.url);

    const response = await fetch(`${fileUrl.toString()}?import=text`);

    env = parse(await response.text());
  } catch {
    //
  }

  config.sentry = env['SENTRY_DSN'];
  config.instatus = env['INSTATUS_WEBHOOK'];

  config.appId = env['APP_ID'];

  config.publicKey = env['PUBLIC_KEY'];

  config.faunaSecret = env['FAUNA_SECRET'];

  config.topggCipher = Number(env['TOPGG_WEBHOOK_CIPHER']);
  config.topggSecret = env['TOPGG_WEBHOOK_SECRET'];

  config.notice = env['NOTICE'];

  // feature flags
  config.gacha = !('GACHA' in env) || env['GACHA'] === '1';

  config.trading = !('TRADING' in env) || env['TRADING'] === '1';

  config.stealing = !('STEALING' in env) || env['STEALING'] === '1';

  config.synthesis = !('SYNTHESIS' in env) || env['SYNTHESIS'] === '1';

  config.communityPacks = !('COMMUNITY_PACKS' in env) ||
    env['COMMUNITY_PACKS'] === '1';

  config.origin = undefined;
}

export function clearConfig(): void {
  Object.keys(config).forEach((key) =>
    delete config[key as keyof typeof config]
  );
}

export default config;
