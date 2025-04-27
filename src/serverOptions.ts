import * as discord from '~/src/discord.ts';

import db from '~/db/index.ts';
import i18n from '~/src/i18n.ts';

import user from '~/src/user.ts';

import type { Guild } from '~/db/schema.ts';

const getOptionsEmbed = (
  guild: Guild,
  locale: discord.AvailableLocales
): discord.Message => {
  const message = new discord.Message();
  const embed = new discord.Embed();

  embed.addField({
    name: i18n.get(
      guild.options?.dupes ? 'dupes-allowed' : 'dupes-disallowed',
      locale
    ),
    value: i18n.get(
      guild.options?.dupes ? 'server-dupes-allowed' : 'server-dupes-disallowed',
      locale
    ),
  });

  message.addComponents([
    new discord.Component()
      .setLabel(
        i18n.get(
          guild.options?.dupes ? 'disallow-dupes' : 'allow-dupes',
          locale
        )
      )
      .setId('options', 'dupes'),
  ]);

  message.addEmbed(embed);

  return message;
};

async function view({ userId, guildId }: { userId: string; guildId: string }) {
  const locale =
    user.cachedUsers[userId]?.locale ?? user.cachedGuilds[guildId]?.locale;

  const guild = await db.getGuild(guildId);

  const message = getOptionsEmbed(guild, locale);

  return message;
}

async function invertDupes({
  userId,
  guildId,
}: {
  userId: string;
  guildId: string;
}) {
  const locale =
    user.cachedUsers[userId]?.locale ?? user.cachedGuilds[guildId]?.locale;

  const guild = await db.invertDupes(guildId);

  const message = getOptionsEmbed(guild, locale);

  return message;
}

const serverOptions = {
  view,
  invertDupes,
};

export default serverOptions;
