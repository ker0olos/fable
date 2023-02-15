import {
  Client,
  fql,
  InstanceExpr,
  MatchExpr,
  NullExpr,
  StringExpr,
} from './fql.ts';

import { getGuild, getInstance } from './get_user_inventory.ts';

export function findCharacter(
  {
    characterId,
    instance,
  }: {
    characterId: StringExpr;
    instance: InstanceExpr;
  },
): MatchExpr | NullExpr {
  return fql.Let({
    match: fql.Match(
      fql.Index('characters_instance_id'),
      characterId,
      fql.Ref(instance),
    ),
  }, ({ match }) =>
    fql.If(
      fql.IsNonEmpty(match),
      fql.Get(match),
      fql.Null(),
    ));
}

export default function (client: Client): (() => Promise<void>)[] {
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
      name: 'find_character',
      lambda: (
        characterId: string,
        guildId: string,
      ) => {
        return fql.Let(
          {
            guild: getGuild(guildId),
            instance: getInstance(fql.Var('guild')),
          },
          ({ instance }) =>
            findCharacter({
              characterId,
              instance,
            }),
        );
      },
    }),
  ];
}
