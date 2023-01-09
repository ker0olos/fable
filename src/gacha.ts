import {
  captureException,
} from 'https://raw.githubusercontent.com/timfish/sentry-deno/fb3c482d4e7ad6c4cf4e7ec657be28768f0e729f/src/mod.ts';

import utils from './utils.ts';

import Rating from './rating.ts';

import config from './config.ts';

import { Character, CharacterRole, Media } from './types.ts';

import anilist from '../packs/anilist/index.ts';

import * as discord from './discord.ts';

const CDN = 'https://raw.githubusercontent.com/ker0olos/fable/main/assets';

const variables = {
  roles: {
    10: CharacterRole.MAIN, // 10% for Main
    70: CharacterRole.SUPPORTING, // 70% for Supporting
    20: CharacterRole.BACKGROUND, // 20% for Background
  },
  ranges: {
    // whether you get from the far end or the near end
    // of those ranges is up to total RNG
    65: [0, 50_000], // 65% for 0 -> 50K
    22: [50_000, 100_000], // 22% for 50K -> 100K
    9: [100_000, 200_000], // 9% for 100K -> 200K
    3: [200_000, 400_000], // 3% for 200K -> 400K
    1: [400_000, NaN], // 1% for 400K -> inf
  },
};

type Pull = {
  role: CharacterRole;
  character: Character;
  media: Media;
  pool: number;
  popularityGreater: number;
  popularityLesser?: number;
};

/**
 * force a specific pull using an id
 */
async function forcePull({ id }: { id: string }): Promise<Pull> {
  const character = await anilist.character({ id: parseInt(id) });

  if (!character) {
    throw new Error('404');
  }

  return {
    pool: 1,
    character,
    media: character.media!.edges![0]!.node,
    role: character.media!.edges![0]!.characterRole,
    popularityGreater: -1,
    popularityLesser: -1,
  };
}

/**
 * generate a pool of characters then pull one
 */
async function rngPull(): Promise<Pull> {
  // roll for popularity range that wil be used to generate the pool
  const range = utils.rng(variables.ranges);

  const role = range[0] === 0
    // include all roles in the pool
    ? undefined
    // one specific role for the whole pool
    : utils.rng(variables.roles);

  const dict = await anilist.pool({
    role,
    popularity_greater: range[0],
    popularity_lesser: range[1],
  });

  // TODO extend/override anilist default pool

  const pool = Object.values(dict);

  let character: Character | undefined = undefined;
  let media: Media | undefined = undefined;

  while (pool.length > 0) {
    // sort through each character media and pick the default
    const i = Math.floor(Math.random() * pool.length);

    const candidate = pool.splice(i, 1)[0];

    const edge = candidate.media?.edges?.reduce((a, b) => {
      return a.node!.popularity! >= b.node!.popularity! ? a : b;
    });

    if (
      edge?.node.popularity! >= range[0] &&
      edge?.node.popularity! <= range[1] &&
      (!role || edge?.characterRole === role)
    ) {
      character = candidate;
      media = edge?.node;
      break;
    }
  }

  if (!character || !media) {
    throw new Error(
      'failed to pull a character due to the pool not containing any characters that match the randomly chosen variables',
    );
  }

  return {
    role: role!,
    media: media!,
    character: character!,
    pool: pool.length,
    popularityGreater: range[0],
    popularityLesser: range[1],
  };
}

/**
 * start the roll's animation
 */
function start({ token, id }: { token: string; id?: string }) {
  (
    id ? forcePull({ id }) : rngPull()
  )
    .then(async (pull) => {
      const media = pull.media;
      const role = pull.role;

      const titles = utils.titlesToArray(media);

      const rating = new Rating(role, media.popularity!);

      let message = new discord.Message()
        .addEmbed(
          new discord.Embed()
            .setTitle(utils.wrap(titles[0]!))
            .setImage({ url: media.coverImage?.large }),
        );

      await message.patch(token);

      await utils.sleep(4);

      message = new discord.Message()
        .addEmbed(
          new discord.Embed()
            .setImage({ url: `${CDN}/stars/${rating.stars}.gif` }),
        );

      await message.patch(token);

      await utils.sleep(rating.stars >= 5 ? 7 : 5);

      message = new discord.Message()
        .addEmbed(
          new discord.Embed()
            .setTitle(rating.emotes)
            .addField({
              name: utils.wrap(titles[0]!),
              value: `**${utils.wrap(pull.character.name!.full)}**`,
            })
            .setImage({ url: pull.character.image?.large }),
        );

      if (config.DEV) {
        message.addEmbed(pullDebugEmbed(pull));
      }

      await message.patch(token);
    })
    .catch(async (err) => {
      if (err?.response?.status === 404 || err?.message === '404') {
        return await new discord.Message().setContent(
          'Found _nothing_ matching that query!',
        ).patch(token);
      }

      const refId = captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  return new discord.Message()
    .addEmbed(
      new discord.Embed().setImage(
        { url: `${CDN}/spinner.gif` },
      ),
    );
}

function pullDebugEmbed(pull: Pull) {
  return new discord.Embed()
    .setTitle('Pool')
    .addField({
      name: 'Role',
      value: `${pull.role}`,
    })
    .addField({
      name: 'Media',
      value: `${pull.media.id}`,
    })
    .addField({
      name: 'Length',
      value: `${pull.pool}`,
    })
    .addField({
      name: 'Popularity',
      value: `${pull.popularityGreater} < P < ${pull.popularityLesser}`,
    });
}

const gacha = {
  variables,
  forcePull,
  rngPull,
  start,
};

export default gacha;
