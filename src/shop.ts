import user from '~/src/user.ts';

import i18n from '~/src/i18n.ts';

import config from '~/src/config.ts';

import * as discord from '~/src/discord.ts';

import db, { COSTS } from '~/db/index.ts';

import { NonFetalError } from '~/src/errors.ts';

function normal({
  userId,
  amount,
}: {
  userId: string;
  amount: number;
}): discord.Message {
  const locale = user.cachedUsers[userId]?.locale;

  if (!config.shop) {
    throw new NonFetalError(i18n.get('maintenance-shop', locale));
  }

  const message = new discord.Message();

  message.addEmbed(
    new discord.Embed().setDescription(
      i18n.get(
        'spent-tokens-normal',
        locale,
        amount,
        amount > 1 ? i18n.get('tokens', locale) : i18n.get('token', locale),
        discord.emotes.remove
      )
    )
  );

  message.addComponents([
    new discord.Component()
      .setId('buy', 'normal', userId, `${amount}`)
      .setLabel(i18n.get('confirm', locale)),
    new discord.Component()
      .setId('cancel', userId)
      .setStyle(discord.ButtonStyle.Red)
      .setLabel(i18n.get('cancel', locale)),
  ]);

  return message;
}

async function confirmNormal({
  userId,
  guildId,
  amount,
}: {
  userId: string;
  guildId: string;
  amount: number;
}): Promise<discord.Message> {
  const locale = user.cachedUsers[userId]?.locale;

  try {
    await db.addPulls(userId, guildId, amount);

    const message = new discord.Message();

    message.addEmbed(
      new discord.Embed().setDescription(
        i18n.get(
          'you-bought-pulls',
          locale,
          amount,
          amount > 1 ? i18n.get('pulls', locale) : i18n.get('pull', locale),
          discord.emotes.add
        )
      )
    );

    message.addComponents([
      new discord.Component().setId('gacha', userId).setLabel('/gacha'),
      new discord.Component().setId('q', userId).setLabel('/q'),
    ]);

    return message;
  } catch {
    const { availableTokens } = await db.getUser(userId);

    const diff = amount - availableTokens;

    return new discord.Message().addEmbed(
      new discord.Embed().setDescription(
        i18n.get(
          'you-need-more-tokens',
          locale,
          diff,
          diff > 1 ? i18n.get('tokens', locale) : i18n.get('token', locale)
        )
      )
    );
  }
}

function guaranteed({
  userId,
  stars,
}: {
  userId: string;
  stars: number;
}): discord.Message {
  const locale = user.cachedUsers[userId]?.locale;

  if (!config.shop) {
    throw new NonFetalError(i18n.get('maintenance-shop', locale));
  }

  const message = new discord.Message();

  const cost =
    stars === 5 ? COSTS.FIVE : stars === 4 ? COSTS.FOUR : COSTS.THREE;

  message.addEmbed(
    new discord.Embed().setDescription(
      i18n.get(
        'spent-tokens-guaranteed',
        locale,
        cost,
        discord.emotes.remove,
        `${stars}${discord.emotes.smolStar}`,
        discord.emotes.add
      )
    )
  );

  message.addComponents([
    new discord.Component()
      .setId('buy', 'guaranteed', userId, `${stars}`)
      .setLabel('Confirm'),
    new discord.Component()
      .setId('cancel', userId)
      .setStyle(discord.ButtonStyle.Red)
      .setLabel('Cancel'),
  ]);

  return message;
}

async function confirmGuaranteed({
  userId,
  stars,
}: {
  userId: string;
  stars: number;
}): Promise<discord.Message> {
  const locale = user.cachedUsers[userId]?.locale;

  try {
    await db.addGuarantee(userId, stars);

    const message = new discord.Message();

    message.addEmbed(
      new discord.Embed().setDescription(
        i18n.get(
          'you-bought-guarantee',
          locale,
          stars,
          discord.emotes.smolStar,
          discord.emotes.add
        )
      )
    );

    message.addComponents([
      new discord.Component()
        .setId('pull', userId, `${stars}`)
        .setLabel(`/pull ${stars}`),
    ]);

    return message;
  } catch {
    const cost =
      stars === 5 ? COSTS.FIVE : stars === 4 ? COSTS.FOUR : COSTS.THREE;

    const { availableTokens } = await db.getUser(userId);

    const diff = cost - availableTokens;

    return new discord.Message().addEmbed(
      new discord.Embed().setDescription(
        i18n.get(
          'you-need-more-tokens',
          locale,
          diff,
          diff > 1 ? i18n.get('tokens', locale) : i18n.get('token', locale)
        )
      )
    );
  }
}

const shop = {
  normal,
  guaranteed,
  confirmNormal,
  confirmGuaranteed,
};

export default shop;
