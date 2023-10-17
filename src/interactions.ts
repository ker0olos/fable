import * as discord from './discord.ts';

import search, { idPrefix } from './search.ts';

import i18n from './i18n.ts';
import user from './user.ts';
import party from './party.ts';
import packs from './packs.ts';
import utils from './utils.ts';
import gacha from './gacha.ts';
import trade from './trade.ts';
import steal from './steal.ts';
import shop from './shop.ts';
import battle from './battle.ts';
import help from './help.ts';

import merge from './merge.ts';

import webhooks from './webhooks.ts';
import community from './community.ts';

import config, { initConfig } from './config.ts';

import db from '../db/mod.ts';

import { NonFetalError, NoPermissionError } from './errors.ts';

import type { Character, Media } from './types.ts';

export const handler = async (r: Request) => {
  const { origin } = new URL(r.url);

  const { error } = await utils.validateRequest(r, {
    POST: {
      headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
    },
  });

  if (error) {
    return utils.json(
      { error: error.message },
      { status: error.status },
    );
  }

  // deno-lint-ignore no-non-null-assertion
  const signature = r.headers.get('X-Signature-Ed25519')!;

  // deno-lint-ignore no-non-null-assertion
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
      { status: 401 },
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
    resolved,
    subcommand,
    customType,
    customValues,
  } = interaction;

  const ts = Date.now() - parseInt(timestamp) * 1000;

  // exceeded time limit set by discord (3 seconds)
  if (ts >= 2800) {
    return Response.error();
  }

  if (type === discord.InteractionType.Ping) {
    return discord.Message.pong();
  }

  if (!config.global) {
    return new discord.Message()
      .setFlags(discord.MessageFlags.Ephemeral)
      .addEmbed(
        new discord.Embed().setDescription(
          i18n.get('global-maintenance', locale),
        ),
      )
      .send();
  }

  config.origin = origin;

  if (guildId) {
    user.cachedGuilds[guildId] = {
      // deno-lint-ignore no-non-null-assertion
      locale: guildLocale!,
    };
  }

  if (member?.user?.id) {
    // cache the user's locale into a global variable
    user.cachedUsers[member.user.id] = {
      // deno-lint-ignore no-non-null-assertion
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
          (
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
            ]
              .includes(name)
          ) ||
          (
            ['collection', 'coll', 'mm'].includes(name) &&
            subcommand === 'media'
          )
        ) {
          // deno-lint-ignore no-non-null-assertion
          const title = options[focused!] as string;

          const message = new discord.Message(
            discord.MessageType.Suggestions,
          );

          const results = await packs.searchMany<Media>({
            guildId,
            key: 'media',
            search: title,
            threshold: 45,
          });

          results
            ?.forEach((media) => {
              const format = packs.formatToString(media.format);

              if (packs.isDisabled(`${media.packId}:${media.id}`, guildId)) {
                return;
              }

              message.addSuggestions({
                name: `${packs.aliasToArray(media.title)[0]}${
                  format ? ` (${format})` : ''
                }`,
                value: `${idPrefix}${media.packId}:${media.id}`,
              });
            });

          return message.send();
        }

        // suggest characters
        if (
          [
            'char',
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
          // deno-lint-ignore no-non-null-assertion
          const name = options[focused!] as string;

          const message = new discord.Message(
            discord.MessageType.Suggestions,
          );

          const results = await packs.searchMany<Character>({
            guildId,
            threshold: 65,
            key: 'characters',
            search: name,
          }).then((characters) =>
            Promise.all(
              characters.map((character) =>
                packs.aggregate<Character>({ character, guildId })
              ),
            )
          );

          results?.sort((a, b) => {
            const aP = a.popularity ?? a.media?.edges[0]?.node.popularity ?? 0;
            const bP = b.popularity ?? b.media?.edges[0]?.node.popularity ?? 0;

            return bP - aP;
          }).forEach((char) => {
            const media = char.media?.edges?.[0]?.node;

            const mediaTitle = media
              ? `(${packs.aliasToArray(media.title)[0]})`
              : '';

            if (
              packs.isDisabled(`${char.packId}:${char.id}`, guildId) ||
              (
                media &&
                packs.isDisabled(`${media.packId}:${media.id}`, guildId)
              )
            ) {
              return;
            }

            message.addSuggestions({
              name: `${packs.aliasToArray(char.name)[0]} ${mediaTitle}`.trim(),
              value: `${idPrefix}${char.packId}:${char.id}`,
            });
          });

          return message.send();
        }

        // suggest installed community packs
        if (
          // deno-lint-ignore no-non-null-assertion
          name === 'community' && ['uninstall'].includes(subcommand!)
        ) {
          // deno-lint-ignore no-non-null-assertion
          const id = options[focused!] as string;

          const message = new discord.Message(
            discord.MessageType.Suggestions,
          );

          let list = await packs.all({
            filter: true,
            guildId,
          });

          const distance: Record<string, number> = {};

          // sort suggestion based on distance
          list.forEach(({ manifest }) => {
            const d = utils.distance(manifest.id, id);

            if (manifest.title) {
              const d2 = utils.distance(manifest.title, id);

              if (d > d2) {
                distance[manifest.id] = d2;
                return;
              }
            }

            distance[manifest.id] = d;
          });

          list = list.sort((a, b) =>
            distance[b.manifest.id] - distance[a.manifest.id]
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
              return (await search.mediaCharacters({
                guildId,
                index: 0,
                search: title,
                userId: member.user.id,
                id: title.startsWith(idPrefix)
                  ? title.substring(idPrefix.length)
                  : undefined,
              })).send();
            }

            return search.media({
              token,
              guildId,
              search: title,
              debug: Boolean(options['debug']),
              id: title.startsWith(idPrefix)
                ? title.substring(idPrefix.length)
                : undefined,
            })
              .send();
          }
          case 'character':
          case 'char': {
            const name = options['name'] as string;

            return search.character({
              token,
              guildId,
              search: name,
              debug: Boolean(options['debug']),
              id: name.startsWith(idPrefix)
                ? name.substring(idPrefix.length)
                : undefined,
            }).send();
          }
          case 'party':
          case 'team':
          case 'p': {
            const spot = options['spot'] as number;
            const character = options['name'] as string;

            // deno-lint-ignore no-non-null-assertion
            switch (subcommand!) {
              case 'assign':
                return party.assign({
                  token,
                  spot,
                  userId: member.user.id,
                  guildId,
                  search: character,
                  id: character.startsWith(idPrefix)
                    ? character.substring(idPrefix.length)
                    : undefined,
                }).send();
              case 'swap':
                return party.swap({
                  token,
                  guildId,
                  userId: member.user.id,
                  a: options['a'] as number,
                  b: options['b'] as number,
                }).send();
              case 'remove':
                return party.remove({
                  token,
                  spot,
                  guildId,
                  userId: member.user.id,
                }).send();
              default: {
                const user = options['user'] as string ?? member.user.id;

                return party.view({
                  token,
                  guildId,
                  userId: user,
                }).send();
              }
            }
          }
          case 'collection':
          case 'coll':
          case 'mm': {
            const userId = options['user'] as string ?? member.user.id;

            // deno-lint-ignore no-non-null-assertion
            switch (subcommand!) {
              case 'stars': {
                const rating = options['rating'] as number;

                return user.list({
                  token,
                  userId,
                  guildId,
                  rating,
                  index: 0,
                  nick: userId !== member.user.id,
                }).send();
              }
              case 'media': {
                const title = options['title'] as string;

                return user.list({
                  token,
                  userId,
                  guildId,
                  index: 0,
                  search: title,
                  id: title.startsWith(idPrefix)
                    ? title.substring(idPrefix.length)
                    : undefined,
                  nick: userId !== member.user.id,
                }).send();
              }
              case 'sum': {
                return user.sum({
                  token,
                  userId,
                  guildId,
                  nick: userId !== member.user.id,
                }).send();
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

            return user.like({
              token,
              search,
              guildId,

              userId: member.user.id,
              undo: name === 'unlike',
              id: search.startsWith(idPrefix)
                ? search.substring(idPrefix.length)
                : undefined,
            })
              .send();
          }
          case 'likeall':
          case 'unlikeall': {
            const search = options['title'] as string;

            return user.likeall({
              token,
              search,
              guildId,

              userId: member.user.id,
              undo: name === 'unlikeall',
              id: search.startsWith(idPrefix)
                ? search.substring(idPrefix.length)
                : undefined,
            })
              .send();
          }
          case 'likes':
          case 'likeslist': {
            const userId = options['user'] as string ?? member.user.id;

            const filter = options['filter'] as boolean | undefined;

            return user.likeslist({
              token,
              guildId,
              userId,
              index: 0,
              nick: userId !== member.user.id,
              filter,
            }).send();
          }
          case 'found':
          case 'owned': {
            const title = options['title'] as string;

            return search.mediaFound({
              token,
              guildId,
              index: 0,
              search: title,
              userId: member.user.id,
              id: title.startsWith(idPrefix)
                ? title.substring(idPrefix.length)
                : undefined,
            })
              .send();
          }
          case 'trade':
          case 'offer':
          case 'give':
          case 'gift': {
            const giveCharacters = [
              options['give'] as string,
              options['give2'] as string,
              options['give3'] as string,
            ].filter(Boolean);

            const takeCharacters = [
              options['take'] as string,
              options['take2'] as string,
              options['take3'] as string,
            ].filter(Boolean);

            const message = trade.pre({
              token,
              guildId,

              userId: member.user.id,
              targetId: options['user'] as string,
              give: giveCharacters,
              take: takeCharacters,
            });

            if (!takeCharacters?.length) {
              message.setFlags(discord.MessageFlags.Ephemeral);
            }

            return message.send();
          }
          case 'steal': {
            const search = options['name'] as string;

            return steal.pre({
              token,
              guildId,
              userId: member.user.id,
              search,
              id: search.startsWith(idPrefix)
                ? search.substring(idPrefix.length)
                : undefined,
            })
              .setFlags(discord.MessageFlags.Ephemeral)
              .send();
          }
          case 'now':
          case 'vote':
          case 'tu': {
            return (await user.now({
              userId: member.user.id,
              guildId,
              token,
            }))
              .send();
          }
          case 'guaranteed':
          case 'gacha':
          case 'pull':
          case 'w':
          case 'q': {
            const stars = options['stars'] as number | undefined;

            return gacha
              .start({
                token,
                guildId,
                guarantee: stars,
                quiet: name === 'q',
                userId: member.user.id,
              })
              .send();
          }
          case 'nick': {
            const name = options['character'] as string;

            const nick = options['new_nick'] as string | undefined;

            return user.nick({
              nick,
              token,
              guildId,
              search: name,
              userId: member.user.id,
              id: name.startsWith(idPrefix)
                ? name.substring(idPrefix.length)
                : undefined,
            }).send();
          }
          case 'image':
          case 'custom': {
            const name = options['character'] as string;

            const image = options['new_image'] as string | undefined;

            return user.image({
              image,
              token,
              guildId,

              search: name,
              userId: member.user.id,
              id: name.startsWith(idPrefix)
                ? name.substring(idPrefix.length)
                : undefined,
            }).send();
          }
          case 'synthesize':
          case 'merge': {
            const target = options['target'] as number;

            return (await merge.synthesize({
              token,
              guildId,
              userId: member.user.id,
              mode: 'target',
              target,
            })).send();
          }
          case 'automerge': {
            // deno-lint-ignore no-non-null-assertion
            switch (subcommand!) {
              case 'min':
              case 'max':
                return (await merge.synthesize({
                  token,
                  guildId,
                  userId: member.user.id,
                  mode: subcommand,
                })).send();
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
                return shop.guaranteed({
                  userId: member.user.id,
                  stars: options['stars'] as number,
                }).send();
              case 'normal':
                return shop.normal({
                  userId: member.user.id,
                  amount: options['amount'] as number,
                }).send();
              default:
                break;
            }
            break;
          }
          case 'packs': {
            return (await packs.pages({
              guildId,
              userId: member.user.id,
              index: 0,
            })).send();
          }
          case 'community': {
            //deno-lint-ignore no-non-null-assertion
            switch (subcommand!) {
              case 'popular': {
                return (await community.popularPacks({
                  guildId,
                  userId: member.user.id,
                  index: 0,
                }))
                  .setFlags(discord.MessageFlags.Ephemeral)
                  .send();
              }
              case 'install': {
                const id = options['id'] as string;

                return (await packs.install({
                  id,
                  guildId,
                  userId: member.user.id,
                }))
                  .send();
              }
              case 'uninstall': {
                const list = await packs.all({
                  filter: true,
                  guildId,
                });

                const pack = list.find(({ manifest }) =>
                  manifest.id === options['id'] as string
                );

                if (!pack) {
                  throw new Error('404');
                }

                return packs.uninstallDialog({
                  userId: member.user.id,
                  pack,
                })
                  .send();
              }
              default:
                break;
            }
            break;
          }
          case 'help':
          case 'start':
          case 'guide':
          case 'wiki':
          case 'tuto': {
            const index = options['page'] as number || 0;

            return help.pages({ userId: member.user.id, index }).send();
          }
          case 'stats': {
            const character = options['name'] as string;

            const distribution = options['distribution'] as string;

            return battle.stats({
              token,
              guildId,
              character,
              distribution,
              userId: member.user.id,
            }).send();
          }
          case 'experimental': {
            //deno-lint-ignore no-non-null-assertion
            switch (subcommand!) {
              case 'battle': {
                const targetId = options['versus'] as string;

                return battle.experimental({
                  token,
                  guildId,
                  user: member.user,
                  // deno-lint-ignore no-non-null-assertion
                  target: resolved!.users![targetId],
                })
                  .send();
              }
              default:
                break;
            }
            break;
          }
          case 'logs': {
            const userId = options['user'] as string ?? member.user.id;

            return user.logs({
              token,
              guildId,
              userId,
              nick: userId !== member.user.id,
            }).send();
          }
          default: {
            break;
          }
        }
        break;
      case discord.InteractionType.Component:
        switch (customType) {
          case 'media': {
            // deno-lint-ignore no-non-null-assertion
            const id = customValues![0];

            return search.media({ id, guildId, token })
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'character': {
            // deno-lint-ignore no-non-null-assertion
            const id = customValues![0];

            // deno-lint-ignore no-non-null-assertion
            const type = customValues![1];

            return search.character({
              id,
              token,
              guildId,
            })
              .setType(
                type === '1'
                  ? discord.MessageType.New
                  : discord.MessageType.Update,
              )
              .send();
          }
          case 'mcharacters': {
            // deno-lint-ignore no-non-null-assertion
            const mediaId = customValues![0];

            // deno-lint-ignore no-non-null-assertion
            const index = parseInt(customValues![1]);

            return (await search.mediaCharacters({
              index,
              userId: member.user.id,
              guildId,
              id: mediaId,
            }))
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'list': {
            // deno-lint-ignore no-non-null-assertion
            const userId = customValues![0];

            const mediaId = customValues?.[1] || undefined;

            // deno-lint-ignore no-non-null-assertion
            const rating = parseInt(customValues![2]);

            // deno-lint-ignore no-non-null-assertion
            const index = parseInt(customValues![3]);

            return user.list({
              token,
              index,
              guildId,
              userId,
              rating,
              id: mediaId,
            })
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'like': {
            // deno-lint-ignore no-non-null-assertion
            const id = customValues![0];

            return user.like({
              id,
              token,
              guildId,
              mention: true,
              userId: member.user.id,
              undo: false,
            })
              .send();
          }
          case 'likes': {
            // deno-lint-ignore no-non-null-assertion
            const userId = customValues![0];

            // deno-lint-ignore no-non-null-assertion
            const filter = customValues![1] === '1';

            // deno-lint-ignore no-non-null-assertion
            const index = parseInt(customValues![2]);

            return user.likeslist({
              index,
              token,
              userId,
              guildId,
              filter,
            })
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'found': {
            // deno-lint-ignore no-non-null-assertion
            const id = customValues![0];
            // deno-lint-ignore no-non-null-assertion
            const index = parseInt(customValues![1]);

            return search.mediaFound({
              id,
              token,
              guildId,
              userId: member.user.id,
              index,
            })
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'q':
          case 'pull':
          case 'gacha': {
            // deno-lint-ignore no-non-null-assertion
            const stars = utils.parseInt(customValues![1]);

            return gacha
              .start({
                token,
                guildId,
                mention: true,
                guarantee: stars,
                quiet: customType === 'q',
                userId: member.user.id,
              }).send();
          }
          case 'now': {
            return (await user.now({
              mention: true,
              userId: member.user.id,
              guildId,
              token,
            })).send();
          }
          case 'help': {
            // deno-lint-ignore no-non-null-assertion
            const index = parseInt(customValues![1]);

            return help.pages({ userId: member.user.id, index })
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'buy': {
            // deno-lint-ignore no-non-null-assertion
            const item = customValues![0];

            // deno-lint-ignore no-non-null-assertion
            const userId = customValues![1];

            // deno-lint-ignore no-non-null-assertion
            const value = parseInt(customValues![2]);

            if (userId === member.user.id) {
              switch (item) {
                case 'bguaranteed':
                  return shop.guaranteed({
                    userId: member.user.id,
                    stars: value,
                  })
                    .setType(discord.MessageType.Update)
                    .send();
                case 'guaranteed':
                  return (await shop.confirmGuaranteed({
                    token,
                    guildId,
                    userId: member.user.id,
                    stars: value,
                  }))
                    .setType(discord.MessageType.Update)
                    .send();
                case 'normal':
                  return (await shop.confirmNormal({
                    token,
                    guildId,
                    userId: member.user.id,
                    amount: value,
                  }))
                    .setType(discord.MessageType.Update)
                    .send();
                default:
                  break;
              }
            }

            throw new NoPermissionError();
          }
          case 'give': {
            // deno-lint-ignore no-non-null-assertion
            const userId = customValues![0];

            // deno-lint-ignore no-non-null-assertion
            const targetId = customValues![1];

            // deno-lint-ignore no-non-null-assertion
            const giveCharactersIds = customValues![2].split('&');

            if (userId === member.user.id) {
              return trade.give({
                token,
                userId,
                guildId,

                targetId: targetId,
                giveCharactersIds,
              })
                .setType(discord.MessageType.Update)
                .send();
            }

            throw new NoPermissionError();
          }
          case 'trade': {
            // deno-lint-ignore no-non-null-assertion
            const userId = customValues![0];

            // deno-lint-ignore no-non-null-assertion
            const targetId = customValues![1];

            // deno-lint-ignore no-non-null-assertion
            const giveCharactersIds = customValues![2].split('&');

            // deno-lint-ignore no-non-null-assertion
            const takeCharactersIds = customValues![3].split('&');

            if (targetId === member.user.id) {
              return trade.accepted({
                token,
                guildId,

                userId,
                targetId,
                giveCharactersIds,
                takeCharactersIds,
              })
                .setType(discord.MessageType.Update)
                .send();
            }

            throw new NoPermissionError();
          }
          case 'synthesis': {
            // deno-lint-ignore no-non-null-assertion
            const userId = customValues![0];

            // deno-lint-ignore no-non-null-assertion
            const target = parseInt(customValues![1]);

            if (userId === member.user.id) {
              return merge.confirmed({
                token,
                target,
                guildId,

                userId: member.user.id,
              })
                .setType(discord.MessageType.Update)
                .send();
            }

            throw new NoPermissionError();
          }
          case 'steal': {
            // deno-lint-ignore no-non-null-assertion
            const userId = customValues![0];

            // deno-lint-ignore no-non-null-assertion
            const characterId = customValues![1];

            // deno-lint-ignore no-non-null-assertion
            const chance = parseInt(customValues![2]);

            if (userId === member.user.id) {
              return steal.attempt({
                token,
                guildId,
                userId: member.user.id,
                characterId,
                pre: chance,
              })
                .setType(discord.MessageType.Update)
                .send();
            }

            throw new NoPermissionError();
          }
          case 'stats': {
            // deno-lint-ignore no-non-null-assertion
            const type = customValues![0];

            // deno-lint-ignore no-non-null-assertion
            const userId = customValues![1];

            // deno-lint-ignore no-non-null-assertion
            const characterId = customValues![2];

            if (userId === member.user.id) {
              switch (type) {
                case 'str':
                case 'sta':
                case 'agi':
                case 'reset':
                  return (await battle.updateStats({
                    type,
                    token,
                    guildId,
                    characterId,
                    userId: member.user.id,
                  }))
                    .setType(discord.MessageType.Update)
                    .send();
                default:
                  break;
              }
            }

            throw new NoPermissionError();
          }
          case 'packs': {
            // deno-lint-ignore no-non-null-assertion
            const index = parseInt(customValues![1]);

            return (await packs.pages({
              userId: member.user.id,
              guildId,
              index,
            }))
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'popular': {
            // deno-lint-ignore no-non-null-assertion
            const index = parseInt(customValues![1]);

            return (await community.popularPacks({
              userId: member.user.id,
              guildId,
              index,
            }))
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'install': {
            // deno-lint-ignore no-non-null-assertion
            const id = customValues![0];

            return (await packs.install({
              id,
              guildId,
              userId: member.user.id,
            }))
              .send();
          }
          case 'uninstall': {
            // deno-lint-ignore no-non-null-assertion
            const id = customValues![0];

            // deno-lint-ignore no-non-null-assertion
            const userId = customValues![1];

            if (userId === member.user.id) {
              return (await packs.uninstall({
                id,
                guildId,
                userId: member.user.id,
              }))
                .setType(discord.MessageType.Update)
                .send();
            }

            throw new NoPermissionError();
          }
          case 'cancel': {
            // deno-lint-ignore no-non-null-assertion
            const userId = customValues![0];

            // deno-lint-ignore no-non-null-assertion
            const targetId = customValues![1];

            if (userId && !targetId && userId !== member.user.id) {
              throw new NoPermissionError();
            }

            if (
              userId && targetId && ![userId, targetId].includes(member.user.id)
            ) {
              throw new NoPermissionError();
            }

            return new discord.Message()
              .setContent('')
              .addEmbed(new discord.Embed().setDescription(
                targetId === member.user.id
                  ? i18n.get('declined', locale)
                  : i18n.get('cancelled', locale),
              ))
              .setType(discord.MessageType.Update)
              .send();
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
      err.response?.status === 404 || err?.message === '404' ||
      err.message?.toLowerCase?.() === 'not found'
    ) {
      return new discord.Message()
        .setContent('')
        .setFlags(discord.MessageFlags.Ephemeral)
        .addEmbed(
          new discord.Embed().setDescription(
            i18n.get('found-nothing', locale),
          ),
        ).send();
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
            i18n.get('invalid-permission', locale),
          ),
        ).send();
    }

    if (!config.sentry) {
      throw err;
    }

    const refId = utils.captureException(err, {
      extra: { ...interaction },
    });

    return discord.Message.internal(refId).send();
  }

  return new discord.Message().setContent(
    i18n.get('unimplemented', locale),
  )
    .setFlags(discord.MessageFlags.Ephemeral)
    .send();
};

if (import.meta.main) {
  await initConfig();

  utils.initSentry({ dsn: config.sentry });

  utils.serve({
    '/': handler,
    '/webhooks/topgg': webhooks.topgg,
    '/community/publish': community.publish,
    '/community': community.query,
    '/external/*': utils.handleProxy,
    '/assets/:filename+': utils.serveStatic('../assets/public', {
      baseUrl: import.meta.url,
    }),
    //
    '/stats': async () => {
      return utils.json({
        server_count: (await db.getValues({ prefix: ['guilds'] })).length,
      }, { status: 200 });
    },
    '/invite': () =>
      Response.redirect(
        `https://discord.com/api/oauth2/authorize?client_id=${config.appId}&scope=applications.commands`,
      ),
    '/robots.txt': () => {
      return new Response(
        'User-agent: *\nDisallow: /',
        { headers: { 'content-type': 'text/plain' } },
      );
    },
  });
}
