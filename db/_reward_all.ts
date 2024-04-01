import { MongoClient } from 'mongodb';

import db from '~/db/mod.ts';

if (import.meta.main) {
  db.client = await new MongoClient(
    // deno-lint-ignore no-non-null-assertion
    Deno.env.get('MONGO_URI')!,
    { retryWrites: true },
  ).connect();

  const update = await db.users().updateMany({
    discordId: { $ne: '185033133521895424' },
  }, {
    $push: { guarantees: { $each: [5, 4] } },
  });

  console.log(update.modifiedCount);

  await db.client.close();
}
