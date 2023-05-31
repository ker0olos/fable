import { assertSnapshot } from '$std/testing/snapshot.ts';

import { commands } from './update_commands.ts';

Deno.test('commands', async (test) => {
  await assertSnapshot(test, commands);
});
