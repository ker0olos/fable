import '#filter-boolean';

import { gql, request } from './graphql.ts';

import search, { idPrefix } from './search.ts';

import _user from './user.ts';
import packs from './packs.ts';
import utils from './utils.ts';
import i18n from './i18n.ts';

import * as discord from './discord.ts';

import * as dynImages from '../dyn-images/mod.ts';

import config, { faunaUrl } from './config.ts';

import type { Character, Schema } from './types.ts';

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

  damageDone: number;
  damageTaken: number;
  dodges: number;
  kills: string[];
  killedBy: string;

  out?: number;
  reason?: 'HP' | 'STAMINA';

  userId: string;
}

type Setup = Record<string, CharacterLive>;

const MAX_ROUNDS = 10;

function newUnclaimed(rating: number): number {
  return 3 * rating;
}

function stringify(dmg: number, user: string, target: string): string {
  const _ = [
    `${user} ${dmg}%`,
    `${target} ${100 - dmg}%`,
  ];

  return (dmg >= 50 ? _ : _.toReversed()).join('\n');
}

async function updateStats(
  { token, type, distribution, characterId, userId, guildId }: {
    token: string;
    type: 'str' | 'sta' | 'agi' | 'reset';
    distribution?: string;
    characterId: string;
    guildId: string;
    userId: string;
  },
): Promise<discord.Message> {
  const locale = _user.cachedUsers[userId]?.locale;

  const existing = await _user.findCharacter({ guildId, characterId });

  if (!existing) {
    throw new Error('404');
  }

  const mutation = gql`
    mutation(
      $userId: String!
      $guildId: String!
      $characterId: String!
      $unclaimed: Int!
      $strength: Int!
      $stamina: Int!
      $agility: Int!
    ) {
      setCharacterStats(
        userId: $userId
        guildId: $guildId
        characterId: $characterId
        unclaimed: $unclaimed
        strength: $strength
        stamina: $stamina
        agility: $agility
      ) {
        ok
        error
      }
    }
  `;

  let unclaimed = existing.combat?.stats?.unclaimed ??
    newUnclaimed(existing.rating);

  let strength = existing.combat?.stats?.strength ?? 0;
  let stamina = existing.combat?.stats?.stamina ?? 0;
  let agility = existing.combat?.stats?.agility ?? 0;

  if (type !== 'reset' && unclaimed <= 0) {
    throw new NonFetalError(i18n.get('not-enough-unclaimed', locale));
  }

  switch (type) {
    case 'reset':
      unclaimed = strength + stamina + agility + unclaimed;
      strength = stamina = agility = 0;
      break;
    case 'str':
      unclaimed = unclaimed - 1;
      strength = strength + 1;
      break;
    case 'sta':
      unclaimed = unclaimed - 1;
      stamina = stamina + 1;
      break;
    case 'agi':
      unclaimed = unclaimed - 1;
      agility = agility + 1;
      break;
    default:
      break;
  }

  if (distribution && /\d-\d-\d/.test(distribution)) {
    const [str, sta, agi] = distribution.split('-')
      .map((n) => parseInt(n));

    unclaimed = unclaimed - (str + sta + agi);

    strength = str;
    stamina = sta;
    agility = agi;

    if (unclaimed < 0) {
      throw new NonFetalError(i18n.get('not-enough-unclaimed', locale));
    }
  } else if (distribution) {
    throw new NonFetalError(
      i18n.get('incorrect-distribution', locale),
    );
  }

  const response = (await request<{
    setCharacterStats: Schema.Mutation;
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
      unclaimed,
      strength,
      stamina,
      agility,
    },
  })).setCharacterStats;

  if (response.ok) {
    return battle.stats({
      token,
      character: `id=${characterId}`,
      userId,
      guildId,
    });
  } else {
    switch (response.error) {
      case 'CHARACTER_NOT_OWNED':
        throw new NonFetalError(
          i18n.get('invalid-permission', locale),
        );
      default:
        throw new Error(response.error);
    }
  }
}

function stats({ token, character, userId, guildId, distribution }: {
  token: string;
  character: string;
  guildId: string;
  userId: string;
  distribution?: string;
}): discord.Message {
  const locale = _user.cachedUsers[userId]?.locale;

  if (!config.combat) {
    throw new NonFetalError(
      i18n.get('maintenance-combat', locale),
    );
  }

  packs.characters(
    character.startsWith(idPrefix)
      ? { ids: [character.substring(idPrefix.length)], guildId }
      : { search: character, guildId },
  )
    .then((results) => {
      if (!results.length) {
        throw new Error('404');
      }

      if (packs.isDisabled(`${results[0].packId}:${results[0].id}`, guildId)) {
        throw new Error('404');
      }

      return Promise.all([
        packs.aggregate<Character>({
          guildId,
          character: results[0],
          end: 1,
        }),
        _user.findCharacter({
          guildId,
          characterId: `${results[0].packId}:${results[0].id}`,
        }),
      ]);
    })
    .then(async ([character, existing]) => {
      const charId = `${character.packId}:${character.id}`;

      if (!existing) {
        const message = new discord.Message();

        const embed = search.characterEmbed(character, {
          mode: 'thumbnail',
          media: { title: false },
          description: false,
          footer: false,
        });

        embed.setFooter({
          text: i18n.get('not-fit-for-combat', locale),
        });

        message.addEmbed(embed);

        return await message.patch(token);
      }

      if (distribution) {
        return await updateStats({
          token,
          type: 'reset',
          guildId,
          characterId: charId,
          distribution,
          userId,
        });
      }

      const message = new discord.Message();

      const embed = search.characterEmbed(character, {
        footer: false,
        existing: {
          image: existing.image,
          nickname: existing.nickname,
          rating: existing.rating,
        },
        media: { title: false },
        description: false,
        mode: 'thumbnail',
      });

      const unclaimed = existing.combat?.stats?.unclaimed ??
        newUnclaimed(existing.rating);

      const strength = existing.combat?.stats?.strength ?? 0;
      const stamina = existing.combat?.stats?.stamina ?? 0;
      const agility = existing.combat?.stats?.agility ?? 0;

      embed
        .addField({
          name: 'Stats',
          value: [
            `${i18n.get('unclaimed', locale)}: ${unclaimed}`,
            `${i18n.get('strength', locale)}: ${strength}`,
            `${i18n.get('stamina', locale)}: ${stamina}`,
            `${i18n.get('agility', locale)}: ${agility}`,
          ].join('\n'),
        });

      if (existing?.user.id === userId) {
        message.addComponents([
          new discord.Component()
            .setLabel(`+1 ${i18n.get('str', locale)}`)
            .setDisabled(unclaimed <= 0)
            .setId('stats', 'str', userId, charId),

          new discord.Component()
            .setLabel(`+1 ${i18n.get('sta', locale)}`)
            .setDisabled(unclaimed <= 0)
            .setId('stats', 'sta', userId, charId),

          new discord.Component()
            .setLabel(`+1 ${i18n.get('agi', locale)}`)
            .setDisabled(unclaimed <= 0)
            .setId('stats', 'agi', userId, charId),

          new discord.Component()
            .setLabel(i18n.get('reset', locale))
            .setId('stats', 'reset', userId, charId),
        ]);
      }

      message.addEmbed(embed);

      await message.patch(token);
    })
    .catch(async (err) => {
      if (err.message === '404') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('some-characters-disabled', locale),
            ),
          ).patch(token);
      }

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

function experimental({ token, guildId, user, target }: {
  token: string;
  guildId: string;
  user: discord.User;
  target: discord.User;
}): discord.Message {
  const locale = _user.cachedUsers[user.id]?.locale;

  if (!config.combat) {
    throw new NonFetalError(
      i18n.get('maintenance-combat', locale),
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
            combat {
              stats {
                strength
                stamina
                agility
              }
            }
          }
          member2 {
            id
            mediaId
            rating
            nickname
            image
            combat {
              stats {
                strength
                stamina
                agility
              }
            }
          }
          member3 {
            id
            mediaId
            rating
            nickname
            image
            combat {
              stats {
                strength
                stamina
                agility
              }
            }
          }
          member4 {
            id
            mediaId
            rating
            nickname
            image
            combat {
              stats {
                strength
                stamina
                agility
              }
            }
          }
          member5 {
            id
            mediaId
            rating
            nickname
            image
            combat {
              stats {
                strength
                stamina
                agility
              }
            }
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
        user1.party?.member1,
        user1.party?.member2,
        user1.party?.member3,
        user1.party?.member4,
        user1.party?.member5,
        // { id: 'vtubers:gura' },
        // { id: 'vtubers:calliope' },
        // { id: 'vtubers:kiara' },
        // { id: 'vtubers:ina' },
        // { id: 'vtubers:watson' },
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
        // { id: 'vtubers:kronii' },
        // { id: 'vtubers:mumei' },
        // { id: 'vtubers:chaos' },
        // { id: 'vtubers:fauna' },
        // { id: 'vtubers:sana' },
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

        const strength = char.combat?.stats?.strength ?? 0;
        const stamina = char.combat?.stats?.stamina ?? 0;
        const agility = char.combat?.stats?.agility ?? 0;

        const hp = 15; // TODO experimental

        setup[char.id] = {
          rating: char.rating,
          name: char.nickname ?? packs.aliasToArray(character.name)[0],
          image: char.image ?? character.images?.[0]?.url,
          strength,
          stamina,
          agility,
          hp,
          curHp: hp,
          curSta: stamina,

          kills: [],
          killedBy: '',
          damageTaken: 0,
          damageDone: 0,
          dodges: 0,

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

      const rounds: {
        p1State: string[];
        p2State: string[];
        damage: number;
        events: discord.Embed[];
      }[] = [
        {
          events: [],
          damage: 50,
          p1State: party1.map(() => discord.emotes.alive),
          p2State: party2.map(() => discord.emotes.alive),
        },
      ];

      const makeMessage = (
        round: number,
        embed?: discord.Embed,
      ) => {
        const message = new discord.Message()
          .addAttachment({
            type: 'image/png',
            arrayBuffer: dynImages.probability(rounds[round].damage).buffer,
            filename: `damage.png`,
          })
          .addEmbed(
            new discord.Embed()
              .addField({
                inline: true,
                name: `${user.display_name}`,
                value: rounds[round].p1State.toSorted().join(''),
              })
              .addField({
                inline: true,
                name: `${target.display_name}`,
                value: rounds[round].p2State.toSorted().join(''),
              })
              .setImage({ url: `attachment://damage.png` })
              .setFooter({
                text: stringify(
                  rounds[round].damage,
                  // deno-lint-ignore no-non-null-assertion
                  user.display_name!,
                  // deno-lint-ignore no-non-null-assertion
                  target.display_name!,
                ),
              }),
          );

        if (embed) {
          message.addEmbed(embed);
        }

        return message;
      };

      // start the battle loop
      for (let round = 0; round < MAX_ROUNDS; round++) {
        // start of round

        // loop each character
        for (const key of keys) {
          const character = setup[key];

          // character is eliminated
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

          // if (enemy.curSta > 0 && enemy.agility >= character.strength) {
          if (enemy.curSta > 0 && enemy.agility >= character.agility) {
            enemy.curSta = Math.max(enemy.curSta - 1, 0);

            enemy.dodges += 1;

            if (enemy.curSta <= 0) {
              enemy.out = round;
              enemy.reason = 'STAMINA';
            }
          } else {
            enemy.curHp = Math.max(enemy.curHp - character.strength, 0);

            enemy.damageTaken += character.strength;
            character.damageDone += character.strength;

            if (enemy.curHp <= 0) {
              enemy.out = round;
              enemy.reason = 'HP';
              enemy.killedBy = character.name;

              character.kills.push(enemy.name);
            }
          }

          character.curSta = Math.max(character.curSta - 1, 0);

          if (character.curSta <= 0) {
            character.out = round;
            character.reason = 'STAMINA';
          }
        } // end of looping characters

        // end of round

        const { p1Remaining, p2Remaining, p1Incapable, p2Incapable } =
          winConditions();

        rounds.push({
          events: [],
          damage: getDamage(),
          p1State: party1.map(({ id }) =>
            setup[id].curHp <= 0
              ? discord.emotes.outOfHP
              : setup[id].curSta <= 0
              ? discord.emotes.outOfSta
              : discord.emotes.alive
          ),
          p2State: party2.map(({ id }) =>
            setup[id].curHp <= 0
              ? discord.emotes.outOfHP
              : setup[id].curSta <= 0
              ? discord.emotes.outOfSta
              : discord.emotes.alive
          ),
        });

        if (
          p1Remaining <= 0 ||
          p2Remaining <= 0 ||
          (p1Incapable && p2Incapable)
        ) {
          break;
        }

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

      for (const character of Object.values(setup)) {
        if (character.reason) {
          let format: string;

          switch (character.reason) {
            case 'HP':
              format = character.kills.length
                ? `__${character.name} was killed by ${character.killedBy}__ but took ${character.kills.length} ${
                  character.kills.length === 1 ? 'character' : 'characters'
                } with them`
                : character.dodges
                ? `__${character.name} was killed by ${character.killedBy}__ after dodging ${character.dodges} ${
                  character.dodges === 1 ? 'attack' : 'attacks'
                }`
                : `__${character.name} was killed by ${character.killedBy}__`;
              break;
            case 'STAMINA':
              format = character.kills.length
                ? `__${character.name} ran out of stamina__ after killing ${character.kills.length} ${
                  character.kills.length === 1 ? 'character' : 'characters'
                }`
                : character.dodges
                ? `__${character.name} ran out of stamina__ after dodging ${character.dodges} ${
                  character.dodges === 1 ? 'attack' : 'attacks'
                }`
                : `__${character.name} ran out of stamina__`;
              break;
          }

          // deno-lint-ignore no-non-null-assertion
          rounds[character.out! + 1].events.push(
            new discord.Embed()
              .setThumbnail({ url: character.image, preview: true })
              .setAuthor({
                name: character.userId === target.id
                  ? target.display_name
                  : user.display_name,
              })
              .setDescription(format),
          );
        }
      }

      for (let i = 0; i < rounds.length; i++) {
        const { events } = rounds[i];

        // add a new event to declare the winner
        if (i === rounds.length - 1) {
          events.push(new discord.Embed()
            .setTitle(win ? `${win.display_name} Wins` : 'Tie'));
        }

        if (events.length) {
          for (const event of events) {
            await makeMessage(i, event).patch(token);
            await utils.sleep(3);
          }
        } else {
          await makeMessage(i).patch(token);
          await utils.sleep(3);
        }
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
  stats,
  updateStats,
  experimental,
};

export default battle;
