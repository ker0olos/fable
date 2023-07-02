import { gql, request } from './graphql.ts';

import config, { faunaUrl } from './config.ts';

import * as discord from './discord.ts';

import packs from './packs.ts';
import search from './search.ts';

import utils from './utils.ts';

import validate, { purgeReservedProps } from './validate.ts';

import type { Manifest, Pack, Schema } from './types.ts';

async function query(req: Request): Promise<Response> {
  const { error } = await utils.validateRequest(req, {
    GET: { headers: ['authorization'] },
  });

  if (error) {
    return utils.json(
      { error: error.message },
      { status: error.status },
    );
  }

  const auth = await fetch('https://discord.com/api/users/@me', {
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

  const query = gql`
    query ($userId: String!) {
      getPacksByUserId(userId: $userId) {
        owner
        version
        added
        updated
        servers
        approved
        manifest {
          id
          title
          description
          author
          image
          url
          webhookUrl
          maintainers
          media {
            conflicts
            new {
              id
              type
              title {
                english
                romaji
                native
                alternative
              }
              format
              description
              popularity
              images {
                url
                artist {
                  username
                  url
                }
              }
              externalLinks {
                url
                site
              }
              trailer {
                id
                site
              }
              relations {
                relation
                mediaId
              }
              characters {
                role
                characterId
              }
            }
          }
          characters {
            conflicts
            new {
              id
              name {
                english
                romaji
                native
                alternative
              }
              description
              popularity
              gender
              age
              images {
                url
                artist {
                  username
                  url
                }
              }
              externalLinks {
                url
                site
              }
              media {
                role
                mediaId
              }
            }
          }
        }
      }
    }
  `;

  const response = (await request<{
    getPacksByUserId: Pack[];
  }>({
    query,
    url: faunaUrl,
    headers: { 'authorization': `Bearer ${config.faunaSecret}` },
    variables: { userId },
  })).getPacksByUserId;

  return utils.json({
    data: response,
  });
}

async function publish(req: Request): Promise<Response> {
  const { error, body } = await utils.validateRequest(req, {
    POST: { body: ['manifest'], headers: ['authorization'] },
  });

  if (error) {
    return utils.json(
      { error: error.message },
      { status: error.status },
    );
  }

  const auth = await fetch('https://discord.com/api/users/@me', {
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

  const mutation = gql`
    mutation ($userId: String!, $manifest: ManifestInput!) {
      publishPack(userId: $userId, manifest: $manifest) {
        ok
        error
      }
    }
  `;

  const response = await request<{
    publishPack: Schema.Mutation;
  }>({
    url: faunaUrl,
    query: mutation,
    headers: {
      'authorization': `Bearer ${config.faunaSecret}`,
    },
    variables: {
      userId,
      manifest: purgeReservedProps(manifest),
    },
  });

  if (!response.publishPack.ok) {
    switch (response.publishPack.error) {
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

  return new Response(undefined, {
    status: 200,
    statusText: 'OK',
  });
}

async function getMostInstalledPacks(
  { guildId, index }: { guildId: string; index: number },
): Promise<discord.Message> {
  const query = gql`
    query {
      getMostInstalledPacks {
        servers
        approved
        manifest {
          id
          title
          description
          author
          image
          url
          maintainers
          media {
            new {
              id
            }
          }
          characters {
            new {
              id
              name {
                english
                romaji
                native
                alternative
              }
              description
              gender
              age
              images {
                url
              }
            }
          }
        }
      }
    }
  `;

  const response = (await request<{
    getMostInstalledPacks: Pack[];
  }>({
    query,
    url: faunaUrl,
    headers: { 'authorization': `Bearer ${config.faunaSecret}` },
  })).getMostInstalledPacks;

  const message = new discord.Message();

  const current = await packs.all({ guildId });

  const pages = utils.chunks(
    response
      // filter out private packs
      .filter(({ manifest }) => !manifest.private),
    1,
  );

  const pack = pages[index ?? 0][0];

  const embed = new discord.Embed()
    .setTitle(`${index + 1}.`)
    .setFooter({ text: pack.manifest.author })
    .setThumbnail({
      url: pack.manifest.image,
      default: false,
      proxy: false,
    }).setDescription(
      `**${pack.manifest.title ?? pack.manifest.id}**\nin ${
        utils.compact(pack.servers ?? 0)
      } servers\n\n${pack.manifest.description ?? ''}`,
    );

  message.addEmbed(embed);

  if (pack.manifest.characters?.new?.length) {
    pack.manifest.characters.new.slice(0, 2).forEach((character) => {
      message.addEmbed(search.characterEmbed(character, {
        mode: 'thumbnail',
        description: true,
        media: { title: false },
        rating: false,
        footer: true,
      }));
    });
  }

  if (current.some(({ ref }) => ref.manifest.id === pack.manifest.id)) {
    message.addComponents([
      new discord.Component()
        .setId('_installed')
        .setLabel('Installed')
        .toggle(),
    ]);
  } else {
    message.addComponents([
      new discord.Component()
        .setId(discord.join('install', pack.manifest.id))
        .setLabel('Install'),
    ]);
  }

  return discord.Message.page({
    index,
    message,
    type: 'gallery',
    next: index + 1 < pages.length,
  });
}

const community = {
  query,
  publish,
  getMostInstalledPacks,
};

export default community;
