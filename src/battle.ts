import _user from './user.ts';
import packs from './packs.ts';
import utils from './utils.ts';
import i18n from './i18n.ts';

import db from '../db/mod.ts';

import * as dynImages from '../dyn-images/mod.ts';

import * as discord from './discord.ts';

import config from './config.ts';

import * as Schema from '../db/schema.ts';

import { NonFetalError } from './errors.ts';

import type { Character, DisaggregatedCharacter } from './types.ts';

type CharacterLive = {
  strength: Readonly<number>;
  stamina: Readonly<number>;
  agility: Readonly<number>;
  hp: number;
};

const T = 2;

const getStats = (char: Schema.Character): CharacterLive => {
  return {
    agility: char.combat?.stats?.agility ?? 0,
    strength: char.combat?.stats?.strength ?? 1,
    stamina: char.combat?.stats?.stamina ?? 1,
    hp: char.combat?.stats?.stamina ?? 1,
  };
};

const getEmbed = (message: discord.Message, {
  character,
  stats,
  damage,
  state,
  color,
}: {
  character: Character | DisaggregatedCharacter;
  stats: CharacterLive;
  damage?: number;
  state?: string;
  color?: string;
}) => {
  damage = damage || 0;

  const uuid = crypto.randomUUID();

  let _state = state ?? discord.empty;

  if (damage > 0) {
    _state = `-${damage}`;
  }

  const embed = new discord.Embed()
    .setColor(damage > 0 ? '#DE2626' : color)
    .setThumbnail({ url: character.images?.[0]?.url })
    .setImage({ url: `attachment://${uuid}.png` })
    .setDescription(
      `## ${
        packs.aliasToArray(character.name)[0]
      }\n_${_state}_\n${stats.hp}/${stats.stamina}`,
    );

  const percent = Math.round((stats.hp / stats.stamina) * 100);
  const _damage = Math.round((damage / stats.stamina) * 100);

  message.addAttachment({
    type: 'image/png',
    arrayBuffer: dynImages.hp(percent, _damage).buffer,
    filename: `${uuid}.png`,
  });

  message.addEmbed(embed);
};

function attack(char: CharacterLive, target: CharacterLive): number {
  const damage = Math.max(char.strength - target.agility, 1);
  target.hp = Math.max(target.hp - damage, 0);
  return damage;
}

function v2({ token, guildId, user, target }: {
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
      i18n.get('battle-yourself', locale),
    );
  }

  user.display_name ??= user.global_name ?? user.username;
  target.display_name ??= target.global_name ?? target.username;

  Promise.resolve()
    .then(async () => {
      const guild = await db.getGuild(guildId);
      const instance = await db.getInstance(guild);

      const [_user, _target] = [
        await db.getUser(user.id),
        await db.getUser(target.id),
      ];

      const [{ inventory: userInventory }, { inventory: targetInventory }] = [
        await db.getInventory(instance, _user),
        await db.getInventory(instance, _target),
      ];

      const [userParty, targetParty] = [
        await db.getUserParty(userInventory),
        await db.getUserParty(targetInventory),
      ];

      const party1 = [
        userParty?.member1,
        userParty?.member2,
        userParty?.member3,
        userParty?.member4,
        userParty?.member5,
      ].filter(Boolean) as Schema.Character[];

      const party2 = [
        targetParty?.member1,
        targetParty?.member2,
        targetParty?.member3,
        targetParty?.member4,
        targetParty?.member5,
      ].filter(Boolean) as Schema.Character[];

      if (party1.length <= 0) {
        throw new NonFetalError('Your party is empty');
      } else if (party2.length <= 0) {
        throw new NonFetalError(`<@${target.id}>'s party is empty`);
      }

      const [characters] = await Promise.all([
        packs.characters({ guildId, ids: [party1[0].id, party2[0].id] }),
      ]);

      const [userCharacter, targetCharacter] = [
        characters.find(({ packId, id }) => party1[0].id === `${packId}:${id}`),
        characters.find(({ packId, id }) => party2[0].id === `${packId}:${id}`),
      ];

      if (!userCharacter || !targetCharacter) {
        throw new NonFetalError('Some characters are disabled or removed');
      }

      const setup = [
        getStats(party1[0]),
        getStats(party2[0]),
      ];

      const [userStats, targetStats] = setup;

      let initiative = 0;

      let message = new discord.Message();

      // getEmbed(message, { character: userCharacter, stats: userStats });
      // getEmbed(message, { character: targetCharacter, stats: targetStats });

      // await message.patch(token);

      while (true) {
        if (userStats.hp <= 0 || targetStats.hp <= 0) {
          break;
        }

        // switch initiative
        initiative = initiative === 0 ? 1 : 0;

        const [attacker, defender] = initiative === 0
          ? [userCharacter, targetCharacter]
          : [targetCharacter, userCharacter];

        const [attackerStats, defenderStats] = initiative === 0
          ? [userStats, targetStats]
          : [targetStats, userStats];

        message = new discord.Message();

        const stateUX = [
          () =>
            getEmbed(message, {
              color: '#5d56c7',
              character: attacker,
              stats: attackerStats,
              state: i18n.get('attacking', locale),
            }),
          () =>
            getEmbed(message, { character: defender, stats: defenderStats }),
        ];

        if (initiative === 1) {
          stateUX.reverse();
        }

        stateUX.forEach((func) => func());

        await utils.sleep(T);
        await message.patch(token);

        const damage = attack(attackerStats, defenderStats);

        message = new discord.Message();

        const damageUX = [
          () =>
            getEmbed(message, { character: attacker, stats: attackerStats }),
          () =>
            getEmbed(message, {
              character: defender,
              stats: defenderStats,
              damage,
            }),
        ];

        if (initiative === 1) {
          damageUX.reverse();
        }

        damageUX.forEach((func) => func());

        await utils.sleep(T);
        await message.patch(token);

        if (userStats.hp <= 0 || targetStats.hp <= 0) {
          message = new discord.Message();

          getEmbed(message, { character: userCharacter, stats: userStats });
          getEmbed(message, { character: targetCharacter, stats: targetStats });

          message.addEmbed(
            new discord.Embed()
              .setTitle(
                `${(userStats.hp <= 0 ? target : user).display_name} Won`,
              ),
          );

          await utils.sleep(T);
          await message.patch(token);
        }
      }
    })
    .catch(async (err) => {
      if (err instanceof NonFetalError) {
        return await new discord.Message()
          .addEmbed(new discord.Embed().setDescription(err.message))
          .patch(token);
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

const battle = { v2 };

export default battle;
