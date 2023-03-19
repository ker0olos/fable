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
  Inventory,
} from './get_user_inventory.ts';

export function setCharacterToParty(
  {
    user,
    inventory,
    instance,
    characterId,
    spot,
  }: {
    user: UserExpr;
    inventory: InventoryExpr;
    instance: InstanceExpr;
    characterId: StringExpr;
    spot?: number;
  },
): unknown {
  return fql.Let({
    _match: fql.Match(
      fql.Index('characters_instance_id'),
      characterId,
      fql.Ref(instance),
    ),
    character: fql.If(
      fql.IsNonEmpty(fql.Var('_match')),
      fql.Get(fql.Var('_match')),
      fql.Null(),
    ),
  }, ({ character }) => {
    const getMember = (n: 1 | 2 | 3 | 4 | 5) => {
      return fql.If( // if character is already assigned to the party
        fql.Equals(
          fql.Select(['data', 'party', `member${n}`], inventory, fql.Null()),
          fql.Ref(character),
        ),
        fql.Null(), // if true unassign the character
        fql.Select(['data', 'party', `member${n}`], inventory, fql.Null()),
      );
    };

    const updateParty = (n: 1 | 2 | 3 | 4 | 5, opts?: {
      initial?: Inventory['party'];
    }) => {
      return fql.Merge(
        opts?.initial ?? fql.Var(`member${n - 1}`),
        fql.If(
          fql.Equals(fql.Var('spot'), n),
          { [`member${n}`]: fql.Ref(character) },
          {},
        ),
      );
    };

    return fql.If(
      fql.IsNull(character),
      {
        ok: false,
        error: 'CHARACTER_NOT_FOUND',
      },
      fql.If(
        fql.Equals( // if user does own the character
          fql.Select(['data', 'user'], character),
          fql.Ref(user),
        ),
        fql.Let({
          spot: fql.If(
            fql.IsNull(spot),
            fql.If(
              fql.IsNull(
                fql.Select(['data', 'party', 'member1'], inventory, fql.Null()),
              ),
              1,
              fql.If(
                fql.IsNull(
                  fql.Select(
                    ['data', 'party', 'member2'],
                    inventory,
                    fql.Null(),
                  ),
                ),
                2,
                fql.If(
                  fql.IsNull(
                    fql.Select(
                      ['data', 'party', 'member3'],
                      inventory,
                      fql.Null(),
                    ),
                  ),
                  3,
                  fql.If(
                    fql.IsNull(
                      fql.Select(
                        ['data', 'party', 'member4'],
                        inventory,
                        fql.Null(),
                      ),
                    ),
                    4,
                    5,
                  ),
                ),
              ),
            ),
            // deno-lint-ignore no-non-null-assertion
            spot!,
          ),
          member1: updateParty(1, {
            initial: {
              member1: getMember(1),
              member2: getMember(2),
              member3: getMember(3),
              member4: getMember(4),
              member5: getMember(5),
            },
          }),
          member2: updateParty(2),
          member3: updateParty(3),
          member4: updateParty(4),
          member5: updateParty(5),
          updatedInventory: fql.Update<Inventory>(fql.Ref(inventory), {
            // deno-lint-ignore no-explicit-any
            party: fql.Var('member5') as any,
          }),
        }, ({ updatedInventory }) => ({
          ok: true,
          inventory: fql.Ref(updatedInventory),
          character: fql.Ref(character),
        })),
        {
          ok: false,
          error: 'CHARACTER_NOT_OWNED',
          character: fql.Ref(character),
        },
      ),
    );
  });
}

export function swapCharactersInParty(
  {
    inventory,
    a,
    b,
  }: {
    inventory: InventoryExpr;
    a: number;
    b: number;
  },
): unknown {
  const getMember = (n: 1 | 2 | 3 | 4 | 5) => {
    return fql.If(
      fql.Equals(a, n),
      fql.Select(
        ['data', 'party', `member${b}`],
        inventory,
        fql.Null(),
      ),
      fql.If(
        fql.Equals(b, n),
        fql.Select(
          ['data', 'party', `member${a}`],
          inventory,
          fql.Null(),
        ),
        fql.Select(
          ['data', 'party', `member${n}`],
          inventory,
          fql.Null(),
        ),
      ),
    );
  };

  return fql.Let({
    party: {
      member1: getMember(1),
      member2: getMember(2),
      member3: getMember(3),
      member4: getMember(4),
      member5: getMember(5),
    },
    updatedInventory: fql.Update<Inventory>(fql.Ref(inventory), {
      // deno-lint-ignore no-explicit-any
      party: fql.Var('party') as any,
    }),
  }, ({ updatedInventory }) => ({
    ok: true,
    inventory: fql.Ref(updatedInventory),
  }));
}

export function removeCharacterFromParty(
  {
    inventory,
    spot,
  }: {
    inventory: InventoryExpr;
    spot: number;
  },
): unknown {
  const getMember = (n: 1 | 2 | 3 | 4 | 5) => {
    return fql.If(
      fql.Equals(spot, n),
      fql.Null(),
      fql.Select(
        ['data', 'party', `member${n}`],
        inventory,
        fql.Null(),
      ),
    );
  };

  return fql.Let({
    party: {
      member1: getMember(1),
      member2: getMember(2),
      member3: getMember(3),
      member4: getMember(4),
      member5: getMember(5),
    },
    character: fql.Select(
      ['data', 'party', fql.Concat(['member', fql.ToString(spot)])],
      inventory,
      fql.Null(),
    ),
    updatedInventory: fql.Update<Inventory>(fql.Ref(inventory), {
      // deno-lint-ignore no-explicit-any
      party: fql.Var('party') as any,
    }),
  }, ({ character, updatedInventory }) => ({
    ok: true,
    character,
    inventory: fql.Ref(updatedInventory),
  }));
}

export default function (client: Client): {
  indexers?: (() => Promise<void>)[];
  resolvers?: (() => Promise<void>)[];
} {
  return {
    resolvers: [
      fql.Resolver({
        client,
        name: 'set_character_to_party',
        lambda: (
          userId: string,
          guildId: string,
          characterId: string,
          spot?: number,
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
            ({ user, inventory, instance }) =>
              setCharacterToParty({
                user,
                inventory,
                instance,
                characterId,
                spot,
              }) as ResponseExpr,
          );
        },
      }),
      fql.Resolver({
        client,
        name: 'swap_characters_in_party',
        lambda: (
          userId: string,
          guildId: string,
          a: number,
          b: number,
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
              swapCharactersInParty({
                inventory,
                a,
                b,
              }) as ResponseExpr,
          );
        },
      }),
      fql.Resolver({
        client,
        name: 'remove_character_from_party',
        lambda: (
          userId: string,
          guildId: string,
          spot: number,
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
              removeCharacterFromParty({
                inventory,
                spot,
              }) as ResponseExpr,
          );
        },
      }),
    ],
  };
}
