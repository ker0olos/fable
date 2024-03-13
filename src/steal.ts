import config from '~/src/config.ts';

import packs from '~/src/packs.ts';

import { default as srch } from '~/src/search.ts';

import i18n from '~/src/i18n.ts';
import utils from '~/src/utils.ts';

import user from '~/src/user.ts';

import db from '~/db/mod.ts';

import * as discord from '~/src/discord.ts';

import { Character, DisaggregatedCharacter } from '~/src/types.ts';

import { NonFetalError } from '~/src/errors.ts';

import type * as Schema from '~/db/schema.ts';

export const PARTY_PROTECTION_PERIOD = 4;

function getInactiveDays(inventory?: Partial<Schema.Inventory>): number {
  const lastPull = inventory?.lastPull
    ? new Date(inventory.lastPull)
    : undefined;

  return !lastPull
    ? Number.MAX_SAFE_INTEGER
    : utils.diffInDays(new Date(), lastPull);
}

function getChances(character: Schema.Character, inactiveDays: number): number {
  let chance = 0;

  switch (character.rating) {
    case 5:
      chance = 1;
      break;
    case 4:
      chance = 3;
      break;
    case 3:
      chance = 15;
      break;
    case 2:
      chance = 25;
      break;
    case 1:
      chance = 50;
      break;
    default:
      break;
  }

  if (inactiveDays > 30) {
    chance += 90;
  } else if (inactiveDays >= 14) {
    chance += 50;
  } else if (inactiveDays >= 7) {
    chance += 25;
  }

  return Math.min(chance, 90);
}

function pre({ token, userId, guildId, search, id }: {
  token: string;
  userId: string;
  guildId: string;
  search?: string;
  id?: string;
}): discord.Message {
  const locale = user.cachedUsers[userId]?.locale ??
    user.cachedGuilds[guildId]?.locale;

  if (!config.stealing) {
    throw new NonFetalError(
      i18n.get('maintenance-steal', locale),
    );
  }

  packs
    .characters(id ? { ids: [id], guildId } : { search, guildId })
    .then(async (results: (Character | DisaggregatedCharacter)[]) => {
      if (
        !results.length ||
        packs.isDisabled(`${results[0].packId}:${results[0].id}`, guildId)
      ) {
        throw new Error('404');
      }

      const guild = await db.getGuild(guildId);
      const instance = await db.getInstance(guild);

      const user = await db.getUser(userId);

      const { inventory } = await db.getInventory(instance, user);

      const cooldown = new Date(inventory.stealTimestamp ?? new Date())
        .getTime();

      if (cooldown > Date.now()) {
        throw new NonFetalError(
          i18n.get(
            'steal-cooldown',
            locale,
            `<t:${Math.floor(cooldown / 1000).toString()}:R>`,
          ),
        );
      }

      return Promise.all([
        packs.aggregate<Character>({
          guildId,
          character: results[0],
          end: 1,
        }),
        db.findCharacters(
          instance,
          [`${results[0].packId}:${results[0].id}`],
        ),
      ]);
    })
    .then(async ([character, results]) => {
      const message = new discord.Message();

      const characterId = `${character.packId}:${character.id}`;

      const characterName = packs.aliasToArray(character.name)[0];

      const media = character.media?.edges?.[0]?.node;

      const existing = results[0];

      if (
        (
          existing?.[0] &&
          packs.isDisabled(existing[0].mediaId, guildId)
        ) ||
        (
          media &&
          packs.isDisabled(`${media.packId}:${media.id}`, guildId)
        )
      ) {
        throw new Error('404');
      }

      if (!existing || !existing[0] || !existing[1]) {
        message.addEmbed(
          new discord.Embed().setDescription(
            i18n.get('character-hasnt-been-found', locale, characterName),
          ),
        );

        message.addEmbed(srch.characterEmbed(character, {
          footer: false,
          mode: 'thumbnail',
          description: false,
          media: { title: true },
        }));

        return message.patch(token);
      }

      if (existing[1]?.id === userId) {
        throw new NonFetalError(i18n.get('stealing-from-yourself', locale));
      }

      const targetInventory = await db.getValue<Schema.Inventory>([
        'inventories',
        existing[0].inventory,
      ]);

      if (!targetInventory) {
        throw new Error('');
      }

      const targetParty = await db.getUserParty(targetInventory);

      const party = [
        targetParty?.member1?.id,
        targetParty?.member2?.id,
        targetParty?.member3?.id,
        targetParty?.member4?.id,
        targetParty?.member5?.id,
      ];

      const inactiveDays = getInactiveDays(targetInventory);

      if (party.includes(characterId)) {
        if (inactiveDays <= PARTY_PROTECTION_PERIOD) {
          message.addEmbed(
            new discord.Embed().setDescription(
              i18n.get(
                'stealing-party-member',
                locale,
                `<@${existing[1].id}>`,
                characterName,
              ),
            ),
          );

          message.addEmbed(srch.characterEmbed(character, {
            footer: true,
            mode: 'thumbnail',
            description: false,
            media: { title: true },
            existing: { rating: existing[0].rating },
          }));

          return message.patch(token);
        }
      }

      message.addEmbed(
        srch.characterEmbed(character, {
          footer: true,
          rating: false,
          mode: 'thumbnail',
          description: false,
          media: { title: true },
          existing: {
            mediaId: existing[0].mediaId,
          },
        })
          .setDescription(`<@${existing[1].id}>`),
      );

      const chance = getChances(existing[0], inactiveDays);

      message.addEmbed(
        new discord.Embed().setDescription(
          i18n.get('steal-chance', locale, chance.toFixed(2)),
        ),
      );

      return discord.Message.dialog({
        userId,
        message,
        confirmText: i18n.get('attempt', locale),
        confirm: [
          'steal',
          userId,
          characterId,
          `${chance}`,
        ],
      }).patch(token);
    })
    .catch(async (err) => {
      if (err.message === '404') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('found-nothing', locale),
            ),
          ).patch(token);
      }

      if (err instanceof NonFetalError) {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed()
              .setDescription(err.message),
          )
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

function attempt({
  token,
  userId,
  guildId,
  characterId,
  pre,
}: {
  token: string;
  userId: string;
  guildId: string;
  characterId: string;
  pre: number;
}): discord.Message {
  const locale = user.cachedUsers[userId]?.locale ??
    user.cachedGuilds[guildId]?.locale;

  packs.characters({ ids: [characterId], guildId })
    .then(async (results) => {
      const message = new discord.Message();

      const character = await packs.aggregate<Character>({
        guildId,
        character: results[0],
        end: 1,
      });

      const characterName = packs.aliasToArray(character.name)[0];

      const guild = await db.getGuild(guildId);
      const instance = await db.getInstance(guild);

      const user = await db.getUser(userId);

      const { inventory, inventoryCheck } = await db.getInventory(
        instance,
        user,
      );

      const cooldown = new Date(inventory.stealTimestamp ?? new Date())
        .getTime();

      if (cooldown > Date.now()) {
        throw new NonFetalError(
          i18n.get(
            'steal-cooldown',
            locale,
            `<t:${Math.floor(cooldown / 1000).toString()}:R>`,
          ),
        );
      }

      const existing = (await db.findCharacters(
        instance,
        [`${results[0].packId}:${results[0].id}`],
      ))?.[0];

      if (!existing || !existing[0] || !existing[1]) {
        message.addEmbed(
          new discord.Embed().setDescription(
            i18n.get('character-hasnt-been-found', locale, characterName),
          ),
        );

        return message.patch(token);
      }

      const targetInventory = await db.getValue<Schema.Inventory>([
        'inventories',
        existing[0].inventory,
      ]);

      if (!targetInventory) {
        throw new Error('');
      }

      const inactiveDays = getInactiveDays(targetInventory);

      const chance = getChances(existing[0], inactiveDays);

      if (pre > chance) {
        throw new NonFetalError(
          i18n.get('steal-unexpected', locale, characterName),
        );
      }

      const success = utils.getRandomFloat() <= (chance / 100);

      // delay to build up anticipation
      await utils.sleep(6);

      // failed
      if (!success) {
        const { stealTimestamp } = await db.failSteal(
          inventory,
          inventoryCheck,
        );

        message
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('you-failed', locale),
            ),
          )
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get(
                'steal-try-again',
                locale,
                `<t:${utils.stealTimestamp(stealTimestamp)}:R>`,
              ),
            ),
          );

        return message.patch(token);
      }

      try {
        const _ = await db.stealCharacter({
          aInventoryCheck: inventoryCheck,
          aInventory: inventory,
          aUser: user,
          characterId,
          instance,
          bInventoryId: existing[0].inventory,
        });

        message.addEmbed(
          new discord.Embed().setDescription(
            i18n.get('you-succeeded', locale),
          ),
        );

        message.addEmbed(
          srch.characterEmbed(character, {
            footer: false,
            mode: 'thumbnail',
            description: false,
            media: { title: true },
            existing: {
              rating: existing[0].rating,
              mediaId: existing[0].mediaId,
            },
          }).addField({
            value: `${discord.emotes.add}`,
          }),
        );

        message.addComponents([
          new discord.Component()
            .setLabel('/character')
            .setId(`character`, characterId, '1'),
          new discord.Component()
            .setLabel('/like')
            .setId(`like`, characterId),
        ]);

        message.patch(token);

        return new discord.Message()
          .setContent(`<@${existing?.[1]?.id}>`)
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get('stolen-from-you', locale, characterName),
            ),
          )
          .addEmbed(
            srch.characterEmbed(character, {
              footer: false,
              mode: 'thumbnail',
              description: false,
              media: { title: true },
              existing: {
                rating: existing?.[0]?.rating,
                mediaId: existing?.[0]?.mediaId,
              },
            }).addField({
              value: `${discord.emotes.remove}`,
            }),
          )
          .addComponents([
            new discord.Component()
              .setLabel('/character')
              .setId(`character`, characterId, '1'),
          ])
          .followup(token);
      } catch (err) {
        switch (err.message) {
          case 'CHARACTER_NOT_FOUND':
            throw new NonFetalError(
              i18n.get('character-hasnt-been-found', locale, characterName),
            );
          case 'CHARACTER_NOT_OWNED':
            throw new NonFetalError(
              i18n.get(
                'character-not-owned-by-you',
                locale,
                characterName,
              ),
            );
          default:
            throw err;
        }
      }
    })
    .catch(async (err) => {
      if (err instanceof NonFetalError) {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed()
              .setDescription(err.message),
          )
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
        { url: `${config.origin}/assets/steal.gif` },
      ),
    );

  return loading;
}

const steal = {
  pre,
  attempt,
  getChances,
  getInactiveDays,
};

export default steal;
