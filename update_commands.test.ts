import { expect, test } from 'vitest';

import { commands } from './update_commands.ts';

test('commands', async () => {
  expect(commands).toMatchSnapshot();
});
