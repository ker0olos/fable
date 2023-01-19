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
const mediaDefaultSort = gql`[ TRENDING_DESC, POPULARITY_DESC ]`;

/** Order manually decided by anilist moderators */
const characterDefaultSort = gql`[ RELEVANCE, ROLE ]`;

const mediaDefaultQuery = gql`
id
type
format
popularity
description
title {
  romaji
  english
  native
}
genres
synonyms
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
tags {
  name
}
`;

const characterDefaultQuery = gql`
id
age
gender
description
name {
  full
  native
  alternative
}
image {
  medium
  large
}
`;

export function transform<T>(
  { item }: { item: AniListMedia | AniListCharacter },
): T {
  if ('title' in item) {
    const t: Media = {
      ...item,
      packId: 'anilist',
      title: Object.assign(
        {},
        item.title?.english && { english: item.title?.english },
        item.title?.romaji && { romaji: item.title?.romaji },
        item.title?.native && { native: item.title?.native },
        item.synonyms &&
          { alternative: item.synonyms },
      ),
      relations: undefined,
      characters: undefined,
    };

    if (item.relations?.edges?.length) {
      t.relations = {
        edges: item.relations.edges.map((edge) => ({
          relation: edge.relationType,
          node: transform({ item: edge.node as AniListMedia }),
        })),
      };
    } else {
      delete t.relations;
    }

    if (item.characters?.edges?.length) {
      t.characters = {
        edges: item.characters.edges.map((edge) => ({
          role: edge.role,
          node: transform({ item: edge.node as AniListCharacter }),
        })),
      };
    } else {
      delete t.characters;
    }

    return t as T;
  } else if ('name' in item) {
    const t: Character = {
      ...item,
      packId: 'anilist',
      name: Object.assign(
        {},
        item.name?.full && { english: item.name?.full },
        item.name?.native && { native: item.name?.native },
        item.name?.alternative &&
          { alternative: item.name?.alternative },
      ),
      media: undefined,
    };

    if (item.media?.edges?.length) {
      t.media = {
        edges: item.media.edges.map((edge) => ({
          role: edge.characterRole,
          node: transform({ item: edge.node as AniListMedia }),
        })),
      };
    } else {
      delete t.media;
    }

    return t as T;
  }

  return item as T;
}

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
          ${mediaDefaultQuery}
          relations {
            edges {
              node { ${mediaDefaultQuery} }
              relationType
            }
          }
          characters(sort: ${characterDefaultSort}) {
            edges {
              node { ${characterDefaultQuery} }
              role
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

  return data.Page.media;
}

export async function characters(
  variables: { ids?: number[]; search?: string },
): Promise<AniListCharacter[]> {
  if (!variables.search && !variables.ids?.length) {
    return [];
  }

  const query = gql`
    query ($ids: [Int], $search: String) {
      Page {
        # match the search query
        characters(search: $search, id_in: $ids, sort: [ SEARCH_MATCH ]) {
          ${characterDefaultQuery}
          media(sort: POPULARITY_DESC) {
            edges {
              node { ${mediaDefaultQuery} }
              characterRole
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

  return data.Page.characters;
}

export async function nextEpisode(
  variables: { search: string },
): Promise<AniListMedia> {
  const query = gql`
    query ($search: String) {
      Media(search: $search, type: ANIME, sort: ${mediaDefaultSort}) {
        title {
          english
          romaji
          native
        }
        status
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
  dict: Pool = {},
  retry = 0,
): Promise<Pool> {
  // the minimal pool insures that there's enough variety in the pool
  const minimalPool = 25;

  const query = gql`
    query ($page: Int!, $popularity_greater: Int!, $popularity_lesser: Int, $role: CharacterRole) {
      Page(page: $page, perPage: 50) {
        media(
          sort: ${mediaDefaultSort},
          popularity_greater: $popularity_greater,
          popularity_lesser: $popularity_lesser,
          format_not_in: [ NOVEL, MUSIC, SPECIAL ], # fixed to query characters that only appear in anime, movies, and manga
          isAdult: false, # ignore hentai (not 100% reliable according to anilist)
        ) {
          # TODO BLOCKED only requests the first page
          characters(role: $role, sort: ${characterDefaultSort}, perPage: 25) {
            nodes {
              ${characterDefaultQuery}
              media {
                edges {
                  node { ${mediaDefaultQuery} }
                  characterRole
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
        dict[character.id] = transform<Character>({ item: character });
      });
    });
  });

  const currentPool = Object.keys(dict).length;

  if (minimalPool > currentPool) {
    if (retry > 1) {
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
      return pool(
        { popularity_greater, popularity_lesser, role },
        dict,
        retry + 1,
      );
    }
  }

  return dict;
}
