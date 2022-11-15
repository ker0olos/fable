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
    message = { embeds: [] },
    data = { options: [] },
    member = { user: { id: '' } },
  } = JSON.parse(body);

  if (type === 1) {
    return json({
      type: 1,
    });
  }

  console.log(type, data, token, member);

  // slash command
  if (type === 2) {
    switch (data.name) {
      case 'search':
        return await search({ search: data.options[0].value });
      case 'test_next':
        return send_test_button();
      default:
        break;
    }
    // components (buttons)
  } else if (type === 3) {
    switch (data.custom_id) {
      case 'row_0_button_0':
        return edit_test_button();
      default:
        break;
    }
  }

  return json({ error: 'bad request' }, { status: 400 });
}

function send_test_button() {
  return json({
    type: 4,
    data: {
      content: `Unclicked`,
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 2,
              label: `Click`,
              custom_id: `row_0_button_0`,
            },
          ],
        },
      ],
    },
  });
}

function edit_test_button() {
  return json({
    type: 7,
    data: {
      content: `clicked`,
      components: [],
    },
  });
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
