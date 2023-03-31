// deno-lint-ignore-file no-explicit-any

import { assertSpyCalls } from 'https://deno.land/std@0.179.0/testing/mock.ts';

import { assertSnapshot } from 'https://deno.land/std@0.179.0/testing/snapshot.ts';

import { FakeClient } from './fql.mock.ts';

import { default as Model } from './add_character_to_inventory.ts';

Deno.test('model', async (test) => {
  const client = FakeClient();

  Model(client as any).indexers?.forEach((q) => q());
  Model(client as any).resolvers?.forEach((q) => q());

  assertSpyCalls(client.query, 1);

  await assertSnapshot(test, client.query.calls[0].args);
});
