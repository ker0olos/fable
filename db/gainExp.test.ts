// deno-lint-ignore-file

import { assertEquals } from '$std/assert/mod.ts';

import db from '~/db/mod.ts';

import type * as Schema from '~/db/schema.ts';

Deno.test('distribute new stat points', async (test) => {
  await test.step('1-0-0 (add 1 new point)', () => {
    const character = {
      combat: {
        baseStats: { attack: 1, defense: 0, speed: 0 },
        curStats: { attack: 0, defense: 0, speed: 0 },
      },
    };

    const newStatPoints = 1;

    const updatedCharacter = db.distributeNewStats(
      character as any,
      newStatPoints,
    );

    assertEquals(updatedCharacter.combat?.curStats?.attack, 1);
    assertEquals(updatedCharacter.combat?.curStats?.defense, 0);
    assertEquals(updatedCharacter.combat?.curStats?.speed, 0);
  });

  await test.step('0-1-0 (add 1 new point)', () => {
    const character = {
      combat: {
        baseStats: { attack: 0, defense: 1, speed: 0 },
        curStats: { attack: 0, defense: 0, speed: 0 },
      },
    };

    const newStatPoints = 1;

    const updatedCharacter = db.distributeNewStats(
      character as any,
      newStatPoints,
    );

    assertEquals(updatedCharacter.combat?.curStats?.attack, 0);
    assertEquals(updatedCharacter.combat?.curStats?.defense, 1);
    assertEquals(updatedCharacter.combat?.curStats?.speed, 0);
  });

  await test.step('0-0-1 (add 1 new point)', () => {
    const character = {
      combat: {
        baseStats: { attack: 0, defense: 0, speed: 1 },
        curStats: { attack: 0, defense: 0, speed: 0 },
      },
    };

    const newStatPoints = 1;

    const updatedCharacter = db.distributeNewStats(
      character as any,
      newStatPoints,
    );

    assertEquals(updatedCharacter.combat?.curStats?.attack, 0);
    assertEquals(updatedCharacter.combat?.curStats?.defense, 0);
    assertEquals(updatedCharacter.combat?.curStats?.speed, 1);
  });

  await test.step('1-1-1 (add 1 new point)', () => {
    const character = {
      combat: {
        baseStats: { attack: 1, defense: 1, speed: 1 },
        curStats: { attack: 0, defense: 0, speed: 0 },
      },
    };

    const newStatPoints = 1;

    const updatedCharacter = db.distributeNewStats(
      character as any,
      newStatPoints,
    );

    assertEquals(updatedCharacter.combat?.curStats?.attack, 0);
    assertEquals(updatedCharacter.combat?.curStats?.defense, 0);
    assertEquals(updatedCharacter.combat?.curStats?.speed, 1);
  });

  await test.step('1-1-1 (add 50 new point)', () => {
    const character = {
      combat: {
        baseStats: { attack: 1, defense: 1, speed: 1 },
        curStats: { attack: 0, defense: 0, speed: 0 },
      },
    };

    const newStatPoints = 50;

    const updatedCharacter = db.distributeNewStats(
      character as any,
      newStatPoints,
    );

    assertEquals(updatedCharacter.combat?.curStats?.attack, 17);
    assertEquals(updatedCharacter.combat?.curStats?.defense, 17);
    assertEquals(updatedCharacter.combat?.curStats?.speed, 16);
  });

  await test.step('2-1-1 (from 1 to 4 points)', async (test) => {
    await test.step('add 1 new point', () => {
      const character = {
        combat: {
          baseStats: { attack: 2, defense: 1, speed: 1 },
          curStats: { attack: 0, defense: 0, speed: 0 },
        },
      };

      const newStatPoints = 1;

      const updatedCharacter = db.distributeNewStats(
        character as any,
        newStatPoints,
      );

      assertEquals(updatedCharacter.combat?.curStats?.attack, 1);
      assertEquals(updatedCharacter.combat?.curStats?.defense, 0);
      assertEquals(updatedCharacter.combat?.curStats?.speed, 0);
    });

    await test.step('add 2 new point', () => {
      const character = {
        combat: {
          baseStats: { attack: 2, defense: 1, speed: 1 },
          curStats: { attack: 0, defense: 0, speed: 0 },
        },
      };

      const newStatPoints = 2;

      const updatedCharacter = db.distributeNewStats(
        character as any,
        newStatPoints,
      );

      assertEquals(updatedCharacter.combat?.curStats?.attack, 1);
      assertEquals(updatedCharacter.combat?.curStats?.defense, 1);
      assertEquals(updatedCharacter.combat?.curStats?.speed, 0);
    });

    await test.step('add 3 new point', () => {
      const character = {
        combat: {
          baseStats: { attack: 2, defense: 1, speed: 1 },
          curStats: { attack: 0, defense: 0, speed: 0 },
        },
      };

      const newStatPoints = 3;

      const updatedCharacter = db.distributeNewStats(
        character as any,
        newStatPoints,
      );

      assertEquals(updatedCharacter.combat?.curStats?.attack, 1);
      assertEquals(updatedCharacter.combat?.curStats?.defense, 1);
      assertEquals(updatedCharacter.combat?.curStats?.speed, 1);
    });

    await test.step('add 4 new point', () => {
      const character = {
        combat: {
          baseStats: { attack: 2, defense: 1, speed: 1 },
          curStats: { attack: 0, defense: 0, speed: 0 },
        },
      };

      const newStatPoints = 4;

      const updatedCharacter = db.distributeNewStats(
        character as any,
        newStatPoints,
      );

      assertEquals(updatedCharacter.combat?.curStats?.attack, 2);
      assertEquals(updatedCharacter.combat?.curStats?.defense, 1);
      assertEquals(updatedCharacter.combat?.curStats?.speed, 1);
    });
  });

  await test.step('2-0-0 (from 1 to 4 points)', async (test) => {
    await test.step('add 1 new point', () => {
      const character = {
        combat: {
          baseStats: { attack: 2, defense: 0, speed: 0 },
          curStats: { attack: 0, defense: 0, speed: 0 },
        },
      };

      const newStatPoints = 1;

      const updatedCharacter = db.distributeNewStats(
        character as any,
        newStatPoints,
      );

      assertEquals(updatedCharacter.combat?.curStats?.attack, 1);
      assertEquals(updatedCharacter.combat?.curStats?.defense, 0);
      assertEquals(updatedCharacter.combat?.curStats?.speed, 0);
    });

    await test.step('add 2 new point', () => {
      const character = {
        combat: {
          baseStats: { attack: 2, defense: 0, speed: 0 },
          curStats: { attack: 0, defense: 0, speed: 0 },
        },
      };

      const newStatPoints = 2;

      const updatedCharacter = db.distributeNewStats(
        character as any,
        newStatPoints,
      );

      assertEquals(updatedCharacter.combat?.curStats?.attack, 2);
      assertEquals(updatedCharacter.combat?.curStats?.defense, 0);
      assertEquals(updatedCharacter.combat?.curStats?.speed, 0);
    });

    await test.step('add 3 new point', () => {
      const character = {
        combat: {
          baseStats: { attack: 2, defense: 0, speed: 0 },
          curStats: { attack: 0, defense: 0, speed: 0 },
        },
      };

      const newStatPoints = 3;

      const updatedCharacter = db.distributeNewStats(
        character as any,
        newStatPoints,
      );

      assertEquals(updatedCharacter.combat?.curStats?.attack, 3);
      assertEquals(updatedCharacter.combat?.curStats?.defense, 0);
      assertEquals(updatedCharacter.combat?.curStats?.speed, 0);
    });

    await test.step('add 4 new point', () => {
      const character = {
        combat: {
          baseStats: { attack: 2, defense: 0, speed: 0 },
          curStats: { attack: 0, defense: 0, speed: 0 },
        },
      };

      const newStatPoints = 4;

      const updatedCharacter = db.distributeNewStats(
        character as any,
        newStatPoints,
      );

      assertEquals(updatedCharacter.combat?.curStats?.attack, 4);
      assertEquals(updatedCharacter.combat?.curStats?.defense, 0);
      assertEquals(updatedCharacter.combat?.curStats?.speed, 0);
    });
  });
});
