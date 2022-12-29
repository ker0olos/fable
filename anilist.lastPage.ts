import {
  gql,
  GraphQLClient,
} from 'https://raw.githubusercontent.com/ker0olos/graphql-request/main/mod.ts';

import { readJson, writeJson } from 'https://deno.land/x/jsonfile@1.0.0/mod.ts';

import { sleep } from './src/utils.ts';

import { PageInfo } from './src/anilist.ts';

import { variables } from './src/gacha.ts';

type Data = { [key: string]: number };

const filePath = './anilist.lastPage.json';

const client = new GraphQLClient('https://graphql.anilist.co');

const ranges = Object.values(variables.ranges);

const data: Data = {};

const previousData = await readJson(filePath) as Data;

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
    query ($page: Int = 1, $popularity_greater: Int!, $popularity_lesser: Int) {
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
  } = (await client.request(query, variables)).Page;

  return response;
}

for (const range of ranges) {
  const key = JSON.stringify(range);

  let page = previousData[key] || 1;

  console.log(`${key}:\nprevious page is ${previousData[key]}`);

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
      } else if (!pageInfo.hasNextPage && 0 >= media.length) {
        page -= 1;
        continue;
      }

      break;
    } catch (e) {
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
  console.log('found changes in data');
  await writeJson(filePath, data, { spaces: 2 });
} else {
  console.log('no changes were found');
  Deno.exit(1);
}
