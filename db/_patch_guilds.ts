import { Mongo } from '~/db/mod.ts';

if (import.meta.main) {
  // deno-lint-ignore no-non-null-assertion
  const db = new Mongo(Deno.env.get('MONGO_URI')!);

  const update = await db.guilds().updateMany({}, {
    $set: { options: { dupes: false } },
  });

  console.log(update.modifiedCount);

  await db.close();
}
