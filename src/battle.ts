import _user from './user.ts';
import packs from './packs.ts';
import utils from './utils.ts';
import i18n from './i18n.ts';

import db from '../db/mod.ts';

import * as dynImages from '../dyn-images/mod.ts';

import * as discord from './discord.ts';

import config from './config.ts';

import gacha from './gacha.ts';
import tower from './tower.ts';
import skills from './skills.ts';

import * as Schema from '../db/schema.ts';

import { newUnclaimed } from './stats.ts';

import { NonFetalError, PoolError } from './errors.ts';

import type {
  Character,
  CharacterLive,
  DisaggregatedCharacter,
  SkillOutput,
} from './types.ts';

type BattleData = { playing: boolean };

// 2 seconds
const MESSAGE_DELAY = 2;

// 3 minutes
const MAX_TIME = 3 * 60 * 1000;

export const getEnemyRating = (floor: number): number => {
  switch (floor % 10) {
    case 1:
    case 2:
    case 3:
      return 1;
    case 4:
    case 6:
      return 2;
    case 7:
    case 8:
    case 9:
      return 3;
    case 5:
      return 4;
    case 0:
      return 5;
    default:
      throw new Error('');
  }
};

export const getEnemySkillSlots = (floor: number): number => {
  const skillsPool = Object.keys(skills.skills);
  return Math.min(Math.floor(floor / 10), skillsPool.length);
};

export const getEnemyMaxSkillLevel = (floor: number): number => {
  return Math.max(Math.floor(floor / 5), 1);
};

const getStats = (char: Schema.Character): CharacterLive => {
  return {
    skills: char.combat?.skills ?? {},
    agility: char.combat?.stats?.agility ?? 0,
    strength: char.combat?.stats?.strength ?? 1,
    stamina: char.combat?.stats?.stamina ?? 1,
    hp: char.combat?.stats?.stamina ?? 1,
  };
};

const getEnemyStats = (floor: number, seed: string): CharacterLive => {
  const rng = new utils.LehmerRNG(seed);
  const skillRng = new utils.LehmerRNG(seed);

  const totalStats = newUnclaimed(getEnemyRating(floor));

  const _skills: CharacterLive['skills'] = {};

  const skillsPool = Object.values(skills.skills);
  const skillsSlots = getEnemySkillSlots(floor);
  const maxSkillLevel = getEnemyMaxSkillLevel(floor);

  for (let i = 0; i < skillsSlots; i++) {
    const randomSkill = skillsPool[
      Math.floor(skillRng.nextFloat() * skillsPool.length)
    ];

    _skills[randomSkill.key] = {
      level: Math.min(maxSkillLevel, randomSkill.stats[0].scale.length),
    };
  }

  const stats: CharacterLive = {
    skills: _skills,
    agility: 0,
    strength: 0,
    stamina: 0,
    hp: 0,
  };

  for (let i = 0; i < totalStats; i++) {
    const rand = Math.floor(rng.nextFloat() * 3);

    if (rand === 0) {
      stats.agility += 1;
    } else if (rand === 1) {
      stats.strength += 1;
    } else {
      stats.stamina += 1;
    }
  }

  const multiplier = 0.5;
  const base = floor;

  stats.stamina = stats.hp = Math.max(
    Math.round(
      stats.stamina * Math.pow(base, multiplier),
    ),
    1,
  );

  stats.strength = Math.round(
    stats.strength * Math.pow(base, multiplier),
  );

  stats.agility = Math.round(
    stats.agility * Math.pow(base, multiplier),
  );

  return stats;
};

const addEmbed = (message: discord.Message, {
  character,
  existing,
  stats,
  damage,
  state,
  color,
}: {
  character: Character | DisaggregatedCharacter;
  stats: CharacterLive;
  existing?: Schema.Character;
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
    .setThumbnail({ url: existing?.image ?? character.images?.[0]?.url })
    .setImage({ url: `attachment://${uuid}.png` })
    .setDescription(
      `## ${
        existing?.nickname ?? packs.aliasToArray(character.name)[0]
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

function attack(
  char: CharacterLive,
  target: CharacterLive,
): SkillOutput {
  let damage = 0;

  // activate character skills
  Object.entries(char.skills).map(([key, s]) => {
    const skill = skills.skills[key];

    if (skill.activationTurn === 'user') {
      const outcome = skill.activation(char, target, s.level);

      if (outcome.damage) {
        damage += Math.round(outcome.damage);
      }
    }
  });

  damage += Math.max(char.strength - target.agility, 1);

  // activate enemy/target skills
  Object.entries(target.skills).map(([key, s]) => {
    const skill = skills.skills[key];

    if (skill.activationTurn === 'enemy') {
      const outcome = skill.activation(char, target, s.level);

      if (outcome.dodge) {
        damage = 0;
      }
    }
  });

  target.hp = Math.max(target.hp - damage, 0);

  return { damage };
}

function challengeFriend({ token, guildId, userId, targetId }: {
  token: string;
  guildId: string;
  userId: string;
  targetId: string;
}): discord.Message {
  const locale = _user.cachedUsers[userId]?.locale;

  if (!config.combat) {
    throw new NonFetalError(
      i18n.get('maintenance-combat', locale),
    );
  }

  if (userId === targetId) {
    throw new NonFetalError(
      i18n.get('battle-yourself', locale),
    );
  }

  Promise.resolve()
    .then(async () => {
      const guild = await db.getGuild(guildId);
      const instance = await db.getInstance(guild);

      const [_user, _target] = [
        await db.getUser(userId),
        await db.getUser(targetId),
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
        throw new NonFetalError(i18n.get('your-party-empty', locale));
      } else if (party2.length <= 0) {
        throw new NonFetalError(
          i18n.get('user-party-empty', locale, `<@${targetId}>'s`),
        );
      }

      const [characters] = await Promise.all([
        packs.characters({ guildId, ids: [party1[0].id, party2[0].id] }),
      ]);

      const [userCharacter, targetCharacter] = [
        characters.find(({ packId, id }) => party1[0].id === `${packId}:${id}`),
        characters.find(({ packId, id }) => party2[0].id === `${packId}:${id}`),
      ];

      if (!userCharacter || !targetCharacter) {
        throw new NonFetalError(i18n.get('some-characters-disabled', locale));
      }

      await startCombat({
        token,
        locale,
        userId,
        targetId,
        character1: userCharacter,
        character2: targetCharacter,
        character1Existing: party1[0],
        character2Existing: party2[0],
        character1Stats: getStats(party1[0]),
        character2Stats: getStats(party2[0]),
      });
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

function challengeTower({ token, guildId, userId }: {
  token: string;
  guildId: string;
  userId: string;
}): discord.Message {
  const locale = _user.cachedUsers[userId]?.locale;

  if (!config.combat) {
    throw new NonFetalError(
      i18n.get('maintenance-combat', locale),
    );
  }

  Promise.resolve()
    .then(async () => {
      const guild = await db.getGuild(guildId);
      const instance = await db.getInstance(guild);

      const _user = await db.getUser(userId);

      const { inventory } = await db.getInventory(instance, _user);

      const floor = (inventory.floorsCleared ?? 0) + 1;

      const seed = `${guildId}${floor}`;

      const random = new utils.LehmerRNG(seed);

      const party = await db.getUserParty(inventory);

      const party1 = [
        party?.member1,
        party?.member2,
        party?.member3,
        party?.member4,
        party?.member5,
      ].filter(Boolean) as Schema.Character[];

      if (party1.length <= 0) {
        throw new NonFetalError(i18n.get('your-party-empty', locale));
      }

      const characters = await packs.characters({
        guildId,
        ids: [party1[0].id],
      });

      const userCharacter = characters.find(({ packId, id }) =>
        party1[0].id === `${packId}:${id}`
      );

      if (!userCharacter) {
        throw new NonFetalError(i18n.get('character-disabled', locale));
      }

      const userCharacterStats = getStats(party1[0]);

      const { pool, validate } = await gacha.guaranteedPool({
        seed,
        guarantee: getEnemyRating(floor),
        guildId,
      });

      let enemyCharacter: Character | undefined = undefined;
      // let enemyMedia: Media | undefined = undefined;

      while (pool.length > 0) {
        const i = Math.floor(random.nextFloat() * pool.length);

        const characterId = pool.splice(i, 1)[0].id;

        if (packs.isDisabled(characterId, guildId)) {
          continue;
        }

        const results = await packs.characters({ guildId, ids: [characterId] });

        if (!results.length || !validate(results[0])) {
          continue;
        }

        const candidate = await packs.aggregate<Character>({
          guildId,
          character: results[0],
          end: 1,
        });

        const edge = candidate.media?.edges?.[0];

        if (!edge || !validate(candidate) || !candidate?.images?.length) {
          continue;
        }

        if (packs.isDisabled(`${edge.node.packId}:${edge.node.id}`, guildId)) {
          continue;
        }

        // enemyMedia = edge.node;
        enemyCharacter = candidate;

        break;
      }

      if (!enemyCharacter) {
        throw new PoolError();
      }

      const enemyStats: CharacterLive = getEnemyStats(floor, seed);

      const [userWon, _lastMessage] = await startCombat({
        token,
        locale,
        userId,
        title: `${i18n.get('floor', locale)} ${floor}`,
        targetName: packs.aliasToArray(enemyCharacter.name)[0],
        character1: userCharacter,
        character2: enemyCharacter,
        character1Existing: party1[0],
        character2Existing: undefined,
        character1Stats: userCharacterStats,
        character2Stats: enemyStats,
      });

      if (userWon) {
        tower.onSuccess({
          token,
          userId,
          guildId,
          message: _lastMessage,
          party: party1,
          inventory,
          locale,
        });
      } else {
        tower.onFail({
          token,
          message: _lastMessage,
          userId,
          locale,
        });
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

async function startCombat(
  {
    token,
    title,
    character1,
    character2,
    character1Existing,
    character2Existing,
    character1Stats,
    character2Stats,
    userId,
    targetId,
    targetName,
    locale,
  }: {
    token: string;
    title?: string;
    character1: Character | DisaggregatedCharacter;
    character2: Character | DisaggregatedCharacter;
    character1Existing: Schema.Character;
    character2Existing?: Schema.Character;
    character1Stats: CharacterLive;
    character2Stats: CharacterLive;
    userId: string;
    targetId?: string;
    targetName?: string;
    locale: discord.AvailableLocales;
  },
): Promise<[boolean, discord.Message]> {
  let initiative = 0;

  const message = new discord.Message();

  const battleId = utils.nanoid(5);
  const battleKey = ['active_battle', battleId];

  // add battle to db to allow skip functionality
  db.setValue(battleKey, {
    playing: true,
  } as BattleData, { expireIn: MAX_TIME });

  // skip button
  message.addComponents([
    new discord.Component()
      .setId(discord.join('sbattle', battleId, userId))
      .setLabel(i18n.get('skip', locale)),
  ]);

  const data = () => db.getValue<BattleData>(battleKey);

  while (true) {
    // switch initiative

    initiative = initiative === 0 ? 1 : 0;

    const [attacker, defender] = initiative === 0
      ? [character1, character2]
      : [character2, character1];

    const [attackerExisting, defenderExisting] = initiative === 0
      ? [character1Existing, character2Existing]
      : [character2Existing, character1Existing];

    const [attackerStats, defenderStats] = initiative === 0
      ? [character1Stats, character2Stats]
      : [character2Stats, character1Stats];

    // state message

    message.clearEmbedsAndAttachments();

    if (title) {
      message.addEmbed(
        new discord.Embed().setTitle(title),
      );
    }

    const stateUX = [
      () =>
        addEmbed(message, {
          color: '#5d56c7',
          character: attacker,
          existing: attackerExisting,
          stats: attackerStats,
          state: i18n.get('attacking', locale),
        }),
      () =>
        addEmbed(message, {
          character: defender,
          existing: defenderExisting,
          stats: defenderStats,
        }),
    ];

    if (initiative === 1) {
      stateUX.reverse();
    }

    stateUX.forEach((func) => func());

    (await data())?.playing && await utils.sleep(MESSAGE_DELAY);
    (await data())?.playing && await message.patch(token);

    const { damage } = attack(attackerStats, defenderStats);

    // damage message

    message.clearEmbedsAndAttachments();

    if (title) {
      message.addEmbed(
        new discord.Embed().setTitle(title),
      );
    }

    const damageUX = [
      () =>
        addEmbed(message, {
          character: attacker,
          existing: attackerExisting,
          stats: attackerStats,
        }),
      () =>
        addEmbed(message, {
          character: defender,
          existing: defenderExisting,
          stats: defenderStats,
          damage,
        }),
    ];

    if (initiative === 1) {
      damageUX.reverse();
    }

    damageUX.forEach((func) => func());

    (await data())?.playing && await utils.sleep(MESSAGE_DELAY);
    (await data())?.playing && await message.patch(token);

    // battle end message (if hp <= 0)

    if (character1Stats.hp <= 0 || character2Stats.hp <= 0) {
      // const message = new discord.Message();

      // if (title) {
      //   message.addEmbed(
      //     new discord.Embed().setTitle(title),
      //   );
      // }

      // addEmbed(message, {
      //   character: character1,
      //   existing: character1Existing,
      //   stats: character1Stats,
      // });

      // addEmbed(message, {
      //   character: character2,
      //   existing: character2Existing,
      //   stats: character2Stats,
      // });

      message.clearComponents();

      message.addEmbed(
        new discord.Embed()
          .setDescription(
            `### ${
              character1Stats.hp <= 0
                ? (targetName ?? `<@${targetId}>`)
                : `<@${userId}>`
            } ${i18n.get('won', locale)}`,
          ),
      );

      (await data())?.playing && await utils.sleep(MESSAGE_DELAY);

      await message.patch(token);

      return [character1Stats.hp > 0, message];
    }
  }
}

async function skipBattle(battleId: string): Promise<void> {
  const battleKey = ['active_battle', battleId];

  await db.setValue(battleKey, { playing: false } as BattleData, {
    expireIn: MAX_TIME,
  });
}

const battle = {
  challengeFriend,
  challengeTower,
  skipBattle,
};

export default battle;
