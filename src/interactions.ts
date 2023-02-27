import * as discord from './discord.ts';

import * as search from './search.ts';
import * as user from './user.ts';
import * as party from './party.ts';

import packs from './packs.ts';
import utils from './utils.ts';
import gacha from './gacha.ts';

import { help } from './help.ts';

import config, { initConfig } from './config.ts';

import { Character, ManifestType, Media } from './types.ts';

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
    channelId,
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
          ['search', 'anime', 'manga', 'media'].includes(name) ||
          (['collection', 'coll', 'mm'].includes(name) &&
            subcommand === 'media')
        ) {
          const title = options['title'] as string;

          const message = new discord.Message(
            discord.MessageType.Suggestions,
          );

          const results = await packs.searchMany<Media>(
            'media',
            title,
          );

          results?.forEach((media) => {
            message.addSuggestions({
              name: `${packs.aliasToArray(media.title)[0]}`,
              value: `${idPrefix}${media.packId}:${media.id}`,
            });
          });

          return message.send();
        } // suggest characters
        else if (['character', 'char', 'im'].includes(name)) {
          const name = options['name'] as string;

          const message = new discord.Message(
            discord.MessageType.Suggestions,
          );

          const results = await packs.searchMany<Character>(
            'characters',
            name,
          );

          results?.forEach((character) => {
            message.addSuggestions({
              name: `${packs.aliasToArray(character.name)[0]}`,
              value: `${idPrefix}${character.packId}:${character.id}`,
            });
          });

          return message.send();
        } else if (
          ['party', 'team', 'p'].includes(name) && subcommand === 'assign'
        ) {
          const name = options['name'] as string;

          const message = new discord.Message(
            discord.MessageType.Suggestions,
          );

          const results = await Promise.all([
            packs.searchMany<Character>(
              'characters',
              name,
              35,
            ),
            user.allCharacters({
              userId: member.user.id,
              channelId,
              guildId,
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

        break;
      }
      case discord.InteractionType.Command:
        switch (name) {
          case 'search':
          case 'anime':
          case 'manga':
          case 'media': {
            const title = options['title'] as string;

            return (await search.media({
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
              channelId,
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
                  channelId,
                  guildId,
                })).send();
              case 'assign':
                return (await party.assign({
                  spot,
                  userId: member.user.id,
                  channelId,
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
                  channelId,
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
                const rating = options['rating'] as number;

                return (await user.stars({
                  userId: userId ?? member.user.id,
                  stars: rating,
                  channelId,
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
                  channelId,
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
          case 'now':
          case 'checklist':
          case 'cl':
          case 'tu': {
            return (await user.now({
              userId: member.user.id,
              channelId,
              guildId,
            }))
              .send();
          }
          case 'pull':
          case 'gacha':
          case 'w':
          case 'q':
            return gacha
              .start({
                quiet: ['pull', 'q'].includes(name),
                userId: member.user.id,
                channelId,
                guildId,
                token,
              })
              .send();
          case 'fake_pull':
            return gacha
              .start({ token, characterId: options['id'] as string })
              .send();
          case 'anilist': {
            // deno-lint-ignore no-non-null-assertion
            return (await packs.anilist(subcommand!, interaction))!
              .send();
          }
          case 'help':
          case 'start':
          case 'guide':
          case 'tuto': {
            return help({ userId: member.user.id, index: 0 }).send();
          }
          case 'packs': {
            //deno-lint-ignore no-non-null-assertion
            switch (subcommand!) {
              case 'builtin':
              case 'community': {
                return packs.embed({
                  index: 0,
                  type: subcommand as ManifestType,
                }).send();
              }
              // case 'install': {
              //   return packs.install({
              //     token,
              //     guildId,
              //     channelId,
              //     userId: member.user.id,
              //     url: options['github'] as string,
              //     ref: options['ref'] as string,
              //   }).send();
              // }
              default:
                break;
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
            // deno-lint-ignore no-non-null-assertion
            const id = customValues![0];

            return (await search.media({ id }))
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'character': {
            // deno-lint-ignore no-non-null-assertion
            const id = customValues![0];

            return (await search.character({
              userId: member.user.id,
              channelId,
              guildId,
              id,
            }))
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'mcharacter': {
            // deno-lint-ignore no-non-null-assertion
            const mediaId = customValues![0];

            // deno-lint-ignore no-non-null-assertion
            const index = parseInt(customValues![1]) || 0;

            return (await search.mediaCharacter({
              userId: member.user.id,
              channelId,
              guildId,
              mediaId,
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
              channelId,
              guildId,
            }))
              .setType(discord.MessageType.Update)
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
              channelId,
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
              channelId,
              userId,
              after: action === 'next' ? anchor : undefined,
              before: action === 'prev' ? anchor : undefined,
            }))
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'pull':
          case 'gacha': {
            // deno-lint-ignore no-non-null-assertion
            const userId = customValues![0];

            return gacha
              .start({
                token,
                quiet: customType === 'pull',
                userId: member.user.id,
                guildId,
                channelId,
              })
              .setType(
                userId === member.user.id
                  ? discord.MessageType.Update
                  : discord.MessageType.New,
              )
              .send();
          }
          case 'now': {
            // deno-lint-ignore no-non-null-assertion
            const userId = customValues![0];

            return (await user.now({
              userId: member.user.id,
              guildId,
              channelId,
            }))
              .setType(
                userId === member.user.id
                  ? discord.MessageType.Update
                  : discord.MessageType.New,
              )
              .send();
          }
          case 'help': {
            // deno-lint-ignore no-non-null-assertion
            const index = parseInt(customValues![1]);

            return help({ userId: member.user.id, index })
              .setType(discord.MessageType.Update)
              .send();
          }
          case 'builtin':
          case 'community': {
            // deno-lint-ignore no-non-null-assertion
            const index = parseInt(customValues![1]);

            return packs.embed({
              index,
              type: customType as ManifestType,
            })
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
        .setContent('You don\'t permission to complete this interaction!')
        .send();
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
    '/external/*': utils.proxy,
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
