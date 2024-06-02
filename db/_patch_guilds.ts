import { Mongo } from '~/db/mod.ts';

if (import.meta.main) {
  // deno-lint-ignore no-non-null-assertion
  const db = new Mongo(Deno.env.get('MONGO_URI')!);

  const update = await db.guilds().updateMany({
    builtinsDisabled: false,
  }, {
    $addToSet: { packIds: 'anilist' },
  });

  console.log(update.modifiedCount);

  const update2 = await db.guilds().updateMany({
    excluded: true,
    builtinsDisabled: true,
  }, {
    $set: { excluded: false },
    $unset: { builtinsDisabled: '' },
  });

  console.log(update2.modifiedCount);

  await db.close();
}
