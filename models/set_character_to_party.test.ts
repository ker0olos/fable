// deno-lint-ignore-file no-explicit-any

import { assertSpyCalls } from 'https://deno.land/std@0.186.0/testing/mock.ts';

import { assertSnapshot } from 'https://deno.land/std@0.186.0/testing/snapshot.ts';

import { FakeClient } from './fql.ts';

import { default as Model } from './set_character_to_party.ts';

Deno.test('model', async (test) => {
  const client = FakeClient();

  Model(client as any).resolvers?.forEach((q) => q());

  assertSpyCalls(client.query, 3);

  await assertSnapshot(test, client.query.calls[0].args);
  await assertSnapshot(test, client.query.calls[1].args);
  await assertSnapshot(test, client.query.calls[2].args);
});
