import {
  CharacterExpr,
  Client,
  fql,
  InstanceExpr,
  InventoryExpr,
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

import { Character } from './get_user_characters.ts';

function addCharacter(
  { characterId, inventory, instance, user }: {
    characterId: StringExpr;
    inventory: InventoryExpr;
    instance: InstanceExpr;
    user: UserExpr;
  },
): CharacterExpr {
  return fql.Let({
    match: fql.Match(
      fql.Index('characters_instance_id'),
      characterId,
      fql.Ref(instance),
    ),
  }, ({ match }) =>
    fql.If(
      fql.IsNonEmpty(match),
      // deno-lint-ignore no-explicit-any
      { ok: false, error: 'CHARACTER_EXISTS' } as any,
      fql.If(
        fql.LTE(fql.Select(['data', 'availablePulls'], inventory), 0),
        // deno-lint-ignore no-explicit-any
        { ok: false, error: 'NO_AVAILABLE_PULLS' } as any,
        fql.Let(
          {
            createdCharacter: fql.Create<Character>('character', {
              id: characterId,
              instance: fql.Ref(instance),
              user: fql.Ref(user),
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
      lambda: (userId: string, guildId: string, characterId: string) => {
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
            }),
        );
      },
    }),
  ];
}
