import * as discord from '~/src/discord.ts';

import search, { idPrefix } from '~/src/search.ts';

import i18n from '~/src/i18n.ts';
import user from '~/src/user.ts';
import party from '~/src/party.ts';
import packs from '~/src/packs.ts';
import utils from '~/src/utils.ts';
import gacha from '~/src/gacha.ts';
import trade from '~/src/trade.ts';
import steal from '~/src/steal.ts';
import shop from '~/src/shop.ts';

import help from '~/src/help.ts';
import reward from '~/src/reward.ts';
import serverOptions from '~/src/serverOptions.ts';

import merge from '~/src/merge.ts';

import config from '~/src/config.ts';

import { NonFetalError, NoPermissionError } from '~/src/errors.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handler = async (r: Request, ctx: any) => {
  const { origin } = new URL(r.url);

  const { error } = await utils.validateRequest(r, {
    POST: {
      headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
    },
  });

  if (error) {
    return utils.json({ error: error.message }, { status: error.status });
  }

  const signature = r.headers.get('X-Signature-Ed25519')!;
  const timestamp = r.headers.get('X-Signature-Timestamp')!;

  const { valid, body } = utils.verifySignature({
    publicKey: config.publicKey,
    body: await r.text(),
    signature,
    timestamp,
  });

  if (!valid) {
    return utils.json(
      { error: 'Invalid request' },
      { status: 401, statusText: 'Unauthorized' }
    );
  }

  const interaction = new discord.Interaction<string | number | boolean>(body);

  const {
    name,
    type,
    locale,
    guildLocale,
    token,
    guildId,
    focused,
    member,
    options,
    subcommand,
    customType,
    customValues,
  } = interaction;

  const ts = Date.now() - parseInt(timestamp) * 1000;

  // exceeded time limit set by discord (3 seconds)
  if (ts >= 2800) {
    return new Response('Request Timeout', { status: 408 });
  }

  if (type === discord.InteractionType.Ping) {
    return discord.Message.pong();
  }

  if (!config.global) {
    const message = new discord.Message()
      .setFlags(discord.MessageFlags.Ephemeral)
      .addEmbed(
        new discord.Embed().setDescription(
          i18n.get('global-maintenance', locale)
        )
      );

    if (config.notice) {
      message.addEmbed(
        new discord.Embed().setDescription(
          config.notice.replaceAll('\\n', '\n')
        )
      );
    }

    return message.send();
  }

  config.origin = origin;

  if (guildId) {
    user.cachedGuilds[guildId] = {
      locale: guildLocale!,
    };
  }

  if (member?.user?.id) {
    // cache the user's locale into a global variable
    user.cachedUsers[member.user.id] = {
      locale: locale!,
    };
  }

  try {
    switch (type) {
      case discord.InteractionType.Partial: {
        if (!name) {
          break;
        }

        // suggest media
        if (
          [
            'search',
            'anime',
            'manga',
            'media',
            'series',
            'found',
            'owned',
            'likeall',
            'unlikeall',
          ].includes(name) ||
          (['collection', 'coll', 'mm'].includes(name) &&
            subcommand === 'media')
        ) {
          const search = options[focused!] as string;

          const message = new discord.Message(discord.MessageType.Suggestions);

          if (search) {
            const results = await packs._searchManyMedia({
              returnStoredSource: true,
              search,
              guildId,
            });

            results.forEach((media) => {
              const title = packs.aliasToArray(media.title)[0];
              if (title)
                message.addSuggestions({
                  name: packs.aliasToArray(media.title)[0],
                  value: `${idPrefix}${media.packId}:${media.id}`,
                });
            });
          }

          return message.send();
        }

        // suggest characters
        if (
          [
            'character',
            'p',
            'party',
            'team',
            'give',
            'gift',
            'trade',
            'offer',
            'steal',
            'nick',
            'image',
            'custom',
            'like',
            'unlike',
            'stats',
          ].includes(name)
        ) {
          const search = options[focused!] as string;

          const message = new discord.Message(discord.MessageType.Suggestions);

          if (search) {
            const results = await packs._searchManyCharacters({
              returnStoredSource: true,
              search,
              guildId,
            });

            results.forEach((character) => {
              const name = packs.aliasToArray(character.name)[0];
              if (name)
                message.addSuggestions({
                  name: packs.aliasToArray(character.name)[0],
                  value: `${idPrefix}${character.packId}:${character.id}`,
                });
            });
          }

          return message.send();
        }

        // suggest installed community packs
        if (name === 'packs' && ['uninstall'].includes(subcommand!)) {
          const id = options[focused!] as string;

          const message = new discord.Message(discord.MessageType.Suggestions);

          let list = await packs.all({ guildId });

          const distance: Record<string, number> = {};

          // sort suggestion based on distance
          list.forEach(({ manifest }) => {
            const d = utils.distance(manifest.id, id);

            if (manifest.title) {
              const d2 = utils.distance(manifest.title, id);

              if (d < d2) {
                distance[manifest.id] = d2;
                return;
              }
            }

            distance[manifest.id] = d;
          });

          list = list.sort(
            (a, b) => distance[b.manifest.id] - distance[a.manifest.id]
          );

          list?.forEach(({ manifest }) => {
            message.addSuggestions({
              name: `${manifest.title ?? manifest.id}`,
              value: manifest.id,
            });
          });

          return message.send();
        }

        break;
      }
      case discord.InteractionType.Command:
        switch (name) {
          case 'search':
          case 'anime':
          case 'manga':
          case 'media':
          case 'series': {
            const title = options['title'] as string;

            if (options['characters']) {
              ctx.waitUntil(
                search.mediaCharacters({
                  token,
                  guildId,
                  index: 0,
                  search: title,
                  userId: member.user.id,
                  id: title.startsWith(idPrefix)
                    ? title.substring(idPrefix.length)
                    : undefined,
                })
              );

              return discord.Message.spinner().send();
            }

            ctx.waitUntil(
              search.media({
                token,
                guildId,
                search: title,
                debug: Boolean(options['debug']),
                id: title.startsWith(idPrefix)
                  ? title.substring(idPrefix.length)
                  : undefined,
              })
            );

            return discord.Message.spinner().send();
          }
          case 'character': {
            const name = options['name'] as string;

            ctx.waitUntil(
              search.character({
                token,
                guildId,
                userId: member.user.id,
                search: name,
                debug: Boolean(options['debug']),
                id: name.startsWith(idPrefix)
                  ? name.substring(idPrefix.length)
                  : undefined,
              })
            );

            return discord.Message.spinner().send();
          }
          case 'party':
          case 'team':
          case 'p': {
            const spot = options['spot'] as 1 | 2 | 3 | 4 | 5;
            const character = options['name'] as string;

            switch (subcommand!) {
              case 'assign':
                ctx.waitUntil(
                  party.assign({
                    token,
                    spot,
                    userId: member.user.id,
                    guildId,
                    search: character,
                    id: character.startsWith(idPrefix)
                      ? character.substring(idPrefix.length)
                      : undefined,
                  })
                );
                return discord.Message.spinner(true).send();
              case 'swap':
                ctx.waitUntil(
                  party.swap({
                    token,
                    guildId,
                    userId: member.user.id,
                    a: options['a'] as 1 | 2 | 3 | 4 | 5,
                    b: options['b'] as 1 | 2 | 3 | 4 | 5,
                  })
                );
                return discord.Message.spinner(true).send();

              case 'remove':
                ctx.waitUntil(
                  party.remove({
                    token,
                    spot,
                    guildId,
                    userId: member.user.id,
                  })
                );
                return discord.Message.spinner(true).send();
              case 'clear': {
                ctx.waitUntil(
                  party.clear({
                    token,
                    guildId,
                    userId: member.user.id,
                  })
                );
                return discord.Message.spinner(true).send();
              }
              default: {
                const user = (options['user'] as string) ?? member.user.id;

                ctx.waitUntil(
                  party.view({
                    token,
                    guildId,
                    userId: user,
                  })
                );

                return discord.Message.spinner(true).send();
              }
            }
          }
          case 'collection':
          case 'coll':
          case 'mm': {
            const userId = (options['user'] as string) ?? member.user.id;

            switch (subcommand!) {
              case 'show': {
                ctx.waitUntil(
                  user.showcase({
                    token,
                    userId,
                    guildId,
                    index: 0,
                    nick: userId !== member.user.id,
                  })
                );
                return discord.Message.spinner(true).send();
              }
              case 'stars':
              case 'media': {
                const title = options['title'] as string;
                const rating = options['rating'] as number;
                const picture = options['picture'] as boolean;

                ctx.waitUntil(
                  user.list({
                    token,
                    userId,
                    guildId,
                    index: 0,
                    rating,
                    search: title,
                    id: title?.startsWith(idPrefix)
                      ? title?.substring(idPrefix.length)
                      : undefined,
                    nick: userId !== member.user.id,
                    picture,
                  })
                );

                return discord.Message.spinner().send();
              }
              case 'sum': {
                ctx.waitUntil(
                  user.sum({
                    token,
                    userId,
                    guildId,
                  })
                );
                return discord.Message.spinner(true).send();
              }
              default:
                break;
            }
            break;
          }
          case 'like':
          case 'protect':
          case 'wish':
          case 'unlike': {
            const search = options['name'] as string;

            ctx.waitUntil(
              user.like({
                token,
                search,
                guildId,

                userId: member.user.id,
                undo: name === 'unlike',
                id: search.startsWith(idPrefix)
                  ? search.substring(idPrefix.length)
                  : undefined,
              })
            );

            return discord.Message.spinner().send();
          }
          case 'likeall':
          case 'unlikeall': {
            const search = options['title'] as string;

            ctx.waitUntil(
              user.likeall({
                token,
                search,
                guildId,

                userId: member.user.id,
                undo: name === 'unlikeall',
                id: search.startsWith(idPrefix)
                  ? search.substring(idPrefix.length)
                  : undefined,
              })
            );

            return discord.Message.spinner().send();
          }
          case 'likes':
          case 'likeslist': {
            const userId = (options['user'] as string) ?? member.user.id;

            const filter = options['filter-owned'] as boolean | undefined;
            const ownedBy = options['owned-by'] as string | undefined;

            ctx.waitUntil(
              user.likeslist({
                token,
                guildId,
                userId,
                index: 0,
                nick: userId !== member.user.id,
                filter,
                ownedBy,
              })
            );

            return discord.Message.spinner().send();
          }
          case 'found':
          case 'owned': {
            const title = options['title'] as string;

            ctx.waitUntil(
              search.mediaFound({
                token,
                guildId,
                index: 0,
                search: title,
                userId: member.user.id,
                id: title.startsWith(idPrefix)
                  ? title.substring(idPrefix.length)
                  : undefined,
              })
            );

            return discord.Message.spinner().send();
          }
          case 'trade':
          case 'offer':
          case 'give':
          case 'gift': {
            const giveCharacters = [
              options['give'] as string,
              options['give2'] as string,
              options['give3'] as string,
            ].filter(utils.nonNullable);

            const takeCharacters = [
              options['take'] as string,
              options['take2'] as string,
              options['take3'] as string,
            ].filter(utils.nonNullable);

            if (member.user.id === options['user']) {
              return trade
                .self({
                  guildId,
                  userId: member.user.id,
                  trade: takeCharacters.length > 0,
                })
                .send();
            }

            ctx.waitUntil(
              trade.pre({
                token,
                guildId,
                userId: member.user.id,
                targetId: options['user'] as string,
                give: giveCharacters,
                take: takeCharacters,
              })
            );

            const loading = discord.Message.spinner(true);

            if (!takeCharacters?.length) {
              loading.setFlags(discord.MessageFlags.Ephemeral);
            }

            return loading.send();
          }
          case 'steal': {
            const search = options['name'] as string;

            ctx.waitUntil(
              steal.pre({
                token,
                guildId,
                userId: member.user.id,
                search,
                id: search.startsWith(idPrefix)
                  ? search.substring(idPrefix.length)
                  : undefined,
              })
            );

            return discord.Message.spinner(true)
              .setFlags(discord.MessageFlags.Ephemeral)
              .send();
          }
          case 'now':
          case 'tu': {
            return (
              await user.now({
                userId: member.user.id,
                guildId,
              })
            ).send();
          }
          case 'guaranteed':
          case 'gacha':
          case 'pull':
          case 'w':
          case 'q': {
            const stars = options['stars'] as number | undefined;

            ctx.waitUntil(
              gacha.start({
                token,
                guildId,
                guarantee: stars,
                quiet: name === 'q',
                userId: member.user.id,
              })
            );

            return discord.Message.spinner().send();
          }
          case 'nick': {
            const name = options['character'] as string;

            const nick = options['new_nick'] as string | undefined;

            ctx.waitUntil(
              user.nick({
                nick,
                token,
                guildId,
                search: name,
                userId: member.user.id,
                id: name.startsWith(idPrefix)
                  ? name.substring(idPrefix.length)
                  : undefined,
              })
            );

            return discord.Message.spinner().send();
          }
          case 'image':
          case 'custom': {
            const name = options['character'] as string;

            const image = options['new_image'] as string | undefined;

            ctx.waitUntil(
              user.image({
                image,
                token,
                guildId,

                search: name,
                userId: member.user.id,
                id: name.startsWith(idPrefix)
                  ? name.substring(idPrefix.length)
                  : undefined,
              })
            );

            return discord.Message.spinner().send();
          }
          case 'synthesize':
          case 'merge': {
            const target = options['target'] as number;

            ctx.waitUntil(
              merge.synthesize({
                token,
                guildId,
                userId: member.user.id,
                mode: 'target',
                target,
              })
            );
            return discord.Message.spinner(true).send();
          }
          case 'automerge': {
            switch (subcommand!) {
              case 'min':
              case 'max':
                ctx.waitUntil(
                  merge.synthesize({
                    token,
                    guildId,
                    userId: member.user.id,
                    mode: subcommand,
                  })
                );
                return discord.Message.spinner(true).send();
              default:
                break;
            }
            break;
          }
          case 'shop':
          case 'buy': {
            //deno-lint-ignore no-non-null-assertion
            switch (subcommand!) {
              case 'guaranteed':
                return shop
                  .guaranteed({
                    userId: member.user.id,
                    stars: options['stars'] as number,
                  })
                  .send();
              case 'normal':
                return shop
                  .normal({
                    userId: member.user.id,
                    amount: options['amount'] as number,
                  })
                  .send();
              default:
                break;
            }
            break;
          }
          case 'installed':
          case 'packs': {
            //deno-lint-ignore no-non-null-assertion
            switch (subcommand!) {
              default:
              case 'installed': {
                return (
                  await packs.pages({
                    guildId,
                    userId: member.user.id,
                  })
                ).send();
              }
              case 'install': {
                const id = options['id'] as string;

                return (
                  await packs.install({
                    id,
                    guildId,
                    userId: member.user.id,
                  })
                ).send();
              }
              case 'uninstall': {
                return (
                  await packs.uninstallDialog({
                    guildId,
                    userId: member.user.id,
                    packId: options['id'] as string,
                  })
                ).send();
              }
            }
            break;
          }
          case 'server': {
            switch (subcommand!) {
              default:
              case 'options': {
                return (
                  await serverOptions.view({
                    guildId,
                    userId: member.user.id,
                  })
                )
                  .setFlags(discord.MessageFlags.Ephemeral)
                  .send();
              }
            }
            break;
          }
          case 'help':
          case 'start':
          case 'guide':
          case 'wiki':
          case 'tuto': {
            const index = (options['page'] as number) || 0;

            return help.pages({ userId: member.user.id, index }).send();
          }
          case 'history':
          case 'logs': {
            const userId = (options['user'] as string) ?? member.user.id;

            ctx.waitUntil(
              user.logs({
                token,
                guildId,
                userId,
                nick: userId !== member.user.id,
              })
            );

            return discord.Message.spinner().send();
          }
          case 'reward': {
            switch (subcommand!) {
              case 'pulls': {
                const targetId = (options['user'] as string) ?? member.user.id;
                const amount = (options['amount'] as number) ?? 1;

                return reward
                  .pulls({
                    amount,
                    targetId,
                    userId: member.user.id,
                  })
                  .send();
              }
              default: {
                break;
              }
            }
            break;
          }
          default: {
            break;
          }
        }
        break;
      case discord.InteractionType.Component:
        switch (customType) {
          case 'media': {
            const id = customValues![0];

            ctx.waitUntil(search.media({ id, guildId, token }));

            return discord.Message.spinner()
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'character': {
            const id = customValues![0];

            const type = customValues![1];

            ctx.waitUntil(
              search.character({
                id,
                token,
                guildId,
                userId: member.user.id,
              })
            );

            return discord.Message.spinner()
              .setType(
                type === '1'
                  ? discord.MessageType.New
                  : discord.MessageType.Update
              )
              .send();
          }
          case 'mcharacters': {
            const mediaId = customValues![0];

            const index = parseInt(customValues![1]);

            ctx.waitUntil(
              search.mediaCharacters({
                token,
                index,
                userId: member.user.id,
                guildId,
                id: mediaId,
              })
            );

            return discord.Message.spinner()
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'list': {
            const userId = customValues![0];

            const mediaId = customValues?.[1] || undefined;

            const rating = parseInt(customValues![2]);

            const picture = customValues![3] === '1';

            const index = parseInt(customValues![4]);

            ctx.waitUntil(
              user.list({
                token,
                index,
                guildId,
                userId,
                rating,
                id: mediaId,
                picture,
              })
            );

            return discord.Message.spinner()
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'showcase': {
            const userId = customValues![0];

            const index = parseInt(customValues![1]);

            ctx.waitUntil(
              user.showcase({
                token,
                index,
                guildId,
                userId,
              })
            );

            return discord.Message.spinner(true)
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'like': {
            const id = customValues![0];

            ctx.waitUntil(
              user.like({
                id,
                token,
                guildId,
                mention: true,
                userId: member.user.id,
                undo: false,
              })
            );

            return discord.Message.spinner().send();
          }
          case 'likes': {
            const userId = customValues![0];

            const filter = customValues![1] === '1';

            const ownedBy = customValues![2];

            const index = parseInt(customValues![3]);

            ctx.waitUntil(
              user.likeslist({
                index,
                token,
                userId,
                guildId,
                filter,
                ownedBy,
              })
            );

            return discord.Message.spinner()
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'found': {
            const id = customValues![0];

            const index = parseInt(customValues![1]);

            ctx.waitUntil(
              search.mediaFound({
                id,
                token,
                guildId,
                userId: member.user.id,
                index,
              })
            );

            return discord.Message.spinner()
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'q':
          case 'pull':
          case 'gacha': {
            const stars = utils.parseInt(customValues![1]);

            ctx.waitUntil(
              gacha.start({
                token,
                guildId,
                mention: true,
                guarantee: stars,
                quiet: customType === 'q',
                userId: member.user.id,
              })
            );

            return discord.Message.spinner()
              .setContent(`<@${member.user.id}>`)
              .setPing()
              .send();
          }
          case 'now': {
            return (
              await user.now({
                mention: true,
                userId: member.user.id,
                guildId,
              })
            ).send();
          }
          case 'help': {
            const index = parseInt(customValues![1]);

            return help
              .pages({ userId: member.user.id, index })
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'buy': {
            const item = customValues![0];

            const userId = customValues![1];

            const value = parseInt(customValues![2]);

            if (userId === member.user.id) {
              switch (item) {
                case 'bguaranteed':
                  return shop
                    .guaranteed({
                      userId: member.user.id,
                      stars: value,
                    })
                    .setType(discord.MessageType.Update)
                    .send();
                case 'guaranteed':
                  return (
                    await shop.confirmGuaranteed({
                      userId: member.user.id,
                      stars: value,
                    })
                  )
                    .setType(discord.MessageType.Update)
                    .send();
                case 'normal':
                  return (
                    await shop.confirmNormal({
                      guildId,
                      userId: member.user.id,
                      amount: value,
                    })
                  )
                    .setType(discord.MessageType.Update)
                    .send();
                default:
                  break;
              }
            }

            throw new NoPermissionError();
          }
          case 'give': {
            const userId = customValues![0];

            const targetId = customValues![1];

            const giveCharactersIds = customValues![2].split('&');

            if (userId === member.user.id) {
              ctx.waitUntil(
                trade.give({
                  token,
                  userId,
                  guildId,
                  targetId: targetId,
                  giveCharactersIds,
                })
              );

              return discord.Message.spinner(true)
                .setType(discord.MessageType.Update)
                .send();
            }

            throw new NoPermissionError();
          }
          case 'trade': {
            const userId = customValues![0];

            const targetId = customValues![1];

            const giveCharactersIds = customValues![2].split('&');

            const takeCharactersIds = customValues![3].split('&');

            if (targetId === member.user.id) {
              ctx.waitUntil(
                trade.accepted({
                  token,
                  guildId,
                  userId,
                  targetId,
                  giveCharactersIds,
                  takeCharactersIds,
                })
              );

              return discord.Message.spinner(true)
                .setType(discord.MessageType.Update)
                .send();
            }

            throw new NoPermissionError();
          }
          case 'synthesis': {
            const userId = customValues![0];

            const target = parseInt(customValues![1]);

            if (userId === member.user.id) {
              ctx.waitUntil(
                merge.confirmed({
                  token,
                  target,
                  guildId,

                  userId: member.user.id,
                })
              );

              return discord.Message.spinner()
                .setType(discord.MessageType.Update)
                .send();
            }

            throw new NoPermissionError();
          }
          case 'steal': {
            const targetUserId = customValues![0];

            const characterId = customValues![1];

            const chance = parseInt(customValues![2]);

            ctx.waitUntil(
              steal.attempt({
                token,
                guildId,
                targetUserId,
                userId: member.user.id,
                characterId,
                pre: chance,
              })
            );

            return new discord.Message()
              .addEmbed(
                new discord.Embed().setImageUrl(`${config.origin}/steal2.gif`)
              )
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'passign': {
            const userId = customValues![0];

            const characterId = customValues![1];

            if (userId === member.user.id) {
              ctx.waitUntil(
                party.assign({
                  token,
                  userId: member.user.id,
                  guildId,
                  id: characterId,
                })
              );

              return discord.Message.spinner(true)
                .setType(discord.MessageType.Update)
                .send();
            }

            throw new NoPermissionError();
          }
          case 'install': {
            const id = customValues![0];

            return (
              await packs.install({
                id,
                guildId,
                userId: member.user.id,
              })
            ).send();
          }
          case 'uninstall': {
            const id = customValues![0];

            const userId = customValues![1];

            if (userId === member.user.id) {
              return (
                await packs.uninstall({
                  id,
                  guildId,
                  userId: member.user.id,
                })
              )
                .setType(discord.MessageType.Update)
                .send();
            }

            throw new NoPermissionError();
          }
          case 'options': {
            const type = customValues![0];

            switch (type) {
              case 'dupes':
                return (
                  await serverOptions.invertDupes({
                    guildId,
                    userId: member.user.id,
                  })
                )
                  .setType(discord.MessageType.Update)
                  .send();
              default:
                break;
            }
            break;
          }
          case 'cancel': {
            const userId = customValues![0];

            const targetId = customValues![1];

            if (userId && !targetId && userId !== member.user.id) {
              throw new NoPermissionError();
            }

            if (
              userId &&
              targetId &&
              ![userId, targetId].includes(member.user.id)
            ) {
              throw new NoPermissionError();
            }

            return new discord.Message()
              .setContent('')
              .addEmbed(
                new discord.Embed().setDescription(
                  targetId === member.user.id
                    ? i18n.get('declined', locale)
                    : i18n.get('cancelled', locale)
                )
              )
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'reward': {
            const item = customValues![0];

            const userId = customValues![1];

            const targetId = customValues![2];

            const amount = parseInt(customValues![3]);

            if (userId && userId !== member.user.id) {
              throw new NoPermissionError();
            }

            switch (item) {
              case 'pulls': {
                return (
                  await reward.confirmPulls({
                    amount,
                    guildId,
                    targetId,
                    userId,
                    token,
                  })
                )
                  .setType(discord.MessageType.Defer)
                  .send();
              }
              default:
                break;
            }
            break;
          }
          default:
            break;
        }
        break;
      default:
        break;
    }
  } catch (err) {
    if (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err as any).response?.status === 404 ||
      (err as Error)?.message === '404' ||
      (err as Error).message?.toLowerCase?.() === 'not found'
    ) {
      return new discord.Message()
        .setContent('')
        .setFlags(discord.MessageFlags.Ephemeral)
        .addEmbed(
          new discord.Embed().setDescription(i18n.get('found-nothing', locale))
        )
        .send();
    }

    if (err instanceof NonFetalError) {
      return new discord.Message()
        .setFlags(discord.MessageFlags.Ephemeral)
        .setContent('')
        .setType(discord.MessageType.New)
        .addEmbed(new discord.Embed().setDescription(err.message))
        .send();
    }

    if (err instanceof NoPermissionError) {
      return new discord.Message()
        .setContent('')
        .setFlags(discord.MessageFlags.Ephemeral)
        .addEmbed(
          new discord.Embed().setDescription(
            i18n.get('invalid-permission', locale)
          )
        )
        .send();
    }

    if (!config.sentry) {
      throw err;
    }

    const refId = utils.captureException(err as Error, {
      extra: { ...interaction },
    });

    return discord.Message.internal(refId).send();
  }

  return new discord.Message()
    .setContent(i18n.get('unimplemented', locale))
    .setFlags(discord.MessageFlags.Ephemeral)
    .send();
};
