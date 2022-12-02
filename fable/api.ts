import {
  gql,
  GraphQLClient,
} from 'https://raw.githubusercontent.com/ker0olos/graphql-request/main/mod.ts';

const client = new GraphQLClient('https://graphql.anilist.co');

export enum TYPE {
  'ANIME' = 'ANIME',
  'MANGA' = 'MANGA',
}

export enum RELATION_TYPE {
  'ADAPTATION' = 'ADAPTATION',
  'PREQUEL' = 'PREQUEL',
  'SEQUEL' = 'SEQUEL',
  'PARENT' = 'PARENT',
  'SIDE_STORY' = 'SIDE_STORY',
  'CHARACTER' = 'CHARACTER',
  'SUMMARY' = 'SUMMARY',
  'ALTERNATIVE' = 'ALTERNATIVE',
  'SPIN_OFF' = 'SPIN_OFF',
  'OTHER' = 'OTHER',
  'SOURCE' = 'SOURCE',
  'COMPILATION' = 'COMPILATION',
  'CONTAINS' = 'CONTAINS',
}

export enum STATUS {
  'FINISHED' = 'FINISHED',
  'RELEASING' = 'RELEASING',
  'NOT_YET_RELEASED' = 'NOT_YET_RELEASED',
  'CANCELLED' = 'CANCELLED',
  'HIATUS' = 'HIATUS',
}

export enum FORMAT {
  'TV' = 'TV',
  'TV_SHORT' = 'TV_SHORT',
  'MOVIE' = 'MOVIE',
  'SPECIAL' = 'SPECIAL',
  'OVA' = 'OVA',
  'ONA' = 'ONA',
  'MUSIC' = 'MUSIC',
  'MANGA' = 'MANGA',
  'NOVEL' = 'NOVEL',
  'ONE_SHOT' = 'ONE_SHOT',
}

export enum CHARACTER_ROLE {
  'MAIN' = 'MAIN',
  'SUPPORTING' = 'SUPPORTING',
  'BACKGROUND' = 'BACKGROUND',
}

export type PageInfo = {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
};

export type Media = {
  type: TYPE;
  format: FORMAT;
  title: {
    english?: string;
    romaji?: string;
    native?: string;
  };
  externalLinks: {
    site: string;
    url: string;
  }[];
  nextAiringEpisode?: {
    airingAt?: number;
  };
  id?: number;
  status: STATUS;
  relations: {
    edges: {
      relationType: RELATION_TYPE;
      node: Media;
    }[];
  };
  popularity?: number;
  description?: string;
  characters?: {
    nodes?: Character[];
    edges?: { role: CHARACTER_ROLE; node: Character }[];
  };
  coverImage?: {
    extraLarge: string;
    large: string;
    medium: string;
    color?: string;
  };
  trailer?: {
    id: string;
    site: string;
  };
};

export type Character = {
  name: {
    full: string;
    native?: string;
    alternative?: string[];
    alternativeSpoiler?: string[];
  };
  id?: number;
  description?: string;
  gender?: string;
  age?: string;
  image?: {
    large: string;
  };
  media?: {
    nodes?: Media[];
    edges?: { characterRole: CHARACTER_ROLE; node: Media }[];
  };
};

export async function search(
  variables: { id?: number; search?: string },
): Promise<{ media?: Media; character?: Character }> {
  const media = gql`
    query ($id: Int, $search: String) {
      Media(search: $search, id: $id, sort: [POPULARITY_DESC]) {
        type
        format
        description
        relations {
          edges {
            relationType
            node {
              id
              type
              format
              title {
                romaji
                english
                native
              }
              externalLinks {
                site
                url
              }
            }
          }
        }
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
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          large
          color
        }
        externalLinks {
          site
          url
        }
        trailer {
          id
          site
        }
      }
    }
  `;

  const character = gql`
    query ($search: String) {
      Character(search: $search, sort: [SEARCH_MATCH]) {
        age
        gender
        description
        name {
          full
          native
          alternative
          alternativeSpoiler
        }
        image {
          large
        }
        media {
          nodes {
            id
            type
            format
            title {
              romaji
              english
              native
            }
          }
        }
      }
    }
  `;

  const promises = await Promise.all([
    client.request(media, variables).catch(() => undefined),
    client.request(character, variables).catch(() => undefined),
  ]);

  return {
    media: promises[0]?.Media as Media,
    character: promises[1]?.Character as Character,
  };
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
