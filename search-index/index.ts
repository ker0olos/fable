/// <reference lib="deno.unstable" />

import { green } from '$std/fmt/colors.ts';

import Rating from '~/src/rating.ts';

import utils from '~/src/utils.ts';

import { gql, request } from '~/packs/anilist/graphql.ts';

import { AniListCharacter, AniListMedia } from '~/packs/anilist/types.ts';

import { charactersIndexPath, mediaIndexPath } from '~/search-index/mod.ts';

import {
  type Character,
  create_characters_index,
  create_media_index,
  type Media,
} from 'search-index';

const anilistAPI = 'https://graphql.anilist.co';

type PageInfo = {
  hasNextPage: boolean;
};

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

async function queryAniList(kv: Deno.Kv): Promise<void> {
  let mediaPage = 1;

  console.log('starting requests from anilist...');

  while (true) {
    try {
      console.log(`requesting page ${mediaPage} from anilist`);

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
                    media?.node?.id && mediaTitle?.length
                  ) {
                    await kv.set(
                      ['media', mediaId],
                      {
                        id: mediaId,
                        title: mediaTitle,
                        popularity: media?.node.popularity,
                      },
                    );
                  }

                  if (
                    name.length
                  ) {
                    await kv.set(
                      ['characters', id],
                      {
                        id,
                        name,
                        mediaId,
                        mediaTitle,
                        popularity: media?.node.popularity,
                        role: media.characterRole,
                        rating: new Rating({
                          role: media.characterRole,
                          popularity: media?.node.popularity,
                        }).stars,
                      },
                    );
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
              // console.log('sleeping for a minute...');
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

  console.log(green('finished requests from anilist\n'));
}

async function storeMediaIndex(kv: Deno.Kv): Promise<void> {
  console.log('starting the creation of the media index...');

  const media = await Array.fromAsync(kv.list<Media>({
    prefix: ['media'],
  }));

  const mediaIndex = create_media_index(
    JSON.stringify(media.map(({ value }) => value)),
  );

  await Deno.writeFile(mediaIndexPath, mediaIndex);

  console.log(green('wrote the media index cache to disk\n'));
}

async function storeCharacterIndex(kv: Deno.Kv): Promise<void> {
  console.log('starting the creation of the characters index...');

  const media = await Array.fromAsync(kv.list<Character>({
    prefix: ['characters'],
  }));

  const charactersIndex = create_characters_index(
    JSON.stringify(media.map(({ value }) => value)),
  );

  await Deno.writeFile(charactersIndexPath, charactersIndex);

  console.log(green('wrote the characters index cache to disk\n'));
}

if (import.meta.main) {
  const kv = await Deno.openKv('search-index.sqlite');

  await queryAniList(kv);
  await storeMediaIndex(kv);
  await storeCharacterIndex(kv);

  kv.close();
}
