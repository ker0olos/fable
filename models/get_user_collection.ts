import {
  CharacterExpr,
  Client,
  fql,
  InventoryExpr,
  StringExpr,
} from './fql.ts';

import {
  getGuild,
  getInstance,
  getInventory,
  getUser,
} from './get_user_inventory.ts';

export interface CharacterNode {
  character: CharacterExpr;
  anchor: StringExpr;
}

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
    character: fql.If(
      fql.IsNonEmpty(fql.Var('characters')),
      fql.If(
        fql.IsNull(before),
        fql.If(
          fql.IsNull(after),
          fql.Ref(fql.Get(fql.Var('characters'))),
          fql.Let({
            // after returns itself then a new item
            match: fql.Paginate(fql.Var('characters'), {
              // deno-lint-ignore no-non-null-assertion
              after: fql.Id('character', after!),
              size: 2,
            }),
          }, ({ match }) => {
            return fql.Select(
              ['data', 1],
              match,
              // or first item
              fql.Ref(fql.Get(fql.Var('characters'))),
            );
          }),
        ),
        fql.Let({
          // before doesn't return itself
          match: fql.Paginate(fql.Var('characters'), {
            // deno-lint-ignore no-non-null-assertion
            before: fql.Id('character', before!),
            size: 1,
          }),
        }, ({ match }) => {
          return fql.Select(
            ['data', 0],
            match,
            // or last item
            fql.Ref(fql.Get(fql.Reverse(fql.Var('characters')))),
          );
        }),
      ),
      fql.Null(),
    ),
  }, ({ character }) => {
    return {
      character,
      anchor: fql.Select(['id'], character, fql.Null()),
    };
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
    character: fql.If(
      fql.IsNonEmpty(fql.Var('characters')),
      fql.If(
        fql.IsNull(before),
        fql.If(
          fql.IsNull(after),
          fql.Ref(fql.Get(fql.Var('characters'))),
          fql.Let({
            // after returns itself then a new item
            match: fql.Paginate(fql.Var('characters'), {
              after: [
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
              size: 2,
            }),
          }, ({ match }) => {
            return fql.Select(
              ['data', 1, 1],
              match,
              // or first item
              fql.Ref(fql.Get(fql.Var('characters'))),
            );
          }),
        ),
        fql.Let({
          // before doesn't return itself
          match: fql.Paginate(fql.Var('characters'), {
            before: [
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
            size: 1,
          }),
        }, ({ match }) => {
          return fql.Select(
            ['data', 0, 1],
            match,
            // or last item
            fql.Ref(fql.Get(fql.Reverse(fql.Var('characters')))),
          );
        }),
      ),
      fql.Null(),
    ),
  }, ({ character }) => {
    return {
      character,
      anchor: fql.Select(['id'], character, fql.Null()),
    };
  });
}

export default function (client: Client): (() => Promise<void>)[] {
  return [
    fql.Indexer({
      client,
      unique: false,
      collection: 'character',
      name: 'characters_rating_inventory',
      terms: [{ field: ['data', 'rating'] }, { field: ['data', 'inventory'] }],
    }),
    fql.Indexer({
      client,
      unique: false,
      collection: 'character',
      name: 'characters_media_inventory',
      terms: [{ field: ['data', 'mediaId'] }, { field: ['data', 'inventory'] }],
      values: [{ field: ['data', 'rating'], reverse: true }, {
        field: ['ref'],
      }],
    }),
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
  ];
}
