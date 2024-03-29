import { join } from '$std/path/mod.ts';

import {
  type Character,
  filter_characters,
  type Media,
  search_characters,
  search_media,
} from 'search-index';

import packs from '~/src/packs.ts';

import { CharacterRole } from '~/src/types.ts';

const dirname = new URL('.', import.meta.url).pathname;

export const mediaIndexPath = join(dirname, 'media_index.bin');
export const charactersIndexPath = join(dirname, 'characters_index.bin');

export const searchMedia = async (
  query: string,
  guildId: string,
): Promise<Media[]> => {
  const list = await packs.all({ guildId });

  const _builtinEnabled = list[0].manifest.id === 'anilist';

  // add community packs content
  // await Promise.all(
  //   list.map(async ({ manifest }) => {
  //     const media = await Promise.all(
  //       (manifest.media?.new ?? [])
  //         .map((media) => (media.packId = manifest.id, media)),
  //     );

  //     await Promise.all(
  //       media.map(async (_media) => {
  //         const title = packs.aliasToArray(_media.title);

  //         await insert(mediaIndex, {
  //           title,
  //           popularity: _media.popularity,
  //           id: `${_media.packId}:${_media.id}`,
  //         });
  //       }),
  //     );
  //   }),
  // );

  const mediaIndex = await Deno.readFile(mediaIndexPath);

  return search_media(query, mediaIndex);
};

export const searchCharacters = async (
  query: string,
  guildId: string,
): Promise<Character[]> => {
  const list = await packs.all({ guildId });

  const _builtinEnabled = list[0].manifest.id === 'anilist';

  // add community packs content
  // await Promise.all(
  //   list.map(async ({ manifest }) => {
  //     const characters = await Promise.all(
  //       (manifest.characters?.new ?? [])
  //         .map((character) => (character.packId = manifest.id, character))
  //         .map(
  //           (character) => packs.aggregate<Character>({ character, guildId }),
  //         ),
  //     );

  //     await Promise.all(
  //       characters.map(async (char) => {
  //         const name = packs.aliasToArray(char.name);

  //         const mediaTitle = char.media?.edges?.length
  //           ? packs.aliasToArray(char.media.edges[0].node.title)
  //           : undefined;

  //         await insert(characterIndex, {
  //           name,
  //           mediaTitle,
  //           popularity: char.popularity ??
  //             char.media?.edges?.[0]?.node.popularity,
  //           id: `${char.packId}:${char.id}`,
  //         });
  //       }),
  //     );
  //   }),
  // );

  const charactersIndex = await Deno.readFile(charactersIndexPath);

  return search_characters(query, charactersIndex);
};

export const filterCharacters = async (
  filter: {
    rating?: number;
    popularity?: { between: [number, number] };
    role?: CharacterRole;
  },
  guildId: string,
): Promise<Character[]> => {
  const list = await packs.all({ guildId });

  const _builtinEnabled = list[0].manifest.id === 'anilist';

  // add community packs content
  // await Promise.all(
  //   list.map(async ({ manifest }) => {
  //     const characters = await Promise.all(
  //       (manifest.characters?.new ?? [])
  //         .map((character) => (character.packId = manifest.id, character))
  //         .map(
  //           (character) => packs.aggregate<Character>({ character, guildId }),
  //         ),
  //     );

  //     await Promise.all(
  //       characters.map(async (char) => {
  //         const name = packs.aliasToArray(char.name);

  //         const mediaTitle = char.media?.edges?.length
  //           ? packs.aliasToArray(char.media.edges[0].node.title)
  //           : undefined;

  //         await insert(characterIndex, {
  //           name,
  //           mediaTitle,
  //           popularity: char.popularity ??
  //             char.media?.edges?.[0]?.node.popularity,
  //           id: `${char.packId}:${char.id}`,
  //         });
  //       }),
  //     );
  //   }),
  // );

  const charactersIndex = await Deno.readFile(charactersIndexPath);

  return filter_characters(
    filter.role,
    filter?.popularity?.between?.[0],
    filter.popularity?.between?.[1],
    filter.rating,
    charactersIndex,
  );
};
