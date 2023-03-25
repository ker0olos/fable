import {
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
    popularityChance: NumberExpr;
    popularityGreater: NumberExpr;
    popularityLesser?: NumberExpr;
    roleChance?: NumberExpr;
    role?: StringExpr;
  };
}

export function addCharacter(
  {
    rating,
    mediaId,
    characterId,
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
    inventory: InventoryExpr;
    instance: InstanceExpr;
    user: UserExpr;
    pool: NumberExpr;
    popularityChance: NumberExpr;
    popularityGreater: NumberExpr;
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
                    by: fql.Ref(user),
                    pool,
                    popularityChance,
                    popularityGreater,
                    popularityLesser,
                    roleChance,
                    role,
                  },
                },
              ],
            }),
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
                fql.Select(['data', 'characters'], inventory),
              ),
            }),
          },
          ({ createdCharacter }) => ({
            ok: true,
            inventory: fql.Ref(inventory),
            character: fql.Ref(createdCharacter),
          }),
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
        name: 'add_character_to_inventory',
        lambda: (
          userId: string,
          guildId: string,
          characterId: string,
          mediaId: string,
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
