import { gql, request } from './graphql.ts';

import { AniListCharacter, AniListMedia } from './types.ts';

import { Character, Media } from '../../src/types.ts';

import packs from '../../src/packs.ts';

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
          color: item.coverImage.color,
        }]
        : undefined,
      relations: undefined,
      characters: undefined,
    };

    if (item.relations?.edges?.length) {
      t.relations = {
        edges: item.relations.edges
          .filter((edge) => !packs.isDisabled(`anilist:${edge.node.id}`))
          .map((edge) => ({
            relation: edge.relationType,
            node: transform({ item: edge.node as AniListMedia }),
          })),
      };
    }

    if (item.characters?.edges?.length) {
      t.characters = {
        edges: item.characters.edges
          .filter((edge) => !packs.isDisabled(`anilist:${edge.node.id}`))
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
          .filter((edge) => !packs.isDisabled(`anilist:${edge.node.id}`))
          .map((edge) => ({
            role: edge.characterRole,
            node: transform({ item: edge.node as AniListMedia }),
          })),
      };
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
  variables: { ids?: number[]; search?: string },
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
          # FIXME view characters maxes out at 25 on anilist media
          # (see #54)
          characters(sort: ${characterDefaultSort}, perPage: 25) {
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
      Media(search: $search, type: ANIME, sort: ${mediaDefaultSort}, isAdult: false) {
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
