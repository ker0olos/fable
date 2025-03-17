import { describe, expect, it, vi } from 'vitest';
import prisma from '~/prisma/__mocks__/index.ts';
import db from './index.ts';
vi.mock('~/prisma/index.ts');

describe('db.invertDupes', () => {
  it('dupes are disallowed ', async () => {
    prisma.options.findUnique.mockResolvedValue({
      guildId: 'guild-id',
      dupes: false,
    });

    await db.invertDupes('guild-id');

    expect(prisma.options.upsert).toBeCalledWith({
      where: { guildId: 'guild-id' },
      create: { guildId: 'guild-id', dupes: false },
      update: { dupes: { set: true } },
    });
  });

  it('dupes are allowed ', async () => {
    prisma.options.findUnique.mockResolvedValue({
      guildId: 'guild-id',
      dupes: true,
    });

    await db.invertDupes('guild-id');

    expect(prisma.options.upsert).toBeCalledWith({
      where: { guildId: 'guild-id' },
      create: { guildId: 'guild-id', dupes: false },
      update: { dupes: { set: false } },
    });
  });

  it('options are null', async () => {
    prisma.options.findUnique.mockResolvedValue(null);

    await db.invertDupes('guild-id');

    expect(prisma.options.upsert).toBeCalledWith({
      where: { guildId: 'guild-id' },
      create: { guildId: 'guild-id', dupes: false },
      update: { dupes: { set: false } },
    });
  });
});
