import _user from '~/src/user.ts';
import packs from '~/src/packs.ts';
import utils from '~/src/utils.ts';
import i18n from '~/src/i18n.ts';

import db, { kv } from '~/db/mod.ts';

import * as dynImages from '~/dyn-images/mod.ts';

import * as discord from '~/src/discord.ts';

import config from '~/src/config.ts';

import tower, { getEnemyCharacter, getEnemyStats } from '~/src/tower.ts';

import * as Schema from '~/db/schema.ts';

import { NonFetalError } from '~/src/errors.ts';

import type {
  Character,
  CharacterTracking,
  DisaggregatedCharacter,
  SkillOutput,
} from './types.ts';

type BattleData = { playing: boolean };

const MESSAGE_DELAY = 2; // 2 seconds
const MAX_TIME = 3 * 60 * 1000; // 3 minutes

const getStats = (char: Schema.Character): CharacterTracking => {
  return {
    skills: char.combat?.skills ?? {},
    attack: char.combat?.curStats?.attack ?? 0,
    speed: char.combat?.curStats?.speed ?? 1,
    defense: char.combat?.curStats?.defense ?? 1,
    hp: char.combat?.curStats?.defense ?? 1,
    maxHP: char.combat?.curStats?.defense ?? 1,
  };
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
  stats: CharacterTracking;
  existing?: Schema.Character;
  damage?: number;
  state?: string;
  color?: string;
}) => {
  damage = damage || 0;

  let _state = state ?? discord.empty;

  const uuid = crypto.randomUUID();

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
      }\n_${_state}_\n${stats.hp}/${stats.maxHP}`,
    );

  const percent = Math.round((stats.hp / stats.maxHP) * 100);
  const _damage = Math.round((damage / stats.maxHP) * 100);

  message.addAttachment({
    type: 'image/png',
    arrayBuffer: dynImages.hp(percent, _damage).buffer,
    filename: `${uuid}.png`,
  });

  message.addEmbed(embed);
};

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

      const floor = inventory.floorsCleared || 1;

      const seed = `${guildId}${floor}`;

      const _party = await db.getUserParty(inventory);

      const party = Object.values(_party)
        .filter(Boolean) as Schema.Character[];

      if (party.length <= 0) {
        throw new NonFetalError(i18n.get('your-party-empty', locale));
      } else if (
        party.some((char) => !char.combat?.baseStats || !char.combat?.curStats)
      ) {
        throw new Error('non-stats initialized characters are in the party');
      }

      const characters = await packs.aggregatedCharacters({
        guildId,
        ids: party.map(({ id }) => id),
      });

      const userParty = party.map((member) =>
        characters.find(({ packId, id }) => member.id === `${packId}:${id}`)
      ).filter(Boolean) as Character[];

      if (!userParty.length) {
        throw new NonFetalError(i18n.get('character-disabled', locale));
      }

      const enemyStats = getEnemyStats(floor, seed);
      const enemyCharacter = await getEnemyCharacter(floor, seed, guildId);

      const [userWon, _lastMessage] = await startCombat({
        token,
        locale,
        userId,
        title: `${i18n.get('floor', locale)} ${floor}`,
        targetName: packs.aliasToArray(enemyCharacter.name)[0],
        character1: userParty[0],
        character2: enemyCharacter,
        character1Existing: party[0],
        character2Existing: undefined,
        character1Stats: getStats(party[0]),
        character2Stats: enemyStats,
      });

      if (userWon) {
        tower.onSuccess({
          token,
          userId,
          guildId,
          message: _lastMessage,
          party: party,
          inventory,
          locale,
        });
      } else {
        tower.onFail({ token, message: _lastMessage, userId, locale });
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

function attack(
  char: CharacterTracking,
  target: CharacterTracking,
): SkillOutput {
  let damage = 0;

  // activate character skills
  // Object.entries(char.skills).map(([key, s]) => {
  //   const skill = skills.pool[key];

  //   if (skill.activationTurn === 'user') {
  //     const outcome = skill.activation(char, target, s.level);

  //     if (outcome.damage) {
  //       damage += Math.round(outcome.damage);
  //     }
  //   }
  // });

  damage += Math.max(char.attack - target.defense, 1);

  // activate enemy/target skills
  // Object.entries(target.skills).map(([key, s]) => {
  //   const skill = skills.pool[key];

  //   if (skill.activationTurn === 'enemy') {
  //     const outcome = skill.activation(char, target, s.level);

  //     if (outcome.dodge) {
  //       damage = 0;
  //     }
  //   }
  // });

  target.hp = Math.max(target.hp - damage, 0);

  return { damage };
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
    character1: Character;
    character2: Character | DisaggregatedCharacter;
    character1Existing: Schema.Character;
    character2Existing?: Schema.Character;
    character1Stats: CharacterTracking;
    character2Stats: CharacterTracking;
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

  let battleData: BattleData = { playing: true };

  db.setValue(battleKey, battleData, { expireIn: MAX_TIME });

  // skip button
  message.addComponents([
    new discord.Component()
      .setId(discord.join('sbattle', battleId, userId))
      .setLabel(i18n.get('skip', locale)),
  ]);

  const battleDataStream = kv.watch<[BattleData]>([battleKey]);

  for await (const [newData] of battleDataStream) {
    if (newData.value) {
      battleData = newData.value;
    }
  }

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
          character: defender,
          existing: defenderExisting,
          stats: defenderStats,
        }),
      () =>
        addEmbed(message, {
          color: '#5d56c7',
          character: attacker,
          existing: attackerExisting,
          stats: attackerStats,
          state: i18n.get('attacking', locale),
        }),
    ];

    if (initiative === 1) {
      stateUX.reverse();
    }

    stateUX.forEach((func) => func());

    battleData.playing && await utils.sleep(MESSAGE_DELAY);
    battleData.playing && await message.patch(token);

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
          character: defender,
          existing: defenderExisting,
          stats: defenderStats,
          damage,
        }),
      () =>
        addEmbed(message, {
          character: attacker,
          existing: attackerExisting,
          stats: attackerStats,
        }),
    ];

    if (initiative === 1) {
      damageUX.reverse();
    }

    damageUX.forEach((func) => func());

    battleData.playing && await utils.sleep(MESSAGE_DELAY);
    battleData.playing && await message.patch(token);

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

      battleData.playing && await utils.sleep(MESSAGE_DELAY);
      await message.patch(token);

      return [character1Stats.hp > 0, message];
    }
  }
}

async function skipBattle(battleId: string): Promise<void> {
  const battleKey = ['active_battle', battleId];

  await db.setValue(battleKey, { playing: false } satisfies BattleData, {
    expireIn: MAX_TIME,
  });
}

const battle = {
  // challengeFriend,
  challengeTower,
  skipBattle,
};

export default battle;
