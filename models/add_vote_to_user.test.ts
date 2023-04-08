// deno-lint-ignore-file no-explicit-any

import { assertSpyCalls } from 'https://deno.land/std@0.179.0/testing/mock.ts';

import { assertSnapshot } from 'https://deno.land/std@0.179.0/testing/snapshot.ts';

import { FakeClient } from './fql.ts';

import { default as Model } from './add_vote_to_user.ts';

Deno.test('model', async (test) => {
  const client = FakeClient();

  Model(client as any).indexers?.forEach((q) => q());
  Model(client as any).resolvers?.forEach((q) => q());

  assertSpyCalls(client.query, 3);

  await assertSnapshot(test, client.query.calls[0].args);
  await assertSnapshot(test, client.query.calls[1].args);
  await assertSnapshot(test, client.query.calls[2].args);
});
