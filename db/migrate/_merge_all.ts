// import 'dotenv/config';

// import { Mongo, ObjectId } from '../index.ts';

// import users from './users.json' with { type: 'json' };
// import guilds from './guilds.json' with { type: 'json' };
// import inventories from './inventories.json' with { type: 'json' };
// import characters from './characters.json' with { type: 'json' };
// import packs from './packs.json' with { type: 'json' };
// import anime_characters from './anime_characters2.json' with { type: 'json' };
// import anime_media from './anime_media2.json' with { type: 'json' };

// import Rating from '~/src/rating.ts';

// const db = new Mongo(process.env.MONGO_URI);

// await db.connect();

// console.log('Inserting data into MongoDB...');

// await db.users().insertMany(
//   users.map((u) => ({
//     ...u,
//     _id: ObjectId.createFromHexString(u._id),
//     dailyTimestamp: u.dailyTimestamp ? new Date(u.dailyTimestamp) : new Date(),
//   }))
// );

// await db.guilds().insertMany(
//   guilds.map((g) => ({
//     ...g,
//     _id: ObjectId.createFromHexString(g._id),
//   }))
// );

// await db.inventories().insertMany(
//   inventories.map((i) => ({
//     ...i,
//     _id: ObjectId.createFromHexString(i._id),
//     rechargeTimestamp: i.rechargeTimestamp
//       ? new Date(i.rechargeTimestamp)
//       : undefined,
//     lastPull: i.lastPull ? new Date(i.lastPull) : undefined,
//     stealTimestamp: i.stealTimestamp ? new Date(i.stealTimestamp) : undefined,
//     party: {
//       member1Id:
//         typeof i.party?.member1Id === 'string'
//           ? ObjectId.createFromHexString(i.party.member1Id)
//           : null,
//       member2Id:
//         typeof i.party?.member2Id === 'string'
//           ? ObjectId.createFromHexString(i.party.member2Id)
//           : null,
//       member3Id:
//         typeof i.party?.member3Id === 'string'
//           ? ObjectId.createFromHexString(i.party.member3Id)
//           : null,
//       member4Id:
//         typeof i.party?.member4Id === 'string'
//           ? ObjectId.createFromHexString(i.party.member4Id)
//           : null,
//       member5Id:
//         typeof i.party?.member5Id === 'string'
//           ? ObjectId.createFromHexString(i.party.member5Id)
//           : null,
//     },
//   }))
// );

// await db.characters().insertMany(
//   characters.map((c) => {
//     delete c.combat;
//     return {
//       ...c,
//       _id: ObjectId.createFromHexString(c._id),
//       inventoryId: ObjectId.createFromHexString(c.inventoryId),
//       createdAt: new Date(c.createdAt),
//     };
//   })
// );

// await db.packs().insertMany(
//   packs.map((p) => {
//     delete p.manifest.characters;
//     delete p.manifest.media;
//     return {
//       ...p,
//       _id: ObjectId.createFromHexString(p._id),
//       createdAt: new Date(p.createdAt),
//       updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
//     };
//   })
// );

// for (const p of packs) {
//   p.manifest.characters?.new?.forEach((c) => {
//     const _media = c.media?.[0];
//     const media = p.manifest.media?.new?.find((m) => m.id === _media?.mediaId);

//     const rating = new Rating(
//       c.popularity
//         ? { popularity: c.popularity }
//         : {
//             role: _media?.role,
//             popularity: media?.popularity || 10_000,
//           }
//     );

//     c.packId = p.manifest.id;
//     c.rating = rating.stars;

//     delete c.popularity;
//   });

//   p.manifest.media?.new?.forEach((m) => {
//     m.packId = p.manifest.id;
//   });

//   if (p.manifest.characters?.new?.length) {
//     const uniqueCharacters = new Map();
//     p.manifest.characters.new.forEach((c) => {
//       uniqueCharacters.set(c.id, c);
//     });
//     p.manifest.characters.new = Array.from(uniqueCharacters.values());
//   }

//   if (p.manifest.media?.new?.length) {
//     const uniqueMedia = new Map();
//     p.manifest.media.new.forEach((m) => {
//       uniqueMedia.set(m.id, m);
//     });
//     p.manifest.media.new = Array.from(uniqueMedia.values());
//   }

//   console.log(p.manifest.characters?.new);
//   console.log(p.manifest.media?.new);

//   if (p.manifest.characters?.new?.length)
//     await db.packCharacters().insertMany(p.manifest.characters.new);

//   if (p.manifest.media?.new?.length)
//     await db.packMedia().insertMany(p.manifest.media.new);
// }

// const t = await db.packCharacters().insertMany(anime_characters);
// const t2 = await db.packMedia().insertMany(anime_media);

// await db.close();
