/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest';
import prisma from '~/prisma/__mocks__/index.ts';
import db from './index.ts';
vi.mock('~/prisma/index.ts');

describe('db.getPopularPacks', () => {
  it('gets popular packs with default parameters', async () => {
    prisma.packInstall.groupBy.mockResolvedValue([
      { packId: 'pack-1', _count: { packId: 10 } },
      { packId: 'pack-2', _count: { packId: 5 } },
    ] as any);

    prisma.pack.findMany.mockResolvedValue([
      { id: 'pack-1', title: 'Pack 1' },
      { id: 'pack-2', title: 'Pack 2' },
    ] as any);

    const result = await db.getPopularPacks();

    expect(prisma.packInstall.groupBy).toBeCalledWith({
      by: ['packId'],
      where: {
        pack: {
          hidden: { not: true },
          private: { not: true },
          nsfw: { not: true },
        },
      },
      _count: {
        packId: true,
      },
      orderBy: {
        _count: {
          packId: 'desc',
        },
      },
      skip: 0,
      take: 20,
    });

    expect(prisma.pack.findMany).toBeCalledWith({
      include: { media: true, characters: true },
      where: {
        id: { in: ['pack-1', 'pack-2'] },
      },
    });

    expect(result).toEqual([
      {
        servers: 10,
        pack: { id: 'pack-1', title: 'Pack 1' },
      },
      {
        servers: 5,
        pack: { id: 'pack-2', title: 'Pack 2' },
      },
    ]);
  });

  it('gets popular packs with custom offset and limit', async () => {
    prisma.packInstall.groupBy.mockResolvedValue([] as any);
    prisma.pack.findMany.mockResolvedValue([] as any);

    await db.getPopularPacks(10, 5);

    expect(prisma.packInstall.groupBy).toBeCalledWith({
      by: ['packId'],
      where: {
        pack: {
          hidden: { not: true },
          private: { not: true },
          nsfw: { not: true },
        },
      },
      _count: {
        packId: true,
      },
      orderBy: {
        _count: {
          packId: 'desc',
        },
      },
      skip: 10,
      take: 5,
    });
  });
});

describe('db.getLastUpdatedPacks', () => {
  it('gets last updated packs with default parameters', async () => {
    await db.getLastUpdatedPacks();

    expect(prisma.pack.findMany).toBeCalledWith({
      include: { media: true, characters: true },
      where: {
        hidden: { not: true },
        private: { not: true },
        nsfw: { not: true },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip: 0,
      take: 20,
    });
  });

  it('gets last updated packs with custom offset and limit', async () => {
    await db.getLastUpdatedPacks(5, 10);

    expect(prisma.pack.findMany).toBeCalledWith({
      include: { media: true, characters: true },
      where: {
        hidden: { not: true },
        private: { not: true },
        nsfw: { not: true },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip: 5,
      take: 10,
    });
  });
});

describe('db.getPacksByMaintainerId', () => {
  it('gets packs by maintainer id', async () => {
    await db.getPacksByMaintainerId('user-id');

    expect(prisma.pack.findMany).toBeCalledWith({
      where: {
        maintainers: {
          every: {
            id: 'user-id',
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip: 0,
      take: 20,
    });
  });

  it('gets packs by maintainer id with custom offset and limit', async () => {
    await db.getPacksByMaintainerId('user-id', 5, 10);

    expect(prisma.pack.findMany).toBeCalledWith({
      where: {
        maintainers: {
          every: {
            id: 'user-id',
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip: 5,
      take: 10,
    });
  });
});

describe('db.getPack', () => {
  it('gets a pack with just manifest id', async () => {
    await db.getPack('manifest-id');

    expect(prisma.pack.findFirst).toBeCalledWith({
      where: {
        id: 'manifest-id',
        OR: [{ private: { not: true } }],
      },
    });
  });

  it('gets a public pack with user id', async () => {
    await db.getPack('manifest-id', 'user-id');

    expect(prisma.pack.findFirst).toBeCalledWith({
      where: {
        id: 'manifest-id',
        OR: [
          { private: { not: true } },
          {
            private: true,
            OR: [
              { ownerId: 'user-id' },
              { maintainers: { every: { id: 'user-id' } } },
            ],
          },
        ],
      },
    });
  });
});

describe('db.searchPacks', () => {
  it('searches packs with default parameters', async () => {
    await db.searchPacks('query');

    expect(prisma.pack.findMany).toBeCalledWith({
      include: { media: true, characters: true },
      where: {
        hidden: { not: true },
        private: { not: true },
        nsfw: { not: true },
        OR: [{ title: { search: 'query' } }, { id: { search: 'query' } }],
      },
      orderBy: { updatedAt: 'desc' },
      skip: 0,
      take: 20,
    });
  });

  it('searches packs with custom offset and limit', async () => {
    await db.searchPacks('query', 10, 5);

    expect(prisma.pack.findMany).toBeCalledWith({
      include: { media: true, characters: true },
      where: {
        hidden: { not: true },
        private: { not: true },
        nsfw: { not: true },
        OR: [{ title: { search: 'query' } }, { id: { search: 'query' } }],
      },
      orderBy: { updatedAt: 'desc' },
      skip: 10,
      take: 5,
    });
  });
});
