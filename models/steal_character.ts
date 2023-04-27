import {
  Client,
  fql,
  InstanceExpr,
  InventoryExpr,
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
} from './get_user_inventory.ts';

import { Character, History } from './add_character_to_inventory.ts';

export function stealCharacter(
  {
    user,
    inventory,
    characterId,
    instance,
  }: {
    user: UserExpr;
    inventory: InventoryExpr;
    characterId: StringExpr;
    instance: InstanceExpr;
  },
): unknown {
  return fql.Let({
    char: fql.Match(
      fql.Index('characters_instance_id'),
      characterId,
      fql.Ref(instance),
    ),
  }, ({ char }) => {
    return fql.If(
      fql.IsNonEmpty(char),
      fql.Let({
        characterRef: fql.Ref(fql.Get(char)),
        target: fql.Get(fql.Select(['data', 'user'], fql.Get(char)) as RefExpr),
        targetInventory: getInventory({
          instance,
          user: fql.Var('target'),
        }),
      }, ({ target, targetInventory, characterRef }) =>
        fql.If(
          fql.Any([
            fql.Equals(
              characterRef,
              fql.Select(
                ['data', 'party', 'member1'],
                targetInventory,
                fql.Null(),
              ),
            ),
            fql.Equals(
              characterRef,
              fql.Select(
                ['data', 'party', 'member2'],
                targetInventory,
                fql.Null(),
              ),
            ),
            fql.Equals(
              characterRef,
              fql.Select(
                ['data', 'party', 'member3'],
                targetInventory,
                fql.Null(),
              ),
            ),
            fql.Equals(
              characterRef,
              fql.Select(
                ['data', 'party', 'member4'],
                targetInventory,
                fql.Null(),
              ),
            ),
            fql.Equals(
              characterRef,
              fql.Select(
                ['data', 'party', 'member5'],
                targetInventory,
                fql.Null(),
              ),
            ),
          ]),
          {
            ok: false,
            error: 'CHARACTER_IN_PARTY',
          },
          fql.Let({
            updatedInventory: fql.Update<Inventory>(
              fql.Ref(inventory),
              {
                characters: fql.Append(
                  characterRef,
                  fql.Select(['data', 'characters'], inventory),
                ),
              },
            ),
            updatedTargetInventory: fql.Update<Inventory>(
              fql.Ref(targetInventory),
              {
                characters: fql.Remove(
                  characterRef,
                  fql.Select(['data', 'characters'], inventory),
                ),
              },
            ),
            updatedCharacter: fql.Update<Character>(
              characterRef,
              {
                user: fql.Ref(user),
                inventory: fql.Ref(inventory),
                history: fql.Append(
                  {
                    steal: {
                      ts: fql.Now(),
                      from: fql.Ref(user),
                      to: fql.Ref(target),
                    },
                  },
                  fql.Select(['data', 'history'], fql.Get(characterRef)),
                ) as unknown as History[],
                nickname: fql.Null(),
                image: fql.Null(),
              },
            ),
          }, () => ({
            ok: true,
          })),
        )),
      {
        ok: false,
        error: 'CHARACTER_NOT_FOUND',
      },
    );
  });
}

export default function (client: Client): {
  indexers?: (() => Promise<void>)[];
  resolvers?: (() => Promise<void>)[];
} {
  return {
    resolvers: [
      fql.Resolver({
        client,
        name: 'steal_character',
        lambda: (userId: string, guildId: string, characterId: string) => {
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
            ({ user, inventory, instance }) =>
              stealCharacter({
                user,
                inventory,
                characterId,
                instance,
              }) as ResponseExpr,
          );
        },
      }),
    ],
  };
}
