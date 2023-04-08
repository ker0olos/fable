import {
  BooleanExpr,
  Client,
  fql,
  InstanceExpr,
  InventoryExpr,
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
  nickname?: string;
  image?: string;
  history: History[];
  inventory: RefExpr;
  instance: RefExpr;
  user: RefExpr;
}

export interface History {
  gacha?: {
    by: RefExpr;
    pool: NumberExpr;
    guaranteed: NumberExpr;
    popularityChance?: NumberExpr;
    popularityGreater?: NumberExpr;
    popularityLesser?: NumberExpr;
    roleChance?: NumberExpr;
    role?: StringExpr;
  };
}

export function addGuarantee(
  {
    user,
    guarantee,
  }: {
    user: UserExpr;
    guarantee: NumberExpr;
  },
): ResponseExpr {
  return fql.Let(
    {
      updatedUser: fql.Update<User>(fql.Ref(user), {
        guarantees: fql.Append(
          guarantee,
          fql.Select(['data', 'guarantees'], user, []),
        ),
      }),
    },
    ({ updatedUser }) =>
      ({
        ok: true,
        user: fql.Ref(updatedUser),
      }) as unknown as ResponseExpr,
  );
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
                      pool,
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
    resolvers: [
      fql.Resolver({
        client,
        name: 'add_guarantee_to_user',
        lambda: (
          userId: string,
          guarantee: number,
        ) => {
          return fql.Let(
            {
              user: getUser(userId),
            },
            ({ user }) =>
              addGuarantee({
                user,
                guarantee,
              }),
          );
        },
      }),
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
