import { Mongo } from '~/db/mod.ts';

import type { WithId } from 'mongodb';

import type * as Schema from '~/db/schema.ts';
import config from '~/src/config.ts';

export async function invertDupes(
  guildId: string,
): Promise<WithId<Schema.Guild>> {
  const db = new Mongo();

  try {
    await db.connect();

    const guild = await db.guilds().findOne(
      { discordId: guildId },
    );

    if (!guild) {
      throw new Error();
    }

    guild.options ??= { dupes: config.defaultServerDupes ?? true };

    guild.options.dupes = !guild.options.dupes;

    await db.guilds().updateOne(
      { discordId: guildId },
      {
        $set: { options: guild.options },
      },
    );

    return guild;
  } finally {
    await db.close();
  }
}
