import * as discord from './discord.ts';

import search from './search.ts';
import user from './user.ts';
import party from './party.ts';

import packs from './packs.ts';
import utils from './utils.ts';
import gacha from './gacha.ts';

import help from './help.ts';

import demo from './demo.tsx';

import webhooks from './webhooks.ts';

import config, { initConfig } from './config.ts';

import { Character, Media, PackType } from './types.ts';

import { NonFetalError, NoPermissionError } from './errors.ts';

const idPrefix = 'id=';

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
          ['search', 'anime', 'manga', 'media', 'obtained', 'owned', 'found']
            .includes(name) ||
          (['collection', 'coll', 'mm'].includes(name) &&
            subcommand === 'media')
        ) {
          const title = options['title'] as string;

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
        if (['character', 'char', 'im'].includes(name)) {
          const name = options['name'] as string;

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

        // same as suggest characters but filters out results that the user doesn't have
        if (['party', 'team', 'p'].includes(name) && subcommand === 'assign') {
          const name = options['name'] as string;

          const message = new discord.Message(
            discord.MessageType.Suggestions,
          );

          const results = await Promise.all([
            packs.searchMany<Character>({
              guildId,
              threshold: 35,
              key: 'characters',
              search: name,
            }),
            user.userCharacters({
              guildId,
              userId: member.user.id,
            }),
          ]);

          results?.[0].forEach((character) => {
            const id = `${character.packId}:${character.id}`;

            // filter out results that are not in the user's inventory
            if (results?.[1].some((character) => character.id === id)) {
              message.addSuggestions({
                name: `${packs.aliasToArray(character.name)[0]}`,
                value: `${idPrefix}${id}`,
              });
            }
          });

          return message.send();
        }

        // suggest installed packs
        if (name === 'packs' && subcommand === 'uninstall') {
          const id = options['id'] as string;

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

            return (await search.media({
              guildId,
              search: title,
              debug: Boolean(options['debug']),
              id: title.startsWith(idPrefix)
                ? title.substring(idPrefix.length)
                : undefined,
            }))
              .send();
          }
          case 'character':
          case 'char':
          case 'im': {
            const name = options['name'] as string;

            return (await search.character({
              userId: member.user.id,
              guildId,
              search: name,
              debug: Boolean(options['debug']),
              id: name.startsWith(idPrefix)
                ? name.substring(idPrefix.length)
                : undefined,
            }))
              .send();
          }
          case 'party':
          case 'team':
          case 'p': {
            const spot = options['spot'] as number;
            const character = options['name'] as string;

            // deno-lint-ignore no-non-null-assertion
            switch (subcommand!) {
              case 'view':
                return (await party.view({
                  userId: member.user.id,
                  guildId,
                })).send();
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

            const nick = userId && resolved?.members?.[userId]
              ? resolved.members[userId].nick ??
                // deno-lint-ignore no-non-null-assertion
                resolved.users![userId].username
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
              default:
                break;
            }
            break;
          }
          case 'obtained':
          case 'owned':
          case 'found': {
            const title = options['title'] as string;

            return (await search.mediaObtained({
              search: title,
              id: title.startsWith(idPrefix)
                ? title.substring(idPrefix.length)
                : undefined,
              guildId,
            }))
              .send();
          }
          case 'now':
          case 'checklist':
          case 'cl':
          case 'tu': {
            return (await user.now({
              userId: member.user.id,
              guildId,
            }))
              .send();
          }
          case 'gacha':
          case 'pull':
          case 'w':
          case 'q':
            return gacha
              .start({
                quiet: ['pull', 'q'].includes(name),
                userId: member.user.id,
                guildId,
                token,
              })
              .send();
          case 'packs': {
            //deno-lint-ignore no-non-null-assertion
            switch (subcommand!) {
              case 'builtin':
              case 'community': {
                return (await packs.pages({
                  type: subcommand as PackType,
                  index: 0,
                  guildId,
                })).send();
              }
              case 'install':
              case 'validate': {
                return packs.install({
                  token,
                  guildId,
                  userId: member.user.id,
                  shallow: subcommand === 'validate',
                  url: options['github'] as string,
                  ref: options['ref'] as string,
                }).send();
              }
              case 'uninstall': {
                const list = await packs.all({
                  type: PackType.Community,
                  guildId,
                });

                const target = list.find(({ manifest }) =>
                  manifest.id === options['id']
                );

                if (!target) {
                  throw new Error('404');
                }

                const message = new discord.Message()
                  .addEmbed(packs.manifestEmbed({
                    manifest: target.manifest,
                    installedBy: target.installedBy?.id,
                  }));

                return discord.Message.dialog({
                  message,
                  type: 'uninstall',
                  confirm: options['id'] as string,
                  description:
                    `**Are you sure you want to uninstall this pack?**\n\nUninstalling a pack will disable any characters your server members have from the pack, which may be met with negative reactions.`,
                }).setFlags(discord.MessageFlags.Ephemeral).send();
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
            return help.pages({ userId: member.user.id, index: 0 }).send();
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

            return (await search.media({ id, guildId }))
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'character': {
            // deno-lint-ignore no-non-null-assertion
            const id = customValues![0];

            return (await search.character({
              userId: member.user.id,
              guildId,
              id,
            }))
              .setType(discord.MessageType.Update)
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
            }))
              .setType(discord.MessageType.New)
              .send();
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
          case 'obtained': {
            // deno-lint-ignore no-non-null-assertion
            const id = customValues![0];
            // deno-lint-ignore no-non-null-assertion
            const anchor = customValues![2];
            // deno-lint-ignore no-non-null-assertion
            const action = customValues![3];

            return (await search.mediaObtained({
              id,
              guildId,
              after: action === 'next' ? anchor : undefined,
              before: action === 'prev' ? anchor : undefined,
            }))
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'pull':
          case 'gacha': {
            return gacha
              .start({
                token,
                quiet: customType === 'pull',
                userId: member.user.id,
                guildId,
              })
              .setType(discord.MessageType.New)
              .send();
          }
          case 'now': {
            return (await user.now({
              userId: member.user.id,
              guildId,
            }))
              .setType(discord.MessageType.New)
              .send();
          }
          case 'help': {
            // deno-lint-ignore no-non-null-assertion
            const index = parseInt(customValues![1]);

            return help.pages({ userId: member.user.id, index })
              .setType(discord.MessageType.Update)
              .send();
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
          case 'uninstall': {
            // deno-lint-ignore no-non-null-assertion
            const manifestId = customValues![0];

            return (await packs.uninstall({
              guildId,
              manifestId,
            })).setType(discord.MessageType.New).send();
          }
          case 'cancel': {
            return new discord.Message()
              .addEmbed(new discord.Embed().setDescription('Cancelled'))
              .setType(discord.MessageType.Update).send();
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
        .addEmbed(new discord.Embed().setDescription(err.message))
        .send();
    }

    if (err instanceof NoPermissionError) {
      return new discord.Message()
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
