import {
  gql,
  GraphQLClient,
} from 'https://raw.githubusercontent.com/ker0olos/graphql-request/main/mod.ts';

const client = new GraphQLClient('https://graphql.anilist.co');

type Media = {
  title: {
    english: string;
    romaji?: string;
    native?: string;
  };
  nextAiringEpisode?: {
    airingAt?: number;
  };
  type?: 'ANIME' | 'MANGA';
  description?: string;
  coverImage?: {
    large?: string;
    medium?: string;
    color?: string;
  };
};

type Page = {
  pageInfo: {
    total: number;
    currentPage: number;
    lastPage: number;
    hasNextPage: boolean;
    perPage: number;
  };
  media: Media[];
};

export async function search(
  variables: { search: string; page: number },
): Promise<Page> {
  const query = gql`
    query ($page: Int, $search: String) {
      Page(page: $page, perPage: 1) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        media(search: $search, sort:[POPULARITY_DESC]) {
          type
          description
          coverImage {
            large
            medium
            color
          }
          title {
            romaji
            english
            native
          }
        }
      }
    }
  `;

  return (await client.request(query, variables)).Page;
}

export async function getNextAiring(
  variables: { search: string },
): Promise<Media> {
  const query = gql`
    query ($search: String) {
      Media(search: $search, type: ANIME, sort:[TRENDING_DESC, POPULARITY_DESC]) {
        title {
          english
        }
        nextAiringEpisode {
          airingAt
        },
      }
    }
  `;

  return (await client.request(query, variables)).Media;
}
