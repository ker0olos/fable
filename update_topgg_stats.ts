import 'dotenv/config';

import prisma from '~/prisma/index.ts';

const APP_ID = process.env.APP_ID;
const DATABASE_URL = process.env.DATABASE_URL;
const TOPGG_TOKEN = process.env.TOPGG_TOKEN;

if (!APP_ID) {
  throw new Error('APP_ID is not defined');
}

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

if (!TOPGG_TOKEN) {
  throw new Error('TOPGG_TOKEN is not defined');
}

const serverCount = await prisma.guild.count();

console.log(`APP ID: ${APP_ID}`);
console.log(`Server Count: ${serverCount}`);

const response = await fetch(`https://top.gg/api/bots/${APP_ID}/stats`, {
  method: 'POST',
  headers: {
    Authorization: TOPGG_TOKEN,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    server_count: serverCount,
  }),
});

console.log(response.status, response.statusText, await response.text());

if (!response.ok) {
  process.exit(1);
}
