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

  message.addAttachment({
    arrayBuffer: await utils.text(availablePulls),
    filename: 'pulls.png',
    type: 'image/png',
  });

  message.addEmbed(
    new discord.Embed()
      .setImage({ url: `attachment://pulls.png` })
      .setFooter({ text: 'Available Pulls' }),
  );

  if (user.availableVotes) {
    message.addEmbed(
      new discord.Embed()
        .setFooter({ text: `${user.availableVotes} Available Votes` }),
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

  if (!user.lastVote || voting.canVote) {
    message.addComponents([
      new discord.Component()
        .setLabel(!user.lastVote ? 'Vote for Rewards' : 'Vote')
        .setUrl(
          `https://top.gg/bot/1041970851559522304/vote?ref=${
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

async function userCharacters({
  userId,
  guildId,
}: {
  userId: string;
  guildId: string;
}): Promise<Schema.Inventory['characters']> {
  const query = gql`
    query ($userId: String!, $guildId: String!) {
      getUserInventory(userId: $userId, guildId: $guildId) {
        characters {
          id
          mediaId
          rating
        }
      }
    }
  `;

  const { characters } = (await request<{
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

  return characters;
}

async function stars({
  userId,
  guildId,
  stars,
  nick,
  before,
  after,
}: {
  userId: string;
  guildId: string;
  stars: number;
  nick?: string;
  before?: string;
  after?: string;
}): Promise<discord.Message> {
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

  const { character, anchor } = (await request<{
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
  })).getUserStars;

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

    return message;
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
  });
}

async function media({
  userId,
  guildId,
  id,
  search,
  nick,
  before,
  after,
}: {
  userId: string;
  guildId: string;
  id?: string;
  search?: string;
  nick?: string;
  before?: string;
  after?: string;
}): Promise<discord.Message> {
  const results: (Media | DisaggregatedMedia)[] = await packs
    .media(id ? { ids: [id], guildId } : { search, guildId });

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

    return message;
  }

  const characters = await packs.characters({ ids: [character.id], guildId });

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
  });
}

function customize({
  token,
  userId,
  guildId,
  nick,
  image,
  search,
  id,
}: {
  token: string;
  userId: string;
  guildId: string;
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

function profile({
  nick,
  index,
  avatar,
  userId,
  guildId,
  token,
}: {
  nick: string;
  index: number;
  avatar: string;
  userId: string;
  guildId: string;
  token: string;
}): discord.Message {
  const query = gql`
    query ($userId: String!, $guildId: String!) {
      getUserInventory(userId: $userId, guildId: $guildId) {
        user {
          totalVotes
          badges {
            name
            description
            emote
          }
        }
        characters {
          mediaId
          rating
          id
        }
        party {
          member1 {
            id
            mediaId
            rating
          }
          member2 {
            id
            mediaId
            rating
          }
          member3 {
            id
            mediaId
            rating
          }
          member4 {
            id
            mediaId
            rating
          }
          member5 {
            id
            mediaId
            rating
          }
        }
      }
    }
  `;

  index = index ?? 0;

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

      const { user, party, characters } = getUserInventory;

      const media = Array.from(
        new Set(characters.map(({ mediaId }) => mediaId)),
      );

      const ratingCount = characters.map(({ rating }) => rating)
        .reduce((a, b) => a + b);

      embed.setThumbnail({ url: avatar, proxy: false, default: false });

      if (user.badges?.length) {
        embed.addField({
          name: user.badges.map(({ emote }) => emote).join(''),
          value: `**${nick}**`,
        });
      } else {
        embed.addField({
          name: nick,
        });
      }

      embed.addField({
        value:
          `Has ${characters.length} characters across ${media.length} titles.\n\n${ratingCount}${discord.emotes.smolStar}`,
      });

      const ids = [
        party?.member1?.id,
        party?.member2?.id,
        party?.member3?.id,
        party?.member4?.id,
        party?.member5?.id,
      ].filter(Boolean);

      const ratings = [
        party?.member1?.rating,
        party?.member2?.rating,
        party?.member3?.rating,
        party?.member4?.rating,
        party?.member5?.rating,
      ].filter(Boolean);

      const list = await packs.all({ guildId });

      const chars = await packs.characters({
        ids,
        guildId,
      });

      const partyMembers = ids.map((characterId, i) => {
        if (!characterId) {
          return;
        }

        const character = chars.find(({ packId, id }) =>
          characterId === `${packId}:${id}`
        );

        if (
          !character ||
          packs.isDisabled(characterId, list)
        ) {
          return;
        }

        return `${ratings[i]}${discord.emotes.smolStar}${
          packs.aliasToArray(character.name)[0]
        }`;
      }).filter(Boolean);

      embed.addField({
        value: partyMembers.join('\n'),
      });

      message.addEmbed(embed);

      return discord.Message.page({
        target: userId,
        type: 'profile',
        index: 0,
        total: 1,
        message,
        next: false,
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
        { url: `${config.origin}/assets/spinner3.gif` },
      ),
    );

  return loading;
}

const user = {
  now,
  profile,
  findCharacter,
  userCharacters,
  customize,
  stars,
  media,
  list,
};

export default user;
