import { assertEquals } from '$std/assert/mod.ts';

import {
  getEnemyMaxSkillLevel,
  getEnemyRating,
  getEnemySkillSlots,
} from '../src/battle.ts';

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

Deno.test('test enemy skill slots floors 1-10', () => {
  assertEquals(getEnemySkillSlots(1), 0);
  assertEquals(getEnemySkillSlots(2), 0);
  assertEquals(getEnemySkillSlots(3), 0);
  assertEquals(getEnemySkillSlots(4), 0);

  assertEquals(getEnemySkillSlots(5), 0);
  assertEquals(getEnemySkillSlots(6), 0);
  assertEquals(getEnemySkillSlots(7), 0);
  assertEquals(getEnemySkillSlots(8), 0);
  assertEquals(getEnemySkillSlots(9), 0);

  assertEquals(getEnemySkillSlots(10), 1);
});

Deno.test('test enemy skill slots floors 11-20', () => {
  assertEquals(getEnemySkillSlots(11), 1);
  assertEquals(getEnemySkillSlots(12), 1);
  assertEquals(getEnemySkillSlots(13), 1);
  assertEquals(getEnemySkillSlots(14), 1);

  assertEquals(getEnemySkillSlots(15), 1);
  assertEquals(getEnemySkillSlots(16), 1);
  assertEquals(getEnemySkillSlots(17), 1);
  assertEquals(getEnemySkillSlots(18), 1);
  assertEquals(getEnemySkillSlots(19), 1);

  assertEquals(getEnemySkillSlots(20), 1);
});

Deno.test('test enemy skill levels floors 1-10', () => {
  assertEquals(getEnemyMaxSkillLevel(1), 1);
  assertEquals(getEnemyMaxSkillLevel(2), 1);
  assertEquals(getEnemyMaxSkillLevel(3), 1);
  assertEquals(getEnemyMaxSkillLevel(4), 1);

  assertEquals(getEnemyMaxSkillLevel(5), 1);
  assertEquals(getEnemyMaxSkillLevel(6), 1);
  assertEquals(getEnemyMaxSkillLevel(7), 1);
  assertEquals(getEnemyMaxSkillLevel(8), 1);
  assertEquals(getEnemyMaxSkillLevel(9), 1);

  assertEquals(getEnemyMaxSkillLevel(10), 2);
});

Deno.test('test enemy skill levels floors 11-20', () => {
  assertEquals(getEnemyMaxSkillLevel(11), 2);
  assertEquals(getEnemyMaxSkillLevel(12), 2);
  assertEquals(getEnemyMaxSkillLevel(13), 2);
  assertEquals(getEnemyMaxSkillLevel(14), 2);

  assertEquals(getEnemyMaxSkillLevel(15), 3);
  assertEquals(getEnemyMaxSkillLevel(16), 3);
  assertEquals(getEnemyMaxSkillLevel(17), 3);
  assertEquals(getEnemyMaxSkillLevel(18), 3);
  assertEquals(getEnemyMaxSkillLevel(19), 3);

  assertEquals(getEnemyMaxSkillLevel(20), 4);
});
