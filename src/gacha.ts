import utils, { ImageSize } from '~/src/utils.ts';

import config from '~/src/config.ts';

import i18n from '~/src/i18n.ts';

import user from '~/src/user.ts';
import search from '~/src/search.ts';

import packs from '~/src/packs.ts';

import * as discord from '~/src/discord.ts';

import Rating from '~/src/rating.ts';

import { NonFetalError, NoPullsError, PoolError } from '~/src/errors.ts';

import db from '~/db/index.ts';
import prisma from '~/prisma/index.ts';

import { CHARACTER_ROLE, type Prisma } from '@prisma/client';

type PackCharacter = Prisma.PackCharacterGetPayload<{
  select: {
    gender: true;
    age: true;
    rating: true;
    id: true;
    image: true;
    name: true;
    media: {
      select: {
        role: true;
        media: {
          select: {
            id: true;
            title: true;
            image: true;
          };
        };
      };
    };
  };
}>;

type PackMedia = Prisma.PackMediaGetPayload<{
  select: {
    id: true;
    title: true;
    image: true;
  };
}>;

type Variables = {
  liked: { [chance: number]: boolean };
  rating: { [chance: number]: number };
};

export type Pull = {
  character: PackCharacter;
  media: PackMedia;
};

const variables: Variables = {
  liked: { 3: true, 97: false },
  rating: {
    50: 1,
    30: 2,
    15: 3,
    4: 4,
    1: 5,
  },
};

async function likedPool({
  userId,
  guildId,
}: {
  userId: string;
  guildId: string;
}): Promise<PackCharacter[]> {
  const likes = await prisma.like.findMany({
    relationLoadStrategy: 'query',
    include: {
      character: {
        include: {
          externalLinks: true,
          media: {
            include: {
              media: {
                include: {
                  media: true,
                },
              },
            },
          },
        },
      },
    },
    take: 5_000,
    where: {
      user: { id: userId },
      character: {
        pack: {
          installs: {
            some: {
              guildId,
            },
          },
        },
      },
    },
  });

  return likes.map((like) => like.character).filter(utils.nonNullable);
}

async function rngPool({
  guildId,
}: {
  guildId: string;
}): Promise<PackCharacter[]> {
  const variables: Variables = gacha.variables;

  const { value: rating } = utils.rng(variables.rating);

  return guaranteedPool({ guildId, guarantee: rating });
}

export async function guaranteedPool({
  guildId,
  guarantee,
}: {
  guildId: string;
  guarantee: number;
}): Promise<PackCharacter[]> {
  const pool = await prisma.packCharacter.findMany({
    relationLoadStrategy: 'query',
    select: {
      name: true,
      gender: true,
      age: true,
      rating: true,
      id: true,
      image: true,
      media: {
        take: 1,
        select: {
          role: true,
          media: {
            select: {
              id: true,
              title: true,
              image: true,
            },
          },
        },
      },
    },
    take: 5_000,
    where: {
      pack: {
        installs: {
          some: {
            guildId,
          },
        },
      },
      rating: {
        equals: guarantee,
      },
    },
  });

  return pool;
}

async function rngPull({
  guildId,
  userId,
  guarantee,
  sacrifices,
}: {
  guildId: string;
  userId?: string;
  guarantee?: number;
  sacrifices?: string[];
}): Promise<Pull> {
  console.log('pull', guildId, userId, guarantee);

  // let pool =
  //   typeof guarantee === 'number'
  //     ? await gacha.guaranteedPool({ guildId, guarantee })
  //     : utils.rng(variables.liked).value && userId
  //       ? await gacha.likedPool({ guildId, userId })
  //       : await gacha.rngPool({ guildId });

  const pool =
    typeof guarantee === 'number'
      ? await gacha.guaranteedPool({ guildId, guarantee })
      : await gacha.rngPool({ guildId });

  console.log('pool', pool.length);

  const [guild, existing] = await Promise.all([
    await db.getGuild(guildId),
    await db.findGuildCharacters(guildId),
  ]);

  const exists: Record<string, string[]> = {};

  existing.forEach(({ characterId, userId }) => {
    exists[characterId] ??= [];
    exists[characterId].push(userId);
  });

  // let rating: Rating | undefined = undefined;
  let character: PackCharacter | undefined = undefined;
  let media: PackMedia | undefined = undefined;

  const controller = new AbortController();

  const { signal } = controller;

  const timeoutId = setTimeout(() => controller.abort(), 1 * 60 * 1000);

  if (!pool.length) {
    throw new PoolError();
  }

  // const poolKeys = Array.from(pool.keys());

  const removeFromPool = (i: number) => {
    pool.splice(i, 1);
  };

  try {
    while (!signal.aborted) {
      // pool is empty
      if (!pool.length) break;

      const rngIndex = Math.floor(Math.random() * pool.length);

      const selectedCharacter = pool[rngIndex];

      // character undefined
      if (!selectedCharacter) {
        removeFromPool(rngIndex);
        continue;
      }

      // media undefined
      if (!selectedCharacter.media?.[0]?.media) {
        removeFromPool(rngIndex);
        continue;
      }

      // character or its media are disabled
      if (
        packs.isDisabled(`${selectedCharacter.id}`, guildId) ||
        packs.isDisabled(`${selectedCharacter.media[0].media?.id}`, guildId)
      ) {
        removeFromPool(rngIndex);
        continue;
      }

      // same user dupe
      if (userId && exists[selectedCharacter.id].includes(userId)) {
        removeFromPool(rngIndex);
        continue;
      }

      // dupes disallowed and character already exists
      if (
        userId &&
        !guild.options?.dupes &&
        Array.isArray(exists[selectedCharacter.id])
      ) {
        removeFromPool(rngIndex);
        continue;
      }

      character = selectedCharacter;
      media = selectedCharacter.media[0].media;

      // add character to user's inventory
      if (userId) {
        await db.addCharacter({
          characterId: character.id,
          guildId,
          userId,
          mediaId: media.id,
          guaranteed: typeof guarantee === 'number',
          rating: character.rating,
          sacrifices,
        });
      }

      break;
    }
  } finally {
    clearTimeout(timeoutId);
  }

  if (!character || !media) {
    throw new PoolError();
  }

  return { character, media };
}

async function pullAnimation({
  token,
  userId,
  guildId,
  quiet,
  mention,
  components,
  pull,
}: {
  token: string;
  pull: Pull;
  userId?: string;
  guildId?: string;
  quiet?: boolean;
  mention?: boolean;
  components?: boolean;
}): Promise<void> {
  components ??= true;

  const characterId = pull.character.id;

  const mediaIds = [
    pull.media.id,
    ...(pull.character.media?.map(({ media }) => media?.id) ?? []),
  ].filter(utils.nonNullable);

  const embed = new discord.Embed().setTitle(utils.wrap(pull.media.title));

  const mediaImageAttachment = await embed.setImageWithProxy({
    size: ImageSize.Medium,
    url: pull.media.image || undefined,
  });

  let message = new discord.Message()
    .addEmbed(embed)
    .addAttachment(mediaImageAttachment);

  if (mention && userId) {
    message.setContent(`<@${userId}>`).setPing();
  }

  // animate pull by shown media
  // then showing the star rating
  if (!quiet) {
    await message.patch(token);

    await utils.sleep(4);

    const embed = new discord.Embed();

    embed.setImageUrl(`${config.origin}/stars/${pull.character.rating}.gif`);

    message = new discord.Message().addEmbed(embed);

    if (mention && userId) {
      message.setContent(`<@${userId}>`).setPing();
    }

    await message.patch(token);

    await utils.sleep(pull.character.rating + 3);
  }
  //

  message = await search.characterMessage(pull.character as never, {
    relations: false,
    rating: new Rating({ stars: pull.character.rating }),
    description: false,
    externalLinks: false,
    footer: false,
    media: { title: pull.media.title },
  });

  if (components && userId) {
    const component = new discord.Component()
      .setId(quiet ? 'q' : 'gacha', userId)
      .setLabel(`/${quiet ? 'q' : 'gacha'}`);

    message.addComponents([component]);
  }

  message.addComponents(
    [
      new discord.Component()
        .setLabel('/character')
        .setId(`character`, characterId, '1'),
      new discord.Component().setLabel('/like').setId(`like`, characterId),
    ].filter(utils.nonNullable)
  );

  if (mention && userId) {
    message.setContent(`<@${userId}>`).setPing();
  }

  await message.patch(token);

  const background = pull.character.media[0].role === CHARACTER_ROLE.BACKGROUND;

  if (guildId && userId && !background) {
    const pings = new Set<string>();

    const users = await db.getActiveUsersIfLiked(
      guildId,
      characterId,
      mediaIds
    );

    const existing = await db.findCharacter(guildId, characterId);
    const exists = existing.map((char) => char.userId);

    users.forEach((userId) => {
      if (!exists.includes(userId)) pings.add(`<@${userId}>`);
    });

    if (pings.size > 0) {
      const message = new discord.Message();

      const embed = await search.characterEmbed(
        message,
        pull.character as never,
        {
          userId,
          mode: 'thumbnail',
          description: false,
          footer: true,
          media: { title: pull.media.title },
          overwrite: { userId, rating: pull.character.rating },
        }
      );

      await message
        .addEmbed(embed)
        .setContent(Array.from(pings).join(' '))
        .followup(token);
    }
  }
}

/**
 * start the pull's animation
 */
function start({
  token,
  guildId,
  userId,
  guarantee,
  mention,
  quiet,
}: {
  token: string;
  guildId: string;
  userId?: string;
  guarantee?: number;
  mention?: boolean;
  quiet?: boolean;
}): discord.Message {
  const locale = userId
    ? (user.cachedUsers[userId]?.locale ?? user.cachedGuilds[guildId]?.locale)
    : user.cachedGuilds[guildId]?.locale;

  if (!config.gacha) {
    throw new NonFetalError(i18n.get('maintenance-gacha', locale));
  }

  config.ctx!.waitUntil(
    gacha
      .rngPull({ userId, guildId, guarantee })
      .then((pull) => {
        return pullAnimation({ token, userId, guildId, mention, quiet, pull });
      })
      .catch(async (err) => {
        if (err instanceof NoPullsError) {
          return await new discord.Message()
            .addEmbed(
              new discord.Embed().setDescription(
                i18n.get('gacha-no-more-pulls', locale)
              )
            )
            .addEmbed(
              new discord.Embed().setDescription(
                i18n.get('+1-pull', locale, `<t:${err.rechargeTimestamp}:R>`)
              )
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
                  `${guarantee}${discord.emotes.smolStar}`
                )
              )
            )
            .addComponents([
              new discord.Component()

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
                      `${guarantee}${discord.emotes.smolStar}`
                    )
                  : i18n.get('gacha-no-more-in-range', locale)
              )
            )
            .patch(token);
        }

        if (!config.sentry) {
          throw err;
        }

        const refId = utils.captureException(err);

        await discord.Message.internal(refId).patch(token);
      })
  );

  const loading = discord.Message.spinner();

  if (mention) {
    loading.setContent(`<@${userId}>`).setPing();
  }

  return loading;
}

const gacha = {
  variables,
  rngPull,
  pullAnimation,
  guaranteedPool,
  likedPool,
  rngPool,
  start,
};

export default gacha;
