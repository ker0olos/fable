import { expect, it, vi } from 'vitest';
import prisma from '~/prisma/__mocks__/index.ts';
import db from './index.ts';
vi.mock('~/prisma/index.ts');

it('db.setCharacterNickname', () => {
  db.setCharacterNickname('user-id', 'guild-id', 'character-id', 'nickname');

  expect(prisma.character.update).toBeCalledWith({
    where: {
      characterId_userId_guildId: {
        characterId: 'character-id',
        userId: 'user-id',
        guildId: 'guild-id',
      },
    },
    data: { nickname: 'nickname' },
  });
});

it('db.setCharacterImage', () => {
  db.setCharacterImage('user-id', 'guild-id', 'character-id', 'image');

  expect(prisma.character.update).toBeCalledWith({
    where: {
      characterId_userId_guildId: {
        characterId: 'character-id',
        userId: 'user-id',
        guildId: 'guild-id',
      },
    },
    data: { image: 'image' },
  });
});
