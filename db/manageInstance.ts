import { KvError } from '../src/errors.ts';

import { kv } from './mod.ts';

import type * as Schema from './schema.ts';

export async function disableBuiltins(
  instance: Schema.Instance,
): Promise<Schema.Instance> {
  instance.excluded = true;
  instance.builtinsDisabled = true;

  const update = await kv.atomic()
    .set(['instances', instance._id], instance)
    .commit();

  if (update.ok) {
    return instance;
  }

  throw new KvError('failed to update instance');
}
