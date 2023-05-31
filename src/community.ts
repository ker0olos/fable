import { gql, request } from './graphql.ts';

import utils from './utils.ts';

import config, { faunaUrl } from './config.ts';

import { Manifest, Schema } from './types.ts';

import validate, { purgeReservedProps } from './validate.ts';

import type { PathParams } from 'sift';

async function query(
  req: Request,
  _: unknown,
  params: PathParams,
): Promise<Response> {
  const { error } = await utils.validateRequest(req, {
    GET: {},
  });

  if (error) {
    return utils.json(
      { error: error.message },
      { status: error.status },
    );
  }

  const userId = params?.userId;

  if (typeof userId !== 'string') {
    return utils.json(
      { error: 'invalid user id' },
      { status: 400 },
    );
  }

  const query = gql`
    query ($userId: String!) {
      getPacksByUserId(userId: $userId) {
        owner
        version
        added
        updated
        manifest {
          id
          title
          description
          author
          image
          url
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
                nsfw
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
                nsfw
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
    getPacksByUserId: Schema.Pack[];
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
    POST: { body: ['accessToken', 'manifest'] },
  });

  if (error) {
    return utils.json(
      { error: error.message },
      { status: error.status },
    );
  }

  const { accessToken, manifest } = body as {
    accessToken: string;
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

  const auth = await fetch('https://discord.com/api/users/@me', {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${accessToken}`,
    },
  });

  if (!auth.ok) {
    return auth;
  }

  const { id: userId } = await auth.json();

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

const community = {
  query,
  publish,
};

export default community;
