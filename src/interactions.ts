import * as discord from './discord.ts';

import search, { idPrefix } from './search.ts';

import user from './user.ts';
import party from './party.ts';
import packs from './packs.ts';
import utils from './utils.ts';
import gacha from './gacha.ts';
import trade from './trade.ts';
import help from './help.ts';

import demo from './demo.tsx';

import webhooks from './webhooks.ts';

import config, { initConfig } from './config.ts';

import { Character, Media, PackType } from './types.ts';

import {
  NonFetalCancelableError,
  NonFetalError,
  NoPermissionError,
} from './errors.ts';

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
    guildId,
    focused,
    resolved,
    member,
    options,
    subcommand,
    customType,
    customValues,
  } = interaction;

  if (type === discord.InteractionType.Ping) {
    return discord.Message.pong();
  }

  config.origin = origin;

  try {
    switch (type) {
      case discord.InteractionType.Partial: {
        if (!name) {
          break;
        }

        // suggest media
        if (
          (
            ['search', 'anime', 'manga', 'media', 'found', 'obtained', 'owned']
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
          });

          results?.forEach((media) => {
            message.addSuggestions({
              name: `${packs.aliasToArray(media.title)[0]}`,
              value: `${idPrefix}${media.packId}:${media.id}`,
            });
          });

          return message.send();
        }

        // suggest characters
        if (
          [
            'character',
            'char',
            'im',
            'trade',
            'offer',
            'give',
            'nick',
            'image',
            'custom',
            'party',
            'team',
            'p',
          ].includes(name)
        ) {
          // deno-lint-ignore no-non-null-assertion
          const name = options[focused!] as string;

          const message = new discord.Message(
            discord.MessageType.Suggestions,
          );

          const results = await packs.searchMany<Character>({
            guildId,
            key: 'characters',
            search: name,
          });

          results?.forEach((character) => {
            message.addSuggestions({
              name: `${packs.aliasToArray(character.name)[0]}`,
              value: `${idPrefix}${character.packId}:${character.id}`,
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
          case 'char':
          case 'im': {
            const name = options['name'] as string;

            return search.character({
              token,
              userId: member.user.id,
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
              case 'view': {
                const user = options['user'] as string;

                return party.view({
                  token,
                  userId: user,
                  guildId,
                }).send();
              }
              case 'assign':
                return (await party.assign({
                  spot,
                  userId: member.user.id,
                  guildId,
                  search: character,
                  id: character.startsWith(idPrefix)
                    ? character.substring(idPrefix.length)
                    : undefined,
                })).send();
              case 'swap':
                return (await party.swap({
                  a: options['a'] as number,
                  b: options['b'] as number,
                  userId: member.user.id,
                  guildId,
                })).send();
              case 'remove':
                return (await party.remove({
                  spot,
                  userId: member.user.id,
                  guildId,
                })).send();
              default:
                break;
            }
            break;
          }
          case 'collection':
          case 'coll':
          case 'mm': {
            const userId = options['user'] as string;

            const nick = userId
              ? discord.getUsername(
                // deno-lint-ignore no-non-null-assertion
                resolved!.members![userId],
                // deno-lint-ignore no-non-null-assertion
                resolved!.users![userId],
              )
              : undefined;

            // deno-lint-ignore no-non-null-assertion
            switch (subcommand!) {
              case 'stars': {
                const stars = options['rating'] as number;

                return (await user.stars({
                  userId: userId ?? member.user.id,
                  stars,
                  guildId,
                  nick,
                }))
                  .send();
              }
              case 'media': {
                const title = options['title'] as string;

                return (await user.media({
                  search: title,
                  userId: userId ?? member.user.id,
                  id: title.startsWith(idPrefix)
                    ? title.substring(idPrefix.length)
                    : undefined,
                  guildId,
                  nick,
                }))
                  .send();
              }
              case 'list': {
                const filter = options['filter'] as number | undefined;

                return user.list({
                  token,
                  filter,
                  userId: userId ?? member.user.id,
                  index: 0,
                  guildId,
                  nick,
                }).send();
              }
              default:
                break;
            }
            break;
          }
          case 'found':
          case 'obtained':
          case 'owned': {
            const title = options['title'] as string;

            return (await search.mediaFound({
              search: title,
              id: title.startsWith(idPrefix)
                ? title.substring(idPrefix.length)
                : undefined,
              guildId,
            }))
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

            return trade.pre({
              token,
              guildId,
              userId: member.user.id,
              targetId: options['user'] as string,
              give: giveCharacters,
              take: takeCharacters,
            }).send();
          }
          case 'now':
          case 'vote':
          case 'daily':
          case 'tu': {
            return (await user.now({
              userId: member.user.id,
              guildId,
              token,
            }))
              .send();
          }
          case 'gacha':
          case 'pull':
          case 'w':
          case 'q': {
            const stars = options['stars'] as number | undefined;

            return gacha
              .start({
                guarantee: stars,
                quiet: name === 'q',
                userId: member.user.id,
                guildId,
                token,
              })
              .send();
          }
          case 'nick':
          case 'image':
          case 'custom': {
            const name = options['name'] as string;

            const nick = options['new_nick'] as string | undefined;
            const image = options['new_image'] as string | undefined;

            return user.customize({
              nick,
              image,
              token,
              guildId,
              userId: member.user.id,
              search: name,
              id: name.startsWith(idPrefix)
                ? name.substring(idPrefix.length)
                : undefined,
            }).send();
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
            const index = options['page'] as number ?? 0;

            return help.pages({ userId: member.user.id, index }).send();
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
              token,
              userId: member.user.id,
              guildId,
              id,
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
            const index = parseInt(customValues![1]) || 0;

            return (await search.mediaCharacters({
              userId: member.user.id,
              id: mediaId,
              guildId,
              index,
            }))
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'passign': {
            // deno-lint-ignore no-non-null-assertion
            const characterId = customValues![0];

            return (await party.assign({
              id: characterId,
              userId: member.user.id,
              guildId,
            })).send();
          }
          case 'cstars': {
            // deno-lint-ignore no-non-null-assertion
            const stars = parseInt(customValues![0]);
            // deno-lint-ignore no-non-null-assertion
            const userId = customValues![1];
            // deno-lint-ignore no-non-null-assertion
            const anchor = customValues![2];
            // deno-lint-ignore no-non-null-assertion
            const action = customValues![3];

            return (await user.stars({
              stars,
              guildId,
              userId,
              after: action === 'next' ? anchor : undefined,
              before: action === 'prev' ? anchor : undefined,
            }))
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'cmedia': {
            // deno-lint-ignore no-non-null-assertion
            const id = customValues![0];
            // deno-lint-ignore no-non-null-assertion
            const userId = customValues![1];
            // deno-lint-ignore no-non-null-assertion
            const anchor = customValues![2];
            // deno-lint-ignore no-non-null-assertion
            const action = customValues![3];

            return (await user.media({
              id,
              guildId,
              userId,
              after: action === 'next' ? anchor : undefined,
              before: action === 'prev' ? anchor : undefined,
            }))
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'clist': {
            // deno-lint-ignore no-non-null-assertion
            const userId = customValues![0];

            // deno-lint-ignore no-non-null-assertion
            const filter = parseInt(customValues![1]);

            // deno-lint-ignore no-non-null-assertion
            const index = parseInt(customValues![2]);

            return user.list({
              token,
              index,
              filter,
              guildId,
              userId,
            })
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'found': {
            // deno-lint-ignore no-non-null-assertion
            const id = customValues![0];
            // deno-lint-ignore no-non-null-assertion
            const anchor = customValues![2];
            // deno-lint-ignore no-non-null-assertion
            const action = customValues![3];

            return (await search.mediaFound({
              id,
              guildId,
              after: action === 'next' ? anchor : undefined,
              before: action === 'prev' ? anchor : undefined,
            }))
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'q':
          case 'gacha': {
            return gacha
              .start({
                token,
                mention: true,
                quiet: customType === 'q',
                userId: member.user.id,
                guildId,
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
          case 'give': {
            // deno-lint-ignore no-non-null-assertion
            const userId = customValues![0];

            // deno-lint-ignore no-non-null-assertion
            const targetId = customValues![1];

            // deno-lint-ignore no-non-null-assertion
            const giveCharactersIds = customValues![2].split('&');

            if (userId === member.user.id) {
              const [updateMessage, newMessage] = await trade.give({
                userId,
                targetId: targetId,
                giveCharactersIds,
                guildId,
              });

              newMessage.followup(token);

              return updateMessage.setType(discord.MessageType.Update)
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
              const [updateMessage, newMessage] = await trade.accepted({
                userId,
                targetId,
                giveCharactersIds,
                takeCharactersIds,
                guildId,
              });

              newMessage.followup(token);

              return updateMessage.setType(discord.MessageType.Update)
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

    if (
      err instanceof NonFetalCancelableError || err instanceof NonFetalError
    ) {
      return new discord.Message()
        .setFlags(discord.MessageFlags.Ephemeral)
        .setContent('')
        .setType(
          err instanceof NonFetalCancelableError
            ? discord.MessageType.Update
            : discord.MessageType.New,
        )
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

  return new discord.Message().setContent(`Unimplemented`).send();
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
    '/external/*': utils.proxy,
    '/webhooks/topgg': webhooks.topgg,
    '/assets/:filename+': utils.serveStatic('../assets/public', {
      intervene: override(604800),
      baseUrl: import.meta.url,
    }),
    '/:filename+': utils.serveStatic('../json', {
      intervene: override(86400, 'application/schema+json'),
      baseUrl: import.meta.url,
    }),
  });
}
