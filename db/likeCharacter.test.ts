import { expect, it, vi } from 'vitest';
import prisma from '~/prisma/__mocks__/index.ts';
import db from './index.ts';
vi.mock('~/prisma/index.ts');

it('db.likeCharacter', () => {
  db.likeCharacter('user-id', 'character-id');

  expect(prisma.like.create).toBeCalledWith({
    data: {
      characterId: 'character-id',
      user: {
        connectOrCreate: {
          where: { id: 'user-id' },
          create: { id: 'user-id' },
        },
      },
    },
  });
});

it('db.unlikeCharacter', () => {
  db.unlikeCharacter('user-id', 'character-id');

  expect(prisma.like.delete).toBeCalledWith({
    where: {
      userId_characterId: {
        userId: 'user-id',
        characterId: 'character-id',
      },
    },
  });
});

it('db.likeMedia', () => {
  db.likeMedia('user-id', 'media-id');

  expect(prisma.like.create).toBeCalledWith({
    data: {
      mediaId: 'media-id',
      user: {
        connectOrCreate: {
          where: { id: 'user-id' },
          create: { id: 'user-id' },
        },
      },
    },
  });
});

it('db.unlikeMedia', () => {
  db.unlikeMedia('user-id', 'media-id');

  expect(prisma.like.delete).toBeCalledWith({
    where: {
      userId_mediaId: {
        userId: 'user-id',
        mediaId: 'media-id',
      },
    },
  });
});
