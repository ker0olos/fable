import { rng, sleep, titlesToArray } from './utils.ts';

import { CharacterRole } from './repo.interface.ts';

import * as discord from './discord.ts';

import * as anilist from '../repos/anilist/index.ts';

const URL = 'https://raw.githubusercontent.com/ker0olos/fable/main/assets';

// const colors = {
//   background: '#2b2d42',
//   purple: '#6b3ebd',
//   gold: '#feb500',
//   yellow: '#fed33c',
// };

const emotes = {
  star: '<:fable_star:1058059570305585303>',
  noStar: '<:fable_no_star:1058182412963688548>',
};

export const variables = {
  roles: {
    10: CharacterRole.MAIN, // 10% for Main
    70: CharacterRole.SUPPORTING, // 65% for Supporting
    20: CharacterRole.BACKGROUND, // 25% for Background
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

async function roll() {
  let role = rng(variables.roles);

  const range = rng(variables.ranges);

  // NOTE this is a workaround an edge case
  // most media in that range only include information about main characters
  // which cases the pool to return empty
  if (range[0]! === 0) {
    role = CharacterRole.MAIN;
  }

  const pool = await anilist.pool({
    role,
    popularity_greater: range[0]!,
    popularity_lesser: range[1],
  });

  // TODO allow custom repos

  const pull = pool[Math.floor(Math.random() * pool.length)];

  console.log(
    `pool length: ${pool.length}\npool variables: ${
      JSON.stringify({ role, range })
    }`,
  );

  return pull;
}

/** start the roll's animation */
export function start({ token }: { token: string }) {
  const message = new discord.Message()
    .addEmbed(
      new discord.Embed('image').setImage(
        `${URL}/spinner.gif`,
      ),
    );

  roll().then(async (pull) => {
    const media = pull.media!.edges![0].node;
    const role = pull.media!.edges![0].characterRole;

    const titles = titlesToArray(media);

    const rating = rate(role, media.popularity!);

    let message = new discord.Message()
      .addEmbed(
        new discord.Embed()
          .setTitle(titles[0]!)
          .setImage(
            media.coverImage?.large,
          ),
      );

    await message.patch(token);

    await sleep(4);

    message = new discord.Message()
      .addEmbed(
        new discord.Embed('image')
          .setImage(
            `${URL}/${rating}stars.gif`,
          ),
      );

    await message.patch(token);

    await sleep(5);

    message = new discord.Message()
      .addEmbed(
        new discord.Embed()
          .setTitle(pull.name.full)
          .setDescription(
            `${emotes.star.repeat(rating)}${emotes.noStar.repeat(5 - rating)}`,
          )
          .setImage(
            pull.image?.large,
          ),
      );

    await message.patch(token);
  });

  return message;
}

function rate(role: CharacterRole, popularity: number) {
  if (role === CharacterRole.BACKGROUND || popularity < 50_000) {
    return 1;
  }

  if (popularity < 200_000) {
    if (role === CharacterRole.MAIN) {
      return 3;
    }

    return 2;
  }

  if (popularity < 400_000) {
    if (role === CharacterRole.MAIN) {
      return 4;
    }

    return 3;
  }

  if (popularity > 400_000) {
    if (role === CharacterRole.MAIN) {
      return 5;
    }

    return 4;
  }

  throw new Error(
    `Couldn't determine the star rating for { role: "${role}", popularity: ${popularity} }`,
  );
}
