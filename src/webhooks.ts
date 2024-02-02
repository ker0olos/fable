import config from './config.ts';

import i18n from './i18n.ts';
import utils from './utils.ts';

import user from './user.ts';

import * as discord from './discord.ts';

import db from '../db/mod.ts';

export async function topgg(r: Request): Promise<Response> {
  const { error } = await utils.validateRequest(r, {
    POST: {
      headers: ['Authorization'],
    },
  });

  if (error) {
    return utils.json(
      { error: error.message },
      { status: error.status },
    );
  }

  const authorization = r.headers.get('Authorization');

  if (
    typeof config.topggSecret !== 'string' ||
    config.topggSecret.length < 32 ||
    authorization !== config.topggSecret
  ) {
    return utils.json(
      { error: 'Forbidden' },
      { status: 403 },
    );
  }

  const data: {
    user: string;
    type: 'upvote' | 'test';
    isWeekend: boolean;
    query: string;
  } = await r.json();

  const amount = data.isWeekend ? 2 : 1;

  try {
    const twelveHoursAgo = new Date();

    const _user = await db.getUser(data.user);

    twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

    // workaround top.gg sending double events
    if (_user.lastVote) {
      const twelveHours = new Date(_user.lastVote);

      twelveHours.setHours(twelveHours.getHours() + 12);

      if (twelveHours > new Date()) {
        return utils.json({ status: 200 });
      }
    }

    await db.addTokens(_user, amount, true);

    const searchParams = new URLSearchParams(data.query);

    // patch /now to confirm vote
    if (searchParams.has('ref')) {
      (async () => {
        const resolved = await db.resolveVoteRef({
          // deno-lint-ignore no-non-null-assertion
          ref: searchParams.get('ref')!,
        });

        if (!resolved) {
          return;
        }

        const { token, guildId } = resolved;

        const locale = user.cachedUsers[data.user]?.locale ??
          user.cachedGuilds[guildId]?.locale;

        // update the /now used to vote
        const message = (await user.now({
          guildId,
          userId: data.user,
          token,
        })).setContent(`<@${data.user}>`);

        new discord.Message()
          .setContent(
            i18n.get(
              'thanks-for-voting',
              locale,
              `<@${data.user}>`,
              amount,
              amount === 1
                ? i18n.get('token', locale)
                : i18n.get('tokens', locale),
            ),
          )
          .addComponents([
            new discord.Component()
              .setId('help', '', '4')
              .setLabel('/help shop'),
          ])
          .followup(token);

        await message.patch(token);
      })()
        .catch(console.error);
    }

    return utils.json({
      message: 'OK',
    });
  } catch (err) {
    if (!config.sentry) {
      throw err;
    }

    utils.captureException(err, {
      extra: { ...data },
    });

    return utils.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
