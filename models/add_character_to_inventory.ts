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
  refillPulls,
} from './get_user_inventory.ts';

export interface Character {
  id: StringExpr;
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
        // deno-lint-ignore no-explicit-any
      } as any,
      fql.If(
        fql.IsNonEmpty(match),
        // deno-lint-ignore no-explicit-any
        { ok: false, error: 'CHARACTER_EXISTS' } as any,
        fql.Let(
          {
            createdCharacter: fql.Create<Character>('character', {
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
          () => ({
            ok: true,
            // deno-lint-ignore no-explicit-any
          } as any),
        ),
      ),
    ));
}

export default function (client: Client): Promise<void>[] {
  return [
    fql.Indexer({
      client,
      unique: true,
      collection: 'character',
      name: 'characters_instance_id',
      terms: [{ field: ['data', 'id'] }, { field: ['data', 'instance'] }],
    }),
    fql.Resolver({
      client,
      name: 'add_character_to_inventory',
      lambda: (
        userId: string,
        guildId: string,
        characterId: string,
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
            inventory: refillPulls({
              inventory: fql.Var('_inventory'),
            }),
          },
          ({ inventory, instance, user }) =>
            addCharacter({
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
  ];
}
