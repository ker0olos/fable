import { load as Dotenv } from 'https://deno.land/std@0.178.0/dotenv/mod.ts';

import { green } from 'https://deno.land/std@0.178.0/fmt/colors.ts';

try {
  await Dotenv({ export: true, allowEmptyValues: true });
} catch {
  //
}

import { Client } from 'https://deno.land/x/fauna@5.0.0-deno-alpha9/mod.js';

import getUserInventory from './models/get_user_inventory.ts';
import getUserCollection from './models/get_user_collection.ts';

import addCharacterToInventory from './models/add_character_to_inventory.ts';
import setCharacterToParty from './models/set_character_to_party.ts';

import findCharacter from './models/find_character.ts';

const FAUNA_SECRET = Deno.env.get('FAUNA_SECRET');

if (!FAUNA_SECRET) {
  throw new Error('FAUNA_SECRET is not defined');
}

const client = new Client({
  secret: FAUNA_SECRET,
});

async function update(queries: (() => Promise<unknown>)[]): Promise<void> {
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];

    console.log(`${i + 1}/${queries.length}`);

    await query();
  }

  console.log(green('\nOK'));
}

await update([
  ...getUserInventory(client),
  ...getUserCollection(client),
  ...findCharacter(client),
  ...addCharacterToInventory(client),
  ...setCharacterToParty(client),
]);
