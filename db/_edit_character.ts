// deno-lint-ignore-file no-external-import no-non-null-assertion

import {
  batchedAtomic,
} from 'https://raw.githubusercontent.com/ker0olos/kv-toolbox/patch-1/batchedAtomic.ts';

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

  const _char = await kv.get<Schema.Character>([
    'characters',
    '01H9DCZ5Z4XQWHC337K8H57SGH',
  ]);

  const op = batchedAtomic(kv);

  const char = _char.value!;

  // deno-lint-ignore ban-ts-comment
  //@ts-ignore
  delete char.combat!.skills!['~speed-boost'];

  char.combat!.skillPoints = 1;

  op
    .set(['characters', char._id], char)
    .set(
      [
        ...charactersByInstancePrefix(char.instance),
        char.id,
      ],
      char,
    )
    .set(
      [
        ...charactersByInventoryPrefix(char.inventory),
        char._id,
      ],
      char,
    )
    .set(
      [
        ...charactersByMediaIdPrefix(char.instance, char.mediaId),
        char._id,
      ],
      char,
    );

  await op.commit();
}
