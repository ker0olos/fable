import { Mongo } from '~/db/index.ts';

const db = new Mongo(process.env.MONGO_URI);

const userId = '910124289372610560';
const guildId = '1288361915978092545';

const result1 = await db.characters().deleteMany({
  userId,
  guildId,
});

console.log(result1.deletedCount);

const result2 = await db.inventories().deleteMany({
  userId,
  guildId,
});

console.log(result2.deletedCount);

const result3 = await db.users().deleteMany({
  discordId: userId,
});

console.log(result3.deletedCount);

await db.close();
