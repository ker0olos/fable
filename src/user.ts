import { gql, request } from './graphql.ts';

import config, { faunaUrl } from './config.ts';

import Rating from './rating.ts';

import packs from './packs.ts';

import { default as srch } from './search.ts';

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
          likes
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
        .setLabel(!user.lastVote ? 'Vote for Rewards' : 'Vote')
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

function stars({
  token,
  userId,
  guildId,
  channelId,
  stars,
  nick,
  before,
  after,
}: {
  token: string;
  userId: string;
  guildId: string;
  channelId: string;
  stars: number;
  nick?: string;
  before?: string;
  after?: string;
}): discord.Message {
  const query = gql`
    query ($userId: String!, $guildId: String!, $stars: Int!, $before: String, $after: String) {
      getUserStars(userId: $userId, guildId: $guildId, stars: $stars, before: $before, after: $after) {
        anchor
        character {
          id
          mediaId
          rating
        }
      }
    }
  `;

  request<{
    getUserStars: {
      character?: Schema.Inventory['characters'][0];
      anchor?: string;
    };
  }>({
    url: faunaUrl,
    query,
    headers: {
      'authorization': `Bearer ${config.faunaSecret}`,
    },
    variables: {
      userId,
      guildId,
      stars,
      before,
      after,
    },
  })
    .then(async ({ getUserStars }) => {
      const { character, anchor } = getUserStars;

      if (!character || !anchor) {
        const message = new discord.Message()
          .addEmbed(
            new discord.Embed()
              .setDescription(
                `${
                  nick ? `${utils.capitalize(nick)} doesn't` : 'You don\'t'
                } have any ${stars}${discord.emotes.smolStar}characters`,
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

      const results: [
        (Media | DisaggregatedMedia)[],
        (Character | DisaggregatedCharacter)[],
      ] = await Promise.all([
        packs.media({ ids: [character.mediaId], guildId }),
        packs.characters({ ids: [character.id], guildId }),
      ]);

      let message: discord.Message;

      if (!results[0].length) {
        message = new discord.Message()
          .addEmbed(
            new discord.Embed()
              .setDescription('This media was removed or disabled'),
          );
      } else if (!results[1].length) {
        message = new discord.Message()
          .addEmbed(
            new discord.Embed()
              .setDescription('This character was removed or disabled'),
          );
      } else {
        const media = results[0][0];

        message = srch.characterMessage(
          results[1][0],
          channelId,
          {
            rating: new Rating({ stars: character.rating }),
            media: { title: packs.aliasToArray(media.title)[0] },
            relations: false,
          },
        ).addComponents([
          new discord.Component()
            .setId('media', `${media.packId}:${media.id}`)
            .setLabel(`/${media.type.toLowerCase()}`),
        ]);

        if (!nick) {
          message.insertComponents([
            new discord.Component()
              .setId('passign', character.id)
              .setLabel(`/p assign`),
          ]);
        }
      }

      return discord.Message.anchor({
        id: userId,
        type: 'cstars',
        target: stars,
        anchor,
        message,
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

function media({
  token,
  userId,
  guildId,
  channelId,
  id,
  search,
  nick,
  before,
  after,
}: {
  token: string;
  userId: string;
  guildId: string;
  channelId: string;
  id?: string;
  search?: string;
  nick?: string;
  before?: string;
  after?: string;
}): discord.Message {
  packs
    .media(id ? { ids: [id], guildId } : { search, guildId }).then(
      async (results) => {
        if (!results.length) {
          throw new Error('404');
        }

        const media = results[0];
        const mediaId = `${media.packId}:${media.id}`;

        const titles = packs.aliasToArray(media.title);

        const query = gql`
          query ($userId: String!, $guildId: String!, $mediaId: String!, $before: String, $after: String) {
            getUserMedia(userId: $userId, guildId: $guildId, mediaId: $mediaId, before: $before, after: $after) {
              anchor
              character {
                id
                mediaId
                rating
              }
            }
          }
        `;

        const { character, anchor } = (await request<{
          getUserMedia: {
            character?: Schema.Inventory['characters'][0];
            anchor?: string;
          };
        }>({
          url: faunaUrl,
          query,
          headers: {
            'authorization': `Bearer ${config.faunaSecret}`,
          },
          variables: {
            userId,
            guildId,
            mediaId,
            before,
            after,
          },
        })).getUserMedia;

        if (!character || !anchor) {
          const message = new discord.Message()
            .addEmbed(
              new discord.Embed()
                .setDescription(
                  `${
                    nick ? `${utils.capitalize(nick)} doesn't` : 'You don\'t'
                  } have any ${titles[0]} characters`,
                ),
            );

          if (!nick) {
            message.insertComponents([
              // `/gacha` shortcut
              new discord.Component()
                .setId('gacha', userId)
                .setLabel('/gacha'),
            ]);
          }

          return message.patch(token);
        }

        const characters = await packs.characters({
          ids: [character.id],
          guildId,
        });

        let message: discord.Message;

        if (!characters.length) {
          message = new discord.Message()
            .addEmbed(
              new discord.Embed()
                .setDescription('This character was removed or disabled'),
            );
        } else {
          message = srch.characterMessage(
            characters[0],
            channelId,
            {
              rating: new Rating({ stars: character.rating }),
              relations: false,
            },
          ).addComponents([
            new discord.Component()
              .setId('media', `${media.packId}:${media.id}`)
              .setLabel(`/${media.type.toLowerCase()}`),
          ]);

          if (!nick) {
            message.insertComponents([
              new discord.Component()
                .setId('passign', character.id)
                .setLabel(`/p assign`),
            ]);
          }
        }

        return discord.Message.anchor({
          id: userId,
          type: 'cmedia',
          target: mediaId,
          anchor,
          message,
        }).patch(token);
      },
    ).catch(async (err) => {
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

function customize({
  token,
  userId,
  guildId,
  channelId,
  nick,
  image,
  search,
  id,
}: {
  token: string;
  userId: string;
  guildId: string;
  channelId: string;
  nick?: string;
  image?: string;
  search?: string;
  id?: string;
}): discord.Message {
  const mutation = gql`
    mutation ($userId: String!, $guildId: String!, $characterId: String!, $image: String, $nick: String) {
      customizeCharacter(userId: $userId, guildId: $guildId, characterId: $characterId, image: $image, nickname: $nick) {
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
        customizeCharacter: Schema.Mutation;
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
          nick,
        },
      })).customizeCharacter;

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

      return message
        .addEmbed(srch.characterEmbed(
          await packs.aggregate<Character>({
            guildId,
            character: results[0],
            end: 1,
          }),
          channelId,
          {
            rating: false,
            description: false,
            media: { title: true },
            existing: response.character,
            footer: true,
          },
        ))
        .addComponents([
          new discord.Component()
            .setId(`character`, response.character.id)
            .setLabel('/character'),
        ])
        .patch(token);
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

      message
        .addEmbed(srch.characterEmbed(
          await packs.aggregate<Character>({
            guildId,
            character: results[0],
            end: 1,
          }),
          channelId,
          {
            footer: true,
            description: false,
            media: { title: true },
            rating: response.character?.rating
              ? new Rating({ stars: response.character?.rating })
              : true,
            existing: !undo ? response.character : undefined,
            mode: !undo ? 'full' : 'thumbnail',
          },
        ));

      if (!undo) {
        message.addComponents([
          new discord.Component()
            .setId(`character`, characterId)
            .setLabel('/character'),
        ]);

        if (response.character?.user?.id === userId) {
          message.addComponents([
            new discord.Component()
              .setId('passign', response.character.id)
              .setLabel(`/p assign`),
          ]);
        }
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
  filter,
  index,
  nick,
}: {
  token: string;
  index: number;
  userId: string;
  guildId: string;
  likes?: boolean;
  filter?: number;
  nick?: string;
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

      if (filter) {
        characters = characters.filter(({ rating }) => rating === filter);
      }

      characters = characters.sort((a, b) => b.rating - a.rating);

      if (!characters?.length) {
        const message = new discord.Message()
          .addEmbed(
            new discord.Embed()
              .setDescription(
                `${
                  nick ? `${utils.capitalize(nick)} doesn't` : 'You don\'t'
                } have any${
                  filter ? ` ${filter}${discord.emotes.smolStar}` : ''
                } characters`,
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

      const mediaIds = new Set(characters.map(({ mediaId }) => mediaId));

      // split media into chunks of 5
      const chunks = utils.chunks(Array.from(mediaIds), 5);

      // group characters under their media

      const charactersByMediaId: Record<string, Schema.Character[]> = {};

      chunks[index].forEach((mediaId) => charactersByMediaId[mediaId] = []);

      characters.forEach((char) =>
        charactersByMediaId[char.mediaId]?.push(char)
      );

      const charactersIds = Object.values(charactersByMediaId)
        .map((char) => char.map(({ id }) => id))
        .reduce((a, b) => a.concat(b));

      // find characters by their ids

      const results: [
        (Media | DisaggregatedMedia)[],
        (Character | DisaggregatedCharacter)[],
      ] = await Promise.all([
        packs.media({ ids: chunks[index], guildId }),
        packs.characters({ ids: charactersIds, guildId }),
      ]);

      chunks[index].forEach((mediaId) => {
        const media = results[0].find(({ packId, id }) =>
          mediaId === `${packId}:${id}`
        );

        if (!media) {
          return embed.addField({
            inline: false,
            name: 'Media disabled or removed',
          });
        }

        // deno-lint-ignore no-non-null-assertion
        const mediaTitle = utils.wrap(packs.aliasToArray(media!.title)[0]);

        const characters = charactersByMediaId[mediaId].map((char) => char.id);

        const charactersResult = results[1].filter(({ packId, id }) =>
          characters.includes(`${packId}:${id}`)
        );

        const charactersNames = charactersResult.map((char) => {
          // deno-lint-ignore no-non-null-assertion
          const { rating, nickname } = charactersByMediaId[mediaId].find((
            { id },
          ) => `${char.packId}:${char.id}` === id)!;

          return `${rating}${discord.emotes.smolStar} ${
            utils.wrap(nickname ?? packs.aliasToArray(char.name)[0])
          }`;
        });

        if (charactersResult.length !== characters.length) {
          charactersNames.push(
            `_${
              characters.length - charactersResult.length
            } disabled characters_`,
          );
        }

        embed.addField({
          inline: false,
          name: mediaTitle,
          value: charactersNames.join('\n'),
        });
      });

      return discord.Message.page({
        index,
        type: 'clist',
        target: discord.join(userId, filter?.toString() ?? ''),
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
  nick?: string;
}): discord.Message {
  const query = gql`
    query ($userId: String!, $guildId: String!) {
      getUserInventory(userId: $userId, guildId: $guildId) {
        user {
          likes
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

      const charactersIds = getUserInventory.user.likes;

      if (!charactersIds?.length) {
        const message = new discord.Message()
          .addEmbed(
            new discord.Embed()
              .setDescription(
                `${
                  nick ? `${utils.capitalize(nick)} doesn't` : 'You don\'t'
                } have any likes`,
              ),
          );

        return message.patch(token);
      }

      const chunks = utils.chunks(Array.from(charactersIds), 8);

      const results = await packs.characters({ ids: chunks[index], guildId });

      const charactersNames = await Promise.all(
        results.map(async (character) => {
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

          return `${rating}${discord.emotes.smolStar} ${
            existing ? `<@${existing.user.id}> ` : ''
          }${utils.wrap(packs.aliasToArray(char.name)[0])}`;
        }),
      );

      if (results.length !== chunks[index].length) {
        charactersNames.push(
          `_${chunks[index].length - results.length} disabled characters_`,
        );
      }

      embed.setDescription(charactersNames.join('\n'));

      return discord.Message.page({
        index,
        type: 'likes',
        target: discord.join(userId),
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

const user = {
  now,
  getUserCharacters,
  findCharacter,
  customize,
  stars,
  media,
  likeslist,
  list,
  like,
};

export default user;
