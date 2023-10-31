import { assertEquals } from '$std/assert/mod.ts';

import { getEnemyRating } from '../src/battle.ts';

Deno.test('test enemy rating 1-10', () => {
  assertEquals(getEnemyRating(1), 1);
  assertEquals(getEnemyRating(2), 1);
  assertEquals(getEnemyRating(3), 1);

  assertEquals(getEnemyRating(4), 2);
  assertEquals(getEnemyRating(6), 2);

  assertEquals(getEnemyRating(7), 3);
  assertEquals(getEnemyRating(8), 3);
  assertEquals(getEnemyRating(9), 3);

  assertEquals(getEnemyRating(5), 4);
  assertEquals(getEnemyRating(10), 5);
});

Deno.test('test enemy rating floors 11-20', () => {
  assertEquals(getEnemyRating(11), 1);
  assertEquals(getEnemyRating(12), 1);
  assertEquals(getEnemyRating(13), 1);

  assertEquals(getEnemyRating(14), 2);
  assertEquals(getEnemyRating(16), 2);

  assertEquals(getEnemyRating(17), 3);
  assertEquals(getEnemyRating(18), 3);
  assertEquals(getEnemyRating(19), 3);

  assertEquals(getEnemyRating(15), 4);
  assertEquals(getEnemyRating(20), 5);
});
