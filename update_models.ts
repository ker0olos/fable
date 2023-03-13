import 'https://esm.sh/@total-typescript/ts-reset@0.3.7/filter-boolean';

import { load as Dotenv } from 'https://deno.land/std@0.179.0/dotenv/mod.ts';

try {
  await Dotenv({ export: true, allowEmptyValues: true });
} catch {
  //
}

import { Client } from 'https://deno.land/x/fauna@5.0.0-deno-alpha9/mod.js';

import getUserInventory from './models/get_user_inventory.ts';
import getUserCollection from './models/get_user_collection.ts';

import addVoteToUser from './models/add_vote_to_user.ts';

import findMedia from './models/find_media.ts';

import addPackToInstance from './models/add_pack_to_instance.ts';

import addCharacterToInventory from './models/add_character_to_inventory.ts';
import setCharacterToParty from './models/set_character_to_party.ts';

if (import.meta.main) {
  const FAUNA_SECRET = Deno.env.get('FAUNA_SECRET');

  if (!FAUNA_SECRET) {
    throw new Error('FAUNA_SECRET is not defined');
  }

  const client = new Client({
    secret: FAUNA_SECRET,
  });

  const all = [
    getUserInventory(client),
    getUserCollection(client),
    addVoteToUser(client),
    findMedia(client),
    addPackToInstance(client),
    addCharacterToInventory(client),
    setCharacterToParty(client),
  ];

  const _indexers = all
    .map((obj) => obj.indexers)
    .filter(Boolean)
    .reduce((a, b) => a.concat(b));

  console.log(`updating ${_indexers.length} indexes`);

  for (let i = 0; i < _indexers.length; i++) {
    const index = _indexers[i];
    // console.log(`${i + 1}/${_indexers.length}`);
    await index();
  }

  const _resolvers = all
    .map((obj) => obj.resolvers)
    .filter(Boolean)
    .reduce((a, b) => a.concat(b));

  console.log(`updating ${_resolvers.length} user-defined functions`);

  for (let i = 0; i < _resolvers.length; i++) {
    const resolver = _resolvers[i];
    // console.log(`${i + 1}/${_resolvers.length}`);
    await resolver();
  }
}
