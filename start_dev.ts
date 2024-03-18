// deno-lint-ignore-file explicit-function-return-type

import { green } from '$std/fmt/colors.ts';

import { MongoMemoryReplSet } from 'mongodb-memory-server';

// deno-lint-ignore no-external-import
import localtunnel from 'npm:localtunnel';

import { start } from '~/src/interactions.ts';

import { ensureIndexes } from '~/db/ensureIndexes.ts';

let mongod: MongoMemoryReplSet;

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

if (import.meta.main) {
  await startMongod();

  await sleep(500);

  await ensureIndexes();

  const server = await start();

  const tunnel = await localtunnel({ port: 8000 });

  console.log(green(tunnel.url));

  Deno.addSignalListener('SIGINT', async () => {
    console.log('stopping servers');
    await server.shutdown();
    await mongod.stop();
    await tunnel.close();
  });
}

async function startMongod() {
  mongod = await MongoMemoryReplSet.create();

  const uri = mongod.getUri('test');

  console.log(green(uri));

  Deno.env.set('MONGO_URI', uri);
}
