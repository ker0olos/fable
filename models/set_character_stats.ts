import {
  Client,
  fql,
  InstanceExpr,
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

export function setCharacterStats(
  {
    user,
    instance,
    characterId,
    unclaimed,
    strength,
    stamina,
    agility,
  }: {
    user: UserExpr;
    instance: InstanceExpr;
    characterId: StringExpr;
    unclaimed?: number;
    strength?: number;
    stamina?: number;
    agility?: number;
  },
): ResponseExpr {
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
  }, ({ character }) =>
    fql.If(
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
          updatedCharacter: fql.Update<Character>(fql.Ref(character), {
            combat: {
              stats: {
                unclaimed: fql.If(
                  fql.Equals(unclaimed, fql.Null()),
                  fql.Select(
                    ['data', 'combat', 'stats', 'unclaimed'],
                    character,
                    0,
                  ),
                  // deno-lint-ignore no-non-null-assertion
                  unclaimed!,
                ),
                strength: fql.If(
                  fql.Equals(strength, fql.Null()),
                  fql.Select(
                    ['data', 'combat', 'stats', 'strength'],
                    character,
                    0,
                  ),
                  // deno-lint-ignore no-non-null-assertion
                  strength!,
                ),
                stamina: fql.If(
                  fql.Equals(stamina, fql.Null()),
                  fql.Select(
                    ['data', 'combat', 'stats', 'stamina'],
                    character,
                    0,
                  ),
                  // deno-lint-ignore no-non-null-assertion
                  stamina!,
                ),
                agility: fql.If(
                  fql.Equals(agility, fql.Null()),
                  fql.Select(
                    ['data', 'combat', 'stats', 'agility'],
                    character,
                    0,
                  ),
                  // deno-lint-ignore no-non-null-assertion
                  agility!,
                ),
              },
            },
          }),
        }, ({ updatedCharacter }) => ({
          ok: true,
          character: fql.Ref(updatedCharacter),
        })),
        {
          ok: false,
          error: 'CHARACTER_NOT_OWNED',
          character: fql.Ref(character),
        },
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
        name: 'set_character_stats',
        lambda: (
          userId: string,
          guildId: string,
          characterId: string,
          unclaimed: number,
          strength?: number,
          stamina?: number,
          agility?: number,
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
            ({ user, instance }) =>
              setCharacterStats({
                user,
                instance,
                characterId,
                unclaimed,
                strength,
                stamina,
                agility,
              }),
          );
        },
      }),
    ],
  };
}
