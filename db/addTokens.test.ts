import { expect, it, vi } from 'vitest';
import prisma from '~/prisma/__mocks__/index.ts';
import db from './index.ts';
vi.mock('~/prisma/index.ts');

it('db.addTokens', () => {
  db.addTokens('user-id', 100);

  expect(prisma.user.update).toBeCalledWith({
    where: { id: 'user-id' },
    data: { availableTokens: { increment: 100 } },
  });
});
