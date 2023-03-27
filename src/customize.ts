import { gql, request } from './graphql.ts';

import config, { faunaUrl } from './config.ts';

import packs from './packs.ts';

import * as discord from './discord.ts';

import { default as srch } from './search.ts';

import { Character, DisaggregatedCharacter, Schema } from './types.ts';

async function image({
  userId,
  guildId,
  image,
  search,
  id,
}: {
  userId: string;
  guildId: string;
  image: string;
  search?: string;
  id?: string;
}): Promise<discord.Message> {
  const mutation = gql`
    mutation ($userId: String!, $guildId: String!, $characterId: String!, $image: String!) {
      customizeCharacter(userId: $userId, guildId: $guildId, characterId: $characterId, image: $image) {
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
    .characters(id ? { ids: [id], guildId } : { search, guildId });

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
    },
  })).customizeCharacter;

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
            .setId(`character`, characterId)
            .setLabel('/character'),
        ]);
      }
      case 'CHARACTER_NOT_OWNED':
        return message.addEmbed(
          new discord.Embed().setDescription(
            `${
              names[0]
            } is owned by <@${response.character.user.id}> and cannot be customized by you.`,
          ),
        ).addComponents([
          new discord.Component()
            .setId(`character`, response.character.id)
            .setLabel('/character'),
        ]);
      default:
        throw new Error(response.error);
    }
  }

  return message
    .addEmbed(srch.characterEmbed(results[0], {
      rating: false,
      description: false,
      media: { title: true },
      footer: true,
    }))
    .addComponents([
      new discord.Component()
        .setId(`character`, response.character.id)
        .setLabel('/character'),
    ]);
}

const customize = {
  image,
};

export default customize;
