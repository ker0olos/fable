import {
  Prisma,
  CHARACTER_ROLE,
  MEDIA_FORMAT,
  MEDIA_RELATION,
  MEDIA_TYPE,
} from '@prisma/client';

type User = Prisma.UserGetPayload<{
  include: {
    likes: true;
  };
}>;

type Pack = Prisma.PackGetPayload<{
  include: {
    owner: true;
    maintainers: true;
    characters: {
      include: {
        externalLinks: true;
        media: {
          include: {
            media: { include: { externalLinks: true } };
            node: { include: { externalLinks: true } };
          };
        };
      };
    };
    media: {
      include: {
        externalLinks: true;
        media: {
          include: {
            node: { include: { externalLinks: true } };
          };
        };
        characters: {
          include: {
            node: { include: { externalLinks: true } };
            media: { include: { externalLinks: true } };
          };
        };
      };
    };
  };
}>;

type Character = Prisma.CharacterGetPayload<{
  include: {
    inventory: true;
    user: true;
  };
}>;

type PackCharacter = Prisma.PackCharacterGetPayload<{
  include: {
    media: {
      include: { media: true };
    };
    externalLinks: true;
  };
}>;

type PackMedia = Prisma.PackMediaGetPayload<{
  include: {
    characters: {
      include: {
        media: {
          include: { externalLinks: true };
        };
        node: {
          include: { externalLinks: true };
        };
      };
    };
    media: {
      include: {
        node: {
          include: { externalLinks: true };
        };
      };
    };
    externalLinks: true;
  };
}>;

type Guild = Prisma.GuildGetPayload<{
  include: { options: true };
}>;

export {
  User,
  Pack,
  Guild,
  Character,
  PackCharacter,
  PackMedia,
  CHARACTER_ROLE,
  MEDIA_FORMAT,
  MEDIA_RELATION,
  MEDIA_TYPE,
};
