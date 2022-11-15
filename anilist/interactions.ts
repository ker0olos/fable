import { serve } from 'https://deno.land/std@0.130.0/http/server.ts';

import {
  json,
  validateRequest,
  verifySignature,
} from 'https://raw.githubusercontent.com/ker0olos/bots/main/index.ts';

import {
  gql,
  GraphQLClient,
} from 'https://raw.githubusercontent.com/ker0olos/graphql-request/main/mod.ts';

const client = new GraphQLClient('https://graphql.anilist.co');

async function handler(request: Request): Promise<Response> {
  const { error } = await validateRequest(request, {
    POST: {
      headers: ['X-Signature-Ed25519', 'X-Signature-Timestamp'],
    },
  });

  if (error) {
    return json({ error: error.message }, { status: error.status });
  }

  const { valid, body } = await verifySignature(
    request,
    Deno.env.get('DISCORD_PUBLIC_KEY')!,
  );

  if (!valid) {
    return json(
      { error: 'Invalid request' },
      {
        status: 401,
      },
    );
  }

  const {
    type = 0,
    token = '',
    data = { options: [] },
    member = { user: { id: '' } },
  } = JSON.parse(body);

  if (type === 1) {
    return json({
      type: 1,
    });
  }

  console.log(type, data, token, member);

  if (type === 2 && data.name === 'search') {
    return await search({ search: data.options[0].value });
  }

  return json({ error: 'bad request' }, { status: 400 });
}

async function search({ search }: { search: string }): Promise<Response> {
  const query = gql`
    query ($page: Int, $search: String) {
      Page(page: $page, perPage: 1) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        media(search: $search) {
          type,
          coverImage {
            large
            medium
            color
          },
          title {
            romaji
            english
          }
        }
      }
    }
  `;

  const variables = {
    search,
  };

  const data = await client.request(query, variables);

  console.log(data);

  return json({
    type: 4,
    data: {
      content: `\`${JSON.stringify(data)}\``,
    },
  });
}

serve(handler);
