// import * as discord from './discord.ts';

// import user from './user.ts';
// import packs from './packs.ts';
// import search from './search.ts';

import db from '../db/mod.ts';

import utils from './utils.ts';

import validate, { purgeReservedProps } from './validate.ts';

import config from './config.ts';

import type { Manifest } from './types.ts';

async function query(req: Request): Promise<Response> {
  if (!config.publishPacks) {
    return utils.json(
      { error: 'Under Maintenance' },
      { status: 500, statusText: 'Under Maintenance' },
    );
  }

  const { error } = await utils.validateRequest(req, {
    GET: { headers: ['authorization'] },
  });

  if (error) {
    return utils.json(
      { error: error.message },
      { status: error.status },
    );
  }

  const auth = await utils.fetchWithRetry('https://discord.com/api/users/@me', {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'authorization': req.headers.get('authorization') ?? '',
    },
  });

  if (!auth.ok) {
    return auth;
  }

  const { id: userId } = await auth.json();

  const response = await db.getPacksByUserId(userId);

  return utils.json({ data: response });
}

async function publish(req: Request): Promise<Response> {
  if (!config.publishPacks) {
    return utils.json(
      { error: 'Under Maintenance' },
      { status: 500, statusText: 'Under Maintenance' },
    );
  }

  const { error, body } = await utils.validateRequest(req, {
    POST: { body: ['manifest'], headers: ['authorization'] },
  });

  if (error) {
    return utils.json(
      { error: error.message },
      { status: error.status },
    );
  }

  const auth = await utils.fetchWithRetry('https://discord.com/api/users/@me', {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'authorization': req.headers.get('authorization') ?? '',
    },
  });

  if (!auth.ok) {
    return auth;
  }

  const { id: userId } = await auth.json();

  const { manifest } = body as {
    manifest: Manifest;
  };

  const valid = validate(manifest);

  if (valid.errors?.length) {
    return utils.json({
      errors: valid.errors,
    }, {
      status: 400,
      statusText: 'Bad Request',
    });
  }

  try {
    const _ = await db.publishPack(userId, purgeReservedProps(manifest));

    return new Response(undefined, {
      status: 200,
      statusText: 'OK',
    });
  } catch (err) {
    switch (err.message) {
      case 'PERMISSION_DENIED':
        return utils.json({
          error: 'No permission to edit this pack',
        }, {
          status: 403,
          statusText: 'Forbidden',
        });
      default:
        return utils.json({
          error: 'Internal Server Error',
        }, {
          status: 501,
          statusText: 'Internal Server Error',
        });
    }
  }
}

// async function popularPacks(
//   { userId, guildId, index }: {
//     userId: string;
//     guildId: string;
//     index: number;
//   },
// ): Promise<discord.Message> {
//   const locale = user.cachedUsers[userId]?.locale;

//   const message = new discord.Message();

//   const current = await packs.all({ guildId });

//   const popularPacks = (await db.popularPacks())
//     .slice(0, 100);

//   const pack = popularPacks[index ?? 0];

//   const embed = new discord.Embed()
//     .setTitle(`${index + 1}.`)
//     .setFooter({ text: pack.manifest.author })
//     .setThumbnail({
//       url: pack.manifest.image,
//       default: false,
//       proxy: false,
//     }).setDescription(
//       `**${pack.manifest.title ?? pack.manifest.id}**\nin ${
//         utils.compact(pack.servers ?? 0)
//       } servers\n\n${pack.manifest.description ?? ''}`,
//     );

//   message.addEmbed(embed);

//   if (pack.manifest.characters?.new?.length) {
//     pack.manifest.characters.new.slice(0, 2).forEach((character) => {
//       message.addEmbed(search.characterEmbed(character, {
//         mode: 'thumbnail',
//         description: true,
//         media: { title: false },
//         rating: false,
//         footer: true,
//       }));
//     });
//   }

//   if (current.some(({ manifest }) => manifest.id === pack.manifest.id)) {
//     message.addComponents([
//       new discord.Component()
//         .setId('_installed')
//         .setLabel('Installed')
//         .toggle(),
//     ]);
//   } else {
//     message.addComponents([
//       new discord.Component()
//         .setId(discord.join('install', pack.manifest.id))
//         .setLabel('Install'),
//     ]);
//   }

//   return discord.Message.page({
//     index,
//     message,
//     type: 'popular',
//     next: index + 1 < popularPacks.length,
//     locale,
//   });
// }

const community = {
  query,
  publish,
  // popularPacks,
};

export default community;
