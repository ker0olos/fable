import * as discord from '~/src/discord.ts';
import * as discordV2 from '~/src/discordV2.ts';

import db, { MAX_PULLS, RECHARGE_MINS } from '~/db/index.ts';
import i18n from '~/src/i18n.ts';

import user from '~/src/user.ts';

import type { Guild } from '~/db/schema.ts';

const getOptions = (
  guild: Guild,
  locale: discord.AvailableLocales
): discordV2.Message => {
  const message = new discordV2.Message();

  const container = new discordV2.Container();

  container.addComponent(
    new discordV2.Section()
      .addText(
        new discordV2.TextDisplay(
          `**${i18n.get(
            guild.options?.dupes ? 'dupes-enabled' : 'dupes-disabled',
            locale
          )}**\n-# ${i18n.get(
            guild.options?.dupes
              ? 'server-dupes-enabled'
              : 'server-dupes-disabled',
            locale
          )}`
        )
      )
      .setAccessory(
        new discordV2.Button()
          .setLabel(
            i18n.get(guild.options?.dupes ? 'disable' : 'enable', locale)
          )
          .setId('options', 'dupes')
      )
  );

  container.addComponent(new discordV2.Separator());

  container.addComponent(
    new discordV2.Section()
      .addText(
        new discordV2.TextDisplay(
          `**${i18n.get(
            guild.options?.steal ? 'steal-enabled' : 'steal-disabled',
            locale
          )}**\n-# ${i18n.get(
            guild.options?.steal
              ? 'server-steal-enabled'
              : 'server-steal-disabled',
            locale
          )}`
        )
      )
      .setAccessory(
        new discordV2.Button()
          .setLabel(
            i18n.get(guild.options?.steal ? 'disable' : 'enable', locale)
          )
          .setId('options', 'steal')
      )
  );

  container.addComponent(new discordV2.Separator());

  container.addComponent(
    new discordV2.TextDisplay(
      `**${i18n.get('max-pulls', locale)}**\n-# ${i18n.get(
        '$set-server-max-pulls',
        locale
      )}\n**${guild.options?.maxPulls ?? MAX_PULLS}**`
    )
  );

  container.addComponent(new discordV2.Separator());

  container.addComponent(
    new discordV2.TextDisplay(
      `**${i18n.get('recharge-mins', locale)}**\n-# ${i18n.get(
        '$set-server-recharge-mins',
        locale
      )}\n**${i18n.get('recharge-time', locale, guild.options?.rechargeMins ?? RECHARGE_MINS)}**`
    )
  );

  message.addComponent(container);

  return message;
};

async function view({ userId, guildId }: { userId: string; guildId: string }) {
  const locale =
    user.cachedUsers[userId]?.locale ?? user.cachedGuilds[guildId]?.locale;

  const guild = await db.getGuild(guildId);

  const message = getOptions(guild, locale);

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

  const message = getOptions(guild, locale);

  return message;
}

async function invertSteal({
  userId,
  guildId,
}: {
  userId: string;
  guildId: string;
}) {
  const locale =
    user.cachedUsers[userId]?.locale ?? user.cachedGuilds[guildId]?.locale;

  const guild = await db.invertSteal(guildId);

  const message = getOptions(guild, locale);

  return message;
}

const serverOptions = {
  view,
  invertDupes,
  invertSteal,
};

export default serverOptions;
