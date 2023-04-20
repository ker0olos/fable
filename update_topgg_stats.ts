import {
  Client,
  query,
} from 'https://deno.land/x/fauna@5.0.0-deno-alpha9/mod.js';

import {
  type query as _query,
} from 'https://deno.land/x/fauna@5.0.0-deno-alpha9/mod.d.ts';

const fql = query as typeof _query;

if (import.meta.main) {
  const APP_ID = Deno.env.get('APP_ID');
  const TOPGG_TOKEN = Deno.env.get('TOPGG_TOKEN');
  const FAUNA_SECRET = Deno.env.get('FAUNA_SECRET');

  if (!APP_ID) {
    throw new Error('APP_ID is not defined');
  }

  if (!TOPGG_TOKEN) {
    throw new Error('TOPGG_TOKEN is not defined');
  }

  if (!FAUNA_SECRET) {
    throw new Error('FAUNA_SECRET is not defined');
  }

  const client = new Client({ secret: FAUNA_SECRET });

  const serverCount = await client.query(
    fql.Count(fql.Documents(fql.Collection('guild'))),
  );

  console.log(`APP ID: ${APP_ID}`);
  console.log(`Server Count: ${serverCount}`);

  const response = await fetch(
    `https://top.gg/api/bots/${APP_ID}/stats`,
    {
      method: 'POST',
      headers: {
        'Authorization': TOPGG_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'server_count': Number(serverCount),
      }),
    },
  );

  console.log(
    response.status,
    response.statusText,
    await response.text(),
  );

  if (!response.ok) {
    Deno.exit(1);
  }
}
