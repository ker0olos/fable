import packs from '~/src/packs.ts';

import utils from '~/src/utils.ts';

import _user from '~/src/user.ts';

import * as discord from '~/src/discord.ts';

import config from '~/src/config.ts';

import db from '~/db/mod.ts';

import { default as srch } from '~/src/search.ts';

import i18n from '~/src/i18n.ts';

import { NonFetalError } from '~/src/errors.ts';

import type { Character } from '~/src/types.ts';

function process(
  { token, guildId, member, search, id, message: userMessage }: {
    token: string;
    member: discord.Member;
    guildId: string;
    id?: string;
    search?: string;
    message: string;
    continue?: boolean;
  },
): discord.Message {
  type Bubble = {
    name: string;
    imageUrl?: string;
    message: string;
    user: boolean;
  };

  const user = member.user;

  const locale = _user.cachedUsers[user.id]?.locale ??
    _user.cachedGuilds[guildId]?.locale;

  if (!config.chat) {
    throw new NonFetalError(
      i18n.get('maintenance-chat', locale),
    );
  }

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

      if (!existing || existing.userId !== user.id) {
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

      const characterImage = existing?.image
        ? existing?.image
        : character.images?.[0]?.url;

      const characterName = existing?.nickname ??
        packs.aliasToArray(character.name)[0];

      const userName = user.display_name ?? user.global_name ?? user.username;
      const userImage = discord.getAvatar(member, guildId);

      const bubbles: Bubble[] = [
        {
          user: true,
          name: userName,
          imageUrl: userImage,
          message: userMessage,
        },
        {
          user: false,
          name: characterName,
          imageUrl: characterImage,
          message:
            "Hello, just a reminder that sharks aren't real, just like the moon landing it sharks are also faked by the US government.",
        },
      ];

      for (const bubble of bubbles) {
        const embed = new discord.Embed()
          .setAuthor({
            name: bubble.name,
            icon_url: bubble.imageUrl,
            proxy: !bubble.user,
          })
          .setDescription(bubble.message);

        message.addEmbed(embed);
      }

      message.addComponents([
        new discord.Component()
          .setId(
            'reply',
            user.id,
            `${character.packId}:${character.id}`,
            characterName,
          )
          .setLabel(i18n.get('reply', locale)),
      ]);

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
        { url: `${config.origin}/assets/spinner3.gif` },
      ),
    );

  return loading;
}

const chat = { process };

export default chat;
