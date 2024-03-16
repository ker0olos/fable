import $ from 'dax';

import { green } from '$std/fmt/colors.ts';

import { MongoMemoryReplSet } from 'mongodb-memory-server';

if (import.meta.main) {
  console.log('starting mongodb server...');

  const mongod = await MongoMemoryReplSet.create();

  const uri = mongod.getUri('test');

  console.log(green(uri));

  let envContent = Deno.statSync('.env').isFile
    ? await Deno.readTextFile('.env')
    : '';

  const lines = envContent.split('\n');

  // Find the MONGO_URI line and update it, or add it if it doesn't exist
  const mongoUriLineIndex = lines.findIndex((line) =>
    line.startsWith('MONGO_URI=')
  );

  if (mongoUriLineIndex > -1) {
    lines[mongoUriLineIndex] = `MONGO_URI=${uri}`;
  } else {
    lines.push(`MONGO_URI=${uri}`);
  }

  // Join the lines back into a single string and write it to the .env file
  envContent = lines.join('\n');

  await Deno.writeTextFile('.env', envContent);

  console.log('updated .env file with new mongodb uri');

  await $`deno task index`;

  Deno.addSignalListener('SIGINT', () => {
    console.log('stopping server');
    mongod.stop().catch(console.error);
    Deno.exit();
  });
}
