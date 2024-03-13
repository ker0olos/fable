import database from '~/db/mod.ts';

export async function disableBuiltins(
  guildId: string,
): Promise<void> {
  await database.guilds.updateOne({ guildId }, {
    $set: { excluded: true, builtinsDisabled: true },
  });
}
