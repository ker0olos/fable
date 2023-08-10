import '#filter-boolean';

import { gql, request } from './graphql.ts';

import config, { faunaUrl } from './config.ts';

import user from './user.ts';
import packs from './packs.ts';

import utils from './utils.ts';

import Rating from './rating.ts';

import * as discord from './discord.ts';

import { default as srch } from './search.ts';

import { Character, Schema } from './types.ts';

async function embed({ guildId, party }: {
  guildId: string;
  party: Schema.Inventory['party'];
}): Promise<discord.Message> {
  const message = new discord.Message();

  const ids = [
    party?.member1?.id,
    party?.member2?.id,
    party?.member3?.id,
    party?.member4?.id,
    party?.member5?.id,
  ];

  const mediaIds = [
    party?.member1?.mediaId,
    party?.member2?.mediaId,
    party?.member3?.mediaId,
    party?.member4?.mediaId,
    party?.member5?.mediaId,
  ];

  const members = [
    party?.member1,
    party?.member2,
    party?.member3,
    party?.member4,
    party?.member5,
  ];

  const [media, characters] = await Promise.all([
    packs.media({ ids: mediaIds.filter(Boolean), guildId }),
    packs.characters({ ids: ids.filter(Boolean), guildId }),
  ]);

  ids.forEach((characterId, i) => {
    if (!characterId) {
      message.addEmbed(new discord.Embed().setDescription('Unassigned'));
      return;
    }

    const character = characters.find(({ packId, id }) =>
      characterId === `${packId}:${id}`
    );

    const mediaIndex = media.findIndex(({ packId, id }) =>
      // deno-lint-ignore no-non-null-assertion
      mediaIds[i]! === `${packId}:${id}`
    );

    if (
      !character ||
      mediaIndex === -1 ||
      packs.isDisabled(characterId, guildId) ||
      // deno-lint-ignore no-non-null-assertion
      packs.isDisabled(mediaIds[i]!, guildId)
    ) {
      return message.addEmbed(
        new discord.Embed().setDescription(
          'This character was removed or disabled',
        ),
      );
    }

    const embed = srch.characterEmbed(character, {
      mode: 'thumbnail',
      media: { title: packs.aliasToArray(media[mediaIndex].title)[0] },
      rating: new Rating({ stars: members[i]?.rating }),
      description: false,
      footer: false,
      existing: {
        image: members[i]?.image,
        nickname: members[i]?.nickname,
      },
    })
      .setFooter({
        text: `${members[i]?.combat?.stats?.strength ?? 0}-${
          members[i]?.combat?.stats?.stamina ?? 0
        }-${members[i]?.combat?.stats?.agility ?? 0}`,
      });

    message.addEmbed(embed);
  });

  return message;
}

function view({ token, userId, guildId }: {
  token: string;
  userId: string;
  guildId: string;
}): discord.Message {
  user.getUserCharacters({ userId, guildId })
    .then(async ({ party }) => {
      const message = await embed({ guildId, party });

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
        { url: `${config.origin}/assets/spinner3.gif` },
      ),
    );

  return loading;
}

function assign({
  token,
  spot,
  userId,
  guildId,
  search,
  id,
}: {
  token: string;
  userId: string;
  guildId: string;
  spot?: number;
  search?: string;
  id?: string;
}): discord.Message {
  packs
    .characters(id ? { ids: [id], guildId } : { search, guildId })
    .then(async (results) => {
      const mutation = gql`
        mutation ($userId: String!, $guildId: String!, $characterId: String!, $spot: Int) {
          setCharacterToParty(userId: $userId, guildId: $guildId, characterId: $characterId, spot: $spot) {
            ok
            error
            character {
              id
              mediaId
              rating
              image
              nickname
              user {
                id
              }
            }
          }
        }
      `;

      const character = await packs.aggregate<Character>({
        character: results[0],
        guildId,
        end: 1,
      });

      const media = character.media?.edges?.[0]?.node;

      if (
        !results.length ||
        packs.isDisabled(`${character.packId}:${character.id}`, guildId) ||
        (media && packs.isDisabled(`${media.packId}:${media.id}`, guildId))
      ) {
        throw new Error('404');
      }

      const message = new discord.Message();

      const characterId = `${character.packId}:${character.id}`;

      const response = (await request<{
        setCharacterToParty: Schema.Mutation;
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
          spot,
        },
      })).setCharacterToParty;

      if (!response.ok) {
        const names = packs.aliasToArray(results[0].name);

        switch (response.error) {
          case 'CHARACTER_NOT_FOUND': {
            return message.addEmbed(
              new discord.Embed().setDescription(
                `${names[0]} hasn't been found by anyone yet`,
              ),
            ).addComponents([
              new discord.Component()
                .setLabel('/character')
                .setId(`character`, characterId),
            ]).patch(token);
          }
          case 'CHARACTER_NOT_OWNED':
            return message.addEmbed(
              new discord.Embed().setDescription(
                `${
                  names[0]
                } is owned by <@${response.character.user.id}> and cannot be assigned to your party`,
              ),
            ).addComponents([
              new discord.Component()
                .setLabel('/character')
                .setId(
                  `character`,
                  response.character.id,
                ),
            ]).patch(token);
          default:
            throw new Error(response.error);
        }
      }

      return message
        .addEmbed(new discord.Embed().setDescription('Assigned'))
        .addEmbed(srch.characterEmbed(results[0], {
          mode: 'thumbnail',
          rating: new Rating({ stars: response.character.rating }),
          description: true,
          footer: false,
          existing: {
            image: response.character.image,
            nickname: response.character.nickname,
          },
        }))
        .addComponents([
          new discord.Component()
            .setLabel('/character')
            .setId(
              `character`,
              response.character.id,
            ),
        ]).patch(token);
    })
    .catch(async (err) => {
      if (err.message === '404') {
        await new discord.Message()
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
        { url: `${config.origin}/assets/spinner3.gif` },
      ),
    );

  return loading;
}

function swap({ token, a, b, userId, guildId }: {
  token: string;
  a: number;
  b: number;
  userId: string;
  guildId: string;
}): discord.Message {
  const mutation = gql`
    mutation ($userId: String!, $guildId: String!, $a: Int!, $b: Int!) {
      swapCharactersInParty(userId: $userId, guildId: $guildId, a: $a, b: $b) {
        ok
        inventory {
          party {
            member1 {
              id
              mediaId
              rating
              image
              nickname
            }
            member2 {
              id
              mediaId
              rating
              image
              nickname
            }
            member3 {
              id
              mediaId
              rating
              image
              nickname
            }
            member4 {
              id
              mediaId
              rating
              image
              nickname
            }
            member5 {
              id
              mediaId
              rating
              image
              nickname
            }
          }
        }
      }
    }
  `;

  request<{
    swapCharactersInParty: Schema.Mutation;
  }>({
    url: faunaUrl,
    query: mutation,
    headers: {
      'authorization': `Bearer ${config.faunaSecret}`,
    },
    variables: {
      userId,
      guildId,
      a,
      b,
    },
  })
    .then(async ({ swapCharactersInParty: response }) => {
      if (!response.ok) {
        throw new Error(response.error);
      }

      return (await embed({ guildId, party: response.inventory.party }))
        .patch(token);
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

function remove({ token, spot, userId, guildId }: {
  token: string;
  spot: number;
  userId: string;
  guildId: string;
}): discord.Message {
  const mutation = gql`
    mutation ($userId: String!, $guildId: String!, $spot: Int!) {
      removeCharacterFromParty(userId: $userId, guildId: $guildId, spot: $spot) {
        ok
        character {
          id
          mediaId
          rating
          image
          nickname
        }
      }
    }
  `;

  request<{
    removeCharacterFromParty: Schema.Mutation;
  }>({
    url: faunaUrl,
    query: mutation,
    headers: {
      'authorization': `Bearer ${config.faunaSecret}`,
    },
    variables: {
      userId,
      guildId,
      spot,
    },
  })
    .then(async ({ removeCharacterFromParty: response }) => {
      if (!response.ok) {
        throw new Error(response.error);
      }

      const message = new discord.Message();

      if (!response.character) {
        return message.addEmbed(
          new discord.Embed().setDescription(
            'There was no character assigned to this spot of the party',
          ),
        ).patch(token);
      }

      const characters = await packs.characters({
        ids: [response.character.id],
        guildId,
      });

      if (
        !characters.length ||
        packs.isDisabled(response.character.id, guildId) ||
        packs.isDisabled(response.character.mediaId, guildId)
      ) {
        return message
          .addEmbed(new discord.Embed().setDescription(`Removed #${spot}`))
          .addEmbed(
            new discord.Embed().setDescription(
              'This character was removed or disabled',
            ),
          ).patch(token);
      }

      return message
        .addEmbed(new discord.Embed().setDescription('Removed'))
        .addEmbed(srch.characterEmbed(characters[0], {
          mode: 'thumbnail',
          rating: new Rating({ stars: response.character.rating }),
          description: true,
          footer: false,
          existing: {
            image: response.character.image,
            nickname: response.character.nickname,
          },
        }))
        .addComponents([
          new discord.Component()
            .setLabel('/character')
            .setId(
              `character`,
              response.character.id,
            ),
        ]).patch(token);
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

const party = {
  view,
  assign,
  swap,
  remove,
};

export default party;
