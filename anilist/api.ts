import {
  gql,
  GraphQLClient,
} from 'https://raw.githubusercontent.com/ker0olos/graphql-request/main/mod.ts';

const client = new GraphQLClient('https://graphql.anilist.co');

export enum COMPONENT_TYPE {
  GROUP = 1,
  BUTTON = 2,
}

export enum MESSAGE_TYPE {
  NEW = 4,
  UPDATE = 7,
}

export enum BUTTON_COLOR {
  BLUE = 1,
  GREY = 2,
  GREEN = 3,
  RED = 4,
}

type Media = {
  title: {
    english?: string;
    romaji?: string;
    native?: string;
  };
  nextAiringEpisode?: {
    airingAt?: number;
  };
  id?: number;
  type?: 'ANIME' | 'MANGA';
  format?:
    | 'TV'
    | 'TV_SHORT'
    | 'MOVIE'
    | 'SPECIAL'
    | 'OVA'
    | 'ONA'
    | 'MUSIC'
    | 'MANGA'
    | 'NOVEL'
    | 'ONE_SHOT';
  status:
    | 'FINISHED'
    | 'RELEASING'
    | 'NOT_YET_RELEASED'
    | 'CANCELLED'
    | 'HIATUS';
  relations: { nodes: Media[] };
  description?: string;
  characters?: { edges: Character[] };
  coverImage?: {
    extraLarge: string;
    large: string;
    medium: string;
    color?: string;
  };
};

type Character = {
  role: string;
  node: {
    name: {
      full: string;
    };
    description?: string;
    gender?: string;
    age?: string;
    image: {
      large?: string;
    };
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

export type Response = {
  type: MESSAGE_TYPE;
  data: {
    content?: string;
    embeds?: Embed[];
    components?: Component[];
  };
};

type Component = {
  type: COMPONENT_TYPE;
  style?: BUTTON_COLOR;
  // deno-lint-ignore camelcase
  custom_id?: string;
  label?: string;
  components?: Component[];
};

type Embed = {
  type: 'rich';
  title?: string;
  description?: string;
  color?: number;
  fields?: {
    name: string;
    value: string;
  }[];
  thumbnail?: {
    url: string;
  };
  image?: {
    url: string;
  };
  author?: {
    name: string;
  };
  footer?: {
    text: string;
  };
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
        media(search: $search, sort: [POPULARITY_DESC]) {
          type
          format
          status
          description
          characters(sort: [RELEVANCE]) {
            edges {
              role
              node {
                age
                gender
                description
                name {
                  full
                }
                image {
                  large
                }
              }
            }
          }
          coverImage {
            extraLarge
            large
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
        status
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
