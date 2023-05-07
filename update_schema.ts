import $ from 'https://deno.land/x/dax@0.31.0/mod.ts';

import { green } from 'https://deno.land/std@0.183.0/fmt/colors.ts';

import { load as Dotenv } from 'https://deno.land/std@0.183.0/dotenv/mod.ts';

try {
  await Dotenv({ export: true, allowEmptyValues: true });
} catch {
  //
}

if (import.meta.main) {
  const FAUNA_SECRET = Deno.env.get('FAUNA_SECRET');

  if (!FAUNA_SECRET) {
    throw new Error('FAUNA_SECRET is not defined');
  }

  let pb = $.progress(`Bundling schema files`);

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

  pb.finish();

  type Mode = 'replace' | 'override';

  const mode: Mode = 'replace';

  if ((mode as Mode) === 'override') {
    const t = await $.confirm(
      'You will be deleting ALL user data from the database; An irreversible action; Manual confirmation required.',
      { default: false },
    );

    if (!t) {
      throw new Error('Error: Override cancelled');
    }
  }

  pb = $.progress(`Uploading Schema (mode=${mode})`);

  if (!(await $.commandExists('fauna'))) {
    throw new Error('Error: `fauna-shell is not installed`');
  }

  try {
    const r = await $`fauna upload-graphql-schema bundle.gql\
      --secret ${FAUNA_SECRET}\
      --scheme https\
      --mode ${mode}\
      --domain db.us.fauna.com\
      --graphqlHost graphql.us.fauna.com\
      --graphqlPort 443`.quiet();

    if (r.stdout.includes('error')) {
      console.error(r.stdout);
      throw new Error();
    }
  } catch {
    throw new Error('Error running: `fauna upload-graphql-schema bundle.gql`');
  }

  pb.finish();

  console.log(green('OK'));
}
