import {
  Client,
  fql,
  InstanceExpr,
  ManifestExpr,
  RefExpr,
  ResponseExpr,
  StringExpr,
  TimeExpr,
  UserExpr,
} from './fql.ts';

import {
  getGuild,
  getInstance,
  getUser,
  Instance,
} from './get_user_inventory.ts';

export interface Manifest {
  id: StringExpr;
}

export interface Pack {
  id: StringExpr;
  instances: RefExpr[];
  manifest: ManifestExpr;
  installedBy: RefExpr;
  firstInstall: TimeExpr;
  lastInstall: TimeExpr;
}

export function addPack(
  {
    user,
    instance,
    githubId,
    manifest,
  }: {
    user: UserExpr;
    instance: InstanceExpr;
    githubId: StringExpr;
    manifest: ManifestExpr;
  },
): ResponseExpr {
  return fql.Let({
    match: fql.Match(
      fql.Index('pack_github_id'),
      githubId,
    ),
    pack: fql.If(
      fql.IsNonEmpty(fql.Var('match')),
      fql.Get(fql.Var('match')),
      fql.Create<Pack>('pack', {
        manifest,
        id: githubId,
        instances: [],
        installedBy: fql.Ref(user),
        firstInstall: fql.Now(),
        lastInstall: fql.Now(),
      }),
    ),
  }, ({ pack }) =>
    fql.If(
      fql.Equals(
        // old manifest id
        fql.Select(['data', 'manifest', 'id'], pack),
        // new manifest id
        fql.Select(['id'], manifest),
      ),
      fql.Let(
        {
          // update the instance
          updatedInstance: fql.If(
            // if the pack already exists in the packs list
            // don't re-add it
            fql.Includes(
              fql.Ref(pack),
              fql.Select(['data', 'packs'], instance),
            ),
            instance,
            fql.Update<Instance>(fql.Ref(instance), {
              packs: fql.Append(
                fql.Ref(pack),
                fql.Select(['data', 'packs'], instance),
              ),
            }),
          ),
          // update the pack
          updatePack: fql.Update<Pack>(fql.Ref(pack), {
            manifest,
            instances: fql.If(
              // if the instance already exists in the instance list
              // don't re-add it
              fql.Includes(
                fql.Ref(instance),
                fql.Select(['data', 'instances'], pack),
              ),
              fql.Select(['data', 'instances'], pack),
              fql.Append(
                fql.Ref(instance),
                fql.Select(['data', 'instances'], pack),
              ),
            ),
          }),
        },
        () => ({
          ok: true,
        }),
      ),
      { ok: false, error: 'PACK_ID_CHANGED' },
    ));
}

export default function (client: Client): {
  indexers?: (() => Promise<void>)[];
  resolvers?: (() => Promise<void>)[];
} {
  return {
    indexers: [
      fql.Indexer({
        client,
        unique: true,
        collection: 'pack',
        name: 'pack_github_id',
        terms: [{ field: ['data', 'id'] }],
      }),
      fql.Indexer({
        client,
        unique: true,
        collection: 'pack',
        name: 'pack_manifest_id',
        terms: [{ field: ['data', 'manifest', 'id'] }],
      }),
    ],
    resolvers: [
      fql.Resolver({
        client,
        name: 'add_pack_to_instance',
        lambda: (
          userId: StringExpr,
          guildId: StringExpr,
          githubId: StringExpr,
          manifest: ManifestExpr,
        ) => {
          return fql.Let(
            {
              user: getUser(userId),
              guild: getGuild(guildId),
              instance: getInstance(fql.Var('guild')),
            },
            ({ user, instance }) =>
              addPack({
                user,
                instance,
                githubId,
                manifest,
              }),
          );
        },
      }),
    ],
  };
}
