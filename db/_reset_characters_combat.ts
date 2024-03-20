import { MongoClient } from 'mongodb';

import db from '~/db/mod.ts';

import { ensureCombat } from '~/db/addCharacter.ts';

if (import.meta.main) {
  db.client = await new MongoClient(
    // deno-lint-ignore no-non-null-assertion
    Deno.env.get('MONGO_URI')!,
    { retryWrites: true },
  ).connect();

  const bulk: Parameters<
    ReturnType<typeof db.characters>['bulkWrite']
  >[0] = [];

  const characters = await db.characters().find({}).toArray();

  for (const character of characters) {
    // deno-lint-ignore ban-ts-comment
    //@ts-ignore
    character.combat = undefined;

    bulk.push({
      updateOne: {
        filter: { _id: character._id },
        update: { $set: { combat: ensureCombat(character).combat } },
      },
    });
  }

  const update = await db.characters().bulkWrite(bulk);

  console.log(update.modifiedCount);

  await db.client.close();
}
