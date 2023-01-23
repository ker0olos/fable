import utils from '../../src/utils.ts';

import { join } from 'https://deno.land/std@0.173.0/path/mod.ts';

import gacha from '../../src/gacha.ts';

import { gql, request } from './graphql.ts';

type Data = { [key: string]: number };

const filepath = './lastPage.json';

const dirname = new URL('.', import.meta.url).pathname;

const ranges = Object.values(gacha.variables.ranges);

const data: Data = {};

type PageInfo = {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
};

const previousData = (await import(filepath, {
  assert: { type: 'json' },
})).default as Data;

async function query(
  variables: {
    page: number;
    popularity_greater: number;
    popularity_lesser?: number;
  },
): Promise<{
  pageInfo: PageInfo;
  media: unknown[];
}> {
  const query = gql`
    query ($page: Int!, $popularity_greater: Int!, $popularity_lesser: Int) {
      Page(page: $page, perPage: 50) {
        pageInfo {
          hasNextPage
        }
        media(
          sort: [ TRENDING_DESC, POPULARITY_DESC ],
          popularity_greater: $popularity_greater,
          popularity_lesser: $popularity_lesser,
          format_not_in: [ NOVEL, MUSIC, SPECIAL ],
          # ignore hentai (not 100% reliable according to AniList)
          isAdult: false,
        ) {
          id
        }
      }
    }
  `;

  const response: {
    pageInfo: PageInfo;
    media: unknown[];
  } = (await request(query, variables)).Page;

  return response;
}

for (const range of ranges) {
  const key = JSON.stringify(range);

  // uses the previous data to find the last page faster
  // by decreasing and increasing on the last known number
  // instead of starting from 1 each run
  let page = previousData[key] || 1;

  console.log(`${key}:\nprevious page is: ${previousData[key]}`);

  const retry: { [key: number]: number } = {};

  while (true) {
    try {
      const { pageInfo, media } = await query({
        page,
        popularity_greater: range[0],
        popularity_lesser: range[1] || undefined,
      });

      if (retry[page] >= 1 && 0 < media.length) {
        console.warn(
          `detected page loop one page has a next flag but the next page is empty`,
        );

        break;
      } else {
        retry[page] = retry[page] + 1 || 1;
      }

      console.log(
        `current page is: ${page}`,
      );

      if (pageInfo.hasNextPage) {
        page += 1;
        continue;
        // pages with no media is not a valid page
      } else if (!pageInfo.hasNextPage && 0 >= media.length) {
        page -= 1;
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

  console.log(
    `last page is: ${page}`,
  );

  data[JSON.stringify(range)] = page;
}

if (JSON.stringify(previousData) !== JSON.stringify(data)) {
  await Deno.writeTextFile(
    join(dirname, filepath),
    JSON.stringify(data, null, 2),
  );
  console.log('written changes to disk');
} else {
  console.log('no changes were found');
}
