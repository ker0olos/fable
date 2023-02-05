// deno-lint-ignore-file no-explicit-any

import { assertSpyCalls } from 'https://deno.land/std@0.175.0/testing/mock.ts';

import { assertSnapshot } from 'https://deno.land/std@0.175.0/testing/snapshot.ts';

import { FakeClient } from './fql.mock.ts';

import { default as Model } from './get_user_characters.ts';

Deno.test('model', async (test) => {
  const client = FakeClient();

  Model(client as any);

  assertSpyCalls(client.query, 2);

  await assertSnapshot(test, client.query.calls[0].args);
  await assertSnapshot(test, client.query.calls[1].args);
});
