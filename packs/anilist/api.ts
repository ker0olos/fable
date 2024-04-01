import { gql, request } from './graphql.ts';

import { AniListCharacter, AniListMedia } from './types.ts';

import { Character, CharacterRole, Media } from '../../src/types.ts';

const url = 'https://graphql.anilist.co';

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
isAdult
coverImage {
  extraLarge
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
      title: {
        english: item.title?.english,
        romaji: item.title?.romaji,
        native: item.title?.native,
        alternative: item.synonyms,
      },
      images: item.coverImage?.extraLarge &&
          !item.coverImage?.extraLarge.endsWith('default.jpg')
        ? [{
          url: item.coverImage.extraLarge,
        }]
        : undefined,
      relations: undefined,
      characters: undefined,
    };

    if (item.relations?.edges?.length) {
      t.relations = {
        edges: item.relations.edges
          .map((edge) => ({
            relation: edge.relationType,
            node: transform({ item: edge.node as AniListMedia }),
          })),
      };
    }

    if (item.characters?.edges?.length) {
      t.characters = {
        // used for query media character
        // deno-lint-ignore ban-ts-comment
        // @ts-ignore
        pageInfo: item.characters.pageInfo,
        edges: item.characters.edges
          .map((edge) => ({
            role: edge.role,
            node: transform({ item: edge.node as AniListCharacter }),
          })),
      };
    }

    // get rid of undefined values
    return JSON.parse(JSON.stringify(t)) as T;
  } else if ('name' in item) {
    const t: Character = {
      ...item,
      packId: 'anilist',
      name: {
        english: item.name?.full,
        native: item.name?.native,
        alternative: item.name?.alternative,
      },
      images: item.image?.large &&
          !item.image?.large.endsWith('default.jpg')
        ? [{
          url: item.image.large,
        }]
        : undefined,
      media: undefined,
    };

    if (item.media?.edges?.length) {
      t.media = {
        edges: item.media.edges
          .map((edge) => ({
            role: edge.characterRole,
            node: transform({ item: edge.node as AniListMedia }),
          })),
      };

      if (t.media.edges.length) {
        let index = 0;

        // check if a primary media swap is required
        t.media.edges.forEach((e, i) => {
          if (
            // ignore background roles
            (t.media?.edges[index].role === CharacterRole.Background) ||
            // sort by popularity
            (
              e.role !== CharacterRole.Background &&
              // deno-lint-ignore no-non-null-assertion
              e.node.popularity! > t.media!.edges[index].node.popularity!
            )
          ) {
            index = i;
          }
        });

        // swap position
        const _ = t.media.edges[0];
        t.media.edges[0] = t.media.edges[index];
        t.media.edges[index] = _;
      }
    }

    Object.keys(t).forEach((key) =>
      t[key as keyof Character] === undefined &&
      delete t[key as keyof Character]
    );

    // get rid of undefined values
    return JSON.parse(JSON.stringify(t)) as T;
  }

  return item as T;
}

export async function media(
  variables: {
    ids?: number[];
    search?: string;
    perPage?: number;
    page?: number;
  },
): Promise<AniListMedia[]> {
  if (!variables.search && !variables.ids?.length) {
    return [];
  }

  const query = gql`
    query ($ids: [Int], $search: String) {
      Page {
        media(search: $search, id_in: $ids, sort: ${mediaDefaultSort}, isAdult: false) {
          ${mediaDefaultQuery}
          relations {
            edges {
              node { ${mediaDefaultQuery} }
              relationType
            }
          }
          characters(
            sort: ${characterDefaultSort}, 
            page: ${variables.page ?? 1},
            perPage: ${variables.perPage ?? 25}
          ) {
            pageInfo {
              hasNextPage
            }
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
  } = await request({ url, query, variables });

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
  } = await request({ url, query, variables });

  return data.Page.characters
    .filter((character) => !character.media?.edges?.[0]?.node?.isAdult);
}
