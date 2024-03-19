// deno-lint-ignore-file explicit-function-return-type

import { green, yellow } from '$std/fmt/colors.ts';

import { MongoMemoryReplSet } from 'mongodb-memory-server';

import { start } from '~/src/interactions.ts';

import { ensureIndexes } from '~/db/ensureIndexes.ts';

let mongod: MongoMemoryReplSet;

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

if (import.meta.main) {
  const isRemote = Deno.args.includes('--remote');

  if (!isRemote) {
    await startMongod();
    await sleep(500);
    await ensureIndexes();
  } else {
    console.log(yellow('Using the production database, be careful!'));
  }

  await start();

  await tunnel();
}

async function startMongod() {
  mongod = await MongoMemoryReplSet.create({
    replSet: { storageEngine: 'wiredTiger' },
  });

  const uri = mongod.getUri();

  console.log(green(uri));

  Deno.env.set('MONGO_URI', uri);
}

async function tunnel() {
  try {
    const maxAttempts = 5;

    let ngrok;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        ngrok = await fetch('http://localhost:4040/api/tunnels');

        const { tunnels } = await ngrok.json();

        console.log(green(tunnels[0].public_url));

        break;
      } catch {
        attempts++;
        await sleep(1000);
      }
    }

    if (attempts >= maxAttempts) {
      console.error('Failed to fetch ngrok tunnels after multiple attempts.');
    }
  } catch (err) {
    console.error(err);
  }
}
