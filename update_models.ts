import { load as Dotenv } from 'https://deno.land/std@0.175.0/dotenv/mod.ts';

import { green } from 'https://deno.land/std@0.175.0/fmt/colors.ts';

try {
  await Dotenv({ export: true, allowEmptyValues: true });
} catch {
  //
}

import { Client } from 'https://deno.land/x/fauna@5.0.0-deno-alpha9/mod.js';

import getUserInventory from './models/get_user_inventory.ts';

import getUserCharacters from './models/get_user_characters.ts';

const FAUNA_SECRET = Deno.env.get('FAUNA_SECRET');

if (!FAUNA_SECRET) {
  throw new Error('FAUNA_SECRET is not defined');
}

const client = new Client({
  secret: FAUNA_SECRET,
});

async function update(queries: Promise<unknown>[]): Promise<void> {
  await Promise.all(queries);
  console.log(green('\n\nOK'));
}

await update([
  ...getUserInventory(client),
  ...getUserCharacters(client),
]);
