import 'https://esm.sh/@total-typescript/ts-reset@0.3.7/filter-boolean';

import { gql, request } from './graphql.ts';

import config, { faunaUrl } from './config.ts';

import Rating from './rating.ts';

import packs from './packs.ts';

import * as discord from './discord.ts';

import { default as srch } from './search.ts';

import { Character, DisaggregatedCharacter, Schema } from './types.ts';

async function view({
  userId,
  guildId,
}: {
  userId: string;
  guildId: string;
  channelId?: string;
}): Promise<discord.Message> {
  const query = gql`
    query ($userId: String!, $guildId: String!) {
      getUserInventory(userId: $userId, guildId: $guildId) {
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

  const message = new discord.Message();

  const { party } = (await request<{
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

  const ratings = [
    party?.member1?.rating,
    party?.member2?.rating,
    party?.member3?.rating,
    party?.member4?.rating,
    party?.member5?.rating,
  ];

  const [media, characters] = await Promise.all([
    packs.media({ ids: mediaIds.filter(Boolean) }),
    packs.characters({ ids: ids.filter(Boolean) }),
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
      packs.isDisabled(characterId) ||
      // deno-lint-ignore no-non-null-assertion
      packs.isDisabled(mediaIds[i]!)
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
      rating: new Rating({ stars: ratings[i] }),
      description: false,
      footer: false,
    });

    message.addEmbed(embed);
  });

  return message;
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
  channelId?: string;
  spot?: number;
  search?: string;
  id?: string;
}): Promise<discord.Message> {
  const query = gql`
    mutation ($userId: String!, $guildId: String!, $characterId: String!, $spot: Int) {
      setCharacterToParty(userId: $userId, guildId: $guildId, characterId: $characterId, spot: $spot) {
        ok
        error
        character {
          id
          mediaId
          rating
          user {
            id
          }
        }
      }
    }
  `;

  const results: (Character | DisaggregatedCharacter)[] = await packs
    .characters(id ? { ids: [id] } : { search });

  if (!results.length) {
    throw new Error('404');
  }

  const message = new discord.Message();

  const characterId = `${results[0].packId}:${results[0].id}`;

  const response = (await request<{
    setCharacterToParty: Schema.Mutation;
  }>({
    url: faunaUrl,
    query,
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
    .addEmbed(new discord.Embed().setDescription('ASSIGNED'))
    .addEmbed(srch.characterEmbed(results[0], {
      mode: 'thumbnail',
      rating: new Rating({ stars: response.character.rating }),
      description: true,
      footer: false,
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

async function remove({
  spot,
  userId,
  guildId,
}: {
  spot: number;
  userId: string;
  guildId: string;
  channelId?: string;
}): Promise<discord.Message> {
  const query = gql`
    mutation ($userId: String!, $guildId: String!, $spot: Int!) {
      removeCharacterFromParty(userId: $userId, guildId: $guildId, spot: $spot) {
        ok
        character {
          id
          mediaId
          rating
        }
      }
    }
  `;

  const message = new discord.Message();

  const response = (await request<{
    removeCharacterFromParty: Schema.Mutation;
  }>({
    url: faunaUrl,
    query,
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

  const [characters] = await Promise.all([
    // packs.media({ ids: [response.character.mediaId] }),
    packs.characters({ ids: [response.character.id] }),
  ]);

  if (!characters.length) {
    return message
      .addEmbed(new discord.Embed().setDescription(`REMOVED FROM #${spot}`))
      .addEmbed(
        new discord.Embed().setDescription(
          'This character was removed or disabled',
        ),
      );
  }

  return message
    .addEmbed(new discord.Embed().setDescription('REMOVED'))
    .addEmbed(srch.characterEmbed(characters[0], {
      mode: 'thumbnail',
      rating: new Rating({ stars: response.character.rating }),
      description: true,
      footer: false,
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
  remove,
};

export default user;
