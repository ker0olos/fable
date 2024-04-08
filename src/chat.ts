import packs from '~/src/packs.ts';

import utils from '~/src/utils.ts';

import user from '~/src/user.ts';

import * as discord from '~/src/discord.ts';

import config from '~/src/config.ts';

import db from '~/db/mod.ts';

import { default as srch } from '~/src/search.ts';

import i18n from '~/src/i18n.ts';

import type { Character } from '~/src/types.ts';

function start(
  { token, guildId, userId, search, id }: {
    token: string;
    userId: string;
    guildId: string;
    id?: string;
    search?: string;
  },
): discord.Message {
  const locale = user.cachedUsers[userId]?.locale ??
    user.cachedGuilds[guildId]?.locale;

  packs
    .characters(id ? { ids: [id], guildId } : { search, guildId })
    .then((results) => {
      if (!results.length) {
        throw new Error('404');
      }

      return Promise.all([
        // aggregate the media by populating any references to other media/character objects
        packs.aggregate<Character>({ guildId, character: results[0], end: 1 }),
        db.findCharacter(guildId, `${results[0].packId}:${results[0].id}`),
      ]);
    })
    .then(async ([character, existing]) => {
      // const characterId = `${character.packId}:${character.id}`;

      const media = character.media?.edges?.[0]?.node;

      if (
        (
          existing &&
          packs.isDisabled(existing.mediaId, guildId)
        ) ||
        (
          media &&
          packs.isDisabled(`${media.packId}:${media.id}`, guildId)
        )
      ) {
        throw new Error('404');
      }

      if (!existing || existing.userId !== userId) {
        const embed = srch.characterEmbed(character, {
          description: true,
          footer: true,
          rating: false,
          media: { title: true },
          mode: 'thumbnail',
          userId: existing?.userId,
          existing: { rating: existing?.rating },
        });

        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('chat-not-owned', locale),
            ),
          )
          .addEmbed(embed)
          .patch(token);
      }

      const message = new discord.Message();

      message.addEmbed(
        srch.characterEmbed(character, {
          existing: existing ?? undefined,
        }),
      );

      return await message.patch(token);
    })
    .catch(async (err) => {
      if (err.message === '404') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('found-nothing', locale),
            ),
          ).patch(token);
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
        { url: `${config.origin}/assets/spinner.gif` },
      ),
    );

  return loading;
}

const chat = { start };

export default chat;
