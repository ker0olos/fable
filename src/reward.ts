import user from '~/src/user.ts';

import i18n from '~/src/i18n.ts';

import * as discord from '~/src/discord.ts';

import db from '~/db/mod.ts';

function pulls(
  { userId, targetId, amount }: {
    userId: string;
    targetId: string;
    amount: number;
  },
): discord.Message {
  const locale = user.cachedUsers[userId]?.locale;

  const message = new discord.Message();

  message.addEmbed(
    new discord.Embed()
      .setDescription(
        i18n.get(
          'admin-reward',
          locale,
          `<@${targetId}>`,
          amount,
          amount > 1 ? i18n.get('pulls', locale) : i18n.get('pull', locale),
          discord.emotes.add,
        ),
      ),
  );

  message.addComponents([
    new discord.Component().setId(
      'reward',
      'pulls',
      userId,
      targetId,
      `${amount}`,
    )
      .setLabel(i18n.get('confirm', locale)),
    new discord.Component().setId('cancel', userId)
      .setStyle(discord.ButtonStyle.Red)
      .setLabel(i18n.get('cancel', locale)),
  ]);

  return message;
}

async function confirmPulls({ userId, targetId, guildId, amount, token }: {
  userId: string;
  targetId: string;
  guildId: string;
  amount: number;
  token: string;
}): Promise<discord.Message> {
  const locale = user.cachedUsers[userId]?.locale;

  await db.addPulls(targetId, guildId, amount, true);

  const message = new discord.Message();

  message
    .addEmbed(new discord.Embed().setDescription(
      i18n.get(
        'rewarded-pulls',
        locale,
        `<@${targetId}>`,
        amount,
        amount > 1 ? i18n.get('pulls', locale) : i18n.get('pull', locale),
        discord.emotes.add,
      ),
    ));

  const newMessage = new discord.Message().setContent(`<@${targetId}>`);

  newMessage
    .addEmbed(new discord.Embed().setDescription(
      i18n.get(
        'got-rewarded-pulls',
        locale,
        `<@${userId}>`,
        amount,
        amount > 1 ? i18n.get('pulls', locale) : i18n.get('pull', locale),
        discord.emotes.add,
      ),
    ));

  message.patch(token).then(() => {
    newMessage.followup(token);
  });

  return new discord.Message();
}

const reward = {
  pulls,
  confirmPulls,
};

export default reward;
