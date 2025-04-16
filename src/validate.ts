import { z } from 'zod';

import type { Manifest, MergedManifest } from '~/src/types.ts';

const idSchema = z
  .string()
  .min(1)
  .max(20)
  .regex(/^[-_a-z0-9]+$/);

const aliasSchema = z
  .object({
    english: z.string().min(1).max(128),
    alternative: z.array(z.string().min(1).max(128)).optional(),
  })
  .strict();

const imageSchema = z
  .object({
    url: z
      .string()
      .describe(
        'A url of the image (Fable forces the aspect-ratio of all images to 230:325) (recommended size: 450x635)'
      ),
  })
  .strict();

const externalLinksSchema = z
  .object({
    site: z.string(),
    url: z
      .string()
      .regex(
        /^(https:\/\/)?(www\.)?(youtube\.com|twitch\.tv|netflix\.com|crunchyroll\.com|tapas\.io|webtoons\.com|amazon\.com)[\S]*$/,
        { message: 'Must be a valid URL from a supported site' }
      ),
  })
  .strict();

const characterSchema = z
  .object({
    id: idSchema,

    added: z.string().datetime(),
    updated: z.string().datetime(),

    name: aliasSchema,

    description: z
      .string()
      .max(2048, 'Description must be at most 2048 characters')
      .optional(),

    rating: z.number().int().min(1).max(5),

    gender: z.string().optional(),
    age: z.string().optional(),

    images: imageSchema.optional(),

    externalLinks: externalLinksSchema.optional(),

    media: z
      .array(
        z
          .object({
            role: z.enum(['MAIN', 'SUPPORTING', 'BACKGROUND']),
            mediaId: z
              .string()
              .regex(
                /^([-_a-z0-9]+)(:[-_a-z0-9]+)?$/,
                'mediaId must be in the format [pack:]id'
              ),
          })
          .strict()
      )
      .optional(),
  })
  .strict();

export const mediaSchema = z
  .object({
    id: idSchema,

    added: z.string().datetime(),
    updated: z.string().datetime(),

    type: z.enum(['ANIME', 'MANGA', 'OTHER']),

    format: z
      .enum([
        'TV',
        'TV_SHORT',
        'MOVIE',
        'SPECIAL',
        'OVA',
        'ONA',
        'MUSIC',
        'MANGA',
        'VIDEO_GAME',
        'NOVEL',
        'ONE_SHOT',
      ])
      .optional(),

    title: aliasSchema,

    popularity: z.number().int().min(0).max(2147483647),

    description: z
      .string()
      .max(2048, 'Description must be at most 2048 characters')
      .optional(),

    images: imageSchema,

    trailer: z
      .object({
        site: z.enum(['youtube']),
        id: z.string().regex(/([A-Za-z0-9_-]{11})/, {
          message: 'Must be a valid YouTube video ID',
        }),
      })
      .strict()
      .optional(),

    externalLinks: externalLinksSchema.optional(),

    relations: z.array(
      z
        .object({
          relation: z.enum([
            'PREQUEL',
            'SEQUEL',
            'PARENT',
            'CONTAINS',
            'SIDE_STORY',
            'SPIN_OFF',
            'ADAPTATION',
            'OTHER',
          ]),
          mediaId: z.string().regex(/^([-_a-z0-9]+)(:[-_a-z0-9]+)?$/),
        })
        .strict()
    ),

    characters: z.array(
      z
        .object({
          role: z.enum(['MAIN', 'SUPPORTING', 'BACKGROUND']),
          characterId: z.string().regex(/^([-_a-z0-9]+)(:[-_a-z0-9]+)?$/),
        })
        .strict()
    ),
  })
  .strict();

export const manifestSchema = z.object({
  id: idSchema,

  title: z.string().max(128, 'Title cannot exceed 128 characters').optional(),

  description: z
    .string()
    .max(2048, 'Description cannot exceed 2048 characters')
    .optional(),

  author: z.string().optional(),

  image: z.string().optional(),

  url: z.string().optional(),

  webhookUrl: z.string().optional(),

  nsfw: z.boolean().optional(),

  private: z.boolean().optional(),

  conflicts: z
    .array(
      z
        .string()
        .regex(
          /^[-_a-z0-9]+:[-_a-z0-9]+$/,
          "Conflict must be in format 'pack:id'"
        )
    )
    .max(20, 'Cannot have more than 20 conflicts')
    .optional(),

  maintainers: z
    .array(
      z.string().regex(/^[0-9]+$/, 'Maintainer ID must a valid Discord User ID')
    )
    .max(10, 'Cannot have more than 10 maintainers')
    .optional(),

  media: z.array(mediaSchema).optional(),
  characters: z.array(characterSchema).optional(),
});

const reservedIds = ['fable', 'anilist'];

export const purgeReservedProps = (data: Manifest): Manifest => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const purged: any = {};

  Object.keys(data).forEach((key) => {
    if (key.startsWith('$')) {
      return;
    }

    purged[key] = data[key as keyof Manifest];
  });

  return purged as Manifest;
};

export default (data: MergedManifest) => {
  data = purgeReservedProps(data);

  const result = manifestSchema.safeParse(data);

  if (reservedIds.includes(data.id)) {
    return {
      ok: false,
      errors: `${data.id} is a reserved id`,
    };
  } else if (!result.success) {
    return {
      ok: false,
      errors: result.error.errors,
    };
  } else {
    return { ok: true };
  }
};
