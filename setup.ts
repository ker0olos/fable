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
  'Enter a discord server id (Optional but recommended): ',
);

await Deno.writeTextFile(
  '.env',
  `APP_ID=${APP_ID}
PUBLIC_KEY=${PUBLIC_KEY}
BOT_TOKEN=${BOT_TOKEN}
GUILD_ID=${GUILD_ID}`,
);

await $.confirm({
  default: true,
  message:
    `(https://discord.com/api/oauth2/authorize?client_id=${APP_ID}&scope=applications.commands%20bot)
Did you invite the bot to your server using the url above?`,
});

let pb = $.progress('Install Developer Tools (Ngrok & Concurrently)');

try {
  await $`npm i -g ngrok concurrently`.quiet();
} catch {
  console.error(
    red('Error running: npm i -g ngrok concurrently'),
  );
  Deno.exit(1);
} finally {
  pb.finish();
}

pb = $.progress('Updating Discord Slash Commands');

try {
  await $`deno task discord`.quiet();
} catch {
  console.error(red('Error running: deno task discord`'));
  Deno.exit(1);
} finally {
  pb.finish();
}

console.log(
  `\nYou are required to run ${
    green('"deno task discord"')
  } each time you make changes to "update_commands.ts"`,
);
console.log(
  'which contains all the slash commands discord users will see when they type "/" in the chat box',
);

console.log(`\nRun ${green('"deno task dev"')} to run the bot`);
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
