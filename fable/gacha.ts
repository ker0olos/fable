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

export async function roll() {
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

  // console.log(`pool length: ${pool.length}`);
  // console.log(`pool variables: ${JSON.stringify(variables)}`);

  // const titles = [
  //   pull.media.title.english,
  //   pull.media.title.romaji,
  //   pull.media.title.native,
  // ].filter(Boolean);

  // console.log(
  //   `${pulled.character.name.full} - ${stars}* - ${titles.shift()}(${pulled.media.popularity}) - ${
  //     capitalize(pulled.role)
  //   }`,
  // );

  // return message.json();

  return pull;
}

export function start() {
  const message = new discord.Message()
    .addEmbed(
      new discord.Embed()
        .setColor(colors.gold)
        .setImage(
          'https://i.imgur.com/E2imRSx.gif',
        ),
    );

  // TODO

  return message;
}

// export function testPatch(token: string) {
//   setTimeout(async () => {
//     const message = new discord.Message().setContent('Updated After 1500ms');
//     await message.patch(token);
//   }, 1500);
// }

// await roll('');

// for (let i = 0; i < 20; i++) {
//   console.log(rng({
//     10: anilist.CHARACTER_ROLE.MAIN,
//     65: anilist.CHARACTER_ROLE.SUPPORTING,
//     25: anilist.CHARACTER_ROLE.BACKGROUND,
//   }));
// }
