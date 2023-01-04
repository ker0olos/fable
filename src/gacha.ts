import {
  captureException,
} from 'https://raw.githubusercontent.com/timfish/sentry-deno/fb3c482d4e7ad6c4cf4e7ec657be28768f0e729f/src/mod.ts';

import { rng, sleep, titlesToArray, wrap } from './utils.ts';

import { Rating } from './ratings.ts';

import { DEV } from './config.ts';

import { Character, CharacterRole, Media } from './types.ts';

import * as discord from './discord.ts';

import * as anilist from '../repos/anilist/index.ts';

const URL = 'https://raw.githubusercontent.com/ker0olos/fable/main/assets';

export const variables = {
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
    1: [400_000, undefined], // 1% for 400K -> inf
  },
};

type Roll = {
  role: CharacterRole;
  character: Character;
  media: Media;
  pool: number;
  popularityGreater: number;
  popularityLesser?: number;
};

async function roll({ id }: { id?: string }): Promise<Roll> {
  // force a fake pull (dev only command)
  if (id) {
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

  // TODO unit test all poll calcs
  // more importantly the code that invalids higher polls than active RNG
  //  and the code that returns the first media

  const range = rng(variables.ranges);

  // ignore roles on low popularity pools
  const role = range[0]! === 0 ? undefined : rng(variables.roles);

  const dict = await anilist.pool({
    role,
    popularity_greater: range[0]!,
    popularity_lesser: range[1],
  });

  // TODO extend/override anilist default pool
  // order of override is
  // community (verified) > manual (non-verified)

  const pool = Object.values(dict);

  let character: Character | undefined = undefined;
  let media: Media | undefined = undefined;

  while (!character) {
    // sort through each character media and pick the default
    const candidate = pool[Math.floor(Math.random() * pool.length)];

    const invalid = candidate.media?.edges?.some(({ characterRole, node }) => {
      if (node.popularity! < range[0]!) {
        return true;
      }

      if (range[1] && node.popularity! > range[1]) {
        return true;
      }

      if (role && role !== characterRole) {
        return true;
      }

      if (!media || media.popularity! <= node.popularity!) {
        media = node;
      }
    });

    if (!invalid) {
      character = candidate;
    } else {
      console.log('invalid', candidate.name.full);
    }
  }

  // console.log(
  //   `pool length: ${pool.length}\npool variables: ${
  //     JSON.stringify({ role, range })
  //   }`,
  // );

  return {
    role: role!,
    media: media!,
    character: character!,
    pool: pool.length,
    popularityGreater: range[0]!,
    popularityLesser: range[1],
  };
}

/** start the roll's animation */
export function start({ token, id }: { token: string; id?: string }) {
  const message = new discord.Message()
    .addEmbed(
      new discord.Embed().setImage(
        { url: `${URL}/spinner.gif` },
      ),
    );

  roll({ id })
    .then(async (pull) => {
      const media = pull.media;
      const role = pull.role;

      const titles = titlesToArray(media);

      const rating = new Rating(role, media.popularity!);

      let message = new discord.Message()
        .addEmbed(
          new discord.Embed()
            .setTitle(wrap(titles[0]!))
            .setImage({ url: media.coverImage?.large }),
        );

      await message.patch(token);

      await sleep(4);

      message = new discord.Message()
        .addEmbed(
          new discord.Embed()
            .setImage({ url: `${URL}/${rating.stars}stars.gif` }),
        );

      await message.patch(token);

      await sleep(rating.stars >= 5 ? 7 : 5);

      message = new discord.Message()
        .addEmbed(
          new discord.Embed()
            .setTitle(rating.emotes)
            .addField({
              name: wrap(titles[0]!),
              value: `**${wrap(pull.character.name.full)}**`,
            })
            .setImage({ url: pull.character.image?.large }),
        );

      if (DEV) {
        message.addEmbed(
          new discord.Embed()
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
            }),
        );
      }

      await message.patch(token);
    }).catch(async (err) => {
      if (err?.response?.status === 404 || err?.message === '404') {
        return await new discord.Message().setContent(
          'Found _nothing_ matching that query!',
        ).patch(token);
      }

      const refId = captureException(err);

      await discord.Message.internal(refId).patch(token);
    });

  return message;
}
