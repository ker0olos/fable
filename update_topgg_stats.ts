import 'dotenv/config';

import { Mongo } from '~/db/index.ts';

const APP_ID = process.env.APP_ID;
const MONGO_URI = process.env.MONGO_URI;
const TOPGG_TOKEN = process.env.TOPGG_TOKEN;

if (!APP_ID) {
  throw new Error('APP_ID is not defined');
}

if (!MONGO_URI) {
  throw new Error('MONGO_URI is not defined');
}

if (!TOPGG_TOKEN) {
  throw new Error('TOPGG_TOKEN is not defined');
}

const db = new Mongo(MONGO_URI);

await db.connect();

const serverCount = await db.guilds().estimatedDocumentCount();

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

await db.close();

if (!response.ok) {
  process.exit(1);
}
