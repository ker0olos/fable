import { join } from '$std/path/mod.ts';

import {
  Character as IndexedCharacter,
  filter_characters,
  Media as IndexedMedia,
  search_characters,
  search_media,
} from 'search-index';

import packs from '~/src/packs.ts';

import utils from '~/src/utils.ts';

import Rating from '~/src/rating.ts';

import type { Character, CharacterRole } from '~/src/types.ts';

const dirname = new URL('.', import.meta.url).pathname;

export const mediaIndexPath = join(dirname, 'media_index.bin');
export const charactersIndexPath = join(dirname, 'characters_index.bin');

export const searchMedia = async (
  query: string,
  guildId: string,
): Promise<IndexedMedia[]> => {
  const list = await packs.all({ guildId });

  const builtin = list[0].manifest.id === 'anilist';

  const extra = (await Promise.all(
    list.map(async ({ manifest }) => {
      const media = await Promise.all(
        (manifest.media?.new ?? [])
          .map((media) => (media.packId = manifest.id, media)),
      );

      return media.map((_media) => {
        const title = packs.aliasToArray(_media.title);

        return new IndexedMedia(
          `${_media.packId}:${_media.id}`,
          title,
          _media.popularity ?? 0,
        );
      });
    }),
  )).flat();

  return search_media(
    query,
    builtin ? await Deno.readFile(mediaIndexPath) : undefined,
    extra,
  );
};

export const searchCharacters = async (
  query: string,
  guildId: string,
): Promise<IndexedCharacter[]> => {
  const list = await packs.all({ guildId });

  const builtin = list[0].manifest.id === 'anilist';

  const extra = (await Promise.all(
    list.map(async ({ manifest }) => {
      const characters = await Promise.all(
        (manifest.characters?.new ?? [])
          .map((character) => (character.packId = manifest.id, character))
          .map(
            (character) => packs.aggregate<Character>({ character, guildId }),
          ),
      );

      return characters.map((char) => {
        const name = packs.aliasToArray(char.name);

        const mediaTitle = char.media?.edges?.length
          ? packs.aliasToArray(char.media.edges[0].node.title)
          : [];

        return new IndexedCharacter(
          `${char.packId}:${char.id}`,
          name,
          mediaTitle,
          char.popularity ??
            char.media?.edges?.[0]?.node.popularity ?? 0,
          0,
          '',
        );
      });
    }),
  )).flat();

  return search_characters(
    query,
    builtin ? await Deno.readFile(charactersIndexPath) : undefined,
    extra,
  );
};

export const filterCharacters = async (
  filter: {
    rating?: number;
    popularity?: { between: [number, number] };
    role?: CharacterRole;
  },
  guildId: string,
): Promise<IndexedCharacter[]> => {
  const list = await packs.all({ guildId });

  const builtin = list[0].manifest.id === 'anilist';

  const extra = (await Promise.all(
    list.map(async ({ manifest }) => {
      const characters = await Promise.all(
        (manifest.characters?.new ?? [])
          .map((character) => (character.packId = manifest.id, character))
          .map(
            (character) => packs.aggregate<Character>({ character, guildId }),
          ),
      );

      return characters.map((char) => {
        const name = packs.aliasToArray(char.name);

        const media = char.media?.edges[0];

        if (!media) return undefined;

        const popularity = char.popularity ?? media.node.popularity;

        if (!popularity) return undefined;

        const role = media.role;

        if (!role) return undefined;

        const rating = new Rating({ role, popularity }).stars;

        return new IndexedCharacter(
          `${char.packId}:${char.id}`,
          name,
          packs.aliasToArray(media.node.title),
          popularity,
          rating,
          role,
        );
      }).filter(utils.nonNullable);
    }),
  )).flat();

  return filter_characters(
    builtin ? await Deno.readFile(charactersIndexPath) : undefined,
    extra,
    filter.role,
    filter?.popularity?.between?.[0],
    filter.popularity?.between?.[1],
    filter.rating,
  );
};

export { IndexedCharacter, IndexedMedia };
