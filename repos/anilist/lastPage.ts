import { gql, request } from './graphql.ts';

import { sleep } from '../../src/utils.ts';

import { variables } from '../../src/gacha.ts';

type Data = { [key: string]: number };

const filePath = './lastPage.json';

const ranges = Object.values(variables.ranges);

const data: Data = {};

type PageInfo = {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
};

const previousData = (await import(filePath, {
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
        media(popularity_greater: $popularity_greater, popularity_lesser: $popularity_lesser, sort: [POPULARITY], format_in: [TV, MOVIE, MANGA]) {
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

  while (true) {
    try {
      const { pageInfo, media } = await query({
        page,
        popularity_greater: range[0]!,
        popularity_lesser: range[1],
      });

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
        await sleep(60);
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
  await Deno.writeTextFile(filePath, JSON.stringify(data, null, 2));
  console.log('written changes to disk');
} else {
  console.log('no changes were found');
}
