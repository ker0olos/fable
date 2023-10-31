import _user from './user.ts';
import packs from './packs.ts';

import utils from './utils.ts';
import i18n from './i18n.ts';

import db from '../db/mod.ts';

import * as discord from './discord.ts';

import config from './config.ts';

import { NonFetalError, NoSweepsError } from './errors.ts';

import type * as Schema from '../db/schema.ts';

export const MAX_FLOORS = 10;

const calculateMultipleOfTen = (num: number): number => {
  return Math.max(1, num % 10 === 0 ? num / 10 : Math.floor(num / 10) + 1);
};

export const getFloorExp = (floor: number): number => {
  let exp = 0;

  const base = calculateMultipleOfTen(floor);

  switch (floor % 10) {
    case 1:
    case 2:
    case 3:
    case 4:
      exp = 1;
      break;
    case 5:
      exp = 2;
      break;
    case 6:
    case 7:
    case 8:
    case 9:
      exp = 1.5;
      break;
    case 0:
      exp = 3;
      break;
    default:
      throw new Error('');
  }

  return exp * base;
};

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

      await getMessage(cleared, userId, locale)
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

function sweep({ token, guildId, userId }: {
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

      const user = await db.getUser(userId);

      const { inventory, inventoryCheck } = await db.rechargeConsumables(
        instance,
        user,
        false,
      );

      if (!inventory.floorsCleared) {
        throw new NonFetalError(
          i18n.get('no-cleared-floors', locale),
        );
      }

      const party = await db.getUserParty(inventory);

      const party1 = [
        party?.member1,
        party?.member2,
        party?.member3,
        party?.member4,
        party?.member5,
      ].filter(Boolean) as Schema.Character[];

      const characters = await packs.characters({
        guildId,
        ids: party1.map(({ id }) => id),
      });

      const op = db.kv.atomic();

      try {
        // consume a sweep from inventory
        db.consumeSweep({ op, inventory, inventoryCheck });
      } catch (err) {
        if (err instanceof NoSweepsError) {
          return await new discord.Message()
            .addEmbed(
              new discord.Embed()
                .setDescription(i18n.get('combat-no-more-sweeps', locale)),
            )
            .addEmbed(
              new discord.Embed()
                .setDescription(
                  i18n.get(
                    '+1-sweep',
                    locale,
                    `<t:${err.rechargeTimestamp}:R>`,
                  ),
                ),
            )
            .patch(token);
        } else {
          throw err;
        }
      }

      // deno-lint-ignore no-non-null-assertion
      const expGained = getFloorExp(inventory.floorsCleared!);

      const status = party1.map((character, index) =>
        db.gainExp(
          op,
          inventory,
          character,
          index === 0 ? expGained * 0.5 : expGained * 0.25,
        )
      );

      const statusString = status.map(
        ({ levelUp, skillPoints, statPoints, exp, expToLevel }, index) => {
          if (levelUp >= 1) {
            return i18n.get(
              'leveled-up',
              locale,
              party1[index].nickname ??
                packs.aliasToArray(characters[index].name)[0],
              levelUp === 1 ? ' ' : ` ${levelUp}x `,
              statPoints,
              skillPoints,
            );
          } else {
            return i18n.get(
              'exp-gained',
              locale,
              party1[index].nickname ??
                packs.aliasToArray(characters[index].name)[0],
              exp,
              expToLevel,
            );
          }
        },
      ).join('\n');

      let retires = 0;

      while (retires < 5) {
        const update = await op.commit();

        if (update.ok) {
          const message = new discord.Message();

          message.addEmbed(
            new discord.Embed()
              .setTitle(
                // deno-lint-ignore no-non-null-assertion
                `${i18n.get('floor', locale)} ${inventory.floorsCleared!}`,
              )
              .setDescription(statusString),
          );

          return await message.patch(token);
        }

        retires += 1;
      }

      throw new Error('failed to update inventory');
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

async function onFail(
  { token, userId, message, locale }: {
    token: string;
    userId: string;
    message: discord.Message;
    locale: discord.AvailableLocales;
  },
): Promise<void> {
  message.addEmbed(
    new discord.Embed()
      .setTitle(i18n.get('you-failed', locale))
      .setDescription(i18n.get('tower-fail', locale)),
  );

  // sweep button
  message.addComponents([
    new discord.Component()
      .setId(discord.join('tsweep', userId))
      .setLabel(`/sweep`),
  ]);

  await message.patch(token);
}

async function onSuccess(
  { token, message, inventory, party, userId, guildId, locale }: {
    token: string;
    userId: string;
    guildId: string;
    message: discord.Message;
    inventory: Schema.Inventory;
    party: Schema.Character[];
    locale: discord.AvailableLocales;
  },
): Promise<void> {
  const op = db.kv.atomic();

  const floor = db.clearFloor(op, inventory);

  const expGained = getFloorExp(floor);

  const status = party.map((character, index) =>
    db.gainExp(
      op,
      inventory,
      character,
      index === 0 ? expGained : expGained * 0.5,
    )
  );

  const characters = await packs.characters({
    guildId,
    ids: party.map(({ id }) => id),
  });

  const statusString = status.map(
    ({ levelUp, skillPoints, statPoints }, index) => {
      if (levelUp >= 1) {
        return i18n.get(
          'leveled-up',
          locale,
          party[index].nickname ??
            packs.aliasToArray(characters[index].name)[0],
          levelUp === 1 ? ' ' : ` ${levelUp}x `,
          statPoints,
          skillPoints,
        );
      } else {
        return undefined;
      }
    },
  ).filter(Boolean).join('\n');

  let retires = 0;

  while (retires < 5) {
    const update = await op.commit();

    if (update.ok) {
      message.addEmbed(
        new discord.Embed()
          .setTitle(i18n.get('you-succeeded', locale))
          .setDescription(statusString),
      );

      // next floor challenge button
      message.addComponents([
        new discord.Component()
          .setId(discord.join('tchallenge', userId))
          .setLabel(i18n.get('next-floor', locale)),
      ]);

      await message.patch(token);

      return;
    }

    retires += 1;
  }
}

const tower = {
  view,
  sweep,
  onFail,
  onSuccess,
};

export default tower;
