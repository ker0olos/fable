// deno-lint-ignore no-external-import
import {
  batchedAtomic,
} from 'https://raw.githubusercontent.com/ker0olos/kv-toolbox/patch-1/batchedAtomic.ts';

import db from '~/db/mod.ts';

import {
  charactersByInstancePrefix,
  charactersByInventoryPrefix,
  charactersByMediaIdPrefix,
} from '~/db/indices.ts';

import type * as Schema from './schema.ts';

const url =
  'https://api.deno.com/databases/c0e82dfc-caeb-4059-877b-3e9134cf6e52/connect';

if (import.meta.main) {
  const kv = await Deno.openKv(
    url,
  );

  const _inventories = kv.list<Schema.Inventory>({
    prefix: ['inventories'],
  });

  const op = batchedAtomic(kv);

  for await (const { value } of _inventories) {
    const response = await db.getManyValues<Schema.Character>([
      ['characters', value.party?.member1 ?? ''],
      ['characters', value.party?.member2 ?? ''],
      ['characters', value.party?.member3 ?? ''],
      ['characters', value.party?.member4 ?? ''],
      ['characters', value.party?.member5 ?? ''],
    ]);

    for (let member of response) {
      if (!member) {
        continue;
      }

      member = db.unsureInitStats(member);

      op
        .set(['characters', member._id], member)
        .set(
          [
            ...charactersByInstancePrefix(member.instance),
            member.id,
          ],
          member,
        )
        .set(
          [
            ...charactersByInventoryPrefix(member.inventory),
            member._id,
          ],
          member,
        )
        .set(
          [
            ...charactersByMediaIdPrefix(member.instance, member.mediaId),
            member._id,
          ],
          member,
        );
    }
  }

  await op.commit();
}
