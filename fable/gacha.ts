// import * as imagescript from 'https://deno.land/x/imagescript@1.2.15/mod.ts';

import { shuffle } from '../utils.ts';

import * as discord from '../discord.ts';

import * as anilist from './api.ts';

const colors = {
  background: '#2b2d42',
  purple: '#6b3ebd',
  gold: '#feb500',
  yellow: '#fed33c',
};

function rng<T>(dict: { [chance: number]: T }): T {
  const pool = Object.values(dict);
  const chances = Object.keys(dict).map((n) => parseInt(n));

  const sum = chances.reduce((a, b) => a + b);

  if (sum !== 100) {
    throw new Error(`Sum of ${chances} is ${sum} when it should be 100`);
  }

  let _ = [];

  for (let i = 0; i < chances.length; i++) {
    // if chance is 5 - add 5 items to the array
    // if chance is 90 - add 90 items to the array
    for (let y = 0; y < chances[i]; y++) {
      // push the index of the item not it's value
      _.push(i);
    }
  }

  // shuffle the generated chances array
  // which is the RNG part of this function
  _ = shuffle(_);

  // use the first item from the shuffled array on the pool
  return pool[_[0]];
}

async function roll() {
  const variables = {
    role: rng({
      10: anilist.CHARACTER_ROLE.MAIN, // 10% for Main
      70: anilist.CHARACTER_ROLE.SUPPORTING, // 65% for Supporting
      20: anilist.CHARACTER_ROLE.BACKGROUND, // 25% for Background
    }),
    range: rng({
      6: [0, 50_000], // 6% for 0 -> 50K
      50: [50_000, 100_000], // 50% for 50K -> 100K
      40: [100_000, 200_000], // 40% for 100K -> 200K
      3: [200_000, 400_000], // 3% for 200K -> 400K
      1: [400_000, undefined], // 1% for 400K -> ...
    }),
  };

  // NOTE this is a workaround an edge case
  // most media in that range only include information about main characters
  // which cases the pool to return empty
  if (variables.range[0]! === 0) {
    variables.role = anilist.CHARACTER_ROLE.MAIN;
  }

  const pool = await anilist.pool({
    role: variables.role,
    popularity_greater: variables.range[0]!,
    popularity_lesser: variables.range[1],
  });

  if (!pool?.length) {
    throw new Error(
      `failed to create a pool with ${JSON.stringify(variables)}`,
    );
  }

  const pull = pool[Math.floor(Math.random() * pool.length)];

  console.log(
    `pool length: ${pool.length}\npool variables: ${JSON.stringify(variables)}`,
  );

  return pull;
}

export function start(token: string) {
  const message = new discord.Message()
    .addEmbed(
      new discord.Embed()
        .setColor(colors.gold)
        .setImage(
          'https://i.imgur.com/E2imRSx.gif',
        ),
    );

  roll().then((pull) => {
    const titles = anilist.titles(pull.media);

    const message = new discord.Message()
      .addEmbed(
        new discord.Embed()
          .setTitle(titles.shift()!)
          .setColor(pull.media.coverImage?.color)
          .setImage(
            pull.media.coverImage?.large,
          ),
      )
      .addEmbed(
        new discord.Embed()
          .setAuthor('Debugging (Will be removed)')
          .setTitle(pull.character.name.full)
          .setFooter(`${pull.rating}* -> ${pull.role}`)
          .setColor(pull.media.coverImage?.color)
          .setThumbnail(
            pull.character.image?.large,
          ),
      );

    return message.patch(token);
  });

  return message;
}
