import { load as Dotenv } from 'https://deno.land/std@0.178.0/dotenv/mod.ts';

try {
  await Dotenv({ export: true, allowEmptyValues: true });
} catch {
  //
}

if (import.meta.main) {
  const main = await Deno.readTextFile('./models/schema.gql');
  const manifest = await Deno.readTextFile('./models/manifest.gql');
  const resolvers = await Deno.readTextFile('./models/resolvers.gql');

  let manifestInput = manifest
    .replaceAll(/type\s/g, 'input ');

  [...manifestInput.matchAll(/input\s(.*?)\s@/g)].forEach(([, name]) => {
    manifestInput = manifestInput.replaceAll(name, `${name}Input`);
  });

  await Deno.writeTextFile(
    './bundle.gql',
    [main, manifest, manifestInput, resolvers].join('\n'),
  );

  const FAUNA_SECRET = Deno.env.get('FAUNA_SECRET');

  if (!FAUNA_SECRET) {
    throw new Error('FAUNA_SECRET is not defined');
  }

  const p = Deno.run({
    cmd: [
      'fauna',
      'upload-graphql-schema',
      'bundle.gql',
      '--secret',
      FAUNA_SECRET,
      '--scheme',
      'https',
      '--mode',
      'replace',
      '--domain',
      'db.us.fauna.com',
      '--graphqlHost',
      'graphql.us.fauna.com',
      '--graphqlPort',
      '443',
    ],
  });

  await p.status();
}
