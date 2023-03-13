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
  userId,
  guildId,
}: {
  userId: string;
  guildId: string;
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
          `_Can vote again in <t:${
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
        .setId('gacha=1')
        .setLabel('/gacha'),
    ]);
  }

  if (!user.lastVote || voting.canVote) {
    message.addComponents([
      new discord.Component()
        .setLabel(!user.lastVote ? 'Vote for Rewards' : 'Vote')
        .setUrl('https://top.gg/bot/1041970851559522304/vote'),
    ]);
  }

  return message;
}

async function findCharacter({
  guildId,
  characterId,
}: {
  guildId?: string;
  characterId?: string;
}): Promise<
  {
    id: string;
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
        id
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

  return {
    id: result.id,
    userId: result.user.id,
    mediaId: result.mediaId,
    rating: result.rating,
  };
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
            } have any ${stars}* characters`,
          ),
      );

    if (!nick) {
      message.addComponents([
        // `/gacha` shortcut
        new discord.Component()
          .setId('gacha', '1')
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
          .setId('gacha', '1')
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

const user = {
  now,
  findCharacter,
  userCharacters,
  stars,
  media,
};

export default user;
