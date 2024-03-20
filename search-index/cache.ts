import { create, insert, Orama } from 'orama';

import { join } from '$std/path/mod.ts';

import utils from '~/src/utils.ts';

import { gql, request } from '~/packs/anilist/graphql.ts';

import { AniListCharacter, AniListMedia } from '~/packs/anilist/types.ts';

import { characterSchema, mediaSchema } from '~/search-index/mod.ts';

const anilistAPI = 'https://graphql.anilist.co';

const dirname = new URL('.', import.meta.url).pathname;

const charactersIndexCachePath = join(dirname, './characters.json');
const mediaIndexCachePath = join(dirname, './media.json');

const charactersIndex: Orama<typeof characterSchema> = await create({
  schema: characterSchema,
});

const mediaIndex: Orama<typeof mediaSchema> = await create({
  schema: mediaSchema,
});

type PageInfo = {
  hasNextPage: boolean;
};

const mediaUniqueMap = new Map<string, boolean>();
const charactersUniqueMap = new Map<string, boolean>();

async function queryMedia(
  page: number,
  popularityGreater = 1000,
): Promise<{
  pageInfo: PageInfo;
  media: AniListMedia[];
}> {
  const query = gql`
    query ($page: Int!, $popularity_greater: Int!) {
      Page(page: $page, perPage: 50) {
        pageInfo {
          hasNextPage
        }
        media(
          popularity_greater: $popularity_greater,
          format_not_in: [ NOVEL, MUSIC, SPECIAL ],
          isAdult: false,
        ) {
          id
          characters(page: 1, perPage: 25) {
            pageInfo {
              hasNextPage
            }
            nodes {
              id # character id
              name {
                full
                native
              }
              media(sort: POPULARITY_DESC) {
                edges {
                  characterRole # actual role
                  # actual media
                  node { 
                    id
                    popularity
                    isAdult
                    title {
                      english
                      native
                      romaji
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
    pageInfo: PageInfo;
    media: AniListMedia[];
  } = (await request({
    url: anilistAPI,
    query,
    variables: {
      page,
      popularity_greater: popularityGreater,
    },
  })).Page;

  return response;
}

async function queryCharacters(
  variables: {
    id: string;
    page: number;
  },
): Promise<{
  pageInfo: PageInfo;
  nodes: AniListCharacter[];
}> {
  const query = gql`
    query ($id: Int!, $page: Int!) {
      Media(id: $id) {
        characters(page: $page, perPage: 25) {
          pageInfo {
            hasNextPage
          }
          nodes {
            id # character id
            name {
              full
              native
            }
            media(sort: POPULARITY_DESC) {
              edges {
                characterRole # actual role
                # actual media
                node { 
                  id
                  popularity
                  isAdult
                  title {
                      english
                      native
                      romaji
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
    Media: AniListMedia;
  } = await request({ url: anilistAPI, query, variables });

  return {
    // deno-lint-ignore ban-ts-comment
    //@ts-ignore
    pageInfo: response.Media.characters?.pageInfo,
    // deno-lint-ignore no-non-null-assertion
    nodes: response.Media.characters?.nodes!,
  };
}

let mediaPage = 1;

while (true) {
  try {
    const { pageInfo, media } = await queryMedia(mediaPage);

    for (const { id, characters: firstPage } of media) {
      let charactersPage = 1;

      while (true) {
        try {
          const { nodes, pageInfo } = charactersPage === 1
            // deno-lint-ignore no-non-null-assertion
            ? { nodes: firstPage!.nodes!, pageInfo: firstPage!.pageInfo }
            : await queryCharacters({
              id,
              page: charactersPage,
            });

          await Promise.all(nodes.map(async (character) => {
            const name = [
              character.name?.full,
              character.name?.native,
              ...(character.name?.alternative ?? []),
            ].filter(utils.nonNullable);

            const media = character.media?.edges[0];

            const id = `anilist:${character.id}`;

            if (media && !media.node.isAdult) {
              const mediaId = `anilist:${media.node.id}`;

              if (typeof media.node.popularity === 'number') {
                const mediaTitle = [
                  media.node.title.english,
                  media.node.title.romaji,
                  media.node.title.native,
                  ...(media.node.synonyms ?? []),
                ].filter(utils.nonNullable);

                if (
                  media?.node?.id && mediaTitle?.length &&
                  !mediaUniqueMap.has(mediaId)
                ) {
                  mediaUniqueMap.set(mediaId, true);

                  await insert(mediaIndex, {
                    id: mediaId,
                    title: mediaTitle,
                    popularity: media?.node.popularity,
                  });

                  console.log(`indexed 1 media with id:${mediaId}`);
                }

                if (
                  name.length &&
                  !charactersUniqueMap.has(id)
                ) {
                  charactersUniqueMap.set(id, true);

                  await insert(charactersIndex, {
                    id,
                    name,
                    mediaTitle,
                    popularity: media?.node.popularity,
                    role: media.characterRole,
                  });

                  console.log(`indexed 1 character with id:${id}`);
                }
              }
            }
          }));

          if (pageInfo.hasNextPage) {
            charactersPage += 1;
            continue;
          }

          break;
        } catch (e) {
          // handle the rate limit
          // (see https://anilist.gitbook.io/anilist-apiv2-docs/overview/rate-limiting)
          if (e.message?.includes('Too Many Requests')) {
            console.log('sleeping for a minute...');
            await utils.sleep(60);
            continue;
          }

          throw e;
        }
      }
    }

    if (pageInfo.hasNextPage) {
      mediaPage += 1;
      continue;
    }

    break;
  } catch (e) {
    // handle the rate limit
    // (see https://anilist.gitbook.io/anilist-apiv2-docs/overview/rate-limiting)
    if (e.message?.includes('Too Many Requests')) {
      console.log('sleeping for a minute...');
      await utils.sleep(60);
      continue;
    }

    throw e;
  }
}

await Promise.all([
  Deno.writeTextFile(
    join(dirname, charactersIndexCachePath),
    JSON.stringify({
      data: charactersIndex.data,
      internalDocumentIDStore: charactersIndex.internalDocumentIDStore,
    }),
  ),
  Deno.writeTextFile(
    join(dirname, mediaIndexCachePath),
    JSON.stringify({
      data: mediaIndex.data,
      internalDocumentIDStore: mediaIndex.internalDocumentIDStore,
    }),
  ),
]);

console.log('\n\nwritten caches to disk');
