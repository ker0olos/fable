import { green } from '$std/fmt/colors.ts';
import { MongoClient } from 'mongodb';

const client = new MongoClient(
  // deno-lint-ignore no-non-null-assertion
  Deno.env.get('MONGO_URL')!,
);

enum Order {
  ascending = 1,
  descending = -1,
}

try {
  const db = (await client.connect()).db();

  await db
    .collection('users')
    .createIndex({
      discordId: Order.ascending,
    }, { unique: true });

  await db
    .collection('guilds')
    .createIndex({
      discordId: Order.ascending,
    }, { unique: true });

  console.log(green('Done'));
} finally {
  await client.close();
}
