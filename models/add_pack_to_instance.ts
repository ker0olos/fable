import {
  Client,
  fql,
  InstanceExpr,
  ManifestExpr,
  NumberExpr,
  PackExpr,
  ResponseExpr,
  StringExpr,
  TimeExpr,
} from './fql.ts';

import {
  getGuild,
  getInstance,
  Instance,
  PackInstall,
} from './get_user_inventory.ts';

export interface Manifest {
  id: StringExpr;
}

export interface Pack {
  manifest: ManifestExpr;
  added: TimeExpr;
  updated: TimeExpr;
  version: NumberExpr;
  maintainers: StringExpr[];
}

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
          fql.Includes(userId, fql.Select(['data', 'maintainers'], pack)),
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
          maintainers: [userId],
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
      fql.Let(
        {
          updatedInstance: fql.If(
            // if the pack already exists in the packs list
            fql.Includes(
              [fql.Ref(instance)],
              fql.Paginate(
                fql.Match(
                  fql.Index('pack_ref_instances'),
                  fql.Ref(fql.Get(match)),
                ),
                {},
              ),
            ),
            instance,
            fql.Update<Instance>(fql.Ref(instance), {
              packs: fql.Append(
                {
                  ref: fql.Ref(fql.Get(match)),
                  timestamp: fql.Now(),
                  by: userId,
                } as PackInstall,
                fql.Select(['data', 'packs'], instance),
              ),
            }),
          ),
        },
        () => ({
          ok: true,
          pack: match,
        }),
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
          updatedInstance: fql.Update<Instance>(fql.Ref(instance), {
            packs: fql.Filter(
              fql.Select(['data', 'packs'], instance),
              (pack) =>
                fql.Not(fql.Equals(
                  fql.Select(['ref'], pack as unknown as PackExpr),
                  fql.Var('ref'),
                )),
            ),
          }),
        },
        () => ({
          ok: true,
          pack: match,
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
        collection: 'instance',
        name: 'pack_ref_instances',
        terms: [{ field: ['data', 'packs', 'ref'] }],
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
