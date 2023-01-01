import { randint } from '../../src/utils.ts';

import { AniListMedia, Character, CharacterRole } from './interface.ts';

import { gql, request } from './graphql.ts';

import lastPage from './lastPage.json' assert {
  type: 'json',
};

export async function media(
  variables: { id?: number; search?: string },
  prioritize?: 'anime' | 'manga',
): Promise<AniListMedia | undefined> {
  const query = gql`
    query ($id: Int, $search: String) {
      Page {
        media(search: $search, id: $id, sort: [POPULARITY_DESC]) {
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
        characters(search: $search, id: $id, sort: [SEARCH_MATCH]) {
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

  return (await request(query, variables)).Media;
}

export async function pool(
  variables: {
    popularity_greater: number;
    popularity_lesser?: number;
    role: CharacterRole;
  },
  retry = 1,
): Promise<Character[]> {
  const results: {
    [character_id: number]: Character;
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
          # which is only possible because that was a set of predictable queries
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
  } = (await request(query, variables)).Page;

  // TODO a lot of this logic should be moved
  // and handled by ome kind of repo management system not anilist
  // sorting and deciding which media is first

  // query asks for media with popularity_greater than variable
  // but a character in that media might be the MAIN in a [more] popular alterative media
  // therefor we ignore the parent media and only operate
  // on the list of characters it has and their media list

  // the parent media is only used as a wrapper to get list of popular media

  response.media!.forEach(({ characters }) => {
    characters.nodes.forEach((character) => {
      // const {
      //   node,
      //   characterRole,
      //   // the first [0] is always the most popular media
      //   // the character stars in (according to the query)
      // } = character.media?.edges!.splice(0, 1)[0]!;

      // only overwrite the entry if we found the character
      // in a media with higher popularity than existing
      // if (
      //   results[character.id!]?.media!.edges![0].node.popularity! >=
      //     node.popularity!
      // ) {
      //   return;
      // }

      // character.media!.edges = [
      //   {
      //     characterRole: characterRole!,
      //     node: node!,
      //   },
      //   ...character.media?.edges!,
      // ];

      results[character.id!] = character;
    });
  });

  const _ = Object.values(results);

  // minimal number of characters for the pool
  if (15 >= _?.length) {
    if (retry >= 3) {
      throw new Error(
        `failed to create a pool with ${
          JSON.stringify({
            ...variables,
            page,
            current_pool: _?.length,
            minimal_pool: 15,
          })
        }`,
      );
    } else {
      return await pool(variables, retry + 1);
    }
  }

  return _;
}
