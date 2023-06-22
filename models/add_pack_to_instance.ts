import {
  BooleanExpr,
  Client,
  fql,
  InstanceExpr,
  ManifestExpr,
  NumberExpr,
  PackExpr,
  RefExpr,
  ResponseExpr,
  StringExpr,
  TimeExpr,
} from './fql.ts';

import { getGuild, getInstance, Instance } from './get_user_inventory.ts';

export interface Manifest {
  id: StringExpr;
}

export interface Pack {
  manifest: ManifestExpr;
  added: TimeExpr;
  updated: TimeExpr;
  version: NumberExpr;
  owner: StringExpr;
  approved?: BooleanExpr;
  servers?: NumberExpr;
}

export interface PackInstall {
  ref: RefExpr;
  timestamp: TimeExpr;
  by: StringExpr;
}

export function getPacksByUserId(
  { userId }: { userId: StringExpr },
): PackExpr[] {
  return fql.Let(
    {
      owner: fql.Match(
        fql.Index('packs_owner_user_id'),
        userId,
      ),
      maintainer: fql.Match(
        fql.Index('packs_maintainers_user_id'),
        userId,
      ),
    },
    ({ owner, maintainer }) =>
      fql.Prepend(
        fql.Map<RefExpr, PackExpr>(
          fql.Select(['data'], fql.Paginate(owner, {}), []),
          fql.Get,
        ),
        fql.Map<RefExpr, PackExpr>(
          fql.Select(['data'], fql.Paginate(maintainer, {}), []),
          fql.Get,
        ),
      ),
  );
}

export const getMostInstalledPacks = (): PackExpr[] => {
  return fql.Let({
    packs: fql.Match(fql.Index('packs_sorted_by_server_amount')),
  }, ({ packs }) => {
    return fql.Let({
      page: fql.Paginate<RefExpr>(packs, { size: 100 }),
    }, ({ page }) =>
      fql.Select(
        ['data'],
        fql.Map(
          page,
          (x) => fql.Get(fql.Select([1], x)),
        ),
      ));
  });
};

export function publishPack(
  { manifest, userId }: { manifest: ManifestExpr; userId: StringExpr },
): ResponseExpr {
  return fql.Let({
    match: fql.Match(
      fql.Index('pack_manifest_id'),
      fql.Select(['id'], manifest),
    ),
  }, ({ match }) =>
    fql.If(
      fql.IsNonEmpty(match),
      fql.Let({
        pack: fql.Get<PackExpr>(match),
      }, ({ pack }) =>
        fql.If(
          fql.Or(
            fql.Equals(
              userId,
              fql.Select(['data', 'owner'], pack),
            ),
            fql.Includes(
              userId,
              fql.Select(['data', 'manifest', 'maintainers'], pack, []),
            ),
          ),
          fql.Let({
            updatedPack: fql.Update<Pack>(fql.Ref(pack), {
              version: fql.Add(fql.Select(['data', 'version'], pack), 1),
              updated: fql.Now(),
              manifest,
            }),
          }, ({ updatedPack }) => ({
            ok: true,
            pack: fql.Ref(updatedPack),
          })),
          { ok: false, error: 'PERMISSION_DENIED' },
        )),
      fql.Let({
        createdPack: fql.Create<Pack>('pack', {
          version: 1,
          added: fql.Now(),
          updated: fql.Now(),
          owner: userId,
          manifest,
        }),
      }, ({ createdPack }) => ({
        ok: true,
        pack: fql.Ref(createdPack),
      })),
    ));
}

export function addPack(
  {
    instance,
    packId,
    userId,
  }: {
    instance: InstanceExpr;
    packId: StringExpr;
    userId: StringExpr;
  },
): ResponseExpr {
  return fql.Let({
    match: fql.Match(
      fql.Index('pack_manifest_id'),
      packId,
    ),
  }, ({ match }) =>
    fql.If(
      fql.IsNonEmpty(match),
      fql.If(
        fql.Or(
          fql.Equals(
            false,
            fql.Select(['data', 'manifest', 'private'], fql.Get(match), false),
          ),
          fql.Equals(
            userId,
            fql.Select(['data', 'owner'], fql.Get(match)),
          ),
          fql.Includes(
            userId,
            fql.Select(
              ['data', 'manifest', 'maintainers'],
              fql.Get(match),
              [],
            ),
          ),
        ),
        fql.Let(
          {
            ref: fql.Ref(fql.Get(match)),
            pack: {
              ref: fql.Var('ref'),
              timestamp: fql.Now(),
              by: userId,
            } as PackInstall,
            installed: fql.Includes(
              fql.Var('ref'),
              fql.Map(
                fql.Select<PackExpr[]>(['data', 'packs'], instance),
                (pack) => fql.Select(['ref'], pack),
              ),
            ),
            updatedInstance: fql.If(
              fql.Var('installed'),
              instance,
              fql.Update<Instance>(fql.Ref(instance), {
                packs: fql.Append(
                  fql.Var('pack'),
                  fql.Select(['data', 'packs'], instance),
                ),
              }),
            ),
            updatedPack: fql.If(
              fql.Var('installed'),
              fql.Null(),
              fql.Update<Pack>(fql.Var('ref'), {
                servers: fql.Add(
                  fql.Select(['data', 'servers'], fql.Get(match), 0),
                  1,
                ),
              }),
            ),
          },
          ({ pack }) => ({
            ok: true,
            install: pack,
          }),
        ),
        {
          ok: false,
          error: 'PACK_PRIVATE',
        },
      ),
      {
        ok: false,
        error: 'PACK_NOT_FOUND',
      },
    ));
}

export function removePack(
  {
    instance,
    packId,
  }: {
    instance: InstanceExpr;
    packId: StringExpr;
  },
): ResponseExpr {
  return fql.Let({
    match: fql.Match(
      fql.Index('pack_manifest_id'),
      packId,
    ),
  }, ({ match }) =>
    fql.If(
      fql.IsNonEmpty(match),
      fql.Let(
        {
          ref: fql.Ref(fql.Get(match)),
          installed: fql.Includes(
            fql.Var('ref'),
            fql.Map(
              fql.Select<PackExpr[]>(['data', 'packs'], instance),
              (pack) => fql.Select(['ref'], pack),
            ),
          ),
          updatedInstance: fql.If(
            fql.Var('installed'),
            fql.Update<Instance>(fql.Ref(instance), {
              packs: fql.Filter(
                fql.Select(['data', 'packs'], instance),
                (pack) =>
                  fql.Not(fql.Equals(
                    fql.Select(['ref'], pack as unknown as PackExpr),
                    fql.Var('ref'),
                  )),
              ),
            }),
            instance,
          ),
          updatedPack: fql.If(
            fql.Var('installed'),
            fql.Update<Pack>(fql.Var('ref'), {
              servers: fql.Max(
                0,
                fql.Subtract(
                  fql.Select(['data', 'servers'], fql.Get(match), 0),
                  1,
                ),
              ),
            }),
            fql.Null(),
          ),
        },
        () => ({
          ok: true,
          uninstall: match,
        }),
      ),
      {
        ok: false,
        error: 'PACK_NOT_FOUND',
      },
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
        name: 'pack_manifest_id',
        terms: [{ field: ['data', 'manifest', 'id'] }],
      }),
      fql.Indexer({
        client,
        unique: false,
        collection: 'pack',
        name: 'packs_owner_user_id',
        terms: [{ field: ['data', 'owner'] }],
      }),
      fql.Indexer({
        client,
        unique: false,
        collection: 'pack',
        name: 'packs_maintainers_user_id',
        terms: [{ field: ['data', 'manifest', 'maintainers'] }],
      }),
      fql.Indexer({
        client,
        unique: false,
        collection: 'pack',
        name: 'packs_sorted_by_server_amount',
        values: [
          { field: ['data', 'servers'], reverse: true },
          { field: ['ref'] },
        ],
      }),
    ],
    resolvers: [
      fql.Resolver({
        client,
        name: 'publish_pack',
        lambda: (userId: StringExpr, manifest: ManifestExpr) => {
          return publishPack({ userId, manifest });
        },
      }),
      fql.Resolver({
        client,
        name: 'get_packs_by_user_id',
        lambda: (userId: StringExpr) => {
          return getPacksByUserId({ userId });
        },
      }),
      fql.Resolver({
        client,
        name: 'get_most_installed_packs',
        lambda: fql.EmptyLambda(getMostInstalledPacks()),
      }),
      fql.Resolver({
        client,
        name: 'add_pack_to_instance',
        lambda: (
          guildId: StringExpr,
          userId: StringExpr,
          packId: StringExpr,
        ) => {
          return fql.Let(
            {
              guild: getGuild(guildId),
              instance: getInstance(fql.Var('guild')),
            },
            ({ instance }) =>
              addPack({
                instance,
                packId,
                userId,
              }),
          );
        },
      }),
      fql.Resolver({
        client,
        name: 'remove_pack_from_instance',
        lambda: (
          guildId: StringExpr,
          packId: StringExpr,
        ) => {
          return fql.Let(
            {
              guild: getGuild(guildId),
              instance: getInstance(fql.Var('guild')),
            },
            ({ instance }) =>
              removePack({
                instance,
                packId,
              }),
          );
        },
      }),
    ],
  };
}
