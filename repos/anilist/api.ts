import utils from '../../src/utils.ts';

import { AniListMedia, Character, CharacterRole, Pool } from './types.ts';

import { gql, request } from './graphql.ts';

import lastPage from './lastPage.json' assert {
  type: 'json',
};

/** Order by trending than popularity */
const mediaDefaultSort = '[ TRENDING_DESC, POPULARITY_DESC ]';

/** Order manually decided by anilist moderators */
const characterDefaultSort = '[ RELEVANCE ]';

export async function media(
  variables: { id?: number; search?: string },
  prioritize?: 'anime' | 'manga',
): Promise<AniListMedia | undefined> {
  const query = gql`
    query ($id: Int, $search: String) {
      Page {
        media(search: $search, id: $id, sort: ${mediaDefaultSort}) {
          id
          type
          format
          popularity
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
          title {
            romaji
            english
            native
          }
          coverImage {
            extraLarge
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
          characters(sort: ${characterDefaultSort}) {
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
        }
      }
    }
  `;

  const media: {
    Page: {
      media: AniListMedia[];
    };
  } = await request(query, variables);

  if (!prioritize) {
    return media.Page.media[0];
  } else {
    return media.Page.media.find((m) => m.type === prioritize.toUpperCase()) ??
      media.Page.media[0];
  }
}

export async function character(
  variables: { id?: number; search?: string },
): Promise<Character | undefined> {
  const query = gql`
    query ($id: Int, $search: String) {
      Page {
        # match the search query
        characters(search: $search, id: $id, sort: [ SEARCH_MATCH ]) {
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
          media(sort: POPULARITY_DESC) {
            edges {
              characterRole
              node {
                id
                type
                format
                popularity
                title {
                  romaji
                  english
                  native
                }
                coverImage {
                  large
                }
              }
            }
          }
        }
      }
    }
  `;

  const character: {
    Page: {
      characters: Character[];
    };
  } = await request(query, variables);

  return character.Page.characters[0];
}

export async function nextEpisode(
  variables: { search: string },
): Promise<AniListMedia> {
  const query = gql`
    query ($search: String) {
      Media(search: $search, type: ANIME, sort: ${mediaDefaultSort}) {
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

  return (await request(query, variables)).Media;
}

export async function pool(
  variables: {
    popularity_greater: number;
    popularity_lesser?: number;
    role?: CharacterRole;
  },
  retry = 1,
  dict: Pool = {},
): Promise<Pool> {
  const maxTries = 5;
  const minimalPool = 25;

  const key = JSON.stringify([
    variables.popularity_greater,
    variables.popularity_lesser,
  ]) as keyof typeof lastPage;

  // select a random page between the first and last
  const page = utils.randint(1, lastPage[key]);

  const query = gql`
    query ($popularity_greater: Int!, $popularity_lesser: Int, $role: CharacterRole) {
      Page(page: ${page}, perPage: 50) {
        # fixed to query characters that only appear in anime, movies, and manga
        media(
          sort: ${mediaDefaultSort},
          popularity_greater: $popularity_greater,
          popularity_lesser: $popularity_lesser,
          format_not_in: [ NOVEL, MUSIC, SPECIAL ],
          # ignore hentai (not 100% reliable according to AniList)
          isAdult: false,
        ) {
          # TODO BLOCKED only requests the first page
          # (see https://github.com/ker0olos/fable/issues/9)
          characters(role: $role, sort: ${characterDefaultSort}, perPage: 25) {
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
              media {
                edges {
                  # the character role in the media
                  characterRole
                  node {
                    # the media object
                    id
                    type
                    format
                    popularity
                    title {
                      romaji
                      english
                      native
                    }
                    coverImage {
                      large
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
  } = (await request(query, variables)).Page;

  // using the api
  // create a dictionary of all the characters with their ids as key
  response.media!.forEach(({ characters }) => {
    characters.nodes.forEach((character) => {
      dict[character.id!] = character;
    });
  });

  const currentPool = Object.keys(dict).length;

  // ensure minimal number of characters for the pool
  if (minimalPool > currentPool) {
    if (retry >= maxTries) {
      throw new Error(
        `failed to create a pool with ${
          JSON.stringify({
            ...variables,
            page,
            current_pool: currentPool,
            minimal_pool: minimalPool,
          })
        }`,
      );
    } else {
      // carry over the current pool
      // and added to to a new pool
      // to increase the pool length
      return await pool(variables, retry + 1, dict);
    }
  }

  return dict;
}
