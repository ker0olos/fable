import {
  Client,
  fql,
  InstanceExpr,
  InventoryExpr,
  ResponseExpr,
  StringExpr,
  UserExpr,
} from './fql.ts';

import {
  getGuild,
  getInstance,
  getInventory,
  getUser,
} from './get_user_inventory.ts';

import { Character } from './add_character_to_inventory.ts';

export function giveCharacters(
  {
    user,
    target,
    inventory,
    targetInventory,
    charactersIds,
    instance,
  }: {
    user: UserExpr;
    target: UserExpr;
    inventory: InventoryExpr;
    targetInventory: InventoryExpr;
    charactersIds: StringExpr[];
    instance: InstanceExpr;
  },
): unknown {
  return fql.Let({
    giveCharacters: fql.Map(charactersIds, (id) =>
      fql.Match(
        fql.Index('characters_instance_id'),
        id,
        fql.Ref(instance),
      )),
  }, ({ giveCharacters }) => {
    return fql.If(
      // check exists
      fql.All(fql.Map(giveCharacters, (char) => fql.IsNonEmpty(char))),
      // check ownership
      fql.If(
        fql.All(fql.Map(giveCharacters, (char) =>
          fql.Equals(
            fql.Select(['data', 'user'], fql.Get(char)),
            fql.Ref(user),
          ))),
        fql.Let({
          giveCharactersRefs: fql.Map(
            giveCharacters,
            (char) => fql.Ref(fql.Get(char)),
          ),
        }, ({ giveCharactersRefs }) =>
          fql.If(
            fql.Any(fql.Map(giveCharactersRefs, (characterRef) =>
              fql.Any([
                fql.Equals(
                  characterRef,
                  fql.Select(
                    ['data', 'party', 'member1'],
                    inventory,
                    fql.Null(),
                  ),
                ),
                fql.Equals(
                  characterRef,
                  fql.Select(
                    ['data', 'party', 'member2'],
                    inventory,
                    fql.Null(),
                  ),
                ),
                fql.Equals(
                  characterRef,
                  fql.Select(
                    ['data', 'party', 'member3'],
                    inventory,
                    fql.Null(),
                  ),
                ),
                fql.Equals(
                  characterRef,
                  fql.Select(
                    ['data', 'party', 'member4'],
                    inventory,
                    fql.Null(),
                  ),
                ),
                fql.Equals(
                  characterRef,
                  fql.Select(
                    ['data', 'party', 'member5'],
                    inventory,
                    fql.Null(),
                  ),
                ),
              ]))),
            {
              ok: false,
              error: 'CHARACTER_IN_PARTY',
            },
            fql.Let({
              updatedCharacters: fql.Foreach(
                giveCharactersRefs,
                (characterRef) =>
                  fql.Update<Character>(
                    characterRef,
                    {
                      user: fql.Ref(target),
                      inventory: fql.Ref(targetInventory),
                      nickname: fql.Null(),
                      image: fql.Null(),
                    },
                  ),
              ),
            }, () => ({
              ok: true,
            })),
          )),
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
    giveCharactersIds,
    takeCharactersIds,
    instance,
  }: {
    user: UserExpr;
    target: UserExpr;
    inventory: InventoryExpr;
    targetInventory: InventoryExpr;
    giveCharactersIds: StringExpr[];
    takeCharactersIds: StringExpr[];
    instance: InstanceExpr;
  },
): unknown {
  return fql.Let({
    giveCharacters: fql.Map(giveCharactersIds, (id) =>
      fql.Match(
        fql.Index('characters_instance_id'),
        id,
        fql.Ref(instance),
      )),
    takeCharacters: fql.Map(takeCharactersIds, (id) =>
      fql.Match(
        fql.Index('characters_instance_id'),
        id,
        fql.Ref(instance),
      )),
  }, ({ giveCharacters, takeCharacters }) => {
    return fql.If(
      fql.And(
        fql.All(fql.Map(giveCharacters, (char) => fql.IsNonEmpty(char))),
        fql.All(fql.Map(takeCharacters, (char) => fql.IsNonEmpty(char))),
      ),
      fql.If(
        fql.And(
          fql.All(fql.Map(giveCharacters, (char) =>
            fql.Equals(
              fql.Select(['data', 'user'], fql.Get(char)),
              fql.Ref(user),
            ))),
          fql.All(fql.Map(takeCharacters, (char) =>
            fql.Equals(
              fql.Select(['data', 'user'], fql.Get(char)),
              fql.Ref(target),
            ))),
        ),
        fql.Let({
          giveCharactersRefs: fql.Map(
            giveCharacters,
            (char) => fql.Ref(fql.Get(char)),
          ),
          takeCharactersRefs: fql.Map(
            takeCharacters,
            (char) => fql.Ref(fql.Get(char)),
          ),
        }, ({ giveCharactersRefs, takeCharactersRefs }) =>
          fql.If(
            fql.Or(
              fql.Any(fql.Map(giveCharactersRefs, (characterRef) =>
                fql.Any([
                  fql.Equals(
                    characterRef,
                    fql.Select(
                      ['data', 'party', 'member1'],
                      inventory,
                      fql.Null(),
                    ),
                  ),
                  fql.Equals(
                    characterRef,
                    fql.Select(
                      ['data', 'party', 'member2'],
                      inventory,
                      fql.Null(),
                    ),
                  ),
                  fql.Equals(
                    characterRef,
                    fql.Select(
                      ['data', 'party', 'member3'],
                      inventory,
                      fql.Null(),
                    ),
                  ),
                  fql.Equals(
                    characterRef,
                    fql.Select(
                      ['data', 'party', 'member4'],
                      inventory,
                      fql.Null(),
                    ),
                  ),
                  fql.Equals(
                    characterRef,
                    fql.Select(
                      ['data', 'party', 'member5'],
                      inventory,
                      fql.Null(),
                    ),
                  ),
                ]))),
              fql.Any(fql.Map(takeCharactersRefs, (characterRef) =>
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
                ]))),
            ),
            {
              ok: false,
              error: 'CHARACTER_IN_PARTY',
            },
            fql.Let({
              updatedCharacters: fql.Foreach(
                giveCharactersRefs,
                (characterRef) =>
                  fql.Update<Character>(
                    characterRef,
                    {
                      user: fql.Ref(target),
                      inventory: fql.Ref(targetInventory),
                      nickname: fql.Null(),
                      image: fql.Null(),
                    },
                  ),
              ),
              updatedTakeCharacters: fql.Foreach(
                takeCharactersRefs,
                (characterRef) =>
                  fql.Update<Character>(
                    characterRef,
                    {
                      user: fql.Ref(user),
                      inventory: fql.Ref(inventory),
                      nickname: fql.Null(),
                      image: fql.Null(),
                    },
                  ),
              ),
            }, () => ({
              ok: true,
            })),
          )),
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
        name: 'give_characters',
        lambda: (
          userId: string,
          targetId: string,
          guildId: string,
          charactersIds: string[],
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
                charactersIds,
                instance,
              }) as ResponseExpr,
          );
        },
      }),
      fql.Resolver({
        client,
        name: 'trade_characters',
        lambda: (
          userId: string,
          targetId: string,
          guildId: string,
          giveCharactersIds: string[],
          takeCharactersIds: string[],
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
                giveCharactersIds,
                takeCharactersIds,
                instance,
              }) as ResponseExpr,
          );
        },
      }),
    ],
  };
}
