import {
  BooleanExpr,
  Client,
  fql,
  InstanceExpr,
  InventoryExpr,
  NullExpr,
  NumberExpr,
  RefExpr,
  ResponseExpr,
  StringExpr,
  UserExpr,
} from './fql.ts';

import {
  getGuild,
  getInstance,
  getInventory,
  getUser,
  Inventory,
  rechargePulls,
  User,
} from './get_user_inventory.ts';

export interface Character {
  id: StringExpr;
  mediaId: StringExpr;
  rating: NumberExpr;
  nickname?: string | NullExpr;
  image?: string | NullExpr;
  inventory: RefExpr;
  instance: RefExpr;
  user: RefExpr;
}

export function addCharacter(
  {
    rating,
    mediaId,
    characterId,
    guaranteed,
    inventory,
    instance,
    user,
  }: {
    rating: NumberExpr;
    mediaId: StringExpr;
    characterId: StringExpr;
    guaranteed: BooleanExpr;
    inventory: InventoryExpr;
    instance: InstanceExpr;
    user: UserExpr;
  },
): ResponseExpr {
  return fql.Let({
    match: fql.Match(
      fql.Index('characters_instance_id'),
      characterId,
      fql.Ref(instance),
    ),
  }, ({ match }) =>
    fql.If(
      fql.LTE(fql.Select(['data', 'availablePulls'], inventory), 0),
      {
        ok: false,
        error: 'NO_PULLS_AVAILABLE',
        inventory: fql.Ref(inventory),
      },
      fql.If(
        fql.IsNonEmpty(match),
        { ok: false, error: 'CHARACTER_EXISTS' },
        fql.If(
          fql.Or(
            fql.Equals(guaranteed, false),
            fql.Includes(
              rating,
              fql.Select(['data', 'guarantees'], user, []),
            ),
          ),
          fql.Let(
            {
              createdCharacter: fql.Create<Character>('character', {
                rating,
                mediaId,
                id: characterId,
                inventory: fql.Ref(inventory),
                instance: fql.Ref(instance),
                user: fql.Ref(user),
              }),

              // update the user
              updatedUser: fql.If(
                fql.Equals(guaranteed, true),
                fql.Update<User>(fql.Ref(user), {
                  guarantees: fql.Remove(
                    rating,
                    fql.Select(['data', 'guarantees'], user),
                  ),
                }),
                user,
              ),
              // update the inventory
              updatedInventory: fql.Update<Inventory>(fql.Ref(inventory), {
                lastPull: fql.Now(),
                rechargeTimestamp: fql.Select(
                  ['data', 'rechargeTimestamp'],
                  inventory,
                  fql.Now(),
                ),
                availablePulls: fql.Subtract(
                  fql.Select(['data', 'availablePulls'], inventory),
                  1,
                ),
              }),
            },
            ({ updatedInventory, createdCharacter }) => ({
              ok: true,
              inventory: fql.Ref(updatedInventory),
              character: fql.Ref(createdCharacter),
              likes: fql.Select(
                ['data'],
                fql.Map(
                  fql.Paginate(
                    fql.Match(
                      fql.Index('users_likes_character'),
                      characterId,
                    ),
                    {},
                  ),
                  (user) =>
                    fql.Select(['data', 'id'], fql.Get(user as UserExpr)),
                ),
              ),
            }),
          ),
          {
            ok: false,
            error: 'NO_GUARANTEES',
            user: fql.Ref(user),
          },
        ),
      ),
    ));
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
        collection: 'user',
        name: 'users_likes_character',
        terms: [{ field: ['data', 'likes'] }],
      }),
    ],
    resolvers: [
      fql.Resolver({
        client,
        name: 'add_character_to_inventory',
        lambda: (
          userId: string,
          guildId: string,
          characterId: string,
          mediaId: string,
          guaranteed: boolean,
          rating: number,
        ) => {
          return fql.Let(
            {
              user: getUser(userId),
              guild: getGuild(guildId),
              instance: getInstance(fql.Var('guild')),
              inventory: rechargePulls({
                inventory: getInventory({
                  user: fql.Var('user'),
                  instance: fql.Var('instance'),
                }),
              }),
            },
            ({ inventory, instance, user }) =>
              addCharacter({
                rating,
                mediaId,
                characterId,
                guaranteed,
                inventory,
                instance,
                user,
              }),
          );
        },
      }),
    ],
  };
}
