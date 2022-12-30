import {
  gql,
  GraphQLClient,
} from 'https://raw.githubusercontent.com/ker0olos/graphql-request/main/mod.ts';

import { randint } from './utils.ts';

import lastPage from '../anilist.lastPage.json' assert { type: 'json' };

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

type Pull = {
  media: Media;
  character: Character;
  role: CHARACTER_ROLE;
  rating: number;
};

function rate(role: CHARACTER_ROLE, popularity: number) {
  if (role === CHARACTER_ROLE.BACKGROUND || popularity < 50_000) {
    return 1;
  }

  if (popularity < 200_000) {
    if (role === CHARACTER_ROLE.MAIN) {
      return 3;
    }

    return 2;
  }

  if (popularity < 400_000) {
    if (role === CHARACTER_ROLE.MAIN) {
      return 4;
    }

    return 3;
  }

  if (popularity > 400_000) {
    if (role === CHARACTER_ROLE.MAIN) {
      return 5;
    }

    return 4;
  }

  throw new Error(
    `Couldn't determine the star rating for { role: "${role}", popularity: ${popularity} }`,
  );
}

export async function search(
  variables: { id?: number; search?: string },
): Promise<Media | undefined> {
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

  // const character = gql`
  //   query ($search: String) {
  //     Character(search: $search, sort: [SEARCH_MATCH]) {
  //       age
  //       gender
  //       description
  //       name {
  //         full
  //         native
  //         alternative
  //         alternativeSpoiler
  //       }
  //       image {
  //         large
  //       }
  //       media {
  //         nodes {
  //           id
  //           type
  //           format
  //           title {
  //             romaji
  //             english
  //             native
  //           }
  //         }
  //       }
  //     }
  //   }
  // `;

  return (await client.request(media, variables).catch(() => undefined))?.Media;
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

export async function pool(
  variables: {
    popularity_greater: number;
    popularity_lesser?: number;
    role: CHARACTER_ROLE;
  },
): Promise<Pull[]> {
  const results: {
    [character_id: number]: Pull;
  } = {};

  const key = JSON.stringify([
    variables.popularity_greater,
    variables.popularity_lesser,
  ]) as keyof typeof lastPage;

  // select a random page between the first and last
  const page = randint(1, lastPage[key]);

  const query = gql`
    query ($role: CharacterRole!, $popularity_greater: Int!, $popularity_lesser: Int) {
      Page(page: ${page}, perPage: 50) {
        # fixed to query characters that only appear in anime, movies, and manga
        media(popularity_greater: $popularity_greater, popularity_lesser: $popularity_lesser, sort: [POPULARITY], format_in: [TV, MOVIE, MANGA]) {
          # FIXME only requests the first page
          # nearly impossible to fix, given the fact that
          # we're using a workaround for the same issue on media
          # which is only possible because that was a series of predictable queries
          # (see https://github.com/ker0olos/fable/issues/9)
          characters(sort: RELEVANCE, role: $role, perPage: 25) {
            nodes {
              # the character themselves
              id
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
              media(sort: POPULARITY_DESC) { # always return the hightest popularity first
                edges {
                  # the character role in the media
                  characterRole
                  node {
                    # the media itself
                    type
                    format
                    popularity
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
    media: {
      characters: {
        nodes: Character[];
      };
    }[];
  } = (await client.request(query, variables)).Page;

  // query asks for media with popularity_greater than variable
  // but a character in that media might be the MAIN in a [more] popular alterative media
  // therefor we ignore the parent media and only operate
  // on the list of characters it has and their media list

  // the parent media is only used as a wrapper to get list of popular media

  response.media!.forEach(({ characters }) => {
    characters.nodes.forEach((character) => {
      // some characters can be MAIN in their own spinoffs series
      // prefer less popular series if character is MAIN
      const mainIndex = character.media?.edges!.findIndex((edges) =>
        edges.characterRole === CHARACTER_ROLE.MAIN
      )!;

      const {
        node,
        characterRole,
        // the first [0] is always the most popular media
        // the character stars in (according to the query)
      } = character.media?.edges![mainIndex !== -1 ? mainIndex : 0]!;

      // only overwrite the entry if we found the character
      // in a media with higher popularity than existing
      if (results[character.id!]?.media?.popularity! >= node.popularity!) {
        return;
      }

      results[character.id!] = {
        character,
        media: node!,
        role: characterRole!,
        rating: rate(characterRole!, node!.popularity!),
      };
    });
  });

  const pool = Object.values(results);

  if (!pool?.length) {
    throw new Error(
      `failed to create a pool with ${JSON.stringify({ ...variables, page })}`,
    );
  }

  return pool;
}

export function titles(media: Media): string[] {
  const titles = [
    media.title.english,
    media.title.romaji,
    media.title.native,
  ].filter(Boolean);

  return titles as string[];
}
