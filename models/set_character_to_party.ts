import {
  Client,
  fql,
  InstanceExpr,
  InventoryExpr,
  MatchExpr,
  NullExpr,
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
    member,
  }: {
    user: UserExpr;
    inventory: InventoryExpr;
    instance: InstanceExpr;
    characterId: StringExpr;
    member: number;
  },
): MatchExpr | NullExpr {
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
          fql.Equals(member, n),
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
        },
      ),
    );
  });
}

export default function (client: Client): (() => Promise<void>)[] {
  return [
    fql.Resolver({
      client,
      name: 'set_character_to_party',
      lambda: (
        userId: string,
        guildId: string,
        characterId: string,
        member: number,
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
              member,
            }),
        );
      },
    }),
  ];
}