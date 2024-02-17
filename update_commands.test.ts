import { assertMonochromeSnapshot } from '~/tests/utils.test.ts';
import { commands } from '~/update_commands.ts';

Deno.test('commands', async (test) => {
  await assertMonochromeSnapshot(test, commands);
});
