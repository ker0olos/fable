import _user from '~/src/user.ts';
import packs from '~/src/packs.ts';

import utils from '~/src/utils.ts';
import i18n from '~/src/i18n.ts';

import gacha from '~/src/gacha.ts';
import skills from '~/src/skills.ts';

import db from '~/db/mod.ts';

import * as discord from '~/src/discord.ts';

import config from '~/src/config.ts';

import { NonFetalError, PoolError } from '~/src/errors.ts';

import type * as Schema from '~/db/schema.ts';

import type { Character, CharacterTracking } from '~/src/types.ts';

export const MAX_FLOORS = 10;

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
  const skillsPool = Object.keys(skills.pool);
  return Math.min(Math.floor(floor / 10), skillsPool.length);
};

export const getEnemyMaxSkillLevel = (floor: number): number => {
  return Math.max(Math.floor(floor / 5), 1);
};

export const getEnemyStats = (
  floor: number,
  seed: string,
): CharacterTracking => {
  const rng = new utils.LehmerRNG(seed);
  const skillRng = new utils.LehmerRNG(seed);

  // same as player characters
  const totalStats = 3 * getEnemyRating(floor);

  const _skills: CharacterTracking['skills'] = {};

  const skillsPool = Object.values(skills.pool);
  const skillsSlots = getEnemySkillSlots(floor);
  const maxSkillLevel = getEnemyMaxSkillLevel(floor);

  for (let i = 0; i < skillsSlots; i++) {
    const randomSkill = skillsPool[
      Math.floor(skillRng.nextFloat() * skillsPool.length)
    ];

    _skills[randomSkill.key] = {
      level: Math.min(
        maxSkillLevel,
        randomSkill.stats.slice(-1)[0].scale.length,
      ),
    };
  }

  const stats: CharacterTracking = {
    skills: _skills,
    attack: 0,
    defense: 0,
    speed: 0,
    hp: 0,
    maxHP: 0,
  };

  for (let i = 0; i < totalStats; i++) {
    const rand = Math.floor(rng.nextFloat() * 3);

    if (rand === 0) {
      stats.attack += 1;
    } else if (rand === 1) {
      stats.defense += 1;
    } else {
      stats.speed += 1;
    }
  }

  const multiplier = 0.5;
  const base = floor;

  stats.attack = Math.round(
    stats.attack * Math.pow(base, multiplier),
  );

  stats.defense = stats.maxHP = stats.hp = Math.max(
    Math.round(
      stats.defense * Math.pow(base, multiplier),
    ),
    1,
  );

  stats.speed = Math.round(
    stats.speed * Math.pow(base, multiplier),
  );

  return stats;
};

export async function getEnemyCharacter(
  floor: number,
  seed: string,
  guildId: string,
): Promise<Character> {
  const random = new utils.LehmerRNG(seed);

  const { pool, validate } = await gacha.guaranteedPool({
    seed,
    guildId,
    guarantee: getEnemyRating(floor),
  });

  let character: Character | undefined = undefined;

  while (pool.length > 0) {
    const i = Math.floor(random.nextFloat() * pool.length);

    const characterId = pool.splice(i, 1)[0].id;

    if (packs.isDisabled(characterId, guildId)) {
      continue;
    }

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

  // sweep button
  message.addComponents([
    new discord.Component()
      .setId('tsweep')
      .setLabel(i18n.get('sweep', locale))
      .setDisabled(cleared <= 0),
  ]);

  // challenge button
  message.addComponents([
    new discord.Component()
      .setId('tchallenge', userId)
      .setLabel(i18n.get('challenge', locale))
      .setDisabled(MAX_FLOORS <= cleared),
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
      const guild = await db.getGuild(guildId);
      const instance = await db.getInstance(guild);

      const _user = await db.getUser(userId);

      const { inventory } = await db.getInventory(instance, _user);

      const cleared = inventory?.floorsCleared || 0;

      await getMessage(cleared, userId, locale)
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

function sweep({ token, guildId, userId }: {
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
      let retires = 0;

      while (retires < 5) {
        const guild = await db.getGuild(guildId);
        const instance = await db.getInstance(guild);

        const user = await db.getUser(userId);

        const { inventory, inventoryCheck } = await db.rechargeConsumables(
          instance,
          user,
          false,
        );

        if (!inventory.floorsCleared) {
          throw new NonFetalError(
            i18n.get('no-cleared-floors', locale),
          );
        }

        // deno-lint-ignore no-non-null-assertion
        if (inventory.availableSweeps! <= 0) {
          return await new discord.Message()
            .addEmbed(
              new discord.Embed()
                .setDescription(i18n.get('combat-no-more-sweeps', locale)),
            )
            .addEmbed(
              new discord.Embed()
                .setDescription(
                  i18n.get(
                    '+1-sweep',
                    locale,
                    `<t:${
                      utils.rechargeSweepTimestamp(inventory.sweepsTimestamp)
                    }:R>`,
                  ),
                ),
            )
            .patch(token);
        }

        const party = await db.getUserParty(inventory);

        const party1 = [
          party?.member1,
          party?.member2,
          party?.member3,
          party?.member4,
          party?.member5,
        ].filter(Boolean) as Schema.Character[];

        const op = db.kv.atomic();

        db.consumeSweep({ op, user, inventory, inventoryCheck });

        // deno-lint-ignore no-non-null-assertion
        const expGained = getFloorExp(inventory.floorsCleared!);

        const status = party1.map((character, index) =>
          db.gainExp(
            op,
            inventory,
            character,
            index === 0 ? expGained : expGained * 0.5,
          )
        );

        const update = await op.commit();

        if (update.ok) {
          const message = new discord.Message();

          const _characters = await packs.characters({
            guildId,
            ids: party1.map(({ id }) => id),
          });

          const characters = party1.map(({ id }) => {
            return _characters.find((c) => id === `${c.packId}:${c.id}`);
          });

          const statusText = status.map(
            ({
              levelUp,
              skillPoints,
              statPoints,
              exp,
              expToLevel,
            }, index) => {
              if (levelUp >= 1) {
                return i18n.get(
                  'leveled-up',
                  locale,
                  party1[index].nickname ??
                    // deno-lint-ignore no-non-null-assertion
                    packs.aliasToArray(characters[index]!.name)[0],
                  levelUp === 1 ? ' ' : ` ${levelUp}x `,
                  statPoints,
                  i18n.get('stat-points').toLowerCase(),
                  skillPoints,
                  i18n.get(skillPoints === 1 ? 'skill-point' : 'skill-points')
                    .toLowerCase(),
                );
              } else {
                return i18n.get(
                  'exp-gained',
                  locale,
                  party1[index].nickname ??
                    // deno-lint-ignore no-non-null-assertion
                    packs.aliasToArray(characters[index]!.name)[0],
                  exp,
                  expToLevel,
                );
              }
            },
          ).join('\n');

          message.addEmbed(
            new discord.Embed()
              .setTitle(
                // deno-lint-ignore no-non-null-assertion
                `${i18n.get('floor', locale)} ${inventory.floorsCleared!}`,
              )
              .setDescription(statusText),
          );

          // sweep button
          message.addComponents([
            new discord.Component()
              .setId('tsweep')
              .setLabel(`/sweep`),
          ]);

          return await message.patch(token);
        }

        retires += 1;
      }

      throw new Error('failed to update inventory');
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
  { token, userId, message, locale }: {
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

  // sweep button
  message.addComponents([
    new discord.Component()
      .setId('tsweep')
      .setLabel(`/sweep`),
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
  { token, message, inventory, party, userId, guildId, locale }: {
    token: string;
    userId: string;
    guildId: string;
    message: discord.Message;
    inventory: Schema.Inventory;
    party: Schema.Character[];
    locale: discord.AvailableLocales;
  },
): Promise<void> {
  const op = db.kv.atomic();

  const floor = db.clearFloor(op, inventory);

  const expGained = getFloorExp(floor);

  const status = party.map((character, index) =>
    db.gainExp(
      op,
      inventory,
      character,
      index === 0 ? expGained : expGained * 0.5,
    )
  );

  const _characters = await packs.characters({
    guildId,
    ids: party.map(({ id }) => id),
  });

  const characters = party.map(({ id }) => {
    return _characters.find((c) => id === `${c.packId}:${c.id}`);
  });

  const statusText = status.map(
    ({
      levelUp,
      skillPoints,
      statPoints,
    }, index) => {
      if (levelUp >= 1) {
        return i18n.get(
          'leveled-up',
          locale,
          party[index].nickname ??
            // deno-lint-ignore no-non-null-assertion
            packs.aliasToArray(characters[index]!.name)[0],
          levelUp === 1 ? ' ' : ` ${levelUp}x `,
          statPoints,
          i18n.get('stat-points').toLowerCase(),
          skillPoints,
          i18n.get(skillPoints === 1 ? 'skill-point' : 'skill-points')
            .toLowerCase(),
        );
      } else {
        return undefined;
      }
    },
  ).filter(Boolean).join('\n');

  let retires = 0;

  while (retires < 5) {
    const update = await op.commit();

    if (update.ok) {
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

      return;
    }

    retires += 1;
  }
}

const tower = {
  view,
  sweep,
  onFail,
  onSuccess,
  getEnemyCharacter,
  getEnemyStats,
};

export default tower;
