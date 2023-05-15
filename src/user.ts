import 'https://esm.sh/@total-typescript/ts-reset@0.4.2/filter-boolean';

import { gql, request } from './graphql.ts';

import config, { faunaUrl } from './config.ts';

import Rating from './rating.ts';

import packs from './packs.ts';

import { default as srch, relationFilter } from './search.ts';

import utils from './utils.ts';

import * as discord from './discord.ts';

import {
  Character,
  DisaggregatedCharacter,
  DisaggregatedMedia,
  Media,
  Schema,
} from './types.ts';

async function getUserCharacters(
  { userId, guildId }: { userId: string; guildId: string },
): Promise<{
  likes: Schema.User['likes'];
  characters: Schema.Inventory['characters'];
  party: Schema.Inventory['party'];
}> {
  const query = gql`
    query ($userId: String!, $guildId: String!) {
      getUserInventory(userId: $userId, guildId: $guildId) {
        party {
          member1 {
            id
            mediaId
            rating
            nickname
            image
          }
          member2 {
            id
            mediaId
            rating
            nickname
            image
          }
          member3 {
            id
            mediaId
            rating
            nickname
            image
          }
          member4 {
            id
            mediaId
            rating
            nickname
            image
          }
          member5 {
            id
            mediaId
            rating
            nickname
            image
          }
        }
        user {
          likes {
            mediaId
            characterId
          }
        }
        characters {
          id
          mediaId
          rating
          nickname
          image
        }
      }
    }
  `;

  const { getUserInventory: { user, party, characters } } = await request<{
    getUserInventory: Schema.Inventory;
  }>({
    query,
    url: faunaUrl,
    headers: {
      'authorization': `Bearer ${config.faunaSecret}`,
    },
    variables: {
      userId,
      guildId,
    },
  });

  return {
    party,
    characters,
    likes: user.likes,
  };
}

async function getActiveInventories(
  guildId: string,
): Promise<Schema.Inventory[]> {
  const query = gql`
    query ($guildId: String!) {
      getActiveInventories(guildId: $guildId) {
        user {
          id
          likes {
            mediaId
            characterId
          }
        }
      }
    }
  `;

  const response = (await request<{
    getActiveInventories: Schema.Inventory[];
  }>({
    query,
    url: faunaUrl,
    headers: {
      'authorization': `Bearer ${config.faunaSecret}`,
    },
    variables: {
      guildId,
    },
  })).getActiveInventories;

  return response;
}

async function now({
  token,
  userId,
  guildId,
  mention,
}: {
  token: string;
  userId: string;
  guildId: string;
  mention?: boolean;
}): Promise<discord.Message> {
  const query = gql`
    query ($userId: String!, $guildId: String!) {
      getUserInventory(userId: $userId, guildId: $guildId) {
        availablePulls
        rechargeTimestamp
        user {
          lastVote
          availableVotes
          guarantees
        }
      }
    }
  `;

  const message = new discord.Message();

  const { user, availablePulls, rechargeTimestamp } = (await request<{
    getUserInventory: Schema.Inventory;
  }>({
    url: faunaUrl,
    query,
    headers: {
      'authorization': `Bearer ${config.faunaSecret}`,
    },
    variables: {
      userId,
      guildId,
    },
  })).getUserInventory;

  const recharge = utils.rechargeTimestamp(rechargeTimestamp);
  const voting = utils.votingTimestamp(user.lastVote);

  const guarantees = Array.from(new Set(user.guarantees ?? []))
    .sort((a, b) => b - a);

  message.addEmbed(
    new discord.Embed()
      .setTitle(`**${availablePulls}**`)
      .setDescription(`${
        guarantees
          .map((r) => `${r}${discord.emotes.smolStar}`)
          .join('')
      }`)
      .setFooter({ text: 'Available Pulls' }),
  );

  if (user.availableVotes) {
    message.addEmbed(
      new discord.Embed()
        .setTitle(`**${user.availableVotes}**`)
        .setFooter({ text: `Available Votes` }),
    );
  }

  if (config.notice) {
    message.addEmbed(
      new discord.Embed()
        .setDescription(config.notice.replaceAll('\\n', '\n')),
    );
  }

  if (availablePulls < 5) {
    message.addEmbed(
      new discord.Embed()
        .setDescription(`_+1 pull <t:${recharge}:R>_`),
    );
  }

  if (user.lastVote && !voting.canVote) {
    message.addEmbed(
      new discord.Embed()
        .setDescription(
          `_Can vote again <t:${
            utils.votingTimestamp(user.lastVote).timeLeft
          }:R>_`,
        ),
    );
  }

  // components

  if (availablePulls > 0) {
    message.addComponents([
      // `/gacha` shortcut
      new discord.Component()
        .setId('gacha', userId)
        .setLabel('/gacha'),
    ]);
  }

  if (user.availableVotes && user.availableVotes >= 36) {
    // `/buy guaranteed` 5 shortcut
    message.addComponents([
      new discord.Component()
        .setId('buy', 'bguaranteed', userId, '5')
        .setLabel(`/buy guaranteed 5`),
    ]);
  } else if (user.availableVotes && user.availableVotes >= 12) {
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

  if (!user.lastVote || voting.canVote) {
    message.addComponents([
      new discord.Component()
        .setLabel('Vote')
        .setUrl(
          `https://top.gg/bot/${config.appId}/vote?ref=${
            // deno-lint-ignore no-non-null-assertion
            utils.cipher(token, config.topggCipher!)}&gid=${guildId}`,
        ),
    ]);
  }

  if (mention) {
    message
      .setContent(`<@${userId}>`)
      .setPing();
  }

  return message;
}

async function findCharacter({
  guildId,
  characterId,
}: {
  guildId?: string;
  characterId?: string;
}): Promise<Schema.Character | undefined> {
  if (!guildId || !characterId) {
    return undefined;
  }

  const query = gql`
    query ($guildId: String!, $characterId: String!) {
      findCharacter(guildId: $guildId, characterId: $characterId) {
        id
        image
        nickname
        mediaId
        rating
        inventory {
          lastPull
          party {
            member1 { id }
            member2 { id }
            member3 { id }
            member4 { id }
            member5 { id }
          }
        }
        user {
          id
        }
      }
    }
  `;

  const result = (await request<{
    findCharacter?: Schema.Character;
  }>({
    url: faunaUrl,
    query,
    headers: {
      'authorization': `Bearer ${config.faunaSecret}`,
    },
    variables: {
      characterId,
      guildId,
    },
  })).findCharacter;

  if (!result) {
    return undefined;
  }

  return result;
}

function nick({
  token,
  userId,
  guildId,
  channelId,
  nick,
  search,
  id,
}: {
  token: string;
  userId: string;
  guildId: string;
  channelId: string;
  nick?: string;
  search?: string;
  id?: string;
}): discord.Message {
  const mutation = gql`
    mutation ($userId: String!, $guildId: String!, $characterId: String!, $nick: String) {
      setCharacterNickname(userId: $userId, guildId: $guildId, characterId: $characterId, nickname: $nick) {
        ok
        error
        character {
          id
          image
          nickname
          mediaId
          rating
          user {
            id
          }
        }
      }
    }
  `;

  packs
    .characters(id ? { ids: [id], guildId } : { search, guildId })
    .then(async (results: (Character | DisaggregatedCharacter)[]) => {
      if (!results.length) {
        throw new Error('404');
      }

      const message = new discord.Message();

      const characterId = `${results[0].packId}:${results[0].id}`;

      const response = (await request<{
        setCharacterNickname: Schema.Mutation;
      }>({
        url: faunaUrl,
        query: mutation,
        headers: {
          'authorization': `Bearer ${config.faunaSecret}`,
        },
        variables: {
          userId,
          guildId,
          characterId,
          nick,
        },
      })).setCharacterNickname;

      if (!response.ok) {
        const names = packs.aliasToArray(results[0].name);

        switch (response.error) {
          case 'CHARACTER_NOT_FOUND': {
            return message
              .addEmbed(
                new discord.Embed().setDescription(
                  `${names[0]} hasn't been found by anyone yet.`,
                ),
              ).addComponents([
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
                  `${
                    names[0]
                  } is owned by <@${response.character.user.id}> and cannot be customized by you.`,
                ),
              ).addComponents([
                new discord.Component()
                  .setId(`character`, response.character.id)
                  .setLabel('/character'),
              ])
              .patch(token);
          default:
            throw new Error(response.error);
        }
      }

      const character = await packs.aggregate<Character>({
        guildId,
        character: results[0],
        end: 1,
      });

      const name = packs.aliasToArray(character.name)[0];

      message
        .addEmbed(srch.characterEmbed(
          character,
          channelId,
          {
            footer: true,
            rating: false,
            mode: 'thumbnail',
            description: false,
            media: { title: true },
            existing: {
              ...response.character,
              rating: undefined,
              user: undefined,
            },
          },
        ))
        .addEmbed(
          new discord.Embed().setDescription(
            !nick
              ? `${name}'s nickname has been reset`
              : `${name}'s nickname has been changed to **${response.character.nickname}**`,
          ),
        );

      return message.patch(token);
    })
    .catch(async (err) => {
      if (err.message === '404') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              'Found _nothing_ matching that query!',
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

function image({
  token,
  userId,
  guildId,
  channelId,
  image,
  search,
  id,
}: {
  token: string;
  userId: string;
  guildId: string;
  channelId: string;
  image?: string;
  search?: string;
  id?: string;
}): discord.Message {
  const mutation = gql`
    mutation ($userId: String!, $guildId: String!, $characterId: String!, $image: String) {
      setCharacterImage(userId: $userId, guildId: $guildId, characterId: $characterId, image: $image) {
        ok
        error
        character {
          id
          image
          nickname
          mediaId
          rating
          user {
            id
          }
        }
      }
    }
  `;

  packs
    .characters(id ? { ids: [id], guildId } : { search, guildId })
    .then(async (results: (Character | DisaggregatedCharacter)[]) => {
      if (!results.length) {
        throw new Error('404');
      }

      const message = new discord.Message();

      const characterId = `${results[0].packId}:${results[0].id}`;

      const response = (await request<{
        setCharacterImage: Schema.Mutation;
      }>({
        url: faunaUrl,
        query: mutation,
        headers: {
          'authorization': `Bearer ${config.faunaSecret}`,
        },
        variables: {
          userId,
          guildId,
          characterId,
          image,
        },
      })).setCharacterImage;

      if (!response.ok) {
        const names = packs.aliasToArray(results[0].name);

        switch (response.error) {
          case 'CHARACTER_NOT_FOUND': {
            return message
              .addEmbed(
                new discord.Embed().setDescription(
                  `${names[0]} hasn't been found by anyone yet.`,
                ),
              ).addComponents([
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
                  `${
                    names[0]
                  } is owned by <@${response.character.user.id}> and cannot be customized by you.`,
                ),
              ).addComponents([
                new discord.Component()
                  .setId(`character`, response.character.id)
                  .setLabel('/character'),
              ])
              .patch(token);
          default:
            throw new Error(response.error);
        }
      }

      const character = await packs.aggregate<Character>({
        guildId,
        character: results[0],
        end: 1,
      });

      const name = packs.aliasToArray(character.name)[0];

      message
        .addEmbed(srch.characterEmbed(
          character,
          channelId,
          {
            footer: true,
            rating: false,
            description: false,
            media: { title: true },
            existing: {
              ...response.character,
              rating: undefined,
              user: undefined,
            },
          },
        ))
        .addEmbed(
          new discord.Embed().setDescription(
            !image
              ? `${name}'s image has been reset`
              : `${name}'s image has been **changed**`,
          ),
        );

      return message.patch(token);
    })
    .catch(async (err) => {
      if (err.message === '404') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              'Found _nothing_ matching that query!',
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

function like({
  token,
  userId,
  guildId,
  channelId,
  search,
  undo,
  id,
}: {
  token: string;
  userId: string;
  guildId: string;
  channelId: string;
  undo: boolean;
  search?: string;
  id?: string;
}): discord.Message {
  const mutation = gql`
    mutation ($userId: String!, $guildId: String!, $characterId: String!) {
  ${
    undo
      ? 'unlikeCharacter'
      : 'likeCharacter'
  }(userId: $userId, guildId: $guildId, characterId: $characterId) {
        ok
        character {
          id
          image
          nickname
          mediaId
          rating
          user {
            id
          }
        }
      }
    }
  `;

  packs
    .characters(id ? { ids: [id], guildId } : { search, guildId })
    .then(async (results: (Character | DisaggregatedCharacter)[]) => {
      if (!results.length) {
        throw new Error('404');
      }

      const message = new discord.Message();

      const characterId = `${results[0].packId}:${results[0].id}`;

      const response = (await request<{
        likeCharacter: Schema.Mutation;
        unlikeCharacter: Schema.Mutation;
      }>({
        url: faunaUrl,
        query: mutation,
        headers: {
          'authorization': `Bearer ${config.faunaSecret}`,
        },
        variables: {
          userId,
          guildId,
          characterId,
        },
      }))[undo ? 'unlikeCharacter' : 'likeCharacter'];

      if (!response.ok) {
        switch (response.error) {
          default:
            throw new Error(response.error);
        }
      }

      message
        .addEmbed(
          new discord.Embed().setDescription(!undo ? 'Liked' : 'Unliked'),
        );

      const character = await packs.aggregate<Character>({
        guildId,
        character: results[0],
        end: 1,
      });

      message
        .addEmbed(srch.characterEmbed(
          character,
          channelId,
          {
            footer: true,
            description: false,
            mode: 'thumbnail',
            media: { title: true },
            rating: response.character?.rating
              ? new Rating({ stars: response.character?.rating })
              : true,
            existing: !undo ? response.character : undefined,
          },
        ));

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
              'Found _nothing_ matching that query!',
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

function likeall({
  token,
  userId,
  guildId,
  channelId,
  search,
  undo,
  id,
}: {
  token: string;
  userId: string;
  guildId: string;
  channelId: string;
  undo: boolean;
  search?: string;
  id?: string;
}): discord.Message {
  const mutation = gql`
    mutation ($userId: String!, $mediaId: String!) {
  ${undo ? 'unlikeMedia' : 'likeMedia'}(userId: $userId, mediaId: $mediaId) {
        ok
      }
    }
  `;

  packs
    .media(id ? { ids: [id], guildId } : { search, guildId })
    .then(async (results: (Media | DisaggregatedMedia)[]) => {
      if (!results.length) {
        throw new Error('404');
      }

      const message = new discord.Message();

      const mediaId = `${results[0].packId}:${results[0].id}`;

      const response = (await request<{
        likeMedia: Schema.Mutation;
        unlikeMedia: Schema.Mutation;
      }>({
        url: faunaUrl,
        query: mutation,
        headers: {
          'authorization': `Bearer ${config.faunaSecret}`,
        },
        variables: {
          userId,
          mediaId,
        },
      }))[undo ? 'unlikeMedia' : 'likeMedia'];

      if (!response.ok) {
        throw new Error(response.error);
      }

      message
        .addEmbed(
          new discord.Embed().setDescription(!undo ? 'Liked' : 'Unliked'),
        );

      const media = await packs.aggregate<Media>({
        guildId,
        media: results[0],
      });

      message
        .addEmbed(srch.mediaEmbed(
          media,
          channelId,
          packs.aliasToArray(media.title),
        ));

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
              'Found _nothing_ matching that query!',
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

function list({
  token,
  userId,
  guildId,
  rating,
  search,
  id,
  index,
  nick,
}: {
  token: string;
  index: number;
  userId: string;
  guildId: string;
  rating?: number;
  search?: string;
  id?: string;
  nick?: boolean;
}): discord.Message {
  const query = gql`
    query ($userId: String!, $guildId: String!) {
      getUserInventory(userId: $userId, guildId: $guildId) {
        characters {
          id
          nickname
          mediaId
          rating
        }
      }
    }
  `;

  request<{
    getUserInventory: Schema.Inventory;
  }>({
    url: faunaUrl,
    query,
    headers: {
      'authorization': `Bearer ${config.faunaSecret}`,
    },
    variables: {
      userId,
      guildId,
    },
  })
    .then(async ({ getUserInventory }) => {
      const embed = new discord.Embed();

      const message = new discord.Message();

      let characters = getUserInventory.characters;

      let media: Media[] = [];

      if (rating) {
        characters = characters.filter((char) => char.rating === rating);
      }

      if (search || id) {
        const results = await packs
          .media(id ? { ids: [id], guildId } : { search, guildId });

        if (!results.length) {
          throw new Error('404');
        }

        const parent = await packs.aggregate<Media>({
          media: results[0],
          guildId,
        });

        media = [
          parent,
          ...parent.relations?.edges?.filter(({ relation }) =>
            // deno-lint-ignore no-non-null-assertion
            relationFilter.includes(relation!)
          ).map(({ node }) => node) ?? [],
        ];

        const relationsIds = media.map(({ packId, id }) => `${packId}:${id}`);

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
        characters = characters
          .sort((a, b) => b.rating - a.rating);
      }

      if (!characters?.length) {
        const message = new discord.Message()
          .addEmbed(
            new discord.Embed()
              .setDescription(
                `${nick ? `<@${userId}> doesn't` : 'You don\'t'} have any ${
                  rating ? `${rating}${discord.emotes.smolStar}characters` : ''
                }${
                  media.length
                    ? `characters from ${packs.aliasToArray(media[0].title)[0]}`
                    : ''
                }`,
              ),
          );

        if (!nick) {
          message.addComponents([
            // `/gacha` shortcut
            new discord.Component()
              .setId('gacha', userId)
              .setLabel('/gacha'),
          ]);
        }

        return message.patch(token);
      }

      const chunks = utils.chunks(characters, 5);

      const _characters = await packs.characters({
        ids: chunks[index].map(({ id }) => id),
        guildId,
      });

      const fields: Record<string, {
        title: string;
        names: string[];
      }> = {};

      for (let i = 0; i < _characters.length; i++) {
        const char = _characters[i];

        // deno-lint-ignore no-non-null-assertion
        const existing = chunks[index].find(({ id }) =>
          id === `${char.packId}:${char.id}`
        )!;

        if (!fields[existing.mediaId]) {
          const media = (await packs.aggregate<Character>({
            character: char,
            guildId,
          })).media?.edges[0].node;

          const title = utils.wrap(
            packs.aliasToArray(
              // deno-lint-ignore no-non-null-assertion
              media!.title,
            )[0],
          );

          fields[existing.mediaId] = {
            title,
            names: [],
          };
        }

        const field = fields[existing.mediaId];

        const name = `${existing.rating}${discord.emotes.smolStar} ${
          existing.nickname ?? utils.wrap(packs.aliasToArray(char.name)[0])
        }`;

        field.names.push(name);
      }

      Object.values(fields).forEach(({ title, names }) =>
        embed.addField({
          inline: false,
          name: title,
          value: names.join('\n'),
        })
      );

      if (_characters.length !== chunks[index].length) {
        embed.addField({
          inline: false,
          name: `_${
            chunks[index].length - _characters.length
          } disabled characters_`,
        });
      }

      return discord.Message.page({
        index,
        type: 'list',
        target: discord.join(
          userId,
          media.length ? `${media[0].packId}:${media[0].id}` : '',
          `${rating ?? ''}`,
        ),
        total: chunks.length,
        message: message.addEmbed(embed),
        next: index + 1 < chunks.length,
      }).patch(token);
    })
    .catch(async (err) => {
      if (err.message === '404') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              'Found _nothing_ matching that query!',
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

function likeslist({
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
  const query = gql`
    query ($userId: String!, $guildId: String!) {
      getUserInventory(userId: $userId, guildId: $guildId) {
        user {
          likes {
            mediaId
            characterId
          }
        }
      }
    }
  `;

  request<{
    getUserInventory: Schema.Inventory;
  }>({
    url: faunaUrl,
    query,
    headers: {
      'authorization': `Bearer ${config.faunaSecret}`,
    },
    variables: {
      userId,
      guildId,
    },
  })
    .then(async ({ getUserInventory }) => {
      const embed = new discord.Embed();

      const message = new discord.Message();

      const { likes } = getUserInventory.user;

      if (!likes?.length) {
        const message = new discord.Message()
          .addEmbed(
            new discord.Embed()
              .setDescription(
                `${
                  nick ? `<@${userId}> doesn't` : 'You don\'t'
                } have any likes`,
              ),
          );

        return message.patch(token);
      }

      const chunks = utils.chunks(likes, 5);

      const [characters, media] = await Promise.all([
        await packs.characters({
          guildId,
          ids: chunks[index].map(({ characterId }) => characterId)
            .filter(Boolean),
        }),
        await packs.media({
          guildId,
          ids: chunks[index].map(({ mediaId }) => mediaId)
            .filter(Boolean),
        }),
      ]);

      media.forEach((media) => {
        const title = utils.wrap(packs.aliasToArray(media.title)[0]);

        embed.addField({
          inline: false,
          name: title,
          value: discord.emotes.all,
        });
      });

      await Promise.all(
        characters.map(async (character) => {
          const [char, existing] = await Promise.all([
            packs.aggregate<Character>({
              guildId,
              character,
              end: 1,
            }),
            user.findCharacter({
              guildId,
              characterId: `${character.packId}:${character.id}`,
            }),
          ]);

          const rating = existing?.rating ?? Rating.fromCharacter(char).stars;

          const media = utils.wrap(
            // deno-lint-ignore no-non-null-assertion
            packs.aliasToArray(char.media!.edges[0].node.title)[0],
          );

          const name = `${rating}${discord.emotes.smolStar} ${
            existing ? `<@${existing.user.id}> ` : ''
          }${utils.wrap(packs.aliasToArray(char.name)[0])}`;

          embed.addField({
            inline: false,
            name: media,
            value: name,
          });
        }),
      );

      return discord.Message.page({
        index,
        type: 'likes',
        target: userId,
        total: chunks.length,
        message: message.addEmbed(embed),
        next: index + 1 < chunks.length,
      }).patch(token);
    })
    .catch(async (err) => {
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
  const query = gql`
    query ($userId: String!, $guildId: String!) {
      getUserInventory(userId: $userId, guildId: $guildId) {
        characters {
          id
          rating
          nickname
        }
      }
    }
  `;

  request<{
    getUserInventory: Schema.Inventory;
  }>({
    url: faunaUrl,
    query,
    headers: {
      'authorization': `Bearer ${config.faunaSecret}`,
    },
    variables: {
      userId,
      guildId,
    },
  })
    .then(async ({ getUserInventory }) => {
      const message = new discord.Message();

      const characters = getUserInventory.characters
        .slice(-10);

      if (!characters?.length) {
        const message = new discord.Message()
          .addEmbed(
            new discord.Embed()
              .setDescription(
                `${
                  nick ? `<@${userId}> doesn't` : 'You don\'t'
                } have any characters`,
              ),
          );

        return message.patch(token);
      }

      const names: string[] = [];

      const results = await packs.characters({
        guildId,
        ids: characters.map(({ id }) => id),
      });

      characters.toReversed().forEach((existing) => {
        const char = results.find(({ packId, id }) =>
          `${packId}:${id}` === existing.id
        );

        if (char) {
          const name = `${existing.rating}${discord.emotes.smolStar} ${
            existing.nickname ?? utils.wrap(packs.aliasToArray(char.name)[0])
          }`;

          names.push(name);
        }
      });

      message.addEmbed(new discord.Embed()
        .setDescription(names.join('\n')));

      return message.patch(token);
    })
    .catch(async (err) => {
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

const user = {
  findCharacter,
  getActiveInventories,
  getUserCharacters,
  image,
  like,
  likeall,
  likeslist,
  list,
  logs,
  nick,
  now,
};

export default user;
