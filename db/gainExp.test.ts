// deno-lint-ignore-file

import { assertEquals } from '$std/assert/mod.ts';
import { stub } from '$std/testing/mock.ts';

import db from '~/db/mod.ts';

import { experienceToNextLevel, gainExp } from '~/db/gainExp.ts';

import type { CharacterCombat } from '~/db/schema.ts';

Deno.test('experience to next level', () => {
  assertEquals(experienceToNextLevel(1), 10);
  assertEquals(experienceToNextLevel(2), 20);
  assertEquals(experienceToNextLevel(10), 100);
  assertEquals(experienceToNextLevel(20), 200);
});

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

Deno.test('level up', async (test) => {
  await test.step('x1', () => {
    const distributeStub = stub(db, 'distributeNewStats', (char) => char);

    try {
      const atomicMock = {
        set: () => atomicMock,
        commit: () => ({ ok: true }),
      };

      const status = gainExp(
        atomicMock as any,
        'inventory' as any,
        {} as any,
        10,
      );

      assertEquals(status, {
        exp: 0,
        expToLevel: 20,
        levelUp: 1,
        skillPoints: 1,
        statPoints: 3,
      });
    } finally {
      distributeStub.restore();
    }
  });

  await test.step('x3', () => {
    const distributeStub = stub(db, 'distributeNewStats', (char) => char);

    try {
      const atomicMock = {
        set: () => atomicMock,
        commit: () => ({ ok: true }),
      };

      const status = gainExp(
        atomicMock as any,
        'inventory' as any,
        {} as any,
        65,
      );

      assertEquals(status, {
        exp: 5,
        expToLevel: 40,
        levelUp: 3,
        skillPoints: 3,
        statPoints: 9,
      });
    } finally {
      distributeStub.restore();
    }
  });
});

Deno.test.ignore('extra skill points at level  10', () => {
  const distributeStub = stub(db, 'distributeNewStats', (char) => char);

  try {
    const atomicMock = {
      set: () => atomicMock,
      commit: () => ({ ok: true }),
    };

    const status = gainExp(
      atomicMock as any,
      'inventory' as any,
      {
        combat: {
          level: 10,
          exp: 1,
        } satisfies CharacterCombat,
      } as any,
      1,
    );

    assertEquals(status, {
      exp: 0,
      expToLevel: 0,
      levelUp: 0,
      skillPoints: 0,
      statPoints: 0,
    });
  } finally {
    distributeStub.restore();
  }
});
