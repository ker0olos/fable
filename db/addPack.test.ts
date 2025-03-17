import { describe, expect, it, vi } from 'vitest';
import prisma from '~/prisma/__mocks__/index.ts';
import db from './index.ts';
vi.mock('~/prisma/index.ts');

describe('db.publishPack', () => {
  it('normal', () => {
    db.publishPack('user-id', { id: 'pack-id' });

    expect(prisma.pack.upsert).toBeCalledWith({
      where: { id: 'pack-id' },
      create: { id: 'pack-id', ownerId: 'user-id' },
      update: { id: 'pack-id' },
    });
  });

  it('remove not assignable properties', () => {
    db.publishPack('user-id', {
      id: 'pack-id',
      ownerId: 'user-id',
      approved: true,
      hidden: true,
    });

    expect(prisma.pack.upsert).toBeCalledWith({
      where: { id: 'pack-id' },
      create: { id: 'pack-id', ownerId: 'user-id' },
      update: { id: 'pack-id' },
    });
  });
});
