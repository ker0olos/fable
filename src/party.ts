import '#filter-boolean';

import { gql, request } from './graphql.ts';

import config, { faunaUrl } from './config.ts';

import utils from './utils.ts';

import Rating from './rating.ts';

import packs from './packs.ts';

import * as discord from './discord.ts';

import { default as srch } from './search.ts';

import { Character, DisaggregatedCharacter, Schema } from './types.ts';

// TODO add loading spinners

async function embed({ guildId, inventory }: {
  guildId: string;
  inventory: Schema.Inventory;
}): Promise<discord.Message> {
  const message = new discord.Message();

  const ids = [
    inventory.party?.member1?.id,
    inventory.party?.member2?.id,
    inventory.party?.member3?.id,
    inventory.party?.member4?.id,
    inventory.party?.member5?.id,
  ];

  const mediaIds = [
    inventory.party?.member1?.mediaId,
    inventory.party?.member2?.mediaId,
    inventory.party?.member3?.mediaId,
    inventory.party?.member4?.mediaId,
    inventory.party?.member5?.mediaId,
  ];

  const members = [
    inventory.party?.member1,
    inventory.party?.member2,
    inventory.party?.member3,
    inventory.party?.member4,
    inventory.party?.member5,
  ];

  // load community packs
  await packs.all({ guildId });

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
  const query = gql`
    query ($userId: String!, $guildId: String!) {
      getUserInventory(userId: $userId, guildId: $guildId) {
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
    .then(async ({ getUserInventory: inventory }) => {
      const message = await embed({ guildId, inventory });

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

async function assign({
  spot,
  userId,
  guildId,
  search,
  id,
}: {
  userId: string;
  guildId: string;
  spot?: number;
  search?: string;
  id?: string;
}): Promise<discord.Message> {
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

  const results: (Character | DisaggregatedCharacter)[] = await packs
    .characters(id ? { ids: [id], guildId } : { search, guildId });

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

    message.setFlags(discord.MessageFlags.Ephemeral);

    switch (response.error) {
      case 'CHARACTER_NOT_FOUND': {
        return message.addEmbed(
          new discord.Embed().setDescription(
            `${names[0]} hasn't been found by anyone yet.`,
          ),
        ).addComponents([
          new discord.Component()
            .setLabel('/character')
            .setId(`character`, characterId),
        ]);
      }
      case 'CHARACTER_NOT_OWNED':
        return message.addEmbed(
          new discord.Embed().setDescription(
            `${
              names[0]
            } is owned by <@${response.character.user.id}> and cannot be assigned to your party.`,
          ),
        ).addComponents([
          new discord.Component()
            .setLabel('/character')
            .setId(
              `character`,
              response.character.id,
            ),
        ]);
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
    ]);
}

async function swap({ a, b, userId, guildId }: {
  a: number;
  b: number;
  userId: string;
  guildId: string;
}): Promise<discord.Message> {
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

  const response = (await request<{
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
  })).swapCharactersInParty;

  if (!response.ok) {
    throw new Error(response.error);
  }

  return embed({ guildId, inventory: response.inventory });
}

async function remove({ spot, userId, guildId }: {
  spot: number;
  userId: string;
  guildId: string;
}): Promise<discord.Message> {
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

  const message = new discord.Message();

  const response = (await request<{
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
  })).removeCharacterFromParty;

  if (!response.ok) {
    throw new Error(response.error);
  }

  if (!response.character) {
    return message.addEmbed(
      new discord.Embed().setDescription(
        'There was no character assigned to this spot of the party',
      ),
    );
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
      );
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
    ]);
}

const user = {
  view,
  assign,
  swap,
  remove,
};

export default user;
