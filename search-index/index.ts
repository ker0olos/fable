import { green } from '$std/fmt/colors.ts';

import Rating from '~/src/rating.ts';

import packs from '~/src/packs.ts';

import { Mongo } from '~/db/mod.ts';

import { charactersIndexPath, mediaIndexPath } from '~/search-index/mod.ts';

import { create_characters_index, create_media_index } from 'search-index';

import type { DisaggregatedMedia } from '~/src/types.ts';

const mediaMap: Record<string, DisaggregatedMedia> = {};

async function storeMediaIndex(db: Mongo): Promise<void> {
  console.log('starting the creation of the media index...');

  const media = await db.anime.media().find({}).toArray();

  const json = JSON.stringify(media.map((media) => {
    const id = `${media.packId}:${media.id}`;

    mediaMap[id] = media;

    return {
      id,
      title: packs.aliasToArray(media.title),
      popularity: media.popularity,
    };
  }));

  const mediaIndex = create_media_index(json);

  await Deno.writeFile(mediaIndexPath, mediaIndex);

  console.log(green('wrote the media index cache to disk\n'));
}

async function storeCharacterIndex(db: Mongo): Promise<void> {
  console.log('starting the creation of the characters index...');

  const characters = await db.anime.characters().find({}).toArray();

  const json = JSON.stringify(characters.map((character) => {
    const edge = character.media?.[0];
    const media = edge?.mediaId ? mediaMap[edge.mediaId] : undefined;
    const popularity = character.popularity ?? media?.popularity ?? 1000;

    return {
      id: `${character.packId}:${character.id}`,
      name: packs.aliasToArray(character.name),
      mediaId: media ? `${media.packId}:${media.id}` : undefined,
      mediaTitle: media?.title ? packs.aliasToArray(media?.title) : undefined,
      popularity,
      role: edge?.role,
      rating: new Rating({
        popularity,
        role: edge?.role,
      }).stars,
    };
  }));

  const charactersIndex = create_characters_index(json);

  await Deno.writeFile(charactersIndexPath, charactersIndex);

  console.log(green('wrote the characters index cache to disk\n'));
}

if (import.meta.main) {
  // deno-lint-ignore no-non-null-assertion
  const client = new Mongo(Deno.env.get('MONGO_URI')!);

  await storeMediaIndex(client);
  await storeCharacterIndex(client);

  await client.close();
}
