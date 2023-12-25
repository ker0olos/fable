import { setAsBlob } from './blob.ts';

import db from './mod.ts';

// deno-lint-ignore no-external-import
import {
  batchedAtomic,
} from 'https://raw.githubusercontent.com/ker0olos/kv-toolbox/patch-1/batchedAtomic.ts';

import { usersByDiscordId, usersLikesByDiscordId } from './indices.ts';

import type * as Schema from './schema.ts';

// const url =
//   'https://api.deno.com/databases/c0e82dfc-caeb-4059-877b-3e9134cf6e52/connect';

if (import.meta.main) {
  const kv = await Deno.openKv(
    // url,
  );

  const _users = kv.list<Schema.User>({
    prefix: ['users'],
  });

  const op = batchedAtomic(kv);

  for await (const { key, value } of _users) {
    const user = value;

    console.log(key);
    // console.log(user);

    // await setAsBlob(kv, usersLikesByDiscordId(user.id), op, user.likes);

    delete user.likes;

    op
      .set(['users', user._id], user)
      .set(usersByDiscordId(user.id), user);
  }

  await op.commit();
}
