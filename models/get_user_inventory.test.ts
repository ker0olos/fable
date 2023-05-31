// deno-lint-ignore-file no-explicit-any

import { assertEquals } from '$std/testing/asserts.ts';

import { assertSpyCalls } from '$std/testing/mock.ts';

import { assertSnapshot } from '$std/testing/snapshot.ts';

import { FakeClient } from './fql.ts';

import {
  default as Model,
  MAX_PULLS,
  RECHARGE_MINS,
} from './get_user_inventory.ts';

Deno.test('model', async (test) => {
  const client = FakeClient();

  Model(client as any).indexers?.forEach((q) => q());
  Model(client as any).resolvers?.forEach((q) => q());

  const length = 8;

  assertSpyCalls(client.query, length);

  for (let i = 0; i < length; i++) {
    await assertSnapshot(test, client.query.calls[i].args);
  }
});

Deno.test('variables', () => {
  assertEquals(MAX_PULLS, 5);
  assertEquals(RECHARGE_MINS, 30);
});
