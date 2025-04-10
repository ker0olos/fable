// import Rating from '~/src/rating.ts';

// import packs from '~/src/packs.ts';

// import { Mongo } from '~/db/mod.ts';

// import { writeFile } from 'fs/promises';

// import { charactersIndexPath, mediaIndexPath } from '~/search-index/mod.ts';

// import {
//   create_characters_index,
//   create_media_index,
// } from '@fable-community/search-index';

// import type { DisaggregatedMedia } from '~/src/types.ts';

// const mediaMap: Record<string, DisaggregatedMedia> = {};

// const green = (text: string) => `\x1b[32m${text}\x1b[0m`;

// async function storeMediaIndex(db: Mongo): Promise<void> {
//   console.log('fetching all media in the db...');

//   const media = await db.anime.media().find().toArray();

//   console.log('starting the creation of the media index...');

//   const json = JSON.stringify(
//     media.map((media) => {
//       const id = `${media.packId}:${media.id}`;

//       mediaMap[id] = media;

//       return {
//         id,
//         title: packs.aliasToArray(media.title),
//         popularity: media.popularity,
//       };
//     })
//   );

//   const mediaIndex = create_media_index(json);

//   await require('fs').promises.writeFile(mediaIndexPath, mediaIndex);

//   console.log(green('wrote the media index cache to disk\n'));
// }

// async function storeCharacterIndex(db: Mongo): Promise<void> {
//   console.log('fetching all characters in the db...');

//   const characters = await db.anime.characters().find().toArray();

//   console.log('starting the creation of the characters index...');

//   const json = JSON.stringify(
//     characters.map((character) => {
//       const edge = character.media?.[0];
//       const media = edge?.mediaId ? mediaMap[edge.mediaId] : undefined;
//       const popularity = character.popularity ?? media?.popularity ?? 1000;

//       return {
//         id: `${character.packId}:${character.id}`,
//         name: packs.aliasToArray(character.name),
//         mediaId: media ? `${media.packId}:${media.id}` : undefined,
//         mediaTitle: media?.title ? packs.aliasToArray(media?.title) : [],
//         popularity,
//         role: edge?.role,
//         rating: new Rating({
//           popularity,
//           role: edge?.role,
//         }).stars,
//       };
//     })
//   );

//   const charactersIndex = create_characters_index(json);

//   await writeFile(charactersIndexPath, charactersIndex);

//   console.log(green('wrote the characters index cache to disk\n'));
// }

// if (require.main === module) {
//   const client = new Mongo(process.env.MONGO_URI);

//   await storeMediaIndex(client);
//   await storeCharacterIndex(client);

//   await client.close();
// }
