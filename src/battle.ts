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

const getStats = (char: Schema.Character): CharacterLive => {
  return {
    agility: char.combat?.stats?.agility ?? 0,
    strength: char.combat?.stats?.strength ?? 0,
    stamina: char.combat?.stats?.stamina ?? 100,
    hp: char.combat?.stats?.stamina ?? 100,
  };
};

const getEmbed = (message: discord.Message, {
  user,
  character,
  percent,
}: {
  user: string;
  character: Character | DisaggregatedCharacter;
  percent: number;
}) => {
  const uuid = crypto.randomUUID();

  const embed = new discord.Embed()
    .setThumbnail({ url: character.images?.[0]?.url })
    .setImage({ url: `attachment://${uuid}.png` })
    .setDescription(
      `${user}\n## ${packs.aliasToArray(character.name)[0]}`,
    );

  message.addAttachment({
    type: 'image/png',
    arrayBuffer: dynImages.probability(percent).buffer,
    filename: `${uuid}.png`,
  });

  message.addEmbed(embed);
};

function attack(char: CharacterLive, target: CharacterLive): void {
  // dodge chance
  if (Math.random() > target.agility / 100) {
    const damage = char.strength;
    target.hp -= damage;
  } else {
    // missed
  }
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

      const setup = [getStats(party1[0]), getStats(party2[0])];

      const [userStats, targetStats] = setup;

      let initiative = 0;

      while (true) {
        const message = new discord.Message();

        getEmbed(message, {
          percent: (userStats.hp / userStats.stamina) * 100,
          // deno-lint-ignore no-non-null-assertion
          user: user.display_name!,
          character: userCharacter,
        });

        getEmbed(message, {
          percent: (targetStats.hp / targetStats.stamina) * 100,
          // deno-lint-ignore no-non-null-assertion
          user: target.display_name!,
          character: targetCharacter,
        });

        if (userStats.hp <= 0) {
          message.addEmbed(
            new discord.Embed()
              .setTitle(`${target.display_name} Wins`),
          );
        } else if (targetStats.hp <= 0) {
          message.addEmbed(
            new discord.Embed()
              .setTitle(`${user.display_name} Wins`),
          );
        }

        await message.patch(token);

        if (userStats.hp <= 0 || targetStats.hp <= 0) {
          break;
        }

        await utils.sleep(1);

        initiative = initiative === 0 ? 1 : 0;

        if (initiative === 0) {
          attack(userStats, targetStats);
        } else {
          attack(targetStats, userStats);
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

const battle = {
  v2,
};

export default battle;
