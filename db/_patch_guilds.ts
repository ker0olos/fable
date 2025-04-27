import { Mongo } from '~/db/index.ts';

const db = new Mongo(process.env.MONGO_URI);

const update = await db.guilds().updateMany(
  {},
  {
    $set: { options: { dupes: false } },
  }
);

console.log(update.modifiedCount);

await db.close();
