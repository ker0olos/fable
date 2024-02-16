import _user from '~/src/user.ts';
import packs from '~/src/packs.ts';
import utils from '~/src/utils.ts';
import i18n from '~/src/i18n.ts';

import db, { kv } from '~/db/mod.ts';

import * as dynImages from '~/dyn-images/mod.ts';

import * as discord from '~/src/discord.ts';

import config from '~/src/config.ts';

import tower from '~/src/tower.ts';

import { MAX_FLOORS } from '~/src/tower.ts';

import * as Schema from '~/db/schema.ts';

import { NonFetalError } from '~/src/errors.ts';

import type { Character, CharacterState } from './types.ts';

type BattleData = { playing: boolean };

const MESSAGE_DELAY = 2; // 2 seconds
const MAX_TIME = 3 * 60 * 1000; // 3 minutes

function skipBattle(battleId: string): Promise<void> {
  return kv.delete(['active_battle', battleId]);
}

type PartyMember = {
  character: Character;
  state: CharacterState;
  existing?: Schema.Character;
};

const getStats = (char: Schema.Character): CharacterState => {
  return {
    skills: char.combat?.skills ?? {},
    //
    attack: char.combat?.curStats?.attack ?? 0,
    speed: char.combat?.curStats?.speed ?? 1,
    //
    defense: char.combat?.curStats?.defense ?? 1,
    hp: char.combat?.curStats?.defense ?? 1,
    maxHP: char.combat?.curStats?.defense ?? 1,
  };
};

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

      const floor = inventory.floorsCleared || 1;

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

      const enemyState = tower.createEnemyState(floor, seed);

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
        party1: party.map((existing, idx) => ({
          existing,
          character: characters[idx],
          state: getStats(existing),
        })),
        party2: [{
          character: enemyCharacter,
          state: enemyState,
        }],
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

  while (true) {
    // returns the first alive party member of each party
    const party1Character = party1.find(({ state }) => state.hp > 0);
    const party2Character = party2.find(({ state }) => state.hp > 0);

    // no one is still alive
    if (!party1Character || !party2Character) {
      break;
    }

    const fastestCharacter = determineFastest(party1Character, party2Character);

    const speedDiffPercent =
      ((party1Character.state.speed - party2Character.state.speed) /
        party2Character.state.speed) * 100;

    const extraTurnsBonus = calculateExtraTurns(speedDiffPercent);

    const turns: ReturnType<typeof determineFastest>[] = [
      fastestCharacter,
      ...Array(extraTurnsBonus).fill(fastestCharacter),
      fastestCharacter === 'party1' ? 'party2' : 'party1',
    ];

    for (let i = 0; i < turns.length; i++) {
      const turn = turns[i];
      const _prev = i > 0 ? turns[i - 1] : undefined;

      if (party1Character.state.hp <= 0 || party2Character.state.hp <= 0) {
        break;
      }

      const attacking = turn === 'party1' ? party1Character : party2Character;
      const receiving = turn === 'party1' ? party2Character : party1Character;

      // purely visual to show the user who's attacking
      prepRound({
        message,
        attacking,
        receiving,
        same: _prev === turn,
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
    }
  }

  const party1Win = party1.some(({ state }) => state.hp > 0);

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
  return party1Character.state.speed > party2Character.state.speed
    ? 'party1'
    : 'party2';
}

function calculateExtraTurns(speedDiffPercent: number): number {
  return Math.min(Math.floor(speedDiffPercent / 50), 2);
}

function prepRound(
  { message, attacking, receiving, same, locale }: {
    message: discord.Message;
    attacking: PartyMember;
    receiving: PartyMember;
    same: boolean;
    locale: discord.AvailableLocales;
  },
): void {
  message.clearEmbedsAndAttachments(1);

  addEmbed({ message, type: 'normal', character: receiving, locale });

  addEmbed({
    message,
    character: attacking,
    type: 'attacking',
    locale,
    subtitle: same ? i18n.get('attacking-again', locale) : undefined,
  });
}

function actionRound(
  { message, attacking, receiving, locale }: {
    message: discord.Message;
    attacking: PartyMember;
    receiving: PartyMember;
    locale: discord.AvailableLocales;
  },
): void {
  const damage = Math.max(
    attacking.state.attack - receiving.state.defense,
    0,
  );

  receiving.state.hp = Math.max(receiving.state.hp - damage, 0);

  message.clearEmbedsAndAttachments(1);

  addEmbed({
    message,
    character: receiving,
    type: 'hit',
    diff: -damage,
    locale,
  });

  addEmbed({ message, type: 'normal', character: attacking, locale });
}

const addEmbed = ({
  subtitle,
  character,
  diff,
  type,
  locale,
  message,
}: {
  message: discord.Message;
  subtitle?: string;
  character: PartyMember;
  type: 'normal' | 'attacking' | 'hit' | 'heal';
  diff?: number;
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
      text: `${character.state.hp}/${character.state.maxHP}`,
    });

  const left = Math.round((character.state.hp / character.state.maxHP) * 100);
  const _diff = Math.round((Math.abs(diff) / character.state.maxHP) * 100);

  message.addAttachment({
    type: 'image/png',
    filename: `${uuid}.png`,
    arrayBuffer: dynImages.hp(left, diff < 0 ? -_diff : _diff).buffer,
  });

  message.addEmbed(embed);
};

const battle = { challengeTower, skipBattle };

export default battle;
