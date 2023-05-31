import $ from 'dax';

import { green, red } from '$std/fmt/colors.ts';

const APP_ID = await $.prompt(
  'Enter your discord application id (https://discord.com/developers/applications): ',
);

const PUBLIC_KEY = await $.prompt(
  'Enter your discord public key (https://discord.com/developers/applications): ',
);

const BOT_TOKEN = await $.prompt(
  'Enter your discord bot token (https://discord.com/developers/applications): ',
  { mask: true },
);

const GUILD_ID = await $.prompt(
  'Enter a discord server id (https://github.com/ker0olos/fable/wiki/Get-Server-ID): ',
);

const FAUNA_SECRET = await $.prompt(
  'Enter a FaunaDB auth key (https://github.com/ker0olos/fable/wiki/FaunaDB): ',
  { mask: true },
);

await Deno.writeTextFile(
  '.env',
  `APP_ID=${APP_ID}
PUBLIC_KEY=${PUBLIC_KEY}
BOT_TOKEN=${BOT_TOKEN}
GUILD_ID=${GUILD_ID}
FAUNA_SECRET=${FAUNA_SECRET}
IMAGE_PROXY_URL=https://images-proxy.deno.dev
SENTRY_DSN=
INSTATUS_WEBHOOK=
TOPGG_WEBHOOK_CIPHER=
TOPGG_WEBHOOK_SECRET=
GACHA=1
TRADING=1
STEALING=1
SYNTHESIS=1
COMMUNITY_PACKS=1
NOTICE=`,
);

await $.confirm({
  default: true,
  message:
    `(https://discord.com/api/oauth2/authorize?client_id=${APP_ID}&scope=applications.commands%20bot)
Did you invite the bot to your server using the url above?`,
});

let pb = $.progress('Install Developer Tools');

try {
  await $`npm i -g fauna-shell ngrok concurrently node-jq`.quiet();
} catch {
  console.error(
    red('Error running: npm i -g fauna-shell ngrok concurrently node-jq'),
  );
  Deno.exit(1);
} finally {
  pb.finish();
}

pb = $.progress('Updating Discord Slash Commands');

try {
  await $`deno run -A update_commands.ts`.quiet();
} catch {
  console.error(red('Error running: deno run -A update_commands.ts`'));
  Deno.exit(1);
} finally {
  pb.finish();
}

pb = $.progress('Updating GraphQL Schema');

try {
  await $`deno run -A update_schema.ts`.quiet();
} catch {
  console.error(red('Error running: deno run -A update_schema.ts`'));
  Deno.exit(1);
} finally {
  pb.finish();
}

pb = $.progress('Updating Database Models');

try {
  await $`deno run -A update_models.ts`.quiet();
} catch {
  console.error(red('Error running: deno run -A update_models.ts`'));
  Deno.exit(1);
} finally {
  pb.finish();
}

console.log(
  `\nYou are required to run ${
    green('"deno task fauna"')
  } each time you make changes inside the "models" directory`,
);

console.log(
  `\nYou are required to run ${
    green('"deno task discord"')
  } each time you make changes to "update_commands.ts"`,
);
console.log(
  'which contains all the slash commands discord users will see when they type "/" in the chat box',
);

console.log(`\nRun ${green('"deno task tunnel"')} to run the bot`);
console.log(
  `It will output something like ${
    green('"https://aaa-111-222-333-444.eu.ngrok.io"')
  }`,
);
console.log(
  'paste that url into "INTERACTIONS ENDPOINT URL" inside (https://discord.com/developers/applications)',
);
console.log(
  'you will need to paste the url each time you run the bot since it will change every time',
);
