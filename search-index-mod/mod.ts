import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import {
  Character as IndexedCharacter,
  id_mapped_filter_characters,
  Media as IndexedMedia,
  media_mapped_filter_characters,
  search_characters,
  search_media,
} from '@fable-community/search-index';

import packs from '~/src/packs.ts';

import utils from '~/src/utils.ts';

import { readFile } from 'fs/promises';

import Rating from '~/src/rating.ts';

import type { Character, CharacterRole } from '~/src/types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

const mediaIndexPath = join(__dirname, './media_index.bin');
const charactersIndexPath = join(__dirname, './characters_index.bin');

const searchMedia = async (
  query: string,
  guildId: string
): Promise<IndexedMedia[]> => {
  const list = await packs.all({ guildId });

  const anilistEnabled = list.some(({ manifest }) => manifest.id === 'anilist');

  const extra = (
    await Promise.all(
      list.map(async ({ manifest }) => {
        const media = await Promise.all(
          (manifest.media?.new ?? []).map(
            (media) => ((media.packId = manifest.id), media)
          )
        );

        return media.map((_media) => {
          const title = packs.aliasToArray(_media.title);

          return new IndexedMedia(
            `${_media.packId}:${_media.id}`,
            title,
            _media.popularity ?? 0
          );
        });
      })
    )
  ).flat();

  return search_media(
    query,
    anilistEnabled ? await readFile(mediaIndexPath) : undefined,
    extra
  ).filter(({ id }) => {
    if (packs.isDisabled(id, guildId)) {
      return false;
    }

    return true;
  });
};

const searchCharacters = async (
  query: string,
  guildId: string
): Promise<IndexedCharacter[]> => {
  const list = await packs.all({ guildId });

  const anilistEnabled = list.some(({ manifest }) => manifest.id === 'anilist');

  const extra = (
    await Promise.all(
      list.map(async ({ manifest }) => {
        const characters = await Promise.all(
          (manifest.characters?.new ?? [])
            .map((character) => ((character.packId = manifest.id), character))
            .map((character) =>
              packs.aggregate<Character>({ character, guildId })
            )
        );

        return characters.map((char) => {
          const name = packs.aliasToArray(char.name);

          const media = char.media?.edges[0];

          const mediaTitle = media ? packs.aliasToArray(media.node.title) : [];

          return new IndexedCharacter(
            `${char.packId}:${char.id}`,
            `${media?.node.packId}:${media?.node.id}`,
            name,
            mediaTitle,
            char.popularity ?? media?.node.popularity ?? 0,
            0,
            ''
          );
        });
      })
    )
  ).flat();

  return search_characters(
    query,
    anilistEnabled ? await readFile(charactersIndexPath) : undefined,
    extra
  ).filter(({ mediaId }) => {
    if (mediaId && packs.isDisabled(mediaId, guildId)) {
      return false;
    }

    return true;
  });
};

const pool = async (
  filter: {
    rating?: number;
    popularity?: { between: [number, number] };
    role?: CharacterRole;
  },
  guildId: string
): Promise<Map<string, IndexedCharacter[]>> => {
  const list = await packs.all({ guildId });

  const anilistEnabled = list.some(({ manifest }) => manifest.id === 'anilist');

  const extra = (
    await Promise.all(
      list.map(async ({ manifest }) => {
        const characters = await Promise.all(
          (manifest.characters?.new ?? [])
            .map((character) => ((character.packId = manifest.id), character))
            .map((character) =>
              packs.aggregate<Character>({ character, guildId })
            )
        );

        return characters
          .map((char) => {
            const name = packs.aliasToArray(char.name);

            const media = char.media?.edges[0];

            if (!media) return undefined;

            const role = media.role;

            if (!role) return undefined;

            const rating = new Rating(
              char.popularity
                ? { popularity: char.popularity }
                : {
                    role,
                    popularity: media.node.popularity ?? 1000,
                  }
            ).stars;

            return new IndexedCharacter(
              `${char.packId}:${char.id}`,
              `${media.node.packId}:${media.node.id}`,
              name,
              packs.aliasToArray(media.node.title),
              char.popularity ?? media.node.popularity ?? 1000,
              rating,
              role
            );
          })
          .filter(utils.nonNullable);
      })
    )
  ).flat();

  const pool = media_mapped_filter_characters(
    anilistEnabled ? await readFile(charactersIndexPath) : undefined,
    extra,
    filter.role,
    filter?.popularity?.between?.[0],
    filter.popularity?.between?.[1],
    filter.rating
  );

  return pool;
};

const charIdPool = async (
  guildId: string
): Promise<Map<string, IndexedCharacter>> => {
  const list = await packs.all({ guildId });

  const anilistEnabled = list.some(({ manifest }) => manifest.id === 'anilist');

  const extra = (
    await Promise.all(
      list.map(async ({ manifest }) => {
        const characters = await Promise.all(
          (manifest.characters?.new ?? [])
            .map((character) => ((character.packId = manifest.id), character))
            .map((character) =>
              packs.aggregate<Character>({ character, guildId })
            )
        );

        return characters
          .map((char) => {
            const name = packs.aliasToArray(char.name);

            const media = char.media?.edges[0];

            if (!media) return undefined;

            const popularity = char.popularity ?? media.node.popularity ?? 1000;

            const role = media.role;

            if (!role) return undefined;

            const rating = new Rating({ role, popularity }).stars;

            return new IndexedCharacter(
              `${char.packId}:${char.id}`,
              `${media.node.packId}:${media.node.id}`,
              name,
              packs.aliasToArray(media.node.title),
              popularity,
              rating,
              role
            );
          })
          .filter(utils.nonNullable);
      })
    )
  ).flat();

  const pool = id_mapped_filter_characters(
    anilistEnabled ? await readFile(charactersIndexPath) : undefined,
    extra
  );

  return pool;
};

const searchIndex = {
  searchMedia,
  searchCharacters,
  pool,
  charIdPool,
};

export default searchIndex;

export { IndexedCharacter, IndexedMedia };
