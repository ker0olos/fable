import { Mongo } from '~/db/mod.ts';

if (import.meta.main) {
  // deno-lint-ignore no-non-null-assertion
  const db = new Mongo(Deno.env.get('MONGO_URI')!);

  const update = await db.users().updateMany({
    discordId: { $ne: '185033133521895424' },
  }, {
    $push: { guarantees: { $each: [5, 4] } },
  });

  console.log(update.modifiedCount);

  await db.close();
}
