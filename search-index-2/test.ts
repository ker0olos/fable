// deno-lint-ignore no-external-import
import { create, insert, search } from 'npm:@orama/orama';

import utils from '~/src/utils.ts';

import { CharactersDirectory } from '~/src/packs.ts';

// const _loadedAnilistCharactersDirectory: CharactersDirectory = await utils
//   .readJson<
//     CharactersDirectory
//   >('./packs/anilist/characters_directory.json');

// const map = new Map<string, boolean>();

const db = await create({
  schema: {
    name: 'string[]',
    mediaTitle: 'string[]',
    popularity: 'number',
  },
});

// await Promise.all(_loadedAnilistCharactersDirectory.map(async (doc) => {
//   if (!map.has(doc.id)) {
//     map.set(doc.id, true);
//     return await insert(db, doc as never);
//   }
// }));

// Deno.writeTextFile('./test.json', JSON.stringify(db));

const dbLoaded = await utils
  .readJson('./test.json');

//@ts-ignore
db.data = dbLoaded.data;
//@ts-ignore
db.caches = dbLoaded.caches;
//@ts-ignore
db.internalDocumentIDStore = dbLoaded.internalDocumentIDStore;

const searchResult = await search(db, {
  term: 'luka',
});

console.log(searchResult.hits.map((hit) => hit.document));
