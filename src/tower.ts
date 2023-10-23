import _user from './user.ts';
import utils from './utils.ts';
import i18n from './i18n.ts';

import db from '../db/mod.ts';

import * as discord from './discord.ts';

import config from './config.ts';

import { NonFetalError } from './errors.ts';

export const MAX_FLOORS = 10;

function getMessage(
  cleared: number,
  userId: string,
  locale: discord.AvailableLocales,
): discord.Message {
  let t: number[];
  const message = new discord.Message();

  switch (cleared) {
    case 0:
    case 1:
      t = [1, 2, 3, 4, 5];
      break;
    case MAX_FLOORS:
    case MAX_FLOORS - 1:
    case MAX_FLOORS - 2:
      t = [
        MAX_FLOORS - 4,
        MAX_FLOORS - 3,
        MAX_FLOORS - 2,
        MAX_FLOORS - 1,
        MAX_FLOORS,
      ];
      break;
    default:
      t = [cleared - 1, cleared, cleared + 1, cleared + 2, cleared + 3];
      break;
  }

  const s = t.toReversed().map((number) => {
    if (number === cleared + 1) {
      return `${discord.emotes.currentFloor} ${
        i18n.get('floor', locale)
      } ${number} - ${i18n.get('current', locale)}`;
    } else if (number > cleared) {
      return `${discord.emotes.undiscoveredFloor} ${
        i18n.get('floor', locale)
      } ${number} - ${i18n.get('undiscovered', locale)}`;
    } else {
      return `${discord.emotes.clearedFloor} ${
        i18n.get('floor', locale)
      } ${number} - ${i18n.get('cleared', locale)}`;
    }
  });

  message.addEmbed(new discord.Embed()
    .setDescription(s.join('\n')));

  // sweep button
  message.addComponents([
    new discord.Component()
      .setId(discord.join('tsweep', userId))
      .setLabel(i18n.get('sweep', locale))
      .setDisabled(cleared <= 0),
  ]);

  // challenge button
  message.addComponents([
    new discord.Component()
      .setId(discord.join('tchallenge', userId))
      .setLabel(i18n.get('challenge', locale))
      .setDisabled(MAX_FLOORS <= cleared),
  ]);

  return message;
}

function view({ token, guildId, userId }: {
  token: string;
  guildId: string;
  userId: string;
}): discord.Message {
  const locale = _user.cachedUsers[userId]?.locale;

  if (!config.combat) {
    throw new NonFetalError(
      i18n.get('maintenance-combat', locale),
    );
  }

  Promise.resolve()
    .then(async () => {
      const guild = await db.getGuild(guildId);
      const instance = await db.getInstance(guild);

      const _user = await db.getUser(userId);

      const { inventory } = await db.getInventory(instance, _user);

      const cleared = inventory?.floorsCleared || 0;

      getMessage(cleared, userId, locale)
        .patch(token);
    })
    .catch(async (err) => {
      if (err instanceof NonFetalError) {
        return await new discord.Message()
          .addEmbed(new discord.Embed().setDescription(err.message))
          .patch(token);
      }

      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  const loading = new discord.Message()
    .addEmbed(
      new discord.Embed().setImage(
        { url: `${config.origin}/assets/spinner3.gif` },
      ),
    );

  return loading;
}

const tower = {
  view,
};

export default tower;
