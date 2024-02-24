import _user from '~/src/user.ts';
import packs from '~/src/packs.ts';
import utils from '~/src/utils.ts';
import i18n from '~/src/i18n.ts';

import db, { kv } from '~/db/mod.ts';

import * as dynImages from '~/dyn-images/mod.ts';

import * as discord from '~/src/discord.ts';

import config from '~/src/config.ts';

import tower from '~/src/tower.ts';

import { skills } from '~/src/skills.ts';

import { getBattleStats, PartyMember } from '~/src/battle.types.ts';

import { MAX_FLOORS } from '~/src/tower.ts';

import * as Schema from '~/db/schema.ts';

import { NonFetalError } from '~/src/errors.ts';

import type { Character } from './types.ts';

import type { SkillKey } from '~/src/types.ts';

type BattleData = { playing: boolean };

const MESSAGE_DELAY = 2; // 2 seconds
const MAX_TIME = 3 * 60 * 1000; // 3 minutes

function skipBattle(battleId: string): Promise<void> {
  return kv.delete(['active_battle', battleId]);
}

function challengeTower({ token, guildId, user }: {
  token: string;
  guildId: string;
  user: discord.User;
}): discord.Message {
  const locale = _user.cachedUsers[user.id]?.locale;

  if (!config.combat) {
    throw new NonFetalError(
      i18n.get('maintenance-combat', locale),
    );
  }

  Promise.resolve()
    .then(async () => {
      const guild = await db.getGuild(guildId);
      const instance = await db.getInstance(guild);

      const _user = await db.getUser(user.id);

      const { inventory } = await db.getInventory(instance, _user);

      const floor = (inventory.floorsCleared || 0) + 1;

      if (MAX_FLOORS <= floor) {
        throw new NonFetalError(i18n.get('max-floor-cleared', locale));
      }

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

      const _characters = await packs.characters({
        guildId,
        ids: party.map(({ id }) => id),
      });

      const characters = party.map((member) =>
        _characters.find(({ packId, id }) => member.id === `${packId}:${id}`)
      ).filter(Boolean) as Character[];

      if (!characters.length) {
        throw new NonFetalError(i18n.get('character-disabled', locale));
      }

      const enemyStats = tower.createEnemyStats(floor, seed);

      const enemyCharacter = await tower.getEnemyCharacter(
        floor,
        seed,
        guildId,
      );

      const { winnerId, lastMessage } = await startCombat({
        user,
        floor,
        token,
        locale,
        party1: party.map((existing, idx) =>
          new PartyMember({
            existing,
            character: characters[idx],
            stats: getBattleStats(existing),
            owner: 'party1',
          })
        ),
        party2: [
          new PartyMember({
            character: enemyCharacter,
            stats: enemyStats,
            owner: 'party2',
          }),
        ],
      });

      if (winnerId === user.id) {
        await tower.onSuccess({
          token,
          guildId,
          userId: user.id,
          message: lastMessage,
          party,
          inventory,
          locale,
        });
      } else {
        await tower.onFail({
          token,
          userId: user.id,
          message: lastMessage,
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
    user,
    target,
    party1,
    party2,
    locale,
    floor,
  }: {
    token: string;
    user: discord.User;
    target?: discord.User;
    party1: PartyMember[];
    party2: PartyMember[];
    locale: discord.AvailableLocales;
    floor?: number;
  },
): Promise<{ winnerId?: string; lastMessage: discord.Message }> {
  const battleId = utils.nanoid(5);

  const battleKey = ['active_battle', battleId];

  let battleData: BattleData | null = { playing: true };

  await db.setValue(battleKey, battleData, { expireIn: MAX_TIME });

  const battleDataReader = kv
    .watch<[BattleData]>([battleKey])
    .getReader();

  // written this way instead of the recommend for of loop
  // to allow the stream reader to be disposed at the end of the battle
  type Stream = ReadableStreamReadResult<[Deno.KvEntryMaybe<BattleData>]>;

  const read = (result: Stream): Promise<Stream | void> => {
    if (result.done || !battleData?.playing) {
      return Promise.resolve();
    }

    battleData = result.value?.[0]?.value;

    return battleDataReader.read().then(read);
  };

  battleDataReader.read()
    .then(read)
    .catch(console.error);

  const message = new discord.Message()
    .addComponents([
      new discord.Component()
        .setId(discord.join('sbattle', battleId, user.id))
        .setLabel(i18n.get('skip', locale)),
    ]);

  if (floor) {
    message.addEmbed(
      new discord.Embed().setTitle(`${i18n.get('floor', locale)} ${floor}`),
    );
  }

  const party1UsedSkills: Partial<Record<SkillKey, boolean>> = {};
  const party2UsedSkills: Partial<Record<SkillKey, boolean>> = {};

  while (true) {
    const party1Alive = party1.filter((m) => m.alive);
    const party2Alive = party2.filter((m) => m.alive);

    // no one is still alive
    if (!party1Alive.length || !party2Alive.length) {
      break;
    }

    const party1Character: PartyMember = party1Alive[0];
    const party2Character: PartyMember = party2Alive[0];

    party1Character
      .activateAttackBoost(party1Alive)
      .activateDefenseBoost(party1Alive)
      .activateSpeedBoost(party1Alive)
      .activateEnrageBoost();

    party2Character
      .activateAttackBoost(party2Alive)
      .activateDefenseBoost(party2Alive)
      .activateSpeedBoost(party2Alive)
      .activateEnrageBoost();

    const fastestCharacter = determineFastest(party1Character, party2Character);

    const speedDiffPercent = calculateSpeedDiffPercent(
      party1Character,
      party2Character,
    );

    const extraTurnsBonus = calculateExtraTurns(speedDiffPercent);

    const turns: ReturnType<typeof determineFastest>[] = [
      fastestCharacter,
      ...Array(extraTurnsBonus).fill(fastestCharacter),
      fastestCharacter === 'party1' ? 'party2' : 'party1',
    ];

    for (let i = 0; i < turns.length; i++) {
      const turn = turns[i];

      if (!party1Character.alive || !party2Character.alive) {
        break;
      }

      // const attackingParty = turn === 'party1' ? party1Alive : party2Alive;
      const receivingParty = turn === 'party1' ? party2Alive : party1Alive;

      const attacking = turn === 'party1' ? party1Character : party2Character;
      const receiving = turn === 'party1' ? party2Character : party1Character;

      const receivingUsedSkills = turn === 'party1'
        ? party2UsedSkills
        : party1UsedSkills;

      prepRound({
        message,
        combo: i > 0 && i < turns.length - 1 ? i + 1 : 0,
        attacking,
        receiving,
        locale,
      });

      battleData?.playing && await utils.sleep(MESSAGE_DELAY);
      battleData?.playing && await message.patch(token);

      actionRound({
        message,
        attacking,
        receiving,
        locale,
      });

      battleData?.playing && await utils.sleep(MESSAGE_DELAY);
      battleData?.playing && await message.patch(token);

      if (
        receiving.alive &&
        receiving.isHpBelowOrEquals(25) &&
        !receivingUsedSkills.heal
      ) {
        const healers = receivingParty
          .filter((char) => char.skills.heal?.level)
          .sort((a, b) =>
            // deno-lint-ignore no-non-null-assertion
            b.skills.heal!.level - a.skills.heal!.level
          );

        if (healers.length) {
          const healer = healers[0];

          const skill = skills.heal.activation(
            healer,
            receiving,
            // deno-lint-ignore no-non-null-assertion
            healer.skills.heal!.level,
          );

          receivingUsedSkills.heal = true;

          if (skill.heal) {
            receiving.heal(skill.heal);

            healRound({
              message,
              healing: receiving,
              receiving: attacking,
              heal: skill.heal,
              locale,
            });

            battleData?.playing && await utils.sleep(MESSAGE_DELAY);
            battleData?.playing && await message.patch(token);
          }
        }
      }
    }
  }

  const party1Win = party1.some((m) => m.alive);

  battleData?.playing && await utils.sleep(MESSAGE_DELAY);

  // dispose of the database watch stream
  battleDataReader.cancel();

  return {
    lastMessage: message.clearComponents(),
    winnerId: party1Win ? user.id : target?.id,
  };
}

function determineFastest(
  party1Character: PartyMember,
  party2Character: PartyMember,
): 'party1' | 'party2' {
  return party1Character.speed > party2Character.speed ? 'party1' : 'party2';
}

function calculateSpeedDiffPercent(
  party1Character: PartyMember,
  party2Character: PartyMember,
): number {
  let party1Speed = party1Character.speed;
  let party2Speed = party2Character.speed;

  // swap speeds to get the correct diff from the algorithm
  if (party2Speed > party1Speed) {
    const t = party1Speed;
    party1Speed = party2Speed;
    party2Speed = t;
  }

  return ((party1Speed - party2Speed) / party2Speed) * 100;
}

function calculateExtraTurns(speedDiffPercent: number): number {
  return Math.min(Math.floor(speedDiffPercent / 50), 2);
}

function prepRound(
  { message, attacking, receiving, combo, locale }: {
    combo: number;
    message: discord.Message;
    attacking: PartyMember;
    receiving: PartyMember;
    locale: discord.AvailableLocales;
  },
): void {
  message.clearEmbedsAndAttachments(1);

  const embeds: Parameters<typeof addEmbed>[0][] = [
    { message, type: 'normal', character: receiving, locale },
    { message, type: 'attacking', character: attacking, locale, combo },
  ];

  if (receiving.owner === 'party1') {
    embeds.reverse();
  }

  embeds.forEach(addEmbed);
}

function healRound(
  { message, healing, receiving, heal, locale }: {
    message: discord.Message;
    healing: PartyMember;
    receiving: PartyMember;
    heal: number;
    locale: discord.AvailableLocales;
  },
): void {
  message.clearEmbedsAndAttachments(1);

  const embeds: Parameters<typeof addEmbed>[0][] = [
    { message, type: 'normal', character: receiving, locale },
    { message, type: 'heal', character: healing, locale, diff: heal },
  ];

  if (receiving.owner === 'party1') {
    embeds.reverse();
  }

  embeds.forEach(addEmbed);
}

function actionRound(
  { message, attacking, receiving, locale }: {
    message: discord.Message;
    attacking: PartyMember;
    receiving: PartyMember;
    locale: discord.AvailableLocales;
  },
): void {
  let damage = Math.max(attacking.attack - receiving.defense, 1);

  let subtitle: string | undefined = undefined;

  if (attacking.skills.crit?.level) {
    const lvl = attacking.skills.crit.level;

    const { damage: extraDamage } = skills.crit.activation(
      attacking,
      receiving,
      lvl,
    );

    if (extraDamage) {
      damage += extraDamage;
      subtitle = i18n.get('crit', locale);
    }
  }

  receiving.damage(damage);

  message.clearEmbedsAndAttachments(1);

  const embeds: Parameters<typeof addEmbed>[0][] = [
    {
      message,
      subtitle,
      type: 'hit',
      character: receiving,
      diff: -damage,
      locale,
    },
    { message, type: 'normal', character: attacking, locale },
  ];

  if (receiving.owner === 'party1') {
    embeds.reverse();
  }

  embeds.forEach(addEmbed);
}

const addEmbed = ({
  message,
  subtitle,
  character,
  type,
  diff,
  combo,
  locale,
}: {
  message: discord.Message;
  subtitle?: string;
  character: PartyMember;
  type: 'normal' | 'attacking' | 'hit' | 'heal';
  diff?: number;
  combo?: number;
  locale: discord.AvailableLocales;
}) => {
  diff ??= 0;

  let state = discord.empty;

  const embed = new discord.Embed();

  const uuid = crypto.randomUUID();

  switch (type) {
    case 'attacking':
      embed.setColor('#5D56C7');
      state = i18n.get('attacking', locale);
      if (combo) state = `${state} x${combo}`;
      break;
    case 'heal':
      embed.setColor('#2BB540');
      state = `+${diff}`;
      break;
    case 'hit':
      embed.setColor('#DE2626');
      state = `${diff}`;
      break;
    default:
      break;
  }

  embed
    .setThumbnail({
      url: character.existing?.image ?? character.character.images?.[0]?.url,
    })
    .setDescription(
      [
        `## ${
          character?.existing?.nickname ??
            packs.aliasToArray(character.character.name)[0]
        }`,
        state,
        subtitle ? `*${subtitle}*` : undefined,
      ].filter(Boolean).join('\n'),
    )
    .setImage({ url: `attachment://${uuid}.png` })
    .setFooter({
      text: `${character.hp}/${character.maxHP}`,
    });

  const left = Math.round((character.hp / character.maxHP) * 100);
  const _diff = Math.round((Math.abs(diff) / character.maxHP) * 100);

  message.addAttachment({
    type: 'image/png',
    filename: `${uuid}.png`,
    arrayBuffer: dynImages.hp(left, diff < 0 ? -_diff : _diff).buffer,
  });

  message.addEmbed(embed);
};

const battle = { challengeTower, skipBattle };

export default battle;
