import utils from '../../src/utils.ts';

import { AniListMedia, Character, CharacterRole, Pool } from './types.ts';

import { gql, request } from './graphql.ts';

import lastPage from './lastPage.json' assert {
  type: 'json',
};

import { Media } from '../../src/types.ts';

/** Order by trending than popularity */
const mediaDefaultSort = '[ TRENDING_DESC, POPULARITY_DESC ]';

/** Order manually decided by anilist moderators */
const characterDefaultSort = '[ RELEVANCE, ROLE_DESC ]';

export async function media(
  variables: { ids?: number[]; search?: string },
): Promise<AniListMedia[]> {
  if (!variables.search && !variables.ids?.length) {
    return [];
  }

  const query = gql`
    query ($ids: [Int], $search: String) {
      Page {
        media(search: $search, id_in: $ids, sort: ${mediaDefaultSort}) {
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
            large,
            medium,
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
                  medium
                }
              }
            }
          }
        }
      }
    }
  `;

  const data: {
    Page: {
      media: AniListMedia[];
    };
  } = await request(query, variables);

  return data.Page.media.map(
    (media) => (media.packId = 'anilist', media),
  );
}

export async function characters(
  variables: { ids?: number[]; search?: string },
): Promise<Character[]> {
  if (!variables.search && !variables.ids?.length) {
    return [];
  }

  const query = gql`
    query ($ids: [Int], $search: String) {
      Page {
        # match the search query
        characters(search: $search, id_in: $ids, sort: [ SEARCH_MATCH ]) {
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
            large,
            medium
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
              }
            }
          }
        }
      }
    }
  `;

  const data: {
    Page: {
      characters: Character[];
    };
  } = await request(query, variables);

  return data.Page.characters.map(
    (character) => (character.packId = 'anilist', character),
  );
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
  // deno-lint-ignore camelcase
  { popularity_greater, popularity_lesser, role }: {
    popularity_greater: number;
    popularity_lesser?: number;
    role?: CharacterRole;
  },
): Promise<Pool> {
  const pool: Pool = {};

  // the minimal pool insures that there's enough variety in the pool
  const minimalPool = 25;

  const query = gql`
    query ($page: Int!, $popularity_greater: Int!, $popularity_lesser: Int, $role: CharacterRole) {
      Page(page: $page, perPage: 50) {
        # fixed to query characters that only appear in anime, movies, and manga
        media(
          sort: ${mediaDefaultSort},
          popularity_greater: $popularity_greater,
          popularity_lesser: $popularity_lesser,
          format_not_in: [ NOVEL, MUSIC, SPECIAL ],
          # ignore hentai (not 100% reliable according to AniList)
          isAdult: false,
        ) {
          # only requests the first page
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

  const key = JSON.stringify([
    popularity_greater,
    popularity_lesser,
  ]) as keyof typeof lastPage;

  // select a random page between the first and last
  const set = [
    ...new Set([
      utils.randint(1, lastPage[key]),
      utils.randint(1, lastPage[key]),
      utils.randint(1, lastPage[key]),
      utils.randint(1, lastPage[key]),
      utils.randint(1, lastPage[key]),
    ]),
  ];

  const requests = set.map(
    (page) =>
      request<{
        Page: {
          media: Media[];
        };
      }>(query, { page, popularity_greater, popularity_lesser, role })
        .then((response) => response.Page),
  );

  const pages = await Promise.all(requests);

  pages.forEach((page) => {
    // using the api
    // create a dictionary of all the characters with their ids as key
    page.media!.forEach(({ characters }) => {
      // deno-lint-ignore ban-ts-comment
      //@ts-ignore
      characters!.nodes!.forEach((character: Character) => {
        pool[character.id] = (character.packId = 'anilist', character);
      });
    });
  });

  const currentPool = Object.keys(pool).length;

  if (minimalPool > currentPool) {
    throw new Error(
      `failed to create a pool with ${
        JSON.stringify({
          popularity_greater,
          popularity_lesser,
          role,
          pages: set,
          current_pool: currentPool,
          minimal_pool: minimalPool,
        })
      }`,
    );
  }

  return pool;
}
