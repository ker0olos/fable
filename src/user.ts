import { gql, request } from './graphql.ts';

import config, { faunaUrl } from './config.ts';

import Rating from './rating.ts';

import packs from './packs.ts';

import utils from './utils.ts';

import * as discord from './discord.ts';

import { characterMessage } from './search.ts';

import {
  Character,
  DisaggregatedCharacter,
  DisaggregatedMedia,
  Media,
  Schema,
} from './types.ts';

export async function now({
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
        availablePulls
        rechargeTimestamp
      }
    }
  `;

  const message = new discord.Message();

  const { availablePulls, rechargeTimestamp } = (await request<{
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

  if (availablePulls > 0) {
    message.addComponents([
      // `/gacha` shortcut
      new discord.Component()
        .setId('gacha', userId)
        .setLabel('/gacha'),
    ]);
  }

  if (availablePulls < 5) {
    message.addEmbed(
      new discord.Embed()
        .setDescription(
          `+1 <t:${utils.rechargeTimestamp({ rechargeTimestamp })}:R>`,
        ),
    );
  }

  return message;
}

export async function findCharacter({
  guildId,
  characterId,
}: {
  guildId?: string;
  channelId?: string;
  characterId?: string;
}): Promise<
  {
    userId: string;
    mediaId: string;
    rating: number;
  } | undefined
> {
  if (!guildId || !characterId) {
    return undefined;
  }

  const query = gql`
    query ($guildId: String!, $characterId: String!) {
      findCharacter(guildId: $guildId, characterId: $characterId) {
        mediaId
        rating
        user {
          id
        }
      }
    }
  `;

  const result = (await request<{
    findCharacter?: {
      user: { id: string };
      mediaId: string;
      rating: number;
    };
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

  return {
    userId: result.user.id,
    mediaId: result.mediaId,
    rating: result.rating,
  };
}

export async function stars({
  userId,
  guildId,
  stars,
  nick,
  before,
  after,
}: {
  userId: string;
  guildId: string;
  channelId?: string;
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
    return new discord.Message()
      .addEmbed(
        new discord.Embed()
          .setDescription(
            `${
              nick ? `${utils.capitalize(nick)} doesn't` : 'You don\'t'
            } have any ${stars}* characters`,
          ),
      )
      .addComponents([
        // `/gacha` shortcut
        new discord.Component()
          .setId('gacha', userId)
          .setLabel('/gacha'),
      ]);
  }

  const results: [
    (Media | DisaggregatedMedia)[],
    (Character | DisaggregatedCharacter)[],
  ] = await Promise.all([
    packs.media({ ids: [character.mediaId] }),
    packs.characters({ ids: [character.id] }),
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
    message = characterMessage(
      results[1][0],
      {
        relations: [results[0][0] as DisaggregatedMedia],
        rating: new Rating({ stars: character.rating }),
        media: {
          title: packs.aliasToArray(results[0][0].title)[0],
        },
      },
    );
  }

  return discord.Message.anchor({
    id: userId,
    type: 'cstars',
    target: stars,
    anchor,
    message,
  });
}

export async function media({
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
  channelId?: string;
  id?: string;
  search?: string;
  nick?: string;
  before?: string;
  after?: string;
}): Promise<discord.Message> {
  const results: (Media | DisaggregatedMedia)[] = await packs
    .media(id ? { ids: [id] } : { search });

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
    return new discord.Message()
      .addEmbed(
        new discord.Embed()
          .setDescription(
            `${
              nick ? `${utils.capitalize(nick)} doesn't` : 'You don\'t'
            } have any ${titles[0]} characters`,
          ),
      )
      .addComponents([
        // `/gacha` shortcut
        new discord.Component()
          .setId('gacha', userId)
          .setLabel('/gacha'),
      ]);
  }

  const characters = await packs.characters({ ids: [character.id] });

  let message: discord.Message;

  if (!characters.length) {
    message = new discord.Message()
      .addEmbed(
        new discord.Embed()
          .setDescription('This character was removed or disabled'),
      );
  } else {
    message = characterMessage(
      characters[0],
      {
        relations: [media as DisaggregatedMedia],
        rating: new Rating({ stars: character.rating }),
        media: {
          title: titles[0],
        },
      },
    );
  }

  return discord.Message.anchor({
    id: userId,
    type: 'cmedia',
    target: mediaId,
    anchor,
    message,
  });
}
