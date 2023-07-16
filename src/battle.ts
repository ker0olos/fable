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
  hp: number;
  curSta: number;
  curHp: number;
  userId: string;
}

type Setup = Record<string, CharacterLive>;

const MAX_ROUNDS = 10;

function calcInitialProb(p1: CharacterLive[], p2: CharacterLive[]): number {
  const p1Stats = p1.map((char) => [
    char.strength,
    char.stamina,
    char.agility,
  ]).flat();

  const p2Stats = p2.map((char) => [
    char.strength,
    char.stamina,
    char.agility,
  ]).flat();

  const p1Sum = p1Stats.reduce((a, b) => a + b);
  const p2Sum = p2Stats.reduce((a, b) => a + b);

  const p1Mean = p1Sum / p1Stats.length;
  const p2Mean = p2Sum / p2Stats.length;

  const p1Squared = p1Stats.map((n) => (n - p1Mean) ** 2);
  const p2Squared = p2Stats.map((n) => (n - p2Mean) ** 2);

  const p1Variance = p1Squared.reduce((a, b) => a + b) / p1Squared.length;
  const p2Variance = p2Squared.reduce((a, b) => a + b) / p2Squared.length;

  const vDiff = p1Variance - p2Variance;

  // console.log('p1Sum', p1Sum);
  // console.log('p2Sum', p2Sum);
  // console.log('p1Mean', p1Mean);
  // console.log('p2Mean', p2Mean);
  // console.log('p1Variance', p1Variance);
  // console.log('p2Variance', p2Variance);
  // console.log('varianceDifference', vDiff);

  const prob = (p1Sum - vDiff) / (p1Sum + p2Sum);

  // console.log(
  //   'initial probability party 1 wins',
  //   Math.floor(prob * 100),
  // );

  return Math.max(Math.min(Math.floor(prob * 100), 100), 0);
}

function calcModdedProb(p1: CharacterLive[], p2: CharacterLive[]): number {
  const p1Mods = p1.map((char) => [
    char.hp,
    char.curHp,
    char.stamina,
    char.curSta,
  ]);

  const p2Mods = p2.map((char) => [
    char.hp,
    char.curHp,
    char.stamina,
    char.curSta,
  ]);

  const p1Hp = p1Mods
    .map((a) => a[0])
    .reduce((a, b) => a + b);

  const p1CurHp = p1Mods
    .map((a) => a[1])
    .reduce((a, b) => a + b);

  const p1Sta = p1Mods
    .map((a) => a[2])
    .reduce((a, b) => a + b);

  const p1CurSta = p1Mods
    .map((a) => a[3])
    .reduce((a, b) => a + b);

  const p2Hp = p2Mods
    .map((a) => a[0])
    .reduce((a, b) => a + b);

  const p2CurHp = p2Mods
    .map((a) => a[1])
    .reduce((a, b) => a + b);

  const p2Sta = p2Mods
    .map((a) => a[2])
    .reduce((a, b) => a + b);

  const p2CurSta = p2Mods
    .map((a) => a[3])
    .reduce((a, b) => a + b);

  // console.log('p1Hp', p1Hp);
  // console.log('p1CurHp', p1CurHp);
  // console.log('p1Sta', p1Sta);
  // console.log('p1CurSta', p1CurSta);

  const p1Prob = (p1CurHp / p1Hp) * (p1CurSta / p1Sta);
  const p2Prob = (p2CurHp / p2Hp) * (p2CurSta / p2Sta);

  // console.log('modified probability party 1', p1Prob);
  // console.log('modified probability party 2', p2Prob);

  const prob = 1 - (p2Prob - p1Prob);

  // console.log('modified probability modifier', prob);

  return prob;
}

function stringifyProb(
  { prob, p1, p2 }: {
    prob: number;
    p1: string;
    p2: string;
  },
): string {
  const probabilities = [
    `${p1} ${prob}%`,
    `${p2} ${100 - prob}%`,
  ];

  return (prob >= 50 ? probabilities : probabilities.toReversed()).join('\n');
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

  if (user.id === target.id) {
    throw new NonFetalError(
      'You can\'t battle yourself',
    );
  }

  const query = gql`
    query ($ids: [String!], $guildId: String!) {
      getUsersInventories(usersIds: $ids, guildId: $guildId) {
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

  const setup: Setup = {};

  const messages: discord.Message[] = [];

  user.display_name ??= user.global_name ?? user.username;
  target.display_name ??= target.global_name ?? target.username;

  request<{ getUsersInventories: Schema.Inventory[] }>({
    url: faunaUrl,
    query,
    headers: { 'authorization': `Bearer ${config.faunaSecret}` },
    variables: { ids: [user.id, target.id], guildId },
  })
    .then(async ({ getUsersInventories: [user1, user2] }) => {
      const party1 = [
        user1.party?.member1,
        user1.party?.member2,
        user1.party?.member3,
        user1.party?.member4,
        user1.party?.member5,
      ].filter(Boolean);

      if (party1.length <= 0) {
        throw new NonFetalError('Your party is empty');
      }

      const party2 = [
        user2.party?.member1,
        user2.party?.member2,
        user2.party?.member3,
        user2.party?.member4,
        user2.party?.member5,
      ].filter(Boolean);

      if (party2.length <= 0) {
        throw new NonFetalError(`<@${target.id}>'s party is empty`);
      }

      const [characters] = await Promise.all([
        packs.characters({
          guildId,
          ids: [
            ...party1.map(({ id }) => id),
            ...party2.map(({ id }) => id),
          ],
        }),
      ]);

      const setupCharacter = (char: Schema.Character, user: discord.User) => {
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

        //
        // TODO experimental code
        // character will have real stats in the database on stable
        const [strength, stamina, agility] = utils.randomPortions(
          1,
          8,
          3,
          10,
        );
        //
        //

        const hp = Math.floor(strength * 2 + stamina);

        setup[char.id] = {
          rating: char.rating,
          name: char.nickname ?? packs.aliasToArray(character.name)[0],
          image: char.image ?? character.images?.[0]?.url,
          strength,
          stamina,
          agility,
          hp,
          curSta: stamina,
          curHp: hp,
          userId: user.id,
        };
      };

      const winConditions = () => {
        const p1Remaining = party1
          .map(({ id }) => setup[id].curHp)
          .reduce((a, b) => a + b);

        const p2Remaining = party2
          .map(({ id }) => setup[id].curHp)
          .reduce((a, b) => a + b);

        const p1Incapable = party1
          .every(({ id }) => setup[id].curSta <= 0);

        const p2Incapable = party2
          .every(({ id }) => setup[id].curSta <= 0);

        return {
          p1Remaining,
          p2Remaining,
          p1Incapable,
          p2Incapable,
        };
      };

      party2.forEach((char) => setupCharacter(char, target));
      party1.forEach((char) => setupCharacter(char, user));

      const message = new discord.Message();

      const keys = Object.keys(setup);

      if (keys.length !== party1.length + party2.length) {
        throw new NonFetalError('Some characters are disabled or removed');
      }

      keys
        // sort character by their agility
        // if two opposing character share the same agility
        // party 2 (enemy) players takes initiative
        .sort((a, b) => setup[b].agility - setup[a].agility);

      const winProbability = calcInitialProb(
        party1.map(({ id }) => setup[id]),
        party2.map(({ id }) => setup[id]),
      );

      message.addAttachment({
        type: 'image/png',
        arrayBuffer: dynImages.probability(winProbability).buffer,
        filename: 'probability.png',
      });

      message.addEmbed(
        new discord.Embed()
          .setImage({ url: 'attachment://probability.png' })
          .addField({
            inline: true,
            name: `${user.display_name}`,
            value: party1.map(() => discord.emotes.alive).join(''),
          })
          .addField({
            inline: true,
            name: `${target.display_name}`,
            value: party1.map(() => discord.emotes.alive).join(''),
          })
          .setFooter({
            text: stringifyProb(
              {
                prob: winProbability,
                // deno-lint-ignore no-non-null-assertion
                p1: user.display_name!,
                // deno-lint-ignore no-non-null-assertion
                p2: target.display_name!,
              },
            ),
          }),
      );

      messages.push(message.clone());

      // start the battle loop
      for (let round = 0; round < MAX_ROUNDS; round++) {
        const {
          p1Remaining,
          p2Remaining,
          p1Incapable,
          p2Incapable,
        } = winConditions();

        if (
          p1Remaining <= 0 ||
          p2Remaining <= 0 ||
          (p1Incapable && p2Incapable)
        ) {
          break;
        }

        for (const key of keys) {
          const character = setup[key];

          // character has no stamina to take an action
          if (character.curHp <= 0 || character.curSta <= 0) {
            continue;
          }

          const modParty1 = party1
            .map(({ id }) => setup[id])
            .filter((char) => char.curHp > 0);

          const modParty2 = party2
            .map(({ id }) => setup[id])
            .filter((char) => char.curHp > 0);

          if (!modParty1.length || !modParty2.length) {
            break;
          }

          const enemy = character.userId === target.id
            ? modParty1[Math.floor(Math.random() * modParty1.length)]
            : modParty2[Math.floor(Math.random() * modParty2.length)];

          if (enemy.curSta > 0 && enemy.agility >= character.strength) {
            enemy.curSta = Math.max(enemy.curSta - 1, 0);

            // if (enemy.curSta <= 0) {
            //   // message.insertEmbed(
            //   //   1,
            //   //   new discord.Embed()
            //   //     // .setAuthor({ name: enemy.name })
            //   //     // .setThumbnail({ url: enemy.image, preview: true })
            //   //     .setDescription(`${enemy.name} is out of stamina`),
            //   // ).deleteEmbeds(4);
            // }
          } else {
            enemy.curHp = Math.max(enemy.curHp - character.strength, 0);

            if (enemy.curHp <= 0) {
              message.insertEmbed(
                1,
                new discord.Embed()
                  .setAuthor({ name: enemy.name })
                  .setThumbnail({ url: enemy.image, preview: true })
                  .setDescription(`Dead`),
                // .setDescription(`${enemy.name} is out of health`),
              ).deleteEmbeds(4);
            }
          }
        }

        const moddedWinProbability = Math.floor(Math.min(
          Math.max(
            winProbability * calcModdedProb(
              party1.map(({ id }) => setup[id]),
              party2.map(({ id }) => setup[id]),
            ),
            0,
          ),
          100,
        ));

        message
          .clearAttachments()
          .addAttachment({
            type: 'image/png',
            arrayBuffer: dynImages.probability(moddedWinProbability).buffer,
            filename: `probability.png`,
          });

        message.replaceEmbed(
          0,
          new discord.Embed()
            .addField({
              inline: true,
              name: `${user.display_name}`,
              value: party1.map(({ id }) =>
                setup[id].curHp <= 0
                  ? discord.emotes.dead
                  : discord.emotes.alive
              ).join(''),
            })
            .addField({
              inline: true,
              name: `${target.display_name}`,
              value: party2.map(({ id }) =>
                setup[id].curHp <= 0
                  ? discord.emotes.dead
                  : discord.emotes.alive
              ).join(''),
            })
            .setImage({ url: `attachment://probability.png` })
            .setFooter({
              text: stringifyProb(
                {
                  prob: moddedWinProbability,
                  // deno-lint-ignore no-non-null-assertion
                  p1: user.display_name!,
                  // deno-lint-ignore no-non-null-assertion
                  p2: target.display_name!,
                },
              ),
            }),
        );

        messages.push(message.clone());
      }

      const { p1Remaining, p2Remaining } = winConditions();

      if (p2Remaining > p1Remaining) {
        message.insertEmbed(
          1,
          new discord.Embed().setTitle(`${target.display_name} Wins`),
        );
      } else if (p1Remaining > p2Remaining) {
        message.insertEmbed(
          1,
          new discord.Embed().setTitle(`${user.display_name} Wins`),
        );
      } else {
        // tie
        message.insertEmbed(
          1,
          new discord.Embed().setDescription(`All parties retreated`),
        );
      }

      messages.push(message.deleteEmbeds(4));

      for (const message of messages) {
        await message.patch(token);
        await utils.sleep(1);
      }
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
