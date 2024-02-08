import { usersByDiscordId } from '~/db/indices.ts';

import type * as Schema from './schema.ts';

const url =
  'https://api.deno.com/databases/c0e82dfc-caeb-4059-877b-3e9134cf6e52/connect';

if (import.meta.main) {
  const kv = await Deno.openKv(
    url,
  );

  const id = '228674702414053386', amount = 200;

  const user = await kv.get<Schema.User>(
    usersByDiscordId(id),
  );

  const op = kv.atomic();

  user.value!.availableTokens! += amount;

  op.check(user)
    .set(
      ['users', user.value!._id],
      user.value,
    )
    .set(usersByDiscordId(user.value!.id), user.value);

  await op.commit();
}
