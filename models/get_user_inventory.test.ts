// deno-lint-ignore-file no-explicit-any

import { assertEquals } from 'https://deno.land/std@0.179.0/testing/asserts.ts';

import { assertSpyCalls } from 'https://deno.land/std@0.179.0/testing/mock.ts';

import { assertSnapshot } from 'https://deno.land/std@0.179.0/testing/snapshot.ts';

import { FakeClient } from './fql.mock.ts';

import {
  default as Model,
  MAX_PULLS,
  RECHARGE_MINS,
} from './get_user_inventory.ts';

Deno.test('model', async (test) => {
  const client = FakeClient();

  Model(client as any).indexers?.forEach((q) => q());
  Model(client as any).resolvers?.forEach((q) => q());

  assertSpyCalls(client.query, 5);

  await assertSnapshot(test, client.query.calls[0].args);
  await assertSnapshot(test, client.query.calls[1].args);
  await assertSnapshot(test, client.query.calls[2].args);
  await assertSnapshot(test, client.query.calls[3].args);
  await assertSnapshot(test, client.query.calls[4].args);
});

Deno.test('variables', () => {
  assertEquals(MAX_PULLS, 5);
  assertEquals(RECHARGE_MINS, 30);
});
