import '#filter-boolean';

import utils, { ImageSize } from './utils.ts';

import Rating from './rating.ts';

import config from './config.ts';

import i18n from './i18n.ts';

import user from './user.ts';
import search from './search.ts';

import db from '../db/mod.ts';

import packs from './packs.ts';

import * as discord from './discord.ts';

import * as Schema from '../db/schema.ts';

import {
  Character,
  CharacterRole,
  DisaggregatedCharacter,
  Media,
  MediaRelation,
} from './types.ts';

import { KvError, NonFetalError, NoPullsError, PoolError } from './errors.ts';

export type Pull = {
  index?: number;
  character: Character;
  media: Media;
  rating: Rating;
};

const lowest = 1000;

export const relationFilter = [
  MediaRelation.Parent,
  MediaRelation.Contains,
  MediaRelation.Prequel,
  MediaRelation.Sequel,
  // MediaRelation.SideStory,
  // MediaRelation.SpinOff,
];

const variables = {
  roles: {
    10: CharacterRole.Main, // 10% for Main
    70: CharacterRole.Supporting, // 70% for Supporting
    20: CharacterRole.Background, // 20% for Background
  },
  ranges: {
    // whether you get from the far end or the near end
    // of those ranges is random
    65: [lowest, 50_000], // 65% for 1K -> 50K
    22: [50_000, 100_000], // 22% for 50K -> 100K
    9: [100_000, 200_000], // 9% for 100K -> 200K
    3: [200_000, 400_000], // 3% for 200K -> 400K
    1: [400_000, NaN], // 1% for 400K -> inf
  },
};

async function rangePool({ guildId }: { guildId: string }): Promise<{
  pool: Awaited<ReturnType<typeof packs.pool>>;
  validate: (character: Character | DisaggregatedCharacter) => boolean;
}> {
  const { value: range } = utils.rng(
    gacha.variables.ranges,
  );

  const { value: role } = range[0] <= lowest
    // include all roles in the pool
    ? { value: undefined }
    // one specific role for the whole pool
    : utils.rng(gacha.variables.roles);

  const pool = await packs.pool({
    role,
    range,
    guildId,
  });

  const validate = (character: Character | DisaggregatedCharacter): boolean => {
    if (
      typeof character.popularity === 'number' &&
      !(character.popularity >= range[0] &&
        (isNaN(range[1]) || character.popularity <= range[1]))
    ) {
      return false;
    }

    if (
      role &&
      Array.isArray(character.media) &&
      (character.media.length <= 0 || character.media[0].role !== role)
    ) {
      return false;
    }

    // deno-lint-ignore no-non-null-assertion
    const edge = character.media && 'edges' in character.media! &&
      character.media.edges[0];

    if (edge) {
      const popularity = character.popularity || edge.node.popularity || lowest;

      if (
        !(popularity >= range[0] && (isNaN(range[1]) || popularity <= range[1]))
      ) {
        return false;
      }

      if (role && edge.role !== role) {
        return false;
      }
    }

    return true;
  };

  return {
    pool,
    validate,
  };
}

async function guaranteedPool(
  { guildId, guarantee }: { guildId: string; guarantee: number },
): Promise<{
  pool: Awaited<ReturnType<typeof packs.pool>>;
  validate: (character: Character | DisaggregatedCharacter) => boolean;
}> {
  const pool = await packs.pool({
    stars: guarantee,
    guildId,
  });

  const validate = (character: Character | DisaggregatedCharacter): boolean => {
    if (
      typeof character.popularity === 'number' &&
      new Rating({ popularity: character.popularity }).stars !== guarantee
    ) {
      return false;
    }

    // deno-lint-ignore no-non-null-assertion
    const edge = character.media && 'edges' in character.media! &&
      character.media.edges[0];

    if (edge) {
      const popularity = character.popularity || edge.node.popularity || lowest;

      if (new Rating({ popularity, role: edge.role }).stars !== guarantee) {
        return false;
      }
    }

    return true;
  };

  return {
    pool,
    validate,
  };
}

async function rngPull(
  {
    guildId,
    userId,
    guarantee,
    sacrifices,
  }: {
    guildId: string;
    userId?: string;
    guarantee?: number;
    sacrifices?: Schema.Character[];
  },
): Promise<Pull> {
  const { pool, validate } = typeof guarantee === 'number'
    ? await gacha.guaranteedPool({
      guildId,
      guarantee,
    })
    : await gacha.rangePool({
      guildId,
    });

  // let _user: Schema.User | undefined = undefined;

  // let inventory: Schema.Inventory | undefined = undefined;
  // let inventoryStamp: string | null = null;

  let rating: Rating | undefined = undefined;
  let character: Character | undefined = undefined;
  let media: Media | undefined = undefined;

  while (pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length);

    const characterId = pool.splice(i, 1)[0].id;

    if (packs.isDisabled(characterId, guildId)) {
      continue;
    }

    const results = await packs.characters({ guildId, ids: [characterId] });

    if (!results.length || !validate(results[0])) {
      continue;
    }

    // aggregate will filter out any disabled media
    const candidate = await packs.aggregate<Character>({
      guildId,
      character: results[0],
      end: 1,
    });

    const edge = candidate.media?.edges?.[0];

    if (!edge || !validate(candidate)) {
      continue;
    }

    if (packs.isDisabled(`${edge.node.packId}:${edge.node.id}`, guildId)) {
      continue;
    }

    rating = Rating.fromCharacter(candidate);

    if (rating.stars < 1) {
      continue;
    }

    // add character to user's inventory
    if (userId) {
      try {
        const response = await db.addCharacter({
          characterId,
          guildId,
          userId,
          mediaId: `${edge.node.packId}:${edge.node.id}`,
          guaranteed: typeof guarantee === 'number',
          rating: rating.stars,
          sacrifices,
        });

        if (!response?.ok) {
          continue;
        }
      } catch (err) {
        if (err instanceof KvError) {
          continue;
        }

        throw err;
      }
    }

    media = edge.node;
    character = candidate;

    break;
  }

  if (!character || !media || !rating) {
    throw new PoolError();
  }

  return {
    rating,
    character,
    media: await packs.aggregate<Media>({ media, guildId }),
  };
}

async function pullAnimation(
  { token, userId, guildId, quiet, mention, components, pull }: {
    token: string;
    pull: Pull;
    userId?: string;
    guildId?: string;
    quiet?: boolean;
    mention?: boolean;
    components?: boolean;
  },
): Promise<void> {
  components ??= true;

  const characterId = `${pull.character.packId}:${pull.character.id}`;

  const mediaIds = [
    pull.media,
    ...pull.media.relations?.edges?.filter(({ relation }) =>
      // deno-lint-ignore no-non-null-assertion
      relationFilter.includes(relation!)
    ).map(({ node }) => node) ?? [],
  ].map(({ packId, id }) => `${packId}:${id}`);

  const mediaTitles = packs.aliasToArray(pull.media.title);

  const mediaImage = pull.media.images?.[0];

  let message = new discord.Message()
    .addEmbed(
      new discord.Embed()
        .setTitle(utils.wrap(mediaTitles[0]))
        .setImage({
          size: ImageSize.Medium,
          url: mediaImage?.url,
        }),
    );

  if (mention && userId) {
    message
      .setContent(`<@${userId}>`)
      .setPing();
  }

  if (!quiet) {
    await message.patch(token);

    await utils.sleep(4);

    message = new discord.Message()
      .addEmbed(
        new discord.Embed()
          .setImage({
            url: `${config.origin}/assets/stars/${pull.rating.stars}.gif`,
          }),
      );

    if (mention && userId) {
      message
        .setContent(`<@${userId}>`)
        .setPing();
    }

    await message.patch(token);

    await utils.sleep(pull.rating.stars + 3);
  }

  message = search.characterMessage(pull.character, {
    relations: false,
    rating: pull.rating,
    description: false,
    externalLinks: false,
    footer: false,
    media: {
      title: true,
    },
  });

  if (components && userId) {
    const component = new discord.Component()
      .setId(quiet ? 'q' : 'gacha', userId)
      .setLabel(`/${quiet ? 'q' : 'gacha'}`);

    message.addComponents([
      component,
    ]);
  }

  message.addComponents([
    new discord.Component()
      .setLabel('/character')
      .setId(`character`, characterId, '1'),
    new discord.Component()
      .setLabel('/like')
      .setId(`like`, characterId),
  ]);

  if (mention && userId) {
    message
      .setContent(`<@${userId}>`)
      .setPing();
  }

  await message.patch(token);

  if (guildId && userId) {
    const pings: string[] = [];

    const guild = await db.getGuild(guildId);
    const instance = await db.getInstance(guild);

    const inventories = await db.getInstanceInventories(instance);

    const background =
      pull.character.media?.edges?.[0].role === CharacterRole.Background;

    inventories.forEach(([, user]) => {
      if (
        user.id !== userId &&
        (
          user.likes?.map(({ characterId }) => characterId).filter(Boolean)
            .includes(characterId) ||
          (
            !background &&
            user.likes?.map(({ mediaId }) => mediaId)
              .filter(Boolean)
              .some((id) => mediaIds.includes(id))
          )
        )
      ) {
        pings.push(`<@${user.id}>`);
      }
    });

    if (pings.length) {
      const embed = search.characterEmbed(pull.character, {
        userId,
        mode: 'thumbnail',
        rating: false,
        description: false,
        footer: true,
        media: { title: true },
        existing: {
          rating: pull.rating.stars,
        },
      });

      await new discord.Message()
        .addEmbed(embed)
        .setContent(pings.join(' '))
        .followup(token);
    }
  }
}

/**
 * start the pull's animation
 */
function start(
  { token, guildId, userId, guarantee, mention, quiet }: {
    token: string;
    guildId: string;
    userId?: string;
    guarantee?: number;
    mention?: boolean;
    quiet?: boolean;
  },
): discord.Message {
  const locale = userId
    ? (user.cachedUsers[userId]?.locale ??
      user.cachedGuilds[guildId]?.locale)
    : user.cachedGuilds[guildId]?.locale;

  if (!config.gacha) {
    throw new NonFetalError(
      i18n.get('maintenance-gacha', locale),
    );
  }

  gacha.rngPull({ userId, guildId, guarantee })
    .then((pull) =>
      pullAnimation({
        token,
        userId,
        guildId,
        mention,
        quiet,
        pull,
      })
    )
    .catch(async (err) => {
      if (err instanceof NoPullsError) {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed()
              .setDescription(i18n.get('gacha-no-more-pulls', locale)),
          )
          .addEmbed(
            new discord.Embed()
              .setDescription(
                i18n.get('+1-pull', locale, `<t:${err.rechargeTimestamp}:R>`),
              ),
          )
          .patch(token);
      }

      if (err?.message === '403') {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              i18n.get(
                'gacha-no-guarantees',
                locale,
                `${guarantee}${discord.emotes.smolStar}`,
              ),
            ),
          )
          .addComponents([
            new discord.Component()
              // deno-lint-ignore no-non-null-assertion
              .setId('buy', 'bguaranteed', userId!, `${guarantee}`)
              .setLabel(`/buy guaranteed ${guarantee}`),
          ])
          .patch(token);
      }

      if (err instanceof PoolError) {
        return await new discord.Message()
          .addEmbed(
            new discord.Embed().setDescription(
              typeof guarantee === 'number'
                ? i18n.get(
                  'gacha-no-more-characters-left',
                  locale,
                  `${guarantee}${discord.emotes.smolStar}`,
                )
                : i18n.get('gacha-no-more-in-range', locale),
            ),
          ).patch(token);
      }

      if (!config.sentry) {
        throw err;
      }

      const refId = utils.captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  const spinner = new discord.Message()
    .addEmbed(
      new discord.Embed().setImage(
        { url: `${config.origin}/assets/spinner.gif` },
      ),
    );

  if (mention) {
    spinner
      .setContent(`<@${userId}>`)
      .setPing();
  }

  return spinner;
}

const gacha = {
  lowest,
  variables,
  rngPull,
  pullAnimation,
  guaranteedPool,
  rangePool,
  start,
};

export default gacha;
