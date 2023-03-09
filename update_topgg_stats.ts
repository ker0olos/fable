import {
  Client,
  query,
} from 'https://deno.land/x/fauna@5.0.0-deno-alpha9/mod.js';

import {
  type query as _query,
} from 'https://deno.land/x/fauna@5.0.0-deno-alpha9/mod.d.ts';

const fql = query as typeof _query;

if (import.meta.main) {
  const TOPGG_TOKEN = Deno.env.get('TOPGG_TOKEN');
  const FAUNA_SECRET = Deno.env.get('FAUNA_SECRET');

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

  const response = await fetch(
    'https://top.gg/api/bots/1041970851559522304/stats',
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

  if (response.ok) {
    console.log(`Updated server count to: ${serverCount}`);
  }
}
