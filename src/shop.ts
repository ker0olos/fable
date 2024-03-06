import user from '~/src/user.ts';

import i18n from '~/src/i18n.ts';

import * as discord from '~/src/discord.ts';

import db, { COSTS } from '~/db/mod.ts';

function normal(
  { userId, amount }: { userId: string; amount: number },
): discord.Message {
  const locale = user.cachedUsers[userId]?.locale;

  const message = new discord.Message();

  message.addEmbed(
    new discord.Embed()
      .setDescription(
        i18n.get(
          'spent-tokens-normal',
          locale,
          amount,
          amount > 1 ? i18n.get('tokens', locale) : i18n.get('token', locale),
          discord.emotes.remove,
        ),
      ),
  );

  message.addComponents([
    new discord.Component().setId('buy', 'normal', userId, `${amount}`)
      .setLabel(i18n.get('confirm', locale)),
    new discord.Component().setId('cancel', userId)
      .setStyle(discord.ButtonStyle.Red)
      .setLabel(i18n.get('cancel', locale)),
  ]);

  return message;
}

async function confirmNormal({ userId, guildId, amount }: {
  userId: string;
  guildId: string;
  amount: number;
}): Promise<discord.Message> {
  const locale = user.cachedUsers[userId]?.locale;

  const _user = await db.getUser(userId);
  const guild = await db.getGuild(guildId);
  const instance = await db.getInstance(guild);

  try {
    await db.addPulls(instance, _user, amount);

    const message = new discord.Message();

    message
      .addEmbed(new discord.Embed().setDescription(
        i18n.get(
          'you-bought-pulls',
          locale,
          amount,
          amount > 1 ? i18n.get('pulls', locale) : i18n.get('pull', locale),
          discord.emotes.add,
        ),
      ));

    message.addComponents([
      new discord.Component()
        .setId('gacha', userId)
        .setLabel('/gacha'),
      new discord.Component()
        .setId('q', userId)
        .setLabel('/q'),
    ]);

    return message;
  } catch (err) {
    switch (err.message) {
      case 'INSUFFICIENT_TOKENS': {
        const tokens = _user.availableTokens ?? 0;

        const diff = amount - tokens;

        return new discord.Message()
          .addEmbed(new discord.Embed()
            .setDescription(
              i18n.get(
                'you-need-more-tokens',
                locale,
                diff,
                diff > 1
                  ? i18n.get('tokens', locale)
                  : i18n.get('token', locale),
              ),
            ));
      }
      default:
        throw err;
    }
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

  const message = new discord.Message();

  const cost = stars === 5
    ? COSTS.FIVE
    : stars === 4
    ? COSTS.FOUR
    : COSTS.THREE;

  message.addEmbed(
    new discord.Embed()
      .setDescription(
        i18n.get(
          'spent-tokens-guaranteed',
          locale,
          cost,
          discord.emotes.remove,
          `${stars}${discord.emotes.smolStar}`,
          discord.emotes.add,
        ),
      ),
  );

  message.addComponents([
    new discord.Component().setId('buy', 'guaranteed', userId, `${stars}`)
      .setLabel('Confirm'),
    new discord.Component().setId('cancel', userId)
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

  const _user = await db.getUser(userId);

  try {
    const _ = await db.addGuarantee(_user, stars);

    const message = new discord.Message();

    message
      .addEmbed(new discord.Embed().setDescription(
        i18n.get(
          'you-bought-guarantee',
          locale,
          stars,
          discord.emotes.smolStar,
          discord.emotes.add,
        ),
      ));

    message.addComponents([
      new discord.Component()
        .setId('pull', userId, `${stars}`)
        .setLabel(`/pull ${stars}`),
    ]);

    return message;
  } catch (err) {
    switch (err.message) {
      case 'INSUFFICIENT_TOKENS': {
        const cost = stars === 5
          ? COSTS.FIVE
          : stars === 4
          ? COSTS.FOUR
          : COSTS.THREE;

        const tokens = _user.availableTokens ?? 0;

        const diff = cost - tokens;

        return new discord.Message()
          .addEmbed(new discord.Embed()
            .setDescription(
              i18n.get(
                'you-need-more-tokens',
                locale,
                diff,
                diff > 1
                  ? i18n.get('tokens', locale)
                  : i18n.get('token', locale),
              ),
            ));
      }
      default:
        throw err;
    }
  }
}

function sweeps(
  { userId, amount }: { userId: string; amount: number },
): discord.Message {
  const locale = user.cachedUsers[userId]?.locale;

  const message = new discord.Message();

  message.addEmbed(
    new discord.Embed()
      .setDescription(
        i18n.get(
          'spent-tokens-normal',
          locale,
          amount,
          amount > 1 ? i18n.get('tokens', locale) : i18n.get('token', locale),
          discord.emotes.remove,
        ),
      ),
  );

  message.addComponents([
    new discord.Component().setId('buy', 'sweeps', userId, `${amount}`)
      .setLabel(i18n.get('confirm', locale)),
    new discord.Component().setId('cancel', userId)
      .setStyle(discord.ButtonStyle.Red)
      .setLabel(i18n.get('cancel', locale)),
  ]);

  return message;
}

async function confirmSweeps({ userId, guildId, amount }: {
  userId: string;
  guildId: string;
  amount: number;
}): Promise<discord.Message> {
  const locale = user.cachedUsers[userId]?.locale;

  const _user = await db.getUser(userId);
  const guild = await db.getGuild(guildId);
  const instance = await db.getInstance(guild);

  try {
    await db.addSweeps(instance, _user, amount);

    const message = new discord.Message();

    message
      .addEmbed(new discord.Embed().setDescription(
        i18n.get(
          'you-bought-pulls',
          locale,
          amount,
          (amount > 1 ? i18n.get('sweeps', locale) : i18n.get('sweep', locale))
            .toLocaleLowerCase(),
          discord.emotes.add,
        ),
      ));

    message.addComponents([
      new discord.Component()
        .setId('tsweep', userId)
        .setLabel('/sweep'),
    ]);

    return message;
  } catch (err) {
    switch (err.message) {
      case 'INSUFFICIENT_TOKENS': {
        const tokens = _user.availableTokens ?? 0;

        const diff = amount - tokens;

        return new discord.Message()
          .addEmbed(new discord.Embed()
            .setDescription(
              i18n.get(
                'you-need-more-tokens',
                locale,
                diff,
                diff > 1
                  ? i18n.get('tokens', locale)
                  : i18n.get('token', locale),
              ),
            ));
      }
      default:
        throw err;
    }
  }
}

const shop = {
  normal,
  guaranteed,
  confirmNormal,
  confirmGuaranteed,
  sweeps,
  confirmSweeps,
};

export default shop;
