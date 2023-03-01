import { assertSnapshot } from 'https://deno.land/std@0.177.0/testing/snapshot.ts';

import { commands } from './update_commands.ts';

Deno.test('commands', async (test) => {
  await assertSnapshot(test, commands);
});
