import _user from '~/src/user.ts';
import packs from '~/src/packs.ts';

import utils from '~/src/utils.ts';
import i18n from '~/src/i18n.ts';

import gacha from '~/src/gacha.ts';

import { skills } from '~/src/skills.ts';

import db from '~/db/mod.ts';

import { randomStats } from '~/db/addCharacter.ts';

import * as discord from '~/src/discord.ts';

import config from '~/src/config.ts';

import { NonFetalError, PoolError } from '~/src/errors.ts';

import type * as Schema from '~/db/schema.ts';

import type { Character, CharacterBattleStats, SkillKey } from '~/src/types.ts';

import { type WithId } from 'mongodb';

export const MAX_FLOORS = 20;

const calculateMultipleOfTen = (num: number): number => {
  return Math.max(1, num % 10 === 0 ? num / 10 : Math.floor(num / 10) + 1);
};

export const getFloorExp = (floor: number): number => {
  let exp = 0;

  const base = calculateMultipleOfTen(floor);

  switch (floor % 10) {
    case 1:
    case 2:
    case 3:
    case 4:
      exp = 1;
      break;
    case 5:
      exp = 2;
      break;
    case 6:
    case 7:
    case 8:
    case 9:
      exp = 1.5;
      break;
    case 0:
      exp = 3;
      break;
    default:
      throw new Error('');
  }

  return exp * base;
};

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
    // 10nth floor
    case 0:
      return 5;
    default:
      throw new Error('');
  }
};

export const getEnemySkillSlots = (floor: number): number => {
  const skillsPool = Object.keys(skills);

  return Math.min(Math.floor(floor / 5), skillsPool.length);
};

export const getEnemyMaxSkillLevel = (floor: number): number => {
  return Math.max(Math.floor(floor / 5), 1);
};

export const createEnemyStats = (
  floor: number,
  seed: string,
): CharacterBattleStats => {
  const skillRng = new utils.LehmerRNG(seed);

  const totalStats = 9 * getEnemyRating(floor);

  const _skills: CharacterBattleStats['skills'] = {};

  const skillsPool = Object.keys(skills) as SkillKey[];

  const skillsSlots = getEnemySkillSlots(floor);
  const skillLevel = getEnemyMaxSkillLevel(floor);

  for (let i = 0; i < skillsSlots; i++) {
    if (!skillsPool.length) {
      break;
    }

    const randomSkillKey = skillsPool.splice(
      Math.floor(skillRng.nextFloat() * skillsPool.length),
      1,
    )[0];

    _skills[randomSkillKey] = {
      level: Math.min(skillLevel, skills[randomSkillKey].max),
    };
  }

  const state: CharacterBattleStats = {
    ...randomStats(totalStats, seed),
    skills: _skills,
    maxHP: 0,
  };

  const multiplier = 0.5;

  const base = floor;

  state.attack = Math.round(
    state.attack * Math.pow(base, multiplier),
  );

  state.defense = Math.round(
    state.defense * Math.pow(base, multiplier),
  );

  state.speed = Math.round(
    state.speed * Math.pow(base, multiplier),
  );

  state.hp =
    state.maxHP =
      Math.round(
        state.hp * Math.pow(base, multiplier),
      );

  return state;
};

export async function getEnemyCharacter(
  floor: number,
  seed: string,
  guildId: string,
): Promise<Character> {
  const random = new utils.LehmerRNG(seed);

  const { pool, validate } = await gacha.guaranteedPool({
    guildId,
    guarantee: getEnemyRating(floor),
  });

  let character: Character | undefined = undefined;

  const controller = new AbortController();

  const { signal } = controller;

  const timeoutId = setTimeout(() => controller.abort(), 1 * 60 * 1000);

  try {
    while (!signal.aborted) {
      const i = Math.floor(random.nextFloat() * pool.length);

      const characterId = pool[i].id;

      const results = await packs.aggregatedCharacters({
        guildId,
        ids: [characterId],
      });

      if (!results.length || !validate(results[0])) {
        continue;
      }

      const media = results[0].media?.edges?.[0];

      if (!media || !validate(results[0]) || !results[0]?.images?.length) {
        continue;
      }

      if (
        packs.isDisabled(`${media.node.packId}:${media.node.id}`, guildId)
      ) {
        continue;
      }

      character = results[0];

      break;
    }
  } finally {
    clearTimeout(timeoutId);
  }

  if (!character) {
    throw new PoolError();
  }

  return character;
}

function getMessage(
  cleared: number,
  userId: string,
  locale: discord.AvailableLocales,
): discord.Message {
  let t: number[];
  const message = new discord.Message();

  switch (cleared) {
    case 0:
    case 1:
      t = [1, 2, 3, 4, 5];
      break;
    case MAX_FLOORS:
    case MAX_FLOORS - 1:
    case MAX_FLOORS - 2:
      t = [
        MAX_FLOORS - 4,
        MAX_FLOORS - 3,
        MAX_FLOORS - 2,
        MAX_FLOORS - 1,
        MAX_FLOORS,
      ];
      break;
    default:
      t = [cleared - 1, cleared, cleared + 1, cleared + 2, cleared + 3];
      break;
  }

  const s = t.toReversed().map((number) => {
    if (number === cleared + 1) {
      return `${discord.emotes.currentFloor} ${
        i18n.get('floor', locale)
      } ${number} - ${i18n.get('current', locale)}`;
    } else if (number > cleared) {
      return `${discord.emotes.undiscoveredFloor} ${
        i18n.get('floor', locale)
      } ${number} - ${i18n.get('undiscovered', locale)}`;
    } else {
      return `${discord.emotes.clearedFloor} ${
        i18n.get('floor', locale)
      } ${number} - ${i18n.get('cleared', locale)}`;
    }
  });

  message.addEmbed(new discord.Embed()
    .setDescription(s.join('\n')));

  message.addComponents([
    new discord.Component()
      .setId('tchallenge', userId)
      .setLabel('/bt challenge')
      .setDisabled(MAX_FLOORS <= cleared),
    new discord.Component()
      .setId('treclear')
      .setLabel('/reclear')
      .setDisabled(cleared <= 0),
  ]);

  return message;
}

function view({ token, guildId, userId }: {
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
      const { floorsCleared } = await db.getInventory(guildId, userId);

      await getMessage(floorsCleared, userId, locale)
        .patch(token);
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

function reclear({ token, guildId, userId }: {
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
      const inventory = await db
        .rechargeConsumables(guildId, userId);

      if (inventory.floorsCleared <= 0) {
        throw new NonFetalError(
          i18n.get('no-cleared-floors', locale),
        );
      }

      // deno-lint-ignore no-non-null-assertion
      if (inventory.availableKeys! <= 0) {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed()
              .setDescription(i18n.get('combat-no-more-keys', locale)),
          )
          .addEmbed(
            new discord.Embed()
              .setDescription(
                i18n.get(
                  '+1-key',
                  locale,
                  `<t:${
                    utils.rechargeKeysTimestamp(inventory.keysTimestamp)
                  }:R>`,
                ),
              ),
          )
          .patch(token);
      }

      const party = [
        inventory.party.member1,
        inventory.party.member2,
        inventory.party.member3,
        inventory.party.member4,
        inventory.party.member5,
      ].filter(utils.nonNullable);

      const status = await db.gainExp(
        userId,
        guildId,
        inventory.floorsCleared,
        party.map(({ _id }) => _id),
        inventory.availableKeys,
      );

      const message = new discord.Message();

      const _characters = await packs.characters({
        guildId,
        ids: party.map(({ characterId }) => characterId),
      });

      const characters = party.map((existing) => {
        return {
          existing,
          // deno-lint-ignore no-non-null-assertion
          char: _characters.find((c) =>
            existing.characterId === `${c.packId}:${c.id}`
          )!,
          // deno-lint-ignore no-non-null-assertion
          status: status.find((c) => existing.characterId === c.id)!,
        };
      });

      const statusText = characters.map(
        ({ char, existing, status }) => {
          if (status.levelUp >= 1) {
            return i18n.get(
              'leveled-up',
              locale,
              existing?.nickname ??
                packs.aliasToArray(char.name)[0],
              status.levelUp === 1 ? ' ' : ` ${status.levelUp}x `,
              status.statPoints,
              i18n.get('stat-points').toLowerCase(),
              status.skillPoints,
              i18n.get(
                status.skillPoints === 1 ? 'skill-point' : 'skill-points',
              )
                .toLowerCase(),
            );
          } else {
            return i18n.get(
              'exp-gained',
              locale,
              existing.nickname ??
                packs.aliasToArray(char.name)[0],
              status.exp,
              status.expGained,
              status.expToLevel,
            );
          }
        },
      ).join('\n');

      message.addEmbed(
        new discord.Embed()
          .setTitle(
            // deno-lint-ignore no-non-null-assertion
            `${i18n.get('floor', locale)} ${inventory
              .floorsCleared!} x${inventory.availableKeys}`,
          )
          .setDescription(statusText),
      );

      return await message.patch(token);
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

async function onFail(
  { token, message, userId, locale }: {
    token: string;
    userId: string;
    message: discord.Message;
    locale: discord.AvailableLocales;
  },
): Promise<void> {
  message.addEmbed(
    new discord.Embed()
      .setTitle(i18n.get('you-failed', locale))
      .setDescription(i18n.get('tower-fail', locale)),
  );

  // reclear button
  message.addComponents([
    new discord.Component()
      .setId('treclear')
      .setLabel(`/reclear`),
  ]);

  // try again button
  message.addComponents([
    new discord.Component()
      .setId(discord.join('tchallenge', userId))
      .setLabel(i18n.get('try-again', locale)),
  ]);

  await message.patch(token);
}

async function onSuccess(
  { token, message, party, userId, guildId, locale }: {
    token: string;
    userId: string;
    guildId: string;
    party: WithId<Schema.Character>[];
    message: discord.Message;
    locale: discord.AvailableLocales;
  },
): Promise<void> {
  const inventory = await db
    .getInventory(guildId, userId);

  const status = await db.gainExp(
    userId,
    guildId,
    inventory.floorsCleared + 1,
    party.map(({ _id }) => _id),
    0,
  );

  const _characters = await packs.characters({
    guildId,
    ids: party.map(({ characterId }) => characterId),
  });

  const characters = party.map((existing) => {
    return {
      existing,
      // deno-lint-ignore no-non-null-assertion
      char: _characters.find((c) =>
        existing.characterId === `${c.packId}:${c.id}`
      )!,
      // deno-lint-ignore no-non-null-assertion
      status: status.find((c) => existing.characterId === c.id)!,
    };
  });

  const statusText = characters.map(
    ({ char, existing, status }) => {
      if (status.levelUp >= 1) {
        return i18n.get(
          'leveled-up',
          locale,
          existing?.nickname ??
            packs.aliasToArray(char.name)[0],
          status.levelUp === 1 ? ' ' : ` ${status.levelUp}x `,
          status.statPoints,
          i18n.get('stat-points').toLowerCase(),
          status.skillPoints,
          i18n.get(
            status.skillPoints === 1 ? 'skill-point' : 'skill-points',
          )
            .toLowerCase(),
        );
      } else {
        return undefined;
      }
    },
  ).filter(utils.nonNullable).join('\n');

  message.addEmbed(
    new discord.Embed()
      .setTitle(i18n.get('you-succeeded', locale))
      .setDescription(statusText),
  );

  // next floor challenge button
  message.addComponents([
    new discord.Component()
      .setId(discord.join('tchallenge', userId))
      .setLabel(i18n.get('next-floor', locale)),
  ]);

  await message.patch(token);
}

const tower = {
  view,
  reclear,
  onFail,
  onSuccess,
  getEnemyCharacter,
  createEnemyStats,
};

export default tower;
