import db from '~/db/mod.ts';

import { newGuild } from '~/db/getInventory.ts';

export async function disableBuiltins(
  guildId: string,
): Promise<void> {
  await db.guilds.updateOne(
    { guildId },
    {
      $setOnInsert: newGuild(guildId),
      $set: { excluded: true, builtinsDisabled: true },
    },
    { upsert: true },
  );
}
