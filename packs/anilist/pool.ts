import { join } from 'https://deno.land/std@0.173.0/path/mod.ts';

import { gql, request } from './graphql.ts';

import utils from '../../src/utils.ts';

import gacha from '../../src/gacha.ts';

import { CharacterRole } from '../../src/types.ts';

import { AniListMedia, Pool } from './types.ts';

const filepath = './pool.json';

const dirname = new URL('.', import.meta.url).pathname;

const ranges = Object.values(gacha.variables.ranges);

// (see https://github.com/ker0olos/fable/issues/9)
// (see https://github.com/ker0olos/fable/issues/45)

type Cache = Pool;

type PageInfo = {
  // total: number;
  // currentPage: number;
  // lastPage: number;
  hasNextPage: boolean;
  // perPage: number;
};

const cache: Cache = {};

async function query(
  variables: {
    page: number;
    popularity_greater: number;
    popularity_lesser?: number;
    role?: CharacterRole;
  },
): Promise<{
  pageInfo: PageInfo;
  media: AniListMedia[];
}> {
  const _ = gql`
    query ($page: Int!, $popularity_greater: Int!, $popularity_lesser: Int) {
      Page(page: $page, perPage: 50) {
        pageInfo {
          hasNextPage
        }
        media(
          popularity_lesser: $popularity_lesser,
          popularity_greater: $popularity_greater,
          format_not_in: [ NOVEL, MUSIC, SPECIAL ],
          isAdult: false,
        ) {
          characters(perPage: 25) {
            nodes {
              id # character id
              media(sort: POPULARITY_DESC) {
                edges {
                  characterRole # actual role
                  # actual media
                  node { 
                    id
                    popularity
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response: {
    pageInfo: PageInfo;
    media: AniListMedia[];
  } = (await request(_, variables)).Page;

  return response;
}

for (const range of ranges) {
  let page = 1;

  const key = JSON.stringify(range);

  const characters: Cache[''] = {
    ALL: [],
    MAIN: [],
    BACKGROUND: [],
    SUPPORTING: [],
  };

  console.log(`${key}: starting`);

  while (true) {
    try {
      const { pageInfo, media } = await query({
        page,
        popularity_greater: range[0],
        popularity_lesser: range[1] || undefined,
      });

      const t = {
        ALL: characters.ALL.length,
        MAIN: characters.MAIN.length,
        SUPPORTING: characters.SUPPORTING.length,
        BACKGROUND: characters.BACKGROUND.length,
      };

      for (const data of media) {
        data.characters?.nodes
          ?.forEach((character) => {
            const id = `anilist:${character.id}`;

            const edge = character.media?.edges[0];

            if (
              edge?.node.popularity &&
              edge.node.popularity >= range[0] &&
              (isNaN(range[1]) || edge.node.popularity <= range[1])
            ) {
              characters.ALL.push({ id });

              characters[edge.characterRole].push({ id });
            }
          });
      }

      console.log(
        `${key}: page: ${page} had: total ${
          characters.ALL.length - t.ALL
        } characters: MAIN: ${characters.MAIN.length - t.MAIN} | SUPPORTING: ${
          characters.SUPPORTING.length - t.SUPPORTING
        } | BACKGROUND: ${characters.BACKGROUND.length - t.BACKGROUND}`,
      );

      if (pageInfo.hasNextPage) {
        page += 1;
        continue;
      }

      break;
    } catch (e) {
      // handle the rate limit
      // (see https://anilist.gitbook.io/anilist-apiv2-docs/overview/rate-limiting)
      if (e.message?.includes('Too Many Requests')) {
        console.log('sleeping for a minute...');
        await utils.sleep(60);
        continue;
      }

      throw e;
    }
  }

  console.log(`${key}: finished`);

  if (characters.ALL.length > 0) {
    utils.shuffle(characters.ALL);
    utils.shuffle(characters.MAIN);
    utils.shuffle(characters.SUPPORTING);
    utils.shuffle(characters.BACKGROUND);

    cache[JSON.stringify(range)] = characters;
  }
}

await Deno.writeTextFile(
  join(dirname, filepath),
  JSON.stringify(cache, null, 2),
);

console.log('written cache to disk');
