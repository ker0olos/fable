import { Mongo } from '~/db/index.ts';

import type { WithId } from 'mongodb';

import type * as Schema from '~/db/schema.ts';

const defaultOptions = { dupes: false, steal: true };

export async function invertDupes(
  guildId: string
): Promise<WithId<Schema.Guild>> {
  const db = new Mongo();

  try {
    await db.connect();

    const guild = await db.guilds().findOne({ discordId: guildId });

    if (!guild) {
      throw new Error();
    }

    guild.options ??= defaultOptions;

    guild.options.dupes = !guild.options.dupes;

    await db.guilds().updateOne(
      { discordId: guildId },
      {
        $set: { options: guild.options },
      }
    );

    return guild;
  } finally {
    await db.close();
  }
}

export async function invertSteal(
  guildId: string
): Promise<WithId<Schema.Guild>> {
  const db = new Mongo();

  try {
    await db.connect();

    const guild = await db.guilds().findOne({ discordId: guildId });

    if (!guild) {
      throw new Error();
    }

    guild.options ??= defaultOptions;

    guild.options.steal = !guild.options.steal;

    await db.guilds().updateOne(
      { discordId: guildId },
      {
        $set: { options: guild.options },
      }
    );

    return guild;
  } finally {
    await db.close();
  }
}
