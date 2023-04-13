import { assertEquals } from 'https://deno.land/std@0.179.0/testing/asserts.ts';

import { assertSnapshot } from 'https://deno.land/std@0.179.0/testing/snapshot.ts';

import help from '../src/help.ts';

Deno.test('/help', async (test) => {
  await test.step('navigation', () => {
    const message = help.pages({ userId: 'user_id', index: 0 });

    assertEquals(message.json().data.components[0].components[0], {
      custom_id: 'help==4=prev',
      label: 'Prev',
      style: 2,
      type: 2,
    });

    assertEquals(message.json().data.components[0].components[1], {
      custom_id: '_',
      disabled: true,
      label: '1/5',
      style: 2,
      type: 2,
    });

    assertEquals(message.json().data.components[0].components[2], {
      custom_id: 'help==1=next',
      label: 'Next',
      style: 2,
      type: 2,
    });
  });

  await test.step('page 1', () => {
    const message = help.pages({ userId: 'user_id', index: 0 });

    assertSnapshot(test, message.json());
  });

  await test.step('page 2', () => {
    const message = help.pages({ userId: 'user_id', index: 1 });

    assertSnapshot(test, message.json());
  });

  await test.step('page 3', () => {
    const message = help.pages({ userId: 'user_id', index: 2 });

    assertSnapshot(test, message.json());
  });

  await test.step('page 4', () => {
    const message = help.pages({ userId: 'user_id', index: 3 });

    assertSnapshot(test, message.json());
  });
});
