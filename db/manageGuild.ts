import database from '~/db/mod.ts';

import { newGuild } from '~/db/getInventory.ts';

export async function disableBuiltins(
  guildId: string,
): Promise<void> {
  await database.guilds.updateOne(
    { guildId },
    {
      $setOnInsert: newGuild(guildId),
      $set: { excluded: true, builtinsDisabled: true },
    },
    { upsert: true },
  );
}
