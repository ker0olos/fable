import { assertEquals } from '$std/assert/mod.ts';

import { assertSnapshot } from '$std/testing/snapshot.ts';

import help from '../src/help.ts';

Deno.test('/help', async (test) => {
  await test.step('navigation', () => {
    const message = help.pages({ userId: 'user_id', index: 0 });

    assertEquals(message.json().data.components[0].components[0], {
      custom_id: 'help==9=prev',
      label: 'Prev',
      style: 2,
      type: 2,
    });

    assertEquals(message.json().data.components[0].components[1], {
      custom_id: '_',
      disabled: true,
      label: '1/10',
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

  await test.step('pages', async () => {
    for (let i = 0; i < 10; i++) {
      const message = help.pages({ userId: 'user_id', index: i });

      await assertSnapshot(test, message.json());
    }
  });
});
