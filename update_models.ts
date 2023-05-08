import 'https://esm.sh/@total-typescript/ts-reset@0.4.2/filter-boolean';

import $ from 'https://deno.land/x/dax@0.31.1/mod.ts';

import { green } from 'https://deno.land/std@0.186.0/fmt/colors.ts';

import { load as Dotenv } from 'https://deno.land/std@0.186.0/dotenv/mod.ts';

try {
  await Dotenv({ export: true, allowEmptyValues: true });
} catch {
  //
}

import { Client } from 'https://deno.land/x/fauna@5.0.0-deno-alpha9/mod.js';

import getUserInventory from './models/get_user_inventory.ts';

import addVoteToUser from './models/add_vote_to_user.ts';

import addPackToInstance from './models/add_pack_to_instance.ts';

import findMedia from './models/find_media.ts';

import addCharacterToInventory from './models/add_character_to_inventory.ts';
import setCharacterToParty from './models/set_character_to_party.ts';

import tradeCharacters from './models/trade_characters.ts';
import replaceCharacters from './models/replace_characters.ts';

import customizeCharacter from './models/customize_character.ts';
import stealCharacter from './models/steal_character.ts';
import likeCharacter from './models/like_character.ts';

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
    addVoteToUser(client),
    addPackToInstance(client),
    findMedia(client),
    addCharacterToInventory(client),
    setCharacterToParty(client),
    tradeCharacters(client),
    replaceCharacters(client),
    customizeCharacter(client),
    stealCharacter(client),
    likeCharacter(client),
  ];

  const _indexers = all
    .map((obj) => obj.indexers)
    .filter(Boolean)
    .reduce((a, b) => a.concat(b));

  let pb = $.progress('Updating Indexes', {
    length: _indexers.length,
  });

  for (let i = 0; i < _indexers.length; i++) {
    const index = _indexers[i];
    await index(), pb.increment();
  }

  pb.finish();

  const _resolvers = all
    .map((obj) => obj.resolvers)
    .filter(Boolean)
    .reduce((a, b) => a.concat(b));

  pb = $.progress('Updating User-defined Functions', {
    length: _resolvers.length,
  });

  for (let i = 0; i < _resolvers.length; i++) {
    const resolver = _resolvers[i];
    await resolver(), pb.increment();
  }

  pb.finish();

  console.log(green('OK'));
}
