import * as discord from './discord.ts';

import search, { idPrefix } from './search.ts';

import user from './user.ts';
import party from './party.ts';
import packs from './packs.ts';
import utils from './utils.ts';
import gacha from './gacha.ts';
import trade from './trade.ts';
import steal from './steal.ts';
import shop from './shop.ts';
import help from './help.ts';

import synthesis from './synthesis.ts';

import demo from './demo.tsx';

import webhooks from './webhooks.ts';

import config, { initConfig } from './config.ts';

import { Character, Media, PackType } from './types.ts';

import { NonFetalError, NoPermissionError } from './errors.ts';

export const handler = async (r: Request) => {
  const { origin } = new URL(r.url);

  // redirect to /demo on browsers
  if (
    r.method === 'GET' &&
    r.headers.get('accept')?.includes('text/html')
  ) {
    return Response.redirect(`${origin}/demo`);
  }

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

  const signature = r.headers.get('X-Signature-Ed25519') || undefined;
  const timestamp = r.headers.get('X-Signature-Timestamp') || undefined;

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
    token,
    channelId,
    guildId,
    focused,
    member,
    channel,
    options,
    subcommand,
    customType,
    customValues,
  } = interaction;

  if (type === discord.InteractionType.Ping) {
    return discord.Message.pong();
  }

  config.origin = origin;

  packs.cachedChannels[channelId] = channel;

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

          results?.forEach((media) => {
            const format = packs.formatToString(media.format);

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
            'trade',
            'offer',
            'steal',
            'nick',
            'image',
            'custom',
            'like',
            'unlike',
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
                packs.aggregate<Character>({
                  character,
                  guildId,
                })
              ),
            )
          );

          results?.sort((a, b) => {
            const aP = a.popularity ?? a.media?.edges[0]?.node.popularity ?? 0;
            const bP = b.popularity ?? b.media?.edges[0]?.node.popularity ?? 0;

            return bP - aP;
          }).forEach((char) => {
            const media = char.media?.edges.length
              ? ` (${packs.aliasToArray(char.media.edges[0].node.title)[0]})`
              : '';

            message.addSuggestions({
              name: `${packs.aliasToArray(char.name)[0]}${media}`,
              value: `${idPrefix}${char.packId}:${char.id}`,
            });
          });

          return message.send();
        }

        // suggest installed packs
        if (
          // deno-lint-ignore no-non-null-assertion
          name === 'packs' && ['update', 'uninstall'].includes(subcommand!)
        ) {
          // deno-lint-ignore no-non-null-assertion
          const id = options[focused!] as string;

          const message = new discord.Message(
            discord.MessageType.Suggestions,
          );

          let list = await packs.all({ guildId, type: PackType.Community });

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
          case 'media': {
            const title = options['title'] as string;

            if (options['characters']) {
              return (await search.mediaCharacters({
                channelId,
                guildId,
                index: 0,
                search: title,
                id: title.startsWith(idPrefix)
                  ? title.substring(idPrefix.length)
                  : undefined,
              })).send();
            }

            return search.media({
              token,
              guildId,
              channelId,
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
              channelId,
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
                return (await party.assign({
                  spot,
                  userId: member.user.id,
                  guildId,
                  channelId,
                  search: character,
                  id: character.startsWith(idPrefix)
                    ? character.substring(idPrefix.length)
                    : undefined,
                })).send();
              case 'swap':
                return (await party.swap({
                  guildId,
                  channelId,
                  userId: member.user.id,
                  a: options['a'] as number,
                  b: options['b'] as number,
                })).send();
              case 'remove':
                return (await party.remove({
                  spot,
                  guildId,
                  channelId,
                  userId: member.user.id,
                })).send();
              default: {
                const user = options['user'] as string ?? member.user.id;

                return party.view({
                  token,
                  guildId,
                  channelId,
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
              channelId,
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
              channelId,
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

            return user.likeslist({
              token,
              guildId,
              userId,
              index: 0,
              nick: userId !== member.user.id,
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
              channelId,
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

            return (await steal.pre({
              token,
              guildId,
              channelId,
              userId: member.user.id,
              search,
              id: search.startsWith(idPrefix)
                ? search.substring(idPrefix.length)
                : undefined,
            }))
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
                channelId,
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
              channelId,
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
              channelId,
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

            return synthesis.synthesize({
              token,
              target,
              guildId,
              channelId,
              userId: member.user.id,
            }).send();
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
            //deno-lint-ignore no-non-null-assertion
            switch (subcommand!) {
              case 'builtin':
              case 'community': {
                return (await packs.pages({
                  type: subcommand as PackType,
                  index: 0,
                  guildId,
                })).setFlags(discord.MessageFlags.Ephemeral).send();
              }
              case 'install':
              case 'validate': {
                return packs.install({
                  token,
                  guildId,
                  shallow: subcommand === 'validate',
                  url: options['github'] as string,
                })
                  .setFlags(discord.MessageFlags.Ephemeral)
                  .send();
              }
              case 'update':
              case 'uninstall': {
                const list = await packs.all({
                  type: PackType.Community,
                  guildId,
                });

                const pack = list.find(({ manifest }) =>
                  manifest.id === options['id'] as string
                );

                if (!pack) {
                  throw new Error('404');
                }

                if (subcommand === 'update') {
                  return packs.install({ token, guildId, id: pack.id })
                    .setFlags(discord.MessageFlags.Ephemeral)
                    .send();
                }

                return packs.uninstallDialog(pack)
                  .setFlags(discord.MessageFlags.Ephemeral)
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
          case 'tuto': {
            const index = options['page'] as number || 0;

            return help.pages({ userId: member.user.id, index }).send();
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
          case 'anilist': {
            // deno-lint-ignore no-non-null-assertion
            return (await packs.anilist(subcommand!, interaction))!
              .send();
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

            return search.media({ id, guildId, channelId, token })
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
              channelId,
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
              guildId,
              channelId,
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
              channelId,
              userId: member.user.id,
              undo: false,
            })
              .send();
          }
          case 'likes': {
            // deno-lint-ignore no-non-null-assertion
            const userId = customValues![0];

            // deno-lint-ignore no-non-null-assertion
            const index = parseInt(customValues![1]);

            return user.likeslist({
              index,
              token,
              userId,
              guildId,
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
              token,
              id,
              guildId,
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
                channelId,
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
                channelId,
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
                channelId,
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
              return synthesis.confirmed({
                token,
                target,
                guildId,
                channelId,
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
                channelId,
                userId: member.user.id,
                characterId,
                pre: chance,
              })
                .setType(discord.MessageType.Update)
                .send();
            }

            throw new NoPermissionError();
          }
          case 'builtin':
          case 'community': {
            // deno-lint-ignore no-non-null-assertion
            const index = parseInt(customValues![1]);

            return (await packs.pages({
              index,
              guildId,
              type: customType as PackType,
            }))
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'puninstall': {
            const list = await packs.all({
              type: PackType.Community,
              guildId,
            });

            const pack = list.find(({ manifest }) =>
              // deno-lint-ignore no-non-null-assertion
              manifest.id === customValues![0]
            );

            if (!pack) {
              throw new Error('404');
            }

            return packs.uninstallDialog(pack)
              .setFlags(discord.MessageFlags.Ephemeral)
              .send();
          }
          case 'uninstall': {
            // deno-lint-ignore no-non-null-assertion
            const manifestId = customValues![0];

            return (await packs.uninstall({
              guildId,
              manifestId,
            }))
              .setFlags(discord.MessageFlags.Ephemeral)
              .setType(discord.MessageType.Update)
              .send();
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
                targetId === member.user.id ? 'Declined' : 'Cancelled',
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
            'Found _nothing_ matching that query!',
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
            'You don\'t permission to complete this interaction!',
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

  return new discord.Message().setContent(`Unimplemented or removed.`)
    .setFlags(discord.MessageFlags.Ephemeral)
    .send();
};

function override(
  age: number,
  type?: string,
): (req: Request, res: Response) => Response {
  return (_: Request, response: Response): Response => {
    if (type) {
      response.headers.set('Content-Type', type);
    }

    response.headers.set('Cache-Control', `public, max-age=${age}`);

    return response;
  };
}

if (import.meta.main) {
  await initConfig();

  utils.initSentry({ dsn: config.sentry });

  utils.serve({
    '/': handler,
    '/demo': demo,
    '/webhooks/topgg': webhooks.topgg,
    '/invite': () =>
      Response.redirect(
        `https://discord.com/api/oauth2/authorize?client_id=${config.appId}&scope=applications.commands%20bot`,
      ),
    '/external/*': (r) => {
      const { pathname, search } = new URL(r.url);

      return Response.redirect(
        `${config.imageProxyUrl}/${
          pathname.substring('/external/'.length)
        }${search}`,
      );
    },
    '/assets/:filename+': utils.serveStatic('../assets/public', {
      intervene: override(86400),
      baseUrl: import.meta.url,
    }),
    '/:filename+': utils.serveStatic('../json', {
      intervene: override(86400, 'application/schema+json'),
      baseUrl: import.meta.url,
    }),
  });
}
