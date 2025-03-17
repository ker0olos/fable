import config from '~/src/config.ts';

import db, { COSTS, MAX_PULLS } from '~/db/index.ts';

import i18n from '~/src/i18n.ts';
import utils from '~/src/utils.ts';
import packs from '~/src/packs.ts';

import { default as srch } from '~/src/search.ts';

import * as discord from '~/src/discord.ts';

import { PackCharacter, PackMedia, CHARACTER_ROLE } from '~/src/types.ts';

const cachedGuilds: Record<
  string,
  {
    locale: discord.AvailableLocales;
  }
> = {};

const cachedUsers: Record<
  string,
  {
    locale: discord.AvailableLocales;
  }
> = {};

async function now({
  userId,
  guildId,
  mention,
}: {
  userId: string;
  guildId: string;
  mention?: boolean;
}): Promise<discord.Message> {
  const locale = cachedUsers[userId]?.locale ?? cachedGuilds[guildId]?.locale;

  const { user, ...inventory } = await db.rechargeConsumables(guildId, userId);

  const { availablePulls, stealTimestamp, rechargeTimestamp } = inventory;

  const { dailyTimestamp, availableTokens } = user;

  const message = new discord.Message();

  const recharge = utils.rechargeTimestamp(rechargeTimestamp || undefined);
  const dailyTokenRecharge = utils.rechargeDailyTimestamp(dailyTimestamp);
  const stealRecharge = utils.rechargeStealTimestamp(
    stealTimestamp || undefined
  );

  const guarantees = Array.from(new Set(user.guarantees ?? [])).sort(
    (a, b) => b - a
  );

  message.addEmbed(
    new discord.Embed()
      .setTitle(`**${availablePulls}**`)
      .setDescription(
        `${guarantees.map((r) => `${r}${discord.emotes.smolStar}`).join('')}`
      )
      .setFooter({
        text:
          availablePulls === 1
            ? i18n.get('available-pull', locale)
            : i18n.get('available-pulls', locale),
      })
  );

  if (availableTokens) {
    message.addEmbed(
      new discord.Embed().setTitle(`**${availableTokens}**`).setFooter({
        text:
          availableTokens === 1
            ? i18n.get('daily-token', locale)
            : i18n.get('daily-tokens', locale),
      })
    );
  }

  if (config.notice) {
    message.addEmbed(
      new discord.Embed().setDescription(config.notice.replaceAll('\\n', '\n'))
    );
  }

  if (availablePulls < MAX_PULLS) {
    message.addEmbed(
      new discord.Embed().setDescription(
        i18n.get('+1-pull', locale, `<t:${recharge}:R>`)
      )
    );
  }

  if (dailyTimestamp) {
    message.addEmbed(
      new discord.Embed().setDescription(
        i18n.get('+1-token', locale, `<t:${dailyTokenRecharge}:R>`)
      )
    );
  }

  if (stealTimestamp) {
    message.addEmbed(
      new discord.Embed().setDescription(
        i18n.get('steal-cooldown-ends', locale, `<t:${stealRecharge}:R>`)
      )
    );
  }

  // components

  if (availablePulls > 0) {
    message.addComponents([
      // `/gacha` shortcut
      new discord.Component().setId('gacha', userId).setLabel('/gacha'),
    ]);
  }

  if (user.availableTokens && user.availableTokens >= COSTS.FIVE) {
    // `/buy guaranteed` 5 shortcut
    message.addComponents([
      new discord.Component()
        .setId('buy', 'bguaranteed', userId, '5')
        .setLabel(`/buy guaranteed 5`),
    ]);
  } else if (user.availableTokens && user.availableTokens >= COSTS.FOUR) {
    // `/buy guaranteed 4` shortcut
    message.addComponents([
      new discord.Component()
        .setId('buy', 'bguaranteed', userId, '4')
        .setLabel(`/buy guaranteed 4`),
    ]);
  }

  if (guarantees.length) {
    message.addComponents([
      // `/pull` shortcut
      new discord.Component()
        .setId('pull', userId, `${guarantees[0]}`)
        .setLabel(`/pull ${guarantees[0]}`),
    ]);
  }

  if (mention) {
    message.setContent(`<@${userId}>`).setPing();
  }

  return message;
}

function nick({
  token,
  userId,
  guildId,
  nick,
  search,
  id,
}: {
  token: string;
  userId: string;
  guildId: string;
  nick?: string;
  search?: string;
  id?: string;
}): discord.Message {
  const locale = cachedUsers[userId]?.locale ?? cachedGuilds[guildId]?.locale;

  packs
    .characters(id ? { ids: [id], guildId } : { search, guildId })
    .then(async (results: PackCharacter[]) => {
      if (!results.length) {
        throw new Error('404');
      }

      const character = results[0];

      const media = character.media?.[0]?.media;

      if (media && packs.isDisabled(media.id, guildId)) {
        throw new Error('404');
      }

      const message = new discord.Message();

      const characterId = results[0].id;

      try {
        const response = await db.setCharacterNickname(
          userId,
          guildId,
          characterId,
          nick
        );

        if (!response) {
          throw new Error('404');
        }

        const name = character.name;

        const embed = await srch.characterEmbed(message, character, {
          footer: true,
          rating: false,
          mode: 'thumbnail',
          description: false,
          media: { title: true },
          overwrite: { ...response, nickname: nick },
        });

        message
          .addEmbed(
            new discord.Embed().setDescription(
              !nick
                ? i18n.get('nickname-reset', locale, name)
                : i18n.get('nickname-changed', locale, name, nick)
            )
          )
          .addEmbed(embed);

        return message.patch(token);
      } catch (err) {
        const names = results[0].name;

        switch ((err as Error).message) {
          case 'CHARACTER_NOT_FOUND': {
            return message
              .addEmbed(
                new discord.Embed().setDescription(
                  i18n.get('character-hasnt-been-found', locale, names[0])
                )
              )
              .addComponents([
                new discord.Component()
                  .setId(`character`, characterId)
                  .setLabel('/character'),
              ])
              .patch(token);
          }
          case 'CHARACTER_NOT_OWNED':
            return message
              .addEmbed(
                new discord.Embed().setDescription(
                  i18n.get('character-not-owned-by-you', locale, names[0])
                )
              )
              .addComponents([
                new discord.Component()
                  .setId(`character`, characterId)
                  .setLabel('/character'),
              ])
              .patch(token);
          default:
            throw err;
        }
      }
    })
    .catch(async (err) => {
      if (err.message === '404') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('found-nothing', locale)
            )
          )
          .patch(token);
      }

      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  return discord.Message.spinner();
}

function image({
  token,
  userId,
  guildId,
  image,
  search,
  id,
}: {
  token: string;
  userId: string;
  guildId: string;
  image?: string;
  search?: string;
  id?: string;
}): discord.Message {
  const locale = cachedUsers[userId]?.locale ?? cachedGuilds[guildId]?.locale;

  packs
    .characters(id ? { ids: [id], guildId } : { search, guildId })
    .then(async (results: PackCharacter[]) => {
      if (!results.length) {
        throw new Error('404');
      }

      const character = results[0];

      const media = character.media?.[0]?.media;

      if (media && packs.isDisabled(media.id, guildId)) {
        throw new Error('404');
      }

      const message = new discord.Message();

      const characterId = results[0].id;

      try {
        const response = await db.setCharacterImage(
          userId,
          guildId,
          characterId,
          image
        );

        if (!response) {
          throw new Error('404');
        }

        const name = character.name;

        const embed = await srch.characterEmbed(message, character, {
          footer: true,
          rating: false,
          description: false,
          media: { title: true },
          overwrite: { ...response, image },
        });

        message
          .addEmbed(
            new discord.Embed().setDescription(
              !image
                ? i18n.get('image-reset', locale, name)
                : i18n.get(
                    'image-changed',
                    locale,
                    name,

                    image!
                  )
            )
          )
          .addEmbed(embed);

        return message.patch(token);
      } catch (err) {
        const name = results[0].name;

        switch ((err as Error).message) {
          case 'CHARACTER_NOT_FOUND': {
            return message
              .addEmbed(
                new discord.Embed().setDescription(
                  i18n.get('character-hasnt-been-found', locale, name)
                )
              )
              .addComponents([
                new discord.Component()
                  .setId(`character`, characterId)
                  .setLabel('/character'),
              ])
              .patch(token);
          }
          case 'CHARACTER_NOT_OWNED':
            return message
              .addEmbed(
                new discord.Embed().setDescription(
                  i18n.get('character-not-owned-by-you', locale, name[0])
                )
              )
              .addComponents([
                new discord.Component()
                  .setId(`character`, characterId)
                  .setLabel('/character'),
              ])
              .patch(token);
          default:
            throw err;
        }
      }
    })
    .catch(async (err) => {
      if (err.message === '404') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('found-nothing', locale)
            )
          )
          .patch(token);
      }

      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  return discord.Message.spinner();
}

function like({
  token,
  userId,
  guildId,
  mention,
  search,
  undo,
  id,
}: {
  token: string;
  userId: string;
  guildId: string;
  undo: boolean;
  mention?: boolean;
  search?: string;
  id?: string;
}): discord.Message {
  const locale = cachedUsers[userId]?.locale ?? cachedGuilds[guildId]?.locale;

  packs
    .characters(id ? { ids: [id], guildId } : { search, guildId })
    .then(async (results: PackCharacter[]) => {
      if (!results.length) {
        throw new Error('404');
      }

      const character = results[0];

      const media = character.media?.[0]?.media;

      if (media && packs.isDisabled(media.id, guildId)) {
        throw new Error('404');
      }

      const message = new discord.Message();

      const characterId = character.id;

      if (!undo) {
        await db.likeCharacter(userId, characterId);
      } else {
        await db.unlikeCharacter(userId, characterId);
      }

      message.addEmbed(
        new discord.Embed().setDescription(!undo ? 'Liked' : 'Unliked')
      );

      if (mention) {
        message.setContent(`<@${userId}>`).setPing();
      }

      const embed = await srch.characterEmbed(message, character, {
        footer: true,
        description: false,
        mode: 'thumbnail',
        media: { title: true },
        rating: true,
      });

      message.addEmbed(embed);

      if (!undo) {
        message.addComponents([
          new discord.Component()
            .setId(`character`, characterId)
            .setLabel('/character'),
        ]);
      }

      return message.patch(token);
    })
    .catch(async (err) => {
      if (err.message === '404') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('found-nothing', locale)
            )
          )
          .patch(token);
      }

      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  return discord.Message.spinner();
}

function likeall({
  token,
  userId,
  guildId,
  search,
  undo,
  id,
}: {
  token: string;
  userId: string;
  guildId: string;
  undo: boolean;
  search?: string;
  id?: string;
}): discord.Message {
  const locale = cachedUsers[userId]?.locale ?? cachedGuilds[guildId]?.locale;

  packs
    .media(id ? { ids: [id], guildId } : { search, guildId })
    .then(async (results: PackMedia[]) => {
      if (!results.length) {
        throw new Error('404');
      }

      const message = new discord.Message();

      const mediaId = results[0].id;

      if (!undo) {
        await db.likeMedia(userId, mediaId);
      } else {
        await db.unlikeMedia(userId, mediaId);
      }

      message.addEmbed(
        new discord.Embed().setDescription(!undo ? 'Liked' : 'Unliked')
      );

      const media = results[0];

      const embed = await srch.mediaEmbed(message, media, {
        mode: 'thumbnail',
      });

      message.addEmbed(embed);

      if (!undo) {
        message.addComponents([
          new discord.Component()
            .setId(`media`, mediaId)
            .setLabel(`/${media.type.toString().toLowerCase()}`),
        ]);
      }

      return message.patch(token);
    })
    .catch(async (err) => {
      if (err.message === '404') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('found-nothing', locale)
            )
          )
          .patch(token);
      }

      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  return discord.Message.spinner();
}

function list({
  token,
  userId,
  guildId,
  rating,
  search,
  id,
  index,
  nick,
  picture,
}: {
  token: string;
  index: number;
  userId: string;
  guildId: string;
  rating?: number;
  search?: string;
  id?: string;
  nick?: boolean;
  picture?: boolean;
}): discord.Message {
  const locale = cachedUsers[userId]?.locale ?? cachedGuilds[guildId]?.locale;

  Promise.resolve()
    .then(async () => {
      const { user, ...inventory } = await db.getInventory(guildId, userId);

      let characters = await db.getUserCharacters(userId, guildId);

      let length = 0;

      let embed = new discord.Embed();

      const message = new discord.Message();

      const members = [
        inventory.partyMember1Id,
        inventory.partyMember2Id,
        inventory.partyMember3Id,
        inventory.partyMember4Id,
        inventory.partyMember5Id,
      ];

      const media: PackMedia[] = [];

      if (rating) {
        characters = characters.filter((char) => char.rating === rating);
      }

      if (search || id) {
        const results = await packs.media(
          id ? { ids: [id], guildId } : { search, guildId }
        );

        if (!results.length || packs.isDisabled(results[0].id, guildId)) {
          throw new Error('404');
        }

        const parent = results[0];

        const relationsIds = [
          parent,
          ...(parent.media?.map(({ node }) => node) ?? []),
        ].map(({ id }) => id);

        characters = characters
          .filter((char) => relationsIds.includes(char.mediaId))
          .sort((a, b) => {
            if (a.mediaId < b.mediaId) {
              return -1;
            }

            if (a.mediaId > b.mediaId) {
              return 1;
            }

            return b.rating - a.rating;
          });
      } else {
        characters = characters.sort((a, b) => b.rating - a.rating);
      }

      if (picture) {
        length = characters.length;

        const character = characters[index];

        const _character = await packs.characters({
          ids: [character.characterId],
          guildId,
        });

        const media = _character[0].media?.[0]?.media;

        const mediaTitle = media?.title
          ? utils.wrap(media.title[0])
          : undefined;

        if (!_character[0] || (media && packs.isDisabled(media.id, guildId))) {
          embed.setDescription(i18n.get('character-disabled', locale));
        } else {
          embed = await srch.characterEmbed(message, _character[0], {
            footer: false,
            description: false,
            media: { title: mediaTitle },
            overwrite: character,
          });
        }
      } else {
        const chunks = utils.chunks(characters, 5);

        if (!chunks.length) {
          message.addEmbed(
            embed.setDescription(
              nick
                ? media.length
                  ? i18n.get(
                      'user-empty-media-collection',
                      locale,
                      `<@${userId}>`,
                      media[0].title
                    )
                  : i18n.get(
                      'user-empty-collection',
                      locale,
                      `<@${userId}>`,
                      rating ? `${rating}${discord.emotes.smolStar}` : ''
                    )
                : media.length
                  ? i18n.get(
                      'you-empty-media-collection',
                      locale,
                      media[0].title
                    )
                  : i18n.get(
                      'you-empty-collection',
                      locale,
                      rating ? `${rating}${discord.emotes.smolStar}` : ''
                    )
            )
          );

          if (!nick) {
            message.addComponents([
              // `/gacha` shortcut
              new discord.Component().setId('gacha', userId).setLabel('/gacha'),
            ]);
          }

          return message.patch(token);
        }

        length = chunks.length;

        const _characters = await packs.characters({
          ids: chunks[index]?.map(({ characterId }) => characterId),
          guildId,
        });

        await Promise.all(
          chunks[index].map(async (existing) => {
            const char = _characters.find(
              ({ id }) => existing.characterId === id
            )!;

            if (!char) {
              return;
            }

            const media = char.media?.[0]?.media;

            const mediaTitle = media?.title
              ? utils.wrap(media.title)
              : undefined;

            const name = `${existing.rating}${discord.emotes.smolStar}${
              members.some(
                (member) => Boolean(member) && member === existing.characterId
              )
                ? discord.emotes.member
                : user.likes?.some(
                      (like) =>
                        like.characterId === existing.characterId ||
                        like.mediaId === existing.mediaId
                    )
                  ? `${discord.emotes.liked}`
                  : ''
            } ${existing.nickname ?? utils.wrap(char.name)}`;

            if (media && packs.isDisabled(media.id, guildId)) {
              return;
            }

            embed.addField({
              inline: false,
              name: mediaTitle ? mediaTitle : name,
              value: mediaTitle ? name : undefined,
            });
          })
        );
      }

      return discord.Message.page({
        index,
        type: 'list',
        target: discord.join(
          userId,
          media.length ? media[0].id : '',
          `${rating ?? ''}`,
          picture ? '1' : ''
        ),
        total: length,
        message: message.addEmbed(embed),
        next: index + 1 < length,
        locale,
      }).patch(token);
    })
    .catch(async (err) => {
      if (err.message === '404') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('found-nothing', locale)
            )
          )
          .patch(token);
      }

      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  return discord.Message.spinner();
}

function likeslist({
  token,
  userId,
  guildId,
  index,
  nick,
  filter,
  ownedBy,
}: {
  token: string;
  index: number;
  userId: string;
  guildId: string;
  nick?: boolean;
  filter?: boolean;
  ownedBy?: string;
}): discord.Message {
  const locale = user.cachedUsers[userId]?.locale;

  Promise.resolve()
    .then(async () => {
      const user = await db.getUser(userId);

      const embed = new discord.Embed();

      const message = new discord.Message();

      const likes = user.likes ?? [];
      const filtered: { characterId?: string; mediaId?: string }[] = [];

      // sort so that all media likes are in the bottom of the list
      likes.sort((a, b) => {
        const aId = typeof a.characterId === 'string';
        const bId = typeof b.characterId === 'string';

        if (aId && !bId) {
          return -1;
        } else if (!aId && bId) {
          return 1;
        } else {
          return 0;
        }
      });

      const results = ownedBy
        ? await db.getUserCharacters(ownedBy, guildId)
        : await db.findCharacters(
            guildId,
            likes
              .map(({ characterId }) => characterId)
              .filter(utils.nonNullable)
          );

      // show only characters that are owned by specific user
      if (ownedBy) {
        results.forEach((character) => {
          if (
            likes.find(
              (t) =>
                t.characterId === character?.characterId ||
                t.mediaId === character?.mediaId
            )
          ) {
            filtered.push({ characterId: character!.characterId });
          }
        });
        // filter out characters that are owned by the user
      } else if (filter) {
        likes.forEach((like) => {
          if (like.characterId)
            filtered.push({ characterId: like.characterId });
        });
      } else {
        filtered.push(
          ...(likes as { characterId?: string; mediaId?: string }[])
        );
      }

      const chunks = utils.chunks(filtered, 5);

      const [characters, media] = await Promise.all([
        await packs.characters({
          guildId,
          ids: chunks[index]
            ?.map(({ characterId }) => characterId)
            .filter(utils.nonNullable),
        }),
        await packs.media({
          guildId,
          ids: chunks[index]
            ?.map(({ mediaId }) => mediaId)
            .filter(utils.nonNullable),
        }),
      ]);

      if (!chunks.length) {
        if (index > 0) {
          embed.setDescription('This page is empty');
        } else {
          message.addEmbed(
            embed.setDescription(
              nick
                ? i18n.get('user-empty-likeslist', locale, `<@${userId}>`)
                : i18n.get('you-empty-likeslist', locale)
            )
          );

          return message.patch(token);
        }
      }

      await Promise.all(
        chunks[index].map(async (like) => {
          const character = characters.find(
            ({ id }) => like.characterId === id
          )!;

          if (!character) {
            return;
          }

          const existing = results.find((r) => r?.characterId === character.id);

          const char = character;

          const rating = existing?.rating ?? char.rating;

          const media = char.media?.[0]?.media;

          const mediaTitle = media?.title ? utils.wrap(media.title) : undefined;

          const name = `${rating}${discord.emotes.smolStar} ${
            existing ? `<@${existing?.userId}> ` : ''
          }${utils.wrap(char.name)}`;

          if (media && packs.isDisabled(media.id, guildId)) {
            return;
          }

          embed.addField({
            inline: false,
            name: mediaTitle ? mediaTitle : name,
            value: mediaTitle ? name : undefined,
          });
        })
      );

      media.forEach((media) => {
        const title = utils.wrap(media.title);

        embed.addField({
          inline: false,
          name: title,
          value: discord.emotes.all,
        });
      });

      return discord.Message.page({
        index,
        type: 'likes',
        target: discord.join(userId, filter ? '1' : '0', ownedBy ?? ''),
        total: chunks.length,
        message: message.addEmbed(embed),
        next: index + 1 < chunks.length,
        locale,
      }).patch(token);
    })
    .catch(async (err) => {
      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  return discord.Message.spinner();
}

function sum({
  token,
  userId,
  guildId,
}: // nick,
{
  token: string;
  userId: string;
  guildId: string;
  nick?: boolean;
}): discord.Message {
  const locale = cachedUsers[userId]?.locale;

  Promise.resolve()
    .then(async () => {
      const { user, ...inventory } = await db.getInventory(guildId, userId);

      const likesCharactersIds = user.likes
        ?.map(({ characterId }) => characterId)
        .filter(utils.nonNullable);

      const likesMediaIds = user.likes
        ?.map(({ mediaId }) => mediaId)
        .filter(utils.nonNullable);

      const characters = await db.getUserCharacters(userId, guildId);

      const partyIds = [
        inventory.partyMember1Id,
        inventory.partyMember2Id,
        inventory.partyMember3Id,
        inventory.partyMember4Id,
        inventory.partyMember5Id,
      ];

      const embed = new discord.Embed();

      const sum: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      const sumProtected: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      const description: string[] = [];

      characters.forEach((char) => {
        const r = char.rating as keyof typeof sum;

        if (
          partyIds.includes(char.characterId) ||
          likesCharactersIds.includes(char.characterId) ||
          likesMediaIds.includes(char.mediaId)
        ) {
          sumProtected[r] += 1;
        }

        sum[r] += 1;
      });

      [1, 2, 3, 4, 5].forEach((n) =>
        description.push(
          `${n}${discord.emotes.smolStar} — **${sum[n]} ${
            sum[n] === 1
              ? i18n.get('character', locale)
              : i18n.get('characters', locale)
          }** — ${sumProtected[n]} ${discord.emotes.liked}(${
            sum[n] - sumProtected[n]
          })`
        )
      );

      embed.setDescription(description.join('\n'));

      new discord.Message().addEmbed(embed).patch(token);
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

function showcase({
  token,
  userId,
  guildId,
  index,
  nick,
}: {
  token: string;
  index: number;
  userId: string;
  guildId: string;
  nick?: boolean;
}): discord.Message {
  const locale = cachedUsers[userId]?.locale ?? cachedGuilds[guildId]?.locale;

  Promise.resolve()
    .then(async () => {
      const embed = new discord.Embed();

      const likedMedia: Record<string, boolean> = {};
      const ownedMedia: Record<string, string[]> = {};

      const user = await db.getUser(userId);

      const characters = await db.getUserCharacters(userId, guildId);

      user.likes?.forEach(
        ({ mediaId }) => mediaId && (likedMedia[mediaId] = true)
      );

      characters.forEach(({ mediaId, characterId }) => {
        ownedMedia[mediaId] ??= [];
        ownedMedia[mediaId].push(characterId);
      });

      let media = await packs.media({
        guildId,
        ids: [...Object.keys(likedMedia), ...Object.keys(ownedMedia)],
      });

      media = media
        .map((media) => {
          const mediaId = media.id;

          // filter background characters
          media.characters =
            media.characters?.filter(
              ({ role }) => role !== CHARACTER_ROLE.BACKGROUND
            ) ?? [];

          // filter background characters from owned character
          ownedMedia[mediaId] = ownedMedia[mediaId]?.filter((id) => {
            const edge = media.characters!.find(
              ({ nodeId }) => packs.ensureId(nodeId, media.packId) === id
            );

            return edge && edge.role !== CHARACTER_ROLE.BACKGROUND;
          });

          return media;
        })
        // filter out any media with 0 characters
        .filter((m) => m.characters?.length);

      // shadow aggregate liked media relations
      // and add them into the liked media list
      media.forEach((media) => {
        const list = [
          media.id,
          ...(media.media ?? []).map(({ nodeId }) =>
            packs.ensureId(nodeId, media.packId)
          ),
        ];

        const anyIncludes = list.some((id) => likedMedia[id] || false);

        if (anyIncludes) list.forEach((id) => (likedMedia[id] = true));
      });

      // sort by liked then owned amount
      media.sort((a, b) => {
        const aId = a.id;
        const bId = b.id;

        const aLiked = likedMedia[aId] || false;
        const bLiked = likedMedia[bId] || false;

        if (aLiked && !bLiked) return -1;
        if (!aLiked && bLiked) return 1;

        const aOwned = ownedMedia[aId]?.length ?? 0;
        const bOwned = ownedMedia[bId]?.length ?? 0;

        return bOwned - aOwned;
      });

      const chunks = utils.chunks(media, 5);

      if (!chunks.length) {
        const message = new discord.Message();

        message.addEmbed(
          new discord.Embed().setDescription(
            nick
              ? i18n.get('user-empty-collection', locale, `<@${userId}>`, '')
              : i18n.get('you-empty-collection', locale, '')
          )
        );

        if (!nick) {
          message.addComponents([
            // `/gacha` shortcut
            new discord.Component().setId('gacha', userId).setLabel('/gacha'),
          ]);
        }

        return message.patch(token);
      }

      const mediaAllOwned = await db.getMediaCharacters(
        guildId,
        chunks[index].map(({ id }) => id)
      );

      chunks[index].forEach((media) => {
        const id = media.id;

        const title = media.title;

        const liked = likedMedia[id] || false;

        const owned = ownedMedia[id]?.length ?? 0;

        const total = media.characters!.length;

        const percent = Math.round((owned / total) * 100);

        let formatted = `${percent}% — ${owned} / ${total}`;

        // TODO TEST
        const ownedByOthers = mediaAllOwned.filter(
          (character) =>
            character.mediaId === id &&
            media.characters!.some(
              ({ nodeId }) =>
                // TODO TEST
                packs.ensureId(nodeId, media.packId) === character.characterId
            ) &&
            character.userId !== userId
        );

        if (ownedByOthers.length) {
          formatted = `${i18n.get(
            'owned-by-others',
            locale,
            ownedByOthers.length
          )}\n${formatted}`;
        } else if (percent >= 100) {
          formatted = `~~${formatted}~~`;
        }

        embed.addField({
          inline: false,
          name: `${title} ${liked ? discord.emotes.liked : ''}`.trim(),
          value: formatted,
        });
      });

      const message = new discord.Message().addEmbed(embed);

      return discord.Message.page({
        index,
        message,
        type: 'showcase',
        target: userId,
        total: chunks.length,
        next: index + 1 < chunks.length,
        locale,
      }).patch(token);
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

function logs({
  token,
  userId,
  guildId,
  nick,
}: {
  token: string;
  userId: string;
  guildId: string;
  nick?: boolean;
}): discord.Message {
  const locale = cachedUsers[userId]?.locale ?? cachedGuilds[guildId]?.locale;

  Promise.resolve()
    .then(async () => {
      const message = new discord.Message();

      const characters = (await db.getUserCharacters(userId, guildId)).slice(
        -10
      );

      const names: string[] = [];

      const results = await packs.characters({
        guildId,
        ids: characters.map(({ characterId }) => characterId),
      });

      characters.reverse().forEach((existing) => {
        const char = results.find(({ id }) => id === existing.characterId);

        if (!char || packs.isDisabled(existing.mediaId, guildId)) {
          return;
        }

        const name = `${existing.rating}${discord.emotes.smolStar} ${
          existing.nickname ?? utils.wrap(char.name)
        } <t:${utils.normalTimestamp(existing.createdAt)}:R>`;

        names.push(name);
      });

      if (names.length <= 0) {
        message.addEmbed(
          new discord.Embed().setDescription(
            nick
              ? i18n.get('user-empty-collection', locale, `<@${userId}>`, '')
              : i18n.get('you-empty-collection', locale, '')
          )
        );

        return message.patch(token);
      }

      message.addEmbed(new discord.Embed().setDescription(names.join('\n')));

      return message.patch(token);
    })
    .catch(async (err) => {
      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  return discord.Message.spinner();
}

const user = {
  cachedUsers,
  cachedGuilds,
  image,
  like,
  likeall,
  likeslist,
  showcase,
  list,
  logs,
  nick,
  now,
  sum,
};

export default user;
