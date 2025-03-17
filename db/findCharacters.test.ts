import { expect, it, vi } from 'vitest';
import prisma from '~/prisma/__mocks__/index.ts';
import db from './index.ts';
vi.mock('~/prisma/index.ts');

it('db.findGuildCharacters', () => {
  db.findGuildCharacters('guild-id');

  expect(prisma.character.findMany).toBeCalledWith({
    where: { guildId: 'guild-id' },
  });
});

it('db.findCharacter', () => {
  db.findCharacter('guild-id', 'character-id');

  expect(prisma.character.findMany).toBeCalledWith({
    where: { guildId: 'guild-id', characterId: 'character-id' },
  });
});

it('db.findOneCharacter', () => {
  db.findOneCharacter('guild-id', 'user-id', 'character-id');

  expect(prisma.character.findUnique).toBeCalledWith({
    where: {
      characterId_userId_guildId: {
        characterId: 'character-id',
        userId: 'user-id',
        guildId: 'guild-id',
      },
    },
  });
});
