import { serve } from 'https://deno.land/std@0.130.0/http/server.ts';

import {
  json,
  validateRequest,
  verifySignature,
} from 'https://raw.githubusercontent.com/ker0olos/bots/main/index.ts';

import {
  gql,
  GraphQLClient,
} from 'https://deno.land/x/graphql_request@v4.1.0/mod.ts';

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
    return await search({ _q: data.options[0].value });
  }

  return json({ error: 'bad request' }, { status: 400 });
}

async function search({ _q }: { _q: string }): Promise<Response> {
  const query = gql`
      query ($id: Int) { # Define which variables will be used in the query (id)
        Media (id: $id, type: ANIME) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
          id
          title {
            romaji
            english
            native
          }
        }
      }
  `;

  const variables = {
    id: 15125,
  };

  const data = await client.request(query, variables);

  return json(data);
}

serve(handler);
