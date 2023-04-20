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
  TimeExpr,
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
  history: History[];
  inventory: RefExpr;
  instance: RefExpr;
  user: RefExpr;
}

export interface History {
  gacha?: {
    by: RefExpr;
    ts: TimeExpr;
    pool: NumberExpr;
    guaranteed?: NumberExpr;
    sacrifices?: StringExpr[];
    popularityChance?: NumberExpr;
    popularityGreater?: NumberExpr;
    popularityLesser?: NumberExpr;
    roleChance?: NumberExpr;
    role?: StringExpr;
  };
  trade?: {
    ts: TimeExpr;
    to: UserExpr;
    from: UserExpr;
  };
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
    pool,
    popularityChance,
    popularityGreater,
    popularityLesser,
    roleChance,
    role,
  }: {
    rating: NumberExpr;
    mediaId: StringExpr;
    characterId: StringExpr;
    guaranteed: BooleanExpr;
    inventory: InventoryExpr;
    instance: InstanceExpr;
    user: UserExpr;
    pool: NumberExpr;
    popularityChance?: NumberExpr;
    popularityGreater?: NumberExpr;
    popularityLesser?: NumberExpr;
    roleChance?: NumberExpr;
    role?: StringExpr;
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
                history: [
                  {
                    gacha: {
                      ts: fql.Now(),
                      by: fql.Ref(user),
                      guaranteed: fql.If(
                        fql.Equals(guaranteed, true),
                        rating,
                        fql.Null(),
                      ),
                      popularityChance,
                      popularityGreater,
                      popularityLesser,
                      roleChance,
                      role,
                      pool,
                    },
                  },
                ],
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
                characters: fql.Append(
                  fql.Ref(fql.Var('createdCharacter')),
                  fql.Select(['data', 'characters'], inventory, []),
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
                  (user) => fql.Select(['data', 'id'], fql.Get(user)),
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
          pool: number,
          popularityChance: number,
          popularityGreater: number,
          popularityLesser?: number,
          roleChance?: number,
          role?: string,
        ) => {
          return fql.Let(
            {
              user: getUser(userId),
              guild: getGuild(guildId),
              instance: getInstance(fql.Var('guild')),
              _inventory: getInventory({
                user: fql.Var('user'),
                instance: fql.Var('instance'),
              }),
              inventory: rechargePulls({
                inventory: fql.Var('_inventory'),
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
                pool,
                popularityChance,
                popularityGreater,
                popularityLesser,
                roleChance,
                role,
              }),
          );
        },
      }),
    ],
  };
}
