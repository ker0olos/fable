import { gql, request } from './graphql.ts';

import utils from './utils.ts';

import config, { faunaUrl } from './config.ts';

import { Manifest, Schema } from './types.ts';

import validate, { purgeReservedProps } from './validate.ts';

import type { ConnInfo, PathParams } from 'sift';

async function maintainer(
  req: Request,
  _: ConnInfo,
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

  if (!userId) {
    return utils.json(
      { error: 'Invalid User ID' },
      { status: 400 },
    );
  }

  // TODO implement

  return new Response();
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
  maintainer,
  publish,
};

export default community;
