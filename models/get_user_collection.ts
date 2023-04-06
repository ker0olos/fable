import { CharacterNode, paginateCharacters } from './find_media.ts';

import { Client, fql, InventoryExpr } from './fql.ts';

import {
  getGuild,
  getInstance,
  getInventory,
  getUser,
} from './get_user_inventory.ts';

export function getCharacterStars(
  { inventory, stars, before, after }: {
    inventory: InventoryExpr;
    stars: number;
    before?: string;
    after?: string;
  },
): CharacterNode {
  return fql.Let({
    characters: fql.Match(
      fql.Index('characters_rating_inventory'),
      stars,
      fql.Ref(inventory),
    ),
    character: paginateCharacters({
      after,
      before,
      // deno-lint-ignore no-non-null-assertion
      afterCursor: fql.Id('character', after!),
      // deno-lint-ignore no-non-null-assertion
      beforeCursor: fql.Id('character', before!),
      afterSelector: ['data', 1],
      beforeSelector: ['data', 0],
    }),
  }, ({ character }) => {
    return {
      character,
      anchor: fql.Select(['id'], character, fql.Null()),
    } as CharacterNode;
  });
}

export function getCharacterMedia(
  { inventory, mediaId, before, after }: {
    inventory: InventoryExpr;
    mediaId: string;
    before?: string;
    after?: string;
  },
): CharacterNode {
  return fql.Let({
    characters: fql.Match(
      fql.Index('characters_media_inventory'),
      mediaId,
      fql.Ref(inventory),
    ),
    character: paginateCharacters({
      after,
      before,
      afterCursor: [
        fql.Select(
          ['data', 'rating'],
          // deno-lint-ignore no-non-null-assertion
          fql.Get(fql.Id('character', after!)),
        ),
        // deno-lint-ignore no-non-null-assertion
        fql.Id('character', after!),
        // deno-lint-ignore no-non-null-assertion
        fql.Id('character', after!),
      ],
      beforeCursor: [
        fql.Select(
          ['data', 'rating'],
          // deno-lint-ignore no-non-null-assertion
          fql.Get(fql.Id('character', before!)),
        ),
        // deno-lint-ignore no-non-null-assertion
        fql.Id('character', before!),
        // deno-lint-ignore no-non-null-assertion
        fql.Id('character', before!),
      ],
      afterSelector: ['data', 1, 1],
      beforeSelector: ['data', 0, 1],
    }),
  }, ({ character }) => {
    return {
      character,
      anchor: fql.Select(['id'], character, fql.Null()),
    } as CharacterNode;
  });
}

export default function (client: Client): {
  indexers?: (() => Promise<void>)[];
  resolvers?: (() => Promise<void>)[];
} {
  return {
    indexers: [
      fql.Indexer({
        client,
        unique: false,
        collection: 'character',
        name: 'characters_rating_inventory',
        terms: [
          { field: ['data', 'rating'] },
          { field: ['data', 'inventory'] },
        ],
      }),
      fql.Indexer({
        client,
        unique: false,
        collection: 'character',
        name: 'characters_media_inventory',
        terms: [
          { field: ['data', 'mediaId'] },
          { field: ['data', 'inventory'] },
        ],
        values: [{ field: ['data', 'rating'], reverse: true }, {
          field: ['ref'],
        }],
      }),
    ],
    resolvers: [
      fql.Resolver({
        client,
        name: 'get_user_stars',
        lambda: (
          userId: string,
          guildId: string,
          stars: number,
          before?: string,
          after?: string,
        ) => {
          return fql.Let(
            {
              user: getUser(userId),
              guild: getGuild(guildId),
              instance: getInstance(fql.Var('guild')),
              inventory: getInventory({
                user: fql.Var('user'),
                instance: fql.Var('instance'),
              }),
            },
            ({ inventory }) =>
              getCharacterStars({
                inventory,
                stars,
                before,
                after,
              }),
          );
        },
      }),
      fql.Resolver({
        client,
        name: 'get_user_media',
        lambda: (
          userId: string,
          guildId: string,
          mediaId: string,
          before?: string,
          after?: string,
        ) => {
          return fql.Let(
            {
              user: getUser(userId),
              guild: getGuild(guildId),
              instance: getInstance(fql.Var('guild')),
              inventory: getInventory({
                user: fql.Var('user'),
                instance: fql.Var('instance'),
              }),
            },
            ({ inventory }) =>
              getCharacterMedia({
                inventory,
                mediaId,
                before,
                after,
              }),
          );
        },
      }),
    ],
  };
}
