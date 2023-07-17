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

function stringify(dmg: number, user: string, target: string): string {
  const _ = [
    `${user} ${dmg}%`,
    `${target} ${100 - dmg}%`,
  ];

  return (dmg >= 50 ? _ : _.toReversed()).join('\n');
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

  user.display_name ??= user.global_name ?? user.username;
  target.display_name ??= target.global_name ?? target.username;

  request<{ getUsersInventories: Schema.Inventory[] }>({
    query,
    url: faunaUrl,
    headers: { 'authorization': `Bearer ${config.faunaSecret}` },
    variables: { ids: [user.id, target.id], guildId },
  })
    .then(async ({ getUsersInventories: [user1, user2] }) => {
      const party1 = [
        // user1.party?.member1,
        // user1.party?.member2,
        // user1.party?.member3,
        // user1.party?.member4,
        // user1.party?.member5,
        { id: 'vtubers:gura' },
        { id: 'vtubers:calliope' },
        { id: 'vtubers:kiara' },
        { id: 'vtubers:ina' },
        { id: 'vtubers:watson' },
      ].filter(Boolean);

      if (party1.length <= 0) {
        throw new NonFetalError('Your party is empty');
      }

      const party2 = [
        // user2.party?.member1,
        // user2.party?.member2,
        // user2.party?.member3,
        // user2.party?.member4,
        // user2.party?.member5,
        { id: 'vtubers:kronii' },
        { id: 'vtubers:mumei' },
        { id: 'vtubers:chaos' },
        { id: 'vtubers:fauna' },
        { id: 'vtubers:sana' },
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

      const setup: Setup = {};

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
          10,
          50,
          3,
          100,
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

      function winConditions(): {
        p1Remaining: number;
        p2Remaining: number;
        p1Incapable: boolean;
        p2Incapable: boolean;
      } {
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
      }

      const getDamage = () => {
        const p1Sum = party1
          .map(({ id }) => setup[id].hp)
          .reduce((a, b) => a + b);

        const p2Sum = party2
          .map(({ id }) => setup[id].hp)
          .reduce((a, b) => a + b);

        const p1Remaining = Math.max(
          party1
            .map(({ id }) => setup[id].curHp)
            .reduce((a, b) => a + b),
          0,
        );

        const p2Remaining = Math.max(
          party2
            .map(({ id }) => setup[id].curHp)
            .reduce((a, b) => a + b),
          0,
        );

        const p1 = p1Remaining / p1Sum;
        const p2 = p2Remaining / p2Sum;

        // console.log(
        //   p1,
        //   '/',
        //   p2,
        //   `(${party1.map(({ id }) => setup[id].curHp)})`,
        //   '/',
        //   `(${party2.map(({ id }) => setup[id].curHp)})`,
        // );

        return Math.floor(50 + ((p1 - p2) * 50));
      };

      party2.forEach((char) => setupCharacter(char, target));
      party1.forEach((char) => setupCharacter(char, user));

      const keys = Object.keys(setup);

      if (keys.length !== party1.length + party2.length) {
        throw new NonFetalError('Some characters are disabled or removed');
      }

      keys
        // sort character initiative by their agility
        .sort((a, b) => setup[b].agility - setup[a].agility);

      const messages: discord.Message[] = [];

      const addMessage = (embed?: discord.Embed) => {
        const prob = getDamage();

        const message = new discord.Message()
          .addAttachment({
            type: 'image/png',
            arrayBuffer: dynImages.probability(prob).buffer,
            filename: `damage.png`,
          })
          .addEmbed(
            new discord.Embed()
              .addField({
                inline: true,
                name: `${user.display_name}`,
                value: party1.map(({ id }) =>
                  setup[id].curHp <= 0
                    ? discord.emotes.eliminated
                    : discord.emotes.alive
                ).join(''),
              })
              .addField({
                inline: true,
                name: `${target.display_name}`,
                value: party2.map(({ id }) =>
                  setup[id].curHp <= 0
                    ? discord.emotes.eliminated
                    : discord.emotes.alive
                ).join(''),
              })
              .setImage({ url: `damage.png` })
              .setFooter({
                // deno-lint-ignore no-non-null-assertion
                text: stringify(prob, user.display_name!, target.display_name!),
              }),
          );

        if (embed) {
          message.addEmbed(embed);
        }

        messages.push(message);
      };

      // first message
      addMessage();

      // start the battle loop
      for (let round = 0; round < MAX_ROUNDS; round++) {
        // start of round

        //

        // loop each character
        for (const key of keys) {
          const character = setup[key];

          // character is dead
          if (character.curHp <= 0) {
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

          // TODO having 10 sta is pretty much guarantees you have enough
          // this might not be the best good implementation
          if (enemy.curSta > 0 && enemy.agility >= character.strength) {
            enemy.curSta = Math.max(enemy.curSta - 1, 0);
          } else {
            enemy.curHp = Math.max(enemy.curHp - character.strength, 0);
          }
        }
        // end of looping all characters

        // end of round

        const { p1Remaining, p2Remaining, p1Incapable, p2Incapable } =
          winConditions();

        if (
          p1Remaining <= 0 ||
          p2Remaining <= 0 ||
          (p1Incapable && p2Incapable)
        ) {
          break;
        }

        // TODO add a highlight of each round?
        addMessage();

        //
      }

      let win: discord.User | undefined = undefined;

      const dmg = getDamage();

      // the party with the most damage wins
      if (dmg > 50) {
        win = user;
      } else if (50 > dmg) {
        win = target;
      }

      addMessage(new discord.Embed()
        .setTitle(win ? `${win.display_name} Wins` : 'Tie'));

      // send each message on an interval
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
