import { Character } from './add_character_to_inventory.ts';

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

export function replaceCharacters(
  {
    rating,
    mediaId,
    characterId,
    inventory,
    instance,
    user,
    sacrifices,
  }: {
    rating: NumberExpr;
    mediaId: StringExpr;
    characterId: StringExpr;
    inventory: InventoryExpr;
    instance: InstanceExpr;
    user: UserExpr;
    sacrifices: StringExpr[];
  },
): ResponseExpr {
  return fql.Let({
    match: fql.Match(
      fql.Index('characters_instance_id'),
      characterId,
      fql.Ref(instance),
    ),
    sacrificedCharacters: fql.Map(sacrifices, (id) =>
      fql.Match(
        fql.Index('characters_instance_id'),
        id,
        fql.Ref(instance),
      )),
  }, ({ match, sacrificedCharacters }) =>
    fql.If(
      fql.All(fql.Map(sacrificedCharacters, (char) =>
        fql.Equals(
          fql.Select(['data', 'user'], fql.Get(char)),
          fql.Ref(user),
        ))),
      fql.If(
        fql.IsEmpty(match),
        fql.Let(
          {
            sacrificedCharactersRefs: fql.Map(
              sacrificedCharacters,
              (char) => fql.Ref(fql.Get(char)),
            ),
            deletedCharacters: fql.Foreach(
              fql.Var<RefExpr[]>('sacrificedCharactersRefs'),
              fql.Delete,
            ),
            createdCharacter: fql.Create<Character>('character', {
              rating,
              mediaId,
              id: characterId,
              inventory: fql.Ref(inventory),
              instance: fql.Ref(instance),
              user: fql.Ref(user),
            }),
            updatedInventory: fql.Update<Inventory>(fql.Ref(inventory), {
              lastPull: fql.Now(),
              rechargeTimestamp: fql.Select(
                ['data', 'rechargeTimestamp'],
                inventory,
                fql.Now(),
              ),
            }),
          },
          ({ updatedInventory, createdCharacter }) => ({
            ok: true,
            inventory: fql.Ref(updatedInventory),
            character: fql.Ref(createdCharacter),
          }),
        ),
        { ok: false, error: 'CHARACTER_EXISTS' },
      ),
      {
        ok: false,
        error: 'CHARACTER_NOT_OWNED',
        inventory: fql.Ref(inventory),
      },
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
        name: 'replace_characters',
        lambda: (
          userId: string,
          guildId: string,
          characterId: string,
          mediaId: string,
          rating: number,
          sacrifices: string[],
        ) => {
          return fql.Let(
            {
              user: getUser(userId),
              guild: getGuild(guildId),
              instance: getInstance(fql.Var('guild')),
              inventory: rechargePulls({
                inventory: getInventory({
                  user: fql.Var('user'),
                  instance: fql.Var('instance'),
                }),
              }),
            },
            ({ inventory, instance, user }) =>
              replaceCharacters({
                rating,
                mediaId,
                characterId,
                inventory,
                instance,
                user,
                sacrifices,
              }),
          );
        },
      }),
    ],
  };
}
