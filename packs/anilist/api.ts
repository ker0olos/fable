import utils from '../../src/utils.ts';

import { gql, request } from './graphql.ts';

import lastPage from './lastPage.json' assert {
  type: 'json',
};

import {
  AniListCharacter,
  AniListMedia,
  CharacterRole,
  Pool,
} from './types.ts';

import { Character, Media } from '../../src/types.ts';

/** Order by trending than popularity */
const mediaDefaultSort = '[ TRENDING_DESC, POPULARITY_DESC ]';

/** Order manually decided by anilist moderators */
const characterDefaultSort = '[ RELEVANCE, ROLE ]';

function transform<T>(
  { media, character }: { media?: AniListMedia; character?: AniListCharacter },
) {
  if (media) {
    const t: Media = {
      ...media,
      packId: 'anilist',
      relations: undefined,
      characters: undefined,
    };

    if (media.relations?.edges?.length) {
      t.relations = {
        edges: media.relations.edges.map((edge) => ({
          relation: edge.relationType,
          node: transform({ media: edge.node as AniListMedia }),
        })),
      };
    } else {
      delete t.relations;
    }

    if (media.characters?.edges?.length) {
      t.characters = {
        edges: media.characters.edges.map((edge) => ({
          role: edge.role,
          node: transform({ character: edge.node as AniListCharacter }),
        })),
      };
    } else {
      delete t.characters;
    }

    return t as T;
  } else if (character) {
    const t: Character = {
      ...character,
      packId: 'anilist',
      name: Object.assign(
        {},
        character.name?.full && { english: character.name?.full },
        character.name?.native && { native: character.name?.native },
        character.name?.alternative &&
          { alternative: character.name?.alternative },
      ),
      media: undefined,
    };

    if (character.media?.edges?.length) {
      t.media = {
        edges: character.media.edges.map((edge) => ({
          role: edge.characterRole,
          node: transform({ media: edge.node as AniListMedia }),
        })),
      };
    } else {
      delete t.media;
    }

    return t as T;
  }

  throw new Error();
}

export async function media(
  variables: { ids?: number[]; search?: string },
): Promise<Media[]> {
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
    (media) => transform<Media>({ media }),
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
      characters: AniListCharacter[];
    };
  } = await request(query, variables);

  return data.Page.characters.map(
    (character) => transform<Character>({ character }),
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
  retry = 0,
): Promise<Pool> {
  const dict: Pool = {};

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
  const pages = [
    ...new Set([
      utils.randint(1, lastPage[key]),
      utils.randint(1, lastPage[key]),
      utils.randint(1, lastPage[key]),
      utils.randint(1, lastPage[key]),
      utils.randint(1, lastPage[key]),
    ]),
  ];

  const requests = pages.map(
    (page) =>
      request<{
        Page: {
          media: AniListMedia[];
        };
      }>(query, { page, popularity_greater, popularity_lesser, role })
        .then((response) => response.Page),
  );

  const data = await Promise.all(requests);

  data.forEach((page) => {
    // using the api
    // create a dictionary of all the characters with their ids as key
    page.media.forEach(({ characters }) => {
      characters?.nodes?.forEach((character) => {
        dict[character.id] = transform<Character>({ character });
      });
    });
  });

  const currentPool = Object.keys(dict).length;

  if (minimalPool > currentPool) {
    if (retry > 0) {
      throw new Error(
        `failed to create a pool with ${
          JSON.stringify({
            popularity_greater,
            popularity_lesser,
            role,
            pages: pages,
            current_pool: currentPool,
            minimal_pool: minimalPool,
          })
        }`,
      );
    } else {
      return pool({ popularity_greater, popularity_lesser, role }, retry + 1);
    }
  }

  return dict;
}
