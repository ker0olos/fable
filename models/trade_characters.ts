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

export function giveCharacters(
  {
    user,
    target,
    inventory,
    targetInventory,
    giveCharacterId,
    instance,
  }: {
    user: UserExpr;
    target: UserExpr;
    inventory: InventoryExpr;
    targetInventory: InventoryExpr;
    giveCharacterId: StringExpr;
    instance: InstanceExpr;
  },
): unknown {
  return fql.Let({
    giveCharacter: fql.Match(
      fql.Index('characters_instance_id'),
      giveCharacterId,
      fql.Ref(instance),
    ),
  }, ({ giveCharacter }) => {
    return fql.If(
      fql.IsNonEmpty(giveCharacter),
      fql.If(
        fql.Equals(
          fql.Select(['data', 'user'], fql.Get(giveCharacter)),
          fql.Ref(user),
        ),
        fql.Let({
          giveCharacterRef: fql.Ref(fql.Get(giveCharacter)),
          updatedInventory: fql.Update<Inventory>(fql.Ref(inventory), {
            characters: fql.Remove(
              fql.Var('giveCharacterRef'),
              fql.Select(['data', 'characters'], inventory),
            ),
          }),
          //
          updatedTargetInventory: fql.Update<Inventory>(
            fql.Ref(targetInventory),
            {
              characters: fql.Append(
                fql.Var('giveCharacterRef'),
                fql.Select(['data', 'characters'], targetInventory),
              ),
            },
          ),
          updatedCharacter: fql.Update<Character>(
            fql.Var('giveCharacterRef'),
            {
              user: fql.Ref(target),
              inventory: fql.Ref(targetInventory),
              history: fql.Append(
                {
                  from: fql.Ref(user),
                  to: fql.Ref(target),
                } as unknown as RefExpr,
                fql.Select(['data', 'history'], fql.Get(giveCharacter)),
              ) as unknown as History[],
            },
          ),
        }, () => ({
          ok: true,
        })),
        {
          ok: false,
          error: 'CHARACTER_NOT_OWNED',
        },
      ),
      {
        ok: false,
        error: 'CHARACTER_NOT_FOUND',
      },
    );
  });
}

export function tradeCharacters(
  {
    user,
    target,
    inventory,
    targetInventory,
    giveCharacterId,
    takeCharacterId,
    instance,
  }: {
    user: UserExpr;
    target: UserExpr;
    inventory: InventoryExpr;
    targetInventory: InventoryExpr;
    giveCharacterId: StringExpr;
    takeCharacterId: StringExpr;
    instance: InstanceExpr;
  },
): unknown {
  return fql.Let({
    giveCharacter: fql.Match(
      fql.Index('characters_instance_id'),
      giveCharacterId,
      fql.Ref(instance),
    ),
    takeCharacter: fql.Match(
      fql.Index('characters_instance_id'),
      takeCharacterId,
      fql.Ref(instance),
    ),
  }, ({ giveCharacter, takeCharacter }) => {
    return fql.If(
      fql.And(fql.IsNonEmpty(giveCharacter), fql.IsNonEmpty(takeCharacter)),
      fql.If(
        fql.And(
          fql.Equals(
            fql.Select(['data', 'user'], fql.Get(giveCharacter)),
            fql.Ref(user),
          ),
          fql.Equals(
            fql.Select(['data', 'user'], fql.Get(takeCharacter)),
            fql.Ref(target),
          ),
        ),
        fql.Let({
          giveCharacterRef: fql.Ref(fql.Get(giveCharacter)),
          takeCharacterRef: fql.Ref(fql.Get(takeCharacter)),
          updatedInventory: fql.Update<Inventory>(fql.Ref(inventory), {
            characters: fql.Append(
              fql.Var('takeCharacterRef'),
              fql.Remove(
                fql.Var('giveCharacterRef'),
                fql.Select(['data', 'characters'], inventory),
                // deno-lint-ignore no-explicit-any
              ) as any,
            ),
          }),
          //
          updatedTargetInventory: fql.Update<Inventory>(
            fql.Ref(targetInventory),
            {
              characters: fql.Append(
                fql.Var('giveCharacterRef'),
                fql.Remove(
                  fql.Var('takeCharacterRef'),
                  fql.Select(['data', 'characters'], targetInventory),
                  // deno-lint-ignore no-explicit-any
                ) as any,
              ),
            },
          ),
          updatedGiveCharacter: fql.Update<Character>(
            fql.Var('giveCharacterRef'),
            {
              user: fql.Ref(target),
              inventory: fql.Ref(targetInventory),
              history: fql.Append(
                {
                  from: fql.Ref(user),
                  to: fql.Ref(target),
                } as unknown as RefExpr,
                fql.Select(['data', 'history'], fql.Get(giveCharacter)),
              ) as unknown as History[],
            },
          ),
          updatedTakeCharacter: fql.Update<Character>(
            fql.Var('takeCharacterRef'),
            {
              user: fql.Ref(user),
              inventory: fql.Ref(inventory),
              history: fql.Append(
                {
                  from: fql.Ref(target),
                  to: fql.Ref(user),
                } as unknown as RefExpr,
                fql.Select(['data', 'history'], fql.Get(takeCharacter)),
              ) as unknown as History[],
            },
          ),
        }, () => ({
          ok: true,
        })),
        {
          ok: false,
          error: 'CHARACTER_NOT_OWNED',
        },
      ),
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
        name: 'trade_characters',
        lambda: (
          userId: string,
          targetId: string,
          guildId: string,
          giveCharacterId: string,
          takeCharacterId: string,
        ) => {
          return fql.Let(
            {
              user: getUser(userId),
              target: getUser(targetId),
              guild: getGuild(guildId),
              instance: getInstance(fql.Var('guild')),
              inventory: getInventory({
                user: fql.Var('user'),
                instance: fql.Var('instance'),
              }),
              targetInventory: getInventory({
                user: fql.Var('target'),
                instance: fql.Var('instance'),
              }),
            },
            ({ user, target, inventory, targetInventory, instance }) =>
              tradeCharacters({
                user,
                target,
                inventory,
                targetInventory,
                giveCharacterId,
                takeCharacterId,
                instance,
              }) as ResponseExpr,
          );
        },
      }),
      fql.Resolver({
        client,
        name: 'give_characters',
        lambda: (
          userId: string,
          targetId: string,
          guildId: string,
          giveCharacterId: string,
        ) => {
          return fql.Let(
            {
              user: getUser(userId),
              target: getUser(targetId),
              guild: getGuild(guildId),
              instance: getInstance(fql.Var('guild')),
              inventory: getInventory({
                user: fql.Var('user'),
                instance: fql.Var('instance'),
              }),
              targetInventory: getInventory({
                user: fql.Var('target'),
                instance: fql.Var('instance'),
              }),
            },
            ({ user, target, inventory, targetInventory, instance }) =>
              giveCharacters({
                user,
                target,
                inventory,
                targetInventory,
                giveCharacterId,
                instance,
              }) as ResponseExpr,
          );
        },
      }),
    ],
  };
}
