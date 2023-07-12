import '#filter-boolean';

import { gql, request } from './graphql.ts';

import config, { faunaUrl } from './config.ts';

import utils from './utils.ts';
import packs from './packs.ts';

import * as discord from './discord.ts';

import * as dynImages from '../dyn-images/mod.ts';

import type { Schema } from './types.ts';

import { NonFetalError } from './errors.ts';

interface CharacterLive {
  name: string;
  image?: string;
  rating: number;
  strength: number;
  agility: number;
  stamina: number;
  maxHp: number;
  curHp: number;
  userId: string;
}

function experimental({ token, guildId, user, target }: {
  token: string;
  guildId: string;
  user: discord.User;
  target: discord.User;
}): discord.Message {
  if (!config.combat) {
    throw new NonFetalError(
      'Combat is under maintenance, try again later!',
    );
  }

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
      }
    }
  `;

  Promise.all([
    request<{ getUserInventory: Schema.Inventory }>({
      url: faunaUrl,
      query,
      headers: { 'authorization': `Bearer ${config.faunaSecret}` },
      variables: { userId: user.id, guildId },
    }),
    request<{ getUserInventory: Schema.Inventory }>({
      url: faunaUrl,
      query,
      headers: { 'authorization': `Bearer ${config.faunaSecret}` },
      variables: { userId: target.id, guildId },
    }),
  ])
    .then(async ([user1, user2]) => {
      const message = new discord.Message();

      const party1 = [
        user1.getUserInventory.party?.member1,
        user1.getUserInventory.party?.member2,
        user1.getUserInventory.party?.member3,
        user1.getUserInventory.party?.member4,
        user1.getUserInventory.party?.member5,
      ].filter(Boolean);

      if (party1.length <= 0) {
        throw new NonFetalError('Your party is empty');
      }

      const party2 = [
        user2.getUserInventory.party?.member1,
        user2.getUserInventory.party?.member2,
        user2.getUserInventory.party?.member3,
        user2.getUserInventory.party?.member4,
        user2.getUserInventory.party?.member5,
      ].filter(Boolean);

      if (party2.length <= 0) {
        throw new NonFetalError(`<@${target.id}>'s party is empty`);
      }

      const usernames = [
        user.display_name ?? user.global_name ?? user.username,
        target.display_name ?? target.global_name ?? target.username,
      ];

      const [characters] = await Promise.all([
        packs.characters({
          guildId,
          ids: [
            ...party1.map(({ id }) => id),
            ...party2.map(({ id }) => id),
          ],
        }),
      ]);

      const setup: Record<string, CharacterLive> = {};

      const setupCharacter = (char: Schema.Character, userId: string) => {
        const character = characters.find(({ packId, id }) =>
          char.id === `${packId}:${id}`
        );

        if (
          !character ||
          packs.isDisabled(char.id, guildId) ||
          packs.isDisabled(char.mediaId, guildId)
        ) {
          return;
        }

        const [strength, stamina, agility] = utils.randomPortions(
          1,
          8,
          3,
          10,
        );

        const hp = Math.floor(strength * 2 + stamina);

        setup[char.id] = {
          rating: char.rating,
          name: char.nickname ?? packs.aliasToArray(character.name)[0],
          image: char.image ?? character.images?.[0]?.url,
          strength,
          stamina,
          agility,
          maxHp: hp,
          curHp: hp,
          userId,
        };
      };

      party2.forEach((char) => setupCharacter(char, target.id));
      party1.forEach((char) => setupCharacter(char, user.id));

      const keys = Object.keys(setup);

      if (keys.length !== party1.length + party2.length) {
        throw new NonFetalError('Some characters are disabled or removed');
      }

      // sort character by their agility
      // if agility is the same party 2 takes priority
      keys.sort((a, b) => setup[b].agility - setup[a].agility);

      const winProbability = 50;

      message.addAttachment({
        type: 'image/png',
        arrayBuffer: dynImages.probability(winProbability).buffer,
        filename: 'probability.png',
      });

      message.addEmbed(
        new discord.Embed()
          .addField({
            inline: true,
            name: `${usernames[0]}`,
            value: party1.map(() => discord.emotes.alive).join(''),
          })
          .addField({
            inline: true,
            name: `${usernames[1]}`,
            value: party1.map(() => discord.emotes.alive).join(''),
          })
          .setImage({ url: 'attachment://probability.png' })
          .setFooter({
            text: `${usernames[0]} ${winProbability}%\n${usernames[1]} ${
              100 - winProbability
            }%`,
          }),
      );

      // console.log(JSON.stringify(battle));

      message.patch(token);

      // for (const key of keys) {
      //   const character = setup[key];

      //   const enemy = character.userId === target.id
      //     ? setup[party1[Math.floor(Math.random() * party1.length)].id]
      //     : setup[party2[Math.floor(Math.random() * party2.length)].id];

      //   if (message.getEmbedsCount() > 3) {
      //     message.spliceEmbeds(1, 1);
      //   }

      //   message.addEmbed(
      //     new discord.Embed()
      //       .setAuthor({
      //         name: character.name,
      //         // icon_url: character.image
      //         //   ? `${config.origin}/external/${
      //         //     encodeURIComponent(character.image)
      //         //   }?size=preview`
      //         //   : undefined,
      //       })
      //       .setThumbnail({ url: character.image, preview: true })
      //       .setDescription(`Attacks ${enemy.name}`),
      //   );

      //   await utils.sleep(1);
      //   await message.patch(token);
      // }

      // message.addEmbed(
      //   new discord.Embed().setDescription('Battle End Placeholder'),
      // );

      // await utils.sleep(1);
      // await message.patch(token);
    })
    .catch(async (err) => {
      if (err instanceof NonFetalError) {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(err.message),
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

const battle = {
  experimental,
};

export default battle;
