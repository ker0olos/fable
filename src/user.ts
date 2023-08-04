import '#filter-boolean';

import { gql, request } from './graphql.ts';

import config, { faunaUrl } from './config.ts';

import i18n from './i18n.ts';
import utils from './utils.ts';
import packs from './packs.ts';

import Rating from './rating.ts';

import { voteComponent } from './shop.ts';

import { default as srch, relationFilter } from './search.ts';

import * as discord from './discord.ts';

import {
  Character,
  DisaggregatedCharacter,
  DisaggregatedMedia,
  Media,
  Schema,
} from './types.ts';

import { COSTS } from '../models/add_tokens_to_user.ts';

const cachedUsers: Record<string, {
  locale: discord.AvailableLocales;
}> = {};

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
    likes: user?.likes,
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
        stealTimestamp
        user {
          lastVote
          availableVotes
          guarantees
        }
      }
    }
  `;

  const message = new discord.Message();

  const locale = cachedUsers[userId]?.locale;

  const { user, availablePulls, stealTimestamp, rechargeTimestamp } =
    (await request<{
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
      .setFooter({
        text: availablePulls === 1
          ? i18n.get('available-pull', locale)
          : i18n.get('available-pulls', locale),
      }),
  );

  if (user.availableVotes) {
    message.addEmbed(
      new discord.Embed()
        .setTitle(`**${user.availableVotes}**`)
        .setFooter({
          text: user.availableVotes === 1
            ? i18n.get('daily-token', locale)
            : i18n.get('daily-tokens', locale),
        }),
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
        .setDescription(i18n.get('+1-pull', locale, `<t:${recharge}:R>`)),
    );
  }

  if (user.lastVote && !voting.canVote) {
    message.addEmbed(
      new discord.Embed()
        .setDescription(
          i18n.get(
            'can-vote-again',
            locale,
            `<t:${utils.votingTimestamp(user.lastVote).timeLeft}:R>`,
          ),
        ),
    );
  }

  if (new Date(stealTimestamp ?? new Date()).getTime() > Date.now()) {
    message.addEmbed(
      new discord.Embed()
        .setDescription(
          i18n.get(
            'steal-cooldown-ends',
            locale,
            `<t:${utils.stealTimestamp(stealTimestamp)}:R>`,
          ),
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

  if (user.availableVotes && user.availableVotes >= COSTS.FIVE) {
    // `/buy guaranteed` 5 shortcut
    message.addComponents([
      new discord.Component()
        .setId('buy', 'bguaranteed', userId, '5')
        .setLabel(`/buy guaranteed 5`),
    ]);
  } else if (user.availableVotes && user.availableVotes >= COSTS.FOUR) {
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
      voteComponent({
        token,
        guildId,
      }),
    ]);
  }

  if (mention) {
    message
      .setContent(`<@${userId}>`)
      .setPing();
  }

  return message;
}

async function findCharacters({
  guildId,
  ids,
}: {
  guildId?: string;
  ids?: string[];
}): Promise<(Schema.Character | undefined)[]> {
  if (!guildId || !ids?.length) {
    return [];
  }

  const query = gql`
    query ($guildId: String!, $charactersId: [String!]) {
      findCharacters(guildId: $guildId, charactersId: $charactersId) {
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

  const results = (await request<{
    findCharacters?: Schema.Character[];
  }>({
    url: faunaUrl,
    query,
    headers: {
      'authorization': `Bearer ${config.faunaSecret}`,
    },
    variables: {
      charactersId: ids,
      guildId,
    },
  })).findCharacters;

  if (!results?.length) {
    return [];
  }

  return ids
    .map((id) => results.find((r) => r.id === id));
}

async function findCharacter({
  guildId,
  characterId,
}: {
  guildId?: string;
  characterId?: string;
}): Promise<Schema.Character | undefined> {
  if (!guildId || !characterId) {
    return;
  }

  return (await user.findCharacters({ guildId, ids: [characterId] }))[0];
}

function nick({
  token,
  userId,
  guildId,
  nick,
  search,
  id,
}: {
  token: string;
  userId: string;
  guildId: string;
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

  const locale = cachedUsers[userId]?.locale;

  packs
    .characters(id ? { ids: [id], guildId } : { search, guildId })
    .then(async (results: (Character | DisaggregatedCharacter)[]) => {
      if (
        !results.length ||
        packs.isDisabled(`${results[0].packId}:${results[0].id}`, guildId)
      ) {
        throw new Error('404');
      }

      const character = await packs.aggregate<Character>({
        guildId,
        character: results[0],
        end: 1,
      });

      const media = character.media?.edges?.[0]?.node;

      if (media && packs.isDisabled(`${media.packId}:${media.id}`, guildId)) {
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
                  i18n.get('character-hasnt-been-found', locale, names[0]),
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
                  i18n.get(
                    'character-not-owned-by-you',
                    locale,
                    names[0],
                    `<@${response.character.user.id}>`,
                  ),
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

      const name = packs.aliasToArray(character.name)[0];

      message
        .addEmbed(
          new discord.Embed().setDescription(
            !nick ? i18n.get('nickname-reset', locale, name) : i18n.get(
              'nickname-changed',
              locale,
              name,
              // deno-lint-ignore no-non-null-assertion
              response.character.nickname!,
            ),
          ),
        )
        .addEmbed(srch.characterEmbed(
          character,
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
        ));

      return message.patch(token);
    })
    .catch(async (err) => {
      if (err.message === '404') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('found-nothing', locale),
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
  image,
  search,
  id,
}: {
  token: string;
  userId: string;
  guildId: string;
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

  const locale = cachedUsers[userId]?.locale;

  packs
    .characters(id ? { ids: [id], guildId } : { search, guildId })
    .then(async (results: (Character | DisaggregatedCharacter)[]) => {
      if (
        !results.length ||
        packs.isDisabled(`${results[0].packId}:${results[0].id}`, guildId)
      ) {
        throw new Error('404');
      }

      const character = await packs.aggregate<Character>({
        guildId,
        character: results[0],
        end: 1,
      });

      const media = character.media?.edges?.[0]?.node;

      if (media && packs.isDisabled(`${media.packId}:${media.id}`, guildId)) {
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
                  i18n.get('character-hasnt-been-found', locale, names[0]),
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
                  i18n.get(
                    'character-not-owned-by-you',
                    locale,
                    names[0],
                    `<@${response.character.user.id}>`,
                  ),
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

      const name = packs.aliasToArray(character.name)[0];

      message
        .addEmbed(
          new discord.Embed().setDescription(
            !image ? i18n.get('image-reset', locale, name) : i18n.get(
              'image-changed',
              locale,
              name,
              // deno-lint-ignore no-non-null-assertion
              response.character.image!,
            ),
          ),
        )
        .addEmbed(srch.characterEmbed(
          character,
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
        ));

      return message.patch(token);
    })
    .catch(async (err) => {
      if (err.message === '404') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('found-nothing', locale),
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
  mention,
  search,
  undo,
  id,
}: {
  token: string;
  userId: string;
  guildId: string;
  undo: boolean;
  mention?: boolean;
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

  const locale = cachedUsers[userId]?.locale;

  packs
    .characters(id ? { ids: [id], guildId } : { search, guildId })
    .then(async (results: (Character | DisaggregatedCharacter)[]) => {
      if (
        !results.length ||
        packs.isDisabled(`${results[0].packId}:${results[0].id}`, guildId)
      ) {
        throw new Error('404');
      }

      const character = await packs.aggregate<Character>({
        guildId,
        character: results[0],
        end: 1,
      });

      const media = character.media?.edges?.[0]?.node;

      if (media && packs.isDisabled(`${media.packId}:${media.id}`, guildId)) {
        throw new Error('404');
      }

      const message = new discord.Message();

      const characterId = `${character.packId}:${character.id}`;

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

      if (mention) {
        message
          .setContent(`<@${userId}>`)
          .setPing();
      }

      message
        .addEmbed(srch.characterEmbed(
          character,
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
              i18n.get('found-nothing', locale),
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
  search,
  undo,
  id,
}: {
  token: string;
  userId: string;
  guildId: string;
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

  const locale = cachedUsers[userId]?.locale;

  packs
    .media(id ? { ids: [id], guildId } : { search, guildId })
    .then(async (results: (Media | DisaggregatedMedia)[]) => {
      if (
        !results.length ||
        packs.isDisabled(`${results[0].packId}:${results[0].id}`, guildId)
      ) {
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
              i18n.get('found-nothing', locale),
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
  const locale = cachedUsers[userId]?.locale;

  user.getUserCharacters({ userId, guildId })
    .then(async ({ characters, party, likes }) => {
      const embed = new discord.Embed();

      const message = new discord.Message();

      const members = [
        party?.member1?.id,
        party?.member2?.id,
        party?.member3?.id,
        party?.member4?.id,
        party?.member5?.id,
      ];

      let media: Media[] = [];

      if (rating) {
        characters = characters.filter((char) => char.rating === rating);
      }

      if (search || id) {
        const results = await packs
          .media(id ? { ids: [id], guildId } : { search, guildId });

        if (
          !results.length ||
          packs.isDisabled(`${results[0].packId}:${results[0].id}`, guildId)
        ) {
          throw new Error('404');
        }

        const parent = await packs.aggregate<Media>({
          media: results[0],
          guildId,
        });

        media = [
          parent,
          ...(parent.relations?.edges?.filter(({ relation }) =>
            // deno-lint-ignore no-non-null-assertion
            relationFilter.includes(relation!)
          ).map(({ node }) => node) ?? []),
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

      const chunks = utils.chunks(characters, 5);

      const _characters = await packs.characters({
        ids: chunks[index]?.map(({ id }) => id),
        guildId,
      });

      await Promise.all(_characters.map(async (char) => {
        // deno-lint-ignore no-non-null-assertion
        const existing = chunks[index].find(({ id }) =>
          id === `${char.packId}:${char.id}`
        )!;

        const media = (await packs.aggregate<Character>({
          character: char,
          guildId,
        })).media?.edges?.[0]?.node;

        const mediaTitle = media?.title
          ? utils.wrap(
            packs.aliasToArray(media.title)[0],
          )
          : undefined;

        const name = `${existing.rating}${discord.emotes.smolStar}${
          members?.some((member) => member === existing.id)
            ? discord.emotes.member
            : likes?.some((like) => like.characterId === existing.id)
            ? `${discord.emotes.liked}`
            : ''
        } ${existing.nickname ?? utils.wrap(packs.aliasToArray(char.name)[0])}`;

        if (
          packs.isDisabled(`${char.packId}:${char.id}`, guildId) ||
          (
            media &&
            packs.isDisabled(`${media.packId}:${media.id}`, guildId)
          )
        ) {
          return;
        }

        embed.addField({
          inline: false,
          name: mediaTitle ? mediaTitle : name,
          value: mediaTitle ? name : undefined,
        });
      }));

      if (embed.getFieldsCount() <= 0) {
        message.addEmbed(embed.setDescription(
          nick
            ? (media.length
              ? i18n.get(
                'user-empty-media-collection',
                locale,
                `<@${userId}>`,
                packs.aliasToArray(media[0].title)[0],
              )
              : i18n.get(
                'user-empty-collection',
                locale,
                `<@${userId}>`,
                rating ? `${rating}${discord.emotes.smolStar}` : '',
              ))
            : (media.length
              ? i18n.get(
                'you-empty-media-collection',
                locale,
                packs.aliasToArray(media[0].title)[0],
              )
              : i18n.get(
                'you-empty-collection',
                locale,
                rating ? `${rating}${discord.emotes.smolStar}` : '',
              )),
        ));

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
              i18n.get('found-nothing', locale),
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
  filter,
}: {
  token: string;
  index: number;
  userId: string;
  guildId: string;
  nick?: boolean;
  filter?: boolean;
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

      let { likes } = getUserInventory.user;

      likes ??= [];

      // sort so that all media likes are in the bottom of the list
      likes.sort((a, b) => {
        const aId = typeof a.characterId === 'string';
        const bId = typeof b.characterId === 'string';

        if (aId && !bId) {
          return -1;
        } else if (!aId && bId) {
          return 1;
        } else {
          return 0;
        }
      });

      // find the ownership info of all liked characters
      const results = await user.findCharacters({
        guildId,
        ids: likes.map(({ characterId }) => characterId)
          .filter(Boolean),
      });

      // filter out characters that are owned by the user
      if (filter) {
        likes = likes.filter((like, i) => {
          return like.characterId && results[i]?.user.id !== userId;
        });
      }

      const chunks = utils.chunks(likes, 5);

      const [characters, media] = await Promise.all([
        await packs.characters({
          guildId,
          ids: chunks[index]?.map(({ characterId }) => characterId)
            .filter(Boolean),
        }),
        await packs.media({
          guildId,
          ids: chunks[index]?.map(({ mediaId }) => mediaId)
            .filter(Boolean),
        }),
      ]);

      await Promise.all(
        characters.map(async (character) => {
          const existing = results.find((r) =>
            r?.id === `${character.packId}:${character.id}`
          );

          const char = await packs.aggregate<Character>({
            guildId,
            character,
            end: 1,
          });

          const rating = existing?.rating ?? Rating.fromCharacter(char).stars;

          const media = char.media?.edges?.[0]?.node;

          const mediaTitle = media?.title
            ? utils.wrap(
              packs.aliasToArray(media.title)[0],
            )
            : undefined;

          const name = `${rating}${discord.emotes.smolStar} ${
            existing ? `<@${existing.user.id}> ` : ''
          }${utils.wrap(packs.aliasToArray(char.name)[0])}`;

          if (
            packs.isDisabled(`${char.packId}:${char.id}`, guildId) ||
            (
              media &&
              packs.isDisabled(`${media.packId}:${media.id}`, guildId)
            )
          ) {
            return;
          }

          embed.addField({
            inline: false,
            name: mediaTitle ? mediaTitle : name,
            value: mediaTitle ? name : undefined,
          });
        }),
      );

      media.forEach((media) => {
        const title = utils.wrap(packs.aliasToArray(media.title)[0]);

        embed.addField({
          inline: false,
          name: title,
          value: discord.emotes.all,
        });
      });

      if (embed.getFieldsCount() <= 0) {
        message.addEmbed(embed.setDescription(
          `${nick ? `<@${userId}> doesn't` : 'You don\'t'} have any likes`,
        ));

        return message.patch(token);
      }

      return discord.Message.page({
        index,
        type: 'likes',
        target: discord.join(userId, filter ? '1' : '0'),
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
          mediaId
          rating
          nickname
        }
      }
    }
  `;

  const locale = cachedUsers[userId]?.locale;

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

      const names: string[] = [];

      const results = await packs.characters({
        guildId,
        ids: characters.map(({ id }) => id),
      });

      characters.toReversed().forEach((existing) => {
        const char = results.find(({ packId, id }) =>
          `${packId}:${id}` === existing.id
        );

        if (
          !char ||
          packs.isDisabled(`${char.packId}:${char.id}`, guildId) ||
          packs.isDisabled(existing.mediaId, guildId)
        ) {
          return;
        }

        const name = `${existing.rating}${discord.emotes.smolStar} ${
          existing.nickname ?? utils.wrap(packs.aliasToArray(char.name)[0])
        }`;

        names.push(name);
      });

      if (names.length <= 0) {
        message.addEmbed(
          new discord.Embed()
            .setDescription(
              nick
                ? i18n.get('user-empty-collection', locale, `<@${userId}>`, '')
                : i18n.get('you-empty-collection', locale, ''),
            ),
        );

        return message.patch(token);
      }

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
  cachedUsers,
  findCharacter,
  findCharacters,
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
