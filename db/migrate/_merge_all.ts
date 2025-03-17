import 'dotenv/config';
import { nanoid } from 'nanoid';
import users from './users.json' with { type: 'json' };
import guilds from './guilds.json' with { type: 'json' };
import inventories from './inventories.json' with { type: 'json' };
import characters from './characters.json' with { type: 'json' };
import packs from './packs.json' with { type: 'json' };
import anime_characters from './anime_characters.json' with { type: 'json' };
import anime_media from './anime_media.json' with { type: 'json' };
// import anime_media_record from './anime_media_record.json' with { type: 'json' };

import { MEDIA_RELATION, PrismaClient } from '@prisma/client';

import Rating from '~/src/rating.ts';

// import { writeFile } from 'fs/promises';

const prisma = new PrismaClient();

console.log('Porting over users...');

for (const user of users) {
  await prisma.user.create({
    data: {
      id: user.discordId,
      availableTokens: user.availableTokens,
      guarantees: user.guarantees,
      dailyTimestamp: user.dailyTimestamp,
    },
  });
}

console.log('Porting over packs...');

for (const pack of packs) {
  try {
    await prisma.pack.create({
      data: {
        id: pack.manifest.id,
        approved: pack.approved,
        hidden: pack.hidden,
        owner: {
          connectOrCreate: {
            where: { id: pack.owner },
            create: {
              id: pack.owner,
            },
          },
        },
        createdAt: pack.createdAt,
        updatedAt: pack.updatedAt,
        //
        title: pack.manifest.title,
        description: pack.manifest.description,
        author: pack.manifest.author,
        image: pack.manifest.image,
        url: pack.manifest.url,
        nsfw: pack.manifest.nsfw,
        webhookUrl: pack.manifest.webhookUrl,
        private: pack.manifest.private,
        conflicts: pack.manifest.conflicts,
        maintainers: {
          connectOrCreate: pack.manifest.maintainers?.map((maintainer) => ({
            where: { id: maintainer },
            create: {
              id: maintainer,
            },
          })),
        },
      },
    });
  } catch (error) {
    console.error(pack);
    throw error;
  }
}

console.log('Porting over packs media/characters links and relations...');

for (const pack of packs) {
  try {
    await prisma.packCharacter.createMany({
      data:
        pack.manifest.characters?.new?.map((character) => ({
          id: `${pack.manifest.id}:${character.id}`,
          name: character.name.english,
          alternative: character.name.alternative,
          packId: pack.manifest.id,
          createdAt: character.added ? new Date(character.added) : new Date(),
          updatedAt: character.updated
            ? new Date(character.updated)
            : new Date(),
          description: character.description,
          // popularity: character.popularity,
          rating:
            typeof character.popularity === 'number'
              ? new Rating({
                  popularity: character.popularity,
                }).stars
              : new Rating({
                  popularity:
                    pack.manifest.media?.new?.find(
                      (media) => media.id === character.media?.[0]?.id
                    )?.popularity ?? 10_000,
                  role: character.media?.[0]?.role,
                }).stars,
          age: character.age,
          gender: character.gender,
          image: character.images?.[0]?.url,
        })) ?? [],
      skipDuplicates: true,
    });
  } catch (error) {
    console.error(
      'pack.manifest.characters?.new',
      pack.manifest.characters?.new
    );
    throw error;
  }

  try {
    await prisma.packMedia.createMany({
      data:
        pack.manifest.media?.new?.map((media) => ({
          id: `${pack.manifest.id}:${media.id}`,
          packId: pack.manifest.id,
          title: media.title.english,
          alternative: media.title.alternative,
          description: media.description,
          createdAt: media.added ? new Date(media.added) : new Date(),
          updatedAt: media.updated ? new Date(media.updated) : new Date(),
          format: media.format,
          type: media.type,
          image: media.images?.[0]?.url,
        })) ?? [],
      skipDuplicates: true,
    });
  } catch (error) {
    console.error('pack.manifest.media?.new', pack.manifest.media?.new);
    throw error;
  }

  for (const character of pack.manifest.characters?.new ?? []) {
    try {
      await prisma.externalUrl.createMany({
        data:
          character.externalLinks?.map((link) => ({
            site: link.site,
            url: link.url,
            characterId: `${pack.manifest.id}:${character.id}`,
          })) ?? [],
      });
    } catch (error) {
      console.error('character.externalLinks', character.externalLinks);
      throw error;
    }
  }

  for (const media of pack.manifest.media?.new ?? []) {
    try {
      await prisma.packMedia.update({
        where: { id: `${pack.manifest.id}:${media.id}` },
        data: {
          characters: {
            createMany: {
              data:
                media.characters?.map((character) => ({
                  nodeId: `${pack.manifest.id}:${character.characterId}`,
                  role: character.role,
                })) ?? [],
            },
          },
          media: {
            createMany: {
              data:
                media.media?.map((relatedMedia) => ({
                  nodeId: `${pack.manifest.id}:${relatedMedia.mediaId}`,
                  // mediaId: `${pack.manifest.id}:${media.id}`,
                  relation: relatedMedia.relation,
                })) ?? [],
            },
          },
        },
      });
    } catch (error) {
      console.error(
        'media.characters, media.media',
        media.characters,
        media.media
      );
      throw error;
    }

    try {
      await prisma.externalUrl.createMany({
        data:
          media.externalLinks?.map((link) => ({
            site: link.site,
            url: link.url,
            mediaId: `${pack.manifest.id}:${media.id}`,
          })) ?? [],
      });
    } catch (error) {
      console.error('media.externalLinks', pack, media.externalLinks);
      throw error;
    }
  }
}

///

console.log('Porting over anime media...');

const record: Record<string, number> = {};
const record2: Record<string, string> = {};
const record3 = new Set();

for (const media of anime_media) {
  let newId = nanoid(4);

  while (record3.has(newId)) {
    newId = nanoid(4);
  }

  record[media.id] = media.popularity;
  record2[media.id] = newId;
  record3.add(newId);

  await prisma.packMedia.create({
    data: {
      id: 'anilist:' + newId,
      pack: {
        connect: {
          id: 'anilist',
        },
      },
      title: media.title.english ?? media.title.romaji ?? media.title.native,
      alternative: [
        media.title.native,
        media.title.romaji,
        ...media.title.alternative,
      ].filter(Boolean),
      type: media.type,
      format: media.format,
      description: media.description,
      image: media.images?.[0]?.url,
      externalLinks: {
        createMany: {
          data: [
            ...media.externalLinks.map((link) => ({
              site: link.site,
              url: link.url,
            })),
            media.trailer
              ? {
                  site: 'Trailer',
                  url: 'https://www.youtube.com/watch?v=' + media.trailer.id,
                }
              : null,
          ].filter(Boolean),
        },
      },
      //
      idMal: media.idMal,
      idAL: parseInt(media.id),
      tags: media.tags.map((tag) => tag.name),
      genres: media.genres,
    },
  });
}

for (const media of anime_media) {
  await prisma.packMedia.update({
    where: { id: 'anilist:' + record2[media.id] },
    data: {
      media: {
        createMany: {
          data: media.relations
            .map((relatedMedia) =>
              record2[relatedMedia.mediaId.split(':')[1]]
                ? {
                    nodeId:
                      'anilist:' + record2[relatedMedia.mediaId.split(':')[1]],
                    // mediaId: 'anilist:' + record2[media.id],
                    relation:
                      MEDIA_RELATION[relatedMedia.relation] ??
                      MEDIA_RELATION.OTHER,
                  }
                : null
            )
            .filter(Boolean),
        },
      },
    },
  });
}

// await writeFile(
//   './db/migrate/anime_media_record.json',
//   JSON.stringify(record2, null, 2)
// );

console.log('Porting over anime characters...');

for (const char of anime_characters) {
  if (!char.name.english && !char.name.native) continue;
  try {
    await prisma.packCharacter.create({
      data: {
        id: 'anilist:' + char.id,
        pack: {
          connect: {
            id: 'anilist',
          },
        },
        description: char.description,
        rating: new Rating({
          popularity: record[char.media[0].mediaId.split(':')[1]]!,
          role: char.media[0].role,
        }).stars,
        age: char.age,
        image: char.images?.[0]?.url,
        name: char.name.english ?? char.name.native,
        alternative: [char.name.native, ...char.name.alternative].filter(
          Boolean
        ),
        media: {
          createMany: {
            data: char.media
              .map((media) =>
                record2[media.mediaId.split(':')[1]]
                  ? {
                      mediaId:
                        'anilist:' + record2[media.mediaId.split(':')[1]],
                      role: media.role,
                    }
                  : null
              )
              .filter(Boolean),
          },
        },
      },
    });
  } catch (error) {
    console.error(char);
    console.error(char.media);
    throw error;
  }
}

///
///
///

console.log('Porting over guilds...');

for (const guild of guilds) {
  if (!guild.discordId) continue;
  try {
    await prisma.guild.create({
      data: {
        id: guild.discordId,
        excluded: guild.excluded,
        options: {
          create: {
            dupes: guild.options?.dupes || false,
          },
        },
        packs: {
          createMany: {
            data: guild.packIds.map((packId) => {
              return { packId };
            }),
          },
        },
      },
    });
  } catch (error) {
    console.error(guild);
    throw error;
  }
}

console.log('Porting over inventories...');

for (const inv of inventories) {
  if (!inv.guildId || !inv.userId) continue;
  try {
    await prisma.inventory.create({
      data: {
        user: {
          connectOrCreate: {
            where: { id: inv.userId },
            create: { id: inv.userId },
          },
        },
        guild: {
          connectOrCreate: {
            where: { id: inv.guildId },
            create: { id: inv.guildId },
          },
        },
        availablePulls: inv.availablePulls,
        lastPull: inv.lastPull,
        stealTimestamp: inv.stealTimestamp,
        rechargeTimestamp: inv.rechargeTimestamp,
      },
    });
  } catch (error) {
    console.error(inv);
    throw error;
  }
}

// const record2: Record<string, string> = anime_media_record;

let failed = 0;
console.log('Porting over characters...');

for (const char of characters) {
  if (
    char.mediaId.startsWith('anilist:') &&
    !record2[char.mediaId.split(':')[1]]
  ) {
    failed += 1;
    console.error({
      failed,
      rating: char.rating,
      characterId: char.characterId,
      mediaId: char.mediaId.startsWith('anilist:')
        ? 'anilist:' + record2[char.mediaId.split(':')[1]]
        : char.mediaId,
    });
    continue;
  }

  try {
    await prisma.character.create({
      data: {
        characterId: char.characterId,
        mediaId: char.mediaId.startsWith('anilist:')
          ? 'anilist:' + record2[char.mediaId.split(':')[1]]
          : char.mediaId,
        userId: char.userId,
        guildId: char.guildId,
        rating: char.rating,
        createdAt: char.createdAt,
        nickname: char.nickname,
        image: char.image,
      },
    });
  } catch (error) {
    if (error.toString().includes('Foreign key constraint violated')) {
      failed += 1;
      console.error({
        failed,
        rating: char.rating,
        characterId: char.characterId,
        mediaId: char.mediaId.startsWith('anilist:')
          ? 'anilist:' + record2[char.mediaId.split(':')[1]]
          : char.mediaId,
      });
    } else if (
      error
        .toString()
        .includes(
          'Unique constraint failed on the fields: (`characterId`,`userId`,`guildId`)'
        )
    ) {
      //
    } else {
      throw error;
    }
  }
}

console.log('Total failed:', failed);

console.log('Porting over likes...');

for (const user of users) {
  for (const like of user.likes) {
    if (
      like.mediaId?.startsWith('anilist:') &&
      !record2[like.mediaId.split(':')[1]]
    ) {
      continue;
    }

    try {
      await prisma.like.create({
        data: {
          userId: user.discordId,
          characterId: like.characterId,
          mediaId: like.mediaId?.startsWith('anilist:')
            ? 'anilist:' + record2[like.mediaId.split(':')[1]]
            : like.mediaId,
        },
      });
    } catch (error) {
      console.error(like);
      // console.error(error);
    }
  }
}

console.log('Porting over party members...');

for (const inv of inventories) {
  const partyMember1Id = inv.party?.member1Id
    ? characters.find((char) => char._id === inv.party?.member1Id)?.characterId
    : null;

  const partyMember2Id = inv.party?.member2Id
    ? characters.find((char) => char._id === inv.party?.member2Id)?.characterId
    : null;

  const partyMember3Id = inv.party?.member3Id
    ? characters.find((char) => char._id === inv.party?.member3Id)?.characterId
    : null;

  const partyMember4Id = inv.party?.member4Id
    ? characters.find((char) => char._id === inv.party?.member4Id)?.characterId
    : null;

  const partyMember5Id = inv.party?.member5Id
    ? characters.find((char) => char._id === inv.party?.member5Id)?.characterId
    : null;

  try {
    await prisma.inventory.update({
      where: { userId_guildId: { userId: inv.userId, guildId: inv.guildId } },
      data: {
        partyMember1Id,
        partyMember2Id,
        partyMember3Id,
        partyMember4Id,
        partyMember5Id,
      },
    });
  } catch (error) {
    console.error({
      userId: inv.userId,
      guildId: inv.guildId,
      partyMember1Id,
      partyMember2Id,
      partyMember3Id,
      partyMember4Id,
      partyMember5Id,
    });
  }
}
