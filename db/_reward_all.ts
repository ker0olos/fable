import { Mongo } from '~/db/index.ts';

const db = new Mongo(process.env.MONGO_URI);

const update = await db.users().updateMany(
  {
    discordId: { $ne: '185033133521895424' },
  },
  {
    $push: { guarantees: { $each: [5, 4] } },
  }
);

console.log(update.modifiedCount);

await db.close();
