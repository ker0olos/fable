// import { Mongo } from '~/db/mod.ts';

// import { newGuild } from '~/db/getInventory.ts';

// export async function disableBuiltins(
//   guildId: string,
// ): Promise<void> {
//   const db = new Mongo();

//   try {
//     await db.connect();

//     await db.guilds().updateOne(
//       { discordId: guildId },
//       {
//         $setOnInsert: newGuild(guildId, ['excluded', 'builtinsDisabled']),
//         $set: { excluded: true, builtinsDisabled: true },
//       },
//       { upsert: true },
//     );
//   } finally {
//     await db.close();
//   }
// }
