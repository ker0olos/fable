import config from '~/src/config.ts';

import * as discord from '~/src/discord.ts';

import db from '~/db/index.ts';
import i18n from '~/src/i18n.ts';

import utils from '~/src/utils.ts';

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

function view({
  token,
  userId,
  guildId,
}: {
  token: string;
  userId: string;
  guildId: string;
}): discord.Message {
  const locale =
    user.cachedUsers[userId]?.locale ?? user.cachedGuilds[guildId]?.locale;

  db.getGuild(guildId)
    .then((guild) => {
      const message = getOptionsEmbed(guild, locale);

      return message.patch(token);
    })
    .catch(async (err) => {
      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  return discord.Message.spinner(true).setFlags(discord.MessageFlags.Ephemeral);
}

function invertDupes({
  token,
  userId,
  guildId,
}: {
  token: string;
  userId: string;
  guildId: string;
}): discord.Message {
  const locale =
    user.cachedUsers[userId]?.locale ?? user.cachedGuilds[guildId]?.locale;

  db.invertDupes(guildId)
    .then((guild) => {
      const message = getOptionsEmbed(guild, locale);

      return message.patch(token);
    })
    .catch(async (err) => {
      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  return discord.Message.spinner(true);
}

const serverOptions = {
  view,
  invertDupes,
};

export default serverOptions;
